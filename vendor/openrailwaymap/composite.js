/* Adapted from OpenRailwayMap UI, © Hidde Wieringa; GPL-3.0-or-later. See COPYING. */
function railwayCompositeImages(map) {
async function transposeImageData(context, source) {
  const imageData = context.createImageData(source.data.width, source.data.height);

  for (let i = 0; i < source.data.data.length; i += 4) {
    imageData.data[i] = source.data.data[i]; // Red
    imageData.data[i + 1] = source.data.data[i + 1]; // Green
    imageData.data[i + 2] = source.data.data[i + 2]; // Blue
    imageData.data[i + 3] = source.data.data[i + 3]; // Alpha
  }

  return await createImageBitmap(imageData)
}

function transposeSdfImageData(context, images, width, height) {
  const imageData = context.createImageData(width, height)

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {

      let distanceField = 0;
      for (const image of images) {
        if (
          image.sdfOffset.x <= x && x < image.sdfOffset.x + image.sdfImage.data.width &&
          image.sdfOffset.y <= y && y < image.sdfOffset.y + image.sdfImage.data.height
        ) {
          const imageI = 4 * ((y - image.sdfOffset.y) * image.sdfImage.data.width + (x - image.sdfOffset.x))
          distanceField = Math.max(distanceField, image.sdfImage.data.data[imageI + 3])
        }
      }

      const i = 4 * (y * width + x);
      // Indices 0, 1 and 2 of pixel are unused for SDF images
      imageData.data[i + 3] = distanceField;
    }
  }

  return imageData
}

const imageMatcher = /^(?<id>[^@]+)(@(?<position>center|bottom|top|right|left))?$/
function loadImages(imageIds) {
  return imageIds.map(imageId => {
    const parsed = imageId.match(imageMatcher)
    if (!parsed) {
      throw new Error(`Could not parse image ID '${imageId}'`)
    }

    const id = parsed.groups.id
    const position = parsed.groups.position ?? 'center'

    const image = map.getImage(id)
    if (!image) {
      throw new Error(`Could not load image ${id}`)
    }

    const sdfId = `sdf:${id}`
    const sdfImage = map.getImage(sdfId)
    if (!image) {
      throw new Error(`Could not load SDF image ${sdfId}`)
    }

    return {
      id,
      sdfId,
      image,
      sdfImage,
      position,
    }
  });
}

function layoutImages(images) {
  // Ignore position of first image
  // The width and height will grow as more images are composed
  let width = images[0].image.data.width
  let height = images[0].image.data.height

  // Offset: top left corner of the image
  // The offsets of all but the first image will be updated with their layed out position
  const offsetImages = images.map(image => ({
    ...image,
    offset: {
      x: 0,
      y: 0,
    },
    sdfOffset: null, // Will be filled in the last step
  }))

  // Offset of the top left corner of the composed image
  // Goal: allow expanding the composed image to the top or left without updating the offset of all other images
  // The global offset will be updated as images are added to the top or left of existing images
  const globalOffset = {
    x: 0,
    y: 0,
  }

  for (const image of offsetImages.slice(1)) {
    switch (image.position) {
      case 'center':
        image.offset.x = globalOffset.x + width / 2 - image.image.data.width / 2
        image.offset.y = globalOffset.y + height / 2 - image.image.data.height / 2
        globalOffset.x = Math.min(globalOffset.x, image.offset.x)
        globalOffset.y = Math.min(globalOffset.y, image.offset.y)
        width = Math.max(width, image.image.data.width)
        height = Math.max(height, image.image.data.height)
        break;

      case 'bottom':
        image.offset.x = globalOffset.x + width / 2 - image.image.data.width / 2
        image.offset.y = globalOffset.y + height
        globalOffset.x = Math.min(globalOffset.x, image.offset.x)
        globalOffset.y = Math.min(globalOffset.y, image.offset.y)
        width = Math.max(width, image.image.data.width)
        height = height + image.image.data.height
        break;

      case 'top':
        image.offset.x = globalOffset.x + width / 2 - image.image.data.width / 2
        image.offset.y = globalOffset.y - image.image.data.height
        globalOffset.x = Math.min(globalOffset.x, image.offset.x)
        globalOffset.y = Math.min(globalOffset.y, image.offset.y)
        width = Math.max(width, image.image.data.width)
        height = height + image.image.data.height
        break;

      case 'right':
        image.offset.x = globalOffset.x + width
        image.offset.y = globalOffset.y + height / 2 - image.image.data.height / 2
        globalOffset.x = Math.min(globalOffset.x, image.offset.x)
        globalOffset.y = Math.min(globalOffset.y, image.offset.y)
        width = width + image.image.data.width
        height = Math.max(height, image.image.data.height)
        break;

      case 'left':
        image.offset.x = globalOffset.x - image.image.data.width / 2
        image.offset.y = globalOffset.y + height / 2 - image.image.data.height / 2
        globalOffset.x = Math.min(globalOffset.x, image.offset.x)
        globalOffset.y = Math.min(globalOffset.y, image.offset.y)
        width = width + image.image.data.width
        height = Math.max(height, image.image.data.height)
        break;
    }
  }

  // Process SDF images which are larger than the normal images due to padding pixels
  offsetImages.forEach(image => {
    width = Math.max(width, image.offset.x - globalOffset.x + image.sdfImage.data.width)
    height = Math.max(height, image.offset.y - globalOffset.y + image.sdfImage.data.height)
  })
  offsetImages.forEach(image => {
    globalOffset.x = Math.min(globalOffset.x, image.offset.x + image.image.data.width / 2 - image.sdfImage.data.width / 2)
    globalOffset.y = Math.min(globalOffset.y, image.offset.y + image.image.data.height / 2 - image.sdfImage.data.height / 2)
  })

  // Get rid of global offset
  offsetImages.forEach(image => {
    image.offset.x -= globalOffset.x
    image.offset.y -= globalOffset.y
  })

  // Store the SDF image offset using the SDF image size
  offsetImages.forEach(image => {
    image.sdfOffset = {
      x: Math.floor(image.offset.x + image.image.data.width / 2 - image.sdfImage.data.width / 2),
      y: Math.floor(image.offset.y + image.image.data.height / 2 - image.sdfImage.data.height / 2),
    }
  })

  return {
    width,
    height,
    images: offsetImages
  }
}

/**
 * Given a list of maplibre images, this function merges them into into a single image by composing the images on top of each other.
 */
async function composeImages(imageIds) {
  const loadedImages = loadImages(imageIds)
  const { width, height, images } = layoutImages(loadedImages);

  const canvas = document.createElement("canvas");
  const context = canvas.getContext('2d')
  canvas.width = width;
  canvas.height = height;

  const imageDatas = await Promise.all(images.map(async image => ({
    data: await transposeImageData(context, image.image),
    offset: image.offset,
  })))
  for (const {data, offset} of imageDatas) {
    context.drawImage(data, offset.x, offset.y)
  }
  const renderedImageData = context.getImageData(0, 0, width, height);

  const canvas2 = document.createElement("canvas");
  const context2 = canvas2.getContext('2d')
  canvas2.width = width;
  canvas2.height = height;
  const sdfImageData = transposeSdfImageData(context2, images, width, height)

  return {
    width,
    height,
    imageData: new Uint8Array(renderedImageData.data.buffer),
    sdfImageData: new Uint8Array(sdfImageData.data.buffer),
    pixelRatio: images[0].image.pixelRatio,
  };
}


return composeImages;
}
