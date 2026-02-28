<template>
  <div v-if="member">
    <b-card bg-variant="white" no-body>
      <b-card-header class="d-flex justify-content-between flex-wrap">
        <div>
          <div v-if="isLJ">LoveJunk user #{{ user.ljuserid }}</div>
          <div v-else-if="email">
            <!-- eslint-disable-next-line -->
            <ModClipboard class="mr-1" :value="email" />
            <ExternalLink :href="'mailto:' + email">{{ email }}</ExternalLink>
          </div>
        </div>
        <div>
          <ProfileImage
            :image="user.profile?.turl"
            :name="user.displayname || member.fullname"
            class="ml-1 mb-1 inline"
            is-thumbnail
            size="sm"
          />
          {{ user.displayname || member.fullname }}
        </div>
        <div v-if="member.added || member.joined">
          <v-icon icon="calendar-alt" />
          {{ datetimeshort(member.added || member.joined) }}
        </div>
        <div><v-icon icon="hashtag" />{{ member.userid }}</div>
      </b-card-header>
      <b-card-body>
        <ModDeletedOrForgotten v-if="user" :user="user" />
        <NoticeMessage v-if="banned" variant="danger" class="mb-2">
          This freegler is banned from this group.
        </NoticeMessage>
        <div v-if="member.heldby">
          <NoticeMessage variant="warning" class="mb-2">
            <p v-if="me.id === member.heldby.id">
              You held this member. Other people will see a warning to check
              with you before releasing them.
            </p>
            <p v-else>
              Held by <strong>{{ member.heldby.displayname }}</strong
              >. Please check before releasing them.
            </p>
            <ModMemberButton
              v-if="member.heldby"
              :member="member"
              variant="warning"
              icon="play"
              release
              label="Release"
            />
          </NoticeMessage>
        </div>
        <ModComments
          :userid="member.userid"
          :expand-comments="expandComments"
        />
        <ModSpammer v-if="user.spammer" :user="user" :sameip="sameip" />
        <NoticeMessage v-if="user.suspectreason" variant="danger" class="mb-2">
          This freegler is flagged: {{ user.suspectreason }}
        </NoticeMessage>
        <NoticeMessage
          v-if="user.activedistance > 50"
          variant="warning"
          class="mb-2"
        >
          This freegler recently active on groups
          {{ user.activedistance }} miles apart.
        </NoticeMessage>
        <ModBouncing v-if="user.bouncing" :user="user" />
        <NoticeMessage v-if="member.bandate">
          Banned
          <span :title="datetime(member.bandate)">{{
            timeago(member.bandate)
          }}</span>
          <span v-if="member.bannedby"> by #{{ member.bannedby }}</span> - check
          logs for info.
          <b-button variant="link" size="sm" @click="confirmUnban(member)">
            Unban
          </b-button>
        </NoticeMessage>
        <div class="d-flex justify-content-between flex-wrap">
          <div class="border border-info p-1 flex-grow-1 mr-1">
            <SettingsGroup
              v-if="groupid"
              :emailfrequency="member.emailfrequency"
              :membership-m-t="member"
              xclass="border border-info p-1 flex-grow-1 mr-1"
              @update:emailfrequency="
                settingsChange('emailfrequency', groupid, $event)
              "
              @update:eventsallowed="
                settingsChange('eventsallowed', groupid, $event)
              "
              @update:volunteeringallowed="
                settingsChange('volunteeringallowed', groupid, $event)
              "
            />
            <div class="fw-bold mt-1">Moderation status:</div>
            <ModModeration
              :user="user"
              :userid="member.userid"
              :membership="member"
              class="order-2 order-md-3 order-lg-4"
            />
          </div>
          <div>
            <ModMemberSummary :member="user" />
            <ModMemberEngagement :member="user" />
            <div v-if="user.info && user.info.publiclocation">
              Public location: {{ user.info.publiclocation.location }}
            </div>
            <ModMemberActions
              v-if="!footeractions"
              :userid="member.userid"
              :groupid="groupid"
              :banned="Boolean(member.bandate)"
            />
            <ModMemberships :userid="member.userid" />
            <ModMemberLogins :member="user" />
            <b-button
              v-if="user.emails && user.emails.length"
              variant="link"
              @click="showEmails = !showEmails"
            >
              <v-icon icon="envelope" />
              <span v-if="showEmails">
                <span class="d-inline d-sm-none"> Hide </span>
                <span class="d-none d-sm-inline">
                  Show {{ pluralise('email', user.emails.length, true) }}
                </span>
              </span>
              <span v-else>
                <span class="d-inline d-sm-none">
                  {{ user.emails.length }}
                </span>
                <span class="d-none d-sm-inline">
                  Show {{ pluralise('email', user.emails.length, true) }}
                </span>
              </span>
            </b-button>
            <b-button variant="link" @click="showHistory(null)">
              View posts
            </b-button>
            <b-button variant="link" @click="showLogs"> View logs </b-button>
            <b-button variant="link" :to="'/profile/' + member.userid">
              View profile
            </b-button>
            <div v-if="showEmails">
              <div v-for="e in user.emails" :key="e.id">
                {{ e.email }} <v-icon v-if="e.preferred" icon="star" />
              </div>
            </div>
          </div>
        </div>
        <div v-if="user && user.id && !isTN && !isLJ">
          <hr />
          <div class="d-flex justify-content-between flex-wrap">
            <OurToggle
              v-model="notifications.email"
              :height="30"
              :width="200"
              :font-size="14"
              :sync="true"
              size="sm"
              :labels="{ checked: 'Chat On', unchecked: 'Chat Off' }"
              variant="modgreen"
              class="mb-2"
              @change="changeNotification($event, 'email')"
            />
            <OurToggle
              v-model="notifications.emailmine"
              :height="30"
              :width="200"
              :font-size="14"
              :sync="true"
              size="sm"
              :labels="{ checked: 'Own Chats On', unchecked: 'Own Chats Off' }"
              variant="modgreen"
              class="mb-2"
              @change="changeNotification($event, 'emailmine')"
            />
            <OurToggle
              v-model="settings.notificationmails"
              :height="30"
              :width="200"
              :font-size="14"
              :sync="true"
              size="sm"
              :labels="{
                checked: 'Notification/ChitChat On',
                unchecked: 'Notification/ChitChat On',
              }"
              variant="modgreen"
              class="mb-2"
              @change="changeNotifChitchat"
            />
            <OurToggle
              v-model="relevantallowed"
              :height="30"
              :width="200"
              :font-size="14"
              :sync="true"
              size="sm"
              :labels="{
                checked: 'Suggestions On',
                unchecked: 'Suggestions Off',
              }"
              variant="modgreen"
              class="mb-2"
              @change="changeRelevant"
            />
            <OurToggle
              v-model="newslettersallowed"
              :height="30"
              :width="200"
              :font-size="14"
              :sync="true"
              size="sm"
              :labels="{
                checked: 'Newsletters On',
                unchecked: 'Newsletters Off',
              }"
              variant="modgreen"
              class="mb-2"
              @change="changeNewsletter"
            />
            <OurToggle
              v-model="autorepost"
              :height="30"
              :width="200"
              :font-size="14"
              :sync="true"
              size="sm"
              :labels="{
                checked: 'Autorepost On',
                unchecked: 'Autorepost Off',
              }"
              variant="modgreen"
              class="mb-2"
              @change="changeAutorepost"
            />
          </div>
        </div>
      </b-card-body>
      <b-card-footer class="d-flex justify-content-between flex-wrap">
        <ModMemberButtons
          :member="member"
          :modconfig="modconfig"
          :actions="footeractions"
        />
        <div
          class="d-flex justify-content-between justify-content-md-end flex-grow-1"
        >
          <ModRole
            v-if="groupid && member.role"
            :userid="member.userid"
            :groupid="groupid"
            :role="member.role"
          />
          <!--div v-if="chatid" class="d-inline btn border">
            <v-icon class="me-1" style="color: blue" icon="comments" />
            <NuxtLink :to="'/chats/' + chatid">Chat</NuxtLink>
          </div-->
          <b-button variant="white" class="mr-2 mb-1" @click="showChat">
            <v-icon icon="comments" /> View Chat
          </b-button>
          <ChatButton
            :userid="member.userid"
            :groupid="member.groupid"
            title="Chat"
            variant="white"
            class="ml-1"
          />
        </div>
      </b-card-footer>
    </b-card>
    <ModPostingHistoryModal
      v-if="showPostingHistoryModal"
      ref="history"
      :user="user"
      :type="type"
      @hidden="showPostingHistoryModal = false"
    />
    <ModLogsModal
      v-if="showLogsModal"
      ref="logs"
      :userid="member.userid"
      @hidden="showLogsModal = false"
    />
    <ConfirmModal
      v-if="showUnbanModal"
      ref="unbanConfirm"
      :title="showUnbanModalTitle"
      @confirm="unban"
      @hidden="showUnbanModal = false"
    />
    <ModChatModal
      v-if="showModChatModal && chatid"
      :id="chatid"
      ref="modChatModal"
      :pov="0"
      @hidden="showModChatModal = false"
    />
  </div>
