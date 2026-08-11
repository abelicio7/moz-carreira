import { useEffect, useRef, useState } from "react";

interface Props {
  children: React.ReactNode;
}

export function AutoScalePreview({ children }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = entry.contentRect.width;
        if (width > 0) {
          setScale(width / 794);
        }
      }
    });

    observer.observe(el);

    // Initial scale calculation
    const initialWidth = el.clientWidth;
    if (initialWidth > 0) {
      setScale(initialWidth / 794);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full relative overflow-hidden select-none"
      style={{ aspectRatio: "210 / 297" }}
    >
      <div
        className="printable-cv-wrapper"
        style={{
          width: 794,
          height: 1123,
          position: "absolute",
          top: 0,
          left: 0,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        {children}
      </div>
    </div>
  );
}
