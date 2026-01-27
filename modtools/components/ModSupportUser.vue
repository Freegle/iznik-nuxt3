<template>
  <b-card v-if="user" no-body class="container p-0 m-0">
    <b-card-header class="clickme p-1" @click="maybeExpand">
      <b-row>
        <b-col
          cols="10"
          lg="4"
          class="order-1 truncate2"
          :title="preferredemail"
        >
          <div v-if="preferredemail">
            <ModClipboard class="mr-1" :value="preferredemail" />
            {{ preferredemail }}
          </div>
          <div v-if="user.tnuserid" class="text-muted small">
            TN user id <v-icon icon="hashtag" scale="0.6" />{{ user.tnuserid }}
          </div>
        </b-col>
        <b-col cols="2" lg="1" class="order-2 order-lg-7">
          <span class="d-block d-sm-none float-end">
            <v-icon v-if="!expanded" icon="caret-down" />
            <v-icon v-else icon="caret-up" />
          </span>
          <b-button
            variant="white"
            size="sm"
            class="d-none d-sm-block float-end"
          >
            <v-icon v-if="!expanded" icon="caret-down" />
            <v-icon v-else icon="caret-up" />
          </b-button>
        </b-col>
        <b-col cols="12" lg="3" class="order-3 truncate2">
          <v-icon icon="user" /> {{ user.displayname }}
        </b-col>
        <b-col cols="5" lg="2" class="order-4">
          <v-icon icon="hashtag" scale="0.75" class="text-muted" />{{ user.id }}
        </b-col>
        <b-col cols="7" lg="2" class="order-5 text-right">
          {{ timeago(user.lastaccess) }}
        </b-col>
      </b-row>
    </b-card-header>
    <b-card-body v-if="expanded" class="p-1">
      <ModBouncing v-if="user.bouncing" :user="user" class="mb-2" />
      <NoticeMessage v-if="user.systemrole === 'Admin'" class="mb-2">
        This user has admin rights.
      </NoticeMessage>
      <NoticeMessage v-if="user.systemrole === 'Support'" class="mb-2">
        This user has support rights.
      </NoticeMessage>
      <ModSpammer v-if="user.spammer" class="mb-2" :user="user" />
      <ModComments :user="user" />

      <div class="d-flex flex-wrap">
        <b-button variant="white" class="mr-2 mb-1" @click="spamReport">
          <v-icon icon="ban" /> Spammer
        </b-button>
        <b-button variant="white" class="mr-2 mb-1" @click="purge">
          <v-icon icon="trash-alt" /> Purge
        </b-button>
        <b-button
          variant="white"
          class="mr-2 mb-1"
          :href="user.loginlink"
          target="_blank"
          rel="noopener noreferrer"
        >
          <v-icon icon="user" /> Impersonate - must right-click and open in
          Incognito/Private window
        </b-button>
        <b-button
          v-if="admin"
          variant="white"
          class="mr-2 mb-1"
          :href="
            user.loginlink
              ? user.loginlink.replace(/http.*\?u/, 'http://localhost:3002/?u')
              : null
          "
          target="_blank"
          rel="noopener noreferrer"
        >
          <v-icon icon="user" /> Impersonate (localhost:3002)
        </b-button>
        <ModMergeButton class="mr-2 mb-1" />
        <b-button variant="white" class="mr-2 mb-1" @click="showLogsModal">
          <v-icon icon="book-open" /> Logs
        </b-button>
        <b-button variant="white" class="mr-2 mb-1" @click="profile">
          <v-icon icon="user" /> Profile
        </b-button>
        <b-button variant="white" class="mr-2 mb-1" @click="addAComment">
          <v-icon icon="tag" /> Add note
        </b-button>
      </div>
      <ModDeletedOrForgotten v-if="user" :user="user" />
      <h3 class="mt-2">Trust Level</h3>
      <p>This controls whether someone is asked to do micromoderation tasks.</p>
      <p>
        <span v-if="!user.trustlevel"
          ><strong>None</strong> - we've not yet asked them</span
        >
        <span v-else-if="user.trustlevel === 'Basic'"
          ><strong>Basic</strong> - has consented, using information visible to
          all members</span
        >
        <span v-else-if="user.trustlevel === 'Moderate'"
          ><strong>Moderate</strong> - some information not visible to all
          members</span
        >
        <span v-else-if="user.trustlevel === 'Advanced'"
          ><strong>Advanced</strong> - significant information not visible to
          all members</span
        >
        <span v-else-if="user.trustlevel === 'Declined'"
          ><strong>Declined</strong> - said they don't want to do this</span
        >
        <span v-else-if="user.trustlevel === 'Disabled'"
          ><strong>Disabled</strong> - prevented by a mod</span
        >
      </p>
      <div v-if="user.giftaid">
        <h3 class="mt-2">Gift Aid</h3>
        <p>
          Gift Aid consent <v-icon icon="hashtag" scale="0.8" />{{
            user.giftaid.id
          }}
          given on {{ dateonly(user.giftaid.timestamp) }} -
          <span v-if="user.giftaid.period === 'Since'">
            for donations since this date.
          </span>
          <span v-if="user.giftaid.period === 'This'">
            for this donation only.
          </span>
          <span v-if="user.giftaid.period === 'Future'">
            for this and future donations.
          </span>
          <span v-if="user.giftaid.period === 'Declined'"> declined. </span>
          <span v-if="user.giftaid.period === 'Past4YearsAndFuture'">
            four years before date and all future.
          </span>
        </p>
      </div>
      <div v-if="user.donations">
        <h3 class="mt-2">Donations</h3>
        <div v-for="d in user.donations" :key="'donation-' + d.id">
          <div v-if="!d.GrossAmount">
            {{ dateshort(d.timestamp) }}
            <span class="small text-muted"
              >Probable manual dummy donation or donation via JustGiving; amount
              unknown; gift aid claimed by them not us</span
            >
          </div>
          <div v-else>
            &pound;{{ d.GrossAmount }} on {{ dateshort(d.timestamp) }}
            <span class="small text-muted"
              >via
              <span v-if="d.source === 'BankTransfer'">
                Bank Transfer or Cheque
              </span>
              <span v-else>
                {{ d.source }}
              </span>
              <span
                v-if="
                  d.source === 'PayPalGivingFund' ||
                  d.source === 'eBay' ||
                  d.source === 'Facebook'
                "
                class="small text-muted"
              >
                (Gift Aid claimed by them not us)
              </span>
            </span>
          </div>
        </div>
      </div>
      <h3 class="mt-2">Location</h3>
      <b-row>
        <b-col cols="12" md="6">
          <div class="d-flex justify-content-between">
            <div>
              <v-icon class="text-muted" icon="globe-europe" /> Location on
              ChitChat
            </div>
            <div v-if="user.info && user.info.publiclocation">
              {{ user.info.publiclocation.display }}
            </div>
            <div v-else>Unknown</div>
          </div>
        </b-col>
      </b-row>
      <b-row>
        <b-col cols="12" md="6">
          <div class="d-flex justify-content-between">
            <div>
              <v-icon class="text-muted" icon="lock" /> Best guess lat/lng
            </div>
            <div v-if="user.privateposition">
              <div v-if="user.privateposition.lat || user.privateposition.lng">
                {{ Math.round(user.privateposition.lat * 100) / 100 }},
                {{ Math.round(user.privateposition.lng * 100) / 100 }}
                <ExternalLink
                  :href="
                    'https://www.google.com/maps?q=' +
                    user.privateposition.lat +
                    ',' +
                    user.privateposition.lng
                  "
                >
                  Show on map
                </ExternalLink>
              </div>
              <div v-else>Not known</div>
            </div>
            <div v-else>Not known</div>
          </div>
        </b-col>
      </b-row>
      <h3 class="mt-2">Logins</h3>
      <ModMemberLogins :member="user" />
      <div class="d-flex justify-content-between flex-wrap">
        <b-input-group class="mt-2">
          <b-form-input
            v-model="newpassword"
            type="text"
            placeholder="Reset password"
            autocomplete="off"
            class="max"
          />
          <slot name="append">
            <SpinButton
              variant="white"
              icon-name="save"
              label="Set Password"
              @handle="setPassword"
            />
          </slot>
        </b-input-group>
        <b-input-group v-if="!user.tnuserid && !user.ljuserid" class="mt-2">
          <b-form-input
            v-model="newemail"
            type="text"
            placeholder="Add email"
            autocomplete="off"
            class="max"
          />
          <b-form-select v-model="newEmailAs" class="max">
            <option value="1">As Primary</option>
            <option value="2">As Secondary</option>
          </b-form-select>
          <slot name="append">
            <SpinButton
              variant="white"
              icon-name="save"
              label="Add Email"
              @handle="addEmail"
            />
          </slot>
        </b-input-group>
        <NoticeMessage v-if="emailAddError" variant="danger" class="mt-2">
          {{ emailAddError }}
        </NoticeMessage>
      </div>
      <h3 class="mt-2">Notifications</h3>
      <div v-if="user.lastpush">
        Last push notification: {{ timeago(user.lastpush) }}
      </div>
      <div v-else>No push notifications sent.</div>
      <h3 class="mt-2">Memberships</h3>
      <div v-if="memberships && memberships.length">
        <div
          v-for="membership in memberships"
          :key="'membership-' + membership.id"
        >
          <ModSupportMembership
            :membership="membership"
            :userid="user.id"
            @fetchuser="fetchUser"
          />
        </div>
        <b-button
          v-if="!showAllMemberships && membershipsUnshown"
          variant="white"
          class="mt-1"
          @click="showAllMemberships = true"
        >
          Show +{{ membershipsUnshown }}
        </b-button>
      </div>
      <p v-else>No memberships.</p>
      <div v-if="user.bans">
        <div
          v-for="ban in user.bans"
          :key="'ban-' + ban.date"
          class="text-danger"
        >
          Banned on {{ ban.group }} by {{ ban.byemail }} {{ timeago(ban.date) }}
        </div>
      </div>
      <h3 class="mt-2">Other Known Emails</h3>
      <div v-if="otherEmails && otherEmails.length">
        <div
          v-for="otheremail in otherEmails"
          :key="'otheremail-' + otheremail.id"
        >
          {{ otheremail.email }}
          <span class="text-muted" :title="otheremail.added.toLocaleString()">
            added {{ timeago(otheremail.added) }}
          </span>
        </div>
      </div>
      <p v-else>No other emails.</p>
      <h3 class="mt-2">Membership History</h3>
      <h4>Recent Applications</h4>
      <div v-if="user.applied && user.applied.length">
        <div
          v-for="applied in user.applied"
          :key="'applied-' + id + '-' + applied.added"
        >
          {{ applied.nameshort }}
          <span class="text-muted" :title="applied.added.toLocaleString()">
            {{ timeago(applied.added) }}
          </span>
        </div>
      </div>
      <div v-else>No recent applications.</div>
      <h4 class="mt-2">Full History</h4>
      <div v-if="membershipHistoriesShown.length">
        <div
          v-for="membershiphistory in membershipHistoriesShown"
          :key="'membershiphistory-' + membershiphistory.timestamp"
        >
          {{ membershiphistory.group.nameshort }}
          <span
            class="text-muted"
            :title="membershiphistory.timestamp.toLocaleString()"
          >
            {{ timeago(membershiphistory.timestamp) }}
          </span>
        </div>
        <b-button
          v-if="!showAllMembershipHistories && membershipHistoriesUnshown"
          variant="white"
          class="mt-1"
          @click="showAllMembershipHistories = true"
        >
          Show +{{ membershipHistoriesUnshown }}
        </b-button>
      </div>
      <div v-else>No application history.</div>
      <h3 class="mt-2">Posting History</h3>
      <ModMemberSummary :member="user" />
      <div v-if="messageHistoriesShown.length">
        <b-row
          v-for="message in messageHistoriesShown"
          :key="'messagehistory-' + message.arrival + '-' + message.id"
          :class="{ 'pl-3': true, strike: message.deleted }"
        >
          <b-col cols="4" md="2" class="order-1 p-1 small">
            {{ datetimeshort(message.arrival) }}
          </b-col>
          <b-col cols="4" md="2" class="order-3 order-md-2 p-1 small">
            <ExternalLink
              :href="'https://www.ilovefreegle.org/message/' + message.id"
            >
              <v-icon icon="hashtag" class="text-muted" scale="0.75" />{{
                message.id
              }}
            </ExternalLink>
            <span
              :class="
                message.collection != 'Approved' ? 'text-danger' : 'text-muted'
              "
              >{{ message.collection }}</span
            >
            <br />
            <span class="text-muted">{{ message.groupname }}</span>
          </b-col>
          <b-col cols="8" md="6" class="order-2 order-md-3 p-1">
            {{ message.subject }}
            <span v-if="message.outcome" class="text-info small">
              {{ message.outcome }}
            </span>
          </b-col>
          <b-col cols="6" md="2" class="small order-4 p-1">
            {{ message.fromaddr }}
          </b-col>
        </b-row>
        <b-button
          v-if="!showAllMessageHistories && messageHistoriesUnshown"
          variant="white"
          class="mt-1"
          @click="showAllMessageHistories = true"
        >
          Show +{{ messageHistoriesUnshown }}
        </b-button>
      </div>
      <p v-else>No posting history.</p>
      <h3 class="mt-2">ChitChat</h3>
      <div>
        <p>Moderation status:</p>
        <b-form-select
          v-model="newsfeedmodstatus"
          class="mb-2 flex-shrink-1 font-weight-bold"
        >
          <b-form-select-option value="Unmoderated">
            Unmoderated
          </b-form-select-option>
          <b-form-select-option value="Suppressed">
            Suppressed
          </b-form-select-option>
        </b-form-select>
        <div v-for="newsfeed in user.newsfeed" :key="'newsfeed-' + newsfeed.id">
          <div class="d-flex">
            <div class="mr-2">
              <ExternalLink
                :href="'https://www.ilovefreegle.org/chitchat/' + newsfeed.id"
              >
                {{ newsfeed.id }}
              </ExternalLink>
            </div>
            <div class="mr-2">
              {{ datetimeshort(newsfeed.timestamp) }}
            </div>
            <div class="mr-2">
              <div
                class="line-clamp-2"
                :style="{ strike: newsfeed.hidden || newsfeed.deleted }"
              >
                {{ newsfeed.message }}
              </div>
              <div v-if="newsfeed.hidden" class="small">
                Hidden by
                <v-icon icon="hashtag" scale="0.75" class="text-muted" />{{
                  newsfeed.hiddenby
                }}
              </div>
              <div v-if="newsfeed.deletedby" class="small">
                Deleted by
                <v-icon icon="hashtag" scale="0.75" class="text-muted" />{{
                  newsfeed.deletedby
                }}
              </div>
            </div>
          </div>
        </div>
      </div>
      <h3 class="mt-2">Recent Emails</h3>
      <div v-if="emailHistoriesShown.length">
        <b-row
          v-for="email in emailHistoriesShown"
          :key="'emailhistory-' + email.id"
          class="pl-3"
        >
          <b-col
            cols="6"
            md="3"
            class="p-1 order-1"
            :title="datetime(email.timestamp)"
          >
            {{ timeago(email.timestamp) }}
          </b-col>
          <b-col cols="12" md="6" class="p-1 order-3 order-md-2">
            {{ email.subject }}
          </b-col>
          <b-col
            cols="5"
            md="3"
            class="p-1 order-2 order-md-3 small text-muted"
          >
            {{ email.status }}
          </b-col>
        </b-row>
        <b-button
          v-if="!showAllEmailHistories && emailHistoriesUnshown"
          variant="white"
          class="mt-1"
          @click="showAllEmailHistories = true"
        >
          Show +{{ emailHistoriesUnshown }}
        </b-button>
      </div>
      <p v-else>No recent emails.</p>
      <h3 class="mt-2">Chats</h3>
      <ModSupportChatList :chats="chatsFiltered" :pov="user.id" />
    </b-card-body>
    <ModLogsModal
      v-if="showLogs"
      ref="logs"
      :userid="user.id"
      @hidden="showLogs = false"
    />
    <ConfirmModal
      v-if="purgeConfirm"
      ref="purgeConfirmRef"
      :title="
        'Purge ' + user.displayname + ' ' + user.email + ' from the system?'
      "
      message="<p><strong>This can't be undone.</strong></p><p>Are you completely sure you want to do this?</p>"
      @confirm="purgeConfirmed"
    />
    <ProfileModal
      v-if="showProfile && user && user.info"
      :id="id"
      ref="profileRef"
      @hidden="showProfile = false"
    />
    <ModSpammerReport
      v-if="showSpamModal"
      ref="spamConfirm"
      :user="reportUser"
      @hidden="showSpamModal = false"
    />
    <ModCommentAddModal
      v-if="showAddCommentModal"
      :user="user"
      @added="updateComments"
      @hidden="showAddCommentModal = false"
    />
  </b-card>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '~/stores/user'
