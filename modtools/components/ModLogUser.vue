<template>
  <span v-if="user">
    <v-icon
      v-if="user.systemrole !== 'User'"
      icon="crown"
      class="text-warning"
      title="Mod"
    />
    <v-icon v-else icon="user" class="text-dark text-faded" title="User" />
    {{ user.displayname }}
    <span v-if="user.email" class="small">
      &lt;<ExternalLink :href="'mailto:' + user.email">{{
        user.email
      }}</ExternalLink
      >&gt;
    </span>
    <span class="text-muted small">
      <v-icon icon="hashtag" class="text-muted" scale="0.6" />{{ user.id }}
    </span>
  </span>
</template>

<script>
export default {
  props: {
    user: {
      type: Object,
      required: false,
      default: null,
    },
  },
}
</script>
