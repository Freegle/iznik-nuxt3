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
<script>
import dayjs from 'dayjs'
import { useUserStore } from '../stores/user'
import { setupKeywords } from '../composables/useKeywords'
import { useModGroupStore } from '@/stores/modgroup'
import { useMemberStore } from '~/stores/member'
import { useMessageStore } from '~/stores/message'
import { useOurModal } from '~/composables/useOurModal'
import { SUBJECT_REGEX } from '~/constants'
import { useMe } from '~/composables/useMe'
import { useModMe } from '~/composables/useModMe'

export default {
  components: {},
  props: {
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
  },
  setup() {
    const { modal, show, hide } = useOurModal()
    const modGroupStore = useModGroupStore()
    const messageStore = useMessageStore()
    const memberStore = useMemberStore()
    const userStore = useUserStore()
    const { typeOptions } = setupKeywords()
    const { me } = useMe()
    const { checkWorkDeferGetMessages } = useModMe()
    return {
      modGroupStore,
      memberStore,
      messageStore,
      userStore,
      typeOptions,
      modal,
      hide,
      show,
      me,
      checkWorkDeferGetMessages,
    }
  },
  data: function () {
    return {
      subject: null,
      body: null,
      bodyInitialLength: 0,
      replyTooShort: false,
      keywordList: ['Offer', 'Taken', 'Wanted', 'Received', 'Other'],
      recentDays: 31,
      changingNewModStatus: false,
      changedNewModStatus: false,
      changingNewDelStatus: false,
      changedNewDelStatus: false,
      changingHold: false,
      changedHold: false,
      margTop: 0,
      margLeft: 0,
    }
  },
  computed: {
    groupid() {
      let ret = null

      if (this.member) {
        ret = this.member.groupid
      } else if (
        this.message &&
        this.message.groups &&
        this.message.groups.length
      ) {
        ret = this.message.groups[0].groupid
      }
      return ret
    },
    user() {
      return this.message ? this.message.fromuser : this.member
    },
    userid() {
      // Because of server inconsistencies we need to be a bit careful about how we get the user id.
      let ret = null

      if (this.user) {
        ret = this.user.userid ? this.user.userid : this.user.id
      }

      return ret
    },
    fromName() {
      return this.me.displayname
    },
    toEmail() {
      let ret = null
      if (this.member) {
        ret = this.member.email
      } else if (this.message.fromuser && this.message.fromuser.emails) {
        this.message.fromuser.emails.forEach((email) => {
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
    },
    processLabel() {
      switch (this.stdmsg.action) {
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
    },
    modstatus() {
      switch (this.stdmsg.newmodstatus) {
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
    },
    emailfrequency() {
      switch (this.stdmsg.newdelstatus) {
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
    },
    delstatus() {
      switch (this.emailfrequency) {
        case 24:
          return 'Every Day'
        case 0:
          return 'Never'
        case -1:
          return 'Immediately'
        default:
          return 'Unknown'
      }
    },
    warning() {
      let ret = null

      if (this.body) {
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
          'http://':
            "It's better to use https:// links rather than http:// links.",
        }

        // Remove groups.ilovefreegle.org, which is the volunteers address.
        let trimmed = this.body.replace(/\s/g, '').toLowerCase()

        // Remove any Yahoo email addresses, which would trigger a false match.
        trimmed = trimmed.replace('@yahoo', '')

        for (const keyword in checks) {
          if (trimmed.includes(keyword)) {
            ret = checks[keyword]
          }
        }
      }

      return ret
    },
  },
  watch: {
    body() {
      this.replyTooShort = false
    },
  },
  methods: {
    async fillin() {
      // Calculate initial subject.  Everything apart from Edits adds a Re:.
      const defpref = this.stdmsg.action === 'Edit' ? '' : 'Re:'

      if (this.member) {
        this.subject =
          (this.stdmsg.subjpref ? this.stdmsg.subjpref : defpref) +
          (this.stdmsg.subjsuff ? this.stdmsg.subjsuff : '')
      } else {
        this.subject =
          (this.stdmsg.subjpref ? this.stdmsg.subjpref : defpref) +
          (this.stdmsg.action === 'Edit' ? '' : ': ') +
          this.message.subject +
          (this.stdmsg.subjsuff ? this.stdmsg.subjsuff : '')
      }

      this.subject = await this.substitutionStrings(this.subject)

      // Calculate initial body
      let msg = this.message ? this.message.textbody : ''
      msg = msg || ''

      if (msg || this.member) {
        if (msg) {
          // We have an existing body to include.  Quote it, unless it's an edit.
          const edit = this.stdmsg && this.stdmsg.action === 'Edit'
          if (!edit && msg) {
            msg = '> ' + (msg + '').replace(/((\r\n)|\r|\n)/gm, '\n> ')
          }

          this.bodyInitialLength = msg.length
        }

        if (this.stdmsg) {
          if (this.stdmsg.body) {
            // Text to insert.
            if (this.stdmsg.insert === 'Top') {
              msg = this.stdmsg.body.trim() + '\n\n' + msg
            } else {
              msg = msg + '\n\n' + this.stdmsg.body.trim()
            }
          } else if (this.stdmsg.action !== 'Edit' && msg) {
            // No text to insert - add a couple of blank lines at the top for typing.
            msg = '\n\n' + msg
          }

          if (this.stdmsg.edittext === 'Correct Case') {
            // First the subject
            const matches = SUBJECT_REGEX.exec(this.subject)
            if (
              matches &&
              matches.length > 0 &&
              matches[0].length > 0 &&
              this.message.item
            ) {
              this.subject =
                matches[1] +
                ': ' +
                matches[2].toLowerCase().trim() +
                ' (' +
                matches[3] +
                ')'

              // eslint-disable-next-line vue/no-mutating-props
              this.message.item.name = matches[2].toLowerCase().trim()
            } else {
              this.subject = this.subject.toLowerCase().trim()
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
      } else if (this.stdmsg) {
        // No existing body
        msg = '\n\n' + (this.stdmsg.body ? this.stdmsg.body : '')
      }

      this.body = (await this.substitutionStrings(msg)).trim()

      this.showModal = true

      if (this.autosend && !this.warning) {
        // Start doing stuff.
        this.process()
      }
    },
    async substitutionStrings(text) {
      const self = this
      await this.modGroupStore.fetchIfNeedBeMT(this.groupid)
      const group = this.modGroupStore.get(this.groupid)
      if (!group) return text

      if (group && text) {
        text = text.replace(/\$networkname/g, 'Freegle')
        // eslint-disable-next-line prefer-regex-literals
        const re = new RegExp('Freegle', 'ig')
        text = text.replace(
          /\$groupnonetwork/g,
          group.namedisplay.replace(re, '')
        )

        text = text.replace(/\$groupname/g, group.namedisplay)
        text = text.replace(/\$owneremail/g, group.modsemail)
        text = text.replace(/\$volunteersemail/g, group.modsemail)
        text = text.replace(/\$volunteeremail/g, group.modsemail)
        text = text.replace(/\$groupemail/g, group.groupemail)
        text = text.replace(/\$groupurl/g, group.url)
        text = text.replace(/\$myname/g, this.me.displayname)
        text = text.replace(/\$nummembers/g, group.membercount)
        text = text.replace(/\$nummods/g, group.modcount)
        if (group.settings && group.settings.reposts)
          text = text.replace(/\$repostoffer/g, group.settings.reposts.offer)
        if (group.settings && group.settings.reposts)
          text = text.replace(/\$repostwanted/g, group.settings.reposts.wanted)

        text = text.replace(
          /\$origsubj/g,
          this.message ? this.message.subject : ''
        )

        if (this.user.messagehistory) {
          const history = this.user.messagehistory
          let recentmsg = ''
          let count = 0
          if (history.length) {
            history.forEach((msg) => {
              if (msg.daysago < self.recentDays) {
                recentmsg +=
                  dayjs(msg.postdate).format('lll') + ' - ' + msg.subject + '\n'
                count++
              }
            })
          }
          text = text.replace(/\$recentmsg/gim, recentmsg)
          text = text.replace(/\$numrecentmsg/gim, count)

          this.keywordList.forEach((keyword) => {
            let recentmsg = ''
            let count = 0

            if (history.length) {
              history.forEach((msg) => {
                const postdate = dayjs(msg.postdate)
                const daysago = dayjs().diff(postdate, 'day')

                if (msg.type === keyword && daysago < self.recentDays) {
                  recentmsg +=
                    dayjs(msg.postdate).format('lll') +
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

        if (this.member) {
          text = text.replace(
            /\$memberreason/g,
            this.member.joincomment ? this.member.joincomment : ''
          )
        }

        if (this.user && this.user.joined) {
          text = text.replace(
            /\$membersubdate/g,
            // eslint-disable-next-line new-cap
            new dayjs(this.user.joined).format('lll')
          )
        }

        text = text.replace(
          /\$membermail/g,
          this.message ? this.message.fromaddr : this.member.email
        )
        let from

        if (this.message) {
          from = this.message.fromuser.realemail
            ? this.message.fromuser.realemail
            : this.message.fromaddr
        } else {
          from = this.member.email
        }

        const fromid = from
          ? from.substring(0, from.indexOf('@'))
          : this.user.displayname
        text = text.replace(/\$memberid/g, fromid)
        const membername = this.user.displayname || fromid
        text = text.replace(/\$membername/g, membername)

        let summ = ''

        if (this.message && this.message.duplicates) {
          this.message.duplicates.forEach((m) => {
            // eslint-disable-next-line new-cap
            summ += new dayjs(m.date).format('lll') + ' - ' + m.subject + '\n'
          })

          // eslint-disable-next-line prefer-regex-literals
          const regex = new RegExp('\\$duplicatemessages', 'gim')
          text = text.replace(regex, summ)
        }
      }

      return text
    },

    async process(callback) {
      this.replyTooShort = false

      const msglen = this.body.length - this.bodyInitialLength

      if (this.stdmsg.action !== 'Edit' && msglen >= 0 && msglen < 30) {
        this.replyTooShort = true
      } else {
        if (
          this.stdmsg.newdelstatus &&
          this.stdmsg.newdelstatus !== 'UNCHANGED'
        ) {
          this.changingNewDelStatus = true
          await this.userStore.edit({
            id: this.userid,
            groupid: this.groupid,
            emailfrequency: this.emailfrequency,
          })
          this.changingNewDelStatus = false
          this.changedNewDelStatus = true
        }

        if (
          this.stdmsg.newmodstatus &&
          this.stdmsg.newmodstatus !== 'UNCHANGED'
        ) {
          this.changingNewModStatus = true
          await this.userStore.edit({
            id: this.userid,
            groupid: this.groupid,
            ourPostingStatus: this.stdmsg.newmodstatus,
          })
          this.changingNewModStatus = false
          this.changedNewModStatus = true
        }

        const subj = this.subject.trim()
        const body = this.body.trim()

        switch (this.stdmsg.action) {
          case 'Approve':
            await this.messageStore.approve({
              id: this.message.id,
              groupid: this.groupid,
              subject: subj,
              body,
              stdmsgid: this.stdmsg.id,
            })
            break
          case 'Leave':
          case 'Leave Approved Message':
            await this.messageStore.reply({
              id: this.message.id,
              groupid: this.groupid,
              subject: subj,
              body,
              stdmsgid: this.stdmsg.id,
            })
            break
          case 'Hold Message':
            this.changingHold = true

            await this.messageStore.hold({
              id: this.message.id,
            })

            this.changingHold = false
            this.changedHold = true

            await this.messageStore.reply({
              id: this.message.id,
              groupid: this.groupid,
              subject: subj,
              body,
              stdmsgid: this.stdmsg.id,
            })
            break
          case 'Leave Member':
          case 'Leave Approved Member':
            await this.memberStore.reply({
              id: this.member.userid,
              groupid: this.groupid,
              subject: subj,
              body,
              stdmsgid: this.stdmsg.id,
            })
            break
          case 'Reject':
            await this.messageStore.reject({
              id: this.message.id,
              groupid: this.groupid,
              subject: subj,
              body,
              stdmsgid: this.stdmsg.id,
            })
            break
          case 'Delete':
          case 'Delete Approved Message':
            await this.messageStore.delete({
              id: this.message.id,
              groupid: this.groupid,
              subject: subj,
              body,
              stdmsgid: this.stdmsg.id,
            })
            break
          case 'Delete Member':
          case 'Delete Approved Member':
            await this.memberStore.delete({
              id: this.member.userid,
              groupid: this.groupid,
              subject: subj,
              body,
              stdmsgid: this.stdmsg.id,
            })
            break
          case 'Edit':
            if (this.message) {
              if (this.message.item && this.message.location) {
                // Well-structured message
                await this.messageStore.patch({
                  id: this.message.id,
                  msgtype: this.message.type,
                  item: this.message.item.name,
                  location: this.message.location.name,
                  textbody: body,
                })
              } else {
                // Not
                await this.messageStore.patch({
                  id: this.message.id,
                  subject: subj,
                  textbody: body,
                })
              }
            }
            break
          default:
            console.error('Unknown stdmsg action', this.stdmsg.action)
        }
        this.checkWorkDeferGetMessages()
        this.hide()
      }
      if (callback) callback()
    },
    postcodeSelect(newpc) {
      // eslint-disable-next-line vue/no-mutating-props
      this.message.location = newpc
    },
    moveLeft() {
      this.margLeft -= 10
      window.document.getElementById('stdmsgmodal').style.left =
        this.margLeft + 'px'
    },
    moveRight() {
      this.margLeft += 10
      window.document.getElementById('stdmsgmodal').style.left =
        this.margLeft + 'px'
    },
    moveUp() {
      this.margTop -= 10
      window.document.getElementById('stdmsgmodal').style.top =
        this.margTop + 'px'
    },
    moveDown() {
      this.margTop += 10
      window.document.getElementById('stdmsgmodal').style.top =
        this.margTop + 'px'
    },
  },
}
</script>
