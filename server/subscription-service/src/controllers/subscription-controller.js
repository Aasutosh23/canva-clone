const Subscription = require("../models/subscription");

const getSubscription = async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    let subscription = await Subscription.findOne({ userId });

    if (!subscription) {
      return res.status(200).json({
        success: true,
        data: {
          userId,
          isPremium: false,
          paymentId: null,
          premiumSince: null,
        },
      });
    }

    return res.status(200).json({
      success: true,
      data: subscription,
    });
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch subscription",
    });
  }
};

module.exports = { getSubscription };
