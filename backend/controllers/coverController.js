'use strict';

const Story = require('../models/Story');
const coverService = require('../services/cover/coverService');

/**
 * @desc    Generate AI cover concept for story
 * @route   POST /api/v1/stories/:storyId/generate-cover
 * @access  Private
 */
const Story = require('../models/Story');
const coverService = require('../services/cover/coverService');
const logger = require('../services/logger/logger');
const cacheService = require('../services/cache/cacheService');
const metricsService = require('../services/metrics/metricsService');

/**
 * @desc    Generate AI cover concept for story
 * @route   POST /api/v1/stories/:storyId/generate-cover
 * @access  Private
 */
const generateCover = async (req, res, next) => {
  const startTime = Date.now();
  try {
    const { storyId } = req.params;
    const { style, provider, customInstructions, forceRefresh } = req.body;

    const story = await Story.findOne({ _id: storyId, owner: req.user._id });

    if (!story) {
      return res.status(404).json({
        success: false,
        message: 'Story not found or unauthorized.'
      });
    }

    const { cover, cached } = await coverService.generateCover(story, {
      style,
      provider,
      customInstructions,
      forceRefresh
    });

    const duration = Date.now() - startTime;
    metricsService.recordAIGeneration(duration);
    logger.logAI('info', 'AI cover concept generated', { storyId, style, provider, duration, cached });

    await cacheService.del(`cover_meta_${storyId}`);

    res.status(201).json({
      success: true,
      message: cached ? 'Reused cached cover generation concept.' : 'AI cover concept generated successfully.',
      data: {
        cover,
        cached,
        activeCover: story.activeCover,
        coverHistory: story.coverHistory
      }
    });
  } catch (error) {
    logger.error({ err: error.message, storyId: req.params.storyId }, 'Error generating cover concept');
    next(error);
  }
};

/**
 * @desc    Get all cover concepts and active cover for a story
 * @route   GET /api/v1/stories/:storyId/covers
 * @access  Private
 */
const getCovers = async (req, res, next) => {
  try {
    const { storyId } = req.params;

    const cacheKey = `cover_meta_${storyId}`;
    const cachedData = await cacheService.get(cacheKey);
    if (cachedData) {
      return res.status(200).json({
        success: true,
        data: cachedData
      });
    }

    const story = await Story.findOne({ _id: storyId, owner: req.user._id });

    if (!story) {
      return res.status(404).json({
        success: false,
        message: 'Story not found or unauthorized.'
      });
    }

    const coversData = coverService.getCovers(story);
    const responseData = {
      activeCover: coversData.activeCover,
      coverHistory: coversData.coverHistory,
      styles: coverService.getSupportedStyles()
    };

    await cacheService.set(cacheKey, responseData, 300);

    res.status(200).json({
      success: true,
      data: responseData
    });
  } catch (error) {
    logger.error({ err: error.message, storyId: req.params.storyId }, 'Error fetching covers');
    next(error);
  }
};

/**
 * @desc    Select active cover for a story
 * @route   PATCH /api/v1/stories/:storyId/covers/:coverId/select
 * @access  Private
 */
const selectActiveCover = async (req, res, next) => {
  try {
    const { storyId, coverId } = req.params;

    const story = await Story.findOne({ _id: storyId, owner: req.user._id });

    if (!story) {
      return res.status(404).json({
        success: false,
        message: 'Story not found or unauthorized.'
      });
    }

    const activeCover = await coverService.selectActiveCover(story, coverId);
    await cacheService.del(`cover_meta_${storyId}`);

    res.status(200).json({
      success: true,
      message: 'Active cover updated successfully.',
      data: {
        activeCover,
        story
      }
    });
  } catch (error) {
    logger.error({ err: error.message, storyId: req.params.storyId }, 'Error selecting active cover');
    next(error);
  }
};


module.exports = {
  generateCover,
  getCovers,
  selectActiveCover
};
