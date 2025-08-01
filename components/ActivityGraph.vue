<template>
  <b-card variant="white" class="mt-2">
    <b-card-text>
      <h3 class="d-flex justify-content-between flex-wrap">
        <span>
          {{ graphTitles[graphType] }}
          <span v-if="groupName" class="text-muted">on {{ groupName }}</span>
        </span>
        <div class="d-flex">
          <b-form-select
            v-if="
              graphType !== 'ActiveUsers' && graphType !== 'ApprovedMemberCount'
            "
            v-model="units"
            :options="unitOptions"
            class="graphSelect mr-1"
          />
          <b-form-select
            v-model="graphType"
            :options="graphTypes"
            class="graphSelect"
          />
        </div>
      </h3>
      <p v-if="graphType === 'Activity'">
        This includes people OFFERing something, posting a WANTED for something,
        or replying to an OFFER/WANTED.
      </p>
      <p v-if="graphType === 'ApprovedMessageCount'">
        This includes people OFFERing something or posting a WANTED for
        something.
      </p>
      <p v-if="graphType === 'ApprovedMemberCount'">
        This is the number of freeglers who were members on that day.
      </p>
      <p v-if="graphType === 'Replies'">
        This includes people replying to an OFFER or a WANTED.
      </p>
      <p v-if="graphType === 'Offers'">
        Just OFFERs. This is estimated from the message total and the split by
        type across the whole period.
      </p>
      <p v-if="graphType === 'Wanteds'">
        Just WANTEDs. This is estimated from the message total and the split by
        type across the whole period.
      </p>
      <p v-if="graphType === 'Weight'">
        These are weight estimates based on the items which we know are
        TAKEN/RECEIVED.
      </p>
      <p v-if="graphType === 'Outcomes'">
        These are the posts marked as TAKEN/RECEIVED.
      </p>
      <p v-if="graphType === 'Donations'">
        These are donations received via PayPal or Stripe.
      </p>
      <p v-if="graphType === 'ActiveUsers'">
        This is the number of freeglers active in the 30 days before each date.
        Only available for individual communities at the moment; if you add up
        across communities you'll get the wrong number because the same freegler
        might be active on multiple communities. Data valid from around the
        start of September 2020. Only includes freeglers who logged in.
      </p>
      <div
        v-if="loading"
        class="height text-muted pulsate align-middle d-flex flex-column"
      >
        Loading...
      </div>
      <div v-else-if="noDataToShow">
        <strong>No data for this period.</strong>
      </div>
      <GChart
        v-else
        :key="graphType"
        :type="
          graphType === 'ActiveUsers' ||
          graphType === 'ApprovedMemberCount' ||
          units === 'day'
            ? 'LineChart'
            : 'ColumnChart'
        "
        :data="graphData"
        :options="graphOptions"
      />
    </b-card-text>
  </b-card>
</template>
<script setup>
import { GChart } from 'vue-google-charts'
import dayjs from 'dayjs'
import { nextTick } from 'vue'
import { useNuxtApp } from '#app'

const { $api } = useNuxtApp()

const props = defineProps({
  groupid: {
    type: Number,
    required: false,
    default: null,
  },
  groupName: {
    type: String,
    required: false,
    default: null,
  },
  start: {
    type: Date,
    required: true,
  },
  end: {
    type: Date,
    required: true,
  },
  offers: {
    type: Boolean,
    required: false,
    default: false,
  },
  wanteds: {
    type: Boolean,
    required: false,
    default: false,
  },
  weights: {
    type: Boolean,
    required: false,
    default: false,
  },
  successful: {
    type: Boolean,
    required: false,
    default: false,
  },
  donations: {
    type: Boolean,
    required: false,
    default: false,
  },
  activeusers: {
    type: Boolean,
    required: false,
    default: false,
  },
  approvedmembers: {
    type: Boolean,
    required: false,
    default: false,
  },
  systemwide: {
    type: Boolean,
    required: false,
    default: false,
  },
})

// State
const loading = ref(true)
const MessageBreakdown = ref(null)
const PostMethodBreakdown = ref(null)
const ModeratorsActive = ref(null)
const ApprovedMessageCount = ref(null)
const ApprovedMemberCount = ref(null)
const Activity = ref(null)
const Replies = ref(null)
const Weight = ref(null)
const Outcomes = ref(null)
const Donations = ref(null)
const ActiveUsers = ref(null)
const graphType = ref('Activity')
const destroyed = ref(false)

