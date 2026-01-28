const express = require('express');
const { authenticate } = require('../middleware/auth');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Create topic in chapter
router.post('/:chapterId', authenticate, async (req, res) => {
  try {
    const { name, description } = req.body;
    const { chapterId } = req.params;

    // Verify chapter belongs to user
    const chapter = await prisma.chapter.findFirst({
      where: { 
        id: chapterId,
        userId: req.user.id 
      }
    });

    if (!chapter) {
      return res.status(404).json({ error: 'Chapter not found' });
    }

    // Get max order
    const maxOrder = await prisma.topic.aggregate({
      where: { chapterId },
      _max: { order: true }
    });

    const topic = await prisma.topic.create({
      data: {
        name,
        description,
        order: (maxOrder._max.order || 0) + 1,
        chapterId,
      },
      include: {
        items: true
      }
    });

    res.status(201).json(topic);
  } catch (error) {
    console.error('Create topic error:', error);
    res.status(500).json({ error: 'Failed to create topic' });
  }
});

// Update topic
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { name, description, order } = req.body;

    // Verify topic belongs to user's chapter
    const topic = await prisma.topic.findFirst({
      where: { 
        id: req.params.id,
        chapter: { userId: req.user.id }
      }
    });

    if (!topic) {
      return res.status(404).json({ error: 'Topic not found' });
    }

    const updated = await prisma.topic.update({
      where: { id: req.params.id },
      data: { name, description, order },
      include: { items: true }
    });

    res.json(updated);
  } catch (error) {
    console.error('Update topic error:', error);
    res.status(500).json({ error: 'Failed to update topic' });
  }
});

// Delete topic
router.delete('/:id', authenticate, async (req, res) => {
  try {
    // Verify topic belongs to user's chapter
    const topic = await prisma.topic.findFirst({
      where: { 
        id: req.params.id,
        chapter: { userId: req.user.id }
      }
    });

    if (!topic) {
      return res.status(404).json({ error: 'Topic not found' });
    }

    await prisma.topic.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Topic deleted successfully' });
  } catch (error) {
    console.error('Delete topic error:', error);
    res.status(500).json({ error: 'Failed to delete topic' });
  }
});

module.exports = router;
