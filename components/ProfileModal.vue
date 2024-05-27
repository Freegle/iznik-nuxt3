<template>
  <b-modal
    ref="modal"
    scrollable
    size="lg"
    title-class="w-100"
    header-class="p-0"
    hide-header-close
  >
    <template #title>
      <div class="w-100 coverphoto">
        <ProfileHeader
          :id="id"
          class="flex-grow-1 px-3 py-2"
          :close-on-message="props.closeOnMessage"
          @close="hide"
        />
      </div>
    </template>
    <template #default>
      <ProfileInfo :id="id" :header="false" />
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
const ProfileHeader = defineAsyncComponent(() =>
  import('~/components/ProfileHeader')
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
.coverphoto {
  min-height: 100px !important;
  width: 100% !important;
  background-image: url('/wallpaper.png');
}
</style>
