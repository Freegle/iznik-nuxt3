<template>
  <div>
    <b-button v-if="groupid && !banned" variant="white" @click="remove">
      <v-icon icon="times" /> Remove
    </b-button>
    <b-button v-if="groupid && !banned" variant="white" @click="ban">
      <v-icon icon="trash-alt" /> Ban
    </b-button>
    <b-button v-if="!spam" variant="white" @click="spamReport">
      <v-icon icon="ban" /> Spammer
    </b-button>
    <b-button v-if="supportOrAdmin" variant="white" @click="spamWhitelist">
      <v-icon icon="check" /> Whitelist
    </b-button>
    <b-button v-if="groupid" variant="white" @click="addAComment">
      <v-icon icon="tag" /> Add note
    </b-button>
    <ConfirmModal v-if="removeConfirm && groupname" ref="removeConfirm" :title="'Remove ' + displayname + ' from ' + groupname + '?'"
      @confirm="removeConfirmed" />
    <ConfirmModal v-if="removeConfirm && !groupname" ref="removeConfirm" title="Please select a group first." />
    <ModBanMemberConfirmModal v-if="banConfirm" ref="banConfirm" :userid="userid" :groupid="groupid" @confirm="banConfirmed" />
    <ModCommentAddModal v-if="addComment" ref="addComment" :user="user" :groupid="groupid" @added="updateComments" />
    <ModSpammerReport v-if="showSpamModal" ref="spamConfirm" :user="reportUser" :whitelist="whitelist" />
  </div>
</template>
<script>
import { useGroupStore } from '../stores/group'
import { useUserStore } from '../stores/user'
import { useMemberStore } from '../stores/member'

export default {
  props: {
    userid: {
      type: Number,
      required: true
    },
    groupid: {
      type: Number,
      required: false,
      default: null
    },
    banned: {
      type: Boolean,
      required: false,
      default: false
    },
    spam: {
      type: Object,
      required: false,
      default: null
    }
  },
  setup() {
    const groupStore = useGroupStore()
    const memberStore = useMemberStore()
    const userStore = useUserStore()
    return { groupStore, memberStore, userStore }
  },
  data: function () {
    return {
      removeConfirm: false,
      banConfirm: false,
      addComment: false,
      user: null,
      showSpamModal: false,
      whitelist: false
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
        userid: this.user.id,
        displayname: this.user.displayname
      }
    }
  },
  methods: {
    async fetchUser() {
      await this.userStore.fetch(this.userid, true)

      this.user = this.userStore.get(this.userid)
    },
    async remove() {
      if (!this.user) {
        await this.fetchUser()
      }

      this.removeConfirm = true

      this.waitForRef('removeConfirm', () => {
        this.$refs.removeConfirm.show()
      })
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

      this.waitForRef('banConfirm', () => {
        this.$refs.banConfirm.show()
      })
    },
    banConfirmed() {
      this.memberStore.ban(this.userid, this.groupid)
    },
    async addAComment() {
      if (!this.user) {
        await this.fetchUser()
      }

      this.addComment = true
      this.waitForRef('addComment', () => {
        this.$refs.addComment.show()
      })
    },
    async updateComments() {
      // The server API doesn't make it easy to refresh comments on memberships, because we can't refetch a
      // specific membership id.  Instead fetch the user and then pass any comments to the store to update there.
      await this.userStore.fetch(this.userid, true)

      const user = this.userStore.get(this.userid)

      await this.memberStore.updateComments(this.user.id, user.comments)
    },
    async spamReport() {
      console.log('===spamReport 2')
      if (!this.user) {
        await this.fetchUser()
      }

      this.whitelist = false
      this.showSpamModal = true
console.log('===this.waitForRef')
      this.waitForRef('spamConfirm', () => {
        this.$refs.spamConfirm.show()
      })
    },
    async spamWhitelist() {
      if (!this.user) {
        await this.fetchUser()
      }

      this.whitelist = true
      this.showSpamModal = true

      this.waitForRef('spamConfirm', () => {
        this.$refs.spamConfirm.show()
      })
    }
  }
}
</script>
