# Smart Crop Demo

## Installation and Usage

1. `brew install cmake`
2. `yarn install` (this will take some time to compile OpenCV)
3. Add images to the `images/input` folder
4. `yarn start`
5. Wait for crops to be generated
6. Open the `images/index.html` file in a browser.

## Next Steps

- Use a 2/3 smallest dimension crop square so the algorithm can move the crop location up and down in the source image
- See about getting face match scores and setting different weights for the face region boosts in the face-detection crop
- See about adjusting the face detection to better match faces. Some obvious faces are not matched and some images that are not faces are matched by mistake. This will require learning more about OpenCV.
