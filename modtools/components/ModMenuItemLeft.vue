<template>
  <div :class="getClass">
    <!-- eslint-disable-next-line -->
    <span v-if="indent" class="pl-3" /><nuxt-link :to="link" @mousedown.native="click">{{ name }}</nuxt-link>
    <b-badge v-if="count && getCount(count)" :variant="countVariant">
      {{ getCount(count) }}
    </b-badge>
    <b-badge v-if="othercount && getCount(othercount)" variant="info">
      {{ getCount(othercount) }}
    </b-badge>
  </div>
</template>
<script>
import { useAuthStore } from '@/stores/auth'

export default {
  props: {
    link: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    count: {
      type: Array,
      required: false,
      default: null,
    },
    othercount: {
      type: Array,
      required: false,
      default: null,
    },
    countVariant: {
      type: String,
      required: false,
      default: 'danger',
    },
    indent: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  emits: ['mobilehidemenu'],
  computed: {
    work() {
      const authStore = useAuthStore()
      return authStore.work
    },
    getClass() {
      let linkmatch = this.$route.path === this.link
      const linklen = this.link.length
      if (linklen > 1 && this.$route.path.substr(0, linklen) === this.link)
        linkmatch = true
      return 'pl-1 ' + (linkmatch ? 'active' : '')
    },
  },
  methods: {
    getCount(types) {
      let total = 0

      if (types) {
        for (const key in this.work) {
          if (types.includes(key)) {
            total += this.work[key]
          }
        }
      }

      return total
    },
    click(e) {
      if (this.link && e.button === 0) {
        if (this.$route.fullPath === this.link) {
          // Click on current route.  Reload.
          e.stopPropagation()
          this.$router.go()
        } else {
          this.$router.push(this.link)
        }
      }
    },
  },
}
</script>

<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins/_breakpoints';

@include media-breakpoint-down(xs) {
  .badge {
    margin-left: 0.3em;
  }
}

.active {
  background-color: $color-blue--light;

  a {
    color: $color-white;
  }
}
</style>
