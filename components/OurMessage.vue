<template>
  <div
    v-if="message"
    :id="'msg-' + id"
    ref="msg"
    class="position-relative"
    itemscope
    itemtype="http://schema.org/Product"
  >
    <div
      itemprop="offers"
      itemscope
      itemtype="http://schema.org/Offer"
      class="d-none"
    >
      <meta itemprop="priceCurrency" content="GBP" />
      <span itemprop="price">0</span> |
      <span itemprop="availability">Instock</span>
    </div>
    <div v-if="startExpanded">
      <!-- Mobile-optimized view -->
      <MessageExpandedMobile
        v-if="isMobile"
        :id="message.id"
        :replyable="replyable"
        :hide-close="hideClose"
        :actions="actions"
        @zoom="showPhotosModal"
      />
      <!-- Desktop view -->
      <template v-else>
        <MessageExpanded
          :id="message.id"
          :replyable="replyable"
          :hide-close="hideClose"
          :actions="actions"
          :show-map="true"
          class="bg-white p-2"
          :ad-unit-path="adUnitPath"
          :ad-id="adId"
          @zoom="showPhotosModal"
        />
        <MessagePhotosModal
          v-if="showMessagePhotosModal && message.attachments?.length"
          :id="message.id"
          @hidden="showMessagePhotosModal = false"
        />
      </template>
    </div>
    <div v-else>
      <!-- Mobile-optimized summary -->
      <MessageSummaryMobile
        v-if="isMobile"
        :id="message.id"
        :preload="preload"
        @expand="expand"
      />
      <!-- Desktop summary -->
      <MessageSummary
        v-else
        :id="message.id"
        :expand-button-text="expandButtonText"
        :replyable="replyable"
        :matchedon="matchedon"
        @expand="expand"
      />
      <MessageModal
        v-if="expanded"
        :id="message.id"
        v-model:show-images="showImages"
        :replyable="replyable"
        :hide-close="hideClose"
        :actions="actions"
        @hidden="expanded = false"
      />
      <!-- Mobile full-screen modal (only inserted when clicked) -->
      <MessageExpandedMobile
        v-if="showMobileExpanded"
        :id="message.id"
        :replyable="replyable"
        :hide-close="hideClose"
        :actions="actions"
        is-modal
        @close="closeMobileExpanded"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, defineAsyncComponent, nextTick, onMounted } from 'vue'
import { useMessageStore } from '~/stores/message'
import { useGroupStore } from '~/stores/group'
import { useAuthStore } from '~/stores/auth'
import { useMiscStore } from '~/stores/misc'
import MessageExpanded from '~/components/MessageExpanded'
import MessageSummary from '~/components/MessageSummary'

const MessageExpandedMobile = defineAsyncComponent(() =>
  import('~/components/MessageExpandedMobile')
)
const MessageSummaryMobile = defineAsyncComponent(() =>
  import('~/components/MessageSummaryMobile')
)
const MessageModal = defineAsyncComponent(() =>
  import('~/components/MessageModal')
)
const MessagePhotosModal = defineAsyncComponent(() =>
  import('~/components/MessagePhotosModal')
)

const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
  matchedon: {
    type: Object,
    required: false,
    default: null,
  },
  expandButtonText: {
    type: String,
    required: false,
    default: 'See details and reply',
  },
  startExpanded: {
    type: Boolean,
    required: false,
    default: false,
  },
  hideClose: {
    type: Boolean,
    required: false,
    default: false,
  },
  replyable: {
    type: Boolean,
    required: false,
    default: true,
  },
  actions: {
    type: Boolean,
    required: false,
    default: true,
  },
  recordView: {
    type: Boolean,
    required: true,
  },
  scrollIntoView: {
    type: Boolean,
    required: false,
    default: false,
  },
  adUnitPath: {
    type: String,
    required: false,
    default: null,
  },
  adId: {
    type: String,
    required: false,
    default: null,
  },
  preload: {
    type: Boolean,
    required: false,
    default: false,
  },
})

const emit = defineEmits(['notFound', 'view', 'visible'])

// Stores
const messageStore = useMessageStore()
const groupStore = useGroupStore()
const authStore = useAuthStore()
const miscStore = useMiscStore()
const me = computed(() => authStore.user)

// Check if mobile breakpoint
const isMobile = computed(() => {
  return miscStore.breakpoint === 'xs' || miscStore.breakpoint === 'sm'
})

// Refs
const msg = ref(null)
const expanded = ref(false)
const showMobileExpanded = ref(false)
const showImages = ref(false)
const showMessagePhotosModal = ref(false)

// Computed properties
const message = computed(() => {
  return messageStore?.byId(props.id)
})

// Methods
function expand() {
  if (!message.value?.successful) {
    if (isMobile.value) {
      // Show full-screen modal overlay instead of navigating
      // This preserves the browse page scroll position
      showMobileExpanded.value = true
      view()
    } else {
      expanded.value = true
      view()
    }
  }
}

function closeMobileExpanded() {
  showMobileExpanded.value = false
}

function showPhotosModal() {
  showMessagePhotosModal.value = true
}

async function view() {
  if (props.recordView) {
    if (me.value && message.value?.unseen) {
      await messageStore.view(props.id)
    }

    emit('view')
  }
}

// Initial fetch
try {
  const messageData = await messageStore.fetch(props.id)

  if (messageData) {
    // Get the groups into store too.
    const promises = []
    messageData.groups.forEach((g) => {
      if (!groupStore.get(g.groupid)) {
        try {
          promises.push(groupStore.fetch(g.groupid))
        } catch (e) {
          console.log('Fetch fail', e)
        }
      }
    })

    await Promise.all(promises)
  } else {
    emit('notFound')
  }
} catch (e) {
  emit('notFound')
}

// Lifecycle hooks
onMounted(async () => {
  if (props.startExpanded && message.value) {
    view()
  }

  if (props.scrollIntoView) {
    await nextTick()

    if (msg.value) {
      msg.value.scrollIntoView()
    }
  }
})
</script>
