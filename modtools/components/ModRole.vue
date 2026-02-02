<template>
  <b-form-select v-model="therole" @change="change">
    <option value="Member">Member</option>
    <option value="Moderator">Moderator</option>
    <option value="Owner">Owner</option>
  </b-form-select>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { useMemberStore } from '~/stores/member'

const props = defineProps({
  userid: {
    type: Number,
    required: true,
  },
  groupid: {
    type: Number,
    required: true,
  },
  role: {
    type: String,
    required: true,
  },
})

const memberStore = useMemberStore()
const therole = ref(null)

onMounted(() => {
  therole.value = props.role
})

async function change() {
  const params = {
    userid: props.userid,
    groupid: props.groupid,
    role: therole.value,
  }

  await memberStore.update(params)
}
</script>
<style scoped>
select {
  max-width: 150px;
}
</style>
