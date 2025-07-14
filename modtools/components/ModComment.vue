<template>
  <div>
    <NoticeMessage v-if="savedComment" variant="danger" class="mb-2">
      <div
        v-for="n in 10"
        :key="'modcomments-' + user.id + '-' + savedComment.id + '-' + n"
      >
        <div class="d-flex">
          <div v-if="n === 1 && savedComment.flag">
            <v-icon
              v-if="savedComment.flag"
              icon="exclamation-triangle"
              class="mr-1"
            />
          </div>
          <read-more
            v-if="savedComment['user' + n]"
            :text="savedComment['user' + n]"
            :max-chars="expandComments ? 1000 : 80"
            class="font-weight-bold nopara"
          />
        </div>
      </div>
      <div class="small">
        <span v-if="savedComment.byuser"
          ><v-icon icon="tag" /> by
          {{ savedComment.byuser.displayname }} -</span
        >
        <span v-if="savedComment.date !== savedComment.reviewed">
          Created
          <span :title="datetimeshort(savedComment.date)">{{
            datetimeshort(savedComment.date)
          }}</span>
          reviewed
          <span :title="datetimeshort(savedComment.reviewed)">{{
            datetimeshort(savedComment.reviewed)
          }}</span>
        </span>
        <span v-else :title="datetimeshort(savedComment.date)">
          {{ timeadapt(savedComment.date) }}
        </span>
        <span v-if="savedComment.groupid"> on {{ groupname }} </span>
        <span
          v-if="
            amAModOn(savedComment.groupid) ||
            supportOrAdmin ||
            savedComment.byuserid === myid
          "
        >
          <b-button variant="link" size="sm" @click="editIt">
            <v-icon icon="pen" /> Edit
          </b-button>
          <b-button variant="link" size="sm" @click="deleteIt">
            <v-icon icon="trash-alt" /> Delete
          </b-button>
        </span>
      </div>
      <ConfirmModal
        v-if="showConfirmDelete"
        ref="confirm"
        @confirm="deleteConfirmed"
        @hidden="showConfirmDelete = false"
      />
      <ModCommentEditModal
        v-if="showCommentEditModal"
        ref="editComment"
        :user="user"
        :comment="comment"
        :groupname="groupname"
        @edited="updateComments"
        @hidden="showCommentEditModal = false"
      />
    </NoticeMessage>
  </div>
</template>

<script>
import ReadMore from 'vue-read-more3/src/ReadMoreComponent'
import cloneDeep from 'lodash.clonedeep'
import { useMemberStore } from '../stores/member'
import { setupModMembers } from '../composables/useModMembers'
import { useGroupStore } from '~/stores/group'
import { useUserStore } from '~/stores/user'
import { useMe } from '~/composables/useMe'

export default {
  components: { ReadMore },

  props: {
    comment: {
      type: Object,
      required: true,
    },
    user: {
      type: Object,
      required: true,
    },
    expandComments: {
      type: Boolean,
      required: false,
      default: false,
    },
  },

  setup() {
    const groupStore = useGroupStore()
    const memberStore = useMemberStore()
    const userStore = useUserStore()
    const { bump, context } = setupModMembers()
    const { supportOrAdmin, myGroup } = useMe()
    return {
      bump,
      context,
      groupStore,
      memberStore,
      userStore,
      supportOrAdmin,
      myGroup,
    }
  },
  data: function () {
    return {
      showConfirmDelete: false,
      showCommentEditModal: false,
      savedComment: null,
    }
  },
  computed: {
    group() {
      let ret = null

      if (this.comment.groupid) {
        ret = this.myGroup(this.comment.groupid)

        if (!ret) {
          ret = this.groupStore.get(this.comment.groupid)
        }
      }

      return ret
    },
    groupname() {
      return this.group ? this.group.namedisplay : '#' + this.comment.groupid
    },
  },
  mounted() {
    // To stop it updating on screen when editing in a modal.
    this.savedComment = cloneDeep(this.comment)

    if (this.comment.groupid && !this.group) {
      // Need to fetch group
      this.groupStore.fetch(this.comment.groupid)
    }
  },
  methods: {
    async updateComments() {
      const userid = this.user.userid ? this.user.userid : this.user.id

      await this.userStore.fetchMT({
        id: userid,
        emailhistory: true,
      })

      const user = this.userStore.byId(userid)
      const savedCommentId = this.savedComment.id
      this.savedComment = false
      if (user.comments) {
        this.savedComment = user.comments.find((comm) => {
          return comm.id === savedCommentId
        })
      }
      this.context = null
      this.bump++
      this.$emit('updated')
    },

    deleteIt() {
      this.showConfirmDelete = true
    },

    async deleteConfirmed() {
      await this.userStore.deleteComment(this.comment.id)
      this.updateComments()
    },

    editIt() {
      this.showCommentEditModal = true
      this.$emit('editing')
    },
  },
}
</script>
