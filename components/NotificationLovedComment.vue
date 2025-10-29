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
        loves your comment:
      </div>
      <div v-if="newsfeed?.message" class="line-clamp-2 font-weight-bold">
        "{{ newsfeed.message }}"
      </div>
      <abbr class="small text-muted">{{ notificationago }}</abbr>
    </div>
  </div>
</template>
<script setup>
import { useRouter } from 'vue-router'
import { setupNotification } from '~/composables/useNotification'
import { useNewsfeedStore } from '~/stores/newsfeed'
import ProfileImage from '~/components/ProfileImage'

const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
})

const router = useRouter()

// Setup notification
const { fromuser, newsfeed, notificationago } = await setupNotification(
  props.id
)

function click() {
  // Make sure we have the up-to-date item in the store
  if (newsfeed?.value?.id) {
    useNewsfeedStore().fetch(newsfeed.value.id, true)
    router.push('/chitchat/' + newsfeed.value.id)
  }
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
