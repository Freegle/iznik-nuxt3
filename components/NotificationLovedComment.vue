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
        <span class="font-weight-bold">{{ fromuser.displayname }}</span>
        loves your comment:
      </div>
      <div v-if="newsfeed.message" class="line-clamp-2 font-weight-bold">
        "{{ newsfeed.message }}"
      </div>
      <abbr class="small text-muted">{{ notificationago }}</abbr>
    </div>
  </div>
</template>
<script>
import { setupNotification } from '../composables/useNotification'
import ProfileImage from '~/components/ProfileImage'

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

  methods: {
    click() {
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
