<template>
  <div v-if="member && !reviewed">
    <b-card bg-variant="white" no-body>
      <b-card-header class="d-flex justify-content-between flex-wrap">
        <div>
          <div v-if="isLJ">LoveJunk user #{{ user.ljuserid }}</div>
          <!-- eslint-disable-next-line -->
          <v-icon icon="envelope" class="me-1" />
          <ExternalLink :href="'mailto:' + email">{{ email }}</ExternalLink>
        </div>
        <div>
          <ProfileImage
            v-if="user"
            :image="user.profile?.turl || user.profile?.paththumb"
            :name="user.displayname"
            class="ml-1 mb-1 inline"
            is-thumbnail
            size="sm"
          />
          {{ user ? user.displayname : member.fullname }}
          <ModSupporter v-if="user && user.supporter" class="d-inline" />
        </div>
        <div v-if="member.joined || member.added">
          <v-icon icon="calendar-alt" />
          {{ datetimeshort(member.joined || member.added) }}
        </div>
        <div><v-icon icon="hashtag" />{{ member.userid }}</div>
      </b-card-header>
      <b-card-body>
        <ModComments :userid="member.userid" />
        <ModSpammer v-if="member.spammer" :userid="member.userid" />
        <NoticeMessage
          v-if="user && user.systemrole && user.systemrole !== 'User'"
          variant="info"
        >
          This freegler has role: {{ user.systemrole }}.
        </NoticeMessage>
        <NoticeMessage
          v-if="user && user.suspectreason"
          variant="danger"
          class="mb-2"
        >
          This freegler is flagged: {{ user.suspectreason }}
        </NoticeMessage>
        <NoticeMessage
          v-if="user && user.activedistance > 50"
          variant="warning"
          class="mb-2"
        >
          This freegler recently active on groups
          {{ user.activedistance }} miles apart.
        </NoticeMessage>
        <ModBouncing v-if="user && user.bouncing" :userid="member.userid" />
        <NoticeMessage v-if="member.bandate">
          Banned
          <span :title="datetime(member.bandate)">{{
            timeago(member.bandate)
          }}</span>
          <span v-if="member.bannedby"> by #{{ member.bannedby }}</span> - check
          logs for info.
        </NoticeMessage>
        <div class="d-flex justify-content-between flex-wrap">
          <div>
            <ModMemberSummary :userid="member.userid" />
            <div
              v-if="lastaccess"
              :class="'mb-1 ' + (inactive ? 'text-danger' : '')"
            >
              Last active: {{ timeago(lastaccess) }}
              <span v-if="inactive"> - won't send mails </span>
            </div>
            <div class="d-flex justify-content-between flex-wrap">
              <div v-if="userinfo && userinfo.publiclocation">
                Public location: {{ userinfo.publiclocation.location }}
              </div>
              <div v-if="userinfo && userinfo.privateposition">
                Private location: {{ userinfo.privateposition.loc }}
              </div>
            </div>
            <MessageMap
              v-if="userinfo && userinfo.privateposition"
              :position="userinfo.privateposition"
              :boundary="firstgrouppolygon"
              class="mt-2"
            />
            <ModMemberLogins :userid="member.userid" />
            <b-button
              v-if="userEmails && userEmails.length"
              variant="link"
              @click="showEmails = !showEmails"
            >
              <v-icon icon="envelope" />
              <span v-if="showEmails">
                <span class="d-inline d-sm-none"> Hide </span>
                <span class="d-none d-sm-inline">
                  Show {{ pluralise('email', userEmails.length, true) }}
                </span>
              </span>
              <span v-else>
                <span class="d-inline d-sm-none">
                  {{ userEmails.length }}
                </span>
                <span class="d-none d-sm-inline">
                  Show {{ pluralise('email', userEmails.length, true) }}
                </span>
              </span>
            </b-button>
            <b-button variant="link" @click="showHistory(null)">
              View posts
            </b-button>
            <b-button variant="link" @click="showLogs"> View logs </b-button>
            <b-button
              variant="link"
              :href="'https://ilovefreegle.org/profile/' + member.userid"
              target="_blank"
            >
              View profile
            </b-button>
            <div v-if="showEmails">
              <div v-for="e in userEmails" :key="e.id">
                {{ e.email }} <v-icon v-if="e.preferred" icon="star" />
              </div>
            </div>
          </div>
        </div>
        <ModMemberReviewActions
          v-for="m in memberof"
          :key="'membership-' + m.membershipid"
          :membershipid="m.membershipid"
          :userid="member.userid"
          class="p-1 mr-1"
          @forcerefresh="forcerefresh"
        />
        <b-badge
          v-if="hiddenmemberofs"
          variant="info"
          class="clickme mb-1"
          @click="allmemberships = !allmemberships"
        >
          +{{ hiddenmemberofs }} groups
        </b-badge>
      </b-card-body>
    </b-card>
    <ModPostingHistoryModal
      v-if="showPostingHistoryModal"
      ref="history"
      :userid="member.userid"
      :type="type"
      @hidden="showPostingHistoryModal = false"
    />
    <ModLogsModal
      v-if="showLogsModal"
      ref="logs"
      :userid="member.userid"
      @hidden="showLogsModal = false"
    />
  </div>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue'
