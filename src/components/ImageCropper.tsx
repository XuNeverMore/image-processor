'use client';

import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import type { Area, Point } from 'react-easy-crop';

interface Props {
  image: HTMLImageElement;
  onCropAreaChange?: (area: Area | null) => void;
}

export default function ImageCropper({ image, onCropAreaChange }: Props) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [aspectName, setAspectName] = useState('free');

  const onCropComplete = useCallback(
    (_: Area, croppedAreaPixels: Area) => {
      onCropAreaChange?.(croppedAreaPixels);
    },
    [onCropAreaChange]
  );

  const aspectRatios: Record<string, number | undefined> = {
    free: undefined,
    '1:1': 1,
    '4:3': 4 / 3,
    '16:9': 16 / 9,
    '3:4': 3 / 4,
    '9:16': 9 / 16,
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="relative w-full h-[400px] bg-zinc-900 rounded-lg overflow-hidden">
        <Cropper
          image={image.src}
          crop={crop}
          zoom={zoom}
          aspect={aspectRatios[aspectName]}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropComplete}
        />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-zinc-400">比例</span>
          <div className="flex gap-1">
            {Object.keys(aspectRatios).map((key) => (
              <button
                key={key}
                onClick={() => setAspectName(key)}
                className={`px-3 py-1 text-sm rounded transition-colors ${
                  aspectName === key
                    ? 'bg-blue-600 text-white'
                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                }`}
              >
                {key === 'free' ? '自由' : key}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-zinc-400">缩放</span>
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-32"
          />
          <span className="text-sm text-zinc-500 w-10">{zoom.toFixed(1)}x</span>
        </div>
      </div>
    </div>
  );
}
