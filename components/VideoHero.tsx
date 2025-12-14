import React, { useRef, useEffect, useState } from 'react';
import { Edit2 } from 'lucide-react';

interface VideoHeroProps {
  videoUrl: string;
  posterUrl?: string;
  onVideoEnd: () => void;
  isEditing: boolean;
  onVideoReady?: () => void;
}

const VideoHero: React.FC<VideoHeroProps> = ({ videoUrl, posterUrl, onVideoEnd, isEditing, onVideoReady }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [shouldLoadVideo, setShouldLoadVideo] = useState(false);
  const [videoReady, setVideoReady] = useState(false);

  // Lazy load: ویدیو بعد از ۱ ثانیه شروع به لود میشه
  useEffect(() => {
    const timer = setTimeout(() => {
      setShouldLoadVideo(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (videoRef.current && shouldLoadVideo) {
      videoRef.current.play().catch(() => {});
    }
  }, [videoUrl, shouldLoadVideo]);

  const handleVideoReady = () => {
    setVideoReady(true);
    if (onVideoReady) onVideoReady();
  };

  return (
    <div className="absolute inset-0 w-full h-full bg-black z-0 overflow-hidden">
      {/* Poster image - نمایش فوری تا ویدیو لود بشه */}
      {posterUrl && !videoReady && (
        <img 
          src={posterUrl} 
          alt="Background" 
          className="absolute inset-0 w-full h-full object-cover object-[75%_center] md:object-center opacity-60"
        />
      )}

      {/* Video - فقط وقتی shouldLoadVideo true باشه لود میشه */}
      {shouldLoadVideo && videoUrl && (
        <video
          ref={videoRef}
          className={`w-full h-full object-cover object-[75%_center] md:object-center opacity-60 transition-opacity duration-1000 ${videoReady ? 'opacity-60' : 'opacity-0'}`}
          src={videoUrl}
          poster={posterUrl}
          autoPlay
          muted
          loop={false}
          playsInline
          preload="metadata"
          onEnded={onVideoEnd}
          onCanPlay={handleVideoReady}
        />
      )}

      {isEditing && (
        <div className="absolute top-4 left-4 bg-yellow-500/20 text-yellow-500 p-2 rounded border border-yellow-500/50 flex items-center gap-2 z-50">
          <Edit2 size={16} />
          <span className="text-xs font-bold">Edit Mode</span>
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40 pointer-events-none"></div>
    </div>
  );
};

export default VideoHero;