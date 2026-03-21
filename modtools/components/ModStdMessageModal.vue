<template>
  <b-modal
    id="stdmsgmodal"
    ref="modal"
    :title="
      message ? message.subject : 'Message to ' + (user ? user.displayname : '')
    "
    no-stacking
    no-close-on-backdrop
    size="lg"
  >
    <template #default>
      <div v-if="stdmsg?.action !== 'Edit'" class="d-flex">
        <div>
          From:&nbsp;
          <br />
          To:&nbsp;
        </div>
        <div>
          {{ fromName }}
          <br />
          {{ user ? user.displayname : '' }}
          <span v-if="toEmail"> &lt;{{ toEmail }}&gt; </span>
        </div>
      </div>
      <div
        v-if="
          message &&
          stdmsg?.action === 'Edit' &&
          message.item &&
          message.location
        "
        class="d-flex justify-content-start"
      >
        <!-- eslint-disable-next-line -->
        <b-form-select v-model="message.type" :options="typeOptions" class="type mr-1" size="lg" />
        <!-- eslint-disable-next-line -->
        <b-form-input v-model="message.item.name" size="lg" class="mr-1" />
        <b-input-group>
          <PostCode
            :value="message.location.name"
            :find="false"
            @selected="postcodeSelect"
          />
        </b-input-group>
      </div>
      <div v-else>
        <b-input-group>
          <b-form-input v-model="subject" class="mt-2" />
        </b-input-group>
      </div>
      <NoticeMessage v-if="warning" variant="warning" class="mt-1 mb-1">
        <p>Please check your message in case it needs updating:</p>
        <p>
          <strong>{{ warning }}</strong>
        </p>
      </NoticeMessage>
      <b-form-textarea v-model="body" rows="10" class="mt-2" />
      <div
        v-if="stdmsg?.newdelstatus && stdmsg.newdelstatus !== 'UNCHANGED'"
        class="mt-1"
      >
        <v-icon
          v-if="changingNewDelStatus"
          icon="sync"
          class="text-success fa-spin"
        />
        <v-icon
          v-else-if="changedNewDelStatus"
          icon="check"
          class="text-success"
        />
        <v-icon v-else icon="cog" />
        Change email frequency to <em>{{ emailfrequency }}</em>
      </div>
      <div
        v-if="stdmsg?.newmodstatus && stdmsg.newmodstatus !== 'UNCHANGED'"
        class="mt-1"
      >
        <v-icon
          v-if="changingNewModStatus"
          icon="sync"
          class="text-success fa-spin"
        />
        <v-icon
          v-else-if="changedNewModStatus"
          icon="check"
          class="text-success"
        />
        <v-icon v-else icon="cog" />
        Change moderation status to <em>{{ modstatus }}</em>
      </div>
      <div v-if="stdmsg?.action === 'Hold Message'" class="mt-1 text-warning">
        <v-icon v-if="changingHold" icon="sync" class="text-success fa-spin" />
        <v-icon v-else-if="changedHold" icon="check" class="text-success" />
        <v-icon v-else icon="pause" />
        Hold message
      </div>
      <NoticeMessage v-if="replyTooShort" variant="danger" class="mt-1 mb-1">
        This is a very short reply, so it may come across as a bit abrupt and
        unhelpful. Please make it a bit longer.
      </NoticeMessage>
    </template>
    <template #footer>
      <div class="d-flex justify-content-between w-100">
        <div>
          <b-button variant="white" class="nohover" size="xs" @click="moveLeft">
            <v-icon icon="arrow-left" />
          </b-button>
          <b-button
            variant="white"
            class="nohover"
            size="xs"
            @click="moveRight"
          >
            <v-icon icon="arrow-right" />
          </b-button>
          <b-button variant="white" class="nohover" size="xs" @click="moveUp">
            <v-icon icon="arrow-up" />
          </b-button>
          <b-button variant="white" class="nohover" size="xs" @click="moveDown">
            <v-icon icon="arrow-down" />
          </b-button>
        </div>
        <div>
          <SpinButton
            ref="process"
            :label="processLabel"
            icon-name="envelope"
            spinclass="success"
            variant="primary"
            :flex="false"
            icon-class="pe-1"
            class="m-1 d-inline-block"
            @handle="process"
          />
          <b-button variant="white" @click="hide"> Cancel </b-button>
        </div>
      </div>
    </template>
  </b-modal>
