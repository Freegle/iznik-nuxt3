<template>
  <b-modal
    id="message-reply-ask-tel-modal"
    v-model="showModal"
    scrollable
    title="Phone"
    size="lg"
    no-stacking
    no-fade
    ok-only
  >
    <template #default>
      <SettingsPhone
        v-if="me"
        label="Your mobile:"
        size="lg"
        hide-remove
        auto-save
        input-class="phone"
      />
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
          Your mobile is optional - we can notify you by text (SMS) so you don't
          miss replies. We won't show this to the other freegler.
        </span>
      </p>
    </template>
  </b-modal>
</template>

<script setup>
import { useModal } from '~/composables/useModal'
import SettingsPhone from '~/components/SettingsPhone.vue'

const emit = defineEmits(['hide'])

const { showModal, show, hide } = useModal(emit)

const showWhyAsk = ref(false)

defineExpose({ show, hide })
</script>
