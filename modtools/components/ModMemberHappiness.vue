<template>
  <div>
    <div id="visobserver" v-observe-visibility="visibilityChanged" />
    <b-card no-body>
      <b-card-header :class="variant">
        <b-row>
          <b-col cols="2" class="text-center">
            <v-icon :icon="icon" scale="2" />
          </b-col>
          <b-col cols="6">
            <v-icon icon="hashtag" scale="0.75" />{{ member.user.id }}
            {{ member.user.displayname }}
            <span v-if="member.user.email"> ({{ member.user.email }}) </span>
          </b-col>
          <b-col cols="4">
            {{ timeago(member.timestamp) }}
            <span v-if="!member.reviewed" class="text-danger font-weight-bold">
              New
            </span>
          </b-col>
        </b-row>
        <b-row>
          <b-col cols="2" class="text-center">
            <v-icon :icon="outcomeIcon" /> {{ member.outcome }}
          </b-col>
          <b-col cols="6">
            {{ member.message.subject }}
          </b-col>
          <b-col cols="4">
            <b-button
              :to="'/members/approved/' + member.groupid + '/' + member.user.id"
              variant="link"
              :class="(icon === 'meh' ? 'text-dark' : 'text-white') + ' p-0'"
            >
              <v-icon icon="hashtag" scale="0.75" />{{ member.message.id }}
              <span v-if="groupname"> on {{ groupname }} </span>
            </b-button>
          </b-col>
        </b-row>
      </b-card-header>
      <b-card-body>
        <div class="d-flex justify-content-between flex-wrap">
          {{ member.comments }}&nbsp;
          <ChatButton
            :userid="member.user.id"
            :groupid="member.groupid"
            chattype="User2Mod"
            title="Chat"
            variant="white"
          />
        </div>
      </b-card-body>
    </b-card>
  </div>
</template>
<script setup>
import { computed } from 'vue'
import { useMemberStore } from '~/stores/member'
import { useMe } from '~/composables/useMe'

const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
})

const memberStore = useMemberStore()
const { myGroup } = useMe()

const member = computed(() => memberStore.get(props.id))

const variant = computed(() => {
  switch (member.value.happiness) {
    case 'Happy':
      return 'bg-success'
    case 'Unhappy':
      return 'bg-warning'
    default:
      return 'bg-light'
  }
})

const icon = computed(() => {
  switch (member.value.happiness) {
    case 'Happy':
      return 'smile'
    case 'Unhappy':
      return 'frown'
    default:
      return 'meh'
  }
})

const outcomeIcon = computed(() => {
  switch (member.value.outcome) {
    case 'Taken':
    case 'Received':
      return 'check'
    default:
      return 'times'
  }
})

const groupname = computed(() => {
  let ret = null
  const group = myGroup(member.value.groupid)

  if (group) {
    ret = group.namedisplay
  }

  return ret
})

function visibilityChanged(visible) {
  if (visible && !member.value.reviewed) {
    // Mark this as reviewed.  They've had a chance to see it.
    memberStore.happinessReviewed({
      userid: member.value.user.id,
      groupid: member.value.groupid,
      happinessid: member.value.id,
    })
  }
}
</script>
<style scoped lang="scss">
//@import 'color-vars';

.card-header.bg-success {
  background-color: $colour-success-fg !important;
  color: white !important;
}
</style>
