/**
 * Blur detection using Laplacian variance method
 * Based on Revolut's approach: https://medium.com/revolut/canvas-based-javascript-blur-detection-b92ab1075acf
 *
 * The Laplacian operator highlights regions of rapid intensity change (edges).
 * Blurred images have smoother transitions, resulting in lower variance of Laplacian values.
 */

// Thresholds for blur detection (higher = sharper)
export const BlurThresholds = {
  SHARP: 500, // Very sharp image
  ACCEPTABLE: 200, // Acceptable quality
  WARNING: 100, // Warn user (blurry)
  CRITICAL: 50, // Strong warning (very blurry)
}

/**
 * Convert image data to grayscale using luminosity method
 * @param {ImageData} imageData - Canvas image data
 * @returns {Uint8Array} - Grayscale pixel values
 */
function toGrayscale(imageData) {
  const data = imageData.data
  const gray = new Uint8Array(data.length / 4)

  for (let i = 0; i < data.length; i += 4) {
    // Luminosity method (matches human perception)
    gray[i / 4] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
  }

  return gray
}

/**
 * Apply Laplacian operator to detect edges
 * Laplacian kernel:
 * [ 0  1  0 ]
 * [ 1 -4  1 ]
 * [ 0  1  0 ]
 *
 * @param {Uint8Array} gray - Grayscale pixel values
 * @param {number} width - Image width
 * @param {number} height - Image height
 * @returns {Float32Array} - Laplacian values
 */
function applyLaplacian(gray, width, height) {
  const result = new Float32Array(gray.length)

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const i = y * width + x

      const laplacian =
        -4 * gray[i] +
        gray[i - width] + // top
        gray[i + width] + // bottom
        gray[i - 1] + // left
        gray[i + 1] // right

      result[i] = laplacian
    }
  }

  return result
}

/**
 * Calculate variance of an array
 * @param {Float32Array} data - Numeric values
 * @returns {number} - Variance
 */
function calculateVariance(data) {
  // Calculate mean
  let sum = 0
  for (let i = 0; i < data.length; i++) {
    sum += data[i]
  }
  const mean = sum / data.length

  // Calculate variance
  let variance = 0
  for (let i = 0; i < data.length; i++) {
    variance += Math.pow(data[i] - mean, 2)
  }
  variance = variance / data.length

  return variance
}

/**
 * Analyze image for blur using Laplacian variance method
 * @param {HTMLImageElement|HTMLCanvasElement|string} image - Image to analyze (element or data URL)
 * @param {number} sampleSize - Size to resize image for analysis (default: 256, smaller = faster)
 * @returns {Promise<number>} - Blur score (higher = sharper)
 */
export async function analyzeBlur(image, sampleSize = 256) {
  // If image is a string (data URL or blob URL), create an Image element
  let img = image
  if (typeof image === 'string') {
    img = await loadImageFromUrl(image)
  }

  // Create canvas and resize for faster processing
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  // Maintain aspect ratio while resizing
  const scale = Math.min(sampleSize / img.width, sampleSize / img.height)
  canvas.width = Math.floor(img.width * scale)
  canvas.height = Math.floor(img.height * scale)

  // Draw image to canvas
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

  // Get pixel data
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

  // Convert to grayscale
  const gray = toGrayscale(imageData)

  // Apply Laplacian operator
  const laplacian = applyLaplacian(gray, canvas.width, canvas.height)

  // Calculate variance (blur score)
  const variance = calculateVariance(laplacian)

  return variance
}

/**
 * Load image from URL (data URL or blob URL)
 * @param {string} url - Image URL
 * @returns {Promise<HTMLImageElement>} - Loaded image element
 */
function loadImageFromUrl(url) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = url
  })
}

/**
 * Determine if image needs a blur warning
 * @param {number} score - Blur score from analyzeBlur
 * @returns {Object} - Warning info { warn: boolean, severity: string, message: string }
 */
export function shouldWarnBlur(score) {
  if (score < BlurThresholds.CRITICAL) {
    return {
      warn: true,
      severity: 'critical',
      message: 'This photo is very blurry',
    }
  } else if (score < BlurThresholds.WARNING) {
    return {
      warn: true,
      severity: 'warning',
      message: 'This photo appears slightly blurry',
    }
  } else if (score < BlurThresholds.ACCEPTABLE) {
    return {
      warn: true,
      severity: 'info',
      message: 'Photo clarity could be better',
    }
  }
  return {
    warn: false,
    severity: 'none',
    message: 'Photo is clear',
  }
}

/**
 * Composable for blur detection
 */
export function useBlurDetector() {
  return {
    analyzeBlur,
    shouldWarnBlur,
    BlurThresholds,
  }
}
