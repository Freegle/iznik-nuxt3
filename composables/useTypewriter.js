import { ref, onBeforeUnmount } from 'vue'

/**
 * Composable for typewriter animation with jumping dots
 * @param {string} text - The text to type out
 * @param {object} options - Configuration options
 * @param {number} options.typingSpeed - Speed of typing in ms (default: 80)
 * @param {number} options.dotsDisplayTime - How long to show dots after typing in ms (default: 1500)
 * @param {number} options.maxCycles - Number of times to repeat the animation (default: 3)
 * @param {string} options.finalText - Text to show after animation completes (default: null, shows original text)
 * @returns {object} - displayedText, showDots, animationComplete refs and control functions
 */
export function useTypewriter(text, options = {}) {
  const {
    typingSpeed = 80,
    dotsDisplayTime = 1500,
    maxCycles = 3,
    finalText = null,
  } = options

  const displayedText = ref('')
  const showDots = ref(false)
  const animationComplete = ref(false)

  let typingTimer = null
  let dotsTimer = null
  let cycleCount = 0
  let charIndex = 0

  const typeNextChar = () => {
    if (charIndex < text.length) {
      displayedText.value = text.substring(0, charIndex + 1)
      charIndex++
      typingTimer = setTimeout(typeNextChar, typingSpeed)
    } else {
      // Typing complete, show dots
      showDots.value = true
      dotsTimer = setTimeout(() => {
        showDots.value = false
        cycleCount++

        if (cycleCount < maxCycles) {
          // Reset and start again
          charIndex = 0
          displayedText.value = ''
          typingTimer = setTimeout(typeNextChar, typingSpeed)
        } else {
          // Animation complete
          animationComplete.value = true
          displayedText.value = finalText !== null ? finalText : text
        }
      }, dotsDisplayTime)
    }
  }

  const startAnimation = () => {
    // Reset state
    cycleCount = 0
    charIndex = 0
    displayedText.value = ''
    showDots.value = false
    animationComplete.value = false

    // Start typing
    typingTimer = setTimeout(typeNextChar, typingSpeed)
  }

  const stopAnimation = () => {
    if (typingTimer) {
      clearTimeout(typingTimer)
      typingTimer = null
    }
    if (dotsTimer) {
      clearTimeout(dotsTimer)
      dotsTimer = null
    }
  }

  const resetAnimation = () => {
    stopAnimation()
    displayedText.value = ''
    showDots.value = false
    animationComplete.value = false
    cycleCount = 0
    charIndex = 0
  }

  // Clean up on unmount
  onBeforeUnmount(() => {
    stopAnimation()
  })

  return {
    displayedText,
    showDots,
    animationComplete,
    startAnimation,
    stopAnimation,
    resetAnimation,
  }
}
