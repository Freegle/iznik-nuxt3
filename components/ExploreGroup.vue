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
      v-for="message in filteredMessages"
      :key="'message-' + message.id"
      class="p-0"
    >
      <OurMessage :id="message.id" record-view />
    </div>

    <client-only>
      <NoticeMessage
        v-if="!busy && !filteredMessages.length"
        variant="info"
        class="mt-2"
      >
        There are no messages on this group yet.
      </NoticeMessage>
      <!--      TODO Infinite loading.-->
      <!--      <infinite-loading :distance="distance" @infinite="loadMoreMessages">-->
      <!--        <span slot="no-results" />-->
      <!--        <span slot="no-more" />-->
      <!--        <span slot="spinner">-->
      <!--          <b-img-lazy src="~/static/loader.gif" alt="Loading" />-->
      <!--        </span>-->
      <!--      </infinite-loading>-->
    </client-only>
  </div>
</template>
<script>
// import InfiniteLoading from 'vue-infinite-loading'
import NoticeMessage from './NoticeMessage'
import { useGroupStore } from '~/stores/group'
import OurMessage from '~/components/OurMessage.vue'
const groupHeader = () => import('~/components/GroupHeader.vue')

export default {
  components: {
    NoticeMessage,
    // InfiniteLoading,
    groupHeader,
    OurMessage,
  },
  props: {
    id: {
      validator: (prop) => typeof prop === 'number' || typeof prop === 'string',
      required: true,
    },
  },
  setup(props) {
    const groupStore = useGroupStore()

    useAsyncData('group-' + props.id, () => groupStore.fetch(props.id))

    return { groupStore }
  },
  data() {
    return {
      busy: false,
      context: null,
      distance: 1000,
    }
  },
  computed: {
    messages() {
      const messages = [
        {
          id: 85299327,
        },
        {
          id: 88378080,
        },
      ]

      // if (this.group) {
      //   messages = this.$store.getters['messages/getByGroup'](this.group.id)
      // } else {
      //   messages = this.$store.getters['messages/getAll']
      // }

      return messages
    },
    filteredMessages() {
      return this.messages.filter((message) => {
        return !message.outcomes || message.outcomes.length === 0
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
  methods: {
    loadMoreMessages($state) {
      this.busy = true

      let messages

      if (this.group) {
        messages = this.$store.getters['messages/getByGroup'](this.group.id)
      } else {
        messages = this.$store.getters['messages/getAll']
      }

      const lastCount = messages.length

      this.$store
        .dispatch('messages/fetchMessages', {
          groupid: this.group ? this.group.id : null,
          collection: 'Approved',
          summary: true,
          types: ['Offer', 'Wanted'],
          context: this.context,
        })
        .then(() => {
          this.busy = false

          this.context = this.$store.getters['messages/getContext']

          if (this.group) {
            messages = this.$store.getters['messages/getByGroup'](this.group.id)
          } else {
            messages = this.$store.getters['messages/getAll']
          }

          if (messages.length === lastCount) {
            $state.complete()
          } else {
            $state.loaded()
          }
        })
        .catch(() => {
          $state.complete()
        })
    },
  },
}
</script>
