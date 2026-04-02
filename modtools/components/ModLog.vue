<template>
  <div v-if="log">
    <b-row>
      <b-col cols="5" lg="2" class="small">
        {{ datetimeshort(log.timestamp) }}
      </b-col>
      <b-col cols="7" lg="4" class="forcebreak">
        <ModLogUser
          v-if="
            log.type === 'Group' &&
            log.subtype === 'Joined' &&
            logUser &&
            logByuser &&
            logByuser.id !== logUser.id
          "
          :userid="logUser.id"
        />
        <ModLogUser
          v-else-if="logUser && logByuser && logByuser.id !== logUser.id"
          :userid="logByuser.id"
        />
        <ModLogUser v-else-if="logByuser" :userid="logByuser.id" />
        <ModLogUser v-else-if="logUser" :userid="logUser.id" />
        <ModLogUser v-else-if="logMessage" :userid="logMessage.fromuser?.id" />
      </b-col>
      <b-col cols="12" lg="6" class="forcebreak">
        <span v-if="log.type === 'Group'">
          <span v-if="log.subtype === 'Joined'">
            Joined
            <ModLogGroup :logid="logid" />
            <span v-if="logUser && logByuser && logByuser.id !== logUser.id">
              (added by <ModLogUser :userid="logByuser.id" />)
            </span>
            <span v-if="log.text">
              <span v-if="log.text === 'Manual'"> Clicked on Join button </span>
              <span v-else> Joined automatically when posting/replying </span>
            </span>
          </span>
          <span v-else-if="log.subtype === 'Applied'">
            Applied to <ModLogGroup :logid="logid" />
          </span>
          <span v-else-if="log.subtype === 'Left'">
            <span v-if="logUser && logByuser && logByuser.id !== logUser.id">
              Removed member <ModLogUser :userid="logUser.id" /> from
              <ModLogGroup :logid="logid" />
              <span v-if="log.text">
                {{ log.text }}
              </span>
            </span>
            <span v-else> Left <ModLogGroup :logid="logid" /> </span>
          </span>
          <span v-else-if="log.subtype === 'Edit'">
            Edited group settings <ModLogGroup :logid="logid" tag="for" />
          </span>
          <span v-else-if="log.subtype === 'Autoapproved'">
            Auto-approved <ModLogMessage :logid="logid" />
            <ModLogGroup :logid="logid" tag="on" />
          </span>
          <span v-else>
            <span class="text-muted"
              >Unknown log type {{ log.type }} subtype {{ log.subtype }}</span
            >
          </span>
        </span>
        <span v-else-if="log.type === 'Message'">
          <span v-if="log.subtype === 'Received'">
            <span
              v-if="
                logMessage &&
                (logMessage.type === 'Offer' || logMessage.type === 'Wanted')
              "
            >
              Posted <ModLogMessage :logid="logid" notext tag="to" />
              <span v-if="sourceheader" class="text-muted small">
                via {{ sourceheader }}
              </span>
              <span
                v-if="
                  logMessage.groups &&
                  logMessage.groups[0] &&
                  logMessage.groups[0].collection === 'Pending'
                "
                class="text-warning"
              >
                currently {{ logMessage.groups[0].collection }}
              </span>
            </span>
            <span v-else-if="logMessage">
              <span v-if="logMessage.deleted">
                <em
                  >Emailed message #{{ logMessage.id }} which has been deleted
                  (typically email chat reply)</em
                >
              </span>
              <span v-else>
                Emailed <em>{{ logMessage.subject }}</em> to
                <em>{{ logMessage.envelopeto }}</em>
              </span>
            </span>
          </span>
          <span v-else-if="log.subtype === 'Autoreposted'">
            Autoreposted <ModLogMessage :logid="logid" /> repost
            {{ log.text }}
            <span v-if="logUser">
              from
              <ModLogUser :userid="logUser.id" />
            </span>
          </span>
          <span v-else-if="log.subtype === 'Repost'">
            Manual repost of <ModLogMessage :logid="logid" />
            <span v-if="logUser">
              by
              <ModLogUser :userid="logUser.id" />
            </span>
          </span>
          <span v-else-if="log.subtype === 'Approved'">
            Approved message
            <ModLogMessage :logid="logid" />
            <span v-if="logUser">
              from
              <ModLogUser :userid="logUser.id" />
            </span>
          </span>
          <span v-else-if="log.subtype === 'ClassifiedSpam'">
            Sent spam <ModLogMessage :logid="logid" tag="to" notext />
            <span v-if="logUser">
              from
              <ModLogUser :userid="logUser.id" />
            </span>
          </span>
          <span v-else-if="log.subtype === 'Rejected'" class="text-danger">
            Rejected
            <ModLogMessage :logid="logid" />
            <span v-if="logUser">
              from
              <ModLogUser :userid="logUser.id" />
            </span>
          </span>
          <span v-else-if="log.subtype === 'Replied'" class="text-danger">
            Modmail sent
            <span v-if="log.text && log.text.length > 0">
              with <em>{{ log.text }} </em>
              <span v-if="log.stdmsg">
                using <em>{{ log.stdmsg.title }} </em></span
              >
              <span v-else> mail </span>
            </span>
          </span>
          <span v-else-if="log.subtype === 'Deleted'" class="text-danger">
            Deleted <ModLogMessage :logid="logid" />
            <span v-if="logUser">
              from
              <ModLogUser :userid="logUser.id" />
            </span>
          </span>
          <span v-else-if="log.subtype === 'Hold'">
            Held <ModLogMessage :logid="logid" />
            <span v-if="logUser">
              from
              <ModLogUser :userid="logUser.id" />
            </span>
          </span>
          <span v-else-if="log.subtype === 'Release'">
            Released <ModLogMessage :logid="logid" />
            <span v-if="logUser">
              from
              <ModLogUser :userid="logUser.id" />
            </span>
          </span>
          <span v-else-if="log.subtype === 'Edit'">
            Edited <ModLogMessage :logid="logid" notext />
            <ModLogUser
              v-if="logUser && logByuser && logByuser.id !== logUser.id"
              :userid="logByuser.id"
            />
            Details:
            {{ log.text }}
            <span v-if="logUser">
              from
              <ModLogUser :userid="logUser.id" />
            </span>
          </span>
          <span v-else-if="log.subtype === 'Outcome'">
            Marked <ModLogMessage :logid="logid" notext /> as
            <em>{{ log.text }}</em>
            <span v-if="logUser">
              from
              <ModLogUser :userid="logUser.id" />
            </span>
          </span>
          <span v-else-if="log.subtype === 'Autoapproved'">
            Auto-approved <ModLogMessage :logid="logid" />
          </span>
          <span v-else-if="log.subtype === 'WorryWords'" class="text-danger">
            Flagged <ModLogMessage :logid="logid" notext /> {{ log.text }}
          </span>
          <span v-else>
            <span class="text-muted"
              >Unknown log type {{ log.type }} subtype {{ log.subtype }}</span
            >
          </span>
        </span>
        <span v-else-if="log.type === 'User'">
          <span v-if="log.subtype === 'OurPostingStatus'">
            <span v-if="log.groupid">
              Set Posting Status to {{ postingStatus }}
              <ModLogGroup :logid="logid" tag="on" />
            </span>
            <span v-else />
          </span>
          <span v-else-if="log.subtype === 'OurEmailFrequency'">
            Set Email Frequency to {{ log.text }}
            <ModLogGroup :logid="logid" tag="on" />
          </span>
          <span v-else-if="log.subtype === 'Login'">
            Logged in <em class="text-muted small">{{ log.text }}</em>
          </span>
          <span v-else-if="log.subtype === 'Logout'"> Logged out </span>
          <span v-else-if="log.subtype === 'Created'"> User Created </span>
          <span v-else-if="log.subtype === 'RoleChange'">
            Role <ModLogGroup :logid="logid" tag="on" /> changed to
            {{ log.text }}
          </span>
          <span v-else-if="log.subtype === 'Merged'">
            Merged with another user - {{ log.text }}
          </span>
          <span v-else-if="log.subtype === 'Approved'">
            Approved member
            <ModLogUser :userid="logUser.id" />
            <ModLogGroup :logid="logid" tag="on" />
            <ModLogStdMsg :logid="logid" />
          </span>
          <span v-else-if="log.subtype === 'Rejected'">
            Rejected member
            <ModLogUser :userid="logUser.id" />
            <ModLogGroup :logid="logid" tag="on" />
            <ModLogStdMsg :logid="logid" />
          </span>
          <span v-else-if="log.subtype === 'Deleted'">
            <span v-if="logByuser">Rejected member</span>
            <span v-else>User left platform ({{ log.text }})</span>
            <ModLogUser :userid="logUser.id" />
            <ModLogGroup :logid="logid" tag="on" />
            <ModLogStdMsg :logid="logid" />
          </span>
          <span v-else-if="log.subtype === 'Mailed'" class="text-danger">
            Mod sent
            <span v-if="log.text && log.text.length > 0">
              <em>{{ log.text }} </em></span
            >
            <ModLogStdMsg :logid="logid" />
          </span>
          <span v-else-if="log.subtype === 'Hold'">
            Held member
            <ModLogUser :userid="logUser.id" />
            <ModLogGroup :logid="logid" tag="on" />
          </span>
          <span v-else-if="log.subtype === 'Release'">
            Released member
            <ModLogUser :userid="logUser.id" />
            <ModLogGroup :logid="logid" tag="on" />
          </span>
          <span v-else-if="log.subtype === 'Suspect'">
            Flagged <ModLogUser :userid="logUser.id" />
            <span v-if="log.text">: {{ log.text }}</span>
          </span>
          <span v-else-if="log.subtype === 'Split'">
            Split out into two users - {{ log.text }}
          </span>
          <span v-else-if="log.subtype === 'MailOff'">
            Turned digests off by email
          </span>
          <span v-else-if="log.subtype === 'EventsOff'">
            Turned events off by email
          </span>
          <span v-else-if="log.subtype === 'NewslettersOff'">
            Turned newsletters off by email
          </span>
          <span v-else-if="log.subtype === 'RelevantOff'">
            Turned off "interested in" mails by email
          </span>
          <span v-else-if="log.subtype === 'VolunteersOff'">
            Turned off volunteering mails by email
          </span>
          <span v-else-if="log.subtype === 'SuspendMail'">
            Stop mailing this member as they are bouncing.
          </span>
          <span v-else-if="log.subtype === 'Bounce'">
            {{ log.text }}
          </span>
          <span v-else-if="log.subtype === 'Unbounce'">
            Reactivated to start sending mail again
          </span>
          <span v-else-if="log.subtype === 'PostcodeChange'">
            Postcode set to {{ log.text }}
          </span>
          <span v-else-if="log.subtype === 'NotificationOff'">
            Turned push notifications off
          </span>
          <span v-else>
            <span class="text-muted"
              >Unknown log type {{ log.type }} subtype {{ log.subtype }}</span
            >
          </span>
        </span>
        <span v-else-if="log.type === 'Config'">
          <span v-if="log.subtype === 'Created'">
            Created config {{ log.text }}
          </span>
          <span v-else-if="log.subtype === 'Deleted'">
            Deleted config {{ log.text }}
          </span>
          <span v-else-if="log.subtype === 'Edit'">
            Edited config {{ log.config ? log.config.name : '' }}
          </span>
          <span v-else>
            <span class="text-muted"
              >Unknown log type {{ log.type }} subtype {{ log.subtype }}</span
            >
          </span>
        </span>
        <span v-else-if="log.type === 'StdMsg'">
          <span v-if="log.subtype === 'Created'">
            Created standard message {{ log.text }}
          </span>
          <span v-else-if="log.subtype === 'Deleted'">
            Deleted standard message {{ log.text }}
          </span>
          <span v-else-if="log.subtype === 'Edit'">
            Edited standard message
            <span v-if="log.stdmsg">{{ log.stdmsg.name }}</span>
          </span>
          <span v-else>
            <span class="text-muted"
              >Unknown log type {{ log.type }} subtype {{ log.subtype }}</span
            >
          </span>
        </span>
        <span v-else-if="log.type === 'Chat'">
          <span v-if="log.subtype === 'Approved'">
            Approved chat message for
            <ModLogUser :userid="logUser.id" />
          </span>
          <span v-else-if="log.subtype === 'Rejected'">
            Rejected chat message for
            <ModLogUser :userid="logUser.id" />
          </span>
          <span v-else>
            <span class="text-muted"
              >Unknown log type {{ log.type }} subtype {{ log.subtype }}</span
            >
          </span>
        </span>
        <span v-else-if="log.type === 'Location'">
          <span v-if="log.subtype === 'Created'"> Created location </span>
          <span v-else> {{ log.subtype }} location </span>
        </span>
        <span v-else-if="!log.type">
          <span class="text-muted">{{ log.text || 'Log entry' }}</span>
        </span>
        <span v-else>
          <span class="text-muted">{{ log.type }} {{ log.subtype }}</span>
        </span>
      </b-col>
    </b-row>
    <hr class="d-block d-md-none" />
  </div>
