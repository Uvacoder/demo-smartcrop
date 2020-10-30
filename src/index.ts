import cv from 'opencv4nodejs';
import smartcrop, { Crop, CropScore } from 'smartcrop-sharp';
import { promises as fs } from 'fs';
import sharp, { Sharp } from 'sharp';
import { getHtml } from './getHtml';

type CropResult = [Sharp, CropScore | undefined, boolean];

function crop(image: Sharp, crop: Pick<Crop, 'x' | 'y' | 'width' | 'height'>) {
  return image.extract({
    top: crop.y,
    left: crop.x,
    width: crop.width,
    height: crop.height,
  });
}

async function getDimensions(
  image: Sharp
): Promise<{ width: number; height: number }> {
  const metadata = await image.metadata();
  if (metadata.width !== undefined && metadata.height !== undefined) {
    return {
      width: metadata.width,
      height: metadata.height,
    };
  }
  throw new Error('Could not get image width and height.');
}

async function cropSmartThirds(fileName: string): Promise<CropResult> {
  const image = sharp(fileName);
  const dimensions = await getDimensions(image);

  const shortestDimension = Math.min(dimensions.width, dimensions.height);
  const { topCrop } = await smartcrop.crop(fileName, {
    width: shortestDimension,
    height: shortestDimension,
    ruleOfThirds: true,
  });

  return [crop(image, topCrop), topCrop.score, false];
}

async function cropCenter(fileName: string): Promise<CropResult> {
  const image = sharp(fileName);
  const dimensions = await getDimensions(image);
  const shortestDimension = Math.min(dimensions.width, dimensions.height);

  return [
    crop(image, {
      x: Math.floor((dimensions.width - shortestDimension) / 2),
      y: Math.floor((dimensions.height - shortestDimension) / 2),
      width: shortestDimension,
      height: shortestDimension,
    }),
    undefined,
    false,
  ];
}

async function cropSmart(fileName: string): Promise<CropResult> {
  const image = sharp(fileName);
  const dimensions = await getDimensions(image);

  const shortestDimension = Math.min(dimensions.width, dimensions.height);
  const { topCrop } = await smartcrop.crop(fileName, {
    width: shortestDimension,
    height: shortestDimension,
    ruleOfThirds: false,
  });

  return [crop(image, topCrop), topCrop.score, false];
}

async function cropFaces(fileName: string): Promise<CropResult> {
  const image = sharp(fileName);
  const dimensions = await getDimensions(image);

  const classifier = new cv.CascadeClassifier(cv.HAAR_FRONTALFACE_ALT2);
  const img = await cv.imreadAsync(fileName);
  const grayImg = await img.bgrToGrayAsync();
  const { objects: faces } = await classifier.detectMultiScaleAsync(grayImg);

  const boost = faces.map((face) => ({
    x: face.x,
    y: face.y,
    width: face.width,
    height: face.height,
    weight: 1.0,
  }));

  const shortestDimension = Math.min(dimensions.width, dimensions.height);
  const { topCrop } = await smartcrop.crop(fileName, {
    width: shortestDimension,
    height: shortestDimension,
    ruleOfThirds: false,
    boost,
  });

  return [crop(image, topCrop), topCrop.score, faces.length > 0];
}

async function main() {
  const files = await fs.readdir('images/input');
  const data = await Promise.all(
    files.map(async (file) => {
      const inputFileName = `images/input/${file}`;

      const outputs = [
        {
          id: 'center',
          cropMethod: cropCenter,
        },
        {
          id: 'smart',
          cropMethod: cropSmart,
        },
        {
          id: 'smart-thirds',
          cropMethod: cropSmartThirds,
        },
        {
          id: 'smart-faces',
          cropMethod: cropFaces,
        },
      ];

      return {
        file,
        scores: await Promise.all(
          outputs.map(async ({ id, cropMethod }) => {
            const outputFileName = `images/output-${id}/${file}`;
            try {
              const [image, score, faces] = await cropMethod(inputFileName);
              const adjustedScore = Math.floor((score?.total || 0) * 10000000);
              await image.toFile(outputFileName);
              return { id, score: adjustedScore, faces };
            } catch (e) {
              // ignore errors processing images
              return { id, score: 0, faces: false };
            }
          })
        ),
      };
    })
  );

  const html = getHtml(data);
  await fs.writeFile('images/index.html', html);
}

main();
