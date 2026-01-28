const express = require('express');
const { authenticate } = require('../middleware/auth');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Get all chapters for current user
router.get('/', authenticate, async (req, res) => {
  try {
    const chapters = await prisma.chapter.findMany({
      where: { userId: req.user.id },
      include: {
        topics: {
          include: {
            items: {
              include: {
                properties: true,
                flashcard: true,
              }
            }
          }
        }
      },
      orderBy: { order: 'asc' }
    });

    res.json(chapters);
  } catch (error) {
    console.error('Get chapters error:', error);
    res.status(500).json({ error: 'Failed to fetch chapters' });
  }
});

// Create chapter
router.post('/', authenticate, async (req, res) => {
  try {
    const { name, description, color } = req.body;

    // Get max order
    const maxOrder = await prisma.chapter.aggregate({
      where: { userId: req.user.id },
      _max: { order: true }
    });

    const chapter = await prisma.chapter.create({
      data: {
        name,
        description,
        color,
        order: (maxOrder._max.order || 0) + 1,
        userId: req.user.id,
      },
      include: {
        topics: true
      }
    });

    res.status(201).json(chapter);
  } catch (error) {
    console.error('Create chapter error:', error);
    res.status(500).json({ error: 'Failed to create chapter' });
  }
});

// Update chapter
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { name, description, color, order } = req.body;

    const chapter = await prisma.chapter.updateMany({
      where: { 
        id: req.params.id,
        userId: req.user.id 
      },
      data: { name, description, color, order }
    });

    if (chapter.count === 0) {
      return res.status(404).json({ error: 'Chapter not found' });
    }

    const updated = await prisma.chapter.findUnique({
      where: { id: req.params.id },
      include: { topics: true }
    });

    res.json(updated);
  } catch (error) {
    console.error('Update chapter error:', error);
    res.status(500).json({ error: 'Failed to update chapter' });
  }
});

// Delete chapter
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const chapter = await prisma.chapter.deleteMany({
      where: { 
        id: req.params.id,
        userId: req.user.id 
      }
    });

    if (chapter.count === 0) {
      return res.status(404).json({ error: 'Chapter not found' });
    }

    res.json({ message: 'Chapter deleted successfully' });
  } catch (error) {
    console.error('Delete chapter error:', error);
    res.status(500).json({ error: 'Failed to delete chapter' });
  }
});

module.exports = router;
