<template>
  <b-modal
    :id="'newsLovesModal-' + id"
    ref="modal"
    scrollable
    :title="title"
    no-stacking
  >
    <div v-if="newsfeed" class="p-0">
      <NewsLovesUserInfo
        v-for="love in newsfeed.lovelist"
        :id="love.userid"
        :key="'love-' + love.userid"
        class="mt-2"
      />
    </div>
    <template #footer>
      <b-button variant="white" @click="hide"> Close </b-button>
    </template>
  </b-modal>
</template>

<script setup>
import { computed } from 'vue'
import NewsLovesUserInfo from './NewsLovesUserInfo'
import { useNewsfeedStore } from '~/stores/newsfeed'
import { useOurModal } from '~/composables/useOurModal'

const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
})

const newsfeedStore = useNewsfeedStore()
const { modal, hide } = useOurModal()

// Fetch the newsfeed data with lovers
await newsfeedStore.fetch(props.id, true, true)

const newsfeed = computed(() => {
  return newsfeedStore?.byId(props.id)
})

const title = computed(() => {
  let ret = null

  if (newsfeed.value) {
    ret =
      newsfeed.value.loves +
      ' freegler' +
      (newsfeed.value.loves !== 1 ? 's' : '') +
      ' love' +
      (newsfeed.value.loves === 1 ? 's' : '') +
      ' this'
  }

  return ret
})
</script>
