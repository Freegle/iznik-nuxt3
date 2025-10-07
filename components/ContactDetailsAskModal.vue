<template>
  <b-modal ref="modal" scrollable title="Contact details" size="lg" no-stacking>
    <div class="d-flex justify-content-between flex-wrap">
      <p class="text-muted">
        We ask for your postcode so that we know how far away you are - the
        closer the better.
      </p>
      <p class="text-muted">
        <strong>We won't show this</strong> to the other freegler,
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
    </div>
  </b-modal>
</template>
<script setup>
import { useAuthStore } from '~/stores/auth'
import { useOurModal } from '~/composables/useOurModal'
import PostCode from '~/components/PostCode.vue'
import { useMe } from '~/composables/useMe'

const authStore = useAuthStore()
const { me } = useMe()

const { modal } = useOurModal()

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