</template>
<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useUserStore } from '~/stores/user'
import { useMemberStore } from '~/stores/member'
import { useModConfigStore } from '~/stores/modconfig'
import { useChatStore } from '~/stores/chat'
import { useMe } from '~/composables/useMe'

const props = defineProps({
  member: {
    type: Object,
    required: true,
  },
  spammerlist: {
    type: Boolean,
    required: false,
    default: false,
  },
  footeractions: {
    type: Boolean,
    required: false,
    default: true,
  },
  expandComments: {
    type: Boolean,
    required: false,
    default: false,
  },
  sameip: {
    type: Array,
    required: false,
    default: null,
  },
})

const chatStore = useChatStore()
const memberStore = useMemberStore()
const userStore = useUserStore()
const modConfigStore = useModConfigStore()
const { me, myGroups } = useMe()

const history = ref(null)
const logs = ref(null)
const unbanConfirm = ref(null)
const modChatModal = ref(null)

const showEmails = ref(false)
const type = ref(null)
const showPostingHistoryModal = ref(false)
const showLogsModal = ref(false)
const showUnbanModal = ref(false)
const showUnbanModalTitle = ref('')
const showModChatModal = ref(false)
const banned = ref(false)
const chatid = ref(0)

const email = computed(() => {
  // Email comes from full user data (fetched via userStore.fetchMT).
  let ret = user.value?.email

  if (!ret && user.value?.emails) {
    user.value.emails.forEach((e) => {
      if (!e.ourdomain && (!ret || e.preferred)) {
        ret = e.email
      }
    })
  }

  return ret
})

