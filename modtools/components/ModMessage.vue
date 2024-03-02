<template>
  <div>
    <div ref="top" style="position:relative; top:-66px" />
    {{  message.id }} {{  message }}
    <ModMessageEmailModal v-if="message.source === 'Email'" :id="message.id" ref="original" />
    <div ref="bottom" />
  </div>
</template>
<script>
import { useLocationStore } from '../../stores/location'
import { useModconfigsStore } from '../stores/modconfigs'
import { useMessageStore } from '../../stores/message'
import { useUserStore } from '../../stores/user'

//import keywords from '@/mixins/keywords.js'
import { SUBJECT_REGEX } from '../utils/constants'
import MessageHistory from './MessageHistory'
import MessageUserInfo from './MessageUserInfo'
import MessageReplyInfo from './MessageReplyInfo'
import SettingsGroup from './SettingsGroup'
import ModPhoto from './ModPhoto'
import ModMessageButtons from './ModMessageButtons'
import ModMessageWorry from './ModMessageWorry'
import ModMemberActions from './ModMemberActions'
import Diff from './Diff'
import ModSpammer from './ModSpammer'
import ModComments from './ModComments'
import ModMessageEmailModal from './ModMessageEmailModal'
import ModMessageDuplicate from './ModMessageDuplicate'
import ModMessageCrosspost from './ModMessageCrosspost'
import ModMessageRelated from './ModMessageRelated'
import ModMessageButton from './ModMessageButton'
import ModMessageMicroVolunteering from './ModMessageMicroVolunteering'
import SpinButton from '~/components/SpinButton'
const Highlighter = () => import('vue-highlight-words')
const OurFilePond = () => import('~/components/OurFilePond')

import { twem } from '~/composables/useTwem'

