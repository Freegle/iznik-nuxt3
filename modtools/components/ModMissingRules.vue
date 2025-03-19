<template>
  <div>
    <NoticeMessage v-if="invalid.length" variant="danger">
      <div v-if="summary">
        <div>
          <v-icon icon="exclamation-triangle" /> {{ invalid.length }} groups are missing group rules. Please add them.
        </div>
        <b-button variant="white" class="mt-2" @click="expand">
          Click to view
        </b-button>
      </div>
      <div v-else>
        <p>
          We are collecting information about which rules groups have - see
          <ExternalLink href="https://discourse.ilovefreegle.org/t/collecting-information-about-group-rules/8070">
            here
          </ExternalLink>.
          We'll use this to help freeglers get things right more often.
          Please go to the <em>Rules</em> section of the group settings and respond to each question. You can
          copy the rules if you have multiple groups.
        </p>
        <NuxtLink v-for="(inv) of invalid" :to="'/settings/' + inv.id + '?noguard=true'">Click to add rules for {{ inv.namedisplay }}<br></NuxtLink>
      </div>
    </NoticeMessage>
  </div>
</template>
<script>
import { useModGroupStore } from '@/stores/modgroup'

export default {
  setup() {
    const modGroupStore = useModGroupStore()
    return {
      modGroupStore,
    }
  },
  props: {
    expanded: {
      type: Boolean,
      default: false
    }
  },
  data: function () {
    return {
      summary: true
    }
  },
  computed: {
    invalid() {
      const ret = []

      for (const group of Object.values(this.modGroupStore.list)) {
        if (
          group.type === 'Freegle' &&
          group.myrole === 'Owner' &&
          !group.rules &&
          group.publish
        ) {
          ret.push(group)
        }
      }

      return ret
    }
  },
  async mounted() {
    for (const g of this.myGroups) {
      await this.modGroupStore.fetchIfNeedBeMT(g.id)
    }

    if (this.expanded) {
      this.summary = false
    }
  },
  methods: {
    expand() {
      this.summary = false
    }
  }
}
</script>
