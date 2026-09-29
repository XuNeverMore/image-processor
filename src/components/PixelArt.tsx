'use client';

import { useRef, useEffect, useState } from 'react';

interface Props {
  image: HTMLImageElement;
  canvasId?: string;
}

export default function PixelArt({ image, canvasId }: Props) {
  const [pixelSize, setPixelSize] = useState(8);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;

    const pixelSizeVal = parseInt(canvas.dataset.pixelSize || '8');
    const smallW = Math.max(1, Math.floor(image.naturalWidth / pixelSizeVal));
    const smallH = Math.max(1, Math.floor(image.naturalHeight / pixelSizeVal));

    canvas.width = smallW;
    canvas.height = smallH;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(image, 0, 0, smallW, smallH);
  }, [image, pixelSize]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const scale = 10;
    const output = document.createElement('canvas');
    output.width = canvas.width * scale;
    output.height = canvas.height * scale;

    const ctx = output.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(canvas, 0, 0, output.width, output.height);

    output.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'pixel-art.png';
      a.click();
      URL.revokeObjectURL(url);
    }, 'image/png');
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="relative bg-zinc-900 rounded-lg overflow-hidden flex items-center justify-center">
        <canvas
          ref={canvasRef}
          id={canvasId}
          data-pixel-size={pixelSize}
          className="object-contain"
          style={{
            width: '100%',
            height: 'auto',
            maxHeight: '500px',
            imageRendering: 'pixelated',
          }}
        />
      </div>

      <div className="flex items-center gap-3">
        <span className="text-sm text-zinc-400 w-16">像素大小</span>
        <input
          type="range"
          min={2}
          max={32}
          value={pixelSize}
          onChange={(e) => setPixelSize(Number(e.target.value))}
          className="flex-1"
        />
        <span className="text-sm text-zinc-500 w-10 text-right">{pixelSize}px</span>
      </div>

      <button
        onClick={handleDownload}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm self-start"
      >
        下载像素风结果
      </button>
    </div>
  );
}
