<template>
  <b-form-select
    v-model="group"
    :style="(width ? 'width: ' + width + 'px' : '') + '; max-width: 300px;'"
    :options="groupOptions"
  />
</template>
<script setup>
import { computed, onMounted } from 'vue'
import { useComposeStore } from '~/stores/compose'
import { useAuthStore } from '~/stores/auth'
import api from '~/api'
import { useRuntimeConfig } from '#app'

defineProps({
  width: {
    type: Number,
    required: false,
    default: null,
  },
})

const composeStore = useComposeStore()
const authStore = useAuthStore()
const runtimeConfig = useRuntimeConfig()

const postcode = computed(() => {
  return composeStore?.postcode
})

const myGroups = computed(() => {
  console.log('Compute myGroups', authStore.groups)
  return authStore.groups || []
})

const group = computed({
  get() {
    let ret = composeStore?.group

    if (!ret) {
      if (postcode.value?.groupsnear) {
        ret = postcode.value.groupsnear[0].id
      }
    }

    return ret
  },
  set(newVal) {
    composeStore.group = newVal
  },
})

const groupOptions = computed(() => {
  const ret = []
  const ids = {}

  if (postcode.value && postcode.value.groupsnear) {
    for (const group of postcode.value.groupsnear) {
      if (!ids[group.id]) {
        ret.push({
          value: group.id,
          text: group.namedisplay ? group.namedisplay : group.nameshort,
        })

        ids[group.id] = true
      }
    }
  }

  // Add any other groups we are a member of and might want to select.
  for (const group of myGroups.value) {
    if (!ids[group.groupid]) {
      ret.push({
        value: group.groupid,
        text: group.namedisplay ? group.namedisplay : group.nameshort,
      })

      ids[group.groupid] = true
    }
  }

  return ret
})

onMounted(async () => {
  // The postcode we have contains a list of groups. That list might contain groups which are no longer valid,
  // for example if they have been merged. So we want to refetch the postcode so that our store gets updated.
  if (postcode.value) {
    try {
      const location = await api(runtimeConfig).location.typeahead(
        postcode.value.name
      )

      composeStore.postcode = location[0]
    } catch (e) {
      console.error('Failed to fetch postcode', e)
    }
  }

  console.log('Fetch user')
  await authStore.fetchUser()
  console.log('Fetched user', authStore.user, authStore.groups)

  // If we have a postcode with groups but no group selected, auto-select the first one.
  if (postcode.value?.groupsnear?.length && !composeStore.group) {
    console.log('Auto-selecting first group:', postcode.value.groupsnear[0].id)
    composeStore.group = postcode.value.groupsnear[0].id
  }
})
</script>
