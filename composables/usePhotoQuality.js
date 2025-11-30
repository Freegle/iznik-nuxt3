/**
 * Combined photo quality detection
 *
 * Runs blur and brightness checks in parallel for efficiency.
 * Used by the app photo uploader to warn users about poor quality photos.
 */

import { analyzeBlur, shouldWarnBlur } from './useBlurDetector'
import {
  analyzeBrightness,
  shouldWarnBrightness,
} from './useBrightnessDetector'

/**
 * Analyze photo quality (blur and brightness)
 * @param {string} imageUrl - Image URL (data URL or blob URL)
 * @returns {Promise<Object>} - Quality analysis results
 */
export async function analyzePhotoQuality(imageUrl) {
  try {
    // Run blur and brightness analysis in parallel
    const [blurScore, brightnessResult] = await Promise.all([
      analyzeBlur(imageUrl),
      analyzeBrightness(imageUrl),
    ])

    const blurWarning = shouldWarnBlur(blurScore)
    const brightnessWarning = shouldWarnBrightness(brightnessResult)

    // Determine overall quality
    const hasIssues = blurWarning.warn || brightnessWarning.warn

    // Get the most severe warning
    let overallSeverity = 'none'
    const warnings = []

    if (blurWarning.warn) {
      warnings.push({
        type: 'blur',
        ...blurWarning,
      })
      if (
        blurWarning.severity === 'critical' ||
        (blurWarning.severity === 'warning' && overallSeverity !== 'critical')
      ) {
        overallSeverity = blurWarning.severity
      }
    }

    if (brightnessWarning.warn) {
      warnings.push({
        type: 'brightness',
        ...brightnessWarning,
      })
      if (
        brightnessWarning.severity === 'critical' ||
        (brightnessWarning.severity === 'warning' &&
          overallSeverity !== 'critical')
      ) {
        overallSeverity = brightnessWarning.severity
      }
    }

    return {
      hasIssues,
      overallSeverity,
      warnings,
      details: {
        blur: {
          score: blurScore,
          ...blurWarning,
        },
        brightness: {
          average: brightnessResult.average,
          contrast: brightnessResult.contrast,
          ...brightnessWarning,
        },
      },
    }
  } catch (error) {
    console.error('Photo quality analysis failed:', error)
    // Don't block upload if analysis fails
    return {
      hasIssues: false,
      overallSeverity: 'none',
      warnings: [],
      error: error.message,
    }
  }
}

/**
 * Get user-friendly message for quality issues
 * @param {Object} qualityResult - Result from analyzePhotoQuality
 * @returns {Object} - { title: string, message: string, severity: string }
 */
export function getQualityMessage(qualityResult) {
  if (!qualityResult.hasIssues) {
    return {
      title: 'Photo looks good!',
      message: 'Your photo has good clarity and lighting.',
      severity: 'success',
    }
  }

  const { warnings, overallSeverity } = qualityResult

  // Build combined message
  const issues = warnings.map((w) => w.message).join('. ')

  if (overallSeverity === 'critical') {
    return {
      title: 'Photo quality issue',
      message: `${issues}. Items with clear, well-lit photos get more responses. Would you like to retake this photo?`,
      severity: 'critical',
    }
  }

  return {
    title: 'Photo could be better',
    message: `${issues}. Better photos get more responses.`,
    severity: 'warning',
  }
}

/**
 * Composable for photo quality detection
 */
export function usePhotoQuality() {
  return {
    analyzePhotoQuality,
    getQualityMessage,
  }
}
