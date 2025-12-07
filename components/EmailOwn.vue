<template>
  <div class="email-item">
    <span class="email-address">{{ email.email }}</span>
    <button v-if="me?.email" class="action-btn primary" @click="makePrimary">
      Make primary
    </button>
    <button v-if="me?.email" class="action-btn delete" @click="deleteIt">
      <v-icon icon="times" />
    </button>
  </div>
</template>
<script setup>
import { useAuthStore } from '~/stores/auth'
import { useMe } from '~/composables/useMe'

const { me } = useMe()

const props = defineProps({
  email: {
    type: Object,
    required: true,
  },
})

const authStore = useAuthStore()

async function deleteIt() {
  await authStore.removeEmail(props.email.email)
}

async function makePrimary() {
  await authStore.makeEmailPrimary(props.email.email)
}
</script>
<style scoped lang="scss">
@import 'assets/css/_color-vars.scss';

.email-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.4rem 0;

  &:first-child {
    padding-top: 0;
  }
}

.email-address {
  flex: 1;
  font-size: 0.9rem;
  color: $color-gray--darker;
}

.action-btn {
  background: none;
  border: none;
  font-size: 0.8rem;
  cursor: pointer;
  padding: 0;

  &.primary {
    color: $color-blue--bright;

    &:hover {
      text-decoration: underline;
    }
  }

  &.delete {
    color: $color-gray--dark;
    font-size: 0.9rem;
    margin-top: 2px;

    &:hover {
      color: $color-red;
    }
  }
}
</style>
