<template>
  <NoticeMessage>
    <p>
      You are logged in with
      <!-- eslint-disable-next-line -->
      <strong v-if="ours">{{ ours }}</strong><strong v-else>as <v-icon icon="hashtag" class="text-muted fa-0-8x" />{{ myid }}</strong>, but <strong>{{ theirs }}</strong> belongs to another account.
    </p>
    <p>
      If they are both yours, you can ask the volunteers to merge your accounts
      from <em>Help</em>.
    </p>
  </NoticeMessage>
</template>
<script>
import NoticeMessage from './NoticeMessage'
export default {
  components: { NoticeMessage },
  props: {
    ours: {
      type: String,
      required: true,
    },
    theirs: {
      type: String,
      required: true,
    },
  },
}
</script>
