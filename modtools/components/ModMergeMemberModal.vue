<template>
  <div>
    <b-modal
      id="addMemberModal"
      ref="modal"
      title="Merge Member"
      size="lg"
      no-stacking
      @shown="onShow"
      @hidden="onHide"
    >
      <template #default>
        <div v-if="merged">We've merged them.</div>
        <div v-else>
          <NoticeMessage variant="danger">
            Please be careful! You can't undo this without geek help (and even
            then it is imperfect). So please be completely sure that these are
            the same users.
          </NoticeMessage>
          <div v-if="supportOrAdmin" class="d-flex justify-content-around">
            <OurToggle
              v-model="byemail"
              class="mt-4"
              :height="30"
              :width="150"
              :font-size="14"
              :sync="true"
              :labels="{
                checked: 'Merge by email',
                unchecked: 'Merge by user id',
              }"
              variant="modgreen"
            />
          </div>
          <div v-if="byemail">
            <p class="mt-2">
              This will merge from the first user into the second user. The
              second user's preferred email will be the preferred email of the
              merged user, so make sure you get this the right way round.
            </p>
            <div class="d-flex justify-content-between flex-wrap">
              <b-form-input
                v-model="email1"
                type="email"
                placeholder="First email"
                class="mt-2 mb-2"
              />
              <b-form-input
                v-model="email2"
                type="email"
                placeholder="Second email (and email of merged user)"
                class="mt-2 mb-2"
              />
            </div>
          </div>
          <div v-else>
            <p class="mt-2">
              This will merge from the first user into the second user. The
              second user's preferred email, if any, will be the preferred email
              of the merged user, so make sure you get this the right way round.
              This is Support-only, as there's more scope for messing up if you
              get the ids wrong - so do be very careful.
            </p>
            <div class="d-flex justify-content-between flex-wrap">
              <b-form-input
                v-model="id1"
                type="number"
                placeholder="First user id"
                class="mt-2 mb-2"
              />
              <b-form-input
                v-model="id2"
                type="number"
                placeholder="Second user id"
                class="mt-2 mb-2"
              />
            </div>
          </div>
          <b-form-input
            v-model="reason"
            placeholder="Enter a reason for the logs"
            class="mt-2 mb-2"
          />
          <NoticeMessage v-if="tn" variant="danger">
            You can't merge TrashNothing members. Please either remove the least
            active of them, or add Notes to each one to say that they're the
            same real person.
          </NoticeMessage>
          <NoticeMessage v-if="error" variant="danger">
            {{ error }}
          </NoticeMessage>
        </div>
      </template>
      <template #footer>
        <b-button variant="white" @click="hide"> Close </b-button>
        <b-button
          v-if="!merged"
          variant="primary"
          :disabled="cantMerge"
          @click="merge"
        >
          Merge
        </b-button>
      </template>
    </b-modal>
  </div>
</template>
<script>
import { useAuthStore } from '~/stores/auth'
import { useOurModal } from '~/composables/useOurModal'
import { useMe } from '~/composables/useMe'

export default {
  setup() {
    const { modal, hide } = useOurModal()
    const { supportOrAdmin } = useMe()
    return { modal, hide, supportOrAdmin }
  },
  data: function () {
    return {
      email1: null,
      email2: null,
      id1: null,
      id2: null,
      reason: null,
      merged: false,
      byemail: true,
      error: null,
    }
  },
  computed: {
    tn() {
      return (
        (this.email1 && this.email1.includes('trashnothing')) ||
        (this.email2 && this.email2.includes('trashnothing'))
      )
    },
    cantMerge() {
      if (!this.reason || this.tn) {
        return true
      }

      if (this.email1 && this.email2) {
        return false
      }

      if (this.id1 && this.id2) {
        return false
      }

      return true
    },
  },
  methods: {
    onShow() {},
    onHide() {
      this.$emit('hidden')
    },
    async merge() {
      this.error = false
      const authStore = useAuthStore()
      try {
        if (this.byemail) {
          await authStore.merge({
            email1: this.email1,
            email2: this.email2,
            reason: this.reason,
          })
        } else {
          await authStore.merge({
            id1: this.id1,
            id2: this.id2,
            reason: this.reason,
          })
        }

        this.merged = true
      } catch (e) {
        this.error = e.message
        const statuspos = e.message.indexOf('status:')
        if (statuspos !== -1) {
          this.error = e.message.substring(statuspos)
        }
      }
    },
  },
}
</script>
