import { computed } from 'vue'
import { useMiscStore } from '~/stores/misc'

export function useOrientation() {
  const miscStore = useMiscStore()

  return {
    isLandscape: computed(() => miscStore.isLandscape),
    isPortrait: computed(() => !miscStore.isLandscape),
  }
}
