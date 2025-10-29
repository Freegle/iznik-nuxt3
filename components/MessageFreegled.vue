<template>
  <div class="freegleg">
    <div v-if="summary">
      <b-img lazy src="/freegled.jpg" class="freegled__image" />
      <b-popover
        v-if="message.fromuser !== myid"
        v-model="showing"
        :content="title"
        placement="top"
        variant="primary"
        triggers="hover"
        :target="'msg-' + id"
        custom-class="primary"
        @shown="shown"
        @hidden="hidden"
      />
    </div>
    <div v-else>
      <notice-message variant="warning">
        This item has already been successfully freegled.
      </notice-message>
    </div>
  </div>
</template>
<script setup>
import { ref, computed, onBeforeUnmount } from 'vue'
import { useMessageStore } from '~/stores/message'
import { useMe } from '~/composables/useMe'

const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
  summary: {
    type: Boolean,
    required: false,
    default: false,
  },
})

const messageStore = useMessageStore()
const { myid } = useMe()

let scrollHandler = null
const showing = ref(false)

const message = computed(() => {
  return messageStore?.byId(props.id)
})

const title = computed(() => {
  let ret = null

  if (message.value.type === 'Offer') {
    ret = 'Yay, someone took it!'
  } else {
    ret = 'Hurray, they got what they were looking for!'
  }

  ret += " Don't forget to Mark your posts as TAKEN/RECEIVED from My Posts."

  return ret
})

function shown() {
  if (!scrollHandler) {
    scrollHandler = window.addEventListener('scroll', handleScroll)
  }
}

function hidden() {
  if (scrollHandler) {
    window.removeEventListener('scroll', handleScroll)
    scrollHandler = null
  }
}

function handleScroll() {
  showing.value = false
}

onBeforeUnmount(() => {
  if (scrollHandler) {
    window.removeEventListener('scroll', scrollHandler)
    scrollHandler = null
  }
})
</script>
<style scoped lang="scss">
@import 'bootstrap/scss/_functions';
@import 'bootstrap/scss/_variables';
@import 'bootstrap/scss/mixins/_breakpoints';

.freegled__image {
  position: absolute;
  z-index: 2;
  transform: rotate(15deg);
  top: 50%;
  left: 50%;

  width: 150px;
  margin-left: -75px;

  @include media-breakpoint-up(md) {
    width: 225px;
    margin-left: -125px;
  }
}
</style>
