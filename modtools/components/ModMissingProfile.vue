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

<script setup>
import { ref, computed } from 'vue'
import { useMe } from '~/composables/useMe'

const { myGroups } = useMe()

const summary = ref(true)

const missing = computed(() => {
  const ret = []

  for (const group of myGroups.value || []) {
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
})

function expand() {
  summary.value = false
}
</script>
