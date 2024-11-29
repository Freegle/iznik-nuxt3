<template>
  <client-only>
    <div class="example">
      <div class="d-flex justify-content-around">
        <div class="d-flex flex-column">
          <p>This is a test page for Stripe Donate.</p>
          <b-button variant="primary" @click="openModal"
            >Open donation modal</b-button
          >
          <DonationAskModal
            v-if="showDonationAskModal"
            variant="stripe"
            @hidden="showDonationAskModal = false"
          />
        </div>
      </div>
    </div>
  </client-only>
</template>
<script setup>
import { useDonationAskModal } from '~/composables/useDonationAskModal'

const showDonationAskModal = ref(false)

onMounted(async () => {
  await useDonationAskModal()
})

function openModal() {
  showDonationAskModal.value = true
}
</script>
