<template>
  <div class="bg-white rounded border border-info p-2">
    <div>
      {{ tag }}<strong>{{ user.displayname }}</strong>
      <span class="small">
        <v-icon icon="hashtag" class="text-muted" scale="0.75" />{{ user.id }}
      </span>
      <div v-if="user.tnuserid" class="text-muted small">
        TN user id <v-icon icon="hashtag" scale="0.6" />{{ user.tnuserid }}
      </div>
      <div v-if="user.ljuserid" class="text-muted small">
        LoveJunk user id <v-icon icon="hashtag" scale="0.6" />{{
          user.ljuserid
        }}
      </div>
      <span v-if="email">
        (<ExternalLink :href="'mailto:' + email">{{ email }}</ExternalLink>
        <ModClipboard :value="email" />)
      </span>
    </div>
    <b-button variant="white" size="xs" class="mt-1" @click="addAComment">
      <v-icon icon="tag" /> Add note
    </b-button>
    <div v-if="user.comments" class="mt-1">
      <ModComment
        v-for="comment in user.comments"
        :key="'comment-' + comment.id"
        :comment="comment"
        :user="user"
        @updated="updateComments"
      />
    </div>
    <ModCommentAddModal
      v-if="showAddCommentModal && groupid"
      :user="user"
      :groupid="groupid"
      @added="updateComments"
      @hidden="showAddCommentModal = false"
    />
  </div>
</template>
<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  user: {
    type: Object,
    required: true,
  },
  tag: {
    type: String,
    required: false,
    default: null,
  },
  groupid: {
    type: Number,
    required: true,
  },
})

const emit = defineEmits(['reload'])

const showAddCommentModal = ref(false)

const email = computed(() => {
  let ret = null

  if (props.user && props.user.emails) {
    props.user.emails.forEach((e) => {
      if (!e.ourdomain && (!ret || e.preferred)) {
        ret = e.email
      }
    })
  }

  return ret
})

function addAComment() {
  showAddCommentModal.value = true
}

function updateComments() {
  emit('reload')
}
</script>
