<template>
  <div>
    <OurMessage v-if="msgid" :id="msgid" record-view class="mb-2 mt-2" />
    <MessageList
      :messages-for-list="messagesToShow"
      :selected-group="id"
      :bump="bump"
      :exclude="msgid"
    />
  </div>
</template>
<script setup></script>
<script>
import MessageList from './MessageList'
import OurMessage from './OurMessage'
import { useGroupStore } from '~/stores/group'

export default {
  components: { MessageList, OurMessage },
  props: {
    id: {
      validator: (prop) => typeof prop === 'number' || typeof prop === 'string',
      required: true,
    },
    msgid: {
      type: Number,
      required: false,
      default: null,
    },
  },
  async setup(props) {
    const groupStore = useGroupStore()
    await groupStore.fetchMessages(props.id)
    return { groupStore }
  },
  data() {
    return {
      bump: 0,
    }
  },
  computed: {
    messages() {
      return this.groupStore.getMessages(this.id)
    },
    messagesToShow() {
      const ids = this.messages ? this.messages.slice(0, this.toShow) : []
      return ids.map((id) => {
        return { id, groupid: this.id }
      })
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
  watch: {
    messagesToShow() {
      this.bump++
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
