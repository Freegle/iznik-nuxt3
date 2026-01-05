<template>
  <div class="text-danger small">
    Duplicate of
    <v-icon icon="hashtag" class="text-muted" scale="0.5" /><nuxt-link
      :to="duplicateLink"
    >
      {{ message.id }}
    </nuxt-link>
    -
    <em>{{ message.subject }}</em>
    {{ timeago(message.arrival) }}
    <span v-if="message.outcome">, now {{ message.outcome }}</span
    ><span v-else>, still open</span>
    <span v-if="isPending" class="text-muted"> (pending)</span>
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
    isPending() {
      return (
        this.message.collection === 'Pending' ||
        this.message.collection === 'PendingOther'
      )
    },
    duplicateLink() {
      if (this.isPending) {
        // Link to pending messages page for pending duplicates.
        return '/messages/pending'
      }
      // Link to approved messages with search term for approved duplicates.
      return '/messages/approved/' + this.groupid + '/' + this.message.id
    },
  },
}
</script>
