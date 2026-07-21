import api from './api';

/**
 * Story API Service methods.
 * Every response returns the standardized payload: { success, message, data: { story } } or { stories }
 */

export const createStory = async (storyData) => {
  const response = await api.post('/stories', storyData);
  return response.data;
};

export const getStories = async () => {
  const response = await api.get('/stories');
  return response.data;
};

export const getStory = async (storyId) => {
  const response = await api.get(`/stories/${storyId}`);
  return response.data;
};

export const updateStory = async (storyId, storyData) => {
  const response = await api.patch(`/stories/${storyId}`, storyData);
  return response.data;
};

export const deleteStory = async (storyId) => {
  const response = await api.delete(`/stories/${storyId}`);
  return response.data;
};

/**
 * Trigger a book export for a given format.
 * Returns immediately if a cached export exists (bookHash match).
 * @param {string} storyId
 * @param {'pdf'|'epub'|'html'} format
 */
export const exportBook = async (storyId, format) => {
  const response = await api.post(`/stories/${storyId}/export`, { format });
  return response.data;
};

/**
 * Fetch the export history for a story (newest-first array).
 * @param {string} storyId
 */
export const getExportHistory = async (storyId) => {
  const response = await api.get(`/stories/${storyId}/exports`);
  return response.data;
};
