<template>
  <div class="font-weight-bold">
    ZOOMSTOCK
  </div>
</template>
<script>
import ExternalLink from '@/components/ExternalLink'

const DAY_OF_WEEK = 4
const START = '1400'
const END = '1700'

export default {
  components: { ExternalLink },
  props: {
    colorClass: {
      type: String,
      required: false,
      default: 'text-white'
    }
  },
  data: function() {
    return {
      nextOne: null
    }
  },
  computed: {
    timeNow() {
      return this.$store.getters['misc/time']
        ? this.$dayjs().format('HHmm')
        : ''
    },
    fromNow() {
      return this.$store.getters['misc/time'] && this.nextOne
        ? this.nextOne
        : null
    },
    today() {
      const d = this.$dayjs()
      return d.day() === DAY_OF_WEEK && this.timeNow < START
    },
    now() {
      return (
        this.$dayjs().day() === DAY_OF_WEEK &&
        this.timeNow >= START &&
        this.timeNow <= END
      )
    }
  },
  mounted() {
    /*let d = this.$dayjs()

    if (d.day() < DAY_OF_WEEK) {
      d = d.day(DAY_OF_WEEK)
    } else {
      d = d.add(1, 'week').day(DAY_OF_WEEK)
    }

    this.nextOne = d*/
  }
}
</script>
