'use strict';

const Story = require('../models/Story');
const coverService = require('../services/cover/coverService');

/**
 * @desc    Generate AI cover concept for story
 * @route   POST /api/v1/stories/:storyId/generate-cover
 * @access  Private
 */
const generateCover = async (req, res) => {
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
    console.error('Error generating cover concept:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to generate AI cover concept.'
    });
  }
};

/**
 * @desc    Get all cover concepts and active cover for a story
 * @route   GET /api/v1/stories/:storyId/covers
 * @access  Private
 */
const getCovers = async (req, res) => {
  try {
    const { storyId } = req.params;

    const story = await Story.findOne({ _id: storyId, owner: req.user._id });

    if (!story) {
      return res.status(404).json({
        success: false,
        message: 'Story not found or unauthorized.'
      });
    }

    const coversData = coverService.getCovers(story);

    res.status(200).json({
      success: true,
      data: {
        activeCover: coversData.activeCover,
        coverHistory: coversData.coverHistory,
        styles: coverService.getSupportedStyles()
      }
    });
  } catch (error) {
    console.error('Error fetching covers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cover concepts.'
    });
  }
};

/**
 * @desc    Select active cover for a story
 * @route   PATCH /api/v1/stories/:storyId/covers/:coverId/select
 * @access  Private
 */
const selectActiveCover = async (req, res) => {
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

    res.status(200).json({
      success: true,
      message: 'Active cover updated successfully.',
      data: {
        activeCover,
        story
      }
    });
  } catch (error) {
    console.error('Error selecting active cover:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to select active cover.'
    });
  }
};

module.exports = {
  generateCover,
  getCovers,
  selectActiveCover
};
