<template>
  <div>
    <ModConfigSetting
      :configid="config.id"
      :name="cc"
      label="BCC to:"
      description="You can choose whether standard messages get copied by email."
      type="select"
      :options="ccopts"
      :disabled="locked"
    />
    <ModConfigSetting
      v-if="config[cc] === 'Specific'"
      :configid="config.id"
      :name="addr"
      label="Specific address:"
      description="This is the address to BCC messages to."
      :disabled="locked"
    />
    <p>
      Click on a button to edit the message. You can also drag and drop to
      change the order that they'll show in on the relevant pages (e.g. put the
      ones you use most first).
    </p>
    <b-form-checkbox
      v-if="!locked"
      v-model="dragging"
      class="mb-2"
      name="dragbox"
      :disabled="locked"
    >
      <v-icon icon="arrow-left" /> Click to enable dragging
    </b-form-checkbox>
    <div v-if="dragging">
      <draggable
        v-model="stdmsgscopy"
        item-key="id"
        group="buttons"
        class="d-flex justify-content-center flex-wrap"
        @end="updateOrder"
      >
        <template #item="{ element }">
          <ModSettingsStandardMessageButton
            v-if="visible(element)"
            :stdmsg="element"
          />
        </template>
      </draggable>
    </div>
    <div v-else class="d-flex justify-content-center flex-wrap">
      <span v-for="stdmsg in stdmsgscopy" :key="'stdmsg-' + stdmsg.id">
        <ModSettingsStandardMessageButton
          v-if="visible(stdmsg)"
          :stdmsg="stdmsg"
        />
      </span>
    </div>
    <hr />
    <b-button v-if="!locked" variant="white" @click="add">
      <v-icon icon="plus" /> Add new standard message
    </b-button>
    <ModSettingsStandardMessageModal
      v-if="showModal"
      :locked="locked"
      :types="types"
      @hide="fetch"
    />
  </div>
</template>
<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import draggable from 'vuedraggable'
import { copyStdMsgs } from '~/composables/useStdMsgs'
import { useModConfigStore } from '~/stores/modconfig'

const props = defineProps({
  cc: {
    type: String,
    required: true,
  },
  addr: {
    type: String,
    required: true,
  },
  types: {
    type: Array,
    required: true,
  },
  locked: {
    type: Boolean,
    required: false,
    default: false,
  },
})

const modConfigStore = useModConfigStore()

const ccopts = [
  { value: 'Nobody', text: 'Nobody' },
  { value: 'Me', text: 'Me' },
  { value: 'Specific', text: 'Specific email' },
]

const stdmsgscopy = ref(null)
const showModal = ref(false)
const bump = ref(0)
const dragging = ref(false)

const config = computed(() => {
  return modConfigStore.current
})

watch(config, (newval) => {
  stdmsgscopy.value = copyStdMsgs(newval)
})

onMounted(() => {
  stdmsgscopy.value = copyStdMsgs(config.value)
})

function updateOrder() {
  // Undivided joy, we have new order.
  const newOrder = stdmsgscopy.value.map((s) => s.id)

  modConfigStore.updateConfig({
    id: config.value.id,
    messageorder: JSON.stringify(newOrder),
  })
}

function visible(stdmsg) {
  return props.types.includes(stdmsg.action)
}

function add() {
  showModal.value = true
}

async function fetch() {
  // Update any changed/new buttons.
  await modConfigStore.fetchConfig({
    id: config.value.id,
    configuring: true,
  })

  const currentConfig = modConfigStore.current
  stdmsgscopy.value = copyStdMsgs(currentConfig)
  bump.value++
}
</script>
