const { uploadMediaToCloudinary, deleteMediaFromCloudinary } = require("../utils/cloudinary");
const Media = require("../models/media");

const uploadMedia = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No File Found!",
      });
    }

    const { originalname, mimetype, size, width, height } = req.file;
    const { userId } = req.user;

    const cloudinaryResult = await uploadMediaToCloudinary(req.file);
    const newlyCreatedMedia = new Media({
      userId,
      name: originalname,
      cloudinaryId: cloudinaryResult.public_id,
      url: cloudinaryResult.secure_url,
      mimeType: mimetype,
      size,
      width,
      height,
    });

    await newlyCreatedMedia.save();

    res.status(201).json({
      success: true,
      data: newlyCreatedMedia,
    });
  } catch (error) {
    console.error("Error creating asset:", error);

    res.status(500).json({
      success: false,
      message: error.message || "Error creating asset",
    });
  }
};

const getAllMediasByUser = async (req, res) => {
  try {
    const medias = await Media.find({ userId: req.user.userId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: medias,
    });
  } catch (e) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch assets",
    });
  }
};

const deleteMedia = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.user;

    const media = await Media.findOne({ _id: id, userId });

    if (!media) {
      return res.status(404).json({
        success: false,
        message: "Media not found or you don't have permission to delete it",
      });
    }

    // Delete from Cloudinary
    await deleteMediaFromCloudinary(media.cloudinaryId);

    // Delete from DB
    await Media.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Media deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting media:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete media",
    });
  }
};

module.exports = { uploadMedia, getAllMediasByUser, deleteMedia };
