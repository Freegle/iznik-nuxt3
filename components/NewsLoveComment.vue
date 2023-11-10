<template>
  <div v-if="newsfeed" class="d-flex align-items-center mt-1">
    <SpinButton
      v-if="!newsfeed.loved"
      variant="link"
      size="sm"
      :show-spinner="loving"
      name="heart"
      done-icon="heart"
      icon-class=""
      label=""
      @handle="love"
    >
      <span class="d-none d-sm-inline">Love this</span>
    </SpinButton>
    <SpinButton
      v-if="newsfeed.loved"
      variant="link"
      size="sm"
      :show-spinner="loving"
      name="heart"
      done-icon="heart"
      icon-class="text-danger"
      label=""
      @handle="unlove"
    >
      <span class="d-none d-sm-inline">Unlove this</span>
    </SpinButton>
    <b-button
      v-if="!newsfeed.closed"
      variant="link"
      size="sm"
      @click="focusComment"
    >
      <v-icon icon="comment" /><span class="d-none d-sm-inline"
        >&nbsp;Reply</span
      >
    </b-button>
    <b-button
      v-if="newsfeed.loves"
      variant="link"
      class="showlove"
      :aria-label="getShowLovesLabel"
      @click="showLove"
    >
      <v-icon icon="heart" class="text-danger" />&nbsp;{{ newsfeed.loves }}
    </b-button>
    <NewsLovesModal
      v-if="showLoveModal"
      :id="newsfeed.id"
      @hidden="showLoveModal = false"
    />
  </div>
</template>
<script>
import pluralize from 'pluralize'
import { defineAsyncComponent } from 'vue'
import { useNewsfeedStore } from '../stores/newsfeed'
import SpinButton from './SpinButton'
const NewsLovesModal = defineAsyncComponent(() => import('./NewsLovesModal'))

export default {
  components: {
    SpinButton,
    NewsLovesModal,
  },
  props: {
    newsfeed: {
      type: Object,
      required: true,
    },
  },
  setup() {
    const newsfeedStore = useNewsfeedStore()

    return {
      newsfeedStore,
    }
  },
  data() {
    return {
      loving: false,
      showLoveModal: false,
    }
  },
  computed: {
    getShowLovesLabel() {
      return (
        'This comment has ' +
        pluralize('love', this.newsfeed?.loves, true) +
        '. Who loves this?'
      )
    },
  },
  methods: {
    async love() {
      this.loving = true

      await this.newsfeedStore.love(this.newsfeed.id, this.newsfeed.threadhead)

      this.loving = false
    },
    async unlove() {
      this.loving = true

      await this.newsfeedStore.unlove(
        this.newsfeed.id,
        this.newsfeed.threadhead
      )

      this.loving = false
    },
    focusComment() {
      this.$emit('focus-comment')
    },
    showLove() {
      this.showLoveModal = true
    },
  },
}
</script>
<style scoped lang="scss">
.showlove {
  border: none;
  padding: 3px;
}
</style>
