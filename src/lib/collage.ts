export type CollageLayout = "grid" | "horizontal" | "vertical";
export interface CollageSettings {
  layout: CollageLayout;
  columns: number;
  gap: number;
  background: string;
  fit: "cover" | "contain";
}

// Square cells keep mixed portrait and landscape images predictable.
export function collageGeometry(count: number, settings: CollageSettings) {
  if (!Number.isInteger(count) || count < 1 || count > 12)
    throw new Error("请选择 1–12 张图片");
  const columns =
    settings.layout === "horizontal"
      ? count
      : settings.layout === "vertical"
        ? 1
        : Math.min(count, settings.columns);
  const rows = Math.ceil(count / columns);
  const cell = 480;
  return {
    columns,
    rows,
    cell,
    width: columns * cell + (columns + 1) * settings.gap,
    height: rows * cell + (rows + 1) * settings.gap,
  };
}

export function drawCollage(
  images: HTMLImageElement[],
  settings: CollageSettings,
) {
  const { columns, cell, width, height } = collageGeometry(
    images.length,
    settings,
  );
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("无法创建画布，请刷新后重试");
  context.fillStyle = settings.background;
  context.fillRect(0, 0, width, height);
  images.forEach((image, index) => {
    const x = settings.gap + (index % columns) * (cell + settings.gap);
    const y =
      settings.gap + Math.floor(index / columns) * (cell + settings.gap);
    const scale =
      settings.fit === "cover"
        ? Math.max(cell / image.naturalWidth, cell / image.naturalHeight)
        : Math.min(cell / image.naturalWidth, cell / image.naturalHeight);
    const w = image.naturalWidth * scale;
    const h = image.naturalHeight * scale;
    context.save();
    context.beginPath();
    context.rect(x, y, cell, cell);
    context.clip();
    context.drawImage(image, x + (cell - w) / 2, y + (cell - h) / 2, w, h);
    context.restore();
  });
  return canvas;
}
