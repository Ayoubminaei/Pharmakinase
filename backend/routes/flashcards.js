const express = require('express');
const { authenticate } = require('../middleware/auth');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Get all flashcards for user
router.get('/', authenticate, async (req, res) => {
  try {
    const flashcards = await prisma.flashcard.findMany({
      where: {
        item: {
          topic: {
            chapter: {
              userId: req.user.id
            }
          }
        }
      },
      include: {
        item: {
          include: {
            properties: true,
            topic: {
              include: {
                chapter: true
              }
            }
          }
        }
      }
    });

    res.json(flashcards);
  } catch (error) {
    console.error('Get flashcards error:', error);
    res.status(500).json({ error: 'Failed to fetch flashcards' });
  }
});

// Create flashcard
router.post('/', authenticate, async (req, res) => {
  try {
    const { itemId, front, back } = req.body;

    // Verify item belongs to user
    const item = await prisma.item.findFirst({
      where: {
        id: itemId,
        topic: { chapter: { userId: req.user.id } }
      }
    });

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    const flashcard = await prisma.flashcard.create({
      data: {
        itemId,
        front,
        back,
      }
    });

    res.status(201).json(flashcard);
  } catch (error) {
    console.error('Create flashcard error:', error);
    res.status(500).json({ error: 'Failed to create flashcard' });
  }
});

// Update flashcard
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { front, back } = req.body;

    const flashcard = await prisma.flashcard.findFirst({
      where: {
        id: req.params.id,
        item: { topic: { chapter: { userId: req.user.id } } }
      }
    });

    if (!flashcard) {
      return res.status(404).json({ error: 'Flashcard not found' });
    }

    const updated = await prisma.flashcard.update({
      where: { id: req.params.id },
      data: { front, back }
    });

    res.json(updated);
  } catch (error) {
    console.error('Update flashcard error:', error);
    res.status(500).json({ error: 'Failed to update flashcard' });
  }
});

// Delete flashcard
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const flashcard = await prisma.flashcard.findFirst({
      where: {
        id: req.params.id,
        item: { topic: { chapter: { userId: req.user.id } } }
      }
    });

    if (!flashcard) {
      return res.status(404).json({ error: 'Flashcard not found' });
    }

    await prisma.flashcard.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Flashcard deleted successfully' });
  } catch (error) {
    console.error('Delete flashcard error:', error);
    res.status(500).json({ error: 'Failed to delete flashcard' });
  }
});

module.exports = router;
