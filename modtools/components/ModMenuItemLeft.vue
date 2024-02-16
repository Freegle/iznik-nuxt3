<template>
  LEFT
</template>
<script>
export default {
  props: {
    link: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    count: {
      type: Array,
      required: false,
      default: null
    },
    othercount: {
      type: Array,
      required: false,
      default: null
    },
    countVariant: {
      type: String,
      required: false,
      default: 'danger'
    },
    indent: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  computed: {
    work() {
      return this.$store.getters['auth/work']
    },
    getClass() {
      return 'pl-1 ' + (this.$route.path === this.link ? 'active' : '')
    }
  },
  methods: {
    getCount(types) {
      let total = 0

      if (types) {
        for (const key in this.work) {
          if (types.indexOf(key) !== -1) {
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
    }
  }
}
</script>