export default {
  name: 'ModMessage',
  components: {
    OurFilePond,
    ModMessageMicroVolunteering,
    ModMessageButton,
    ModMessageRelated,
    ModMessageCrosspost,
    ModMessageDuplicate,
    ModMessageEmailModal,
    ModComments,
    ModSpammer,
    Diff,
    ModMemberActions,
    ModMessageWorry,
    ModMessageButtons,
    ModPhoto,
    SettingsGroup,
    MessageReplyInfo,
    MessageUserInfo,
    MessageHistory,
    Highlighter,
    SpinButton
  },
  //mixins: [keywords],
  props: {
    message: {
      type: Object,
      required: true
    },
    editreview: {
      type: Boolean,
      required: false,
      default: false
    },
    noactions: {
      type: Boolean,
      required: false,
      default: false
    },
    summary: {
      type: Boolean,
      required: false,
      default: false
    },
    review: {
      type: Boolean,
      required: false,
      default: false
    },
    search: {
      type: String,
      required: false,
      default: null
    },
    next: {
      type: Number,
      required: false,
      default: null
    },
    nextAfterRemoved: {
      type: Number,
      required: false,
      default: null
    }
  },
  setup() {
    const locationStore = useLocationStore()
    const modconfigsStore = useModconfigsStore()
    const messageStore = useMessageStore()
    const userStore = useUserStore()

    return { locationStore, messageStore, modconfigsStore, userStore }
  },
  data: function () {
    return {
      saving: false,
      saved: false,
      showMailSettings: false,
      showActions: false,
      showEmails: false,
      editing: false,
      expanded: false,
      editgroup: null,
      uploading: false,
      attachments: [],
      homegroup: null,
      homegroupontn: false
    }
  },
  computed: {
    group() {
      let ret = null

      if (this.message && this.message.groups && this.message.groups.length) {
        const groupid = this.message.groups[0].groupid
        ret = this.myGroups.find(g => parseInt(g.id) === groupid)
      }

      return ret
    },
    position() {
      let ret = null

      if (this.message) {
        if (this.message.location) {
          // This is what we put in for message submitted on FD.
          ret = this.message.location
        } else if (this.message.lat || this.message.lng) {
          // This happens for TN messages
          ret = {
            lat: this.message.lat,
            lng: this.message.lng
          }
        }
      }

      return ret
    },
    outsideUK() {
      return (
        this.position &&
        (this.position.lng < -16 ||
          this.position.lat < 49 ||
          this.position.lng > 4 ||
          this.position.lat > 64)
      )
    },
    pending() {
      return this.hasCollection('Pending')
    },
    approved() {
      return this.hasCollection('Approved')
    },
    eSubject() {
      return twem.twem(this.$twemoji, this.message.subject)
    },
    eBody() {
      return twem.twem(this.$twemoji, this.message.textbody)
    },
    membership() {
      let ret = null

      if (this.groupid) {
        ret =
          this.message.fromuser &&
          this.message.fromuser.memberof &&
          this.message.fromuser.memberof.find(g => g.id === this.groupid)
      }

      return ret
    },
    modconfig() {
      let ret = null
      let configid = null

      this.myGroups.forEach(group => {
        if (group.id === this.groupid) {
          configid = group.configid
        }
      })

      const configs = this.modconfigsStore.list
      ret = configs.find(config => config.id === configid)

      return ret
    },
    subjectClass() {
      let ret = 'text-success'

      if (this.modconfig && this.modconfig.coloursubj) {
        ret = this.message.subject.match(this.modconfig.subjreg)
          ? 'text-success'
          : 'text-danger'
      }

      return ret
    },
    oldSubject() {
      if (!this.editreview || !this.message || !this.message.edits) {
        return null
      }

      // Edits are in descending time order.
      let oldest = null

      this.message.edits.forEach(edit => {
        if (edit.reviewrequired && edit.oldsubject) {
          oldest = edit.oldsubject
        }
      })

      return oldest
    },
    newSubject() {
      if (!this.editreview || !this.message || !this.message.edits) {
        return null
      }

      // Find the newest and oldest texts; intermediates are just confusing.
      // Edits are in descending time order.
      let newest = null

      this.message.edits.forEach(edit => {
        if (edit.reviewrequired) {
          if (edit.newsubject && !newest) {
            newest = edit.newsubject
          }
        }
      })

      return newest
    },
    oldBody() {
      if (!this.editreview || !this.message || !this.message.edits) {
        return null
      }

      // Edits are in descending time order.
      let oldest = null

      this.message.edits.forEach(edit => {
        if (edit.reviewrequired && edit.oldtext) {
          oldest = edit.oldtext
        }
      })

      return oldest
    },
    newBody() {
      if (!this.editreview || !this.message || !this.message.edits) {
        return null
      }

      // Find the newest and oldest texts; intermediates are just confusing.
      // Edits are in descending time order.
      let newest = this.message.textbody

      this.message.edits.forEach(edit => {
        if (edit.reviewrequired) {
          if (edit.newtext && !newest) {
            newest = edit.newtext
          }
        }
      })

      return newest
    },
    duplicateAge() {
      let ret = 31
      let check = false

      this.message.groups.forEach(g => {
        const group = this.myGroup(g.groupid)

        if (
          group &&
          (!group.settings ||
            !group.settings.duplicates ||
            group.settings.duplicates.check)
        ) {
          check = true
          const msgtype = this.message.type.toLowerCase()
          ret = Math.min(ret, group.settings.duplicates[msgtype])
        }
      })

      return check ? ret : null
    },
    crossposts() {
      return this.checkHistory(false)
    },
    duplicates() {
      return this.checkHistory(true)
    },
    memberGroupIds() {
      return this.message &&
        this.message.fromuser &&
        this.message.fromuser.memberof
        ? this.message.fromuser.memberof.map(g => g.id)
        : []
    }
  },
  watch: {
    summary(newVal) {
      if (newVal && this.expanded) {
        this.expanded = false
      } else if (!newVal && !this.expanded) {
        this.expanded = true
      }
    },
    nextAfterRemoved(newVal, oldVal) {
      if (newVal === this.message.id) {
        // This message is the one after one which has just been removed.  Make sure the top is visible.
        this.$refs.bottom.scrollIntoView()
        this.$refs.top.scrollIntoView(true)
      }
    }
  },
  mounted() {
    this.expanded = !this.summary
    this.attachments = this.message.attachments
    this.findHomeGroup()
  },
  beforeDestroy() {
    this.$emit('destroy', this.message.id, this.next)
  },
  methods: {
    imageAdded(id) {
      let ret = false

      if (this.editreview && this.message && this.message.edits) {
        this.message.edits.forEach(edit => {
          const n = edit.newimages ? JSON.parse(edit.newimages) : []
          const o = edit.oldimages ? JSON.parse(edit.oldimages) : []
          if (n.includes(id) && !o.includes(id)) {
            ret = true
          }
        })
      }

      return ret
    },
    imageRemoved(id) {
      let ret = false

      if (this.editreview && this.message && this.message.edits) {
        this.message.edits.forEach(edit => {
          const n = edit.newimages ? JSON.parse(edit.newimages) : []
          const o = edit.oldimages ? JSON.parse(edit.oldimages) : []
          if (!n.includes(id) && o.includes(id)) {
            ret = true
          }
        })
      }

      return ret
    },
    hasCollection(coll) {
      let ret = false

      if (this.message.groups) {
        this.message.groups.forEach(group => {
          if (group.collection === coll) {
            ret = true
          }
        })
      }

      return ret
    },
    postcodeSelect(pc) {
      this.message.location = pc
    },
    startEdit() {
      this.editing = true
      this.message.groups.forEach(group => {
        this.editgroup = group.groupid
      })
    },
    async save() {
      this.saving = true

      const attids = []

      for (const att of this.attachments) {
        attids.push(att.id)
      }

      if (this.message.item && this.message.location) {
        // Well-structured message
        await this.messageStore.patch({
          id: this.message.id,
          msgtype: this.message.type,
          item: this.message.item.name,
          location: this.message.location.name,
          attachments: attids,
          textbody: this.message.textbody
        })
      } else {
        // Not
        await this.messageStore.patch({
          id: this.message.id,
          msgtype: this.message.type,
          subject: this.message.subject,
          attachments: attids,
          textbody: this.message.textbody
        })
      }

      let alreadyon = false

      this.message.groups.forEach(g => {
        if (g.groupid === this.editgroup) {
          alreadyon = true
        }
      })

      if (!alreadyon) {
        console.log('Need to move to group', this.editgroup)
        await this.messageStore.move({
          id: this.message.id,
          groupid: this.editgroup
        })
      }

      this.saving = false
      this.editing = false
    },
    settingsChange(e) {
      const params = {
        userid: this.message.fromuser.id,
        groupid: this.groupid
      }
      params[e.param] = e.val
      this.membersStore.update(params)
    },
    async toggleMail() {
      this.showMailSettings = !this.showMailSettings

      if (this.showMailSettings) {
        // Get the user into the store for SettingsGroup.
        await this.usersStore.fetch(this.message.fromuser.id)
      }
    },
    viewSource() {
      this.waitForRef('original', () => {
        this.$refs.original.show()
      })
    },
    canonSubj(subj) {
      subj = subj.toLocaleLowerCase()

      // Remove any group tag
      subj = subj.replace(/^\[.*?\](.*)/, '$1')

      // Remove duplicate spaces
      subj = subj.replace(/\s+/g, ' ')

      subj = subj.trim()

      const matches = SUBJECT_REGEX.exec(subj)
      if (matches?.length > 2) {
        // Well-formed - remove the location.
        subj = matches[1] + ': ' + matches[2].toLowerCase().trim()
      }

      return subj
    },
    checkHistory(duplicateCheck) {
      const ret = []
      const subj = this.canonSubj(this.message.subject)
      const dupids = []
      const crossids = []

      if (
        this.message &&
        this.message.fromuser &&
        this.message.fromuser.messagehistory
      ) {
        this.message.fromuser.messagehistory.forEach(message => {
          if (
            message.id !== this.message.id &&
            this.duplicateAge &&
            message.daysago <= this.duplicateAge
          ) {
            if (this.canonSubj(message.subject) === subj) {
              // No point displaying any group tag in the duplicate.
              message.subject = message.subject.replace(/\[.*\](.*)/, '$1')

              // Check whether there are groups in common.
              const groupsInCommon = this.message.groups
                .map(g => g.groupid)
                .filter(g => g === message.groupid).length

              const key = message.id + '-' + message.arrival

              if (duplicateCheck && groupsInCommon) {
                // Same group - so this is a duplicate
                if (!dupids[key]) {
                  dupids[key] = true
                  ret.push(message)
                }
              } else if (!duplicateCheck && !groupsInCommon) {
                // Different group - so this is a crosspost.
                if (!crossids[key]) {
                  crossids[key] = true
                  ret.push(message)
                }
              }
            }
          }
        })
      }

      return ret
    },
    photoAdd() {
      // Flag that we're uploading.  This will trigger the render of the filepond instance and subsequently the
      // init callback below.
      this.uploading = true
    },
    photoProcessed(imageid, imagethumb, image) {
      // We have uploaded a photo.  Remove the filepond instance.
      this.uploading = false

      this.attachments.push({
        id: imageid,
        paththumb: imagethumb,
        path: image
      })

      this.messageStore.fetch(this.message.id)
    },
    async findHomeGroup() {
      if (this.message && this.message.lat && this.message.lng) {
        const loc = await this.locationStore.fetch({
          lat: this.message.lat,
          lng: this.message.lng
        })

        if (loc && loc.groupsnear && loc.groupsnear.length) {
          // The group might not be on TN.
          this.homegroup = loc.groupsnear[0].namedisplay
          this.homegroupontn = loc.groupsnear[0].ontn
        }
      }
    },
    cancelEdit() {
      this.editing = false

      // Fetch the message again to revert any changes.
      this.messageStore.fetch(this.message.id)
    },
    backToPending() {
      this.messageStore.backToPending(this.message.id)
    }
  }
}
</script>
<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins/_breakpoints';
//@import 'color-vars';

.type {
  max-width: 150px;
}

.location {
  max-width: 250px;
}

.fullsubject {
  display: grid;
  grid-template-columns: 200px 1fr;

  grid-column: 2 / 3;

  label {
    grid-column: 1 / 2;
  }

  @include media-breakpoint-down(md) {
    grid-template-columns: 1fr;
  }
}

.addedMessage,
.removedMessage {
  display: none;
}

.addedImage {
  border: 1px solid $color-green--dark !important;

  .addedMessage {
    display: block !important;
  }
}

.removedImage {
  border: 1px solid $color-red--dark !important;

  .removedMessage {
    display: block !important;
  }
}
</style>
