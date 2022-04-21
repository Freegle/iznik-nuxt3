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
      :slots="{ complete: '', error: '' }"
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
<script setup>
import { useGroupStore } from '~/stores/group'

const groupStore = useGroupStore()

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
})

groupStore.fetchMessages(props.id)

// console.log('Load data')
// useAsyncData('group-' + props.id, () => groupStore.fetch(props.id))
// console.log('Loaded')
</script>
<script>
// import InfiniteLoading from 'vue-infinite-loading'
export default {
  components: {
    // InfiniteLoading,
  },
  props: {
    id: {
      validator: (prop) => typeof prop === 'number' || typeof prop === 'string',
      required: true,
    },
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
      console.log('Load more', this.toShow, this.messages.length)
      if (this.toShow < this.messages.length) {
        this.toShow++
        console.log('Loaded')
        $state.loaded()
      } else {
        console.log('Complete')
        $state.complete()
      }
    },
  },
}
</script>
