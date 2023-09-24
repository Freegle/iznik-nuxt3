<template>
  <span>
    <b-modal
      :id="'newsLovesModal-' + id"
      v-model="showModal"
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
          @goto="goToProfile(love.userid)"
        />
      </div>
      <template #footer>
        <b-button variant="white" @click="hide"> Close </b-button>
      </template>
    </b-modal>
  </span>
</template>
<script>
import { useNewsfeedStore } from '../stores/newsfeed'
import { useUserStore } from '../stores/user'
import NewsLovesUserInfo from './NewsLovesUserInfo'
import modal from '@/mixins/modal'

export default {
  components: {
    NewsLovesUserInfo,
  },
  mixins: [modal],
  props: {
    id: {
      type: Number,
      required: true,
    },
  },
  setup() {
    const newsfeedStore = useNewsfeedStore()
    const userStore = useUserStore()

    return {
      newsfeedStore,
      userStore,
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
    async show() {
      await this.newsfeedStore.fetch(this.id, true, true)
      this.showModal = true
    },
    goToProfile(id) {
      this.showModal = false
      this.$nextTick(() => {
        this.$router.push('/profile/' + id)
      })
    },
  },
}
</script>
