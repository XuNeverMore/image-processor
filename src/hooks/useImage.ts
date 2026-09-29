import { useState, useCallback } from 'react';

export function useImage() {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [imageName, setImageName] = useState('');

  const loadImage = useCallback((file: File) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      setImage(img);
      setImageName(file.name);
    };
    img.src = url;
  }, []);

  const loadImageFromDataUrl = useCallback((dataUrl: string, name?: string) => {
    const img = new Image();
    img.onload = () => {
      setImage(img);
      setImageName(name ?? 'processed.png');
    };
    img.src = dataUrl;
  }, []);

  return { image, imageName, loadImage, loadImageFromDataUrl };
}
