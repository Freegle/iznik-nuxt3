<template>
  <div class="promised" @click="clicked">
    <div v-if="summary">
      <b-img lazy src="/promised.jpg" class="promised__image" />
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
      <notice-message v-if="!toMe" variant="warning">
        This item has already been promised to someone. You can still reply, but
        you'll probably only get it if someone else drops out.
      </notice-message>
      <notice-message v-else variant="primary">
        This has been promised to you.
      </notice-message>
    </div>
  </div>
</template>
<script setup>
import { computed, ref, onBeforeUnmount } from 'vue'
import NoticeMessage from './NoticeMessage'
import { useMessageStore } from '~/stores/message'
import { useMe } from '~/composables/useMe'

const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
  toMe: {
    type: Boolean,
    required: false,
    default: false,
  },
  summary: {
    type: Boolean,
    required: false,
    default: false,
  },
})

const emit = defineEmits(['click'])

const { myid } = useMe()
const messageStore = useMessageStore()

let scrollHandler = null
const showing = ref(false)

const title = computed(() => {
  if (!props.toMe) {
    return "This item has already been promised to someone. You can still reply, but you'll probably only get it if someone else drops out."
  } else {
    return 'This has been promised to you.'
  }
})

const message = computed(() => {
  return messageStore?.byId(props.id)
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

function clicked() {
  emit('click')
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

.promised__image {
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
