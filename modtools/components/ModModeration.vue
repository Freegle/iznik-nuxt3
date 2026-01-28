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
import { computed } from 'vue'
import { useUserStore } from '~/stores/user'

const props = defineProps({
  membership: {
    type: Object,
    required: true,
  },
  user: {
    type: Object,
    required: true,
  },
  userid: {
    type: Number,
    required: false,
    default: 0,
  },
  size: {
    type: String,
    required: false,
    default: 'lg',
  },
})

const userStore = useUserStore()

const postingStatus = computed({
  get() {
    return props.membership.ourpostingstatus || 'MODERATED'
  },
  async set(val) {
    const groupid = props.membership.groupid ?? props.membership.id
    const userid = props.userid ? props.userid : props.user.id
    await userStore.edit({
      id: userid,
      groupid,
      ourPostingStatus: val,
    })
  },
})

const trustlevel = computed({
  get() {
    return props.user.trustlevel ? props.user.trustlevel : null
  },
  async set(val) {
    const groupid = props.membership.groupid ?? props.membership.id
    const userid = props.userid ? props.userid : props.user.id
    await userStore.edit({
      id: userid,
      groupid,
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
  max-width: 200px;
}
</style>
