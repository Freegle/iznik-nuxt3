<template>
  <b-card v-if="comment.user" bg-variant="white" no-body>
    <b-card-header class="d-flex justify-content-between flex-wrap">
      <div>
        <!-- eslint-disable-next-line -->
        <v-icon icon="envelope" /> <ExternalLink :href="'mailto:' + email">{{ email }}</ExternalLink>
      </div>
      <div>
        <ProfileImage
          :image="comment.user.profile?.turl || comment.user.profile?.paththumb"
          :name="comment.user.displayname"
          class="ms-1 mb-1 inline"
          is-thumbnail
          size="sm"
        />
        {{ comment.user.displayname }}
      </div>
      <div v-if="comment.user.lastaccess">
        <v-icon icon="calendar-alt" /> Active
        {{ datetimeshort(comment.user.lastaccess) }}
      </div>
      <div><v-icon icon="hashtag" />{{ comment.user.id }}</div>
    </b-card-header>
    <b-card-body>
      <ModComment
        :key="'comment-' + comment.id"
        :commentid="comment.id"
        :userid="comment.userid"
      />
    </b-card-body>
  </b-card>
</template>
<script setup>
import { computed } from 'vue'
import { useCommentStore } from '~/modtools/stores/comment'
import { getPreferredEmail } from '~/modtools/composables/usePreferredEmail'

const props = defineProps({
  commentid: {
    type: Number,
    required: true,
  },
})

const commentStore = useCommentStore()
const comment = computed(() => commentStore.byId(props.commentid))

const email = computed(() => getPreferredEmail(comment.value.user))
</script>
