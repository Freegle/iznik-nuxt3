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
<script setup>
import { computed } from 'vue'
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

const noticeboardname = computed(() => {
  if (newsfeed.value?.type === 'Noticeboard') {
    try {
      return JSON.parse(newsfeed.value.message)?.name
    } catch (e) {
      console.log('Invalid', newsfeed.value)
    }
  }

  return null
})

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