</template>
<script setup>
import { ref, computed, watch } from 'vue'
import dayjs from 'dayjs'
import { setupKeywords } from '~/composables/useKeywords'
import { useUserStore } from '~/stores/user'
import { useModGroupStore } from '@/stores/modgroup'
import { useMemberStore } from '~/stores/member'
import { useMessageStore } from '~/stores/message'
import { useStdmsgStore } from '~/stores/stdmsg'
import { useOurModal } from '~/composables/useOurModal'
import { SUBJECT_REGEX } from '~/constants'
import { useMe } from '~/composables/useMe'
import { useModMe } from '~/composables/useModMe'

const props = defineProps({
  messageid: {
    type: Number,
    required: false,
    default: null,
  },
  // membershipid - the membership record ID, NOT the user ID.
  membershipid: {
    type: Number,
    required: false,
    default: null,
  },
  // Use stdmsgid to look up a real standard message from the stdmsg store.
  stdmsgid: {
    type: Number,
    required: false,
    default: null,
  },
  // Use stdmsgaction for inline action-only cases (e.g. 'Reject', 'Leave Member')
  // where there is no stored standard message.
  stdmsgaction: {
    type: String,
    required: false,
    default: null,
  },
  autosend: {
    type: Boolean,
    required: false,
    default: false,
  },
})

const { modal, show, hide } = useOurModal()
const modGroupStore = useModGroupStore()
const messageStore = useMessageStore()
const memberStore = useMemberStore()
const userStore = useUserStore()
const stdmsgStore = useStdmsgStore()
const { typeOptions } = setupKeywords()
const { me } = useMe()
const { checkWorkDeferGetMessages } = useModMe()

// Resolve the stdmsg: either from the store by ID, or an inline action-only object.
const stdmsg = computed(() => {
  if (props.stdmsgid) {
    return stdmsgStore.byId(props.stdmsgid) || null
  }
  if (props.stdmsgaction) {
    return { action: props.stdmsgaction }
  }
  return null
})

const subject = ref(null)
const body = ref(null)
const bodyInitialLength = ref(0)
const replyTooShort = ref(false)
const keywordList = ['Offer', 'Taken', 'Wanted', 'Received', 'Other']
const recentDays = 31
const changingNewModStatus = ref(false)
const changedNewModStatus = ref(false)
const changingNewDelStatus = ref(false)
const changedNewDelStatus = ref(false)
const changingHold = ref(false)
const changedHold = ref(false)
const margTop = ref(0)
const margLeft = ref(0)

// Fetch message from message store by ID.
const message = computed(() => {
  if (props.messageid) {
    return messageStore.byId(props.messageid) || null
  }
  return null
})

// Fetch membership from member store. member.id in that store is the membershipid.
const membership = computed(() => {
  if (props.membershipid) {
    return memberStore.get(props.membershipid) || null
  }
  return null
})

const groupid = computed(() => {
  if (membership.value) {
    return membership.value.groupid
  }
  if (message.value && message.value.groups && message.value.groups.length) {
    return message.value.groups[0].groupid
  }
  return null
})

// The target user — always fetched from the user store.
// For messages: message.fromuser is a uint64 user ID.
// For memberships: membership.userid is the user ID.
const user = computed(() => {
  let uid = null

  if (message.value) {
    uid =
      typeof message.value.fromuser === 'object'
        ? message.value.fromuser?.id
        : message.value.fromuser
  } else if (membership.value) {
    uid = membership.value.userid
  }

  if (uid) {
    return userStore.byId(uid) || { id: uid, displayname: '#' + uid }
  }
  return null
})

