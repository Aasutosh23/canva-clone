const Subscription = require("../models/subscription");
const axios = require("axios");

const PAYPAL_API =
  process.env.NODE_ENV === "production"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
const CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

async function getAccessToken() {
  const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");

  const response = await axios({
    method: "post",
    url: `${PAYPAL_API}/v1/oauth2/token`,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${auth}`,
    },
    data: "grant_type=client_credentials",
  });

  return response.data.access_token;
}

exports.createOrder = async (req, res) => {
  try {
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
            amount: {
              currency_code: "USD",
              value: "500",
            },
            description: "Canva Premium Membership",
          },
        ],
        application_context: {
          return_url: `${FRONTEND_URL}/subscription/success`,
          cancel_url: `${FRONTEND_URL}/subscription/cancel`,
        },
      },
    });

    const order = response.data;

    const approvalLink = order.links.find((link) => link.rel === "approve").href;

    res.status(200).json({
      success: true,
      data: {
        orderId: order.id,
        approvalLink,
      },
    });
  } catch (e) {
    console.error("Error creating paypal order:", e.response?.data || e.message);
    res.status(500).json({
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

    let captureData;
    try {
      const response = await axios({
        method: "post",
        url: `${PAYPAL_API}/v2/checkout/orders/${orderId}/capture`,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        data: {},
      });
      captureData = response.data;
    } catch (captureErr) {
      const errorDetails = captureErr.response?.data?.details;
      const isAlreadyCaptured =
        errorDetails?.some((d) => d.issue === "ORDER_ALREADY_CAPTURED") ||
        captureErr.response?.data?.name === "UNPROCESSABLE_ENTITY";

      if (isAlreadyCaptured) {
        let existingSubscription = await Subscription.findOne({ userId });
        if (existingSubscription?.isPremium) {
          return res.status(200).json({
            success: true,
            message: "Payment already captured",
            data: existingSubscription,
          });
        }
      }
      throw captureErr;
    }

    if (captureData && captureData.status === "COMPLETED") {
      let subscription = await Subscription.findOne({ userId });

      if (subscription) {
        subscription.isPremium = true;
        subscription.paymentId = captureData.id;
        subscription.premiumSince = new Date();
        subscription.updatedAt = new Date();
        await subscription.save();
      } else {
        subscription = new Subscription({
          userId,
          isPremium: true,
          paymentId: captureData.id,
          premiumSince: new Date(),
        });
        await subscription.save();
      }

      return res.status(200).json({
        success: true,
        message: "Payment captured successfully",
        data: subscription,
      });
    }

    return res.status(400).json({
      success: false,
      message: "Payment could not be completed",
      data: captureData,
    });
  } catch (e) {
    console.error("Error while capturing paypal order:", e.response?.data || e.message);
    res.status(500).json({
      success: false,
      message: "Error while capturing paypal order",
      error: e.response?.data || e.message,
    });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const subscription = await Subscription.findOne({ userId });

    return res.status(200).json({
      success: true,
      data: subscription,
    });
  } catch (e) {
    res.status(500).json({
      success: false,
      message: "Error while verifying paypal payment",
    });
  }
};
