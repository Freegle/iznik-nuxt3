<template>
  <div>
    <b-modal
      id="banMemberModal"
      ref="modal"
      title="Ban Member"
      size="lg"
      no-stacking
    >
      <template #default>
        <NoticeMessage v-if="homefail" variant="danger" class="mb-2">
          TO DO: Get code working to check if this group is user's home group
        </NoticeMessage>
        <NoticeMessage v-if="homeGroup" variant="danger" class="mb-2">
          <p>
            You are banning this member on their home group. This should be an
            absolute last resort - it's basically stopping them using Freegle at
            all.
          </p>
          <p>
            Please don't ban members on their home group because they've joined
            other groups. Let those other groups ban them if they wish.
          </p>
        </NoticeMessage>
        <NoticeMessage v-else variant="info" class="mb-2">
          Please be responsible in how you use this feature - it should be a
          last resort.
        </NoticeMessage>
        <p>
          You must enter a reason for banning a member. This will be flagged to
          any other groups that a member is on.
        </p>
        <b-form-input
          v-model="reason"
          type="text"
          placeholder="Enter a reason"
          class="mt-2 mb-2"
        />
      </template>
      <template #footer>
        <b-button variant="white" @click="hide"> Close </b-button>
        <b-button variant="primary" :disabled="!userid" @click="ban">
          Ban
        </b-button>
      </template>
    </b-modal>
  </div>
</template>
<script>
import Wkt from 'wicket'
import cloneDeep from 'lodash.clonedeep'
import { useUserStore } from '~/stores/user'
import { useModGroupStore } from '@/stores/modgroup'
import { useOurModal } from '~/composables/useOurModal'

export default {
  props: {
    userid: {
      type: Number,
      required: true,
    },
    groupid: {
      type: Number,
      required: true,
    },
  },
  setup() {
    const modGroupStore = useModGroupStore()
    const userStore = useUserStore()
    const { modal, show, hide } = useOurModal()
    return { modGroupStore, userStore, modal, show, hide }
  },
  data: function () {
    return {
      homefail: false,
      homeGroup: false,
      reason: null,
    }
  },
  computed: {
    group() {
      return this.modGroupStore.get(this.groupid)
    },
    user() {
      return this.userStore.byId(this.userid)
    },
  },
  async mounted() {
    // console.log('mounted', cloneDeep(this.group))
    // TODO: Why: await this.modGroupStore.listMT({
    //  grouptype: 'Freegle'
    // })

    const area = this.group.poly || this.group.polyofficial
    if (area) {
      console.log('Area', area)

      try {
        const wkt = new Wkt.Wkt()
        console.log('Area2')
        wkt.read(area)
        console.log('Area3', wkt.type)
        const obj = wkt.toObject()
        console.log('Area4')
        const bounds = obj.getBounds()
        console.log('Bounds', bounds, this.user)

        const lat = this.user.settings?.mylocation?.lat
        const lng = this.user.settings?.mylocation?.lng

        if (
          (lat || lng) &&
          (this.user.memberof.length === 1 || bounds.contains([lat, lng]))
        ) {
          this.homeGroup = true
        }
      } catch (e) {
        this.homefail = true
        console.error(e)
      }
    }
  },
  methods: {
    ban() {
      if (this.reason) {
        this.$emit('confirm', this.reason)
        this.hide()
      }
    },
  },
}
</script>
