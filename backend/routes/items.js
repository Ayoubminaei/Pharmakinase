const express = require('express');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const { authenticate } = require('../middleware/auth');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure multer storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'pharmastudy/items',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [{ width: 800, height: 800, crop: 'limit' }],
  },
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Create item
router.post('/:topicId', authenticate, async (req, res) => {
  try {
    const { 
      name, 
      scientificName, 
      type, 
      description, 
      imageUrl,
      properties,
      flashcardFront,
      flashcardBack 
    } = req.body;
    const { topicId } = req.params;

    // Verify topic belongs to user's chapter
    const topic = await prisma.topic.findFirst({
      where: { 
        id: topicId,
        chapter: { userId: req.user.id }
      }
    });

    if (!topic) {
      return res.status(404).json({ error: 'Topic not found' });
    }

    // Create item with properties and flashcard
    const item = await prisma.item.create({
      data: {
        name,
        scientificName,
        type,
        description,
        imageUrl,
        topicId,
        properties: {
          create: properties || []
        },
        flashcard: flashcardFront && flashcardBack ? {
          create: {
            front: flashcardFront,
            back: flashcardBack,
          }
        } : undefined
      },
      include: {
        properties: true,
        flashcard: true,
      }
    });

    res.status(201).json(item);
  } catch (error) {
    console.error('Create item error:', error);
    res.status(500).json({ error: 'Failed to create item' });
  }
});

// Upload image
router.post('/upload', authenticate, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    res.json({ 
      imageUrl: req.file.path,
      publicId: req.file.filename 
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// Update item
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { 
      name, 
      scientificName, 
      type, 
      description, 
      imageUrl,
      properties 
    } = req.body;

    // Verify item belongs to user's chapter
    const item = await prisma.item.findFirst({
      where: { 
        id: req.params.id,
        topic: { chapter: { userId: req.user.id } }
      }
    });

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    // Delete old properties and create new ones
    await prisma.property.deleteMany({
      where: { itemId: req.params.id }
    });

    const updated = await prisma.item.update({
      where: { id: req.params.id },
      data: {
        name,
        scientificName,
        type,
        description,
        imageUrl,
        properties: {
          create: properties || []
        }
      },
      include: {
        properties: true,
        flashcard: true,
      }
    });

    res.json(updated);
  } catch (error) {
    console.error('Update item error:', error);
    res.status(500).json({ error: 'Failed to update item' });
  }
});

// Delete item
router.delete('/:id', authenticate, async (req, res) => {
  try {
    // Verify item belongs to user's chapter
    const item = await prisma.item.findFirst({
      where: { 
        id: req.params.id,
        topic: { chapter: { userId: req.user.id } } }
    });

    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    // Delete image from Cloudinary if exists
    if (item.imageUrl) {
      try {
        const publicId = item.imageUrl.split('/').pop()?.split('.')[0];
        if (publicId) {
          await cloudinary.uploader.destroy(`pharmastudy/items/${publicId}`);
        }
      } catch (cloudError) {
        console.error('Cloudinary delete error:', cloudError);
      }
    }

    await prisma.item.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Delete item error:', error);
    res.status(500).json({ error: 'Failed to delete item' });
  }
});

module.exports = router;
