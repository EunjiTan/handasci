import React, { useEffect, useRef, useState } from 'react';
import { Camera, Hand, Settings, X } from 'lucide-react';

const ASCIIVideoConverter = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const outputRef = useRef(null);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState('ascii');
  const [resolution, setResolution] = useState(80);
  const [handDistance, setHandDistance] = useState(0);
  const [isFist, setIsFist] = useState(false);
  const [error, setError] = useState('');
  const [showControls, setShowControls] = useState(false);
  const [mediaPipeLoaded, setMediaPipeLoaded] = useState(false);
  const handsRef = useRef(null);
  const animationFrameRef = useRef(null);
  const cameraRef = useRef(null);

  const ASCII_CHARS = ' .:-=+*#%@';

  useEffect(() => {
    loadMediaPipe();
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      stopCamera();
    };
  }, []);

  const loadMediaPipe = async () => {
    try {
      await new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js';
        script.onload = resolve;
        script.onerror = reject;
        document.body.appendChild(script);
      });

      await new Promise((resolve, reject) => {
        const script2 = document.createElement('script');
        script2.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js';
        script2.onload = resolve;
        script2.onerror = reject;
        document.body.appendChild(script2);
      });

      setMediaPipeLoaded(true);
      console.log('MediaPipe loaded successfully');
    } catch (err) {
      console.error('MediaPipe load error:', err);
      setError('Failed to load MediaPipe library');
    }
  };

  const calculateDistance = (point1, point2) => {
    return Math.sqrt(
      Math.pow(point1.x - point2.x, 2) +
      Math.pow(point1.y - point2.y, 2)
    );
  };

  const detectFist = (landmarks) => {
    const palmBase = landmarks[0];
    const fingertips = [4, 8, 12, 16, 20];
    
    let closedCount = 0;
    fingertips.forEach(tip => {
      const dist = calculateDistance(landmarks[tip], palmBase);
      if (dist < 0.15) closedCount++;
    });
    
    return closedCount >= 4;
  };

  const onResults = (results) => {
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      const landmarks = results.multiHandLandmarks[0];
      
      const dist = calculateDistance(landmarks[4], landmarks[20]);
      setHandDistance(dist);
      
      const newRes = Math.floor(40 + dist * 300);
      setResolution(Math.min(120, Math.max(40, newRes)));
      
      const fistDetected = detectFist(landmarks);
      if (fistDetected && !isFist) {
        setMode(prev => prev === 'ascii' ? 'ansi' : 'ascii');
      }
      setIsFist(fistDetected);
    }
  };

  const startCamera = async () => {
    try {
      if (!mediaPipeLoaded) {
        setError('MediaPipe is still loading, please wait...');
        return;
      }

      if (!window.Hands) {
        setError('MediaPipe Hands not available');
        return;
      }

      console.log('Starting camera...');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = async () => {
          await videoRef.current.play();
          console.log('Video playing');
        };
      }

      const hands = new window.Hands({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
        }
      });

      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      hands.onResults(onResults);
      handsRef.current = hands;

      if (window.Camera) {
        const camera = new window.Camera(videoRef.current, {
          onFrame: async () => {
            if (handsRef.current && videoRef.current) {
              await handsRef.current.send({ image: videoRef.current });
            }
          },
          width: 640,
          height: 480
        });
        cameraRef.current = camera;
        await camera.start();
        console.log('Camera started');
      }

      setIsRunning(true);
      setError('');
      
      setTimeout(() => {
        console.log('Starting ASCII processing');
        processFrame();
      }, 500);
    } catch (err) {
      console.error('Camera error:', err);
      setError(`Camera error: ${err.message}`);
    }
  };

  const stopCamera = () => {
    if (cameraRef.current) {
      cameraRef.current.stop();
    }
    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setIsRunning(false);
    console.log('Camera stopped');
  };

  const processFrame = async () => {
    if (!videoRef.current || !canvasRef.current || !isRunning) {
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (video.readyState !== video.HAVE_ENOUGH_DATA) {
      animationFrameRef.current = requestAnimationFrame(processFrame);
      return;
    }

    try {
      const aspectRatio = video.videoWidth / video.videoHeight || 16/9;
      canvas.width = resolution;
      canvas.height = Math.floor(resolution / aspectRatio);

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const asciiArt = convertToASCII(imageData, canvas.width, canvas.height);
      
      if (outputRef.current) {
        outputRef.current.textContent = asciiArt;
      }
    } catch (err) {
      console.error('Frame processing error:', err);
    }

    if (isRunning) {
      animationFrameRef.current = requestAnimationFrame(processFrame);
    }
  };

  const convertToASCII = (imageData, width, height) => {
    let result = '';
    const data = imageData.data;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        const brightness = (r + g + b) / 3;
        const charIndex = Math.floor((brightness / 255) * (ASCII_CHARS.length - 1));
        
        result += ASCII_CHARS[charIndex];
      }
      result += '\n';
    }
    
    return result;
  };

  useEffect(() => {
    if (isRunning) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      processFrame();
    }
  }, [resolution, mode, isRunning]);

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">
      {/* Main ASCII Output - Full Screen */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <pre
          ref={outputRef}
          className="font-mono leading-none whitespace-pre select-none"
          style={{ 
            fontSize: '6px',
            lineHeight: '6px',
            letterSpacing: '0',
            color: mode === 'ansi' ? '#00ff00' : '#ffffff'
          }}
        >
          {isRunning ? 'Processing...' : 'Click START to begin'}
        </pre>
      </div>

      {/* Hidden video and canvas */}
      <video ref={videoRef} className="hidden" playsInline autoPlay muted />
      <canvas ref={canvasRef} className="hidden" />

      {/* Floating Control Button */}
      <button
        onClick={() => setShowControls(!showControls)}
        className="fixed top-6 right-6 z-50 bg-gray-800/90 backdrop-blur-sm hover:bg-gray-700 p-4 rounded-full transition-all shadow-lg"
        title="Toggle Controls"
      >
        {showControls ? <X className="w-6 h-6" /> : <Settings className="w-6 h-6" />}
      </button>

      {/* Status Indicators */}
      <div className="fixed top-6 left-6 z-40 space-y-2">
        <div className="bg-gray-800/90 backdrop-blur-sm rounded-lg px-4 py-2 text-sm">
          <span className={`inline-block w-2 h-2 rounded-full mr-2 ${isRunning ? 'bg-green-500' : 'bg-red-500'}`}></span>
          {isRunning ? 'LIVE' : 'STOPPED'}
        </div>
        {isRunning && (
          <>
            <div className="bg-gray-800/90 backdrop-blur-sm rounded-lg px-4 py-2 text-sm">
              Mode: <span className="font-bold">{mode.toUpperCase()}</span>
            </div>
            <div className="bg-gray-800/90 backdrop-blur-sm rounded-lg px-4 py-2 text-sm">
              Resolution: <span className="font-bold">{resolution}px</span>
            </div>
            {isFist && (
              <div className="bg-green-600/90 backdrop-blur-sm rounded-lg px-4 py-2 text-sm font-bold animate-pulse">
                ✊ FIST DETECTED
              </div>
            )}
          </>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 bg-red-600/90 backdrop-blur-sm border border-red-400 rounded-lg px-6 py-3 max-w-md">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Control Panel Sidebar */}
      <div className={`fixed top-0 right-0 h-full w-80 bg-gray-900/95 backdrop-blur-sm shadow-2xl z-40 transform transition-transform duration-300 ${showControls ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-6 h-full overflow-y-auto">
          <div className="flex items-center gap-3 mb-6">
            <Hand className="w-8 h-8 text-blue-400" />
            <div>
              <h2 className="text-xl font-bold">Controls</h2>
              <p className="text-xs text-gray-400">Hand Gesture Settings</p>
            </div>
          </div>

          {/* Camera Preview */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Camera className="w-4 h-4" />
              Camera Preview
            </h3>
            <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                autoPlay
                muted
              />
              {!isRunning && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <p className="text-sm text-gray-400">Camera Off</p>
                </div>
              )}
            </div>
          </div>

          {/* Main Control Button */}
          <button
            onClick={isRunning ? stopCamera : startCamera}
            disabled={!mediaPipeLoaded && !isRunning}
            className={`w-full py-4 px-6 rounded-lg font-bold transition-colors mb-4 ${
              isRunning
                ? 'bg-red-600 hover:bg-red-700'
                : mediaPipeLoaded 
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-gray-600 cursor-not-allowed'
            }`}
          >
            {!mediaPipeLoaded && !isRunning ? 'LOADING...' : isRunning ? 'STOP' : 'START'}
          </button>

          {/* Manual Controls */}
          <div className="space-y-4 mb-6">
            <div>
              <label className="text-sm font-semibold mb-2 block">Resolution: {resolution}px</label>
              <input
                type="range"
                min="40"
                max="120"
                value={resolution}
                onChange={(e) => setResolution(parseInt(e.target.value))}
                className="w-full"
              />
              <p className="text-xs text-gray-400 mt-1">Or spread/pinch fingers</p>
            </div>

            <div>
              <label className="text-sm font-semibold mb-2 block">Mode</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setMode('ascii')}
                  className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-colors ${
                    mode === 'ascii' ? 'bg-blue-600' : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  ASCII
                </button>
                <button
                  onClick={() => setMode('ansi')}
                  className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-colors ${
                    mode === 'ansi' ? 'bg-green-600' : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  ANSI
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1">Or make a fist to toggle</p>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-gray-800 rounded-lg p-4">
            <h3 className="font-semibold mb-3 text-sm">Gesture Controls</h3>
            <ul className="space-y-2 text-xs text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-lg">✋</span>
                <div>
                  <strong>Spread fingers wide</strong>
                  <br />Increase resolution (sharper)
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-lg">🤏</span>
                <div>
                  <strong>Pinch fingers together</strong>
                  <br />Decrease resolution (blockier)
                </div>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-lg">✊</span>
                <div>
                  <strong>Make a fist</strong>
                  <br />Toggle ASCII/ANSI mode
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ASCIIVideoConverter;