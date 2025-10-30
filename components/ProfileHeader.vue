<template>
  <div v-if="user" class="d-flex w-100">
    <ProfileImage
      :image="user.profile.path"
      class="mb-1 mt-1 inline mr-2"
      is-thumbnail
      size="xl"
    />
    <div class="align-top d-flex justify-content-between profile__info w-100">
      <div>
        <h4 class="d-inline-block">
          {{ user.displayname }}
        </h4>
        <div>
          <div class="text-muted">
            <span class="glyphicon glyphicon-heart" /> Freegler since
            {{ dateonly(user.added) }}.
          </div>
          <span v-if="user?.showmod" class="text-muted">
            <v-icon icon="leaf" /> Freegle Volunteer
          </span>
        </div>
      </div>
      <div>
        <div class="text--small text-faded mb-1 text-start text-lg-end mr-2">
          #{{ id }}
        </div>
        <div class="d-flex flex-row flex-lg-column align-items-baseline">
          <b-button
            v-if="closeOnMessage"
            size="sm"
            variant="secondary"
            class="mb-1 order-1 order-lg-0 align-self-lg-center d-inline-block d-sm-none'"
            @click="emit('close')"
          >
            <v-icon icon="comments" />
            Message
          </b-button>
          <ChatButton
            v-else-if="myid && id !== myid"
            :userid="id"
            size="sm"
            title="Message"
            class="mb-1 order-1 order-lg-0 align-self-lg-center"
            variant="secondary"
          />
          <UserRatings
            :id="id"
            size="sm"
            class="pt-1 mr-2 mr-lg-0 d-block"
            :disabled="!myid"
          />
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { computed } from 'vue'
import { useUserStore } from '~/stores/user'
import ProfileImage from '~/components/ProfileImage'
import ChatButton from '~/components/ChatButton'
import UserRatings from '~/components/UserRatings'
import { dateonly } from '~/composables/useTimeFormat'
import { useMe } from '~/composables/useMe'

const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
  closeOnMessage: {
    type: Boolean,
    required: false,
    default: false,
  },
})

const emit = defineEmits(['close'])

const userStore = useUserStore()
// Use myid computed property from useMe composable for consistency
const { myid } = useMe()

const user = computed(() => {
  return props.id ? userStore?.byId(props.id) : null
})
</script>
<style scoped lang="scss">
@import 'bootstrap/scss/_functions';
@import 'bootstrap/scss/_variables';
@import 'bootstrap/scss/mixins/_breakpoints';

.profile__info {
  flex-direction: column;

  @include media-breakpoint-up(lg) {
    flex-direction: row;
  }
}
</style>
