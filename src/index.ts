import smartcrop from 'smartcrop-sharp';
import { promises as fs } from 'fs';
import sharp from 'sharp';

async function main() {
  const files = await fs.readdir('images/input');
  await Promise.all(
    files.map(async (file) => {
      const inputFileName = `images/input/${file}`;
      const outputFileName = `images/output/${file}`;
      const image = sharp(inputFileName);
      const metadata = await image.metadata();
      if (metadata.width && metadata.height) {
        const shortestDimension = Math.min(metadata.width, metadata.height);
        const { topCrop: crop } = await smartcrop.crop(inputFileName, {
          width: shortestDimension,
          height: shortestDimension,
          ruleOfThirds: false,
        });
        await image
          .extract({
            top: crop.y,
            left: crop.x,
            width: crop.width,
            height: crop.height,
          })
          .toFile(outputFileName);
      }
    })
  );
}

main();
