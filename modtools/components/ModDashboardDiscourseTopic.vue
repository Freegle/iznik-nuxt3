<template>
  <div>
    <div class="d-flex">
      <ProfileImage
        :image="avatar"
        class="ml-1 mb-1 inline"
        is-thumbnail
        size="lg"
      />
      <div>
        <div class="d-flex">
          <strong>{{ topic.name }}</strong
          >&nbsp;
          <div
            class="text-muted small d-flex flex-column justify-content-center"
          >
            &nbsp;posted
            {{ timeago(topic.updated_at) }}
            on&nbsp;
          </div>
          <ExternalLink :href="link">
            {{ topic.topic_title }}
          </ExternalLink>
        </div>
        <!-- eslint-disable-next-line -->
        <div v-html="snippet" class="forcebreak" />
      </div>
    </div>
  </div>
</template>
<script setup>
import { computed } from 'vue'

const props = defineProps({
  topic: {
    type: Object,
    required: true,
  },
})

const avatar = computed(() => {
  return (
    'https://discourse.ilovefreegle.org/' +
    props.topic.avatar_template.replace('{size}', '45')
  )
})

const snippet = computed(() => {
  let ret = props.topic.raw
    .replace('\n', ' ')
    .replace(/!\[image.*?\]/g, '')
    .replace(/\[quote.*?\]/g, '"')
    .replace(/\[\/quote\]/g, '"')
  const p = ret.indexOf('>')

  if (p !== -1) {
    ret = ret.substring(0, p)
  }

  return ret.substring(0, 120) + '...'
})

const link = computed(() => {
  return (
    'https://discourse.ilovefreegle.org/t/' +
    props.topic.topic_slug +
    '/' +
    props.topic.topic_id +
    '/' +
    props.topic.post_number
  )
})
</script>
