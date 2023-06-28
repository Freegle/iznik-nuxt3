<template>
  <div class="clickme d-flex" @click="click">
    <div class="d-flex flex-column justify-content-around">
      <ProfileImage
        :image="fromuser?.profile?.path"
        class="mr-1 mb-1 ml-1 inline"
        is-thumbnail
        size="lg"
      />
    </div>
    <div class="d-flex flex-column">
      <div>
        <span class="font-weight-bold">{{ fromuser?.displayname }}</span>
        <span v-if="newsfeed?.type == 'Noticeboard'"> loves your poster </span>
        <span v-else> loves your post</span>
      </div>
      <div v-if="noticeboardname" class="font-weight-bold">
        &quot;{{ noticeboardname }}&quot;
      </div>
      <div v-else-if="newsfeed?.message" class="font-weight-bold line-clamp-2">
        "{{ newsfeed.message }}"
      </div>
      <abbr class="small text-muted">{{ notificationago }}</abbr>
    </div>
  </div>
</template>
<script>
import { setupNotification } from '../composables/useNotification'
import ProfileImage from '~/components/ProfileImage'
import { useNewsfeedStore } from '../stores/newsfeed'

export default {
  components: {
    ProfileImage,
  },
  props: {
    id: {
      type: Number,
      required: true,
    },
  },
  async setup(props) {
    return await setupNotification(props.id)
  },
  computed: {
    noticeboardname() {
      if (this.newsfeed?.type === 'Noticeboard') {
        try {
          return JSON.parse(this.newsfeed.message)?.name
        } catch (e) {
          console.log('Invalid', this.newsfeed)
        }
      }

      return null
    },
  },
  methods: {
    click() {
      // Make sure we have the up to date iem in the store fairly soon.
      useNewsfeedStore().fetch(this.newsfeed.id, true)
      this.$router.push('/chitchat/' + this.newsfeed.id)
    },
  },
}
</script>

<style scoped>
.media-object {
  width: 33px;
  height: 28px;
  padding-top: 5px;
}

li > a {
  padding-left: 0px;
}
</style>
