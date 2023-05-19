<template>
  <div>
    <p v-if="replytime">
      <v-icon icon="clock" class="fa-fw" />&nbsp;
      <span> Typically replies in {{ replytime }}. </span>
    </p>
    <p v-else>
      <v-icon icon="clock" class="fa-fw" />&nbsp;
      <span> We don't know how long they typically take to reply. </span>
    </p>
  </div>
</template>
<script>
import { useUserStore } from '../stores/user'

export default {
  props: {
    id: {
      type: Number,
      required: true,
    },
  },
  setup(props) {
    const userStore = useUserStore()

    return {
      userStore,
    }
  },
  computed: {
    user() {
      return this.id ? this.userStore?.byId(this.id) : null
    },
    replytime() {
      if (this.user && this.user.info && this.user.info.replytime) {
        let ret
        const secs = this.user.info.replytime

        if (secs < 60) {
          ret = Math.round(secs) + ' second'
        } else if (secs < 60 * 60) {
          ret = Math.round(secs / 60) + ' minute'
        } else if (secs < 24 * 60 * 60) {
          ret = Math.round(secs / 60 / 60) + ' hour'
        } else {
          ret = Math.round(secs / 60 / 60 / 24) + ' day'
        }

        if (ret.indexOf('1 ') !== 0) {
          ret += 's'
        }

        return ret
      }

      return null
    },
  },
}
</script>