</template>
<script setup>
import { computed, watch } from 'vue'
import { useUserStore } from '~/stores/user'
import { useMessageStore } from '~/stores/message'
import { useLogsStore } from '~/stores/logs'

const userStore = useUserStore()
const messageStore = useMessageStore()
const logsStore = useLogsStore()

const props = defineProps({
  logid: {
    type: Number,
    required: true,
  },
})

const log = computed(() => logsStore.byId(props.logid))

// Look up user from store by ID, fetching if needed
const logUser = computed(() => {
  if (!log.value) return null
  // V2: log has userid as an ID
  const uid = log.value.userid
  if (uid) {
    return userStore.byId(uid) || { id: uid, displayname: '#' + uid }
  }
  // V1 fallback: log.user is already an object
  return log.value.user || null
})

const logByuser = computed(() => {
  if (!log.value) return null
  const uid = log.value.byuserid
  if (uid) {
    return userStore.byId(uid) || { id: uid, displayname: '#' + uid }
  }
  return log.value.byuser || null
})

const logMessage = computed(() => {
  if (!log.value) return null
  const mid = log.value.msgid
  if (mid) {
    return messageStore.byId(mid) || null
  }
  return log.value.message || null
})

// Trigger fetches for user/message IDs we don't have yet
watch(
  log,
  (l) => {
    if (!l) return
    if (l.userid && !userStore.byId(l.userid)) {
      userStore.fetch(l.userid)
    }
    if (l.byuserid && !userStore.byId(l.byuserid)) {
      userStore.fetch(l.byuserid)
    }
    if (l.msgid && !messageStore.byId(l.msgid)) {
      messageStore.fetch(l.msgid)
    }
  },
  { immediate: true }
)

const sourceheader = computed(() => {
  if (logMessage.value && logMessage.value.sourceheader) {
    return logMessage.value.sourceheader.replace('Yahoo-', '')
  } else {
    return null
  }
})

const postingStatus = computed(() => {
  switch (log.value?.text) {
    case 'UNCHANGED':
      return 'Unchanged'
    case 'MODERATED':
      return 'Moderated'
    case 'DEFAULT':
      return 'Group Settings'
    case 'PROHIBITED':
      return "Can't Post"
    default:
      return null
  }
})
</script>
