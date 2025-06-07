<template>
  <div v-if="me">
    <div class="d-flex justify-content-around w-100">
      <b-img
        v-if="showVolunteersWeek"
        ref="volunteersWeek"
        fluid
        src="/VolunteersWeek.gif"
      />
    </div>
    <h2>Hello, {{ me.displayname }}</h2>
    <p>
      Here's your dashboard, where you can see what your communities have been
      doing recently.
    </p>
    <!-- eslint-disable-next-line -->
    <p>Need any help moderating? Mail <ExternalLink href="mailto:mentors@ilovefreegle.org">mentors@ilovefreegle.org</ExternalLink>
    </p>
    <ModDashboardDiscourseTopics
      v-if="start"
      :groupid="groupid"
      :group-name="groupName"
      :start="start"
      :end="end"
      class="mb-2"
    />
    <ModMissingRules />
    <!-- Disabled as Facebook sharing isn't working and will probably be retired.-->
    <!--ModMissingFacebook /-->
    <ModMissingProfile class="mt-1" />
    <div class="d-flex mb-2 mt-2 flex-wrap">
      <div class="borderit d-flex flex-column">
        <label for="dashboardgroup">Choose community:</label>
        <ModGroupSelect
          id="dashboardgroup"
          v-model="groupid"
          all
          modonly
          :systemwide="admin"
          active
        />
      </div>
      <div class="borderit d-flex flex-column">
        <label for="showInfo">Show info from:</label>
        <b-form-select id="showInfo" v-model="showInfo">
          <option value="week">Last 7 days</option>
          <option value="month">The last month</option>
          <option value="year">The last 12 months</option>
          <option value="custom">Specific dates</option>
        </b-form-select>
      </div>
      <div v-if="showInfo === 'custom'" class="d-flex flex-wrap">
        <div class="borderit d-flex flex-column">
          <label for="startDate">From:</label>
          <OurDatePicker
            id="startDate"
            v-model="starti"
            lang="en"
            type="date"
            format="YYYY-MM-DD"
            :disabled-date="notbeforeepoch"
          />
        </div>
        <div class="borderit d-flex flex-column">
          <label for="endDate">To:</label>
          <OurDatePicker
            id="endDate"
            v-model="endi"
            lang="en"
            type="date"
            format="YYYY-MM-DD"
            :disabled-date="notbeforestart"
          />
        </div>
      </div>
      <div class="borderit d-flex flex-column justify-content-end">
        <b-button variant="white" @click="update">
          <v-icon icon="sync" /> Update
        </b-button>
      </div>
    </div>
    <div v-if="start && end">
      <ModDashboardRecentCounts
        :groupid="groupid"
        :group-name="groupName"
        :start="start"
        :end="end"
      />
      <ModDashboardModeratorsActive
        :groupid="groupid"
        :group-name="groupName"
        :start="start"
        :end="end"
      />
      <ModDashboardPopularPosts
        :groupid="groupid"
        :group-name="groupName"
        :start="start"
        :end="end"
        class="mt-2"
      />
      <h2 class="mt-2">
        Active Freeglers <span class="text-muted">on {{ groupName }}</span>
      </h2>
      <p>These are the freeglers who've done most on the site recently.</p>
      <b-row>
        <b-col cols="12" xl="6">
          <ModDashboardFreeglersPosting
            :groupid="groupid"
            :group-name="groupName"
            :start="start"
            :end="end"
          />
        </b-col>
        <b-col cols="12" xl="6">
          <ModDashboardFreeglersReplying
            :groupid="groupid"
            :group-name="groupName"
            :start="start"
            :end="end"
          />
        </b-col>
      </b-row>
      <ModDashboardImpact
        :groupid="groupid"
        :start="start"
        :group-name="groupName"
        :end="end"
        class="mt-2"
      />
      <ActivityGraph
        :groupid="groupid"
        :group-name="groupName"
        :start="start"
        :end="end"
        offers
        wanteds
        weights
        donations
        successful
        activeusers
        approvedmembers
        :systemwide="groupid < 0"
      />
      <!--      TODO-ED MT POSTLAUNCH TN vs email vs web stats-->
    </div>
  </div>
</template>

<script setup>
import dayjs from 'dayjs'
import { useMiscStore } from '@/stores/misc'
import { useModGroupStore } from '@/stores/modgroup'
import { buildHead } from '~/composables/useMTBuildHead'

const miscStore = useMiscStore()
const modGroupStore = useModGroupStore()

/* const version = computed(() => {
  return runtimeConfig.public.VERSION
})

const buildDate = computed(() => {
  return runtimeConfig.public.BUILD_DATE
}) */

const showVolunteersWeek = ref(false)
const starti = ref(null)
const endi = ref(null)
const start = ref(null)
const end = ref(null)
const dateFormat = ref(null)

const groupid = computed({
  get: () => {
    return miscStore.get('groupiddash')
  },
  set: (newValue) => {
    miscStore.set({ key: 'groupiddash', value: newValue })
  },
})

const showInfo = computed({
  get: () => {
    return miscStore.get('dashboardShowInfo') || 'week'
  },
  set: (newValue) => {
    miscStore.set({ key: 'dashboardShowInfo', value: newValue })
  },
})

const notbeforeepoch = function (date) {
  // We only have stats back to this point.
  return !dayjs(date).isSameOrAfter(dayjs('2015-08-24'))
}

const groupName = computed(() => {
  if (groupid.value < 0) {
    return 'all Freegle communities'
  } else if (!groupid.value) {
    return 'all my communities'
  } else {
    const group = modGroupStore.get(groupid.value)

    if (group) {
      return group.namedisplay
    } else {
      return ''
    }
  }
})

const notbeforestart = function (date) {
  const d = dayjs(date)
  const now = dayjs()

  return d.isAfter(now) || !d.isAfter(dayjs(this.starti))
}

watch(showInfo, () => {
  update()
})

onMounted(async () => {
  modGroupStore.getModGroups()

  // Volunteers' Week is between 1st and 7th June every year.
  if (
    dayjs().get('month') === 5 &&
    dayjs().get('date') >= 1 &&
    dayjs().get('date') <= 7
  ) {
    showVolunteersWeek.value = true

    setTimeout(() => {
      showVolunteersWeek.value = false
    }, 30000)
  }

  update()
})

const update = function (newShowInfo) {
  if (typeof newShowInfo === 'string') showInfo.value = newShowInfo
  // A manual click to do the refresh avoids multiple refreshes when tweaking dates.
  switch (showInfo.value) {
    case 'week': {
      starti.value = dayjs().subtract(7, 'days').toDate()
      endi.value = new Date()
      break
    }
    case 'month': {
      starti.value = dayjs().subtract(1, 'month').toDate()
      endi.value = new Date()
      break
    }
    case 'year': {
      starti.value = dayjs().subtract(1, 'year').toDate()
      endi.value = new Date()
      break
    }
    case 'custom': {
      // Do nothing - use the values in the input.
    }
  }

  start.value = starti.value
  end.value = endi.value
  // console.log('UPDATE', start.value, end.value, groupid.value)
}
</script>
