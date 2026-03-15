<template>
  <div v-if="user" class="bg-white rounded border border-info p-2">
    <div>
      {{ tag }}<strong>{{ user ? user.displayname : '#' + userid }}</strong>
      <span class="small">
        <v-icon icon="hashtag" class="text-muted" scale="0.75" />{{ userid }}
      </span>
      <div v-if="user && user.tnuserid" class="text-muted small">
        TN user id <v-icon icon="hashtag" scale="0.6" />{{ user.tnuserid }}
      </div>
      <div v-if="user && user.ljuserid" class="text-muted small">
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
    <div v-if="user && user.comments" class="mt-1">
      <ModComment
        v-for="comment in user.comments"
        :key="'comment-' + comment.id"
        :commentid="comment.id"
        :userid="userid"
        @updated="updateComments"
      />
    </div>
    <ModCommentAddModal
      v-if="showAddCommentModal && groupid"
      :userid="userid"
      :groupid="groupid"
      @added="updateComments"
      @hidden="showAddCommentModal = false"
    />
  </div>
</template>
<script setup>
import { ref, computed, watch } from 'vue'
import { useUserStore } from '~/stores/user'

const props = defineProps({
  userid: {
    type: Number,
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

const userStore = useUserStore()

const user = computed(() => userStore.byId(props.userid))

watch(
  () => props.userid,
  (uid) => {
    if (uid && !userStore.byId(uid))
      userStore.fetchMT({ id: uid, modtools: true })
  },
  { immediate: true }
)

const showAddCommentModal = ref(false)

const email = computed(() => {
  let ret = null

  if (user.value && user.value.emails) {
    user.value.emails.forEach((e) => {
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
