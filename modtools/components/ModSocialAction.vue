<template>
  <b-card v-if="someleft" no-body>
    <b-card-header>
      <div class="d-flex justify-content-between">
        <div>Share to community Facebook pages</div>
        <div class="small text-muted">
          {{ timeago(item.date) }}
        </div>
      </div>
    </b-card-header>
    <!-- eslint-disable-next-line-->
    <b-card-body v-html="item.iframe" />
    <b-card-footer :key="'sharelist-' + actioned.length">
      <b-button variant="white" class="mb-1 mr-1" @click="shareAll">
        <v-icon icon="share-alt" />
        Share all
      </b-button>
      <b-button
        v-for="group in groups"
        :key="'socialaction-' + group.id"
        :variant="isActioned(group.id) ? 'white' : 'primary'"
        class="mb-1 mr-1"
        :disabled="isActioned(group.id)"
        @click="share(group)"
      >
        <v-icon v-if="isActioned(group.id)" icon="check" />
        <v-icon v-else-if="isBusy(group.id)" icon="sync" class="fa-spin" />
        <v-icon v-else icon="share-alt" />
        {{ group.namedisplay }}
      </b-button>
      <b-button variant="danger" class="mb-1 mr-1" @click="hideAll">
        <v-icon icon="trash-alt" />
        Hide all
      </b-button>
    </b-card-footer>
  </b-card>
</template>
<script setup>
import { ref, computed } from 'vue'
import cloneDeep from 'lodash.clonedeep'
import { usePublicityStore } from '@/stores/publicity'
import { useMe } from '~/composables/useMe'
import { useModMe } from '~/composables/useModMe'

const props = defineProps({
  item: {
    type: Object,
    required: true,
  },
})

const publicityStore = usePublicityStore()
const { myGroups } = useMe()
const { checkWork } = useModMe()

const busy = ref([])
const actioned = ref([])

const groups = computed(() => {
  const ret = []

  // Cloning to avoid some strange issues which cause loops.
  const groupsClone = cloneDeep(myGroups.value)

  props.item.uids.forEach((uid) => {
    for (const group of groupsClone) {
      if (group.type === 'Freegle' && group.facebook) {
        group.facebook.forEach((facebook) => {
          if (parseInt(facebook.uid) === parseInt(uid)) {
            group.facebookuid = facebook.uid
            ret.push(group)
          }
        })
      }
    }
  })

  // Sort so we get the buttons in alphabetical order.
  ret.sort((a, b) => {
    return a.namedisplay
      .toLowerCase()
      .localeCompare(b.namedisplay.toLowerCase())
  })

  return ret
})

const someleft = computed(() => {
  let ret = false

  groups.value.forEach((group) => {
    if (!actioned.value.includes(group.id)) {
      ret = true
    }
  })

  return ret
})

async function share(group) {
  busy.value.push(group.id)

  await publicityStore.share({
    id: props.item.id,
    uid: group.facebookuid,
  })

  busy.value = busy.value.filter((g) => {
    return g.id !== group.id
  })

  actioned.value.push(group.id)
}

async function hideItem(group, noUpdate) {
  busy.value.push(group.id)

  await publicityStore.hide({
    id: props.item.id,
    uid: group.facebookuid,
  })

  busy.value = busy.value.filter((g) => {
    return g.id !== group.id
  })

  actioned.value.push(group.id)

  if (!noUpdate) {
    updateWork()
  }
}

async function shareAll() {
  const promises = []

  groups.value.forEach((group) => {
    if (!actioned.value.includes(group.id)) {
      promises.push(share(group, false))
    }
  })

  await Promise.all(promises)

  updateWork()
}

function hideAll() {
  groups.value.forEach((group) => {
    if (!actioned.value.includes(group.id)) {
      hideItem(group)
    }
  })
}

function isActioned(groupid) {
  return actioned.value.includes(groupid)
}

function isBusy(groupid) {
  return busy.value.includes(groupid)
}

function updateWork() {
  checkWork()
}
</script>
