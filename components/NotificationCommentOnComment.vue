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
        commented:
      </div>
      <div v-if="newsfeed?.message" class="line-clamp-2 font-weight-bold">
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
    // Make sure we have the up to date iem in the store fairly soon.
    useNewsfeedStore().fetch(this.newsfeed.id, true)
    return await setupNotification(props.id)
  },
}
</script>
