declare module "dom-to-image-more" {
  interface Options {
    quality?: number;
    scale?: number;
    bgcolor?: string;
    width?: number;
    height?: number;
    style?: Partial<CSSStyleDeclaration>;
  }

  function toBlob(node: HTMLElement, options?: Options): Promise<Blob>;
  function toPng(node: HTMLElement, options?: Options): Promise<string>;
  function toJpeg(node: HTMLElement, options?: Options): Promise<string>;
  function toSvg(node: HTMLElement, options?: Options): Promise<string>;

  export default { toBlob, toPng, toJpeg, toSvg };
}
