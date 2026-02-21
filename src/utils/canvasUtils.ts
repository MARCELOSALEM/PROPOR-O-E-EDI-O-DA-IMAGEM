import * as piexif from 'piexifjs';

export const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', (error) => reject(error))
    image.setAttribute('crossOrigin', 'anonymous')
    image.src = url
  })

export function getRadianAngle(degreeValue: number) {
  return (degreeValue * Math.PI) / 180
}

export function rotateSize(width: number, height: number, rotation: number) {
  const rotRad = getRadianAngle(rotation)

  return {
    width:
      Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height:
      Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  }
}

/**
 * Preserves EXIF metadata from original image to cropped image (JPEG only)
 */
function preserveExif(originalBase64: string, croppedBase64: string): string {
  try {
    if (!croppedBase64.startsWith('data:image/jpeg')) {
      return croppedBase64;
    }

    const exifObj = piexif.load(originalBase64);
    const exifBytes = piexif.dump(exifObj);
    return piexif.insert(exifBytes, croppedBase64);
  } catch (e) {
    console.warn('Could not preserve EXIF metadata:', e);
    return croppedBase64;
  }
}

export default async function getCroppedImg(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number },
  rotation = 0,
  flip = { horizontal: false, vertical: false },
  filters = { brightness: 100, contrast: 100, saturation: 100 },
  exportType = 'image/jpeg'
): Promise<string | null> {
  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    return null
  }

  const rotRad = getRadianAngle(rotation)

  // calculate bounding box of the rotated image
  const { width: bBoxWidth, height: bBoxHeight } = rotateSize(
    image.width,
    image.height,
    rotation
  )

  // set canvas size to match the bounding box
  canvas.width = bBoxWidth
  canvas.height = bBoxHeight

  // translate canvas context to a central location to allow rotating and flipping around the center
  ctx.translate(bBoxWidth / 2, bBoxHeight / 2)
  ctx.rotate(rotRad)
  ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1)
  ctx.translate(-image.width / 2, -image.height / 2)

  // apply filters
  ctx.filter = `brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturation}%)`

  // draw image
  ctx.drawImage(image, 0, 0)

  // Create a second canvas for the final crop
  const cropCanvas = document.createElement('canvas')
  const cropCtx = cropCanvas.getContext('2d')

  if (!cropCtx) {
    return null
  }

  cropCanvas.width = pixelCrop.width
  cropCanvas.height = pixelCrop.height

  // Draw the cropped area from the first canvas to the second
  cropCtx.drawImage(
    canvas,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  )

  // As Base64 string with maximum quality
  const croppedBase64 = cropCanvas.toDataURL(exportType, 1.0);

  // Preserve EXIF if it's a JPEG
  return preserveExif(imageSrc, croppedBase64);
}