import ExternalLink from '~/components/ExternalLink'

const SHOW = 3

const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
  expand: {
    type: Boolean,
    required: false,
    default: false,
  },
})

const userStore = useUserStore()

const user = ref(null)
const expanded = ref(true)
const purgeConfirm = ref(false)
const showAllMemberships = ref(false)
const showAllMembershipHistories = ref(false)
const showAllMessageHistories = ref(false)
const showAllEmailHistories = ref(false)
const showSpamModal = ref(false)
const newpassword = ref(null)
const newemail = ref(null)
const newEmailAs = ref(1)
const showAddCommentModal = ref(false)
const emailAddError = ref(null)
const showLogs = ref(false)
const showProfile = ref(false)

const logs = ref(null)
const profileRef = ref(null)
const purgeConfirmRef = ref(null)
const spamConfirm = ref(null)

const preferredemail = computed(() => {
  if (user.value.email) return user.value.email
  if (!user.value.emails) return false
  if (user.value.emails.length === 0) return false
  const pref = user.value.emails.find((e) => e.preferred)
  if (pref) return pref.email
  return user.value.emails[0].email
})

const reportUser = computed(() => {
  return {
    // Due to inconsistencies about userid vs id in objects.
    userid: user.value.id,
    displayname: user.value.displayname,
  }
})

