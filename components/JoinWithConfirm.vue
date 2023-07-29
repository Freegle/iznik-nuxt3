<template>
  <div>
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
      ref="joinConfirm"
      :title="'Join ' + name + '?'"
      message="You'll get emails with posts from this community, and you'll be able to reply to things you're interested in."
      @confirm="confirmed"
    />
  </div>
</template>
<script>
import { useRouter } from '#imports'

const ConfirmModal = () => import('./ConfirmModal')

export default {
  components: { ConfirmModal },

  props: {
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
  },
  data() {
    return {
      showConfirm: false,
    }
  },
  methods: {
    async confirm() {
      this.showConfirm = true
      await this.waitForRef('joinConfirm')
      this.$refs.joinConfirm?.show()
    },
    confirmed() {
      const router = useRouter()
      router.push('/explore/join/' + this.id)
    },
  },
}
</script>
