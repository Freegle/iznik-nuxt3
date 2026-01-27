<template>
  <b-card v-if="DiscourseTopics" no-body>
    <b-card-body>
      <b-card-title> Latest Discourse Topics </b-card-title>
      <p>
        Discourse is where we can chat to each other and ask questions. Join in!
      </p>
      <ModDashboardDiscourseTopic
        v-for="topic in top5"
        :key="topic.id"
        :topic="topic"
      />
      <NoticeMessage variant="info">
        We also have a couple of groups on WhatsApp for
        <!-- eslint-disable-next-line -->
        <ExternalLink href="https://chat.whatsapp.com/DLS6UdRxXxr5slNN48SOwK">chat</ExternalLink>
        and
        <!-- eslint-disable-next-line -->
        <ExternalLink href="https://chat.whatsapp.com/EFdLHJ8IqSOIcUDlLlWxpy">announcements</ExternalLink>.
      </NoticeMessage>
    </b-card-body>
  </b-card>
</template>
<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useModDashboard } from '~/modtools/composables/useModDashboard'

const props = defineProps({
  groupid: {
    type: Number,
    required: false,
    default: null,
  },
  groupName: {
    type: String,
    required: true,
  },
  start: {
    type: Date,
    required: true,
  },
  end: {
    type: Date,
    required: true,
  },
})

const { DiscourseTopics, maybeFetch } = useModDashboard(props, [
  'DiscourseTopics',
])

const refreshTimer = ref(null)

const top5 = computed(() => {
  let ret = []

  if (DiscourseTopics.value) {
    const topics = JSON.parse(DiscourseTopics.value)
    if (topics && topics.latest_posts) {
      ret = topics.latest_posts.slice(0, 5)
    }
  }

  return ret
})

function doRefresh() {
  maybeFetch()
  refreshTimer.value = setTimeout(doRefresh, 10 * 60 * 1000)
}

onMounted(() => {
  refreshTimer.value = setTimeout(doRefresh, 10 * 60 * 1000)
})

onBeforeUnmount(() => {
  if (refreshTimer.value) {
    clearTimeout(refreshTimer.value)
    refreshTimer.value = null
  }
})
</script>
