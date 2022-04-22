<template>
  <div>
    <GroupHeader
      v-if="group"
      :id="group.id"
      :key="'group-' + (group ? group.id : null)"
      :group="group"
      :show-join="true"
    />
    <div
      v-for="message in messagesToShow"
      :key="'message-' + message"
      class="p-0"
    >
      <OurMessage :id="message" record-view />
    </div>
    <InfiniteLoading
      :identifier="messages.length"
      :distance="1000"
      :slots="{ complete: ' ', error: ' ' }"
      :first-load="true"
      @infinite="loadMore"
    />

    <client-only>
      <NoticeMessage
        v-if="!busy && !messages.length"
        variant="info"
        class="mt-2"
      >
        There are no messages on this group yet.
      </NoticeMessage>
    </client-only>
  </div>
</template>
<script setup></script>
<script>
import { useGroupStore } from '~/stores/group'

export default {
  props: {
    id: {
      validator: (prop) => typeof prop === 'number' || typeof prop === 'string',
      required: true,
    },
  },
  async setup(props) {
    const groupStore = useGroupStore()
    await groupStore.fetchMessages(props.id)
    return { groupStore }
  },
  data() {
    return {
      busy: false,
      toShow: 10,
    }
  },
  computed: {
    messages() {
      return this.groupStore.getMessages(this.id)
    },
    messagesToShow() {
      return this.messages.slice(0, this.toShow)
    },
    group() {
      return this.groupStore.get(this.id)
    },
    closed() {
      let ret = false

      if (this.group && this.group.settings && this.group.settings.closed) {
        ret = true
      }

      return ret
    },
  },
  methods: {
    loadMore($state) {
      if (this.toShow < this.messages.length) {
        this.toShow++
        $state.loaded()
      } else {
        $state.complete()
      }
    },
  },
}
</script>
