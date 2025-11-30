/**
 * Brightness/lighting detection using histogram analysis
 *
 * Analyzes the brightness distribution of an image to detect
 * lighting issues (too dark, too bright, low contrast).
 */

// Thresholds for brightness detection (0-255 scale)
export const BrightnessThresholds = {
  VERY_DARK: 40, // Critical - unacceptable
  TOO_DARK: 80, // Warning - poor quality
  ACCEPTABLE: 100, // Minimum acceptable
  OPTIMAL_MIN: 120, // Optimal range start
  OPTIMAL_MAX: 180, // Optimal range end
  TOO_BRIGHT: 220, // Overexposed
}

// Minimum contrast (standard deviation) for acceptable images
export const ContrastThreshold = {
  LOW: 25, // Very low contrast - image appears washed out
  ACCEPTABLE: 40, // Minimum acceptable contrast
}

/**
 * Analyze image brightness and contrast
 * @param {HTMLImageElement|HTMLCanvasElement|string} image - Image to analyze (element or data URL)
 * @param {number} sampleSize - Size to resize for analysis (default: 128, smaller = faster)
 * @returns {Promise<Object>} - Brightness analysis results
 */
export async function analyzeBrightness(image, sampleSize = 128) {
  // If image is a string (data URL or blob URL), create an Image element
  let img = image
  if (typeof image === 'string') {
    img = await loadImageFromUrl(image)
  }

  // Create canvas and resize
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  const scale = Math.min(sampleSize / img.width, sampleSize / img.height)
  canvas.width = Math.floor(img.width * scale)
  canvas.height = Math.floor(img.height * scale)

  ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

  // Get pixel data
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const pixels = imageData.data

  // Calculate brightness histogram and statistics
  const histogram = new Array(256).fill(0)
  let sum = 0
  let count = 0

  for (let i = 0; i < pixels.length; i += 4) {
    // Calculate brightness using luminosity method
    const brightness = Math.round(
      0.299 * pixels[i] + 0.587 * pixels[i + 1] + 0.114 * pixels[i + 2]
    )
    histogram[brightness]++
    sum += brightness
    count++
  }

  const average = sum / count

  // Calculate standard deviation for contrast measurement
  let varianceSum = 0
  for (let i = 0; i < pixels.length; i += 4) {
    const brightness =
      0.299 * pixels[i] + 0.587 * pixels[i + 1] + 0.114 * pixels[i + 2]
    varianceSum += Math.pow(brightness - average, 2)
  }
  const stdDev = Math.sqrt(varianceSum / count)

  // Analyze and return results
  return {
    average, // 0-255, average brightness
    contrast: stdDev, // Higher = more contrast
    histogram, // Distribution of brightness values
    analysis: classifyBrightness(average, stdDev),
  }
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
 * Classify image lighting quality
 * @param {number} average - Average brightness (0-255)
 * @param {number} contrast - Standard deviation (contrast measure)
 * @returns {Object} - Classification { quality: string, message: string, severity: string }
 */
function classifyBrightness(average, contrast) {
  // Check for extreme darkness first (most common problem)
  if (average < BrightnessThresholds.VERY_DARK) {
    return {
      quality: 'very_dark',
      message: 'Photo is very dark - try using more light',
      severity: 'critical',
    }
  }

  if (average < BrightnessThresholds.TOO_DARK) {
    return {
      quality: 'dark',
      message: 'Photo is quite dark - better lighting would help',
      severity: 'warning',
    }
  }

  // Check for overexposure
  if (average > BrightnessThresholds.TOO_BRIGHT) {
    return {
      quality: 'overexposed',
      message: 'Photo may be overexposed - try reducing light',
      severity: 'warning',
    }
  }

  // Check for low contrast (washed out image)
  if (contrast < ContrastThreshold.LOW) {
    return {
      quality: 'low_contrast',
      message: 'Photo has low contrast - try better lighting',
      severity: 'info',
    }
  }

  // Good lighting conditions
  if (
    average >= BrightnessThresholds.OPTIMAL_MIN &&
    average <= BrightnessThresholds.OPTIMAL_MAX &&
    contrast >= ContrastThreshold.ACCEPTABLE
  ) {
    return {
      quality: 'good',
      message: 'Photo lighting looks good',
      severity: 'none',
    }
  }

  // Acceptable but not optimal
  return {
    quality: 'acceptable',
    message: 'Photo lighting is acceptable',
    severity: 'none',
  }
}

/**
 * Determine if image needs a brightness/lighting warning
 * @param {Object} analysisResult - Result from analyzeBrightness
 * @returns {Object} - Warning info { warn: boolean, severity: string, message: string }
 */
export function shouldWarnBrightness(analysisResult) {
  const { analysis } = analysisResult

  if (analysis.severity === 'critical' || analysis.severity === 'warning') {
    return {
      warn: true,
      severity: analysis.severity,
      message: analysis.message,
    }
  }

  return {
    warn: false,
    severity: 'none',
    message: analysis.message,
  }
}

/**
 * Composable for brightness detection
 */
export function useBrightnessDetector() {
  return {
    analyzeBrightness,
    shouldWarnBrightness,
    BrightnessThresholds,
    ContrastThreshold,
  }
}
