const busy = ref(false)
const context = ref(null)
const groupid = ref(0)
const group = ref(null)
const limit = ref(2)
const workType = ref(null)
const show = ref(0)

export function setupModMessages() {
  return {
    busy,
    context,
    group,
    groupid,
    limit,
    workType,
    show
  }
}
