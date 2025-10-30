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
<script>
import draggable from 'vuedraggable'
import { useModConfigStore } from '~/stores/modconfig'
import { icon, variant, copyStdMsgs } from '~/composables/useStdMsgs'

export default {
  components: {
    draggable,
  },
  props: {
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
  },
  setup() {
    const modConfigStore = useModConfigStore()

    return { modConfigStore }
  },
  data: function () {
    return {
      ccopts: [
        { value: 'Nobody', text: 'Nobody' },
        { value: 'Me', text: 'Me' },
        { value: 'Specific', text: 'Specific email' },
      ],
      stdmsgscopy: null,
      showModal: false,
      bump: 0,
      dragging: false,
    }
  },
  computed: {
    config() {
      return this.modConfigStore.current
    },
  },
  watch: {
    config(newval) {
      this.stdmsgscopy = copyStdMsgs(newval)
    },
  },
  mounted() {
    this.stdmsgscopy = copyStdMsgs(this.config)
  },
  methods: {
    updateOrder() {
      // Undivided joy, we have new order.
      const newOrder = this.stdmsgscopy.map((s) => s.id)

      this.modConfigStore.updateConfig({
        id: this.config.id,
        messageorder: JSON.stringify(newOrder),
      })
    },
    visible(stdmsg) {
      return this.types.includes(stdmsg.action)
    },
    add() {
      this.showModal = true
    },
    async fetch() {
      // Update any changed/new buttons.
      await this.modConfigStore.fetchConfig({
        id: this.config.id,
        configuring: true,
      })

      const config = this.modConfigStore.current
      this.stdmsgscopy = copyStdMsgs(config)
      this.bump++
    },
  },
}
</script>
