const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadMediaToCloudinary = async (file) => {
  const b64 = Buffer.from(file.buffer).toString("base64");
  const dataURI = `data:${file.mimetype};base64,${b64}`;

  const result = await cloudinary.uploader.upload(dataURI, {
    resource_type: "auto",
  });

  return result;
};

const deleteMediaFromCloudinary = async (cloudinaryId) => {
  const result = await cloudinary.uploader.destroy(cloudinaryId);
  return result;
};

module.exports = { uploadMediaToCloudinary, deleteMediaFromCloudinary };
