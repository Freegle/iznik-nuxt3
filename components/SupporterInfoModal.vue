<template>
  <b-modal ref="modal" scrollable title="What are Freegle Supporters?">
    <template #default>
      <p>
        We're free to use, but we're not free to run. To keep running, we need
        volunteer time, and we need charity funds.
      </p>
      <p>
        We know some people can give one and not the other. We want everyone to
        be able to help if they can.
      </p>
      <p>
        If you've donated either recently, then we'll thank you with the
        Supporter badge. People will see you're a committed freegler.
      </p>
      <div class="d-flex justify-content-between flex-wrap">
        <DonationButton class="mt-2" />
        <div class="align-self-center">
          <b-button
            variant="secondary"
            size="lg"
            :disabled="amMicroVolunteering"
            @click="donateTime"
          >
            <span v-if="amMicroVolunteering" class="text-wrap">
              Donating time. Thanks!
            </span>
            <span v-else> Donate time </span>
          </b-button>
        </div>
      </div>
    </template>
    <template #footer>
      <b-button variant="white" @click="hide"> Close </b-button>
    </template>
  </b-modal>
</template>
<script setup>
import { useMiscStore } from '~/stores/misc'
import { useAuthStore } from '~/stores/auth'
import { computed } from '#imports'
import { useOurModal } from '~/composables/useOurModal'
import DonationButton from '~/components/DonationButton'

const { modal, hide } = useOurModal()
const miscStore = useMiscStore()
const authStore = useAuthStore()

const amMicroVolunteering = computed(() => {
  return !!miscStore.get('microvolunteeringinviteaccepted')
})

function donateTime() {
  // Turn microvolunteering on.
  miscStore.set({
    key: 'microvolunteeringinviteaccepted',
    value: Date.now(),
  })

  authStore.saveMicrovolunteering('Basic')
}
</script>
