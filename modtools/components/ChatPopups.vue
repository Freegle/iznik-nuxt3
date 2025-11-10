<template>
  <div>
    TODO ChatPopups.vue NOT USED NOW
    <!--client-only>
      <div v-for="chat in chatlist">
        CHAT {{ chat.id }}
      </div>

      <b-list-group horizontal class="p-0 m-0 list-unstyled chatPopups">
        <b-list-group-item v-for="chat in chatlist" :key="'popupchat-' + chat.id" class="bg-transparent">
          <ChatPopup :id="chat.id" />
        </b-list-group-item>
      </b-list-group>
    </client-only-->
  </div>
</template>
<script>
import { useChatStore } from '~/stores/chat'
const ChatPopup = defineAsyncComponent(() => import('./ChatPopup'))

export default {
  components: {
    ChatPopup,
  },
  props: {},
  setup() {
    const chatStore = useChatStore()
    return { chatStore }
  },
  data: function () {
    return {}
  },
  computed: {
    chatlist() {
      // The popup info is held in our local store.
      // const popups = this.popupchatsStore.list
      const popups = []
      // const popups = Object.values(this.$store.getters['popupchats/list'])

      // We want the chats which are currently set to be popups.
      const ret = []

      const chats = this.chatStore.list
      // for (const chat of chats) {
      //  console.log('chatlist', chat)
      // }

      // There will be few popups, so although this involves a scan of all chats, the performance should be ok.
      for (const popup of popups) {
        for (const chat of chats) {
          if (parseInt(popup.id) === parseInt(chat.id)) {
            ret.push(chat)
            break
          }
        }
      }
      console.log('ChatPopups chatlist', ret)

      return ret
    },
  },
  async mounted() {
    // Components can't use asyncData, so we fetch here.  Can't do this for SSR, but that's fine as we don't
    // need to render this on the server.
    await this.chatStore.fetchChats({ fetchChats: ['User2Mod', 'Mod2Mod'] })
  },
  methods: {},
}
</script>
<style>
.chatPopups {
  position: fixed;
  bottom: 0;
  right: 0;
  z-index: 900;
}
</style>
