<template>
  <div v-if="newsfeed" class="d-flex align-items-center">
    <SpinButton
      v-if="!newsfeed.loved && newsfeed.userid !== myid"
      variant="link"
      size="sm"
      icon-name="heart"
      done-icon=""
      class="ms-0 me-0 ps-0"
      @handle="love"
    >
      <span class="">Love this</span>
    </SpinButton>
    <SpinButton
      v-if="newsfeed.loved"
      variant="link"
      size="sm"
      icon-name="heart"
      done-icon=""
      icon-class="text-danger"
      class="ms-0 me-0 ps-0"
      @handle="unlove"
    >
      <span class="">Unlove</span>
    </SpinButton>
    <b-button
      v-if="!newsfeed.closed"
      variant="link"
      size="sm"
      @click="focusComment"
    >
      <v-icon icon="comment" /><span class="">&nbsp;Reply</span>
    </b-button>
    <b-button
      v-if="newsfeed.loves"
      variant="link"
      class="showlove ms-0 me-0 ps-0"
      :aria-label="getShowLovesLabel"
      @click="showLove"
    >
      <v-icon icon="heart" class="text-danger" />&nbsp;{{ newsfeed.loves }}
    </b-button>
    <NewsLovesModal
      v-if="showLoveModal"
      :id="newsfeed.id"
      @hidden="showLoveModal = false"
    />
  </div>
</template>
<script setup>
import { defineAsyncComponent, ref, computed } from 'vue'
import pluralize from 'pluralize'
import SpinButton from './SpinButton'
import { useNewsfeedStore } from '~/stores/newsfeed'
import { useMe } from '~/composables/useMe'

const NewsLovesModal = defineAsyncComponent(() => import('./NewsLovesModal'))

const props = defineProps({
  newsfeed: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['focus-comment'])

const newsfeedStore = useNewsfeedStore()
const { myid } = useMe()

const showLoveModal = ref(false)

const getShowLovesLabel = computed(() => {
  return (
    'This comment has ' +
    pluralize('love', props.newsfeed?.loves, true) +
    '. Who loves this?'
  )
})

async function love(callback) {
  await newsfeedStore.love(props.newsfeed.id, props.newsfeed.threadhead)
  callback()
}

async function unlove(callback) {
  await newsfeedStore.unlove(props.newsfeed.id, props.newsfeed.threadhead)
  callback()
}

function focusComment() {
  emit('focus-comment')
}

function showLove() {
  showLoveModal.value = true
}
</script>
<style scoped lang="scss">
.showlove {
  border: none;
  padding: 3px;
}
</style>
