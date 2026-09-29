'use client';

import { useRef, useEffect, useState } from 'react';

interface Props {
  image: HTMLImageElement;
  canvasId?: string;
}

interface FilterPreset {
  name: string;
  label: string;
  getValue: (intensity: number) => string;
}

const PRESETS: FilterPreset[] = [
  { name: 'grayscale', label: '灰度', getValue: (v) => `grayscale(${v}%)` },
  { name: 'sepia', label: '复古', getValue: (v) => `sepia(${v}%)` },
  { name: 'invert', label: '反转', getValue: (v) => `invert(${v}%)` },
  { name: 'blur', label: '模糊', getValue: (v) => `blur(${(v / 10) * 20}px)` },
  { name: 'brightness', label: '亮度', getValue: (v) => `brightness(${50 + (v / 100) * 150}%)` },
  { name: 'contrast', label: '对比度', getValue: (v) => `contrast(${50 + (v / 100) * 150}%)` },
  { name: 'saturate', label: '饱和度', getValue: (v) => `saturate(${(v / 100) * 300}%)` },
  { name: 'hueRotate', label: '色相旋转', getValue: (v) => `hue-rotate(${(v / 100) * 360}deg)` },
];

export default function ImageFilters({ image, canvasId }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeFilter, setActiveFilter] = useState('grayscale');
  const [intensity, setIntensity] = useState(100);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const preset = PRESETS.find((p) => p.name === activeFilter);
    if (!preset) return;

    ctx.filter = preset.getValue(intensity);
    ctx.drawImage(image, 0, 0);
    ctx.filter = 'none';
  }, [image, activeFilter, intensity]);

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `filtered-${activeFilter}.png`;
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
          className="max-w-full max-h-[500px] object-contain"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {PRESETS.map((preset) => (
          <button
            key={preset.name}
            onClick={() => {
              setActiveFilter(preset.name);
              setIntensity(100);
            }}
            className={`px-3 py-1.5 text-sm rounded transition-colors ${
              activeFilter === preset.name
                ? 'bg-blue-600 text-white'
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <span className="text-sm text-zinc-400 w-16">强度</span>
        <input
          type="range"
          min={0}
          max={100}
          value={intensity}
          onChange={(e) => setIntensity(Number(e.target.value))}
          className="flex-1"
        />
        <span className="text-sm text-zinc-500 w-10 text-right">{intensity}%</span>
      </div>

      <button
        onClick={handleDownload}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm self-start"
      >
        下载滤镜结果
      </button>
    </div>
  );
}
