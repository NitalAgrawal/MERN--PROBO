'use strict';

const { cloudinary } = require('../config/cloudinary');

/**
 * Helper to upload buffer to Cloudinary using stream.
 *
 * @param {Buffer} fileBuffer
 * @param {object} options
 * @returns {Promise<object>}
 */
const uploadStream = (fileBuffer, options) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
    stream.end(fileBuffer);
  });
};

/**
 * Upload an image buffer to Cloudinary.
 * Applies auto-compression and generates a thumbnail.
 *
 * @param {Buffer} fileBuffer
 * @returns {Promise<{ url: string, thumbnailUrl: string, publicId: string, width: number, height: number }>}
 */
const uploadImage = async (fileBuffer) => {
  const options = {
    folder: 'storynest/images',
    resource_type: 'image',
    transformation: [
      { quality: 'auto:good', fetch_format: 'auto' }
    ],
    eager: [
      { width: 400, crop: 'scale', quality: 'auto:good', fetch_format: 'auto' }
    ]
  };

  const result = await uploadStream(fileBuffer, options);

  const url = result.secure_url;
  const thumbnailUrl = result.eager?.[0]?.secure_url || url.replace('/upload/', '/upload/w_400,c_scale,q_auto:good/');

  return {
    url,
    thumbnailUrl,
    publicId: result.public_id,
    width: result.width,
    height: result.height
  };
};

/**
 * Upload a voice note audio buffer to Cloudinary.
 *
 * @param {Buffer} fileBuffer
 * @returns {Promise<{ url: string, publicId: string, duration: number }>}
 */
const uploadVoiceNote = async (fileBuffer) => {
  const options = {
    folder: 'storynest/voice',
    resource_type: 'video' // Cloudinary classifies audio as 'video' resource type
  };

  const result = await uploadStream(fileBuffer, options);

  return {
    url: result.secure_url,
    publicId: result.public_id,
    duration: result.duration ? Math.round(result.duration) : 0
  };
};

/**
 * Delete asset from Cloudinary using publicId.
 *
 * @param {string} publicId
 * @param {string} [resourceType='image'] - 'image' or 'video' (audio)
 * @returns {Promise<object>}
 */
const deleteAsset = async (publicId, resourceType = 'image') => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, { resource_type: resourceType }, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
  });
};

module.exports = {
  uploadImage,
  uploadVoiceNote,
  deleteAsset
};