const graphTitles = {
  Activity: 'Activity',
  ApprovedMessageCount: 'OFFERs and WANTED',
  ApprovedMemberCount: 'Freeglers',
  Replies: 'Replies',
  Offers: 'OFFERs only',
  Wanteds: 'WANTEDs only',
  Weight: 'Weights',
  Outcomes: 'Successful',
  Donations: 'PayPal or Stripe Donations',
  ActiveUsers: 'Active freeglers',
}

const unitOptions = [
  {
    value: 'day',
    text: 'Day',
  },
  {
    value: 'week',
    text: 'Week',
  },
  {
    value: 'month',
    text: 'Month',
  },
  {
    value: 'year',
    text: 'Year',
  },
]

const units = ref('year')

// Computed properties
const duration = computed(() => {
  const d = dayjs(props.end)
    .endOf('day')
    .diff(dayjs(props.start).startOf('day'), 'day')
  return d
})

const defaultUnits = () => {
  // Choose the units to display on the graph based on the range it covers.
  if (duration.value < 31) {
    return 'day'
  } else if (duration.value < 31 * 3) {
    return 'week'
  } else if (duration.value < 2 * 365) {
    return 'month'
  } else {
    return 'year'
  }
}

const graphTypes = computed(() => {
  const ret = []

  ret.push({ value: 'Activity', text: 'Activity' })

  ret.push({
    value: 'ApprovedMessageCount',
    text: 'OFFERS+WANTEDs',
  })

  if (props.successful) {
    ret.push({ value: 'Outcomes', text: 'Successful posts' })
  }

  if (props.offers) {
    ret.push({ value: 'Offers', text: 'Just OFFERs' })
  }

  if (props.wanteds) {
    ret.push({ value: 'Wanteds', text: 'Just WANTEDs' })
  }

  if (props.weights) {
    ret.push({ value: 'Weight', text: 'Weight estimates' })
  }

  if (props.approvedmembers && (props.groupid === -2 || props.groupid > 0)) {
    // Only available systemwide or on individual groups.
    ret.push({ value: 'ApprovedMemberCount', text: 'Freeglers' })
  }

  if (props.activeusers && (props.groupid === -2 || props.groupid > 0)) {
    // Only available systemwide or on individual groups.
    ret.push({ value: 'ActiveUsers', text: 'Active Freeglers' })
  }

  ret.push({ value: 'Replies', text: 'Replies' })

  if (props.donations) {
    ret.push({ value: 'Donations', text: 'PayPal or Stripe Donations' })
  }

  return ret
})

const graphOptions = computed(() => {
  let hformat

  const currentUnits =
    graphType.value === 'ActiveUsers' ||
    graphType.value === 'ApprovedMemberCount'
      ? 'day'
      : units.value

  if (currentUnits === 'week' || currentUnits === 'day') {
    hformat = 'dd MMM yyyy'
  } else if (currentUnits === 'month') {
    hformat = 'MMM yyyy'
  } else if (currentUnits === 'year') {
    hformat = 'yyyy'
  }

  return {
    title: graphTitles[graphType.value],
    interpolateNulls: false,
    animation: {
      duration: 5000,
      easing: 'out',
      startup: true,
    },
    legend: { position: 'none' },
    chartArea: { width: '80%', height: '80%' },
    vAxis: {
      viewWindow: {
        min: 0,
        // max: 250000
      },
    },
    hAxis: {
      format: hformat,
    },
    series: {
      0: { color: 'green' },
    },
    bar: { groupWidth: '100%' },
  }
})

const approvedSplit = (type) => {
  // We want to return the approved message count, adjusted by the message breakdown for this type.
  type = type.replace('s', '')

  const factor =
    MessageBreakdown.value[type] /
    (MessageBreakdown.value.Offer + MessageBreakdown.value.Wanted)

  const ret = []

  if (ApprovedMessageCount.value) {
    ApprovedMessageCount.value.forEach((ent) => {
      ret.push({
        date: ent.date,
        count: Math.round(ent.count) * factor,
      })
    })
  }

  return ret
}

const Offers = computed(() => {
  return approvedSplit(graphType.value)
})

const Wanteds = computed(() => {
  return approvedSplit(graphType.value)
})

