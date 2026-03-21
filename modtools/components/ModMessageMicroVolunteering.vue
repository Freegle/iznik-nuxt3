<template>
  <div v-if="microvolunteering">
    <div
      v-if="microvolunteering.result === 'Reject'"
      class="border border-warning rounded p-2"
    >
      <nuxt-link :to="'/members/approved/0/' + microvolunteering.userid">
        <v-icon icon="hashtag" class="text-muted" scale="0.75" />{{
          microvolunteering.userid
        }}
      </nuxt-link>
      <span v-if="user">
        <strong>{{ user.displayname }}</strong>
        <span v-if="email"> ({{ email }}) </span>
      </span>
      thinks this post
      <strong
        v-if="microvolunteering.msgcategory === 'CouldBeBetter'"
        class="text-warning"
      >
        Could be better
      </strong>
      <strong
        v-else-if="microvolunteering.msgcategory === 'ShouldntBeHere'"
        class="text-danger"
      >
        shouldn't be here
      </strong>
      <br />
      <span v-if="microvolunteering.comments" class="fw-bold"
        >"{{ microvolunteering.comments }}"</span
      >
      <em v-else>No comment supplied.</em>
    </div>
    <div
      v-if="microvolunteering.result === 'Approve'"
      class="border border-success rounded p-2"
    >
      <nuxt-link :to="'/members/approved/0/' + microvolunteering.userid">
        <v-icon icon="hashtag" class="text-muted" scale="0.75" />{{
          microvolunteering.userid
        }}
      </nuxt-link>
      <span v-if="user">
        <strong>&nbsp;{{ user.displayname }}</strong>
        <span v-if="email"> ({{ email }}) </span>
      </span>
      thinks this post is ok.
      <br />
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, watch } from 'vue'
import { useMessageStore } from '~/stores/message'
import { useUserStore } from '~/stores/user'
import { usePreferredEmail } from '~/modtools/composables/usePreferredEmail'

const props = defineProps({
  messageid: {
    type: Number,
    required: true,
  },
  microvolunteeringid: {
    type: Number,
    required: true,
  },
})

const messageStore = useMessageStore()
const userStore = useUserStore()

const message = computed(() => {
  return messageStore?.byId(props.messageid)
})

const microvolunteering = computed(() => {
  const msg = message.value
  if (msg?.microvolunteering) {
    return msg.microvolunteering.find((m) => m.id === props.microvolunteeringid)
  }
  return null
})

watch(
  () => props.messageid,
  (newVal) => {
    if (newVal) {
      messageStore.fetch(newVal)
    }
  },
  { immediate: true }
)

const user = computed(() => {
  return microvolunteering.value
    ? userStore?.byId(microvolunteering.value.userid)
    : null
})

const email = usePreferredEmail(user)

onMounted(() => {
  if (microvolunteering.value?.userid) {
    userStore.fetch(microvolunteering.value.userid)
  }
})
</script>
