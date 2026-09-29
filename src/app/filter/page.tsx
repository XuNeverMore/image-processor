'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { useImage } from '@/hooks/useImage';
import ImageUploader from '@/components/ImageUploader';
import ImageFilters from '@/components/ImageFilters';
import ContinueSelector from '@/components/ContinueSelector';

export default function FilterPage() {
  const { image, imageName, loadImage, loadImageFromDataUrl } = useImage();
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

  const getCurrentCanvas = useCallback(() => {
    return document.querySelector('#filter-canvas') as HTMLCanvasElement | null;
  }, []);

  if (!loaded) return null;

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950">
      <header className="h-14 border-b border-zinc-800 flex items-center px-6 shrink-0 gap-4">
        <Link href="/" className="text-zinc-400 hover:text-zinc-200 transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </Link>
        <h1 className="text-lg font-semibold tracking-tight text-zinc-100">滤镜</h1>
        {imageName && <span className="text-sm text-zinc-500 truncate">{imageName}</span>}
      </header>

      <main className="flex-1 overflow-auto p-6">
        {!image ? (
          <div className="flex items-center justify-center h-full">
            <ImageUploader onImageLoad={handleFile} />
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <ImageFilters image={image} canvasId="filter-canvas" />
            <ContinueSelector getCurrentCanvas={getCurrentCanvas} />
          </div>
        )}
      </main>
    </div>
  );
}
