import { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX, Sparkles } from 'lucide-react';

export default function ChromaKeyCatMeme() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isMuted, setIsMuted] = useState(false); // Default sound ON as requested!
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    let animId;

    const render = () => {
      if (video.readyState >= 2 && !video.paused && !video.ended) {
        const w = canvas.width;
        const h = canvas.height;

        // Tightly crop the source video around the cat to eliminate excess green/transparent padding
        const cropX = 40;
        const cropY = 240;
        const cropW = 380;
        const cropH = 610;

        ctx.drawImage(video, cropX, cropY, cropW, cropH, 0, 0, w, h);
        const frame = ctx.getImageData(0, 0, w, h);
        const data = frame.data;
        const len = data.length;

        // Chroma key: remove green background
        for (let i = 0; i < len; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          // Green screen detection: green is dominant
          if (g > 105 && g > r * 1.15 && g > b * 1.15) {
            data[i + 3] = 0; // Transparent
          }
        }

        ctx.putImageData(frame, 0, 0);
      }
      animId = requestAnimationFrame(render);
    };

    // Default sound ON: attempt unmuted playback
    video.muted = isMuted;
    video.play().catch(() => {
      // Fallback if browser requires user gesture prior to unmuting
      video.muted = true;
      setIsMuted(true);
      video.play().catch(() => {});
    });

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isMuted]);

  const toggleSound = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().catch(() => {});
    }

    const nextMuted = !isMuted;
    video.muted = nextMuted;
    setIsMuted(nextMuted);
    setHasInteracted(true);
  };

  return (
    <div className="bg-[#fcf9f0] border-2 border-[#1c1c17] rounded-2xl p-4 sm:p-6 shadow-[4px_4px_0px_#1c1c17] flex flex-col items-center justify-center text-center gap-3 relative overflow-hidden">
      {/* Hidden Source Video with Audio */}
      <video
        ref={videoRef}
        src="/videos/cat-clapping.mp4"
        crossOrigin="anonymous"
        loop
        playsInline
        muted={isMuted}
        className="hidden"
      />

      {/* Funny Top Stamp */}
      <div className="inline-flex items-center gap-2 bg-[#ffe24c] text-[#211b00] border-2 border-[#1c1c17] px-4 py-1.5 rounded-full font-['Space_Grotesk'] text-xs sm:text-sm font-bold uppercase shadow-[2px_2px_0px_#1c1c17] rotate-[-2deg]">
        <Sparkles className="w-4 h-4 text-[#ba1a1a]" />
        <span>OFFICIAL SUNDAY PASS • MAXIMUM CHILL</span>
      </div>

      {/* Meme Header (Without the deleted subtitle) */}
      <div className="max-w-xl">
        <h3 className="font-['Space_Grotesk'] text-2xl sm:text-4xl font-bold uppercase tracking-tight text-[#1c1c17]">
          "NO SCHOOL TODAY, GANG!"
        </h3>
      </div>

      {/* Chroma-Keyed Clapping Cat Canvas (Tightly cropped, zero excess padding) */}
      <div className="relative flex flex-col items-center">
        <canvas
          ref={canvasRef}
          width={380}
          height={610}
          onClick={toggleSound}
          className="w-48 sm:w-60 h-auto drop-shadow-[0_8px_16px_rgba(0,0,0,0.18)] cursor-pointer hover:scale-105 transition-transform"
          title="Click to toggle clapping sound!"
        />

        {/* Interactive Sound Controller Button */}
        <button
          type="button"
          onClick={toggleSound}
          className={`mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-[#1c1c17] font-['Space_Grotesk'] text-xs sm:text-sm font-bold transition-all shadow-[3px_3px_0px_#1c1c17] active:translate-x-[1px] active:translate-y-[1px] cursor-pointer ${
            isMuted
              ? 'bg-[#ffe24c] text-[#211b00] hover:bg-[#ebd03f] animate-bounce'
              : 'bg-[#a6f2cf] text-[#002115] hover:bg-[#91e4be]'
          }`}
        >
          {isMuted ? (
            <>
              <VolumeX className="w-4 h-4 text-[#ba1a1a]" />
              <span>🔊 TAP FOR MEME SOUND!</span>
            </>
          ) : (
            <>
              <Volume2 className="w-4 h-4 text-[#002115] animate-pulse" />
              <span>🔊 SOUND PLAYING • MUTE</span>
            </>
          )}
        </button>

        {!hasInteracted && isMuted && (
          <span className="text-[11px] font-['Plus_Jakarta_Sans'] text-[#62597c] mt-1 font-semibold">
            (Tap the button or cat to hear the clapping sound 🎵)
          </span>
        )}
      </div>
    </div>
  );
}
