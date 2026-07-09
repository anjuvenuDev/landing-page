import avatarCss from "./pixelart-to-css.css?raw";

export type PixelSprite = {
  cellSize: number;
  width: number;
  height: number;
  pixels: Array<{
    x: number;
    y: number;
    color: number;
    alpha: number;
  }>;
};

const rgbaPattern = /(\d+)px\s+(\d+)px\s+0\s+0\s+rgba\((\d+),\s*(\d+),\s*(\d+),\s*([0-9.]+)\)/g;

function alphaFromCss(value: string) {
  const alpha = Number(value);
  return alpha > 1 ? alpha / 255 : alpha;
}

export function parseAvatarSprite(): PixelSprite {
  const width = Number(avatarCss.match(/width:\s*(\d+)px/)?.[1] ?? 5);
  const height = Number(avatarCss.match(/height:\s*(\d+)px/)?.[1] ?? width);
  const pixels: PixelSprite["pixels"] = [];
  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = 0;
  let maxY = 0;

  for (const match of avatarCss.matchAll(rgbaPattern)) {
    const [, xValue, yValue, redValue, greenValue, blueValue, alphaValue] = match;
    const alpha = alphaFromCss(alphaValue);

    if (alpha <= 0) continue;

    const x = Number(xValue);
    const y = Number(yValue);
    const red = Number(redValue);
    const green = Number(greenValue);
    const blue = Number(blueValue);

    pixels.push({
      x,
      y,
      color: (red << 16) + (green << 8) + blue,
      alpha,
    });
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x + width);
    maxY = Math.max(maxY, y + height);
  }

  if (!pixels.length) {
    return {
      cellSize: width,
      width,
      height,
      pixels,
    };
  }

  const offsetX = Number.isFinite(minX) ? minX : 0;
  const offsetY = Number.isFinite(minY) ? minY : 0;

  return {
    cellSize: width,
    width: maxX - offsetX,
    height: maxY - offsetY,
    pixels: pixels.map((pixel) => ({
      ...pixel,
      x: pixel.x - offsetX,
      y: pixel.y - offsetY,
    })),
  };
}
