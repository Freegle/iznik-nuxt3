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
        Add Note for {{ user.displayname }} <span v-if="groupname">on</span>
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
        <p>
          <!-- eslint-disable-next-line -->
          Read more <ExternalLink href="https://wiki.ilovefreegle.org/Member_Notes">on the wiki</ExternalLink>.
        </p>
        <b-form-input v-model="user1" :placeholder="placeholders[1]" />
        <b-form-input v-model="user2" :placeholder="placeholders[2]" />
        <b-form-input v-model="user3" :placeholder="placeholders[3]" />
        <b-form-input v-model="user4" :placeholder="placeholders[4]" />
        <b-form-input v-model="user5" :placeholder="placeholders[5]" />
        <b-form-input v-model="user6" :placeholder="placeholders[6]" />
        <b-form-input v-model="user7" :placeholder="placeholders[7]" />
        <b-form-input v-model="user8" :placeholder="placeholders[8]" />
        <b-form-input v-model="user9" :placeholder="placeholders[9]" />
        <b-form-input v-model="user10" :placeholder="placeholders[10]" />
        <b-form-input v-model="user11" :placeholder="placeholders[11]" />
        <p class="mt-2">
          You can choose for this note to be be alerted to other groups, which
          will put the member in <em>Member->Review</em>
          if they are an existing member or join a group. Please use this only
          for serious issues.
        </p>
        <OurToggle
          :value="flag"
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
        <b-button variant="primary" @click="save"> Add </b-button>
      </template>
    </b-modal>
  </div>
</template>
<script setup>
import { ref } from 'vue'
import { useNuxtApp } from '#app'
import { setupModMembers } from '~/composables/useModMembers'
import { useUserStore } from '~/stores/user'
import { useOurModal } from '~/composables/useOurModal'

const props = defineProps({
  user: {
    type: Object,
    required: true,
  },
  groupid: {
    type: Number,
    required: false,
    default: null,
  },
  groupname: {
    type: String,
    required: false,
    default: null,
  },
})

const emit = defineEmits(['hidden', 'added'])

const { $api } = useNuxtApp()
const userStore = useUserStore()
const { bump, context } = setupModMembers()
const { modal, hide } = useOurModal()

const user1 = ref(null)
const user2 = ref(null)
const user3 = ref(null)
const user4 = ref(null)
const user5 = ref(null)
const user6 = ref(null)
const user7 = ref(null)
const user8 = ref(null)
const user9 = ref(null)
const user10 = ref(null)
const user11 = ref(null)
const placeholders = [
  null,
  'Add a comment about this member here',
  '...and more information here',
  '...and here',
  '...you get the idea',
]
const flag = ref(false)

function onHide() {
  emit('hidden')
}

function toggleFlag() {
  flag.value = !flag.value
}

async function save() {
  // Go direct to API because comments aren't in the Store separately.
  await $api.comment.add({
    userid: props.user.id,
    groupid: props.groupid,
    user1: user1.value,
    user2: user2.value,
    user3: user3.value,
    user4: user4.value,
    user5: user5.value,
    user6: user6.value,
    user7: user7.value,
    user8: user8.value,
    user9: user9.value,
    user10: user10.value,
    user11: user11.value,
    flag: flag.value,
  })

  await userStore.fetchMT({
    id: props.user.id,
    emailhistory: true,
  })
  context.value = null
  bump.value++

  emit('added')
  hide()
}
</script>
