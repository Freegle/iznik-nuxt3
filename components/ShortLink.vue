<template>
  <div v-if="shortlink.type === 'Group'">
    <b-row class="m-0">
      <b-col cols="4">
        <ExternalLink :href="shortlink.url" class="forcebreak">
          {{ shortlink.nameshort }}
        </ExternalLink>
      </b-col>
      <b-col cols="6">
        <ExternalLink
          :href="'https://freegle.in/' + shortlink.name"
          class="forcebreak"
        >
          {{ 'https://freegle.in/' + shortlink.name }}
        </ExternalLink>
      </b-col>
      <b-col cols="2">
        <b-button
          v-if="!nostats"
          variant="secondary"
          class="mb-1"
          :to="'/shortlinks/' + shortlink.id"
        >
          View Stats
        </b-button>
      </b-col>
    </b-row>
  </div>
</template>
<script>
import { useShortlinkStore } from '../stores/shortlinks'
import ExternalLink from './ExternalLink'

export default {
  components: { ExternalLink },
  props: {
    id: {
      type: Number,
      required: true,
    },
    nostats: {
      type: Boolean,
      default: false,
    },
  },
  setup() {
    const shortlinkStore = useShortlinkStore()

    return {
      shortlinkStore,
    }
  },
  computed: {
    shortlink() {
      return this.shortlinkStore.byId(this.id)
    },
  },
}
</script>
