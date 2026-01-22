<template>
  <div>
    <client-only>
      <b-modal
        id="aboutmemodal"
        ref="modal"
        :title="'Microvolunteering for ' + user.displayname"
        size="xl"
      >
        <template #default>
          <div v-for="item in itemIds" :key="'item-' + item" class="p-0 mt-2">
            <ModMicrovolunteering :id="item" />
          </div>
        </template>
        <template #footer>
          <b-button variant="white" @click="hide"> Cancel </b-button>
        </template>
      </b-modal>
    </client-only>
  </div>
</template>
<script setup>
import { useOurModal } from '~/composables/useOurModal'

defineProps({
  user: {
    type: Object,
    required: true,
  },
  itemIds: {
    type: Array,
    required: true,
  },
})

const { modal, hide, show } = useOurModal()

defineExpose({ show, hide })
</script>
