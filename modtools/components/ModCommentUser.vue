<template>
  <b-card v-if="comment.user" bg-variant="white" no-body>
    <b-card-header class="d-flex justify-content-between flex-wrap">
      <div>
        <!-- eslint-disable-next-line -->
        <v-icon icon="envelope" /> <ExternalLink :href="'mailto:' + email">{{ email }}</ExternalLink>
      </div>
      <div>
        <ProfileImage
          :image="comment.user.profile?.paththumb"
          :name="comment.user.displayname"
          class="ml-1 mb-1 inline"
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
        :comment="comment"
        :user="comment.user"
      />
    </b-card-body>
  </b-card>
</template>
<script setup>
import { computed } from 'vue'

const props = defineProps({
  comment: {
    type: Object,
    required: true,
  },
})

const email = computed(() => {
  let ret = null

  if (!props.comment.user?.email && props.comment.user?.emails) {
    props.comment.user.emails.forEach((e) => {
      if (!e.ourdomain && (!ret || e.preferred)) {
        ret = e.email
      }
    })
  }

  return ret
})
</script>
