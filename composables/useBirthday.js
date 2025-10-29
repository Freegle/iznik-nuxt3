import dayjs from 'dayjs'
import { nextTick } from 'vue'
import { useGroupStore } from '~/stores/group'
import { useStatsStore } from '~/stores/stats'
import { buildHead } from '~/composables/useBuildHead'
import { useRoute } from '#imports'

export function useBirthday() {
  const route = useRoute()
  const runtimeConfig = useRuntimeConfig()

  // Initialize stores
  const groupStore = useGroupStore()
  const statsStore = useStatsStore()

  // Route parameters
  const groupname = route.params.groupname

  // Reactive data
  const loading = ref(true)
  const dataReady = ref(false)

  // Computed properties
  const group = computed(() => {
    return groupStore.get(groupname)
  })

  const groupId = computed(() => {
    return group.value?.id || null
  })

  const groupName = computed(() => group.value?.namefull || 'Community')

  const groupAge = computed(() => {
    if (!group.value?.founded) return 0
    const founded = new Date(group.value.founded)
    const now = new Date()
    return Math.floor((now - founded) / (365.25 * 24 * 60 * 60 * 1000))
  })

  const isToday = computed(() => {
    if (!group.value?.founded) return false
    const founded = dayjs(group.value.founded)
    const today = dayjs()
    return founded.format('MM-DD') === today.format('MM-DD')
  })

  // Stats computed properties
  const totalWeight = computed(() => {
    const weights = statsStore?.Weight
    let total = 0
    const now = dayjs()
    if (weights) {
      for (const w of weights) {
        if (now.diff(dayjs(w.date), 'days') <= 365) {
          total += w.count
        }
      }
    }
    return total / 1000 // Convert to tonnes
  })

  // Benefit of reuse per tonne is £711 and CO2 impact is -0.51tCO2eq based on WRAP figures.
  // https://wrap.org.uk/resources/tool/benefits-reuse-tool
  const totalBenefit = computed(() => {
    return totalWeight.value * 711
  })

  const totalCO2 = computed(() => {
    return totalWeight.value * 0.51
  })

  const messagesThisYear = computed(() => {
    const messages = statsStore.Activity || []
    return messages.reduce((total, item) => total + (item.count || 0), 0)
  })

  // Page title
  const pageTitle = computed(
    () => `${groupName.value} is ${groupAge.value} years old!`
  )

  // Setup page head
  async function setupPageHead(customDescription = null) {
    if (groupname) {
      console.log('Fetching group data for birthday page:', groupname)
      await groupStore.fetch(groupname, true)
      await nextTick()

      const description =
        customDescription ||
        `Celebrate ${groupName.value}'s ${groupAge.value}th birthday! See the amazing impact our community has made and help us continue for another year.`

      useHead(
        buildHead(
          route,
          runtimeConfig,
          pageTitle.value,
          description,
          group.value?.profile ? group.value?.profile : null
        )
      )
    }
  }

  // Load birthday data
  async function loadBirthdayData() {
    try {
      loading.value = true

      if (!group.value) {
        loading.value = false
        return
      }

      // Set up date range for the last year
      const start = dayjs().subtract(1, 'year').startOf('month')
      const end = dayjs().endOf('month')

      // Clear previous stats and fetch new ones
      await statsStore.clear()
      await statsStore.fetch({
        group: groupId.value,
        grouptype: 'Freegle',
        systemwide: groupId.value === null,
        start: start.format('YYYY-MM-DD'),
        end: end.format('YYYY-MM-DD'),
      })

      dataReady.value = true
      loading.value = false
    } catch (err) {
      console.error('Error loading birthday data:', err)
      loading.value = false
    }
  }

  return {
    // Data
    groupname,
    loading,
    dataReady,

    // Computed
    group,
    groupId,
    groupName,
    groupAge,
    isToday,
    totalWeight,
    totalBenefit,
    totalCO2,
    messagesThisYear,
    pageTitle,

    // Methods
    setupPageHead,
    loadBirthdayData,
  }
}