const graphData = computed(() => {
  const ret = [['Date', 'Count']]
  const currentData = {
    Activity: Activity.value,
    ApprovedMessageCount: ApprovedMessageCount.value,
    ApprovedMemberCount: ApprovedMemberCount.value,
    Replies: Replies.value,
    Offers: Offers.value,
    Wanteds: Wanteds.value,
    Weight: Weight.value,
    Outcomes: Outcomes.value,
    Donations: Donations.value,
    ActiveUsers: ActiveUsers.value,
  }

  const activity = currentData[graphType.value]
  const data = []
  const startd = dayjs(props.start).startOf('day')
  const endd = dayjs(props.end).endOf('day')

  const currentUnits =
    graphType.value === 'ActiveUsers' ||
    graphType.value === 'ApprovedMemberCount'
      ? 'day'
      : units.value

  if (activity) {
    for (const a of activity) {
      // Collect the data according to the unit.
      const thisdate = dayjs(a.date)

      if (thisdate.isSameOrAfter(startd) && thisdate.isSameOrBefore(endd)) {
        const d = thisdate.startOf(currentUnits)
        if (data[d]) {
          data[d] += parseInt(a.count)
        } else {
          data[d] = parseInt(a.count)
        }
      } else {
        console.log('Exclude', a.date, props.start, props.end)
      }
    }

    for (const d in data) {
      let lab = null

      if (currentUnits === 'day') {
        lab = new Date(d)
      } else if (currentUnits === 'week') {
        lab = 'w/c ' + dayjs(d).format('DD-MMM')
      } else if (currentUnits === 'month') {
        lab = dayjs(d).format('MMM YYYY')
      } else if (currentUnits === 'year') {
        lab = dayjs(d).format('YYYY')
      }

      ret.push([lab, data[d]])
    }
  }

  return ret
})

const noDataToShow = computed(() => {
  if (Array.isArray(graphData.value) && graphData.value.length > 1) {
    return false
  }
  return true
})
// Methods
const fetch = async (nodef) => {
  loading.value = true

  if (!nodef) {
    units.value = defaultUnits()
  }

  let comp = [graphType.value]

  if (graphType.value === 'Offers' || graphType.value === 'Wanteds') {
    // These are not stored separately by the server so we get the total and the split.
    comp = ['ApprovedMessageCount', 'MessageBreakdown']
  }

  const res = await $api.dashboard.fetch({
    components: comp,
    start: props.start.toISOString(),
    end: props.end.toISOString(),
    allgroups: !props.systemwide && !props.groupid,
    group: props.groupid > 0 ? props.groupid : null,
    systemwide: props.systemwide,
    suppliedgroup: props.groupid,
    units: units.value,
  })

  if (!destroyed.value) {
    Object.keys(res).forEach((c) => {
      if (c === 'MessageBreakdown') MessageBreakdown.value = res[c]
      if (c === 'PostMethodBreakdown') PostMethodBreakdown.value = res[c]
      if (c === 'ModeratorsActive') ModeratorsActive.value = res[c]
      if (c === 'ApprovedMessageCount') ApprovedMessageCount.value = res[c]
      if (c === 'ApprovedMemberCount') ApprovedMemberCount.value = res[c]
      if (c === 'Activity') Activity.value = res[c]
      if (c === 'Replies') Replies.value = res[c]
      if (c === 'Weight') Weight.value = res[c]
      if (c === 'Outcomes') Outcomes.value = res[c]
      if (c === 'Donations') Donations.value = res[c]
      if (c === 'ActiveUsers') ActiveUsers.value = res[c]
    })

    loading.value = false
  }
}

const maybeFetch = (nodef) => {
  if (!loading.value) {
    loading.value = true

    nextTick(() => {
      fetch(nodef)
    })
  }
}

// Lifecycle hooks and watches
onMounted(() => {
  fetch()
})

onBeforeUnmount(() => {
  destroyed.value = true
})

watch(
  () => props.start,
  () => {
    maybeFetch()
  }
)

watch(
  () => props.end,
  () => {
    maybeFetch()
  }
)

watch(
  () => props.groupid,
  () => {
    maybeFetch()
  }
)

watch(graphType, () => {
  maybeFetch()
})

// This is experimental code for if we find a way to fetch stats faster on the server for different units.
// watch(units, () => {
//   maybeFetch(true)
// })
</script>
<style scoped>
.graphSelect {
  max-width: 200px;
}

.height {
  height: 200px;
}
</style>
