<template>
  <b-card
    border-variant="info"
    header-bg-variant="info"
    header-text-variant="white"
    class="mt-2"
  >
    <template #header>
      <h2 class="bg-info header--size5 mb-0">
        <v-icon icon="address-book" />
        Your Address Book
      </h2>
    </template>
    <b-card-body class="p-0 pt-1">
      <p>
        You can save your address and directions, and send them to other
        freeglers, so you don't have to type it each time.
      </p>
      <b-button variant="secondary" @click="addressBook">
        Open Address Book
      </b-button>
      <p class="text-muted mt-2">
        <v-icon icon="lock" />
        This is private. Other freeglers can't see this unless you send it to
        them.
      </p>
    </b-card-body>
  </b-card>
</template>

<script setup>
import { defineEmits } from 'vue'
import { useAddressStore } from '~/stores/address'

const emit = defineEmits(['show-address-modal'])

const addressStore = useAddressStore()

const addressBook = async () => {
  await addressStore.fetch()
  emit('show-address-modal')
}
</script>
