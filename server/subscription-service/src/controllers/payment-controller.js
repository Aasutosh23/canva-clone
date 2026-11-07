const Subscription = require("../models/subscription");
const axios = require("axios");

// Sandbox by default. Only goes live if PAYPAL_MODE=live is set explicitly.
const PAYPAL_API =
  process.env.PAYPAL_MODE === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

const CLIENT_ID = (process.env.PAYPAL_CLIENT_ID || "").trim();
const CLIENT_SECRET = (process.env.PAYPAL_CLIENT_SECRET || "").trim();
const FRONTEND_URL = (process.env.FRONTEND_URL || "http://localhost:3000").replace(/\/+$/, "");
const PREMIUM_PRICE = process.env.PREMIUM_PRICE || "5.00";
const CURRENCY = "USD";

async function getAccessToken() {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error("PayPal credentials are missing in environment variables");
  }

  const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");

  const response = await axios({
    method: "post",
    url: `${PAYPAL_API}/v1/oauth2/token`,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${auth}`,
    },
    data: new URLSearchParams({ grant_type: "client_credentials" }).toString(),
    timeout: 30000,
  });

  return response.data.access_token;
}

async function getOrder(orderId, headers) {
  const response = await axios({
    method: "get",
    url: `${PAYPAL_API}/v2/checkout/orders/${orderId}`,
    headers,
    timeout: 30000,
  });
  return response.data;
}

exports.createOrder = async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // Don't let an already-premium user pay twice
    const existing = await Subscription.findOne({ userId });
    if (existing?.isPremium) {
      return res.status(400).json({
        success: false,
        message: "You are already a premium member",
      });
    }

    const accessToken = await getAccessToken();

    const response = await axios({
      method: "post",
      url: `${PAYPAL_API}/v2/checkout/orders`,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      data: {
        intent: "CAPTURE",
        purchase_units: [
          {
            // Ties this order to the user, verified again at capture time
            custom_id: String(userId),
            amount: {
              currency_code: CURRENCY,
              value: PREMIUM_PRICE,
            },
            description: "Canva Premium Membership",
          },
        ],
        application_context: {
          brand_name: "Canva Clone",
          user_action: "PAY_NOW",
          return_url: `${FRONTEND_URL}/subscription/success`,
          cancel_url: `${FRONTEND_URL}/subscription/cancel`,
        },
      },
      timeout: 30000,
    });

    const order = response.data;

    const approvalLink = order.links?.find(
      (link) => link.rel === "approve" || link.rel === "payer-action"
    )?.href;

    if (!approvalLink) {
      throw new Error("PayPal did not return an approval link");
    }

    return res.status(200).json({
      success: true,
      data: {
        orderId: order.id,
        approvalLink,
      },
    });
  } catch (e) {
    console.error("Error creating paypal order:", e.response?.data || e.message);
    return res.status(500).json({
      success: false,
      message: "Error while creating paypal order",
    });
  }
};

exports.capturePayment = async (req, res) => {
  try {
    const { orderId } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required",
      });
    }

    const accessToken = await getAccessToken();
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    };

    // 1. Fetch the order and verify it belongs to this user
    let order = await getOrder(orderId, headers);
    const unit = order.purchase_units?.[0];

    if (unit?.custom_id !== String(userId)) {
      return res.status(403).json({
        success: false,
        message: "Order does not belong to this user",
      });
    }

    // 2. Verify the amount matches what we charge
    if (unit?.amount?.value !== PREMIUM_PRICE || unit?.amount?.currency_code !== CURRENCY) {
      return res.status(400).json({
        success: false,
        message: "Order amount mismatch",
      });
    }

    // 3. Capture only if the buyer has approved and it isn't captured yet
    if (order.status === "APPROVED") {
      try {
        const response = await axios({
          method: "post",
          url: `${PAYPAL_API}/v2/checkout/orders/${orderId}/capture`,
          headers,
          data: {},
          timeout: 30000,
        });
        order = response.data;
      } catch (captureErr) {
        const details = captureErr.response?.data?.details;
        const alreadyCaptured = details?.some((d) => d.issue === "ORDER_ALREADY_CAPTURED");

        if (!alreadyCaptured) {
          throw captureErr;
        }

        // Captured by a parallel request, re-fetch the final state
        order = await getOrder(orderId, headers);
      }
    }

    if (order.status !== "COMPLETED") {
      return res.status(400).json({
        success: false,
        message: "Payment could not be completed",
        data: { status: order.status },
      });
    }

    const captureId = order.purchase_units?.[0]?.payments?.captures?.[0]?.id || order.id;

    // 4. Activate premium (upsert avoids duplicate documents on races)
    const subscription = await Subscription.findOneAndUpdate(
      { userId },
      {
        $set: {
          isPremium: true,
          paymentId: captureId,
          premiumSince: new Date(),
          updatedAt: new Date(),
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json({
      success: true,
      message: "Payment captured successfully",
      data: subscription,
    });
  } catch (e) {
    console.error("Error while capturing paypal order:", e.response?.data || e.message);
    // Don't leak PayPal's raw error body to the client
    return res.status(500).json({
      success: false,
      message: "Error while capturing paypal order",
    });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const subscription = await Subscription.findOne({ userId });
    return res.status(200).json({
      success: true,
      data: subscription || {
        userId,
        isPremium: false,
        paymentId: null,
        premiumSince: null,
      },
    });
  } catch (e) {
    console.error("Error while verifying payment:", e.message);
    return res.status(500).json({
      success: false,
      message: "Error while verifying paypal payment",
    });
  }
};
