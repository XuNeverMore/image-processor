'use client';

import { useEffect, useRef, useState } from 'react';

interface Props {
  image: HTMLImageElement | null;
  canvasId?: string;
}

const FONTS = [
  { label: '系统默认', value: 'sans-serif' },
  { label: '宋体', value: 'SimSun, STSong, serif' },
  { label: '黑体', value: 'SimHei, STHeiti, sans-serif' },
  { label: '楷体', value: 'KaiTi, STKaiti, serif' },
  { label: '微软雅黑', value: 'Microsoft YaHei, sans-serif' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: '等宽字体', value: 'monospace' },
];

export default function TextImageGenerator({ image, canvasId }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [text, setText] = useState('Hello World');
  const [textColor, setTextColor] = useState('#ffffff');
  const [fontFamily, setFontFamily] = useState('sans-serif');
  const [fontSize, setFontSize] = useState(48);
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right'>('center');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;
    const draw = () => {
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const context = canvas.getContext('2d');
      if (!context) return;
      context.drawImage(image, 0, 0);
      context.fillStyle = textColor;
      context.font = `600 ${fontSize}px ${fontFamily}`;
      context.textAlign = textAlign;
      context.textBaseline = 'middle';
      context.shadowColor = 'rgba(0, 0, 0, 0.45)';
      context.shadowBlur = Math.max(2, fontSize * 0.08);
      context.shadowOffsetY = Math.max(1, fontSize * 0.04);

      const x = textAlign === 'left' ? fontSize : textAlign === 'right' ? canvas.width - fontSize : canvas.width / 2;
      const lineHeight = fontSize * 1.2;
      const lines = text.split('\n');
      const startY = canvas.height / 2 - ((lines.length - 1) * lineHeight) / 2;
      lines.forEach((line, index) => context.fillText(line || ' ', x, startY + index * lineHeight));
    };
    if (image.complete) draw();
    else image.addEventListener('load', draw, { once: true });
    return () => image.removeEventListener('load', draw);
  }, [fontFamily, fontSize, image, text, textAlign, textColor]);

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <div className="flex items-center justify-center lg:w-1/2">
        <div className="flex min-h-64 w-full items-center justify-center overflow-hidden rounded-lg bg-zinc-900 p-4">
          {image ? <canvas ref={canvasRef} id={canvasId} className="max-h-[500px] max-w-full rounded border border-zinc-700 object-contain" /> : <p className="text-sm text-zinc-500">请先上传一张图片</p>}
        </div>
      </div>

      <div className="flex flex-col gap-4 lg:w-1/2">
        <div>
          <label className="mb-2 block text-sm text-zinc-400">叠加文字</label>
          <textarea value={text} onChange={(event) => setText(event.target.value)} className="w-full resize-none rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-zinc-100 outline-none focus:border-blue-500" rows={3} placeholder="输入要叠加的文字..." />
        </div>
        <div>
          <label className="mb-2 block text-sm text-zinc-400">字体</label>
          <select value={fontFamily} onChange={(event) => setFontFamily(event.target.value)} className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-zinc-100 outline-none focus:border-blue-500">
            {FONTS.map((font) => <option key={font.value} value={font.value}>{font.label}</option>)}
          </select>
        </div>
        <label className="block text-sm text-zinc-400">字号: {fontSize}px<input type="range" min={12} max={200} value={fontSize} onChange={(event) => setFontSize(Number(event.target.value))} className="mt-3 w-full" /></label>
        <div>
          <label className="mb-2 block text-sm text-zinc-400">文字颜色</label>
          <div className="flex items-center gap-2"><input type="color" value={textColor} onChange={(event) => setTextColor(event.target.value)} className="h-10 w-12 cursor-pointer rounded" /><input type="text" value={textColor} onChange={(event) => setTextColor(event.target.value)} className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-zinc-100 outline-none focus:border-blue-500" /></div>
        </div>
        <div>
          <label className="mb-2 block text-sm text-zinc-400">水平对齐</label>
          <div className="flex gap-2">{(['left', 'center', 'right'] as const).map((align) => <button key={align} onClick={() => setTextAlign(align)} className={`flex-1 rounded px-4 py-2 text-sm transition-colors ${textAlign === align ? 'bg-blue-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}>{align === 'left' ? '左对齐' : align === 'center' ? '居中' : '右对齐'}</button>)}</div>
        </div>
        <p className="text-xs text-zinc-500">文字会叠加在当前图片中央，并保留原图尺寸。</p>
      </div>
    </div>
  );
}
