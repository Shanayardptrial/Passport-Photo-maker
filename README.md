# Passport Photo Generator 📸

Professional passport-size photo generator with AI-powered background removal using Gemini API. Upload your photo, get a blue passport background with black border, and print 6 photos on an A4 sheet.

## ✨ Features

- 🤖 **AI Background Removal** - Powered by Google Gemini API
- 🎨 **Professional Passport Photos** - Standard 35mm × 45mm size
- 🔵 **Blue Background** - Automatic blue passport background application
- 🖼️ **Black Border** - 10px solid black border
- 📄 **A4 Sheet Layout** - 6 photos arranged horizontally (2 rows × 3 columns)
- 🖨️ **Print Ready** - Optimized for direct printing
- 📱 **Responsive Design** - Works on desktop and mobile
- 🎭 **Modern UI** - Beautiful glassmorphism design with smooth animations

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- Gemini API Key ([Get it here](https://makersuite.google.com/app/apikey))

### Local Development

1. **Clone or download this project**

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   PORT=3000
   ```

4. **Start the server**
   ```bash
   npm start
   ```

5. **Open your browser**
   
   Navigate to `http://localhost:3000`

## 🌐 Deploy to Render.com

### Step 1: Prepare Your Repository

1. Initialize git repository (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. Push to GitHub/GitLab:
   ```bash
   git remote add origin YOUR_REPOSITORY_URL
   git push -u origin main
   ```

### Step 2: Deploy on Render

1. Go to [Render.com](https://render.com) and sign up/login

2. Click **"New +"** → **"Web Service"**

3. Connect your repository

4. Configure the service:
   - **Name**: passport-photo-generator
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

5. Add Environment Variable:
   - **Key**: `GEMINI_API_KEY`
   - **Value**: Your Gemini API key

6. Click **"Create Web Service"**

7. Wait for deployment to complete

8. Your app will be live at: `https://passport-photo-generator.onrender.com`

## 📖 How to Use

1. **Upload Photo**
   - Click "Choose Photo" or drag & drop your image
   - Supported formats: JPG, PNG, WEBP (Max 10MB)

2. **Wait for Processing**
   - AI removes background automatically
   - Blue passport background is applied
   - 10px black border is added

3. **Preview Result**
   - View original and processed photo side by side
   - Check passport photo specifications

4. **Generate A4 Sheet**
   - Click "Generate A4 Sheet"
   - 6 photos will be arranged on A4 size paper

5. **Print**
   - Click "Print A4 Sheet"
   - Use your browser's print dialog
   - Photos will be exactly 35mm × 45mm when printed

## 🔧 Technical Specifications

### Passport Photo Dimensions
- **Size**: 35mm × 45mm (413px × 531px at 300 DPI)
- **Background**: Blue (#4A90E2)
- **Border**: 10px solid black
- **Format**: PNG with transparency support

### A4 Sheet Layout
- **Paper Size**: 210mm × 297mm
- **Photos per Sheet**: 6 (2 rows × 3 columns)
- **Spacing**: 15mm between photos
- **Margins**: 20mm on all sides

## 🛠️ Tech Stack

### Frontend
- HTML5
- CSS3 (Modern design with glassmorphism)
- Vanilla JavaScript

### Backend
- Node.js
- Express.js
- Gemini AI API
- Sharp (Image processing)
- Multer (File uploads)

## 📁 Project Structure

```
passport-photo-generator/
├── public/
│   ├── index.html      # Main HTML file
│   ├── style.css       # Styling with modern design
│   └── script.js       # Client-side JavaScript
├── server.js           # Express server with Gemini API
├── package.json        # Dependencies
├── render.yaml         # Render.com configuration
├── .env.example        # Environment variables template
├── .gitignore          # Git ignore rules
└── README.md           # This file
```

## 🔐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Your Google Gemini API key | Yes |
| `PORT` | Server port (default: 3000) | No |

## 🎨 Features in Detail

### AI Background Removal
Uses Google's Gemini 2.0 Flash model to intelligently remove backgrounds from photos while preserving the subject.

### Professional Passport Photos
Automatically resizes and formats photos to international passport photo standards with proper dimensions and blue background.

### Print Optimization
CSS print styles ensure accurate photo dimensions when printing, with proper margins and spacing for easy cutting.

### Responsive Design
Works seamlessly on desktop, tablet, and mobile devices with adaptive layouts.

## 🐛 Troubleshooting

### Image Processing Fails
- Ensure your Gemini API key is valid
- Check that the image file is under 10MB
- Verify the image format is supported (JPG, PNG, WEBP)

### Print Size Incorrect
- Ensure printer settings are set to "Actual Size" or "100%"
- Disable "Fit to Page" option
- Check that margins are set to minimum

### Server Won't Start
- Verify Node.js is installed (`node --version`)
- Check that all dependencies are installed (`npm install`)
- Ensure `.env` file exists with valid API key

## 📝 License

ISC

## 🤝 Support

For issues or questions:
1. Check the troubleshooting section
2. Verify your Gemini API key is valid
3. Ensure all dependencies are installed

## 🌟 Credits

- Powered by [Google Gemini AI](https://deepmind.google/technologies/gemini/)
- Built with modern web technologies
- Designed for professional passport photo generation

---

**Made with ❤️ for easy passport photo creation**
