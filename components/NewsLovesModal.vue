<template>
  <b-modal
    :id="'newsLovesModal-' + id"
    ref="modal"
    scrollable
    :title="title"
    no-stacking
  >
    <div v-if="newsfeed" class="p-0">
      <NewsLovesUserInfo
        v-for="love in newsfeed.lovelist"
        :id="love.userid"
        :key="'love-' + love.userid"
        class="mt-2"
      />
    </div>
    <template #footer>
      <b-button variant="white" @click="hide"> Close </b-button>
    </template>
  </b-modal>
</template>

<script>
import { useNewsfeedStore } from '../stores/newsfeed'
import { useUserStore } from '../stores/user'
import NewsLovesUserInfo from './NewsLovesUserInfo'
import { useOurModal } from '~/composables/useOurModal'

export default {
  components: {
    NewsLovesUserInfo,
  },
  props: {
    id: {
      type: Number,
      required: true,
    },
  },
  async setup(props) {
    const newsfeedStore = useNewsfeedStore()
    const userStore = useUserStore()

    const { modal, hide } = useOurModal()

    await newsfeedStore.fetch(props.id, true, true)

    return {
      newsfeedStore,
      userStore,
      modal,
      hide,
    }
  },
  computed: {
    newsfeed() {
      return this.newsfeedStore?.byId(this.id)
    },
    title() {
      let ret = null

      if (this.newsfeed) {
        ret =
          this.newsfeed.loves +
          ' freegler' +
          (this.newsfeed.loves !== 1 ? 's' : '') +
          ' love' +
          (this.newsfeed.loves === 1 ? 's' : '') +
          ' this'
      }

      return ret
    },
  },
  methods: {
    goToProfile(id) {
      this.$nextTick(() => {
        this.$router.push('/profile/' + id)
      })
    },
  },
}
</script>
