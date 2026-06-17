export async function captureToBlob(element: HTMLElement): Promise<Blob> {
  await document.fonts.ready;

  const { toBlob } = await import("html-to-image");

  const blob = await toBlob(element, {
    pixelRatio: 2,
    backgroundColor: "#FFFFFF",
    cacheBust: true,
  });

  if (!blob) throw new Error("Capture produced no image");
  return blob;
}

export async function captureElement(element: HTMLElement, filename: string): Promise<void> {
  const blob = await captureToBlob(element);

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
