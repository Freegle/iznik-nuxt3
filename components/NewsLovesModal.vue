<template>
  <span>
    <b-modal
      :id="'newsLovesModal-' + id"
      v-model="showModal"
      :title="title"
      no-stacking
    >
      <template #default>
        <ul v-if="newsfeed" class="p-0">
          <li
            v-for="(love, index) in newsfeed.lovelist"
            :key="'love-' + love.id"
            class="p-0 pt-1 list-unstyled"
          >
            <div class="media clickme" @click="goToProfile(love.id)">
              <div class="media-left">
                <div class="media-object">
                  <ProfileImage
                    v-if="love.profile.turl"
                    :image="love.profile.turl"
                    class="ml-1 mb-1 inline"
                    is-thumbnail
                    size="lg"
                  />
                </div>
              </div>
              <div class="media-body ml-2">
                <span class="text-success font-weight-bold">
                  {{ love.displayname }}
                </span>
                <br />
                <!--                TODO-->
                <NewsUserInfo :user="love" :index="index" />
              </div>
            </div>
          </li>
        </ul>
      </template>
      <template #footer>
        <b-button variant="white" @click="hide"> Close </b-button>
      </template>
    </b-modal>
  </span>
</template>
<script>
import { useNewsfeedStore } from '../stores/newsfeed'
import modal from '@/mixins/modal'
import NewsUserInfo from '~/components/NewsUserInfo'
import ProfileImage from '~/components/ProfileImage'

export default {
  components: {
    NewsUserInfo,
    ProfileImage,
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

    return {
      newsfeedStore,
    }
  },
  data() {
    return {
      newsfeed: null,
    }
  },
  computed: {
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
    loveusers() {
      const ret = {}

      if (this.newsfeed) {
        this.newsfeed.lovelist.forEach((user) => {
          ret[user.id] = user
        })
      }

      return ret
    },
  },
  methods: {
    async show() {
      await this.newsStore.fetch(this.id, true, true)

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
