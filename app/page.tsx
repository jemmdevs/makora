"use client";

import { useState, useRef, useCallback } from "react";
import ProjectWheel from "./components/ProjectWheel";

const PROJECT_VIDEOS = [
  "/videoProject.webm",   // makora
  "/videoProject2.webm",  // ikra
  "/videoProject.webm",   // alawal
  "/videoProject2.webm",  // enuma
  "/videoProject.webm",   // aisac
  "/videoProject2.webm",  // mirilab
  "/videoProject.webm",   // gdels
  "/videoProject2.webm",  // tousys
];

export default function Home() {
  const [videoSrc, setVideoSrc] = useState(PROJECT_VIDEOS[0]);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleProjectChange = useCallback((index: number) => {
    const newSrc = PROJECT_VIDEOS[index];
    if (newSrc !== videoSrc) {
      setVideoSrc(newSrc);
      if (videoRef.current) {
        videoRef.current.load();
      }
    }
  }, [videoSrc]);

  return (
    <div className="page-container">
      <div className="video-container">
        <video
          ref={videoRef}
          className="video-player"
          src={videoSrc}
          autoPlay
          loop
          muted
          playsInline
        />
      </div>
      <ProjectWheel onProjectChange={handleProjectChange} />
    </div>
  );
}
