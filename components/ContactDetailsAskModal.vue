<template>
  <b-modal
    id="contact-details-ask-modal"
    v-model="show"
    scrollable
    size="lg"
    no-stacking
  >
    <div class="d-flex justify-content-between flex-wrap">
      <p class="text-muted">
        We ask for your postcode so that we know how far away you are - the
        closer the better. Your mobile is optional - we can notify you by text
        (SMS) so you don't miss replies.
      </p>
      <p class="text-muted">
        <strong>We won't show either of these</strong> to the other freegler,
        but we will show an approximate distance.
      </p>

      <b-form-group
        class="flex-grow-1 nobot"
        label="Your postcode:"
        :label-for="'replytomessage-' + 'message.id'"
        description=""
      >
        <PostCode @selected="savePostcode" />
        <div class="text-muted text--small mt-1">
          <v-icon icon="lock" /> Other freeglers won't see this.
        </div>
      </b-form-group>
      <SettingsPhone
        v-if="me"
        label="Your mobile:"
        size="lg"
        hide-remove
        auto-save
        input-class="phone"
      />
    </div>
  </b-modal>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { useAuthStore } from '~/stores/auth'
import { useModal } from '~/composables/useModal'
import PostCode from '~/components/PostCode.vue'
import SettingsPhone from '~/components/SettingsPhone.vue'

const authStore = useAuthStore()
const me = storeToRefs(authStore).user

const props = defineProps({
  modelValue: { type: Boolean, required: true },
})

const emit = defineEmits(['update:modelValue'])

const { show } = useModal(props, emit)

async function savePostcode(pc) {
  const settings = me.value.settings

  if (!settings?.mylocation || settings?.mylocation.id !== pc.id) {
    settings.mylocation = pc
    await authStore.saveAndGet({
      settings,
    })
  }
}
</script>
