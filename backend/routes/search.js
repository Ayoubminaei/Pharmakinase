const express = require('express');
const { authenticate } = require('../middleware/auth');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Search items
router.get('/', authenticate, async (req, res) => {
  try {
    const { q, type } = req.query;

    if (!q) {
      return res.json({ items: [], chapters: [], topics: [] });
    }

    const searchQuery = q.toString().toLowerCase();

    // Search items
    const items = await prisma.item.findMany({
      where: {
        topic: {
          chapter: {
            userId: req.user.id
          }
        },
        AND: [
          type ? { type: type.toString().toLowerCase() } : {},
          {
            OR: [
              { name: { contains: searchQuery, mode: 'insensitive' } },
              { scientificName: { contains: searchQuery, mode: 'insensitive' } },
              { description: { contains: searchQuery, mode: 'insensitive' } },
              {
                properties: {
                  some: {
                    OR: [
                      { key: { contains: searchQuery, mode: 'insensitive' } },
                      { value: { contains: searchQuery, mode: 'insensitive' } },
                    ]
                  }
                }
              }
            ]
          }
        ]
      },
      include: {
        properties: true,
        topic: {
          include: {
            chapter: true
          }
        },
        flashcard: true,
      },
      take: 50
    });

    // Search chapters
    const chapters = await prisma.chapter.findMany({
      where: {
        userId: req.user.id,
        OR: [
          { name: { contains: searchQuery, mode: 'insensitive' } },
          { description: { contains: searchQuery, mode: 'insensitive' } },
        ]
      },
      take: 10
    });

    // Search topics
    const topics = await prisma.topic.findMany({
      where: {
        chapter: { userId: req.user.id },
        OR: [
          { name: { contains: searchQuery, mode: 'insensitive' } },
          { description: { contains: searchQuery, mode: 'insensitive' } },
        ]
      },
      include: {
        chapter: true
      },
      take: 10
    });

    res.json({ items, chapters, topics });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Failed to search' });
  }
});

module.exports = router;
