'use client';

import Link from 'next/link';
import { useState, useCallback, useEffect } from 'react';
import type { Area } from 'react-easy-crop';
import { useImage } from '@/hooks/useImage';
import ImageUploader from '@/components/ImageUploader';
import ImageCropper from '@/components/ImageCropper';
import ContinueSelector from '@/components/ContinueSelector';
import { getCroppedCanvas } from '@/lib/cropCanvas';

export default function CropPage() {
  const { image, imageName, loadImage, loadImageFromDataUrl } = useImage();
  const [cropArea, setCropArea] = useState<Area | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const dataUrl = sessionStorage.getItem('processed-image');
    if (dataUrl) {
      loadImageFromDataUrl(dataUrl);
      sessionStorage.removeItem('processed-image');
    }
    const frame = requestAnimationFrame(() => setLoaded(true));
    return () => cancelAnimationFrame(frame);
  }, [loadImageFromDataUrl]);

  const handleFile = useCallback(
    (file: File) => {
      sessionStorage.removeItem('processed-image');
      loadImage(file);
    },
    [loadImage]
  );

  const handleCropAreaChange = useCallback((area: Area | null) => {
    setCropArea(area);
  }, []);

  const getCurrentCanvas = useCallback(() => {
    if (!image || !cropArea) return null;
    return getCroppedCanvas(image, cropArea);
  }, [image, cropArea]);

  if (!loaded) return null;

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950">
      <header className="h-14 border-b border-zinc-800 flex items-center px-6 shrink-0 gap-4">
        <Link href="/" className="text-zinc-400 hover:text-zinc-200 transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </Link>
        <h1 className="text-lg font-semibold tracking-tight text-zinc-100">裁剪</h1>
        {imageName && <span className="text-sm text-zinc-500 truncate">{imageName}</span>}
      </header>

      <main className="flex-1 overflow-auto p-6">
        {!image ? (
          <div className="flex items-center justify-center h-full">
            <ImageUploader onImageLoad={handleFile} />
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <ImageCropper image={image} onCropAreaChange={handleCropAreaChange} />
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  const canvas = getCurrentCanvas();
                  if (!canvas) return;
                  canvas.toBlob((blob) => {
                    if (!blob) return;
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'cropped.png';
                    a.click();
                    URL.revokeObjectURL(url);
                  }, 'image/png');
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                下载裁剪结果
              </button>
              <ContinueSelector getCurrentCanvas={getCurrentCanvas} />
            </div>
            {cropArea && (
              <p className="text-xs text-zinc-500">
                裁剪区域: {cropArea.width} × {cropArea.height} px
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
