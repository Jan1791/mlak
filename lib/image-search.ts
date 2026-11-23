import type { Product } from "@/lib/catalog";

function loadImage(src: string, crossOrigin = false) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    if (crossOrigin) image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Image illisible"));
    image.src = src;
  });
}

async function colorHistogram(src: string, crossOrigin = false) {
  const image = await loadImage(src, crossOrigin);
  const canvas = document.createElement("canvas");
  canvas.width = 32;
  canvas.height = 32;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) return null;
  context.drawImage(image, 0, 0, 32, 32);
  const pixels = context.getImageData(0, 0, 32, 32).data;
  const bins = 8;
  const histogram = new Array<number>(bins * 3).fill(0);
  let sampled = 0;
  for (let index = 0; index < pixels.length; index += 4) {
    if (pixels[index + 3] < 24) continue;
    histogram[Math.min(bins - 1, Math.floor(pixels[index] / 32))] += 1;
    histogram[bins + Math.min(bins - 1, Math.floor(pixels[index + 1] / 32))] += 1;
    histogram[bins * 2 + Math.min(bins - 1, Math.floor(pixels[index + 2] / 32))] += 1;
    sampled += 1;
  }
  if (!sampled) return null;
  return histogram.map((count) => count / sampled);
}

function similarity(left: number[], right: number[]) {
  const distance = left.reduce((sum, value, index) => sum + Math.abs(value - right[index]), 0);
  return Math.max(0, 1 - distance / 2);
}

export async function findVisualMatches(file: File, products: Product[]) {
  const uploadedUrl = URL.createObjectURL(file);
  try {
    const target = await colorHistogram(uploadedUrl);
    if (!target) return [];
    const results = await Promise.all(products.map(async (product) => {
      try {
        const histogram = await colorHistogram(product.image, /^https?:\/\//.test(product.image));
        return histogram ? { product, score: similarity(target, histogram) } : null;
      } catch {
        return null;
      }
    }));
    return results.filter((item): item is { product: Product; score: number } => Boolean(item))
      .sort((left, right) => right.score - left.score)
      .slice(0, 5);
  } finally {
    URL.revokeObjectURL(uploadedUrl);
  }
}