const admin = computed(() => {
  return user.value && user.value.systemrole === 'Admin'
})

const freegleMemberships = computed(() => {
  return user.value && user.value.memberof
    ? user.value.memberof
        .filter((m) => m.type === 'Freegle')
        .sort(function (a, b) {
          return a.nameshort
            .toLowerCase()
            .localeCompare(b.nameshort.toLowerCase())
        })
    : []
})

const memberships = computed(() => {
  return showAllMemberships.value
    ? freegleMemberships.value
    : freegleMemberships.value.slice(0, SHOW)
})

const membershipsUnshown = computed(() => {
  const ret =
    freegleMemberships.value.length > SHOW
      ? freegleMemberships.value.length - SHOW
      : 0
  return ret
})

const otherEmails = computed(() => {
  return user.value.emails.filter((e) => {
    return e.email !== user.value.email && !e.ourdomain
  })
})

const membershiphistories = computed(() => {
  const times = []
  const ret = []

  if (user.value && user.value.membershiphistory) {
    user.value.membershiphistory.forEach((h) => {
      if (!times.includes(h.timestamp)) {
        times.push(h.timestamp)
        ret.push(h)
      }
    })
  }

  return ret
})

const membershipHistoriesShown = computed(() => {
  return showAllMembershipHistories.value
    ? membershiphistories.value
    : membershiphistories.value.slice(0, SHOW)
})