import dayjs from 'dayjs'
import { useUserStore } from '~/stores/user'
import { useMemberStore } from '~/stores/member'
import { useModGroupStore } from '~/stores/modgroup'
import { useModMe } from '~/composables/useModMe'

const MEMBERSHIPS_SHOW = 3

const props = defineProps({
  membershipid: {
    type: Number,
    required: true,
  },
})

const memberStore = useMemberStore()
const member = computed(() => memberStore.get(props.membershipid))

const emit = defineEmits(['forcerefresh'])

const userStore = useUserStore()
const modGroupStore = useModGroupStore()
const { amAModOn } = useModMe()

const history = ref(null)
const logs = ref(null)

const showEmails = ref(false)
const type = ref(null)
const allmemberships = ref(false)
const showPostingHistoryModal = ref(false)
const showLogsModal = ref(false)
const reviewed = ref(false)

const isLJ = computed(() => {
  return user.value && user.value.ljuserid
})

const allmemberof = computed(() => {
  let ms = []

  if (member.value && member.value.memberships) {
    ms = member.value.memberships
  }

  if (!ms) {
    return []
  }

  return ms
})

const sortedMemberOf = computed(() => {
  const members = allmemberof.value

  return members.sort((a, b) => {
    const areview =
      amAModOn(a.id) &&
      a.reviewrequestedat &&
      (!a.reviewedat ||
        new Date(a.reviewrequestedat).getTime() >
          new Date(a.reviewedat).getTime())
    const breview =
      amAModOn(b.id) &&
      b.reviewrequestedat &&
      (!b.reviewedat ||
        new Date(b.reviewrequestedat).getTime() >
          new Date(b.reviewedat).getTime())

    if (areview && !breview) {
      return -1
    } else if (breview && !areview) {
      return 1
    } else {
      return b.added.localeCompare(a.added)
    }
  })
})

const memberof = computed(() => {
  if (allmemberships.value) {
    return sortedMemberOf.value
  } else {
    return sortedMemberOf.value.slice(0, MEMBERSHIPS_SHOW)
  }
})

const firstgrouppolygon = computed(() => {
  if (sortedMemberOf.value.length > 0) {
    const group = sortedMemberOf.value[0]
    const modgroup = modGroupStore.get(group.id)
    if (modgroup) return modgroup.poly
  }
  return null
})

const email = computed(() => {
  let ret = null

  if (user.value) {
    ret = user.value.email
    if (!ret && user.value.emails) {
      user.value.emails.forEach((e) => {
        if (!e.ourdomain && (!ret || e.preferred)) {
          ret = e.email
        }
      })
    }
  }

  return ret
})

const hiddenmemberofs = computed(() => {
  return allmemberships.value
    ? 0
    : allmemberof.value.length > MEMBERSHIPS_SHOW
    ? allmemberof.value.length - MEMBERSHIPS_SHOW
    : 0
})

const userEmails = computed(() => {
  return user.value?.emails
})

const lastaccess = computed(() => {
  return user.value?.lastaccess
})

const userinfo = computed(() => {
  return user.value?.info
})

const inactive = computed(() => {
  // This code matches server code in sendOurMails.
  return (
    lastaccess.value && dayjs().diff(dayjs(lastaccess.value), 'day') >= 365 / 2
  )
})

const user = computed(() => {
  return member.value ? userStore.byId(member.value.userid) : null
})

onMounted(() => {
  // Always fetch full user data with info for display.
  if (member.value) {
    userStore.fetchMT({
      id: member.value.userid,
      info: true,
    })
  }
})

function showHistory(typeArg = null) {
  type.value = typeArg
  showPostingHistoryModal.value = true
  history.value?.show()
}

function showLogs() {
  showLogsModal.value = true
  logs.value?.show()
}

function forcerefresh(hideMember = false) {
  if (hideMember) {
    reviewed.value = true
  }
  emit('forcerefresh')
}
</script>
