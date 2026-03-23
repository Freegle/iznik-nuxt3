<template>
  <div class="d-inline d-flex justify-content-start flex-wrap">
    <b-form-select
      v-model="postingStatus"
      :options="options"
      class="sel"
      :size="size"
    />
    <b-form-select v-model="trustlevel" class="sel" :size="size" readyonly>
      <option :value="null">Volunteering - not asked</option>
      <option value="Basic">Volunteering - basic</option>
      <option value="Moderate">Volunteering - moderate</option>
      <option value="Advanced">Volunteering - advanced</option>
      <option value="Declined">Volunteering - declined</option>
      <option value="Excluded">Volunteering - disabled</option>
    </b-form-select>
  </div>
</template>
<script setup>
import { computed, watch } from 'vue'
import { useUserStore } from '~/stores/user'
import { useMemberStore } from '~/stores/member'

const props = defineProps({
  membership: {
    type: Object,
    required: true,
  },
  userid: {
    type: Number,
    required: true,
  },
  size: {
    type: String,
    required: false,
    default: 'lg',
  },
})

const userStore = useUserStore()
const memberStore = useMemberStore()

const user = computed(() => userStore.byId(props.userid))

watch(
  () => props.userid,
  (uid) => {
    if (uid && !userStore.byId(uid)) userStore.fetch(uid)
  },
  { immediate: true }
)

const postingStatus = computed({
  get() {
    return props.membership.ourpostingstatus ?? 'DEFAULT'
  },
  async set(val) {
    const groupid = props.membership.groupid
    await memberStore.updateMembership({
      userid: props.userid,
      groupid,
      ourPostingStatus: val,
    })
  },
})

const trustlevel = computed({
  get() {
    return user.value?.trustlevel ?? null
  },
  async set(val) {
    await userStore.edit({
      id: props.userid,
      trustlevel: val,
    })
  },
})

const options = computed(() => {
  return [
    {
      value: 'MODERATED',
      text: 'Moderated',
    },
    {
      value: 'DEFAULT',
      text: 'Group Settings',
    },
    {
      value: 'PROHIBITED',
      text: "Can't Post",
    },
  ]
})
</script>
<style scoped>
.sel {
  width: auto;
}
</style>
