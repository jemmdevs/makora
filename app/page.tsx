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
    </div>
  );
}
