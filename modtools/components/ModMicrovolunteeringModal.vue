<template>
  <div>
    <client-only>
      <b-modal ref="modal" id="aboutmemodal" :title="'Microvolunteering for ' + user.displayname" size="xl">
        <template #default>
          <div v-for="item in itemIds" :key="'item-' + item" class="p-0 mt-2">
            <ModMicrovolunteering :id="item" />
          </div>
        </template>
        <template #footer>
          <b-button variant="white" @click="hide">
            Cancel
          </b-button>
        </template>
      </b-modal>
    </client-only>
  </div>
</template>
<script>
import { useModal } from '~/composables/useModal'

export default {
  setup() {
    const { modal, hide } = useModal()
    return { modal, hide }
  },
  props: {
    user: {
      type: Object,
      required: true
    },
    itemIds: {
      type: Array,
      required: true
    }
  },
  methods: {
    show() {
      this.modal.show()
    }
  }
}
</script>
