<template>
  <div class="text-danger small">
    Duplicate of
    <v-icon icon="hashtag" class="text-muted" scale="0.5" /><nuxt-link
      :to="'/messages/approved/' + groupid + '/' + message.id"
    >
      {{ message.id }}
    </nuxt-link>
    -
    <em>{{ message.subject }}</em>
    {{ timeago(message.arrival) }}
    <span v-if="message.outcome">, now {{ message.outcome }}</span
    ><span v-else>, still open</span>
  </div>
</template>
<script>
export default {
  props: {
    message: {
      type: Object,
      required: true,
    },
  },
  computed: {
    groupid() {
      let ret = 0

      if (this.message && this.message.groups && this.message.groups.length) {
        ret = this.message.groups[0].groupid
      }
      return ret
    },
  },
}
</script>
