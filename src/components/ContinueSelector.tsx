'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  getCurrentCanvas: () => HTMLCanvasElement | null;
}

const TOOLS = [
  { id: 'crop', label: '裁剪' },
  { id: 'filter', label: '滤镜' },
  { id: 'pixel', label: '像素风' },
  { id: 'text-image', label: '文字生成图片' },
];

export default function ContinueSelector({ getCurrentCanvas }: Props) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (toolId: string) => {
    const canvas = getCurrentCanvas();
    if (!canvas) return;

    const dataUrl = canvas.toDataURL('image/png');
    sessionStorage.setItem('processed-image', dataUrl);
    sessionStorage.setItem('source-tool', window.location.pathname.slice(1));

    router.push(`/${toolId}`);
  };

  const currentTool = typeof window === 'undefined' ? '' : window.location.pathname.slice(1);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2 bg-zinc-800 text-zinc-200 rounded-lg hover:bg-zinc-700 transition-colors text-sm"
      >
        继续处理
        <svg className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-36 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl z-50 overflow-hidden">
          {TOOLS.filter((t) => t.id !== currentTool).map((tool) => (
            <button
              key={tool.id}
              onClick={() => {
                handleSelect(tool.id);
                setOpen(false);
              }}
              className="w-full text-left px-4 py-2.5 text-sm text-zinc-300 hover:bg-zinc-700 hover:text-white transition-colors"
            >
              {tool.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
