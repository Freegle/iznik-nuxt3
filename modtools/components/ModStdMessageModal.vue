<template>
  <b-modal
    id="stdmsgmodal"
    ref="modal"
    :title="message ? message.subject : 'Message to ' + member.displayname"
    no-stacking
    no-close-on-backdrop
    size="lg"
  >
    <template #default>
      <div v-if="stdmsg.action !== 'Edit'" class="d-flex">
        <div>
          From:&nbsp;
          <br />
          To:&nbsp;
        </div>
        <div>
          {{ fromName }}
          <br />
          {{ message ? message.fromuser.displayname : member.displayname }}
          <span v-if="toEmail"> &lt;{{ toEmail }}&gt; </span>
        </div>
      </div>
      <div
        v-if="
          message &&
          stdmsg.action === 'Edit' &&
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
        v-if="stdmsg.newdelstatus && stdmsg.newdelstatus !== 'UNCHANGED'"
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
        v-if="stdmsg.newmodstatus && stdmsg.newmodstatus !== 'UNCHANGED'"
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
      <div v-if="stdmsg.action === 'Hold Message'" class="mt-1 text-warning">
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
import { useOurModal } from '~/composables/useOurModal'
import { SUBJECT_REGEX } from '~/constants'
import { useMe } from '~/composables/useMe'
import { useModMe } from '~/composables/useModMe'

