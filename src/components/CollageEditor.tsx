"use client";

import { useEffect, useRef, useState } from "react";
import { drawCollage, type CollageSettings } from "@/lib/collage";

interface Picture {
  id: string;
  name: string;
  image: HTMLImageElement;
}
interface Props {
  currentSource: string | null;
  onPreview: (source: string | null) => void;
  onApply: () => void;
  onPendingChange: (pending: boolean) => void;
}

function decode(source: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("图片无法读取"));
    image.src = source;
  });
}

const fieldClass =
  "mt-2 w-full border border-white/10 bg-[#101416] p-2 text-sm text-white";

export default function CollageEditor({
  currentSource,
  onPreview,
  onApply,
  onPendingChange,
}: Props) {
  const [pictures, setPictures] = useState<Picture[]>([]);
  const [settings, setSettings] = useState<CollageSettings>({
    layout: "grid",
    columns: 2,
    gap: 16,
    background: "#ffffff",
    fit: "cover",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const alive = useRef(true);
  const importing = useRef(false);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      if (busy) return;
      if (!pictures.length) {
        onPreview(null);
        setReady(false);
        onPendingChange(false);
        return;
      }
      try {
        onPreview(
          drawCollage(
            pictures.map((picture) => picture.image),
            settings,
          ).toDataURL("image/png"),
        );
        setReady(true);
      } catch {
        setError("拼图预览失败，请减少图片数量后重试。");
        onPreview(null);
        setReady(false);
      }
      onPendingChange(false);
    });
    return () => cancelAnimationFrame(frame);
  }, [pictures, settings, onPreview, busy, onPendingChange]);

  function invalidate() {
    setReady(false);
    onPreview(null);
    onPendingChange(true);
  }
  async function addPictures(files?: File[]) {
    if (importing.current) return;
    importing.current = true;
    setBusy(true);
    onPendingChange(true);
    setError("");
    const remaining = 12 - pictures.length;
    const sources = files
      ? files.slice(0, remaining)
      : currentSource && remaining > 0
        ? [currentSource]
        : [];
    const results = await Promise.allSettled(
      sources.map(async (source) => {
        const url =
          typeof source === "string" ? source : URL.createObjectURL(source);
        try {
          return {
            id: crypto.randomUUID(),
            name: typeof source === "string" ? "当前画布" : source.name,
            image: await decode(url),
          };
        } finally {
          if (typeof source !== "string") URL.revokeObjectURL(url);
        }
      }),
    );
    importing.current = false;
    if (!alive.current) return;
    const accepted = results.flatMap((result) =>
      result.status === "fulfilled" ? [result.value] : [],
    );
    if (accepted.length) {
      invalidate();
      setPictures((items) => [...items, ...accepted]);
    }
    const messages = [];
    if (files && files.length > remaining)
      messages.push("最多支持 12 张图片，超出部分未添加。");
    if (results.some((result) => result.status === "rejected"))
      messages.push("部分文件无法读取，请选择有效的图片。");
    setError(messages.join(" "));
    setBusy(false);
  }
  function updateSettings(patch: Partial<CollageSettings>) {
    invalidate();
    setSettings((value) => ({ ...value, ...patch }));
  }
  function move(index: number, offset: number) {
    invalidate();
    setPictures((items) => {
      const next = [...items];
      [next[index], next[index + offset]] = [next[index + offset], next[index]];
      return next;
    });
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-serif text-lg text-white">多图拼图</h2>
        <p className="mt-1 text-xs leading-5 text-[#8f998f]">
          最多 12 张，按列表顺序排列。参数即时预览，切换工具后可继续处理。
        </p>
      </div>
      <label className="block text-xs text-[#a6afa7]">
        添加图片（可多选）
        <input
          type="file"
          accept="image/*"
          multiple
          disabled={busy || pictures.length >= 12}
          className={`${fieldClass} text-xs file:mr-2 file:border-0 file:bg-[#ceff57] file:p-1 file:text-[#11190e]`}
          onChange={(event) => {
            const files = Array.from(event.target.files ?? []);
            event.target.value = "";
            if (files.length) void addPictures(files);
          }}
        />
      </label>
      <button
        type="button"
        disabled={!currentSource || busy || pictures.length >= 12}
        onClick={() => void addPictures()}
        className="w-full border border-white/20 p-2 text-xs disabled:opacity-35"
      >
        将当前画布加入拼图
      </button>
      {busy && (
        <p role="status" className="text-xs text-[#ceff57]">
          正在读取图片…
        </p>
      )}
      {error && (
        <p role="alert" className="text-xs text-amber-300">
          {error}
        </p>
      )}
      <ol aria-label="拼图图片顺序" className="space-y-2">
        {pictures.map((picture, index) => (
          <li
            key={picture.id}
            className="flex items-center gap-1 border-b border-white/10 pb-2 text-xs"
          >
            <span className="font-mono text-[#ceff57]">{index + 1}.</span>
            <span className="min-w-0 flex-1 truncate" title={picture.name}>
              {picture.name}
            </span>
            <button
              type="button"
              aria-label={`前移第 ${index + 1} 张图片`}
              disabled={busy || index === 0}
              onClick={() => move(index, -1)}
              className="p-1 disabled:opacity-25"
            >
              ↑
            </button>
            <button
              type="button"
              aria-label={`后移第 ${index + 1} 张图片`}
              disabled={busy || index === pictures.length - 1}
              onClick={() => move(index, 1)}
              className="p-1 disabled:opacity-25"
            >
              ↓
            </button>
            <button
              type="button"
              aria-label={`移除第 ${index + 1} 张图片`}
              disabled={busy}
              onClick={() => {
                invalidate();
                setPictures((items) =>
                  items.filter((item) => item.id !== picture.id),
                );
              }}
              className="p-1 disabled:opacity-25"
            >
              ×
            </button>
          </li>
        ))}
      </ol>
      <label className="block text-xs text-[#a6afa7]">
        拼图布局
        <select
          value={settings.layout}
          onChange={(event) =>
            updateSettings({
              layout: event.target.value as CollageSettings["layout"],
            })
          }
          className={fieldClass}
        >
          <option value="grid">网格</option>
          <option value="horizontal">横向长图</option>
          <option value="vertical">纵向长图</option>
        </select>
      </label>
      {settings.layout === "grid" && (
        <label className="block text-xs text-[#a6afa7]">
          每行图片数
          <select
            value={settings.columns}
            onChange={(event) =>
              updateSettings({ columns: Number(event.target.value) })
            }
            className={fieldClass}
          >
            {[1, 2, 3, 4].map((value) => (
              <option key={value} value={value}>
                {value} 列
              </option>
            ))}
          </select>
        </label>
      )}
      <label className="block text-xs text-[#a6afa7]">
        图片适配
        <select
          value={settings.fit}
          onChange={(event) =>
            updateSettings({
              fit: event.target.value as CollageSettings["fit"],
            })
          }
          className={fieldClass}
        >
          <option value="cover">填满格子（居中裁剪）</option>
          <option value="contain">完整显示（保留留白）</option>
        </select>
      </label>
      <label className="block text-xs text-[#a6afa7]">
        间距与外边距 · {settings.gap}px
        <input
          type="range"
          min={0}
          max={80}
          value={settings.gap}
          onChange={(event) =>
            updateSettings({ gap: Number(event.target.value) })
          }
          className="mt-2 w-full"
        />
      </label>
      <label className="block text-xs text-[#a6afa7]">
        拼图背景色
        <input
          type="color"
          value={settings.background}
          onChange={(event) =>
            updateSettings({ background: event.target.value })
          }
          className="mt-2 h-9 w-full bg-transparent"
        />
      </label>
      <p className="text-xs leading-5 text-[#8f998f]">
        每格 480 × 480 像素，输出尺寸随布局自动调整。
      </p>
      <button
        type="button"
        disabled={!ready || busy}
        onClick={onApply}
        className="w-full bg-[#ceff57] p-2.5 text-sm font-semibold text-[#11190e] disabled:opacity-35"
      >
        应用拼图到画布
      </button>
    </div>
  );
}
