import { useEffect, useRef, useState } from "react";
import { CVTemplate } from "./cv-templates";
import type { Cv } from "@shared/schema";

interface CVTemplatePreviewProps {
  data: Cv;
  templateId: string;
  /** Aspect ratio of the container (width:height). Default is 3:4 for cards */
  containerAspect?: [number, number];
  /** Show watermark overlay. Default is false */
  showWatermark?: boolean;
  /** Additional className for the container */
  className?: string;
}

/**
 * CVTemplatePreview - Renders a CV template scaled to fit entirely within its container
 * while maintaining the A4 aspect ratio (210:297).
 * 
 * The component automatically calculates the scale factor based on:
 * - Template dimensions: 800px × 1056px (A4-like proportions)
 * - Container aspect ratio
 * - Available space
 * 
 * Uses CSS transform: scale() with transform-origin: top left to shrink the full-size
 * template into the preview container.
 */
export function CVTemplatePreview({
  data,
  templateId,
  containerAspect = [3, 4],
  showWatermark = false,
  className = "",
}: CVTemplatePreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.25); // Default scale
  
  // A4 dimensions in pixels (at standard 96 DPI)
  // Our templates use max-w-[800px] and min-h-[1056px]
  const TEMPLATE_WIDTH = 800;
  const TEMPLATE_HEIGHT = 1056;
  
  // Calculate optimal scale factor to fit entire template in container
  useEffect(() => {
    const calculateScale = () => {
      if (!containerRef.current) return;
      
      const container = containerRef.current;
      const containerWidth = container.offsetWidth;
      const containerHeight = container.offsetHeight;
      
      if (!containerWidth || !containerHeight) return;
      
      // Calculate scale factors for both dimensions
      const scaleX = containerWidth / TEMPLATE_WIDTH;
      const scaleY = containerHeight / TEMPLATE_HEIGHT;
      
      // Use the smaller scale to ensure entire template fits
      const optimalScale = Math.min(scaleX, scaleY) * 0.95; // 0.95 for some padding
      
      setScale(optimalScale);
    };
    
    // Calculate on mount
    calculateScale();
    
    // Recalculate on window resize
    const resizeObserver = new ResizeObserver(calculateScale);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    
    return () => {
      resizeObserver.disconnect();
    };
  }, []);
  
  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden bg-white ${className}`}
      style={{
        aspectRatio: `${containerAspect[0]} / ${containerAspect[1]}`,
      }}
      data-testid={`preview-template-${templateId}`}
    >
      {/* Scaled template container */}
      <div
        className="absolute top-0 left-0"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'top left',
          width: `${TEMPLATE_WIDTH}px`,
          height: `${TEMPLATE_HEIGHT}px`,
        }}
      >
        <CVTemplate data={data} templateId={templateId} />
      </div>
      
      {/* Bottom fade gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/10 pointer-events-none" />
      
      {/* Watermark overlay (optional) */}
      {showWatermark && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[5]">
          <div className="transform rotate-[-30deg] opacity-[0.06]">
            <span className="text-4xl font-bold text-foreground whitespace-nowrap">
              Kiyuhub Preview
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
