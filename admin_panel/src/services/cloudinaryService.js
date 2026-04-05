// src/services/cloudinaryService.js
// Utility to upload images to Cloudinary

const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/<your-cloud-name>/image/upload';
const UPLOAD_PRESET = '<your-upload-preset>';

export async function uploadImageToCloudinary(file) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);

  const response = await fetch(CLOUDINARY_URL, {
    method: 'POST',
    body: formData,
  });
  if (!response.ok) throw new Error('Image upload failed');
  return await response.json(); // returns { url, ... }
}