const userid = computed(() => {
  return user.value?.id || null
})

const fromName = computed(() => {
  return me.value.displayname
})

const toEmail = computed(() => {
  let ret = null
  if (user.value && user.value.emails) {
    user.value.emails.forEach((email) => {
      if (
        email.email &&
        !email.email.includes('users.ilovefreegle.org') &&
        (ret === null || email.preferred)
      ) {
        ret = email.email
      }
    })
  } else if (user.value && user.value.email) {
    ret = user.value.email
  }

  return ret
})

const processLabel = computed(() => {
  switch (stdmsg.value?.action) {
    case 'Approve':
    case 'Approve Member':
      return 'Send and Approve'
    case 'Reject':
    case 'Reject Member':
      return 'Send and Reject'
    case 'Leave':
    case 'Leave Member':
    case 'Leave Approved Message':
    case 'Leave Approved Member':
      return 'Send and Leave'
    case 'Delete':
    case 'Delete Approved Message':
    case 'Delete Approved Member':
      return 'Send and Delete'
    case 'Edit':
      return 'Save Edit'
    case 'Hold Message':
      return 'Send and Hold'
    default:
      return 'Send'
  }
})

const modstatus = computed(() => {
  switch (stdmsg.value?.newmodstatus) {
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

const emailfrequency = computed(() => {
  switch (stdmsg.value?.newdelstatus) {
    case 'DIGEST':
      return 24
    case 'NONE':
      return 0
    case 'SINGLE':
      return -1
    case 'ANNOUNCEMENT':
      return 0
    default:
      return 0
  }
})

const warning = computed(() => {
  let ret = null

  if (body.value) {
    const checks = {
      yahoo:
        'Yahoo Groups is no longer supported, so any mention of it is probably out of date.',
      republisher:
        'Republisher is old and any mention of it is probably not valid any more.',
      messagemaker:
        'The Message Maker is no longer a separate tool; please just refer people to www.ilovefreegle.org.',
      cafe: 'The ChitChat area of the site is the place for cafe-type requests now.',
      newsfeed: 'Newsfeed is now called ChitChat.',
      freegledirect:
        'Freegle Direct is no longer an active term; we just talk about "our website" or "www.ilovefreegle.org" now.',
      'www.freegle.in':
        "www.freegle.in should just be freegle.in - it won't work with the www.",
      'http://': "It's better to use https:// links rather than http:// links.",
    }

    // Remove groups.ilovefreegle.org, which is the volunteers address.
    let trimmed = body.value.replace(/\s/g, '').toLowerCase()

    // Remove any Yahoo email addresses, which would trigger a false match.
    trimmed = trimmed.replace('@yahoo', '')

    for (const keyword in checks) {
      if (trimmed.includes(keyword)) {
        ret = checks[keyword]
      }
    }
  }

  return ret
})

// Trigger fetch for the fromuser ID when the message is available.
// Fetch the target user from the user store when we know their ID.
// For messages: fromuser is a uint64. For memberships: userid is the user ID.
watch(
  () => {
    if (message.value) {
      const fu = message.value.fromuser
      return typeof fu === 'object' ? fu?.id : fu
    }
    if (membership.value) {
      return membership.value.userid
    }
    return null
  },
  (uid) => {
    if (uid && !userStore.byId(uid)) {
      userStore.fetch(uid)
    }
  },
  { immediate: true }
)

watch(body, () => {
  replyTooShort.value = false
})

async function fillin() {
  // Calculate initial subject.  Everything apart from Edits adds a Re:.
  const defpref = stdmsg.value.action === 'Edit' ? '' : 'Re:'

  if (membership.value) {
    subject.value =
      (stdmsg.value.subjpref ? stdmsg.value.subjpref : defpref) +
      (stdmsg.value.subjsuff ? stdmsg.value.subjsuff : '')
  } else {
    subject.value =
      (stdmsg.value.subjpref ? stdmsg.value.subjpref : defpref) +
      (stdmsg.value.action === 'Edit' ? '' : ': ') +
      message.value.subject +
      (stdmsg.value.subjsuff ? stdmsg.value.subjsuff : '')
  }

  subject.value = await substitutionStrings(subject.value)

  // Calculate initial body
  let msg = message.value ? message.value.textbody : ''
  msg = msg || ''

  if (msg || membership.value) {
    if (msg) {
      // We have an existing body to include.  Quote it, unless it's an edit.
      const edit = stdmsg.value && stdmsg.value.action === 'Edit'
      if (!edit && msg) {
        msg = '> ' + (msg + '').replace(/((\r\n)|\r|\n)/gm, '\n> ')
      }

      bodyInitialLength.value = msg.length
    }

    if (stdmsg.value) {
      if (stdmsg.value.body) {
        // Text to insert.
        if (stdmsg.value.insert === 'Top') {
          msg = stdmsg.value.body.trim() + '\n\n' + msg
        } else {
          msg = msg + '\n\n' + stdmsg.value.body.trim()
        }
      } else if (stdmsg.value.action !== 'Edit' && msg) {
        // No text to insert - add a couple of blank lines at the top for typing.
        msg = '\n\n' + msg
      }

      if (stdmsg.value.edittext === 'Correct Case') {
        // First the subject
        const matches = SUBJECT_REGEX.exec(subject.value)
        if (
          matches &&
          matches.length > 0 &&
          matches[0].length > 0 &&
          message.value.item
        ) {
          subject.value =
            matches[1] +
            ': ' +
            matches[2].toLowerCase().trim() +
            ' (' +
            matches[3] +
            ')'

          message.value.item.name = matches[2].toLowerCase().trim()
        } else {
          subject.value = subject.value.toLowerCase().trim()
        }

        // Now the textbody.
        msg = msg.toLowerCase()

        // Contentious choice of single space
        msg = msg.replace(/\.( |(&nbsp;))+/g, '. ')
        msg = msg.replace(/\.\n/g, '.[-<br>-]. ')
        msg = msg.replace(/\.\s\n/g, '. [-<br>-]. ')
        const wordSplit = '. '
        const wordArray = msg.split(wordSplit)
        const numWords = wordArray.length

        for (let x = 0; x < numWords; x++) {
          if (wordArray[x]) {
            wordArray[x] = wordArray[x].replace(
              wordArray[x].charAt(0),
              wordArray[x].charAt(0).toUpperCase()
            )

            if (x === 0) {
              msg = wordArray[x] + '. '
            } else if (x !== numWords - 1) {
              msg = msg + wordArray[x] + '. '
            } else if (x === numWords - 1) {
              msg = msg + wordArray[x]
            }
          }
        }

        msg = msg.replace(/\[-<br>-\]\.\s/g, '\n')
        msg = msg.replace(/\si\s/g, ' I ')
        msg = msg.replace(/(<p>.)/i, (a, b) => {
          return b.toUpperCase()
        })
      }
    }
  } else if (stdmsg.value) {
    // No existing body
    msg = '\n\n' + (stdmsg.value.body ? stdmsg.value.body : '')
  }

  body.value = (await substitutionStrings(msg)).trim()

  if (props.autosend && !warning.value) {
    // Start doing stuff.
    process()
  }
}

async function substitutionStrings(text) {
  await modGroupStore.fetchIfNeedBeMT(groupid.value)
  const group = modGroupStore.get(groupid.value)
  if (!group) return text

  if (group && text) {
    text = text.replace(/\$networkname/g, 'Freegle')
    // eslint-disable-next-line prefer-regex-literals
    const re = new RegExp('Freegle', 'ig')
    text = text.replace(/\$groupnonetwork/g, group.namedisplay.replace(re, ''))

    text = text.replace(/\$groupname/g, group.namedisplay)
    text = text.replace(/\$owneremail/g, group.modsemail)
    text = text.replace(/\$volunteersemail/g, group.modsemail)
    text = text.replace(/\$volunteeremail/g, group.modsemail)
    text = text.replace(/\$groupemail/g, group.groupemail)
    text = text.replace(/\$groupurl/g, group.url)
    text = text.replace(/\$myname/g, me.value.displayname)
    text = text.replace(/\$nummembers/g, group.membercount)
    text = text.replace(/\$nummods/g, group.modcount)
    if (group.settings && group.settings.reposts)
      text = text.replace(/\$repostoffer/g, group.settings.reposts.offer)
    if (group.settings && group.settings.reposts)
      text = text.replace(/\$repostwanted/g, group.settings.reposts.wanted)

    text = text.replace(
      /\$origsubj/g,
      message.value ? message.value.subject : ''
    )

    if (user.value.messagehistory) {
      const history = user.value.messagehistory
      let recentmsg = ''
      let count = 0
      if (history.length) {
        history.forEach((msg) => {
          if (msg.daysago < recentDays) {
            recentmsg +=
              dayjs(msg.postdate).format('lll') + ' - ' + msg.subject + '\n'
            count++
          }
        })
      }
      text = text.replace(/\$recentmsg/gim, recentmsg)
      text = text.replace(/\$numrecentmsg/gim, count)

      keywordList.forEach((keyword) => {
        let recentmsg = ''
        let count = 0

        if (history.length) {
          history.forEach((msg) => {
            const postdate = dayjs(msg.postdate)
            const daysago = dayjs().diff(postdate, 'day')

            if (msg.type === keyword && daysago < recentDays) {
              console.log('Add for', msg, msg.postdate, dayjs(msg.postdate))
              recentmsg +=
                dayjs(msg.postdate).format('dddd Do HH:mm a') +
                ' - ' +
                msg.subject +
                '\n'
              count++
            }
          })
        }

        text = text.replace(
          new RegExp('\\$recent' + keyword.toLowerCase(), 'gim'),
          recentmsg
        )
        text = text.replace(
          new RegExp('\\$numrecent' + keyword.toLowerCase(), 'gim'),
          count
        )
      })
    }

    if (membership.value) {
      text = text.replace(
        /\$memberreason/g,
        membership.value.joincomment ? membership.value.joincomment : ''
      )
    }

    if (user.value && user.value.joined) {
      text = text.replace(
        /\$membersubdate/g,
        // eslint-disable-next-line new-cap
        new dayjs(user.value.joined).format('lll')
      )
    }

    text = text.replace(/\$membermail/g, toEmail.value)
    let from

    if (user.value && user.value.realemail) {
      from = user.value.realemail
    } else if (message.value) {
      from = message.value.fromaddr
    } else if (user.value && user.value.email) {
      from = user.value.email
    }

    const fromid = from
      ? from.substring(0, from.indexOf('@'))
      : user.value.displayname
    text = text.replace(/\$memberid/g, fromid)
    const membername = user.value.displayname || fromid
    text = text.replace(/\$membername/g, membername)

    let summ = ''

    if (message.value && message.value.duplicates) {
      message.value.duplicates.forEach((m) => {
        // eslint-disable-next-line new-cap
        summ += new dayjs(m.date).format('lll') + ' - ' + m.subject + '\n'
      })

      // eslint-disable-next-line prefer-regex-literals
      const regex = new RegExp('\\$duplicatemessages', 'gim')
      text = text.replace(regex, summ)
    }
  }

  return text
}

async function process(callback) {
  replyTooShort.value = false

  const msglen = body.value.length - bodyInitialLength.value

  if (stdmsg.value.action !== 'Edit' && msglen >= 0 && msglen < 30) {
    replyTooShort.value = true
  } else {
    if (
      stdmsg.value.newdelstatus &&
      stdmsg.value.newdelstatus !== 'UNCHANGED'
    ) {
      changingNewDelStatus.value = true
      await memberStore.updateMembership({
        userid: userid.value,
        groupid: groupid.value,
        emailfrequency: emailfrequency.value,
      })
      changingNewDelStatus.value = false
      changedNewDelStatus.value = true
    }

    if (
      stdmsg.value.newmodstatus &&
      stdmsg.value.newmodstatus !== 'UNCHANGED'
    ) {
      changingNewModStatus.value = true
      await memberStore.updateMembership({
        userid: userid.value,
        groupid: groupid.value,
        ourPostingStatus: stdmsg.value.newmodstatus,
      })
      changingNewModStatus.value = false
      changedNewModStatus.value = true
    }

    const subj = subject.value.trim()
    const bodyText = body.value.trim()

    switch (stdmsg.value.action) {
      case 'Approve':
        await messageStore.approve(
          message.value.id,
          groupid.value,
          subj,
          stdmsg.value.id,
          bodyText
        )
        break
      case 'Leave':
      case 'Leave Approved Message':
        await messageStore.reply({
          id: message.value.id,
          groupid: groupid.value,
          subject: subj,
          body: bodyText,
          stdmsgid: stdmsg.value.id,
        })
        break
      case 'Hold Message':
        changingHold.value = true

        await messageStore.hold({
          id: message.value.id,
        })

        changingHold.value = false
        changedHold.value = true

        await messageStore.reply({
          id: message.value.id,
          groupid: groupid.value,
          subject: subj,
          body: bodyText,
          stdmsgid: stdmsg.value.id,
        })
        break
      case 'Approve Member':
        await memberStore.approve({
          id: membership.value.userid,
          groupid: groupid.value,
          subject: subj,
          body: bodyText,
          stdmsgid: stdmsg.value.id,
        })
        break
      case 'Reject Member':
        await memberStore.reject({
          id: membership.value.userid,
          groupid: groupid.value,
          subject: subj,
          body: bodyText,
          stdmsgid: stdmsg.value.id,
        })
        break
      case 'Leave Member':
      case 'Leave Approved Member':
        await memberStore.reply({
          id: membership.value.userid,
          groupid: groupid.value,
          subject: subj,
          body: bodyText,
          stdmsgid: stdmsg.value.id,
        })
        break
      case 'Reject':
        await messageStore.reject(
          message.value.id,
          groupid.value,
          subj,
          stdmsg.value.id,
          bodyText
        )
        break
      case 'Delete':
      case 'Delete Approved Message':
        await messageStore.delete({
          id: message.value.id,
          groupid: groupid.value,
          subject: subj,
          body: bodyText,
          stdmsgid: stdmsg.value.id,
        })
        break
      case 'Delete Member':
      case 'Delete Approved Member':
        await memberStore.delete({
          id: membership.value.userid,
          groupid: groupid.value,
          subject: subj,
          body: bodyText,
          stdmsgid: stdmsg.value.id,
        })
        break
      case 'Edit':
        if (message.value) {
          if (message.value.item && message.value.location) {
            // Well-structured message
            await messageStore.patch({
              id: message.value.id,
              msgtype: message.value.type,
              item: message.value.item.name,
              location: message.value.location.name,
              textbody: bodyText,
            })
          } else {
            // Not
            await messageStore.patch({
              id: message.value.id,
              subject: subj,
              textbody: bodyText,
            })
          }
        }
        break
      default:
        console.error('Unknown stdmsg action', stdmsg.value.action)
    }
    checkWorkDeferGetMessages()
    hide()
  }
  if (callback) callback()
}

function postcodeSelect(newpc) {
  message.value.location = newpc
}

function moveLeft() {
  margLeft.value -= 10
  window.document.getElementById('stdmsgmodal').style.left =
    margLeft.value + 'px'
}

function moveRight() {
  margLeft.value += 10
  window.document.getElementById('stdmsgmodal').style.left =
    margLeft.value + 'px'
}

function moveUp() {
  margTop.value -= 10
  window.document.getElementById('stdmsgmodal').style.top = margTop.value + 'px'
}

function moveDown() {
  margTop.value += 10
  window.document.getElementById('stdmsgmodal').style.top = margTop.value + 'px'
}

defineExpose({ fillin, show, modal })
</script>
