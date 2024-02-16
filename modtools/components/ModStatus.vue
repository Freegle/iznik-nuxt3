<template>
  <span title="Platform Status - click for more info" class="clickme" @click="clicked">
    STATUS
  </span>
</template>
<script>
import NoticeMessage from './NoticeMessage'
export default {
  components: { NoticeMessage },
  data: function() {
    return {
      overall: 'green',
      status: null,
      updated: null,
      show: false,
      tried: false
    }
  },
  computed: {
    outOfDate() {
      // Check if we've managed to get it recently.
      return !this.updated || Date.now() - this.updated >= 1000 * 600
    },
    error() {
      return this.status ? this.status.error : false
    },
    warning() {
      return this.outOfDate || (this.status && this.status.warning)
    },
    fine() {
      return !this.error && !this.warning
    },
    headline() {
      if (this.outOfDate) {
        return 'Not sure'
      } else if (this.warning) {
        return 'Warning'
      } else if (this.error) {
        return 'Error'
      } else {
        return 'Fine'
      }
    }
  },
  mounted() {
    this.checkStatus()
  },
  beforeDestroy() {
    if (this.timer) {
      clearTimeout(this.timer)
    }
  },
  methods: {
    async checkStatus() {
      this.status = await this.$api.status.fetch()

      this.tried = true

      if (this.status.ret === 0) {
        this.updated = Date.now()
      }

      this.timer = setTimeout(this.checkStatus, 30000)
    },
    clicked(e) {
      this.show = true
      e.preventDefault()
      e.stopPropagation()
    }
  }
}
</script>
