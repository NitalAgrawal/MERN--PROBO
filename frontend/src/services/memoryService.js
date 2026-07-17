import api from './api';

/**
 * Memory API Service methods.
 * Every response returns the standardized payload: { success, message, data: { memory } } or { memories }
 */

export const createMemory = async (storyId, memoryData) => {
  const response = await api.post(`/stories/${storyId}/memories`, memoryData);
  return response.data;
};

export const getMemories = async (storyId) => {
  const response = await api.get(`/stories/${storyId}/memories`);
  return response.data;
};

export const updateMemory = async (memoryId, memoryData) => {
  const response = await api.patch(`/memories/${memoryId}`, memoryData);
  return response.data;
};

export const deleteMemory = async (memoryId) => {
  const response = await api.delete(`/memories/${memoryId}`);
  return response.data;
};

export const bulkReorderMemories = async (storyId, reorders) => {
  const response = await api.patch(`/stories/${storyId}/memories/reorder`, { reorders });
  return response.data;
};
