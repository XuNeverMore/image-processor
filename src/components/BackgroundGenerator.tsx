'use client';

import { useEffect, useRef, useState } from 'react';

const MODES = { solid: '纯色', gradient: '渐变色', checker: '棋盘格' } as const;
const DIRECTIONS = { horizontal: '从左到右', vertical: '从上到下', diagonal: '左上到右下', reverse: '左下到右上' } as const;

type BackgroundMode = keyof typeof MODES;
type GradientDirection = keyof typeof DIRECTIONS;

interface Props {
  onGenerate: (dataUrl: string, label: string, size: { width: number; height: number }) => void;
  onPreview?: (dataUrl: string, label: string, size: { width: number; height: number }) => void;
}

const inputClass = 'mt-2 w-full border border-white/10 bg-[#101416] px-2 py-2 text-sm text-white outline-none focus:border-[#ceff57]';

export default function BackgroundGenerator({ onGenerate, onPreview }: Props) {
  const [mode, setMode] = useState<BackgroundMode>('solid');
  const [firstColor, setFirstColor] = useState('#173042');
  const [secondColor, setSecondColor] = useState('#ceff57');
  const [direction, setDirection] = useState<GradientDirection>('diagonal');
  const [cellSize, setCellSize] = useState(40);
  const [width, setWidth] = useState('1200');
  const [height, setHeight] = useState('630');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const outputWidth = Number(width);
  const outputHeight = Number(height);
  const validSize = [outputWidth, outputHeight].every((value) => Number.isInteger(value) && value >= 1 && value <= 3000);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !validSize) return;
    canvas.width = outputWidth;
    canvas.height = outputHeight;
    const context = canvas.getContext('2d');
    if (!context) return;
    context.fillStyle = firstColor;
    context.fillRect(0, 0, outputWidth, outputHeight);

    if (mode === 'gradient') {
      const points: Record<GradientDirection, [number, number, number, number]> = {
        horizontal: [0, 0, outputWidth, 0],
        vertical: [0, 0, 0, outputHeight],
        diagonal: [0, 0, outputWidth, outputHeight],
        reverse: [0, outputHeight, outputWidth, 0],
      };
      const gradient = context.createLinearGradient(...points[direction]);
      gradient.addColorStop(0, firstColor);
      gradient.addColorStop(1, secondColor);
      context.fillStyle = gradient;
      context.fillRect(0, 0, outputWidth, outputHeight);
    } else if (mode === 'checker') {
      context.fillStyle = secondColor;
      for (let row = 0; row * cellSize < outputHeight; row++) {
        for (let column = 0; column * cellSize < outputWidth; column++) {
          if ((row + column) % 2 === 1) {
            context.fillRect(column * cellSize, row * cellSize, cellSize, cellSize);
          }
        }
      }
    }
    onPreview?.(canvas.toDataURL('image/png'), `${MODES[mode]}背景 ${outputWidth} × ${outputHeight}`, { width: outputWidth, height: outputHeight });
  }, [mode, firstColor, secondColor, direction, cellSize, outputWidth, outputHeight, validSize, onPreview]);

  function generate() {
    const canvas = canvasRef.current;
    if (!canvas || !validSize) return;
    onGenerate(canvas.toDataURL('image/png'), `${MODES[mode]}背景 ${outputWidth} × ${outputHeight}`, { width: outputWidth, height: outputHeight });
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-serif text-lg text-white">制作背景图</h2>
        <p className="mt-1 text-xs leading-5 text-[#8f998f]">生成一张新背景，可继续处理或撤销。</p>
      </div>
      <div className="grid grid-cols-3 gap-1" aria-label="背景类型">
        {(Object.entries(MODES) as [BackgroundMode, string][]).map(([value, label]) => (
          <button key={value} type="button" aria-pressed={mode === value} onClick={() => setMode(value)} className={`border px-1 py-2 text-xs ${mode === value ? 'border-[#ceff57] bg-[#ceff57]/10 text-[#ceff57]' : 'border-white/10 text-[#a6afa7] hover:border-white/30'}`}>{label}</button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <label className="text-xs text-[#a6afa7]">{mode === 'solid' ? '背景颜色' : mode === 'gradient' ? '起始颜色' : '颜色一'}
          <input type="color" value={firstColor} onChange={(event) => setFirstColor(event.target.value)} className="mt-2 block h-9 w-full cursor-pointer border border-white/10 bg-transparent p-0" />
        </label>
        {mode !== 'solid' && <label className="text-xs text-[#a6afa7]">{mode === 'gradient' ? '结束颜色' : '颜色二'}
          <input type="color" value={secondColor} onChange={(event) => setSecondColor(event.target.value)} className="mt-2 block h-9 w-full cursor-pointer border border-white/10 bg-transparent p-0" />
        </label>}
      </div>
      {mode === 'gradient' && <label className="block text-xs text-[#a6afa7]">渐变方向
        <select value={direction} onChange={(event) => setDirection(event.target.value as GradientDirection)} className={inputClass}>
          {Object.entries(DIRECTIONS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </label>}
      {mode === 'checker' && <label className="block text-xs text-[#a6afa7]">
        <span className="mb-2 flex justify-between"><span>格子大小</span><span className="font-mono text-[#ceff57]">{cellSize}px</span></span>
        <input type="range" min={4} max={200} step={1} value={cellSize} onChange={(event) => setCellSize(Number(event.target.value))} className="w-full" />
      </label>}
      <div className="grid grid-cols-2 gap-3">
        <label className="text-xs text-[#a6afa7]">背景宽度<input type="number" min={1} max={3000} step={1} value={width} onChange={(event) => setWidth(event.target.value)} aria-invalid={!validSize} aria-describedby={!validSize ? 'background-size-error' : undefined} className={inputClass} /></label>
        <label className="text-xs text-[#a6afa7]">背景高度<input type="number" min={1} max={3000} step={1} value={height} onChange={(event) => setHeight(event.target.value)} aria-invalid={!validSize} aria-describedby={!validSize ? 'background-size-error' : undefined} className={inputClass} /></label>
      </div>
      {!validSize && <p id="background-size-error" role="alert" className="text-xs text-amber-300">宽高需为 1–3000 之间的整数。</p>}
      <figure className="border border-white/10 bg-[#101416] p-2">
        <div className="flex h-28 items-center justify-center overflow-hidden">
          <canvas ref={canvasRef} aria-label={`${MODES[mode]}背景预览`} className={`max-h-full max-w-full object-contain ${validSize ? '' : 'opacity-30'}`} />
        </div>
        <figcaption className="mt-2 text-center text-[11px] text-[#8f998f]">{validSize ? '实时预览 · 点击添加后加入处理队列' : '请输入有效尺寸以更新预览'}</figcaption>
      </figure>
      <button type="button" disabled={!validSize} onClick={generate} className="w-full bg-[#ceff57] px-3 py-2.5 text-sm font-semibold text-[#11190e] transition hover:bg-[#e1ff90] disabled:cursor-not-allowed disabled:opacity-35">添加背景图层</button>
    </div>
  );
}
