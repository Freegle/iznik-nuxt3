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
            :image="member.profile.turl"
            class="ml-1 mb-1 inline"
            is-thumbnail
            size="sm"
          />
          {{ member.displayname }}
        </div>
        <div v-if="member.joined">
          <v-icon icon="calendar-alt" /> {{ datetimeshort(member.joined) }}
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
        <ModComments :user="member" :expand-comments="expandComments" />
        <ModSpammer v-if="member.spammer" :user="member" :sameip="sameip" />
        <NoticeMessage
          v-if="member.suspectreason"
          variant="danger"
          class="mb-2"
        >
          This freegler is flagged: {{ member.suspectreason }}
        </NoticeMessage>
        <NoticeMessage
          v-if="member.activedistance > 50"
          variant="warning"
          class="mb-2"
        >
          This freegler recently active on groups
          {{ member.activedistance }} miles apart.
        </NoticeMessage>
        <ModBouncing v-if="member.bouncing" :user="member" />
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
              v-if="groupid && member.ourpostingstatus"
              :emailfrequency="member.emailfrequency"
              :membership-m-t="member"
              :moderation="member.ourpostingstatus"
              :userid="member.userid"
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
            <ModMemberSummary :member="member" />
            <ModMemberEngagement :member="member" />
            <div v-if="member.info && member.info.publiclocation">
              Public location: {{ member.info.publiclocation.location }}
            </div>
            <ModMemberActions
              v-if="!footeractions"
              :userid="member.userid"
              :groupid="groupid"
              :banned="Boolean(member.bandate)"
            />
            <ModMemberships :user="member" />
            <ModMemberLogins :member="member" />
            <b-button
              v-if="member.emails && member.emails.length"
              variant="link"
              @click="showEmails = !showEmails"
            >
              <v-icon icon="envelope" />
              <span v-if="showEmails">
                <span class="d-inline d-sm-none"> Hide </span>
                <span class="d-none d-sm-inline">
                  Show {{ pluralise('email', member.emails.length, true) }}
                </span>
              </span>
              <span v-else>
                <span class="d-inline d-sm-none">
                  {{ member.emails.length }}
                </span>
                <span class="d-none d-sm-inline">
                  Show {{ pluralise('email', member.emails.length, true) }}
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
              <div v-for="e in member.emails" :key="e.id">
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
      :user="member"
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
<script>
import { useUserStore } from '~/stores/user'
import { useMemberStore } from '~/stores/member'
import { useModConfigStore } from '~/stores/modconfig'
import { useChatStore } from '~/stores/chat'
import { useMe } from '~/composables/useMe'

export default {
  props: {
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
  },
  setup() {
    const chatStore = useChatStore()
    const memberStore = useMemberStore()
    const userStore = useUserStore()
    const modConfigStore = useModConfigStore()
    const { me, myGroups, myGroup } = useMe()
    return {
      chatStore,
      memberStore,
      modConfigStore,
      userStore,
      me,
      myGroups,
      myGroup,
    }
  },
  data: function () {
    return {
      saving: false,
      saved: false,
      showEmails: false,
      type: null,
      allmemberships: false,
      showPostingHistoryModal: false,
      showLogsModal: false,
      showUnbanModal: false,
      showUnbanModalTitle: '',
      showModChatModal: false,
      banned: false,
      chatid: 0,
    }
  },
  computed: {
    email() {
      // Depending on which context we're used it, we might or might not have an email returned.
      let ret = this.member.email

      if (!this.member.email && this.member.emails) {
        this.member.emails.forEach((e) => {
          if (!e.ourdomain && (!ret || e.preferred)) {
            ret = e.email
          }
        })
      }

      return ret
    },
    groupid() {
      return this.member.groupid
    },
    group() {
      return this.myGroup(this.groupid)
    },
    modconfig() {
      let ret = null
      let configid = null

      this.myGroups.forEach((group) => {
        if (group.id === this.groupid) {
          configid = group.configid
        }
      })
      const configs = this.modConfigStore.configs
      ret = configs.find((config) => config.id === configid)

      return ret
    },
    user() {
      return this.member
    },
    isTN() {
      let ret = false
      if (this.user) {
        if (this.user.emails) {
          this.user.emails.forEach((e) => {
            if (e.email && e.email.includes('@user.trashnothing.com')) {
              ret = true
            }
          })
        }
      }

      return ret
    },
    isLJ() {
      return this.user && this.user.ljuserid
    },
    settings() {
      if (this.user && this.user.settings && this.user.settings) {
        return this.user.settings
      } else {
        return {}
      }
    },
    notifications() {
      let ret = {}

      if (this.settings && this.settings.notifications) {
        ret = this.settings.notifications
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
    },
    relevantallowed: {
      get() {
        return this.user && Boolean(this.user.relevantallowed)
      },
      set(newval) {
        this.user.relevantallowed = newval
      },
    },
    newslettersallowed: {
      get() {
        return this.user && Boolean(this.user.newslettersallowed)
      },
      set(newval) {
        this.user.newslettersallowed = newval
      },
    },
    autorepost: {
      get() {
        return (
          this.member && !this.isTN && Boolean(!this.member.autorepostsdisable)
        )
      },
      setnewval() {},
    },
  },
  mounted() {
    if (this.member.banned) {
      this.banned = true
    }

    if (!this.user) {
      // Fetch with info so that we can display more.
      this.userStore.fetchMT({
        id: this.member.userid,
        info: true,
      })
    }
  },
  methods: {
    showHistory(type = null) {
      this.type = type
      this.showPostingHistoryModal = true
      this.$refs.history?.show()
    },
    showLogs() {
      this.modmailsonly = false
      this.showLogsModal = true
      this.$refs.logs?.show()
    },
    settingsChange(param, groupid, val) {
      const params = {
        userid: this.member.userid,
        groupid,
      }
      params[param] = val
      this.memberStore.update(params)
    },
    async changeNotification(e, type) {
      const settings = this.settings
      const notifications = this.notifications
      notifications[type] = e.value
      settings.notifications = notifications

      await this.userStore.edit({
        id: this.user.id,
        settings,
      })
    },
    async changeRelevant(e) {
      await this.userStore.edit({
        id: this.user.id,
        relevantallowed: e.value,
      })
    },
    async changeNotifChitchat(e) {
      const settings = this.user.settings
      settings.notificationmails = e.value
      await this.userStore.edit({
        id: this.user.id,
        settings,
      })
    },
    async changeNewsletter(e) {
      await this.userStore.edit({
        id: this.user.id,
        newslettersallowed: e.value,
      })
    },
    async changeAutorepost(e) {
      const settings = this.user.settings || {}
      settings.autorepostsdisable = !e.value
      await this.userStore.edit({
        id: this.member.userid,
        settings,
      })
    },
    confirmUnban(member) {
      this.showUnbanModal = true
      this.showUnbanModalTitle = 'Unban #' + member.userid
      this.$refs.unbanConfirm?.show()
    },
    async unban() {
      this.showUnbanModal = false
      await this.memberStore.unban(this.member.userid, this.groupid)
      // eslint-disable-next-line vue/no-mutating-props
      delete this.member.bandate
      // eslint-disable-next-line vue/no-mutating-props
      delete this.member.bannedby
    },
    async showChat() {
      this.chatid = await this.chatStore.openChatToMods(
        this.member.groupid,
        this.member.userid
      )
      this.showModChatModal = true
      this.$refs.modChatModal?.show()
    },
  },
}
</script>