const groupid = computed(() => {
  return props.member.groupid
})

const configid = computed(() => {
  let id = null
  myGroups.value.forEach((group) => {
    if (group.id === groupid.value) {
      id = group.configid
    }
  })
  return id
})

const modconfig = computed(() => {
  if (!configid.value) return null
  return modConfigStore.configsById[configid.value] || null
})

watch(
  configid,
  async (id) => {
    if (id) {
      await modConfigStore.fetchById(id)
    }
  },
  { immediate: true }
)

const user = computed(() => {
  // Full user data from store, populated by fetchMT on mount.
  // Falls back to props.member for fields not yet loaded.
  const storeUser = userStore.list[props.member.userid]
  return storeUser || props.member
})

const isTN = computed(() => {
  let ret = false
  if (user.value) {
    if (user.value.emails) {
      user.value.emails.forEach((e) => {
        if (e.email && e.email.includes('@user.trashnothing.com')) {
          ret = true
        }
      })
    }
  }

  return ret
})

const isLJ = computed(() => {
  return user.value && user.value.ljuserid
})

const settings = computed(() => {
  if (user.value && user.value.settings && user.value.settings) {
    return user.value.settings
  } else {
    return {}
  }
})

const notifications = computed(() => {
  let ret = {}

  if (settings.value && settings.value.notifications) {
    ret = settings.value.notifications
  } else {
    ret = {
      email: true,
      emailmine: false,
      push: true,
      facebook: true,
      app: true,
    }
  }

  return ret
})

const relevantallowed = computed({
  get() {
    return user.value && Boolean(user.value.relevantallowed)
  },
  set(newval) {
    user.value.relevantallowed = newval
  },
})

const newslettersallowed = computed({
  get() {
    return user.value && Boolean(user.value.newslettersallowed)
  },
  set(newval) {
    user.value.newslettersallowed = newval
  },
})

const autorepost = computed({
  get() {
    return (
      props.member && !isTN.value && Boolean(!props.member.autorepostsdisable)
    )
  },
  set() {},
})

onMounted(() => {
  if (props.member.banned) {
    banned.value = true
  }

  // Fetch full user data via V2 pattern - cached in userStore.
  if (props.member.userid) {
    userStore.fetchMT({
      id: props.member.userid,
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

function settingsChange(param, groupidArg, val) {
  const params = {
    userid: props.member.userid,
    groupid: groupidArg,
  }
  params[param] = val
  memberStore.update(params)
}

async function changeNotification(e, notifType) {
  const settingsObj = settings.value
  const notificationsObj = notifications.value
  notificationsObj[notifType] = e.value
  settingsObj.notifications = notificationsObj

  await userStore.edit({
    id: user.value.id,
    settings: settingsObj,
  })
}

async function changeRelevant(e) {
  await userStore.edit({
    id: user.value.id,
    relevantallowed: e.value,
  })
}

async function changeNotifChitchat(e) {
  const settingsObj = user.value.settings
  settingsObj.notificationmails = e.value
  await userStore.edit({
    id: user.value.id,
    settings: settingsObj,
  })
}

async function changeNewsletter(e) {
  await userStore.edit({
    id: user.value.id,
    newslettersallowed: e.value,
  })
}

async function changeAutorepost(e) {
  const settingsObj = user.value.settings || {}
  settingsObj.autorepostsdisable = !e.value
  await userStore.edit({
    id: props.member.userid,
    settings: settingsObj,
  })
}

function confirmUnban(memberArg) {
  showUnbanModal.value = true
  showUnbanModalTitle.value = 'Unban #' + memberArg.userid
  unbanConfirm.value?.show()
}

async function unban() {
  showUnbanModal.value = false
  await memberStore.unban(props.member.userid, groupid.value)
  // eslint-disable-next-line vue/no-mutating-props
  delete props.member.bandate
  // eslint-disable-next-line vue/no-mutating-props
  delete props.member.bannedby
}

async function showChat() {
  chatid.value = await chatStore.openChatToMods(
    props.member.groupid,
    props.member.userid
  )
  showModChatModal.value = true
  modChatModal.value?.show()
}
</script>
