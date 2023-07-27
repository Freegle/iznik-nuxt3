<template>
  <div class="clickme" title="Click to see their profile" @click="showInfo">
    <div class="d-flex clickme">
      <ProfileImage
        :image="newsfeed?.profile?.path"
        class="ml-1 mb-1 inline"
        is-thumbnail
        :is-moderator="Boolean(newsfeed.showmod)"
        size="lg"
      />
      <div class="media-body ml-2">
        <span class="text-success font-weight-bold">
          {{ newsfeed.displayname }}
        </span>
        {{ append }}
        <span v-if="appendBold"> "{{ appendBold }}" </span>
        <br />
        <span class="text-muted small pl-0">
          {{ timeago(newsfeed?.added) }}
        </span>
        <NewsUserInfo :id="newsfeed.id" />
      </div>
    </div>
    <div v-if="mod && newsfeed?.type === 'AboutMe'" class="text-muted small">
      (Note to mods: Members are encouraged to introduce themselves, and then
      their introductions appear automatically on here, and also show to other
      freeglers in chats.)
    </div>
    <ProfileModal v-if="infoclick" :id="userid" ref="profilemodal" />
  </div>
</template>
<script>
// Use import rather than async otherwise we have trouble with refs.
import ProfileModal from '~/components/ProfileModal'
import NewsUserInfo from '~/components/NewsUserInfo'
import ProfileImage from '~/components/ProfileImage'

export default {
  components: {
    NewsUserInfo,
    ProfileModal,
    ProfileImage,
  },
  props: {
    userid: {
      type: Number,
      required: true,
    },
    newsfeed: {
      type: Object,
      required: true,
    },
    append: {
      type: String,
      required: false,
      default: '',
    },
    appendBold: {
      type: String,
      required: false,
      default: '',
    },
  },
  data() {
    return {
      infoclick: false,
    }
  },
  methods: {
    async showInfo() {
      // We use v-if so that the profile modal is not inserted into the DOM until we have clicked, which saves the
      // fetch of the user info.
      this.infoclick = true
      const m = await this.waitForRef('profilemodal')
      m.show()
    },
  },
}
</script>
