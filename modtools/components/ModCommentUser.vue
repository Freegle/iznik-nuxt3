<template>
  <b-card bg-variant="white" no-body>
    <b-card-header class="d-flex justify-content-between flex-wrap">
      <div>
        <!-- eslint-disable-next-line -->
        <v-icon icon="envelope" /> <ExternalLink :href="'mailto:' + email">{{ email }}</ExternalLink>
      </div>
      <div>
        <ProfileImage
          :image="comment.user.profile.turl"
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
<script>
export default {
  props: {
    comment: {
      type: Object,
      required: true,
    },
  },
  computed: {
    email() {
      let ret = null

      if (!this.comment.user.email && this.comment.user.emails) {
        this.comment.user.emails.forEach((e) => {
          if (!e.ourdomain && (!ret || e.preferred)) {
            ret = e.email
          }
        })
      }

      return ret
    },
  },
}
</script>
