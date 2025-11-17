<template>
  <div v-if="member && !reviewed">
    <b-card bg-variant="white" no-body>
      <b-card-header class="d-flex justify-content-between flex-wrap">
        <div>
          <div v-if="isLJ">LoveJunk user #{{ user.ljuserid }}</div>
          <!-- eslint-disable-next-line -->
          <v-icon icon="envelope" />
          <ExternalLink :href="'mailto:' + email">{{ email }}</ExternalLink>
        </div>
        <div>
          <ProfileImage
            :image="member.profile.turl"
            class="ml-1 mb-1 inline"
            is-thumbnail
            size="sm"
          />
          {{ member.displayname }}
          <ModSupporter v-if="member.supporter" class="d-inline" />
        </div>
        <div v-if="member.joined">
          <v-icon icon="calendar-alt" /> {{ datetimeshort(member.joined) }}
        </div>
        <div><v-icon icon="hashtag" />{{ member.userid }}</div>
      </b-card-header>
      <b-card-body>
        <ModComments :user="member" />
        <ModSpammer v-if="member.spammer" :user="member" />
        <NoticeMessage v-if="member.systemrole !== 'User'" variant="info">
          This freegler has role: {{ member.systemrole }}.
        </NoticeMessage>
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
        </NoticeMessage>
        <div class="d-flex justify-content-between flex-wrap">
          <div>
            <ModMemberSummary :member="member" />
            <div
              v-if="member.lastaccess"
              :class="'mb-1 ' + (inactive ? 'text-danger' : '')"
            >
              Last active: {{ timeago(member.lastaccess) }}
              <span v-if="inactive"> - won't send mails </span>
            </div>
            <div class="d-flex justify-content-between flex-wrap">
              <div v-if="member.info && member.info.publiclocation">
                Public location: {{ member.info.publiclocation.location }}
              </div>
              <div v-if="member.info && member.info.privateposition">
                Private location: {{ member.info.privateposition.loc }}
              </div>
            </div>
            <MessageMap
              v-if="member.info && member.info.privateposition"
              :position="member.info.privateposition"
              :boundary="firstgrouppolygon"
              class="mt-2"
            />
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
            <b-button
              variant="link"
              :href="'https://ilovefreegle.org/profile/' + member.userid"
              target="_blank"
            >
              View profile
            </b-button>
            <div v-if="showEmails">
              <div v-for="e in member.emails" :key="e.id">
                {{ e.email }} <v-icon v-if="e.preferred" icon="star" />
              </div>
            </div>
          </div>
        </div>
        <ModMemberReviewActions
          v-for="m in memberof"
          :key="'membership-' + m.membershipid"
          :memberid="member.id"
          :membership="m"
          :member="member"
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
  </div>
</template>
<script>
import dayjs from 'dayjs'
import { useUserStore } from '~/stores/user'
import { useModGroupStore } from '~/stores/modgroup'
import { useModMe } from '~/composables/useModMe'

const MEMBERSHIPS_SHOW = 3

export default {
  name: 'ModMember',
  props: {
    member: {
      type: Object,
      required: true,
    },
  },
  emits: ['forcerefresh'],
  setup() {
    const userStore = useUserStore()
    const modGroupStore = useModGroupStore()
    const { amAModOn } = useModMe()
    return {
      userStore,
      amAModOn,
      modGroupStore,
    }
  },
  data: function () {
    return {
      saving: false,
      saved: false,
      showEmails: false,
      type: null,
      allmemberships: false,
      showSpamModal: false,
      showPostingHistoryModal: false,
      showLogsModal: false,
      reviewed: false,
    }
  },
  computed: {
    isLJ() {
      return this.user && this.user.ljuserid
    },
    allmemberof() {
      let ms = []

      if (this.member && this.member.memberof) {
        ms = this.member.memberof
      }

      if (!ms) {
        return []
      }

      return ms
    },
    memberof() {
      if (this.allmemberships) {
        return this.sortedMemberOf
      } else {
        return this.sortedMemberOf.slice(0, MEMBERSHIPS_SHOW)
      }
    },
    sortedMemberOf() {
      const members = this.allmemberof

      return members.sort((a, b) => {
        const areview =
          this.amAModOn(a.id) &&
          a.reviewrequestedat &&
          (!a.reviewedat ||
            new Date(a.reviewrequestedat).getTime() >
              new Date(a.reviewedat).getTime())
        const breview =
          this.amAModOn(b.id) &&
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
    },
    firstgrouppolygon() {
      if (this.sortedMemberOf.length > 0) {
        const group = this.sortedMemberOf[0]
        const modgroup = this.modGroupStore.get(group.id)
        if (modgroup) return modgroup.polygon
      }
      return null
    },
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
    hiddenmemberofs() {
      return this.allmemberships
        ? 0
        : this.allmemberof.length > MEMBERSHIPS_SHOW
        ? this.allmemberof.length - MEMBERSHIPS_SHOW
        : 0
    },
    inactive() {
      // This code matches server code in sendOurMails.
      return (
        this.member &&
        this.member.lastaccess &&
        dayjs().diff(dayjs(this.member.lastaccess), 'day') >= 365 / 2
      )
    },
    user() {
      return this.userStore.byId(this.member.userid)
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
  },
  mounted() {
    if (!this.member.info) {
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
    forcerefresh(hideMember = false) {
      if (hideMember) {
        this.reviewed = true
      }
      this.$emit('forcerefresh')
    },
  },
}
</script>
