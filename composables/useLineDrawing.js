import { ref, watch } from 'vue'

export function useLineDrawing(subjectRef) {
  const lineDrawingUrl = ref(null)

  // Extract item name from subject (remove OFFER/WANTED prefix and location)
  function extractItemName(subject) {
    if (!subject) return null

    // Remove common prefixes
    let item = subject.replace(/^(OFFER|WANTED|TAKEN|RECEIVED):\s*/i, '').trim()

    // Remove location suffix (text after last hyphen or parentheses)
    item = item.replace(/\s*[-–]\s*[^-–]+$/, '').trim()
    item = item.replace(/\s*\([^)]+\)\s*$/, '').trim()

    // Limit to first few words for cleaner prompt
    const words = item.split(/\s+/)
    if (words.length > 4) {
      item = words.slice(0, 4).join(' ')
    }

    return item || null
  }

  watch(
    subjectRef,
    (subject) => {
      const item = extractItemName(subject)
      if (item) {
        // Use Pollinations.ai for free AI image generation
        // Request a simple line drawing style
        const prompt = encodeURIComponent(
          `friendly cartoon dark green line drawing on white background, simple sketch of ${item}, minimal shading, cute style`
        )
        lineDrawingUrl.value = `https://image.pollinations.ai/prompt/${prompt}?width=400&height=400&nologo=true`
      } else {
        lineDrawingUrl.value = null
      }
    },
    { immediate: true }
  )

  return {
    lineDrawingUrl,
  }
}
