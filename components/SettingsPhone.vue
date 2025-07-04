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
<script setup>
import { computed, watch, ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import SpinButton from './SpinButton'

const props = defineProps({
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
})

const authStore = useAuthStore()
const me = computed(() => authStore.user)
const spinButton = ref(null)

const notMobile = computed(() => {
  if (!me.value?.phone) {
    return false
  }

  return (
    !(me.value.phone + '').startsWith('+447') &&
    !(me.value.phone + '').startsWith('07')
  )
})

const phone = computed(() => {
  return me.value && me.value.phone ? me.value.phone : null
})

watch(phone, () => {
  if (props.autoSave) {
    savePhone()
  }
})

async function savePhone(callback) {
  if (!notMobile.value) {
    await authStore.saveAndGet({
      phone: me.value.phone,
    })

    if (callback) {
      callback()
    }
  }
}

async function removePhone() {
  setTimeout(() => {
    me.value.phone = null
  }, 1000)

  await authStore.saveAndGet({
    phone: '',
  })
}
</script>
<style scoped lang="scss">
.nobot {
  margin-bottom: 0 !important;
}
</style>
