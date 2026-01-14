<template>
  <div class="d-flex mt-1 justify-content-between">
    <div class="flex-grow-1">
      <client-only>
        <b-button
          v-if="loggedIn && message.groups && message.groups.length"
          variant="link"
          class="grey p-0 mr-4"
          size="sm"
          @click="report"
        >
          Report this post
        </b-button>
      </client-only>
      <b-button
        variant="link"
        class="p-0 grey"
        title="Share"
        size="sm"
        @click="share"
      >
        Share
      </b-button>
    </div>
    <div
      v-b-tooltip="'Click to view this message in a single page'"
      @click.prevent="goto"
    >
      <b-button
        variant="link"
        class="p-0 text-faded mr-2"
        size="sm"
        :to="'/message/' + message.id"
      >
        <client-only>
          <v-icon icon="hashtag" class="fa-0-8x" />{{ message.id }}
        </client-only>
      </b-button>
    </div>
    <MessageShareModal
      v-if="showShareModal && message.url"
      :id="message.id"
      @hidden="showShareModal = false"
    />
    <MessageReportModal
      v-if="showMessageReportModal"
      :id="id"
      @hidden="showMessageReportModal = false"
    />
  </div>
</template>
<script setup>
import { ref, computed, defineAsyncComponent } from 'vue'
import { useRouter } from '#imports'
import { useMessageStore } from '~/stores/message'
import { useMe } from '~/composables/useMe'

const MessageShareModal = defineAsyncComponent(() =>
  import('./MessageShareModal')
)
const MessageReportModal = defineAsyncComponent(() =>
  import('./MessageReportModal')
)

const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
})

const messageStore = useMessageStore()
const router = useRouter()
const { loggedIn } = useMe()

const showShareModal = ref(false)
const showMessageReportModal = ref(false)

const message = computed(() => {
  return messageStore?.byId(props.id)
})

function share() {
  showShareModal.value = true
}

function report() {
  showMessageReportModal.value = true
}

function goto() {
  console.log('Goto', props.id)
  router.push('/message/' + props.id)
}
</script>
<style scoped lang="scss">
.grey {
  color: $color-gray--base;
}
</style>
