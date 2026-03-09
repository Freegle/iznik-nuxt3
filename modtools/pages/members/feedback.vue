<template>
  <div>
    <client-only>
      <ScrollToTop />
      <ModHelpFeedback />
      <b-tabs v-model="tabIndex" content-class="mt-3" card>
        <b-tab active>
          <template #title>
            <h4 class="header--size4 ml-2 mr-2">
              Feedback <span v-if="members.length">({{ members.length }})</span>
            </h4>
          </template>
          <div class="d-flex justify-content-between">
            <ModGroupSelect
              v-model="groupid"
              modonly
              all
              remember="membersfeedback"
            />
            <b-form-select v-model="filter">
              <option value="Comments">With Comments</option>
              <option value="Happy">Happy</option>
              <option value="Unhappy">Unhappy</option>
              <option value="Fine">Fine</option>
            </b-form-select>
            <b-button variant="white" @click="markAll">
              Mark all as seen
            </b-button>
          </div>
          <b-card v-if="happinessData.length" variant="white" class="mt-1">
            <b-card-text>
              <p class="text-center">
                This is what people have said over the last year<span
                  v-if="!groupid"
                >
                  across all of Freegle</span
                >.
              </p>
              <div class="d-flex flex-wrap justify-content-between">
                <GChart
                  type="PieChart"
                  :data="happinessData"
                  :options="happinessOptions"
                />
                <GChart
                  type="BarChart"
                  :data="happinessData"
                  :options="happinessOptions"
                />
              </div>
            </b-card-text>
          </b-card>

          <NoticeMessage v-if="!members.length && !busy" class="mt-2">
            There are no items to show at the moment.
          </NoticeMessage>
          <div
            v-for="item in visibleItems"
            :key="'memberlist-' + item.id"
            class="p-0 mt-2"
          >
            <ModMemberHappiness
              v-if="item.type === 'Member' && filterMatch(item.object)"
              :id="item.object.id"
            />
          </div>
        </b-tab>

        <b-tab>
          <template #title>
            <h4 class="header--size4 ml-2 mr-2">
              Thumbs Up/Down
              <span v-if="ratings.length">({{ ratings.length }})</span>
            </h4>
          </template>

          <div
            v-for="item in ratings"
            :key="'ratinglist-' + item.id"
            class="p-0 mt-2"
          >
            <ModMemberRating :rating="item" class="mt-2" />
          </div>
        </b-tab>
      </b-tabs>
      <infinite-loading
        direction="top"
        force-use-infinite-wrapper="true"
        :distance="distance"
        :identifier="bump"
        @infinite="loadMore"
      >
        <template #spinner>
          <Spinner :size="50" />
        </template>
      </infinite-loading>
    </client-only>
  </div>
</template>
<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import dayjs from 'dayjs'
import { GChart } from 'vue-google-charts'
import { useNuxtApp } from '#app'
import { setupModMembers } from '~/composables/useModMembers'
import { useUserStore } from '~/stores/user'
import { useMemberStore } from '@/stores/member'
import { useMe } from '~/composables/useMe'

const { $api } = useNuxtApp()

const memberStore = useMemberStore()
const userStore = useUserStore()
const {
  busy,
  context,
  groupid,
  limit,
  show,
  collection,
  distance,
  members,
  filter,
  loadMore,
} = setupModMembers(true)
collection.value = 'Happiness'
limit.value = 1000 // Get everything (probably) so that the ratings and feedback are interleaved.
const { fetchMe } = useMe()

// Data
const tabIndex = ref(0)
const happinessData = ref([])
const bump = ref(0)
const happinessOptions = {
  chartArea: {
    width: '80%',
    height: '80%',
  },
  pieSliceBorderColor: 'darkgrey',
  colors: ['green', '#f8f9fa', 'orange'],
  slices2: {
    1: { offset: 0.2 },
    2: { offset: 0.2 },
    3: { offset: 0.2 },
  },
}

// Computed
const ratings = computed(() => {
  return memberStore.ratings
})

const sortedItems = computed(() => {
  const objs = []

  members.value.forEach((m) => {
    objs.push({
      type: 'Member',
      object: m,
      timestamp: m.timestamp,
      id: 'member-' + m.id,
    })
  })

  objs.sort(function (a, b) {
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  })

  return objs
})

const visibleItems = computed(() => {
  return sortedItems.value.slice(0, show.value)
})

// Watchers
watch(filter, () => {
  context.value = null
  show.value = 0
  memberStore.clear()
  bump.value++
})

watch(groupid, () => {
  getHappiness()
  bump.value++
})

watch(tabIndex, () => {
  console.log('tabIndex changed', show.value)
  bump.value++
})

// Methods
async function getHappiness() {
  const start = dayjs().subtract(1, 'year').toDate().toISOString()
  const ret = await $api.dashboard.fetch({
    components: ['Happiness'],
    start,
    end: new Date().toISOString(),
    allgroups: !groupid.value,
    group: groupid.value > 0 ? groupid.value : null,
    systemwide: groupid.value < 0,
  })

  if (ret.Happiness) {
    happinessData.value = [['Feedback', 'Count']]
    ret.Happiness.forEach((h) => {
      happinessData.value.push([h.happiness, h.count])
    })
  }
}

function filterMatch(member) {
  const val = member.happiness

  if (!filter.value) {
    return true
  }

  if (filter.value === 'Comments') {
    const comment = member.comments
      ? ('' + member.comments).replace(/[\n\r]+/g, '').trim()
      : ''

    if (comment.length) {
      return true
    }
  } else {
    if (filter.value === val) {
      return true
    }

    if (filter.value === 'Fine' && !val) {
      return true
    }
  }

  return false
}

async function markAll() {
  await memberStore.clear()

  const params = {
    groupid: groupid.value,
    collection: collection.value,
    modtools: true,
    summary: false,
    context: null,
    limit: 1000,
  }
  console.log('markAll', params)

  await memberStore.fetchMembers(params)
  console.log('markAll received')

  nextTick(() => {
    members.value.forEach(async (member) => {
      if (!member.reviewed) {
        const reviewParams = {
          userid: member.fromuser,
          groupid: member.groupid,
          happinessid: member.id,
        }
        await memberStore.happinessReviewed(reviewParams)
      }
    })
    ratings.value.forEach(async (rating) => {
      if (rating.reviewrequired) {
        await userStore.ratingReviewed({
          id: rating.id,
        })
      }
    })
  })
  fetchMe(true, ['work'])
}

// Lifecycle
onMounted(async () => {
  filter.value = 'Comments'
  await getHappiness()
})
</script>
<style scoped>
select {
  max-width: 300px;
}
</style>
