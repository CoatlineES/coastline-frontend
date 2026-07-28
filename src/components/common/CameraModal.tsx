import React, { useEffect, useRef, useState } from 'react';
import { Camera, X, RefreshCcw } from 'lucide-react';
import toast from 'react-hot-toast';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (file: File) => void;
}

export const CameraModal: React.FC<CameraModalProps> = ({ isOpen, onClose, onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen, facingMode]);

  const startCamera = async () => {
    setError(null);
    stopCamera(); // Stop any existing stream
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      streamRef.current = stream;
    } catch (err: any) {
      console.error('Error accessing camera:', err);
      setError('No se pudo acceder a la cámara. Revisa los permisos o conecta una cámara.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
  };

  const handleCapture = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(blob => {
      if (blob) {
        const file = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
        onCapture(file);
        onClose();
      } else {
        toast.error('Error al procesar la foto');
      }
    }, 'image/jpeg', 0.9);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center bg-gradient-to-b from-black/70 to-transparent z-10">
        <button onClick={onClose} className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors">
          <X size={24} />
        </button>
        <button onClick={toggleCamera} className="p-2 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors" title="Cambiar cámara">
          <RefreshCcw size={24} />
        </button>
      </div>

      {/* Video Feed */}
      <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
        {error ? (
          <div className="text-white text-center p-6 bg-slate-900 rounded-xl max-w-sm">
            <p className="mb-4">{error}</p>
            <button onClick={onClose} className="px-4 py-2 bg-primary rounded-lg font-medium text-sm">Cerrar</button>
          </div>
        ) : (
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Controls */}
      {!error && (
        <div className="absolute bottom-0 left-0 right-0 p-8 flex justify-center items-center bg-gradient-to-t from-black/80 to-transparent z-10 pb-safe md:pb-12 pt-16">
          <button 
            onClick={handleCapture}
            className="w-20 h-20 bg-white/30 rounded-full flex items-center justify-center p-2 hover:bg-white/40 active:scale-95 transition-all"
          >
            <div className="w-full h-full bg-white rounded-full flex items-center justify-center text-black">
              <Camera size={28} />
            </div>
          </button>
        </div>
      )}
    </div>
  );
};
