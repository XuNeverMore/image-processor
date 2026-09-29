'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { useImage } from '@/hooks/useImage';
import ImageUploader from '@/components/ImageUploader';
import TextImageGenerator from '@/components/TextImageGenerator';
import ContinueSelector from '@/components/ContinueSelector';

export default function TextImagePage() {
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

  const getCurrentCanvas = useCallback(() => document.querySelector('#text-image-canvas') as HTMLCanvasElement | null, []);

  const handleFile = useCallback((file: File) => {
    sessionStorage.removeItem('processed-image');
    loadImage(file);
  }, [loadImage]);

  const download = () => {
    const canvas = getCurrentCanvas();
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'text-overlay.png';
      link.click();
      URL.revokeObjectURL(url);
    }, 'image/png');
  };

  if (!loaded) return null;

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950">
      <header className="flex h-14 shrink-0 items-center gap-4 border-b border-zinc-800 px-6">
        <Link href="/" className="text-zinc-400 transition-colors hover:text-zinc-200" aria-label="返回首页">←</Link>
        <h1 className="text-lg font-semibold tracking-tight text-zinc-100">叠加文字</h1>
        {imageName && <span className="truncate text-sm text-zinc-500">{imageName}</span>}
      </header>
      <main className="flex-1 overflow-auto p-6">
        {!image ? <div className="flex h-full items-center justify-center"><ImageUploader onImageLoad={handleFile} /></div> : <div className="flex flex-col gap-4"><TextImageGenerator image={image} canvasId="text-image-canvas" /><div className="flex items-center gap-3"><button onClick={download} className="rounded-lg bg-blue-600 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-700">下载图片</button><ContinueSelector getCurrentCanvas={getCurrentCanvas} /></div></div>}
      </main>
    </div>
  );
}
