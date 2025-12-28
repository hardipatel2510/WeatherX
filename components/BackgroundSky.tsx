'use client';

// Simplified background component for the specific static look requested
export default function BackgroundSky() {
    return (
        <div className="fixed inset-0 z-[-1]">
            {/* Requested: Dark Navy -> Soft Blue -> Bright Sky Blue */}
            <div
                className="absolute inset-0 bg-gradient-to-b from-[#0B1026] via-[#2B32B2] to-[#4FACFE]"
            />
        </div>
    );
}