const props = defineProps({
  message: {
    type: Object,
    required: false,
    default: null,
  },
  member: {
    type: Object,
    required: false,
    default: null,
  },
  stdmsg: {
    type: Object,
    required: true,
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
const { typeOptions } = setupKeywords()
const { me } = useMe()
const { checkWorkDeferGetMessages } = useModMe()

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

const groupid = computed(() => {
  let ret = null

  if (props.member) {
    ret = props.member.groupid
  } else if (
    props.message &&
    props.message.groups &&
    props.message.groups.length
  ) {
    ret = props.message.groups[0].groupid
  }
  return ret
})

const user = computed(() => {
  return props.message ? props.message.fromuser : props.member
})

const userid = computed(() => {
  // Because of server inconsistencies we need to be a bit careful about how we get the user id.
  let ret = null

  if (user.value) {
    ret = user.value.userid ? user.value.userid : user.value.id
  }

  return ret
})

const fromName = computed(() => {
  return me.value.displayname
})

const toEmail = computed(() => {
  let ret = null
  if (props.member) {
    ret = props.member.email
  } else if (props.message.fromuser && props.message.fromuser.emails) {
    props.message.fromuser.emails.forEach((email) => {
      if (
        email.email &&
        !email.email.includes('users.ilovefreegle.org') &&
        (ret === null || email.preferred)
      ) {
        ret = email.email
      }
    })
  }

  return ret
})

const processLabel = computed(() => {
  switch (props.stdmsg.action) {
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
  switch (props.stdmsg.newmodstatus) {
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
  switch (props.stdmsg.newdelstatus) {
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

watch(body, () => {
  replyTooShort.value = false
})

async function fillin() {
  // Calculate initial subject.  Everything apart from Edits adds a Re:.
  const defpref = props.stdmsg.action === 'Edit' ? '' : 'Re:'

  if (props.member) {
    subject.value =
      (props.stdmsg.subjpref ? props.stdmsg.subjpref : defpref) +
      (props.stdmsg.subjsuff ? props.stdmsg.subjsuff : '')
  } else {
    subject.value =
      (props.stdmsg.subjpref ? props.stdmsg.subjpref : defpref) +
      (props.stdmsg.action === 'Edit' ? '' : ': ') +
      props.message.subject +
      (props.stdmsg.subjsuff ? props.stdmsg.subjsuff : '')
  }

  subject.value = await substitutionStrings(subject.value)

  // Calculate initial body
  let msg = props.message ? props.message.textbody : ''
  msg = msg || ''

  if (msg || props.member) {
    if (msg) {
      // We have an existing body to include.  Quote it, unless it's an edit.
      const edit = props.stdmsg && props.stdmsg.action === 'Edit'
      if (!edit && msg) {
        msg = '> ' + (msg + '').replace(/((\r\n)|\r|\n)/gm, '\n> ')
      }

      bodyInitialLength.value = msg.length
    }

    if (props.stdmsg) {
      if (props.stdmsg.body) {
        // Text to insert.
        if (props.stdmsg.insert === 'Top') {
          msg = props.stdmsg.body.trim() + '\n\n' + msg
        } else {
          msg = msg + '\n\n' + props.stdmsg.body.trim()
        }
      } else if (props.stdmsg.action !== 'Edit' && msg) {
        // No text to insert - add a couple of blank lines at the top for typing.
        msg = '\n\n' + msg
      }

      if (props.stdmsg.edittext === 'Correct Case') {
        // First the subject
        const matches = SUBJECT_REGEX.exec(subject.value)
        if (
          matches &&
          matches.length > 0 &&
          matches[0].length > 0 &&
          props.message.item
        ) {
          subject.value =
            matches[1] +
            ': ' +
            matches[2].toLowerCase().trim() +
            ' (' +
            matches[3] +
            ')'

          // eslint-disable-next-line vue/no-mutating-props
          props.message.item.name = matches[2].toLowerCase().trim()
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
  } else if (props.stdmsg) {
    // No existing body
    msg = '\n\n' + (props.stdmsg.body ? props.stdmsg.body : '')
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
      props.message ? props.message.subject : ''
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

    if (props.member) {
      text = text.replace(
        /\$memberreason/g,
        props.member.joincomment ? props.member.joincomment : ''
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

    if (props.message) {
      from = props.message.fromuser.realemail
        ? props.message.fromuser.realemail
        : props.message.fromaddr
    } else {
      from = props.member.email
    }

    const fromid = from
      ? from.substring(0, from.indexOf('@'))
      : user.value.displayname
    text = text.replace(/\$memberid/g, fromid)
    const membername = user.value.displayname || fromid
    text = text.replace(/\$membername/g, membername)

    let summ = ''

    if (props.message && props.message.duplicates) {
      props.message.duplicates.forEach((m) => {
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

  if (props.stdmsg.action !== 'Edit' && msglen >= 0 && msglen < 30) {
    replyTooShort.value = true
  } else {
    if (
      props.stdmsg.newdelstatus &&
      props.stdmsg.newdelstatus !== 'UNCHANGED'
    ) {
      changingNewDelStatus.value = true
      await userStore.edit({
        id: userid.value,
        groupid: groupid.value,
        emailfrequency: emailfrequency.value,
      })
      changingNewDelStatus.value = false
      changedNewDelStatus.value = true
    }

    if (
      props.stdmsg.newmodstatus &&
      props.stdmsg.newmodstatus !== 'UNCHANGED'
    ) {
      changingNewModStatus.value = true
      await userStore.edit({
        id: userid.value,
        groupid: groupid.value,
        ourPostingStatus: props.stdmsg.newmodstatus,
      })
      changingNewModStatus.value = false
      changedNewModStatus.value = true
    }

    const subj = subject.value.trim()
    const bodyText = body.value.trim()

    switch (props.stdmsg.action) {
      case 'Approve':
        await messageStore.approve({
          id: props.message.id,
          groupid: groupid.value,
          subject: subj,
          body: bodyText,
          stdmsgid: props.stdmsg.id,
        })
        break
      case 'Leave':
      case 'Leave Approved Message':
        await messageStore.reply({
          id: props.message.id,
          groupid: groupid.value,
          subject: subj,
          body: bodyText,
          stdmsgid: props.stdmsg.id,
        })
        break
      case 'Hold Message':
        changingHold.value = true

        await messageStore.hold({
          id: props.message.id,
        })

        changingHold.value = false
        changedHold.value = true

        await messageStore.reply({
          id: props.message.id,
          groupid: groupid.value,
          subject: subj,
          body: bodyText,
          stdmsgid: props.stdmsg.id,
        })
        break
      case 'Leave Member':
      case 'Leave Approved Member':
        await memberStore.reply({
          id: props.member.userid,
          groupid: groupid.value,
          subject: subj,
          body: bodyText,
          stdmsgid: props.stdmsg.id,
        })
        break
      case 'Reject':
        await messageStore.reject({
          id: props.message.id,
          groupid: groupid.value,
          subject: subj,
          body: bodyText,
          stdmsgid: props.stdmsg.id,
        })
        break
      case 'Delete':
      case 'Delete Approved Message':
        await messageStore.delete({
          id: props.message.id,
          groupid: groupid.value,
          subject: subj,
          body: bodyText,
          stdmsgid: props.stdmsg.id,
        })
        break
      case 'Delete Member':
      case 'Delete Approved Member':
        await memberStore.delete({
          id: props.member.userid,
          groupid: groupid.value,
          subject: subj,
          body: bodyText,
          stdmsgid: props.stdmsg.id,
        })
        break
      case 'Edit':
        if (props.message) {
          if (props.message.item && props.message.location) {
            // Well-structured message
            await messageStore.patch({
              id: props.message.id,
              msgtype: props.message.type,
              item: props.message.item.name,
              location: props.message.location.name,
              textbody: bodyText,
            })
          } else {
            // Not
            await messageStore.patch({
              id: props.message.id,
              subject: subj,
              textbody: bodyText,
            })
          }
        }
        break
      default:
        console.error('Unknown stdmsg action', props.stdmsg.action)
    }
    checkWorkDeferGetMessages()
    hide()
  }
  if (callback) callback()
}

function postcodeSelect(newpc) {
  // eslint-disable-next-line vue/no-mutating-props
  props.message.location = newpc
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
