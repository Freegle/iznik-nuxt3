<template>
  <span class="d-inline user-ratings">
    <span v-if="user?.info?.ratings">
      <span v-if="showName">
        {{ user.displayname }}
      </span>
      <b-button
        v-b-tooltip.bottom="uptitle"
        :size="size"
        :variant="user.info.ratings.Up > 0 ? 'primary' : 'white'"
        :disabled="disabled || user.id === myid"
        :class="{
          mine: user.info.ratings.Mine === 'Up',
          'mr-1': true,
        }"
        @click="up"
      >
        <v-icon icon="thumbs-up" />&nbsp;{{ user.info.ratings.Up }}
      </b-button>
      <b-button
        v-b-tooltip.bottom="downtitle"
        :size="size"
        :variant="user.info.ratings.Down > 0 ? 'warning' : 'white'"
        :disabled="disabled || user.id === myid"
        :class="{
          mine: user.info.ratings.Mine === 'Down',
          'ml-1': true,
        }"
        @click="down"
      >
        <v-icon icon="thumbs-down" />&nbsp;{{ user.info.ratings.Down }}
      </b-button>
    </span>
    <UserRatingsDownModal v-if="showDown" :id="id" />
    <UserRatingsRemoveModal v-if="showRemove" :id="id" />
  </span>
</template>
<script>
import { useUserStore } from '../stores/user'

const UserRatingsDownModal = defineAsyncComponent(() =>
  import('~/components/UserRatingsDownModal')
)

const UserRatingsRemoveModal = defineAsyncComponent(() =>
  import('~/components/UserRatingsRemoveModal')
)

export default {
  components: { UserRatingsDownModal, UserRatingsRemoveModal },
  props: {
    id: {
      type: Number,
      required: false,
      default: null,
    },
    size: {
      type: String,
      required: false,
      default: 'md',
    },
    disabled: {
      type: Boolean,
      required: false,
      default: false,
    },
    showName: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  setup(props) {
    const userStore = useUserStore()

    userStore.fetch(props.id)

    return { userStore }
  },
  data() {
    return {
      showDown: false,
      showRemove: false,
    }
  },
  computed: {
    user() {
      let ret = null

      if (this.id) {
        const user = this.userStore?.byId(this.id)

        if (user && user.info) {
          ret = user
        }
      }

      return ret
    },
    uptitle() {
      if (this.user.info.ratings.Mine === 'Up') {
        return 'You gave them a thumbs up.  Click to undo.'
      } else {
        return (
          this.user.info.ratings.Up +
          ' freegler' +
          (this.user.info.ratings.Up !== 1 ? 's' : '') +
          '  gave them a thumbs up.  Click to rate, click again to undo.'
        )
      }
    },
    downtitle() {
      if (this.user.info.ratings.Mine === 'Down') {
        return 'You gave them a thumbs down.  Click to undo.'
      } else {
        return (
          this.user.info.ratings.Down +
          ' freegler' +
          (this.user.info.ratings.Down !== 1 ? 's' : '') +
          '  gave them a thumbs down.  Click to rate, click again to undo.'
        )
      }
    },
  },
  methods: {
    async rate(rating, reason, text) {
      await this.userStore.rate(this.id, rating, reason, text)
    },
    async up() {
      this.showDown = false
      if (this.user.info.ratings.Mine === 'Up') {
        this.showRemove = true
      } else {
        await this.rate('Up')
      }
    },
    down() {
      this.showDown = false

      if (this.user.info.ratings.Mine === 'Down') {
        this.showRemove = true
      } else {
        this.showDown = true
      }
    },
  },
}
</script>
<style scoped lang="scss">
.btn {
  margin: 1px;

  &.mine,
  &:hover {
    margin: 0px;
    border: 2px solid $color-black;
    box-shadow: 0px 0px 4px 1px $color-gray--dark;
  }
}

.btn-white:hover {
  background-color: white;
  color: black;
}

.user-ratings {
  z-index: 1049;
}
</style>
