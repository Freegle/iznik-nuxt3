<template>
  <div v-if="user">
    <NoticeMessage :variant="variant" class="mb-1">
      <div>
        {{ user.displayname }} {{ collname }}: {{ user.spammer.reason }}
      </div>
      <div class="small">
        <span v-if="user.spammer.collection === 'PendingAdd'">
          Reported by
        </span>
        <span v-else> Added by </span>
        <span v-if="user.spammer.byuser">
          {{ user.spammer.byuser.displayname }}
          <span
            v-if="
              user.spammer.collection === 'PendingAdd' && hasPermissionSpamAdmin
            "
          >
            (<ExternalLink
              :href="
                'mailto:' +
                user.spammer.byuser.email +
                '?cc=spammerlist@ilovefreegle.org'
              "
              >{{ user.spammer.byuser.email }}</ExternalLink
            >)
          </span>
          <span v-else>
            (<ExternalLink :href="'mailto:' + user.spammer.byuser.email">{{
              user.spammer.byuser.email
            }}</ExternalLink
            >)
          </span>
          <ModClipboard class="ml-1" :value="user.spammer.byuser.email" />
        </span>
        #{{ user.spammer.byuserid }} {{ timeago(user.spammer.added) }}
      </div>
    </NoticeMessage>
    <notice-message v-if="sameip && sameip.length" variant="warning">
      <p>
        Recently active on the same IP address:
        <nuxt-link v-for="uid in sameip" :key="uid" :to="'/support/' + uid">
          <v-icon icon="hashtag" class="text-muted" scale="0.5" /><strong>{{
            uid
          }}</strong
          >&nbsp; </nuxt-link
        >.
      </p>
      <p>
        These may not be the same actual person but they're worth checking out
        too.
      </p>
    </notice-message>
  </div>
</template>
<script setup>
import { computed, watch } from 'vue'
import { useUserStore } from '~/stores/user'
import { useMemberStore } from '~/stores/member'
import { useModMe } from '~/composables/useModMe'

const props = defineProps({
  userid: {
    type: Number,
    required: true,
  },
  sameip: {
    type: Array,
    required: false,
    default: null,
  },
})

const userStore = useUserStore()
const memberStore = useMemberStore()

const user = computed(() => {
  // The member store may have richer spammer data (object with reason/byuser)
  // than the user store (which has spammer as a boolean).
  const memberData = memberStore.list[props.userid]
  const storeUser = userStore.byId(props.userid)

  if (memberData && typeof memberData.spammer === 'object' && storeUser) {
    return { ...storeUser, spammer: memberData.spammer }
  }

  return memberData || storeUser
})

watch(
  () => props.userid,
  (uid) => {
    if (uid && !userStore.byId(uid)) userStore.fetch(uid)
  },
  { immediate: true }
)

const { hasPermissionSpamAdmin } = useModMe()

const variant = computed(() => {
  if (!user.value?.spammer) return 'warning'
  switch (user.value.spammer.collection) {
    case 'Spammer': {
      return 'danger'
    }
    case 'Safelisted': {
      return 'primary'
    }
    default: {
      return 'warning'
    }
  }
})

const collname = computed(() => {
  if (!user.value?.spammer) return ''
  switch (user.value.spammer.collection) {
    case 'Spammer': {
      return 'Confirmed Spammer'
    }
    case 'Safelisted': {
      return 'Safelisted'
    }
    case 'PendingAdd': {
      return 'Unconfirmed Spammer'
    }
    case 'PendingRemove': {
      return 'Disputed Spammer'
    }
    default:
      return user.value.spammer.collection
  }
})
</script>
