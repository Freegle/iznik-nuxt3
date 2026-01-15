<template>
  <b-card no-body>
    <b-card-body class="p-2">
      <div>
        <strong>{{
          membership.namedisplay.length > 32
            ? membership.namedisplay.substring(0, 32) + '...'
            : membership.namedisplay
        }}</strong>
        <span
          :class="
            'small ' +
            (daysago(membership.added) < 31
              ? 'text-danger font-weight-bold'
              : 'text-muted')
          "
        >
          joined {{ timeago(membership.added) }}</span
        >
        <span v-if="membership.reviewreason" class="text-danger ml-1 mr-1">
          <span v-if="membership.reviewrequestedat" class="text-dark small"
            >flagged {{ timeago(membership.reviewrequestedat) }}</span
          >
          {{ membership.reviewreason }}
        </span>
      </div>
      <div v-if="amAModOn(membership.id) && needsReview && membership.heldby">
        <NoticeMessage variant="warning" class="mt-2 mb-2">
          <p v-if="me.id === membership.heldby">
            You held this member. Other people will see a warning to check with
            you before releasing them.
          </p>
          <p v-else>
            Held by
            <v-icon icon="hashtag" class="text-muted" scale="0.5" /><strong>{{
              membership.heldby
            }}</strong
            >. Please check before releasing them.
          </p>
        </NoticeMessage>
      </div>
      <div
        v-if="amAModOn(membership.id) && needsReview"
        class="d-flex mt-2 flex-wrap"
      >
        <SpinButton
          v-if="!membership.heldby || membership.heldby.id === myid"
          icon-name="check"
          spinclass="success"
          variant="primary"
          label="Ignore"
          class="mr-2 mb-1"
          @handle="ignore"
        />
        <SpinButton
          v-if="!membership.heldby || membership.heldby.id === myid"
          icon-name="trash-alt"
          spinclass="success"
          variant="warning"
          label="Remove"
          class="mr-2 mb-1"
          @handle="remove"
        />
        <ModMemberButton
          v-if="!membership.heldby"
          :member="membership"
          variant="warning"
          icon="pause"
          reviewhold
          :reviewgroupid="groupid"
          label="Hold"
          class="mr-2"
        />
        <ModMemberButton
          v-else
          :member="membership"
          variant="warning"
          icon="play"
          reviewrelease
          :reviewgroupid="groupid"
          label="Release"
          class="mr-2"
        />
        <b-button
          :to="'/members/approved/' + membership.id + '/' + member.userid"
          variant="secondary"
          class="mb-1"
        >
          Go to membership
        </b-button>
      </div>
    </b-card-body>
    <ConfirmModal
      v-if="showConfirmModal"
      ref="removeConfirm"
      :title="
        'Remove ' + member.displayname + ' from ' + membership.namedisplay + '?'
      "
      @confirm="removeConfirmed"
      @hidden="showConfirmModal = false"
    />
  </b-card>
</template>
<script>
import dayjs from 'dayjs'
import { useUserStore } from '~/stores/user'
import { useMemberStore } from '~/stores/member'
import { useMe } from '~/composables/useMe'
import { useModMe } from '~/composables/useModMe'

export default {
  props: {
    memberid: {
      type: Number,
      required: true,
    },
    member: {
      type: Object,
      required: true,
    },
    membership: {
      type: Object,
      required: true,
    },
  },
  emits: ['forcerefresh'],
  setup() {
    const memberStore = useMemberStore()
    const userStore = useUserStore()
    const { me, myid } = useMe()
    const { amAModOn } = useModMe()
    return {
      memberStore,
      userStore,
      me,
      myid,
      amAModOn,
    }
  },
  data: function () {
    return {
      reviewed: false,
      showConfirmModal: false,
    }
  },
  computed: {
    groupid() {
      let ret = null

      this.member.memberof.forEach((h) => {
        if (h.id === this.membership.id) {
          ret = h.id
        }
      })

      return ret
    },
    needsReview() {
      if (this.reviewed) {
        return false
      }

      return (
        !this.membership.reviewedat ||
        new Date(this.membership.reviewrequestedat).getTime() >=
          new Date(this.membership.reviewedat).getTime()
      )
    },
  },
  methods: {
    remove(callback) {
      this.showConfirmModal = true
      this.$refs.removeConfirm?.show()

      setTimeout(() => {
        this.reviewed = true
        callback()
      }, 2000)
    },
    async removeConfirmed() {
      await this.memberStore.remove(this.member.userid, this.membership.id)

      setTimeout(() => {
        this.reviewed = true
        this.forcerefresh(true)
      }, 2000)
    },
    async ignore(callback) {
      await this.memberStore.spamignore({
        userid: this.member.userid,
        groupid: this.membership.id,
      })

      setTimeout(() => {
        this.reviewed = true
        callback()
        this.forcerefresh(true)
      }, 2000)
    },
    daysago(d) {
      return dayjs().diff(dayjs(d), 'day')
    },
    forcerefresh() {
      this.$emit('forcerefresh')
    },
  },
}
</script>
