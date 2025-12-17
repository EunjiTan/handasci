# Hand-controlled-ASCII
# 🎥 Hand-Controlled ASCII Video Converter

Transform your webcam feed into real-time ASCII art using hand gestures! This interactive web application uses MediaPipe for computer vision and converts live video to ASCII characters, all controlled by your hand movements.

![ASCII Video Demo](https://img.shields.io/badge/Status-Live-success)
![License](https://img.shields.io/badge/License-MIT-blue)
![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?logo=vite)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)

## ✨ Features

- **Real-time ASCII Conversion** - Watch your webcam feed transform into ASCII art instantly
- **Hand Gesture Controls** - No buttons needed! Control everything with hand gestures
  - ✋ **Spread fingers** - Increase resolution for sharper detail
  - 🤏 **Pinch fingers** - Decrease resolution for blockier, retro aesthetic
  - ✊ **Make a fist** - Toggle between ASCII and ANSI color modes
- **Full-Screen Display** - Immersive ASCII art experience
- **Smooth Performance** - Optimized rendering with requestAnimationFrame
- **Responsive UI** - Clean, minimalist interface with slide-out controls

## 🚀 Demo

[Live Demo on Vercel](https://handasci.vercel.app) 

## 🛠️ Tech Stack

- **React 18** - UI framework
- **Vite** - Fast build tool and dev server
- **MediaPipe Hands** - Google's machine learning solution for hand tracking
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icon library

## 📦 Installation
```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/handasci.git

# Navigate to project directory
cd handasci

# Install dependencies
npm install

# Start development server
npm run dev
```

## 🏗️ Build for Production
```bash
# Create production build
npm run build

# Preview production build
npm run preview
```

## 🎮 How to Use

1. **Grant Camera Permission** - Allow browser access to your webcam
2. **Click START** - Begin the ASCII video conversion
3. **Use Hand Gestures**:
   - Show your hand to the camera
   - Spread fingers wide for higher resolution
   - Pinch fingers together for lower resolution
   - Make a fist to switch between ASCII/ANSI modes
4. **Click the Gear Icon** - Access manual controls and settings

## 🎨 ASCII vs ANSI Mode

- **ASCII Mode** - Pure monochrome text characters
- **ANSI Mode** - Enhanced with terminal color codes (green tint)

## 📱 Browser Compatibility

- ✅ Chrome/Edge (Recommended)
- ✅ Firefox
- ✅ Safari
- ⚠️ Requires HTTPS for camera access (localhost works)

## 🔧 Configuration

Adjust these parameters in `src/App.jsx`:
```javascript
const ASCII_CHARS = ' .:-=+*#%@';  // Character gradient
const resolution = 80;              // Default resolution (40-120)
```

## 📄 Project Structure
```
handasci/
├── src/
│   ├── App.jsx           # Main application component
│   ├── main.jsx          # React entry point
│   └── index.css         # Tailwind styles
├── public/               # Static assets
├── index.html            # HTML template
├── package.json          # Dependencies
├── vite.config.js        # Vite configuration
└── tailwind.config.js    # Tailwind configuration
```

## 🤝 Contributing

Contributions are welcome! Feel free to:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [MediaPipe](https://mediapipe.dev/) - Google's ML solutions for hand tracking
- [ASCII Art](https://en.wikipedia.org/wiki/ASCII_art) - The timeless art form
- Inspired by retro computer graphics and terminal aesthetics

## 🐛 Known Issues

- Hand detection may be affected by poor lighting
- Performance varies based on device capabilities
- ANSI colors may not display in all environments

## 📧 Contact

Your Name - [@TreyZ](https://x.com/trnst_vn)

Project Link: [https://github.com/EunjiTan/handasci](https://github.com/EunjiTan/handasci)

---

Made with ❤️ and lots of hand gestures

