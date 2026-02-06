"use client";

import { useRef, useCallback, useState } from "react";
import ProjectWheel from "./components/ProjectWheel";
import { PROJECTS, PROJECT_VIDEOS } from "./config/wheel.config";

export default function Home() {
  const [videoSrc, setVideoSrc] = useState(PROJECT_VIDEOS[PROJECTS[0]]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const currentSrcRef = useRef(videoSrc);

  const handleProjectChange = useCallback((index: number) => {
    const newSrc = PROJECT_VIDEOS[PROJECTS[index]];
    if (newSrc !== currentSrcRef.current) {
      currentSrcRef.current = newSrc;
      setVideoSrc(newSrc);
    }
  }, []);

  return (
    <div className="page-container">
      <div className="video-container">
        <video
          ref={videoRef}
          className="video-player"
          key={videoSrc}
          src={videoSrc}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
        />
      </div>
      <ProjectWheel onProjectChange={handleProjectChange} />

      <footer className="bottom-bar">
      <img src="/jmakora.svg" alt="jmakora" className="brand-logo" width={64} height={64} />
      <nav className="social-links">
        <a href="https://josencv.vercel.app" target="_blank" rel="noopener noreferrer" aria-label="Portfolio">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <path d="M2 12h20"/>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
          </svg>
        </a>
        <a href="https://linkedin.com/in/jose-enrique-mateo-munoz" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
            <rect x="2" y="9" width="4" height="12"/>
            <circle cx="4" cy="4" r="2"/>
          </svg>
        </a>
        <a href="https://www.instagram.com/joseenrique_mm/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
          </svg>
        </a>
      </nav>
      </footer>
    </div>
  );
}
