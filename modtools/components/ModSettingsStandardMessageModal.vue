<template>
  <div>
    <b-modal id="stdmsgmodal" ref="modal" :title="title" size="lg" no-stacking>
      <template #default>
        <label>Title</label>
        <b-form-input v-model="stdmsg.title" />
        <label>Action</label>
        <b-form-select v-model="stdmsg.action" :options="options" />
        <label>Edit Text</label>
        <b-form-select
          v-if="stdmsg.action === 'Edit'"
          v-model="stdmsg.edittext"
        >
          <option value="Unchanged">Unchanged</option>
          <option value="Correct Case">Correct Case</option>
        </b-form-select>
        <label>Autosend?</label>
        <b-form-select v-model="stdmsg.autosend">
          <option :value="0">Edit before send</option>
          <option :value="1">Send Immediately</option>
        </b-form-select>
        <label>How often do you use this?</label>
        <b-form-select v-model="stdmsg.rarelyused">
          <option :value="0">Frequently</option>
          <option :value="1">Rarely</option>
        </b-form-select>
        <label>Change Moderation Status *</label>
        <b-form-select v-model="stdmsg.newmodstatus">
          <option value="UNCHANGED">Unchanged</option>
          <option value="MODERATED">Moderated</option>
          <option value="DEFAULT">Group Settings</option>
          <option value="PROHIBITED">Can't Post</option>
          <option value="UNMODERATED">Unmoderated</option>
        </b-form-select>
        <label>Change Delivery Settings *</label>
        <b-form-select v-model="stdmsg.newdelstatus">
          <option value="UNCHANGED">Unchanged</option>
          <option value="DIGEST">Daily Digest</option>
          <option value="NONE">Web Only</option>
          <option value="SINGLE">Individual Emails</option>
          <option value="ANNOUNCEMENT">Special Notices</option>
        </b-form-select>
        <label>Subject Prefix</label>
        <b-form-input v-model="stdmsg.subjpref" />
        <label>Subject Suffix</label>
        <b-form-input v-model="stdmsg.subjsuff" />
        <label>Insert Text</label>
        <b-form-select v-model="stdmsg.insert">
          <option value="Top">Top</option>
          <option value="Bottom">Bottom</option>
        </b-form-select>
        <label>Message Body</label>
        <b-form-textarea v-model="stdmsg.body" rows="10" />
      </template>
      <template #footer>
        <div class="d-flex justify-content-between flex-wrap w-100">
          <div>
            <b-button v-if="id && !locked" variant="danger" @click="deleteIt">
              Delete
            </b-button>
          </div>
          <div>
            <b-button variant="white" class="mr-2" @click="hide">
              Cancel
            </b-button>
            <b-button
              v-if="!locked"
              variant="primary"
              :disabled="!stdmsg.title"
              @click="save"
            >
              <span v-if="id">Save</span>
              <span v-else>Add</span>
            </b-button>
          </div>
        </div>
      </template>
    </b-modal>
  </div>
</template>
<script setup>
import { reactive, computed } from 'vue'
import { useModConfigStore } from '~/stores/modconfig'
import { useStdmsgStore } from '~/stores/stdmsg'
import { useOurModal } from '~/composables/useOurModal'
import { useMe } from '~/composables/useMe'

const props = defineProps({
  id: {
    type: Number,
    required: false,
    default: null,
  },
  types: {
    type: Array,
    required: false,
    default: null,
  },
})

defineEmits(['hide'])

const modConfigStore = useModConfigStore()
const stdmsgStore = useStdmsgStore()
const { modal, hide } = useOurModal()
const { myid } = useMe()

const newmsg = reactive([])

const allOptions = [
  { value: null, text: '-- Pending Messages -- ' },
  { value: 'Approve', text: 'Approve' },
  { value: 'Reject', text: 'Reject' },
  { value: 'Leave', text: 'Reply' },
  { value: 'Edit', text: 'Edit' },
  { value: 'Hold Message', text: 'Reply and Hold' },
  { value: null, text: '-- Approved Messages -- ' },
  { value: 'Delete Approved Message', text: 'Delete' },
  { value: 'Leave Approved Message', text: 'Reply' },
  { value: null, text: '-- Approved Members --' },
  { value: 'Delete Approved Member', text: 'Remove' },
  { value: 'Leave Approved Member', text: 'Reply' },
]

const options = computed(() => {
  if (props.types) {
    return allOptions.filter((o) => props.types.includes(o.value))
  }
  return allOptions
})

const config = computed(() => {
  return modConfigStore.current
})

const locked = computed(() => {
  return (
    config.value &&
    config.value.protected &&
    parseInt(config.value.createdby) !== myid.value
  )
})

const stdmsg = computed(() => {
  if (!props.id) {
    // Creating.
    return newmsg
  } else {
    // Existing - find it in the config.
    return config.value
      ? config.value.stdmsgs.find((s) => {
          return s.id === props.id
        })
      : null
  }
})

const title = computed(() => {
  if (!props.id) {
    return 'Create a standard message'
  } else if (locked.value) {
    return 'View ' + stdmsg.value.title
  } else {
    return 'Edit ' + stdmsg.value.title
  }
})

async function show() {
  // Fetch the current value, if any, before opening the modal.
  if (props.id) {
    await stdmsgStore.fetch(props.id)
  }
  modal.value.show()
}

async function save() {
  if (!props.id) {
    await stdmsgStore.add({
      ...stdmsg.value,
      configid: config.value.id,
    })
  } else {
    await stdmsgStore.update({
      ...stdmsg.value,
    })
  }

  hide()
}

async function deleteIt() {
  await stdmsgStore.delete({
    id: stdmsg.value.id,
    configid: config.value.id,
  })

  hide()
}

defineExpose({ show })
</script>
<style scoped>
label {
  font-weight: bold;
  margin-top: 1rem;
}
</style>
