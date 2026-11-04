"use client";

import React, { useEffect, useRef } from "react";

interface RotatingWireframeGlobeProps {
  className?: string;
  dotColor?: string;
  latLongColor?: string;
}

export const RotatingWireframeGlobe: React.FC<RotatingWireframeGlobeProps> = ({
  className = "",
  dotColor = "rgba(5, 150, 105, 0.95)", // Rich vibrant Emerald 600
  latLongColor = "rgba(16, 185, 129, 0.65)", // Strong Emerald wireframe
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    // Spherical geometry generation
    const numLatitudes = 24;
    const numLongitudes = 36;
    const particlesCount = 800;

    // Generate random surface points (dots) on sphere
    const dots: { theta: number; phi: number; size: number; alpha: number }[] = [];
    for (let i = 0; i < particlesCount; i++) {
      dots.push({
        theta: Math.acos(2 * Math.random() - 1), // 0 to PI
        phi: Math.random() * 2 * Math.PI, // 0 to 2PI
        size: Math.random() * 2.0 + 1.0,
        alpha: Math.random() * 0.6 + 0.4,
      });
    }

    let rotationAngle = 0;
    const rotationSpeed = 0.0035;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Center sphere horizontally at bottom so only top 20% arches upward
      const cx = width / 2;
      const radius = Math.max(width * 0.58, 650); // Massive 100vw+ scale
      // Center Y pushed down so top apex of sphere is visible in lower 20-30%
      const cy = height + radius * 0.76;

      rotationAngle += rotationSpeed;

      // 1. Draw Longitudinal Lines (Meridians)
      ctx.lineWidth = 1.35;
      for (let j = 0; j < numLongitudes; j++) {
        const phiBase = (j * (2 * Math.PI)) / numLongitudes + rotationAngle;
        ctx.beginPath();
        let first = true;

        for (let i = 0; i <= 60; i++) {
          const theta = (i * Math.PI) / 60;
          // 3D coordinates
          const x3d = radius * Math.sin(theta) * Math.cos(phiBase);
          const y3d = radius * Math.cos(theta);
          const z3d = radius * Math.sin(theta) * Math.sin(phiBase);

          // Tilt globe forward slightly for perspective
          const tiltedY = y3d * Math.cos(0.25) - z3d * Math.sin(0.25);
          const tiltedZ = y3d * Math.sin(0.25) + z3d * Math.cos(0.25);

          if (tiltedZ > -radius * 0.2) {
            // Front hemisphere
            const screenX = cx + x3d;
            const screenY = cy - tiltedY;

            if (first) {
              ctx.moveTo(screenX, screenY);
              first = false;
            } else {
              ctx.lineTo(screenX, screenY);
            }
          }
        }
        ctx.strokeStyle = latLongColor;
        ctx.stroke();
      }

      // 2. Draw Latitudinal Rings (Parallels)
      for (let i = 1; i < numLatitudes; i++) {
        const theta = (i * Math.PI) / numLatitudes;
        const ringRadius = radius * Math.sin(theta);
        const ringY = radius * Math.cos(theta);

        ctx.beginPath();
        let first = true;

        for (let k = 0; k <= 72; k++) {
          const phi = (k * 2 * Math.PI) / 72 + rotationAngle;
          const x3d = ringRadius * Math.cos(phi);
          const z3d = ringRadius * Math.sin(phi);

          const tiltedY = ringY * Math.cos(0.25) - z3d * Math.sin(0.25);
          const tiltedZ = ringY * Math.sin(0.25) + z3d * Math.cos(0.25);

          if (tiltedZ > -radius * 0.15) {
            const screenX = cx + x3d;
            const screenY = cy - tiltedY;

            if (first) {
              ctx.moveTo(screenX, screenY);
              first = false;
            } else {
              ctx.lineTo(screenX, screenY);
            }
          }
        }
        ctx.strokeStyle = latLongColor;
        ctx.stroke();
      }

      // 3. Draw Atmospheric Sensor Node Particles
      dots.forEach((dot) => {
        const currentPhi = dot.phi + rotationAngle;
        const x3d = radius * Math.sin(dot.theta) * Math.cos(currentPhi);
        const y3d = radius * Math.cos(dot.theta);
        const z3d = radius * Math.sin(dot.theta) * Math.sin(currentPhi);

        const tiltedY = y3d * Math.cos(0.25) - z3d * Math.sin(0.25);
        const tiltedZ = y3d * Math.sin(0.25) + z3d * Math.cos(0.25);

        if (tiltedZ > 0) {
          // Front-facing surface dots
          const depthAlpha = (tiltedZ / radius) * dot.alpha;
          const screenX = cx + x3d;
          const screenY = cy - tiltedY;

          ctx.beginPath();
          ctx.arc(screenX, screenY, dot.size, 0, Math.PI * 2);
          ctx.fillStyle = dotColor.replace(/[\d.]+\)$/, `${depthAlpha.toFixed(2)})`);
          ctx.fill();
        }
      });

      // 4. Vibrant Emerald Atmosphere Horizon Glow Arc
      const grad = ctx.createRadialGradient(cx, cy, radius * 0.95, cx, cy, radius * 1.05);
      grad.addColorStop(0, "rgba(16, 185, 129, 0.55)");
      grad.addColorStop(0.5, "rgba(5, 150, 105, 0.25)");
      grad.addColorStop(1, "rgba(5, 150, 105, 0)");

      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.03, 0, Math.PI * 2);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 16;
      ctx.stroke();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, [dotColor, latLongColor]);

  return <canvas ref={canvasRef} className={`w-full h-full block pointer-events-none ${className}`} />;
};
