<template>
  <div
    v-if="message"
    :id="'msg-' + id"
    ref="msg"
    v-observe-visibility="{
      callback: visibilityChanged,
      options: {
        observeFullElement: true,
      },
    }"
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
      <MessageExpanded
        :id="message.id"
        :replyable="replyable"
        :hide-close="hideClose"
        :actions="actions"
      />
    </div>
    <div v-else>
      <!-- Modern card summary for all breakpoints -->
      <MessageSummary :id="message.id" :preload="preload" @expand="expand" />
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
      <MessageExpanded
        v-if="showMobileExpanded"
        :id="message.id"
        :replyable="replyable"
        :hide-close="hideClose"
        :actions="actions"
        fullscreen-overlay
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
import { action } from '~/composables/useClientLog'

const MessageExpanded = defineAsyncComponent(() =>
  import('~/components/MessageExpanded')
)
const MessageSummary = defineAsyncComponent(() =>
  import('~/components/MessageSummary')
)
const MessageModal = defineAsyncComponent(() =>
  import('~/components/MessageModal')
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

// Check if mobile/tablet breakpoint - use modern cards for xs/sm/md
const isMobile = computed(() => {
  return (
    miscStore.breakpoint === 'xs' ||
    miscStore.breakpoint === 'sm' ||
    miscStore.breakpoint === 'md'
  )
})

// Refs
const msg = ref(null)
const expanded = ref(false)
const showMobileExpanded = ref(false)
const showImages = ref(false)

// Computed properties
const message = computed(() => {
  return messageStore?.byId(props.id)
})

// Methods
function expand() {
  // Log the expand decision for debugging mobile navigation issues.
  action('message_expand', {
    message_id: props.id,
    is_mobile: isMobile.value,
    breakpoint: miscStore.breakpoint,
    path: isMobile.value ? 'mobile_overlay' : 'desktop_modal',
  })

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
  action('message_mobile_close', {
    message_id: props.id,
  })
  showMobileExpanded.value = false
}

async function view() {
  if (props.recordView) {
    if (me.value && message.value?.unseen) {
      await messageStore.view(props.id)
    }

    emit('view')
  }
}

function visibilityChanged(isVisible) {
  if (isVisible) {
    view()
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
