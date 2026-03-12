<template>
  <span v-if="log && log.msgid">
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
      <ModLogStdMsg :logid="logid" /> <ModLogGroup :logid="logid" :tag="tag" />
    </span>
    <span v-else>
      <v-icon icon="hashtag" class="text-muted" scale="0.75" />{{ log.msgid }}
      (no info available)
    </span>
  </span>
</template>
<script setup>
import { computed } from 'vue'
import { useLogsStore } from '~/stores/logs'

const props = defineProps({
  logid: {
    type: Number,
    required: true,
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

const logsStore = useLogsStore()

const log = computed(() => logsStore.byId(props.logid))

const messagesubject = computed(() => {
  if (log.value?.message) {
    return log.value.message.subject
      ? log.value.message.subject
      : '(Blank subject line)'
  } else {
    return '(Message now deleted)'
  }
})
</script>
