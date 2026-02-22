"use client"

import { cn } from "@/lib/utils"

/**
 * Phone Garage style hero background.
 * Large, soft, white/off-white shapes drifting slowly on a white background.
 * Uses inline @keyframes via style tag to guarantee animations work
 * regardless of globals.css loading order.
 */
export function BackgroundRippleEffect({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className
      )}
      aria-hidden="true"
      style={{ backgroundColor: "#ffffff" }}
    >
      {/* Inline keyframes -- guaranteed to load */}
      <style>{`
        @keyframes drift1 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          25% { transform: translate(60px, 40px) scale(1.05); }
          50% { transform: translate(30px, 80px) scale(0.97); }
          75% { transform: translate(-30px, 40px) scale(1.03); }
        }
        @keyframes drift2 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          25% { transform: translate(-50px, 60px) scale(1.04); }
          50% { transform: translate(-80px, 30px) scale(0.95); }
          75% { transform: translate(-30px, -20px) scale(1.02); }
        }
        @keyframes drift3 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          25% { transform: translate(40px, -50px) scale(1.06); }
          50% { transform: translate(70px, -30px) scale(0.96); }
          75% { transform: translate(20px, -60px) scale(1.04); }
        }
        @keyframes drift4 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(-40px, -35px) scale(1.08); }
          66% { transform: translate(30px, 45px) scale(0.94); }
        }
        @keyframes drift5 {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(45px, -30px) scale(1.06); }
          66% { transform: translate(-25px, 35px) scale(0.95); }
        }
      `}</style>

      {/* Blob 1 -- top left, large light gray */}
      <div
        style={{
          position: "absolute",
          width: "700px",
          height: "700px",
          top: "-5%",
          left: "-8%",
          borderRadius: "50%",
          background: "radial-gradient(circle, #e0e0e0 0%, #ebebeb 40%, #f5f5f5 70%, transparent 100%)",
          opacity: 0.9,
          filter: "blur(60px)",
          animation: "drift1 20s ease-in-out infinite",
          willChange: "transform",
        }}
      />

      {/* Blob 2 -- top right, subtle green tint */}
      <div
        style={{
          position: "absolute",
          width: "600px",
          height: "600px",
          top: "2%",
          right: "-5%",
          borderRadius: "50%",
          background: "radial-gradient(circle, #d8edd9 0%, #e4f0e4 40%, #f2f8f2 70%, transparent 100%)",
          opacity: 0.85,
          filter: "blur(55px)",
          animation: "drift2 25s ease-in-out infinite",
          willChange: "transform",
        }}
      />

      {/* Blob 3 -- bottom center, very large light gray */}
      <div
        style={{
          position: "absolute",
          width: "900px",
          height: "900px",
          bottom: "-15%",
          left: "20%",
          borderRadius: "50%",
          background: "radial-gradient(circle, #e2e2e2 0%, #ededed 40%, #f6f6f6 70%, transparent 100%)",
          opacity: 0.85,
          filter: "blur(70px)",
          animation: "drift3 22s ease-in-out infinite",
          willChange: "transform",
        }}
      />

      {/* Blob 4 -- left center, smaller green accent */}
      <div
        style={{
          position: "absolute",
          width: "400px",
          height: "400px",
          top: "40%",
          left: "5%",
          borderRadius: "50%",
          background: "radial-gradient(circle, #cce5cd 0%, #ddeedd 50%, #f0f7f0 80%, transparent 100%)",
          opacity: 0.8,
          filter: "blur(50px)",
          animation: "drift4 18s ease-in-out infinite",
          willChange: "transform",
        }}
      />

      {/* Blob 5 -- right center, medium gray */}
      <div
        style={{
          position: "absolute",
          width: "500px",
          height: "500px",
          top: "30%",
          right: "8%",
          borderRadius: "50%",
          background: "radial-gradient(circle, #e3e3e3 0%, #ececec 45%, #f6f6f6 75%, transparent 100%)",
          opacity: 0.85,
          filter: "blur(55px)",
          animation: "drift5 24s ease-in-out infinite",
          willChange: "transform",
        }}
      />

      {/* Blob 6 -- center top, faint green haze */}
      <div
        style={{
          position: "absolute",
          width: "550px",
          height: "550px",
          top: "10%",
          left: "35%",
          borderRadius: "50%",
          background: "radial-gradient(circle, #ddeedd 0%, #eaf3ea 45%, #f5faf5 75%, transparent 100%)",
          opacity: 0.7,
          filter: "blur(60px)",
          animation: "drift1 28s ease-in-out infinite reverse",
          willChange: "transform",
        }}
      />
    </div>
  )
}
