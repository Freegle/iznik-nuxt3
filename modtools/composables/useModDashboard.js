import { ref, reactive, watch, onMounted, nextTick, toRefs } from 'vue'

export function useModDashboard(props, askfor, grouprequired = false) {
  const { $api } = useNuxtApp()
  const loading = ref(false)
  const data = reactive({})

  // Initialize data properties for each askfor component
  askfor.forEach((comp) => {
    data[comp] = null
  })

  function maybeFetch() {
    if (!loading.value) {
      loading.value = true
      nextTick(() => {
        fetchData()
      })
    }
  }

  async function fetchData() {
    if (
      askfor &&
      props.start &&
      props.end &&
      askfor.length &&
      (props.groupid || !grouprequired)
    ) {
      loading.value = true
      const res = await $api.dashboard.fetch({
        components: askfor,
        start: props.start.toISOString(),
        end: props.end.toISOString(),
        allgroups: !props.groupid,
        group: props.groupid > 0 ? props.groupid : null,
        systemwide: props.groupid < 0,
      })

      Object.keys(res).forEach((comp) => {
        data[comp] = res[comp]
      })
    }
    loading.value = false
  }

  watch(
    () => props.groupid,
    () => maybeFetch()
  )

  watch(
    () => props.start,
    () => maybeFetch()
  )

  watch(
    () => props.end,
    () => maybeFetch()
  )

  onMounted(() => {
    fetchData()
  })

  return {
    loading,
    ...toRefs(data),
    maybeFetch,
    fetchData,
  }
}
