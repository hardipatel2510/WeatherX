'use client';

import { useState } from 'react';

export default function VideoBackground() {
    const [videoLoaded, setVideoLoaded] = useState(false);

    // Example public domain / royalty free placeholder. 
    // User can replace this with their own premium asset.
    const videoUrl = "https://videos.pexels.com/video-files/5377508/5377508-uhd_3840_2160_25fps.mp4";

    return (
        <div className="fixed inset-0 z-[-1] overflow-hidden bg-[#87CEEB]">
            <video
                autoPlay
                muted
                loop
                playsInline
                onLoadedData={() => setVideoLoaded(true)}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${videoLoaded ? 'opacity-100' : 'opacity-0'}`}
            >
                <source src={videoUrl} type="video/mp4" />
            </video>

            {/* Fallback / Loading State: Cinematic Gradient Animation */}
            <div className={`absolute inset-0 bg-gradient-to-br from-blue-400 via-blue-200 to-white transition-opacity duration-1000 ${videoLoaded ? 'opacity-0' : 'opacity-100'}`}>
                <div className="absolute inset-0 opacity-30 mix-blend-overlay animate-pulse bg-gradient-to-t from-black/20 to-transparent" />
            </div>

            {/* Atmospheric Overlays */}
            {/* 1. Warm Sun Glow (Top Left) */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-orange-200/30 rounded-full blur-[120px] mix-blend-screen pointer-events-none" />

            {/* 2. Darker Vignette (Edges) for Text Readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/30 pointer-events-none" />

            {/* 3. Global Tint */}
            <div className="absolute inset-0 bg-blue-900/10 mix-blend-overlay pointer-events-none" />
        </div>
    );
}
