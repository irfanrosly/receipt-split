export async function captureElement(element: HTMLElement, filename: string): Promise<void> {
  await document.fonts.ready;

  const domtoimage = await import("dom-to-image-more");

  const blob = await domtoimage.default.toBlob(element, {
    quality: 1,
    scale: 2,
    bgcolor: "#FFFFFF",
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
