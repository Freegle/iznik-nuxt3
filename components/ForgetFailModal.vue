<template>
  <b-modal ref="modal" scrollable title="Sorry, that didn't work" no-stacking>
    <template #default>
      <b-row>
        <b-col>
          <p>Please contact <SupportLink /> if you need further help.</p>
        </b-col>
      </b-row>
    </template>
    <template #footer>
      <b-button variant="white" @click="hide"> Close </b-button>
    </template>
  </b-modal>
</template>

<script setup>
import { useModal } from '~/composables/useModal'
import SupportLink from '~/components/SupportLink'

defineEmits(['confirm'])

const { modal, hide } = useModal()
</script>
