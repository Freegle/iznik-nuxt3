<template>
  <div class="d-flex">
    <b-badge
      v-if="replyuser"
      class="flex-shrink-1 d-flex clickme align-items-center text-start border border-primary-subtle"
      variant="white"
      pill
      @click="showProfileModal"
    >
      <ProfileImage
        :image="replyuser.profile.paththumb"
        class="d-none d-md-block"
        is-thumbnail
        size="sm"
      />
      <ProfileImage
        :image="replyuser.profile.paththumb"
        class="d-block d-md-none"
        is-thumbnail
        size="lg"
      />
      <div class="text-black font-weight-bold truncatename">
        &nbsp;<span v-if="unseen > 0" class="text-danger">{{
          replyuser.displayname
        }}</span>
        <span v-else class="truncatename">{{ replyuser.displayname }}</span>
      </div>
      <b-badge v-if="unseen" variant="danger" class="ml-1">
        {{ unseen }}
      </b-badge>
    </b-badge>
    <ProfileModal
      v-if="profileModal && showProfile && replyuser"
      :id="replyuser.id"
      @hidden="showProfile = false"
    />
  </div>
</template>
<script setup>
import { useUserStore } from '~/stores/user'

const userStore = useUserStore()

const props = defineProps({
  id: { type: Number, required: true },
  profileModal: { type: Boolean, required: false, default: true },
  unseen: { type: Number, required: false, default: 0 },
})

const showProfile = ref(false)

function showProfileModal() {
  showProfile.value = true
}

try {
  await userStore.fetch(props.id)
} catch (e) {
  console.log('Ignore reply for user', props.id)
}

const replyuser = computed(() => {
  return userStore.byId(props.id)
})
</script>
<style scoped lang="scss">
@import 'assets/css/_color-vars.scss';
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins/_breakpoints';

.theborder {
  border: 1px solid $colour-info-fg;
  border-radius: 1rem;
}

.truncatename {
  white-space: nowrap;
  max-width: 11rem;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: normal;
}
</style>
