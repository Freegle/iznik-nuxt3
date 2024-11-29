<template>
  <div>
    <NoticeMessage v-if="invalid.length" variant="danger">
      <div v-if="summary">
        <div>
          <v-icon name="exclamation-triangle" /> {{ invalid.length }} groups are missing group rules. Please add them.
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
        <div v-for="(inv) of invalid" :key="'fbinvalid-' + inv.id">
          Click to add rules for <nuxt-link :to="'/settings/'"> <!-- TODO: Fix going into community ie + inv.id -->
            {{ inv.namedisplay }}
          </nuxt-link>
        </div>
      </div>
    </NoticeMessage>
  </div>
</template>
<script>
export default {
  data: function () {
    return {
      summary: true
    }
  },
  computed: {
    invalid() {
      const ret = []

      for (const group of this.myGroups) {
        if (
          group.type === 'Freegle' &&
          group.role === 'Owner' &&
          !group.rules &&
          group.publish
        ) {
          ret.push(group)
        }
      }

      return ret
    }
  },
  methods: {
    expand() {
      this.summary = false
    }
  }
}
</script>
