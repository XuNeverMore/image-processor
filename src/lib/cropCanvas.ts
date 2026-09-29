import type { Area } from 'react-easy-crop';

export function getCroppedCanvas(image: HTMLImageElement, cropArea: Area): HTMLCanvasElement {
  const scaleX = image.naturalWidth / 400;
  const scaleY = image.naturalHeight / 400;

  const canvas = document.createElement('canvas');
  canvas.width = Math.round(cropArea.width * scaleX);
  canvas.height = Math.round(cropArea.height * scaleY);

  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(
    image,
    cropArea.x * scaleX,
    cropArea.y * scaleY,
    cropArea.width * scaleX,
    cropArea.height * scaleY,
    0,
    0,
    canvas.width,
    canvas.height
  );
  return canvas;
}
