<template>
  <div>
    <AutocompleteLocal
      v-model="searchgroup"
      :items="groupitems"
      class="max"
      size="40"
      :placeholder="
        loading ? 'Loading communities...' : 'Start typing a community name...'
      "
      :disabled="loading"
    />
    <div v-if="group && group.url">
      <h3 class="mt-2">
        {{ group.nameshort }}
      </h3>
      <h4
        v-if="
          canonGroupName(group.namedisplay) !== canonGroupName(group.nameshort)
        "
        class="text-muted"
      >
        {{ group.namedisplay }}
      </h4>
      <div class="d-flex">
        <OurToggle
          :model-value="Boolean(group.publish)"
          :height="36"
          :width="150"
          :font-size="14"
          :labels="{ unchecked: 'Not visible', checked: 'Visible on site' }"
          disabled
          class="mr-2"
        />
        <OurToggle
          :model-value="Boolean(group.ontn)"
          :height="36"
          :width="150"
          :font-size="14"
          :labels="{ unchecked: 'Not on TN', checked: 'On TN' }"
          disabled
          class="mr-2"
        />
        <OurToggle
          :model-value="Boolean(group.onlovejunk)"
          :height="36"
          :width="150"
          :font-size="14"
          :labels="{ unchecked: 'Not on LoveJunk', checked: 'On LoveJunk' }"
          disabled
          class="mr-2"
        />
        <OurToggle
          :model-value="Boolean(group.onmap)"
          :height="36"
          :width="150"
          :font-size="14"
          :labels="{ unchecked: 'Not on map', checked: 'On map' }"
          disabled
          class="mr-2"
        />
        <b-form-group>
          <b-form-select
            v-model="region"
            :options="regionOptions"
            class="font-weight-bold ml-1"
          />
        </b-form-group>
      </div>
      <group-header
        :id="group.id"
        :key="'group-' + group.id"
        :group="group"
        :show-join="false"
      />
      <h4 class="mt-2">Group Info</h4>
      Group id
      <v-icon icon="hashtag" class="text-muted" scale="0.75" /><strong>{{
        group.id
      }}</strong
      >.
      <br />
      <br />
      <ModClipboard v-if="group.url" class="mr-3 mb-1" :value="group.url" />
      Explore page:
      <ExternalLink :href="group.url">{{ group.url }}</ExternalLink>
      <br />
      <ModClipboard
        v-if="group.modsemail"
        class="mr-3 mb-1"
        :value="group.modsemail"
      />
      Volunteers email:
      <!-- eslint-disable-next-line -->
      <ExternalLink :href="'mailto:' + group.modsemail">{{ group.modsemail }}</ExternalLink>
      <br />
      <ModClipboard
        v-if="group.groupemail"
        class="mr-3 mb-1"
        :value="group.groupemail"
      />
      Posting address:
      <!-- eslint-disable-next-line -->
      <ExternalLink v-if="group.groupemail" :href="'mailto:' + group.groupemail">{{ group.groupemail }}</ExternalLink>
      <br />
      <div v-if="!group.facebook || !group.facebook.length">Facebook: none</div>
      <div v-else>
        <div
          v-for="facebook in group.facebook"
          :key="'facebook-' + facebook.id"
        >
          <div v-if="facebook.type === 'Page'">
            <ModClipboard
              class="mr-3 mb-1"
              :value="'https://facebook.com/pg/' + facebook.id"
            />
            Facebook:
            <ExternalLink :href="'https://facebook.com/pg/' + facebook.id">
              {{ facebook.name }}
            </ExternalLink>
            <span v-if="!facebook.valid" class="text-danger"> Invalid </span>
          </div>
        </div>
      </div>
      <br />
      Affiliation last confirmed: {{ dateonly(group.affiliationconfirmed) }} by
      <v-icon icon="hashtag" class="text-muted" scale="0.75" />{{
        group.affiliationconfirmedby
      }}
      <br />
      <h4 class="mt-2">Names</h4>
      <p>Short name:</p>
      <b-form-input v-model="group.nameshort" class="mb-2" />
      <p>Full name:</p>
      <b-form-input v-model="group.namefull" class="mb-2" />
      <SpinButton
        variant="white"
        icon-name="save"
        label="Save Names"
        class="mt-2"
        @handle="saveNames"
      />
      <h4 class="mt-2">Centre</h4>
      <p>Lat/lng of group centre:</p>
      <div class="d-flex">
        <b-form-input v-model="group.lat" type="number" class="mr-2" />
        <b-form-input v-model="group.lng" type="number" class="mr-2" />
      </div>
      <p class="mt-2">Additional centre for large groups:</p>
      <div class="d-flex">
        <b-form-input
          v-model="group.altlat"
          type="number"
          class="mr-2 flex-shrink-1"
        />
        <b-form-input
          v-model="group.altlng"
          type="number"
          class="mr-2 flex-shrink-1"
        />
      </div>
      <SpinButton
        variant="white"
        icon-name="save"
        label="Save Update"
        class="mt-2"
        @handle="saveCentres"
      />
      <h4 class="mt-2">CGA</h4>
      <b-form-textarea v-model="group.cga" rows="4" class="mb-2" />
      <p v-if="CGAerror" class="text-danger">
        {{ CGAerror }}
      </p>
      <SpinButton
        variant="white"
        icon-name="save"
        label="Save Update"
        @handle="saveCGA"
      />
      <h4 class="mt-2">DPA</h4>
      <b-form-textarea v-model="group.dpa" rows="4" class="mb-2" />
      <p v-if="DPAerror" class="text-danger">
        {{ DPAerror }}
      </p>
      <SpinButton
        variant="white"
        icon-name="save"
        label="Save Update"
        @handle="saveDPA"
      />
      <h4 class="mt-2">Volunteers</h4>
      <OurToggle
        :model-value="Boolean(!group.mentored)"
        :height="36"
        :width="170"
        :font-size="14"
        :labels="{ checked: 'Local Volunteers', unchecked: 'Caretakers' }"
        disabled
        class="mr-2"
      />
      <Spinner v-if="fetchingVolunteers" :size="50" class="d-block" />
      <ModSupportFindGroupVolunteer
        v-for="volunteer in sortedVolunteers"
        :key="'volunteer-' + volunteer.id"
        :volunteer="volunteer"
        :groupid="group.id"
      />
    </div>
  </div>
