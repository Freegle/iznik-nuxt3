<template>
  <div class="mobile-visualise">
    <div v-if="items.length >= 4" class="scroll-container">
      <div class="scroll-track" :style="{ animationDuration: scrollDuration }">
        <!-- Double the items for seamless loop -->
        <div
          v-for="(item, index) in [...items, ...items]"
          :key="'item-' + index"
          class="scroll-item"
          @click="goToMessage(item.id)"
        >
          <MessageSummaryMobile
            :id="item.id"
            :show-freegled="false"
            :show-promised="false"
            :preload="true"
          />
        </div>
      </div>
    </div>
    <div v-else-if="loading" class="loading-container">
      <div class="loading-grid">
        <div v-for="i in 4" :key="i" class="loading-card">
          <div class="loading-shimmer"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useMessageStore } from '~/stores/message'
import { useGroupStore } from '~/stores/group'
import MessageSummaryMobile from '~/components/MessageSummaryMobile'

const router = useRouter()
const messageStore = useMessageStore()
const groupStore = useGroupStore()

const items = ref([])
const loading = ref(true)

// Scroll duration based on number of items (slower = smoother)
const scrollDuration = computed(() => {
  return items.value.length * 4 + 's'
})

// Helper to deduplicate by subject line
function dedupeBySubject(offers) {
  const seen = new Set()
  return offers.filter((offer) => {
    const subject = (offer.subject || '').toLowerCase().trim()
    if (seen.has(subject)) return false
    seen.add(subject)
    return true
  })
}

const cachedOffers = messageStore.all.filter(
  (msg) => msg?.type === 'Offer' && msg?.attachments?.length
)

const uniqueCached = dedupeBySubject(cachedOffers)

if (uniqueCached.length >= 8) {
  items.value = uniqueCached.slice(0, 8)
  loading.value = false
} else {
  await groupStore.fetch()

  try {
    const list = await messageStore.fetchInBounds(
      49.45,
      -9,
      61,
      2,
      null,
      50,
      true
    )
    const offers = list.filter((item) => item.type === 'Offer')

    const withPhotos = []
    const preloadPromises = []

    for (const offer of offers.slice(0, 30)) {
      preloadPromises.push(
        messageStore.fetch(offer.id).then(() => {
          const msg = messageStore.byId(offer.id)
          if (msg?.attachments?.length) {
            withPhotos.push(offer)
          }
        })
      )
    }

    await Promise.all(preloadPromises)

    const uniqueWithPhotos = dedupeBySubject(withPhotos)
    items.value = uniqueWithPhotos.slice(0, 8)
    loading.value = false
  } catch (e) {
    console.log('Failed to fetch visualise items', e)
    loading.value = false
  }
}

function goToMessage(id) {
  router.push('/message/' + id)
}
</script>

<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins/_breakpoints';

.mobile-visualise {
  overflow: hidden;
  padding: 0 0.5rem;
  background: white;
}

.scroll-container {
  height: 320px;
  overflow: hidden;
  position: relative;
  mask-image: linear-gradient(
    to bottom,
    transparent 0%,
    black 8%,
    black 92%,
    transparent 100%
  );

  @include media-breakpoint-up(lg) {
    height: 640px;
  }
}

.scroll-track {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  animation: scrollUp linear infinite;
  will-change: transform;
  backface-visibility: hidden;

  @include media-breakpoint-up(lg) {
    grid-template-columns: repeat(3, 1fr);
  }
}

@keyframes scrollUp {
  0% {
    transform: translate3d(0, 0, 0);
  }
  100% {
    transform: translate3d(0, -50%, 0);
  }
}

.scroll-item {
  cursor: pointer;
  border-radius: 2px;
  overflow: hidden;
  transition: transform 0.2s;

  &:active {
    transform: scale(0.98);
  }
}

.loading-container {
  padding: 0;
}

.loading-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;

  @include media-breakpoint-up(lg) {
    grid-template-columns: repeat(3, 1fr);
  }
}

.loading-card {
  aspect-ratio: 1 / 1.15;
  border-radius: 8px;
  overflow: hidden;
  background: $color-gray--lighter;
}

.loading-shimmer {
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    $color-gray--lighter 0%,
    lighten($color-gray--lighter, 3%) 50%,
    $color-gray--lighter 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
