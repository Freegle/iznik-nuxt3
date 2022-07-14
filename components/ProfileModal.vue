<template>
  <b-modal id="profilemodal" v-model="showModal" size="lg">
    <template #header>
      <div class="w-100 coverphoto">
        <ProfileHeader :id="id" class="flex-grow-1 px-3 py-2" />
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
<script>
import modal from '@/mixins/modal'
import ProfileInfo from '~/components/ProfileInfo'
import ProfileHeader from '~/components/ProfileHeader'

export default {
  components: {
    ProfileInfo,
    ProfileHeader,
  },
  mixins: [modal],
  props: {
    id: {
      type: Number,
      required: false,
      default: 0,
    },
  },
}
</script>
<style scoped lang="scss">
:deep(.media .align-self-start) {
  margin-right: 0.25rem !important;
}

:deep(.modal-header) {
  padding: 0px;
}

.coverphoto {
  min-height: 100px !important;
  width: 100% !important;
  background-image: url('/wallpaper.png');
}
</style>