const membershipHistoriesUnshown = computed(() => {
  const ret =
    membershiphistories.value.length > SHOW
      ? membershiphistories.value.length - SHOW
      : 0
  return ret
})

const messageHistoriesShown = computed(() => {
  return showAllMessageHistories.value
    ? user.value.messagehistory
    : user.value.messagehistory.slice(0, SHOW)
})

const messageHistoriesUnshown = computed(() => {
  const ret =
    user.value.messagehistory.length > SHOW
      ? user.value.messagehistory.length - SHOW
      : 0
  return ret
})

const sortedHistories = computed(() => {
  const ret =
    user.value.emailhistory && user.value.emailhistory.length
      ? user.value.emailhistory
      : []

  ret.sort(function (a, b) {
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  })

  return ret
})

const emailHistoriesShown = computed(() => {
  return showAllEmailHistories.value
    ? sortedHistories.value
    : sortedHistories.value.slice(0, SHOW)
})

const emailHistoriesUnshown = computed(() => {
  const ret =
    user.value.emailhistory.length > SHOW
      ? user.value.emailhistory.length - SHOW
      : 0
  return ret
})

const chatsFiltered = computed(() => {
  return user.value.chatrooms
    ? user.value.chatrooms
        .filter((c) => c.chattype !== 'Mod2Mod')
        .sort((a, b) => {
          return new Date(b.lastdate).getTime() - new Date(a.lastdate).getTime()
        })
    : []
})

