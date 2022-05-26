<template>
  <MessageList
    :messages-for-list="messagesToShow"
    :selected-group="id"
    :bump="bump"
  />
</template>
<script setup></script>
<script>
import MessageList from './MessageList'
import { useGroupStore } from '~/stores/group'

export default {
  components: { MessageList },
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
