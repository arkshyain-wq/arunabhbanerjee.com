import React, { useEffect, useState, useRef } from "react";
import { Scale } from "lucide-react";

export default function LegalCursor() {
  const [enabled, setEnabled] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isHoveringClickable, setIsHoveringClickable] = useState(false);

  // Position references for smooth interpolation (lerp)
  const mousePos = useRef({ x: -100, y: -100 });
  const trailPos = useRef({ x: -100, y: -100 });
  const dotRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    // Only enable on desktop pointer devices
    const isFinePointer = window.matchMedia("(pointer: fine)").matches;
    if (!isFinePointer) return;

    setEnabled(true);

    const onMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      if (!isVisible) setIsVisible(true);

      // Check if hovering over interactive elements
      const target = e.target as HTMLElement | null;
      if (target) {
        const isClickable = !!target.closest(
          "button, a, input, textarea, select, [role='button'], .cursor-pointer, [data-clickable]"
        );
        setIsHoveringClickable(isClickable);
      }
    };

    const onMouseEnter = () => setIsVisible(true);
    const onMouseLeave = () => setIsVisible(false);

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    document.addEventListener("mouseenter", onMouseEnter);
    document.addEventListener("mouseleave", onMouseLeave);

    // Smooth animation loop using requestAnimationFrame
    const updateCursor = () => {
      // Lerp for trailing lawyer icon (smooth lag follow)
      const lerpFactor = 0.22;
      trailPos.current.x += (mousePos.current.x - trailPos.current.x) * lerpFactor;
      trailPos.current.y += (mousePos.current.y - trailPos.current.y) * lerpFactor;

      // Update dot at exact cursor tip
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mousePos.current.x}px, ${mousePos.current.y}px, 0)`;
      }

      // Update trailing lawyer icon
      if (iconRef.current) {
        iconRef.current.style.transform = `translate3d(${trailPos.current.x}px, ${trailPos.current.y}px, 0)`;
      }

      // Update ambient spotlight
      if (glowRef.current) {
        glowRef.current.style.transform = `translate3d(${trailPos.current.x}px, ${trailPos.current.y}px, 0)`;
      }

      rafId.current = requestAnimationFrame(updateCursor);
    };

    rafId.current = requestAnimationFrame(updateCursor);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseenter", onMouseEnter);
      document.removeEventListener("mouseleave", onMouseLeave);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [isVisible]);

  if (!enabled || !isVisible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden select-none">
      
      {/* 1. Ambient Background Spotlight Glow following cursor */}
      <div
        ref={glowRef}
        aria-hidden="true"
        className="fixed top-0 left-0 w-[420px] h-[420px] -ml-[210px] -mt-[210px] rounded-full pointer-events-none transition-opacity duration-300 will-change-transform z-0"
        style={{
          background: isHoveringClickable
            ? "radial-gradient(circle, rgba(212, 175, 55, 0.12) 0%, rgba(212, 175, 55, 0.03) 45%, transparent 70%)"
            : "radial-gradient(circle, rgba(212, 175, 55, 0.07) 0%, rgba(212, 175, 55, 0.01) 40%, transparent 65%)"
        }}
      />

      {/* 2. Trailing Lawyer Judicial Icon (Scales of Justice with Gold Badge) */}
      <div
        ref={iconRef}
        className="fixed top-0 left-0 pointer-events-none will-change-transform z-[9999]"
        style={{
          marginLeft: "14px",
          marginTop: "14px"
        }}
      >
        <div
          className={`flex items-center gap-1 px-1.5 py-1 rounded-full backdrop-blur-md border transition-all duration-200 shadow-xl ${
            isHoveringClickable
              ? "bg-[#141824]/95 border-[#f5d77f] scale-110 shadow-[0_0_15px_rgba(245,215,127,0.45)] text-[#f5d77f]"
              : "bg-[#0b0e17]/80 border-[#d4af37]/40 scale-95 shadow-[0_0_8px_rgba(212,175,55,0.2)] text-[#d4af37]"
          }`}
        >
          <Scale
            className={`w-3.5 h-3.5 transition-transform duration-200 ${
              isHoveringClickable ? "rotate-12 scale-110 text-[#f5d77f]" : "text-[#d4af37]"
            }`}
          />
          {isHoveringClickable && (
            <span className="text-[9px] font-mono font-bold tracking-wider uppercase text-[#f5d77f] pr-0.5 animate-in fade-in zoom-in-95">
              Counsel
            </span>
          )}
        </div>
      </div>

      {/* 3. Precise Gold Tip Pointer Dot */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 -ml-[5px] -mt-[5px] pointer-events-none will-change-transform z-[10000]"
      >
        <div
          className={`rounded-full transition-all duration-150 ${
            isHoveringClickable
              ? "w-4 h-4 -ml-[3px] -mt-[3px] bg-transparent border-2 border-[#f5d77f] shadow-[0_0_12px_#d4af37]"
              : "w-2.5 h-2.5 bg-gradient-to-tr from-[#d4af37] to-[#fff3b0] shadow-[0_0_8px_#d4af37]"
          }`}
        />
      </div>

    </div>
  );
}
