<template>
  <div>
    <NewsUserIntro
      v-if="userid"
      :userid="userid"
      :newsfeed="newsfeed"
      append="introduced themselves"
    />
    <read-more
      v-if="newsfeed.message && emessage"
      :text="emessage"
      :max-chars="1024"
      class="font-weight-bold preline forcebreak nopara"
    />
    <div>
      <b-row v-if="newsfeed.image">
        <b-col>
          <b-img
            thumbnail
            rounded
            lazy
            :src="newsfeed.image.paththumb"
            class="clickme"
            @click="showPhotoModal"
          />
        </b-col>
      </b-row>
    </div>
    <div
      class="mt-2 d-flex flex-wrap justify-content-between align-items-center"
    >
      <NewsLoveComment
        :newsfeed="newsfeed"
        @focus-comment="$emit('focus-comment')"
      />
      <div>
        <b-button variant="primary" size="sm" @click="showModal">
          <v-icon icon="user" /> Introduce yourself to everyone
        </b-button>
        <AboutMeModal v-if="showAboutMe" ref="modal" />
      </div>
    </div>
    <b-modal
      v-if="newsfeed.image"
      ref="photoModal"
      title="ChitChat photo"
      generator-unable-to-provide-required-alt=""
      size="lg"
      no-stacking
      ok-only
    >
      <template #default>
        <b-img fluid rounded center :src="newsfeed.image.path" />
      </template>
    </b-modal>
  </div>
</template>
<script>
import ReadMore from 'vue-read-more3/src/ReadMoreComponent'
import NewsBase from '~/components/NewsBase'
import NewsUserIntro from '~/components/NewsUserIntro'
import NewsLoveComment from '~/components/NewsLoveComment'
const AboutMeModal = () => import('./AboutMeModal')

export default {
  components: {
    AboutMeModal,
    NewsUserIntro,
    NewsLoveComment,
    ReadMore,
  },
  extends: NewsBase,
  data() {
    return {
      showAboutMe: false,
    }
  },
  methods: {
    async showModal() {
      await this.fetchMe(['me'], true)

      this.showAboutMe = true
      this.waitForRef('modal', () => {
        this.$refs.modal.show()
      })
    },
  },
}
</script>
