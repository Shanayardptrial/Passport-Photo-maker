require('dotenv').config();
const express = require('express');
const multer = require('multer');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const sharp = require('sharp');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;
const { removeBackgroundWithCarve } = require('./carve_automation');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static('public'));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!require('fs').existsSync(uploadsDir)) {
  require('fs').mkdirSync(uploadsDir);
}

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (jpeg, jpg, png, webp)'));
    }
  }
});

// Fallback function without background removal
async function processWithoutBgRemoval(buffer, res, passportWidth, passportHeight, borderWidth) {
  const processedImage = await sharp(buffer)
    .resize(passportWidth, passportHeight, {
      fit: 'cover',
      position: 'center',
      background: { r: 74, g: 144, b: 226, alpha: 1 }
    })
    .flatten({ background: { r: 74, g: 144, b: 226 } })
    .png()
    .toBuffer();

  const finalImage = await sharp(processedImage)
    .extend({
      top: borderWidth,
      bottom: borderWidth,
      left: borderWidth,
      right: borderWidth,
      background: { r: 0, g: 0, b: 0, alpha: 1 }
    })
    .png()
    .toBuffer();

  const finalBase64 = finalImage.toString('base64');

  res.json({
    success: true,
    image: `data:image/png;base64,${finalBase64}`,
    message: 'Passport photo created (background removal unavailable)'
  });
}

// API endpoint to process image and create passport photo
app.post('/api/remove-background', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    console.log('Processing image:', req.file.originalname);

    const passportWidth = 413; // 35mm at 300 DPI
    const passportHeight = 531; // 45mm at 300 DPI
    const borderWidth = 10;

    // Save uploaded file temporarily
    const tempInputPath = path.join(uploadsDir, `temp_${Date.now()}_input.png`);
    const tempOutputPath = path.join(uploadsDir, `temp_${Date.now()}_output.png`);

    await fs.writeFile(tempInputPath, req.file.buffer);

    // Use carve.photos automation to remove background
    console.log('🎨 Removing background with carve.photos automation...');
    const success = await removeBackgroundWithCarve(tempInputPath, tempOutputPath);

    // Clean up input file
    await fs.unlink(tempInputPath).catch(() => { });

    if (!success) {
      console.error('Carve automation failed');
      console.log('Falling back to processing without background removal');
      // Fallback: process without background removal
      await processWithoutBgRemoval(req.file.buffer, res, passportWidth, passportHeight, borderWidth);
      return;
    }

    // Read the background-removed image
    const bgRemovedBuffer = await fs.readFile(tempOutputPath);

    // Clean up output file
    await fs.unlink(tempOutputPath).catch(() => { });

    // Resize to passport size
    const resizedImage = await sharp(bgRemovedBuffer)
      .resize(passportWidth, passportHeight, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 } // Transparent
      })
      .png()
      .toBuffer();

    // Add blue background
    const withBackground = await sharp({
      create: {
        width: passportWidth,
        height: passportHeight,
        channels: 4,
        background: { r: 74, g: 144, b: 226, alpha: 1 } // #4A90E2
      }
    })
      .composite([{ input: resizedImage, gravity: 'center' }])
      .png()
      .toBuffer();

    // Add black border
    const finalImage = await sharp(withBackground)
      .extend({
        top: borderWidth,
        bottom: borderWidth,
        left: borderWidth,
        right: borderWidth,
        background: { r: 0, g: 0, b: 0, alpha: 1 }
      })
      .png()
      .toBuffer();

    const finalBase64 = finalImage.toString('base64');

    console.log('✅ Image processed successfully with AI background removal');
    res.json({
      success: true,
      image: `data:image/png;base64,${finalBase64}`,
      message: 'Passport photo created with AI background removal'
    });

  } catch (error) {
    console.error('Error processing image:', error);
    res.status(500).json({
      error: 'Failed to process image',
      details: error.message
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Serve index.html for root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📸 Passport Photo Generator with AI Background Removal is ready!`);
  console.log(`🎨 Using carve.photos automation for background removal`);
});
