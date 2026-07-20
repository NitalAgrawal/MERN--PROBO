import api from './api';

/**
 * Upload an image for a memory card.
 *
 * @param {File} file
 * @param {string} memoryId
 * @param {string} [caption]
 * @returns {Promise<object>}
 */
export const uploadImage = async (file, memoryId, caption = '') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('memoryId', memoryId);
  if (caption) {
    formData.append('caption', caption);
  }

  const response = await api.post('/uploads/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

/**
 * Upload a voice note recording for a memory card.
 *
 * @param {File|Blob} file
 * @param {string} memoryId
 * @returns {Promise<object>}
 */
export const uploadVoiceNote = async (file, memoryId) => {
  const formData = new FormData();
  // Ensure the uploaded audio file has a correct filename/extension
  const fileToUpload = file instanceof Blob && !(file instanceof File)
    ? new File([file], 'recording.webm', { type: file.type || 'audio/webm' })
    : file;

  formData.append('file', fileToUpload);
  formData.append('memoryId', memoryId);

  const response = await api.post('/uploads/voice', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

/**
 * Delete a photo by photoId under a specific memory.
 *
 * @param {string} memoryId
 * @param {string} photoId
 * @returns {Promise<object>}
 */
export const deletePhoto = async (memoryId, photoId) => {
  const response = await api.delete('/uploads/photo', {
    data: { memoryId, photoId }
  });
  return response.data;
};

/**
 * Delete a voice note by voiceId under a specific memory.
 *
 * @param {string} memoryId
 * @param {string} voiceId
 * @returns {Promise<object>}
 */
export const deleteVoiceNote = async (memoryId, voiceId) => {
  const response = await api.delete('/uploads/voice', {
    data: { memoryId, voiceId }
  });
  return response.data;
};
