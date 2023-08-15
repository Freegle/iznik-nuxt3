<template>
  <div>
    <b-modal
      id="supportermodal"
      v-model="showModal"
      scrollable
      title="What are Freegle Supporters?"
    >
      <template #default>
        <p>
          We're free to use, but we're not free to run. To keep running, we need
          volunteer time, and we need charity funds.
        </p>
        <p>
          We know some people can give one and not the other. We want everyone
          to be able to help if they're able.
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
  </div>
</template>
<script>
import { useMiscStore } from '../stores/misc'
import { useAuthStore } from '../stores/auth'
import modal from '@/mixins/modal'
import DonationButton from '~/components/DonationButton'

export default {
  components: { DonationButton },
  mixins: [modal],
  methods: {
    donateTime() {
      // Turn microvolunteering on.
      useMiscStore().set({
        key: 'microvolunteeringinviteaccepted',
        value: Date.now(),
      })

      useAuthStore().saveMicrovolunteering('Basic')
    },
  },
}
</script>
