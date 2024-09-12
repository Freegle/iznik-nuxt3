<template>
  <div>
    <b-card no-body>
      <b-card-header>
        <div class="d-flex justify-content-between flex-wrap w-100">
          <span v-if="story.user">
            <ProfileImage :image="story.user.profile.turl" class="mr-1 ml-1 mb-1 mt-1 inline" is-thumbnail size="sm" />
            <strong>{{ story.user.email }}</strong>
            <span class="small">
              <v-icon icon="hashtag" scale="0.75" class="text-muted" />{{ story.user.id }}
            </span>
          </span>
          <span>
            member of <strong>{{ story.groupname }}</strong>, posted {{ timeago(story.date) }}
          </span>
          <span>
            <v-icon icon="hashtag" scale="0.75" class="text-muted" />{{ story.id }}
          </span>
        </div>
      </b-card-header>
      <b-card-body>
        <!-- eslint-disable-next-line -->
        <h3>{{ story.headline }}</h3>
        <div class="d-flex font-weight-bold">
          {{ story.story }}
          <b-img v-if="story.photo" thumbnail :src="story.photo.paththumb" />
        </div>
        <NoticeMessage v-if="!story.public" variant="info" class="mt-1">
          They've said this story isn't public, so this is just for you to read and then click Hide. You might also like to thank them via Chat.
        </NoticeMessage>
      </b-card-body>
      <b-card-footer>
        <div class="d-flex flex-wrap justify-content-start">
          <b-button variant="warning" class="mr-2 mb-1" @click="dontUseForPublicity">
            <v-icon icon="times" /> Hide
          </b-button>
          <div v-if="story.public">
            <b-button v-if="newsletter" variant="primary" class="mr-2 mb-1" @click="useForNewsletter">
              <v-icon icon="check" /> Good for newsletter
            </b-button>
            <b-button v-else variant="primary" class="mr-2 mb-1" @click="useForPublicity">
              <v-icon icon="check" /> Good for publicity
            </b-button>
          </div>
          <ChatButton v-if="story.user" :userid="story.user.id" :groupid="story.groupid" title="Chat" variant="white" class="mr-2 mb-1" />
        </div>
      </b-card-footer>
    </b-card>
  </div>
</template>
<script>

export default {
  props: {
    story: {
      type: Object,
      required: true
    },
    newsletter: {
      type: Boolean,
      required: false,
      default: false
    }
  },
  computed: {
    groupname() {
      let ret = null
      const group = this.$store.getters['group/get'](this.story.groupid)

      if (group) {
        ret = group.namedisplay
      }

      return ret
    }
  },
  methods: {
    async useForNewsletter() {
      /* TODO await this.$store.dispatch('stories/useForNewsletter', {
        id: this.story.id
      })*/
    },
    async useForPublicity() {
      /* TODO await this.$store.dispatch('stories/useForPublicity', {
        id: this.story.id
      })*/
    },
    async dontUseForPublicity() {
      /* TODO await this.$store.dispatch('stories/dontUseForPublicity', {
        id: this.story.id
      })*/
    }
  }
}
</script>
