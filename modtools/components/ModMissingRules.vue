<template>
  <div>
    <NoticeMessage v-if="newRulesMissing.length" variant="danger">
      <p>
        We are collecting information about which rules groups have - see
        <ExternalLink
          href="https://discourse.ilovefreegle.org/t/collecting-information-about-group-rules/8070"
        >
          here </ExternalLink
        >. We'll use this to help freeglers get things right more often.
      </p>
      <p>
        Based on your feedback, we've added some more rule questions. Please
        respond to each question in Settings which is flagged with
        <span class="text-danger font-weight-bold">New</span>. You can copy the
        rules if you have multiple groups and they are the same.
      </p>
      <a
        v-for="inv of newRulesMissing"
        :key="'fbinvalid-' + inv.id"
        :href="'/settings/' + inv.id"
      >
        Click to add rules for {{ inv.namedisplay }} (missing:
        {{ inv.missing }})<br />
      </a>
    </NoticeMessage>
    <NoticeMessage v-if="invalid.length" variant="danger">
      <div v-if="summary">
        <div>
          <v-icon icon="exclamation-triangle" /> {{ invalid.length }} groups are
          missing group rules. Please add them.
        </div>
        <b-button variant="white" class="mt-2" @click="expand">
          Click to view
        </b-button>
      </div>
      <div v-else>
        <p>
          We are collecting information about which rules groups have - see
          <ExternalLink
            href="https://discourse.ilovefreegle.org/t/collecting-information-about-group-rules/8070"
          >
            here </ExternalLink
          >. We'll use this to help freeglers get things right more often.
          Please go to the <em>Rules</em> section of the group settings and
          respond to each question. You can copy the rules if you have multiple
          groups.
        </p>
        <NuxtLink
          v-for="inv of invalid"
          :key="inv.id"
          :to="'/settings/' + inv.id + '?noguard=true'"
          >Click to add rules for {{ inv.namedisplay }}<br
        /></NuxtLink>
      </div>
    </NoticeMessage>
  </div>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue'
import { useModGroupStore } from '@/stores/modgroup'
import { useMe } from '~/composables/useMe'

const props = defineProps({
  expanded: {
    type: Boolean,
    default: false,
  },
})

const modGroupStore = useModGroupStore()
const { myGroups } = useMe()

const summary = ref(true)

const groups = computed(() => {
  const ret = Object.values(modGroupStore.list)
  return ret
})

const invalid = computed(() => {
  const ret = []
  const mygroups = myGroups.value || [] // myGroups has correct role

  for (const group of groups.value || []) {
    const mygroup = mygroups.find((g) => g.id === group.id)
    if (
      group.type === 'Freegle' &&
      mygroup?.role === 'Owner' &&
      !group.rules &&
      group.publish
    ) {
      ret.push(group)
    }
  }

  return ret
})

const newRulesMissing = computed(() => {
  const ret = []
  const mygroups = myGroups.value || [] // myGroups has correct role

  for (const group of groups.value || []) {
    const mygroup = mygroups.find((g) => g.id === group.id)
    if (
      group.type === 'Freegle' &&
      mygroup?.role === 'Owner' &&
      group.rules &&
      group.publish
    ) {
      const rules = group.rules || []

      // Check if the rules object is missing any values from ['A', 'B', 'C'] or if the values are null
      const newRules = [
        'limitgroups',
        'wastecarrier',
        'carboot',
        'chineselanterns',
        'carseats',
        'pondlife',
        'copyright',
        'porn',
      ]
      const missingRules = []
      for (const newrule of newRules) {
        const rule = rules[newrule]
        if (!(newrule in rules) || typeof rule !== 'boolean')
          missingRules.push(newrule)
      }
      if (missingRules.length > 0) {
        // Take up to 3 missing rules, add an ellipsis if more, convert to a string
        // and push to the ret array
        group.missing =
          missingRules.length > 3
            ? missingRules.slice(0, 3).join(',') + '...'
            : missingRules.slice(0, 3).join(',')
        ret.push(group)
      }
    }
  }

  return ret
})

onMounted(async () => {
  for (const g of myGroups.value || []) {
    await modGroupStore.fetchIfNeedBeMT(g.id)
  }

  if (props.expanded) {
    summary.value = false
  }
})

function expand() {
  summary.value = false
}
</script>
