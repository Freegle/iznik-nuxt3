<template>
  <div>
    <div class="d-flex flex-wrap align-content-center">
      <b-form-group
        class="nobot mr-2"
        :label="label"
        :description="description"
      >
        <b-input-group>
          <b-form-input
            v-if="me"
            v-model="me.phone"
            placeholder="Your mobile"
            :size="size"
            lazy
            :class="inputClass"
          />
          <slot name="append">
            <SpinButton
              v-if="!autoSave"
              ref="spinButton"
              :disabled="notMobile"
              variant="white"
              size="md"
              icon-name="save"
              label="Save"
              @handle="savePhone"
            />
          </slot>
        </b-input-group>
        <div class="text-muted mt-1 mb-1 text--small">
          <v-icon icon="lock" /> Other freeglers won't see this.
        </div>
      </b-form-group>
      <b-button
        v-if="!hideRemove && me?.phone"
        variant="link"
        class="align-self-start"
        size="sm"
        @click="removePhone"
      >
        Remove
      </b-button>
    </div>
    <p v-if="notMobile" class="text-danger">Please enter a mobile number.</p>
  </div>
</template>
<script>
import { useAuthStore } from '../stores/auth'
import SpinButton from './SpinButton'

export default {
  components: { SpinButton },
  props: {
    size: {
      type: String,
      required: false,
      default: 'md',
    },
    label: {
      type: String,
      required: false,
      default: null,
    },
    description: {
      type: String,
      required: false,
      default: null,
    },
    hideRemove: {
      type: Boolean,
      required: false,
      default: false,
    },
    autoSave: {
      type: Boolean,
      required: false,
      default: false,
    },
    inputClass: {
      type: String,
      required: false,
      default: null,
    },
  },
  setup() {
    const authStore = useAuthStore()

    return {
      authStore,
    }
  },
  computed: {
    notMobile() {
      if (!this.me?.phone) {
        return false
      }

      return (
        !(this.me.phone + '').startsWith('+447') &&
        !(this.me.phone + '').startsWith('07')
      )
    },
    phone() {
      return this.me && this.me.phone ? this.me.phone : null
    },
  },
  watch: {
    phone() {
      if (this.autoSave) {
        this.savePhone()
      }
    },
  },
  methods: {
    async savePhone(callback) {
      if (!this.notMobile) {
        await this.authStore.saveAndGet({
          phone: this.me.phone,
        })
        callback()
      }
    },
    async removePhone() {
      setTimeout(() => {
        this.me.phone = null
      }, 1000)

      await this.authStore.saveAndGet({
        phone: '',
      })
    },
  },
}
</script>
<style scoped lang="scss">
.nobot {
  margin-bottom: 0 !important;
}
</style>
