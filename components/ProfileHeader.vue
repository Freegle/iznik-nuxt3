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
          <ChatButton
            v-if="myid && id !== myid"
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
<script>
import { useUserStore } from '../stores/user'
import ProfileImage from '~/components/ProfileImage'
import ChatButton from '~/components/ChatButton'
import UserRatings from '~/components/UserRatings'

export default {
  components: {
    ProfileImage,
    ChatButton,
    UserRatings,
  },
  props: {
    id: {
      type: Number,
      required: true,
    },
  },
  setup(props) {
    const userStore = useUserStore()

    return {
      userStore,
    }
  },
  computed: {
    email() {
      let ret = null

      if (this.user) {
        this.user.emails.forEach((e) => {
          if (!e.ourdomain && (!ret || e.preferred)) {
            ret = e.email
          }
        })
      }

      return ret
    },
    user() {
      return this.id ? this.userStore?.byId(this.id) : null
    },
  },
}
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