const newsfeedmodstatus = computed({
  get() {
    return user.value.newsfeedmodstatus
  },
  async set(newVal) {
    await userStore.edit({
      id: user.value.id,
      newsfeedmodstatus: newVal,
    })
  },
})

onMounted(async () => {
  expanded.value = props.expand
  user.value = userStore.byId(props.id)
  if (user.value) {
    await fetchUser()
  }
})

async function fetchUser() {
  if (props.id) {
    await userStore.fetchMT({
      search: props.id,
      emailhistory: true,
      info: true,
    })
    user.value = userStore.byId(props.id)
    if (user.value && user.value.spammer && user.value.spammer.byuserid) {
      await userStore.fetchMT({ search: user.value.spammer.byuserid })
      user.value.spammer.byuser = await userStore.fetch(
        user.value.spammer.byuserid
      )
    }
  }
}

function showLogsModal() {
  showLogs.value = true
  logs.value?.show()
}

async function profile() {
  console.log('MSU profile', props.id)
  await userStore.fetchMT({
    // TODO Might need to be search: props.id
    id: props.id,
    info: true,
  })
  showProfile.value = true
  profileRef.value?.show()
}

function purgeConfirmed() {
  userStore.purge(props.id)
}

function purge() {
  purgeConfirm.value = true
  purgeConfirmRef.value?.show()
}

function spamReport() {
  showSpamModal.value = true
  spamConfirm.value?.show()
}

async function setPassword(callback) {
  if (newpassword.value) {
    await userStore.edit({
      id: user.value.id,
      password: newpassword.value,
    })
  }
  callback()
}

async function addEmail(callback) {
  emailAddError.value = null

  if (newemail.value) {
    try {
      await userStore.addEmail({
        id: user.value.id,
        email: newemail.value,
        primary: parseInt(newEmailAs.value) === 1,
      })
    } catch (e) {
      emailAddError.value = e.message
    }
  }
  callback()
}

function maybeExpand() {
  // Ignore text selection
  if (!window.getSelection().toString()) {
    expanded.value = !expanded.value
  }
}

function addAComment() {
  showAddCommentModal.value = true
}

async function updateComments() {
  const userid = user.value.userid ? user.value.userid : user.value.id
  console.log('updateComments', userid)

  await userStore.fetchMT({
    id: userid,
    emailhistory: true,
  })
  await fetchUser()
}
</script>
<style scoped>
.max {
  max-width: 200px;
}
</style>
