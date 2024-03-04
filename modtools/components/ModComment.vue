<template>
  <div>
    <NoticeMessage v-if="savedComment" variant="danger" class="mb-2">
      <div v-for="n in 10" :key="'modcomments-' + user.id + '-' + savedComment.id + '-' + n">
        <div class="d-flex">
          <div v-if="n === 1 && savedComment.flag">
            <v-icon v-if="savedComment.flag" icon="exclamation-triangle" class="mr-1" />
          </div>
          <read-more v-if="savedComment['user' + n]" :text="savedComment['user' + n]" :max-chars="expandComments ? 1000 : 80"
            class="font-weight-bold nopara" />
        </div>
      </div>
      <!--TODO div class="small">
        <span v-if="savedComment.byuser">
          <v-icon icon="tag" /> by {{ savedComment.byuser.displayname }}
        </span>
        <span v-if="savedComment.date !== savedComment.reviewed">
          Created <span :title="datetimeshort(savedComment.date)">{{ datetimeshort(savedComment.date) }}</span> reviewed <span
            :title="datetimeshort(savedComment.reviewed)">{{ datetimeshort(savedComment.reviewed) }}</span>
        </span>
        <span v-else :title="datetimeshort(savedComment.date)">
          {{ timeadapt(savedComment.date) }}
        </span>
        <span v-if="savedComment.groupid">
          on {{ groupname }}
        </span>
        <span v-if="amAModOn(savedComment.groupid) || supportOrAdmin">
          <b-button variant="link" size="sm" @click="editIt">
            <v-icon icon="pen" /> Edit
          </b-button>
          <b-button variant="link" size="sm" @click="deleteIt">
            <v-icon icon="trash-alt" /> Delete
          </b-button>
        </span>
      </div>
      <ConfirmModal ref="confirm" @confirm="deleteConfirmed" />
      <ModCommentEditModal v-if="amAModOn(savedComment.groupid) || supportOrAdmin" ref="editComment" :user="user" :comment="comment"
        @edited="updateComments" /-->
    </NoticeMessage>
  </div>
</template>

<script>
import ReadMore from 'vue-read-more3/src/ReadMoreComponent'
import { useGroupStore } from '~/stores/group'
import { useMemberStore } from '../stores/member'
import { useUserStore } from '~/stores/user'
import cloneDeep from 'lodash.clonedeep'
//const ConfirmModal = () => import('~/components/ConfirmModal.vue')

export default {
  components: { ReadMore },

  setup() {
    const groupStore = useGroupStore()
    const memberStore = useMemberStore()
    const userStore = useUserStore()
    return { groupStore, memberStore, userStore }
  },

  props: {
    comment: {
      type: Object,
      required: true
    },
    user: {
      type: Object,
      required: true
    },
    expandComments: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  data: function () {
    return {
      savedComment: null
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
    }
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
      // The server API doesn't make it easy to refresh comments on memberships, because we can't refetch a
      // specific membership id.  Instead fetch the user and then pass any comments to the store to update there.
      const userid = this.user.userid ? this.user.userid : this.user.id
      await this.userStore.fetch({
        id: userid,
        info: true
      })

      const user = this.userStore.get(userid)

      await this.memberStore.updateComments({
        userid: userid,
        comments: user.comments
      })

      this.savedComment = user.comments.find(comm => {
        return comm.id === this.savedComment.id
      })

      this.$emit('updated')
    },

    deleteIt() {
      alert("todo")
      //this.waitForRef('confirm', () => {
      //  this.$refs.confirm.show()
      //})
    },

    async deleteConfirmed() {
      // Go direct to API because comments aren't in the Store separately.
      alert("todo")
      //await this.$api.comment.del(this.comment.id)

      this.updateComments()
    },

    editIt() {
      alert("todo")
      //this.waitForRef('editComment', () => {
      //  this.$refs.editComment.show()
      //})
    }
  }
}
</script>
