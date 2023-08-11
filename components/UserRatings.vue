<template>
  <span class="d-inline user-ratings">
    <span v-if="user?.info?.ratings">
      <span v-if="showName">
        {{ user.displayname }}
      </span>
      <b-button
        v-b-tooltip="uptitle"
        :size="size"
        :variant="user.info.ratings.Up > 0 ? 'primary' : 'white'"
        :disabled="disabled || user.id === myid ? 'true' : undefined"
        :class="{
          mine: user.info.ratings.Mine === 'Up',
          'mr-1': true,
        }"
        @click="up"
      >
        <v-icon icon="thumbs-up" />&nbsp;{{ user.info.ratings.Up }}
      </b-button>
      <b-button
        v-b-tooltip="downtitle"
        :size="size"
        :variant="user.info.ratings.Down > 0 ? 'warning' : 'white'"
        :disabled="disabled || user.id === myid ? 'true' : undefined"
        :class="{
          mine: user.info.ratings.Mine === 'Down',
          'ml-1': true,
        }"
        @click="down"
      >
        <v-icon icon="thumbs-down" />&nbsp;{{ user.info.ratings.Down }}
      </b-button>
    </span>
    <b-modal
      v-model="showRemove"
      scrollable
      title="Removing a rating"
      ok-title="Remove rating"
      @ok="removeRating"
    >
      <p>
        You've already given this freegler a
        <span v-if="user?.info?.ratings?.Mine === 'Up'"> thumbs up </span>
        <span v-if="user?.info?.ratings?.Mine === 'Down'"> thumbs down </span>
        rating. You can only rate each freegler once.
      </p>
      <p>You can remove your rating if you wish, or cancel.</p>
    </b-modal>
    <b-modal
      v-model="showDown"
      scrollable
      title="Giving a Thumbs Down..."
      ok-title="Submit"
      @ok="doSomeoneDown"
    >
      <p>
        Please tell us why you're doing this. Your local volunteers may see what
        you put, but the other freegler won't.
      </p>
      <div class="mt=2">
        <b-form-group v-slot="{ ariaDescribedby }" label="What went wrong?">
          <b-form-radio
            v-model="reason"
            :aria-describedby="ariaDescribedby"
            name="reason"
            value="NoShow"
            >No Show</b-form-radio
          >
          <b-form-radio
            v-model="reason"
            :aria-describedby="ariaDescribedby"
            name="reason"
            value="Punctuality"
            >Was late or early</b-form-radio
          >
          <b-form-radio
            v-model="reason"
            :aria-describedby="ariaDescribedby"
            name="reason"
            value="Ghosted"
            >Stopped replying</b-form-radio
          >
          <b-form-radio
            v-model="reason"
            :aria-describedby="ariaDescribedby"
            name="reason"
            value="Rude"
            >Unpleasant behaviour</b-form-radio
          >
          <b-form-radio
            v-model="reason"
            :aria-describedby="ariaDescribedby"
            name="reason"
            value="Other"
            >Something else</b-form-radio
          >
        </b-form-group>
      </div>
      <div class="mt-2">
        <label class="font-weight-bold" for="text">
          Please give a bit of detail.
        </label>
        <b-form-textarea
          id="text"
          v-model="text"
          rows="3"
          placeholder="Explain what happened here..."
        />
      </div>
      <b-alert v-model="showError" variant="danger" class="mt-2">
        Please select a reason and add some detail. Thanks.
      </b-alert>
    </b-modal>
  </span>
</template>
<script>
import { useUserStore } from '../stores/user'

export default {
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
      reason: null,
      text: null,
      showError: false,
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
    async removeRating() {
      this.showRemove = false
      await this.rate(null)
    },
    down() {
      this.showDown = false

      if (this.user.info.ratings.Mine === 'Down') {
        this.showRemove = true
      } else {
        this.showDown = true
      }
    },
    async doSomeoneDown(e) {
      this.showError = false

      if (!this.reason || !this.text) {
        this.showError = true
      } else {
        await this.rate('Down', this.reason, this.text)
      }

      e.preventDefault()
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
</style>
