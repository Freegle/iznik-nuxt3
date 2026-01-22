<template>
  <div>
    <NoticeMessage v-if="savedComment" variant="danger" class="mb-2">
      <div
        v-for="n in 10"
        :key="'modcomments-' + user.id + '-' + savedComment.id + '-' + n"
      >
        <div class="d-flex">
          <div v-if="n === 1 && savedComment.flag">
            <v-icon
              v-if="savedComment.flag"
              icon="exclamation-triangle"
              class="mr-1"
            />
          </div>
          <read-more
            v-if="savedComment['user' + n]"
            :text="savedComment['user' + n]"
            :max-chars="expandComments ? 1000 : 80"
            class="font-weight-bold nopara"
          />
        </div>
      </div>
      <div class="small">
        <span v-if="savedComment.byuser"
          ><v-icon icon="tag" /> by
          {{ savedComment.byuser.displayname }} -</span
        >
        <span v-if="savedComment.date !== savedComment.reviewed">
          Created
          <span :title="datetimeshort(savedComment.date)">{{
            datetimeshort(savedComment.date)
          }}</span>
          reviewed
          <span :title="datetimeshort(savedComment.reviewed)">{{
            datetimeshort(savedComment.reviewed)
          }}</span>
        </span>
        <span v-else :title="datetimeshort(savedComment.date)">
          {{ timeadapt(savedComment.date) }}
        </span>
        <span v-if="savedComment.groupid"> on {{ groupname }} </span>
        <span
          v-if="
            amAModOn(savedComment.groupid) ||
            supportOrAdmin ||
            savedComment.byuserid === myid
          "
        >
          <b-button variant="link" size="sm" @click="editIt">
            <v-icon icon="pen" /> Edit
          </b-button>
          <b-button variant="link" size="sm" @click="deleteIt">
            <v-icon icon="trash-alt" /> Delete
          </b-button>
        </span>
      </div>
      <ConfirmModal
        v-if="showConfirmDelete"
        ref="confirm"
        @confirm="deleteConfirmed"
        @hidden="showConfirmDelete = false"
      />
      <ModCommentEditModal
        v-if="showCommentEditModal"
        ref="editComment"
        :user="user"
        :comment="comment"
        :groupname="groupname"
        @edited="updateComments"
        @hidden="showCommentEditModal = false"
      />
    </NoticeMessage>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import ReadMore from 'vue-read-more3/src/ReadMoreComponent'
import cloneDeep from 'lodash.clonedeep'
import { setupModMembers } from '~/composables/useModMembers'
import { useGroupStore } from '~/stores/group'
import { useUserStore } from '~/stores/user'
import { useMe } from '~/composables/useMe'
import { useModMe } from '~/composables/useModMe'

const props = defineProps({
  comment: {
    type: Object,
    required: true,
  },
  user: {
    type: Object,
    required: true,
  },
  expandComments: {
    type: Boolean,
    required: false,
    default: false,
  },
})

const emit = defineEmits(['updated', 'editing'])

const groupStore = useGroupStore()
const userStore = useUserStore()
const { bump, context } = setupModMembers()
const { myid, supportOrAdmin, myGroup } = useMe()
const { amAModOn } = useModMe()

const showConfirmDelete = ref(false)
const showCommentEditModal = ref(false)
const savedComment = ref(null)

const group = computed(() => {
  let ret = null

  if (props.comment.groupid) {
    ret = myGroup(props.comment.groupid)

    if (!ret) {
      ret = groupStore.get(props.comment.groupid)
    }
  }

  return ret
})

const groupname = computed(() => {
  return group.value ? group.value.namedisplay : '#' + props.comment.groupid
})

async function updateComments() {
  const userid = props.user.userid ? props.user.userid : props.user.id

  await userStore.fetchMT({
    id: userid,
    emailhistory: true,
  })

  const user = userStore.byId(userid)
  const savedCommentId = savedComment.value.id
  savedComment.value = false
  if (user.comments) {
    savedComment.value = user.comments.find((comm) => {
      return comm.id === savedCommentId
    })
  }
  context.value = null
  bump.value++
  emit('updated')
}

function deleteIt() {
  showConfirmDelete.value = true
}

async function deleteConfirmed() {
  await userStore.deleteComment(props.comment.id)
  updateComments()
}

function editIt() {
  showCommentEditModal.value = true
  emit('editing')
}

onMounted(() => {
  // To stop it updating on screen when editing in a modal.
  savedComment.value = cloneDeep(props.comment)

  if (props.comment.groupid && !group.value) {
    // Need to fetch group
    groupStore.fetch(props.comment.groupid)
  }
})
</script>
