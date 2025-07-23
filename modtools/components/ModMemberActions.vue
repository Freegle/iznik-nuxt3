<template>
  <div>
    <b-button v-if="groupid && !banned" variant="white" @click="remove">
      <v-icon icon="times" /> Remove
    </b-button>
    <b-button v-if="groupid && !banned" variant="white" @click="ban">
      <v-icon icon="trash-alt" /> Ban
    </b-button>
    <b-button v-if="!spam" variant="white" @click="spamReport">
      <v-icon icon="ban" /> Report Spammer
    </b-button>
    <b-button v-if="supportOrAdmin" variant="white" @click="spamSafelist">
      <v-icon icon="check" /> Safelist
    </b-button>
    <b-button v-if="groupid" variant="white" @click="addAComment">
      <v-icon icon="tag" /> Add note
    </b-button>
    <ConfirmModal
      v-if="removeConfirm && groupname"
      ref="removeConfirm"
      :title="'Remove ' + displayname + ' from ' + groupname + '?'"
      @confirm="removeConfirmed"
    />
    <ConfirmModal
      v-if="removeConfirm && !groupname"
      ref="removeConfirm"
      title="Please select a group first."
    />
    <ModBanMemberConfirmModal
      v-if="banConfirm"
      ref="banConfirm"
      :userid="userid"
      :groupid="groupid"
      @confirm="banConfirmed"
    />
    <ModCommentAddModal
      v-if="showAddCommentModal"
      :user="user"
      :groupid="groupid"
      :groupname="groupname"
      @added="commentadded"
      @hidden="showAddCommentModal = false"
    />
    <ModSpammerReport
      v-if="showSpamModal"
      ref="spamConfirm"
      :user="reportUser"
      :safelist="safelist"
    />
  </div>
</template>
<script>
import { useGroupStore } from '../stores/group'
import { useUserStore } from '../stores/user'
import { useMemberStore } from '../stores/member'
import { useMe } from '~/composables/useMe'

export default {
  props: {
    userid: {
      type: Number,
      required: true,
    },
    groupid: {
      type: Number,
      required: false,
      default: null,
    },
    banned: {
      type: Boolean,
      required: false,
      default: false,
    },
    spam: {
      type: Object,
      required: false,
      default: null,
    },
  },
  setup() {
    const groupStore = useGroupStore()
    const memberStore = useMemberStore()
    const userStore = useUserStore()
    const { me, myid, supportOrAdmin } = useMe()
    return { groupStore, memberStore, userStore, me, myid, supportOrAdmin }
  },
  data: function () {
    return {
      removeConfirm: false,
      banConfirm: false,
      showAddCommentModal: false,
      user: null,
      showSpamModal: false,
      safelist: false,
    }
  },
  computed: {
    displayname() {
      return this.user ? this.user.displayname : null
    },
    group() {
      return this.groupStore.get(this.groupid)
    },
    groupname() {
      return this.group ? this.group.nameshort : null
    },
    reportUser() {
      return {
        // Due to inconsistencies about userid vs id in objects.
        userid: this.user?.id,
        id: this.user?.id,
        displayname: this.user?.displayname,
      }
    },
  },
  methods: {
    async fetchUser() {
      await this.userStore.fetch(this.userid, true)

      this.user = this.userStore.byId(this.userid)
    },
    async remove() {
      if (!this.user) {
        await this.fetchUser()
      }

      this.removeConfirm = true
      this.$refs.removeConfirm?.show()
    },
    removeConfirmed() {
      this.memberStore.remove(this.userid, this.groupid)
    },
    async ban() {
      if (!this.user) {
        await this.fetchUser()
      }

      if (!this.group) {
        await this.groupStore.fetch(this.groupid)
      }

      this.banConfirm = true
      this.$refs.banConfirm?.show()
    },
    async banConfirmed(reason) {
      this.memberStore.ban(this.userid, this.groupid)
      await this.$api.comment.add({
        userid: this.userid,
        groupid: this.groupid,
        user1:
          'Banned on ' +
          this.group.nameshort +
          ' by ' +
          this.me.displayname +
          ' reason: ' +
          reason,
        flag: true,
      })
    },
    async addAComment() {
      if (!this.user) {
        await this.fetchUser()
      }

      this.showAddCommentModal = true
    },
    async commentadded() {
      await this.userStore.fetchMT({
        id: this.userid,
        emailhistory: true,
      })

      this.$emit('commentadded')
    },
    async spamReport() {
      if (!this.user) {
        await this.fetchUser()
      }

      this.safelist = false
      this.showSpamModal = true
      this.$refs.spamConfirm?.show()
    },
    async spamSafelist() {
      if (!this.user) {
        await this.fetchUser()
      }

      this.safelist = true
      this.showSpamModal = true
      this.$refs.spamConfirm?.show()
    },
  },
}
</script>
