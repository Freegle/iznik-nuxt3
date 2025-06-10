<template>
  <span>
    <span v-if="message.replycount" class="small text-success mr-1">
      <client-only> <v-icon icon="user" class="d-inline" /> </client-only
      >&nbsp;<span class="d-inline"
        >{{ message.replycount }}&nbsp;freegler<span
          v-if="message.replycount != 1"
          >s</span
        >&nbsp;replied&nbsp;</span
      >
    </span>
    <span v-else class="small text-muted mr-1">
      <client-only> <v-icon icon="user" class="d-inline" /> </client-only
      >&nbsp;No&nbsp;replies&nbsp;yet
    </span>
  </span>
</template>
<script>
export default {
  props: {
    message: {
      type: Object,
      required: true,
    },
  },
}
</script>
