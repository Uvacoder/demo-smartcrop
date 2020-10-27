// From https://github.com/jwagner/smartcrop.js/pull/100/
declare module 'smartcrop-sharp' {
  export interface Crop {
    x: number;
    y: number;
    width: number;
    height: number;
  }
  export interface CropResult {
    topCrop: Crop;
  }
  export interface CropBoost {
    x: number;
    y: number;
    width: number;
    height: number;
    weight: number;
  }
  export interface CropOptions {
    minScale?: number;
    width: number;
    height: number;
    boost?: CropBoost[];
    ruleOfThirds?: boolean;
    debug?: boolean;
  }
  export const smartcrop: {
    crop(image: CanvasImageSource, options: CropOptions): Promise<CropResult>;
  };
  export default smartcrop;
}
