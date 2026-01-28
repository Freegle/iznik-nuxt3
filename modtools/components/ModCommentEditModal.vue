<template>
  <div>
    <b-modal
      :id="'modCommentModal-' + user.id"
      ref="modal"
      size="lg"
      no-stacking
      @hidden="onHide"
    >
      <template #title>
        Edit Note for {{ user.displayname }} <span v-if="groupname">on</span>
        {{ groupname }}
      </template>
      <template #default>
        <p>
          You can add one or more notes about members. They'll appear in a
          coloured box next to the user.
        </p>
        <p>
          These comments can be seen by moderators, and also by members who
          choose to download their data under GDPR. So keep them objective,
          polite and factual, and without identifiable personal information
          please.
        </p>
        <b-form-input
          v-model="editcomment.user1"
          :placeholder="placeholders[1]"
        />
        <b-form-input
          v-model="editcomment.user2"
          :placeholder="placeholders[2]"
        />
        <b-form-input
          v-model="editcomment.user3"
          :placeholder="placeholders[3]"
        />
        <b-form-input
          v-model="editcomment.user4"
          :placeholder="placeholders[4]"
        />
        <b-form-input
          v-model="editcomment.user5"
          :placeholder="placeholders[5]"
        />
        <b-form-input
          v-model="editcomment.user6"
          :placeholder="placeholders[6]"
        />
        <b-form-input
          v-model="editcomment.user7"
          :placeholder="placeholders[7]"
        />
        <b-form-input
          v-model="editcomment.user8"
          :placeholder="placeholders[8]"
        />
        <b-form-input
          v-model="editcomment.user9"
          :placeholder="placeholders[9]"
        />
        <b-form-input
          v-model="editcomment.user10"
          :placeholder="placeholders[10]"
        />
        <b-form-input
          v-model="editcomment.user11"
          :placeholder="placeholders[11]"
        />
        <p class="mt-2">
          You can choose for this note to be be alerted to other groups, which
          will put the member in <em>Member->Review</em>
          if they are an existing member or join a group. Please use this only
          for serious issues.
        </p>
        <OurToggle
          :value="editcomment.flag"
          class="mt-2"
          :height="30"
          :width="250"
          :font-size="14"
          :sync="true"
          :labels="{
            checked: 'Will alert other groups',
            unchecked: 'Will not alert other groups',
          }"
          variant="modgreen"
          @change="toggleFlag"
        />
      </template>
      <template #footer>
        <b-button variant="white" @click="hide"> Close </b-button>
        <b-button variant="primary" @click="save"> Save </b-button>
      </template>
    </b-modal>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { useOurModal } from '~/composables/useOurModal'
import { useUserStore } from '~/stores/user'

const props = defineProps({
  user: {
    type: Object,
    required: true,
  },
  comment: {
    type: Object,
    required: true,
  },
  groupname: {
    type: String,
    required: false,
    default: null,
  },
})

const emit = defineEmits(['hidden', 'edited'])

const userStore = useUserStore()
const { modal, hide } = useOurModal()

const editcomment = ref(false)
const placeholders = [
  null,
  'Add a comment about this member here',
  '...and more information here',
  '...and here',
  '...you get the idea',
]

function onHide() {
  emit('hidden')
}

function toggleFlag() {
  editcomment.value.flag = !editcomment.value.flag
}

async function save() {
  await userStore.saveComment(editcomment.value)
  emit('edited')
  hide()
}

onMounted(() => {
  editcomment.value = props.comment
})
</script>
