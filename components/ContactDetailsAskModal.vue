<template>
  <b-modal
    id="contact-details-ask-modal"
    v-model="showModal"
    scrollable
    size="lg"
    no-stacking
    no-fade
  >
    <div class="d-flex justify-content-between flex-wrap">
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
    <p class="text-muted">
      <b-button
        v-if="!showWhyAsk"
        size="sm"
        variant="link"
        @click="showWhyAsk = true"
      >
        Why do we ask for this?
      </b-button>
      <span v-if="showWhyAsk">
        We ask for your postcode so that we know how far away you are - the
        closer the better. Your mobile is optional - we can notify you by text
        (SMS) so you don't miss replies. We won't show either of these to the
        other freegler, but we will show an approximate distance.
      </span>
    </p>
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

const emit = defineEmits(['hide'])

const { showModal, show } = useModal(emit)

async function savePostcode(pc) {
  const settings = me.value.settings

  if (!settings?.mylocation || settings?.mylocation.id !== pc.id) {
    settings.mylocation = pc
    await authStore.saveAndGet({
      settings,
    })
  }
}

const showWhyAsk = ref(false)

defineExpose({ show })
</script>
