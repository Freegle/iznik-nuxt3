<template>
  <div class="settings-section">
    <div class="section-header">
      <v-icon icon="address-book" class="section-icon" />
      <h2>Address Book</h2>
      <span class="private-badge"><v-icon icon="lock" /> Private</span>
    </div>

    <div class="section-content">
      <p class="description">
        Save your address to quickly send it to other freeglers.
      </p>
      <b-button variant="secondary" size="sm" @click="addressBook">
        Open Address Book
      </b-button>
    </div>
  </div>
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

<style scoped lang="scss">
@import 'assets/css/_color-vars.scss';

.settings-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 1rem;
  overflow: hidden;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);

  h2 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: $color-green-background;
    flex: 1;
  }

  .section-icon {
    color: $color-green-background;
  }
}

.private-badge {
  font-size: 0.75rem;
  color: $color-gray--dark;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.section-content {
  padding: 1rem 1.25rem;
}

.description {
  color: $color-gray--dark;
  font-size: 0.9rem;
  margin-bottom: 0.75rem;
}
</style>
