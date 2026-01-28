<template>
  <span v-if="log.msgid">
    <span v-if="log.message">
      <a
        :href="'https://www.ilovefreegle.org/message/' + log.msgid"
        target="_blank"
      >
        <v-icon icon="hashtag" class="text-muted" scale="0.75" />{{ log.msgid }}
        <span v-if="log.message"
          ><em>{{ messagesubject }}</em></span
        >
      </a>
      <span v-if="!notext && log.text && log.text.length > 0">
        with <em>{{ log.text }} </em></span
      >
      <ModLogStdMsg :log="log" /> <ModLogGroup :log="log" :tag="tag" />
    </span>
    <span v-else>
      <v-icon icon="hashtag" class="text-muted" scale="0.75" />{{ log.msgid }}
      (no info available)
    </span>
  </span>
</template>
<script setup>
import { computed } from 'vue'

const props = defineProps({
  log: {
    type: Object,
    required: false,
    default: null,
  },
  notext: {
    type: Boolean,
    required: false,
    default: false,
  },
  tag: {
    type: String,
    required: false,
    default: 'on',
  },
})

const messagesubject = computed(() => {
  if (props.log.message) {
    return props.log.message.subject
      ? props.log.message.subject
      : '(Blank subject line)'
  } else {
    return '(Message now deleted)'
  }
})
</script>
