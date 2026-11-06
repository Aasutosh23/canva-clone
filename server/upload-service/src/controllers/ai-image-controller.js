const axios = require("axios");
const { uploadMediaToCloudinary } = require("../utils/cloudinary");
const Media = require("../models/media");

const STABILITY_API_KEY = process.env.STABILITY_API_KEY;
const STABILITY_ENGINE_ID = "stable-diffusion-xl-1024-v1-0";
const STABILITY_API_HOST = "https://api.stability.ai";

const FREE_AI_LIMIT = 5;
const PREMIUM_AI_LIMIT = 50;

const generateImageFromAIAndUploadToDB = async (req, res) => {
  const prompt = req.body.prompt;
  const userId = req.user.userId;
  // isPremium is forwarded from the API gateway via header (set by auth middleware)
  const isPremium = req.headers["x-user-premium"] === "true";

  console.log(`[AI Controller] Request received — userId: ${userId}, prompt: "${prompt}", isPremium: ${isPremium}`);
  console.log(`[AI Controller] STABILITY_API_KEY set: ${!!STABILITY_API_KEY}`);

  try {
    // Count how many AI images this user has already generated
    const aiImageCount = await Media.countDocuments({ userId, isAiGenerated: true });
    const limit = isPremium ? PREMIUM_AI_LIMIT : FREE_AI_LIMIT;

    console.log(`[AI Controller] User has generated ${aiImageCount}/${limit} AI images`);

    if (aiImageCount >= limit) {
      return res.status(403).json({
        success: false,
        message: isPremium
          ? `You have reached the premium limit of ${PREMIUM_AI_LIMIT} AI-generated images.`
          : `You have used all ${FREE_AI_LIMIT} free AI image generations. Upgrade to Premium for up to ${PREMIUM_AI_LIMIT} images!`,
        limitReached: true,
        aiImageCount,
        limit,
      });
    }

    const response = await axios.post(
      `${STABILITY_API_HOST}/v1/generation/${STABILITY_ENGINE_ID}/text-to-image`,
      {
        text_prompts: [
          {
            text: prompt,
          },
        ],
        height: 1024,
        width: 1024,
        steps: 30,
        sample: 1,
        cfg_scale: 7,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${STABILITY_API_KEY}`,
        },
      }
    );

    console.log(
      `[AI Controller] Stability AI responded. Artifacts count: ${response.data?.artifacts?.length}`
    );
    const generatedImage = response.data.artifacts[0];

    if (!generatedImage) {
      throw new Error("No image generated found stability AI");
    }

    const imageBuffer = Buffer.from(generatedImage.base64, "base64");

    const file = {
      buffer: imageBuffer,
      originalName: `ai-generated-${Date.now()}.png`,
      mimetype: "image/png",
      size: imageBuffer.length,
      width: 1024,
      height: 1024,
    };

    const cloudinaryResult = await uploadMediaToCloudinary(file);

    const newlyCreatedMedia = new Media({
      userId,
      name: `AI Generated ${prompt.substring(0, 50)}${prompt.length > 50 ? "..." : ""}`,
      cloudinaryId: cloudinaryResult.public_id,
      url: cloudinaryResult.secure_url,
      mimeType: "image/png",
      size: imageBuffer.length,
      width: 1024,
      height: 1024,
      isAiGenerated: true,
    });

    await newlyCreatedMedia.save();

    return res.status(201).json({
      success: true,
      data: newlyCreatedMedia,
      prompt,
      seed: generatedImage.seed,
      message: "AI image generated and uploaded to DB successfully",
      aiImageCount: aiImageCount + 1,
      limit,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Fetch from AI and upload from DB failed! Please try again",
    });
  }
};

module.exports = { generateImageFromAIAndUploadToDB };
