<template>
  <b-modal
    id="nudgewarningmodal"
    ref="modal"
    scrollable
    title="Nudging"
    no-stacking
  >
    <template #default>
      <div class="nudge-content">
        <div class="nudge-icon-wrapper">
          <v-icon icon="bell" class="nudge-icon" />
        </div>
        <div class="nudge-text">
          <p class="nudge-intro">
            Nudging is a gentle way to let the other person know that you're
            waiting for a reply.
          </p>
          <p class="nudge-reminder">
            Before you use it, please remember that not everyone is online all
            the time. Some people are only able to check their messages every
            day or two.
          </p>
        </div>
      </div>
    </template>
    <template #footer>
      <div class="modal-actions">
        <b-button variant="link" class="cancel-btn" @click="hide">
          Cancel
        </b-button>
        <b-button variant="primary" size="sm" @click="confirm">
          <v-icon icon="bell" /> Nudge them
        </b-button>
      </div>
    </template>
  </b-modal>
</template>

<script setup>
import { useOurModal } from '~/composables/useOurModal'

const emit = defineEmits(['confirm'])

const { modal, hide } = useOurModal()

function confirm() {
  emit('confirm')
  hide()
}
</script>
<style scoped lang="scss">
@import 'assets/css/_color-vars.scss';

.nudge-content {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.nudge-icon-wrapper {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  background: rgba($colour-secondary, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.nudge-icon {
  font-size: 1.5rem;
  color: $colour-secondary;
}

.nudge-text {
  flex: 1;
}

.nudge-intro {
  font-size: 0.95rem;
  color: $color-gray--darker;
  margin-bottom: 0.75rem;
}

.nudge-reminder {
  font-size: 0.85rem;
  color: $color-gray--dark;
  margin: 0;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
}

.cancel-btn {
  color: $color-gray--dark;
}
</style>
