<template>
  <span class="d-inline-block">
    <b-button
      :size="size"
      :variant="variant"
      :class="className"
      @click="confirm"
    >
      Join {{ name }}
    </b-button>
    <ConfirmModal
      v-if="showConfirm"
      :title="'Join ' + name + '?'"
      message="You'll get emails with posts from this community, and you'll be able to reply to things you're interested in."
      @confirm="confirmed"
      @hidden="showConfirm = false"
    />
  </span>
</template>
<script setup>
import { ref, defineAsyncComponent } from 'vue'
import { useRouter } from '#imports'
const ConfirmModal = defineAsyncComponent(() => import('./ConfirmModal'))

const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  size: {
    type: String,
    required: false,
    default: 'md',
  },
  variant: {
    type: String,
    required: true,
  },
  className: {
    type: String,
    required: false,
    default: 'm-1',
  },
})

const router = useRouter()
const showConfirm = ref(false)

function confirm() {
  showConfirm.value = true
}

function confirmed() {
  router.push('/explore/join/' + props.id)
}
</script>
