<template>
  <b-modal
    ref="modal"
    scrollable
    size="lg"
    hide-header
    body-class="p-0"
    content-class="profile-modal-content"
  >
    <template #default>
      <ProfileInfo :id="id" class="profile-modal-body" />
    </template>
    <template #footer>
      <b-button variant="primary" @click="hide"> Close </b-button>
    </template>
  </b-modal>
</template>

<script setup>
import { useUserStore } from '~/stores/user'
import { useOurModal } from '~/composables/useOurModal'

const ProfileInfo = defineAsyncComponent(() =>
  import('~/components/ProfileInfo')
)

const userStore = useUserStore()

const props = defineProps({
  id: {
    type: Number,
    required: false,
    default: 0,
  },
  closeOnMessage: {
    type: Boolean,
    required: false,
    default: false,
  },
})

const { modal, hide } = useOurModal()

await userStore.fetch(props.id)
</script>

<style scoped lang="scss">
.profile-modal-body {
  min-height: auto;

  :deep(.profile-mobile) {
    min-height: auto;
  }
}
</style>
