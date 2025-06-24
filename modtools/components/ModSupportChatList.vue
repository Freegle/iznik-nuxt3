<template>
  <div>
    <ModSupportChat
      v-for="chat in chatsShown"
      :key="'chathistory-' + chat.id"
      :chat="chat"
      :pov="pov"
    />
    <infinite-loading :distance="10" @infinite="loadMoreChats">
      <template #complete>
        <notice-message v-if="!chatsShown?.length"> No chats. </notice-message>
      </template>
    </infinite-loading>
  </div>
</template>
<script>
export default {
  props: {
    chats: {
      type: Array,
      required: true,
    },
    pov: {
      type: Number,
      required: false,
      default: null,
    },
  },
  data: function () {
    return {
      showChats: 0,
    }
  },
  computed: {
    chatsShown() {
      return this.chats ? this.chats.slice(0, this.showChats) : []
    },
  },
  methods: {
    loadMoreChats($state) {
      // We use an infinite load for the list because it's a lot of DOM to add at initial page load.
      if (this.showChats < this.chats.length) {
        this.showChats += 10
        $state.loaded()
      } else {
        $state.complete()
      }
    },
  },
}
</script>
