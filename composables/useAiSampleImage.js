import { computed } from 'vue'
import { useRuntimeConfig } from '#app'

/**
 * Generate AI sample images using Pollinations.ai
 * Routes through the delivery service for caching and format conversion
 */
export function useAiSampleImage(subject, type) {
  const runtimeConfig = useRuntimeConfig()
  const deliveryUrl = runtimeConfig.public.IMAGE_DELIVERY

  const aiImageUrl = computed(() => {
    if (!subject?.value) return null

    // Extract item name from subject (remove OFFER:/WANTED: prefix and location)
    const itemName = subject.value
      .replace(/^(OFFERED|OFFER|WANTED|REQUESTED):\s*/i, '')
      .replace(/\s*\([^)]+\)\s*$/, '') // Remove location in parentheses
      .trim()

    if (!itemName || itemName.length < 3) return null

    // Build a prompt for Pollinations
    // Keep it simple - just the item name works well
    const prompt = encodeURIComponent(
      `${itemName}, product photo, white background, simple`
    )

    // Pollinations.ai URL - free, no API key needed
    const pollinationsUrl = `https://image.pollinations.ai/prompt/${prompt}?width=400&height=400&seed=${hashCode(
      itemName
    )}`

    // Route through delivery service for caching and webp conversion
    return `${deliveryUrl}/?url=${encodeURIComponent(
      pollinationsUrl
    )}&w=400&h=400&output=webp`
  })

  return {
    aiImageUrl,
  }
}

// Simple hash function to get consistent images for the same item name
function hashCode(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash)
}
