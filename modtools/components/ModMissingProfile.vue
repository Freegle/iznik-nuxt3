<template>
  <div>
    <NoticeMessage v-if="missing.length" variant="warning" class="mt-1">
      <div v-if="summary">
        <v-icon icon="exclamation-triangle" />
        {{ pluralise(['group is', 'groups are'], missing.length, true) }}
        missing taglines or profile pictures.
        <b-button variant="white" @click="expand"> Click to view </b-button>
      </div>
      <div v-else>
        <p>
          Groups can have a profile picture and a tagline, which are used in
          emails and on the site to help give your group a local feel.
        </p>
        <p>Please add them from <em>Settings->Community->How It Looks</em>.</p>
        <div v-for="inv of missing" :key="'fbmissing-' + inv.group.id">
          <strong>{{ inv.group.namedisplay }}</strong>
        </div>
      </div>
    </NoticeMessage>
  </div>
</template>

<script>
import { pluralise } from '~/composables/usePluralise'

export default {
  data: function () {
    return {
      summary: true,
    }
  },
  computed: {
    missing() {
      const ret = []

      for (const group of this.myGroups) {
        if (
          group.type === 'Freegle' &&
          (group.role === 'Moderator' || group.role === 'Owner') &&
          group.publish &&
          (!group.tagline || !group.profile)
        ) {
          ret.push({
            group,
          })
        }
      }

      return ret
    },
  },
  methods: {
    expand() {
      this.summary = false
    },
  },
}
</script>