</template>
<script setup>
import { ref, computed, watch } from 'vue'
import { useMemberStore } from '~/stores/member'
import { useModGroupStore } from '@/stores/modgroup'

const modGroupStore = useModGroupStore()
const memberStore = useMemberStore()

const loading = ref(false)
const searchgroup = ref(null)
const fetchingVolunteers = ref(false)
const CGAerror = ref(null)
const DPAerror = ref(null)

const groups = computed(() => {
  return Object.values(modGroupStore.allGroups)
})

const groupitems = computed(() => {
  const ret = []

  if (groups.value) {
    groups.value.forEach((g) => {
      if (canonGroupName(g.nameshort) !== canonGroupName(g.namedisplay)) {
        ret.push(g.nameshort + ' / ' + g.namedisplay)
      } else {
        ret.push(g.nameshort)
      }
    })
  }

  return ret
})

const groupid = computed(() => {
  let ret = null

  if (searchgroup.value) {
    ret = groups.value.find((g) => {
      let name = g.nameshort

      if (canonGroupName(g.nameshort) !== canonGroupName(g.namedisplay)) {
        name = g.nameshort + ' / ' + g.namedisplay
      }

      return name === searchgroup.value
    })

    ret = ret ? ret.id : null
  }

  return ret
})

const group = computed(() => {
  return modGroupStore.get(groupid.value)
})

const volunteers = computed(() => {
  return memberStore.getByGroup(groupid.value)
})

const sortedVolunteers = computed(() => {
  const r = volunteers.value
  r.sort((a, b) => {
    if (a.lastmoderated && !b.lastmoderated) {
      return -1
    } else if (b.lastmoderated && !a.lastmoderated) {
      return 1
    } else {
      return (
        new Date(b.lastmoderated).getTime() -
        new Date(a.lastmoderated).getTime()
      )
    }
  })

  return r
})

const regionOptions = [
  { text: 'East', value: 'East' },
  { text: 'London', value: 'London' },
  { text: 'Midlands West', value: 'West Midlands' },
  { text: 'Midlands East', value: 'East Midlands' },
  { text: 'North East', value: 'North East' },
  { text: 'North West', value: 'North West' },
  { text: 'Northern Ireland', value: 'Northern Ireland' },
  { text: 'South East', value: 'South East' },
  { text: 'South West', value: 'South West' },
  { text: 'Wales', value: 'Wales' },
  { text: 'Yorkshire and the Humber', value: 'Yorkshire and the Humber' },
  { text: 'Scotland', value: 'Scotland' },
]

const region = computed({
  get() {
    return group.value.region
  },
  set(newval) {
    modGroupStore.updateMT({
      id: group.value.id,
      region: newval,
    })
  },
})

watch(groupid, async (id) => {
  if (id) {
    // Get the full group info
    await modGroupStore.fetchIfNeedBeMT(id)

    // And the list of volunteers
    fetchingVolunteers.value = true
    memberStore.clear()

    await memberStore.fetchMembers({
      groupid: groupid.value,
      collection: 'Approved',
      modtools: true,
      summary: false,
      limit: 1000,
      filter: 2,
    })

    fetchingVolunteers.value = false
  } else {
    memberStore.clear()
  }
})

async function loadallgroups(callback) {
  await modGroupStore.listMT({ grouptype: 'Freegle' })
  if (callback) callback()
}

async function loadCommunities() {
  if (groupitems.value.length === 0) {
    loading.value = true
    await loadallgroups()
    loading.value = false
  }
}

function canonGroupName(name) {
  return name ? name.toLowerCase().replace(/-|_| /g, '') : null
}

async function saveCGA(callback) {
  console.log('saveCGA', group.value.cga)
  CGAerror.value = null
  try {
    await modGroupStore.updateMT({
      id: groupid.value,
      polyofficial: group.value.cga,
    })
  } catch (e) {
    CGAerror.value = e.message
  }
  callback()
}

async function saveDPA(callback) {
  DPAerror.value = null
  try {
    await modGroupStore.updateMT({
      id: groupid.value,
      poly: group.value.dpa,
    })
  } catch (e) {
    DPAerror.value = e.message
  }
  callback()
}

function saveNames(callback) {
  modGroupStore.updateMT({
    id: groupid.value,
    namefull: group.value.namefull,
    nameshort: group.value.nameshort,
  })
  callback()
}

function saveCentres(callback) {
  modGroupStore.updateMT({
    id: groupid.value,
    lat: group.value.lat,
    lng: group.value.lng,
    altlat: group.value.altlat,
    altlng: group.value.altlng,
  })
  callback()
}

defineExpose({ loadCommunities })
</script>
<style scoped>
.max {
  max-width: 300px;
}
</style>
