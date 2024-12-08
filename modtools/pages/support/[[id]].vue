<template>
  <div>
    <div v-if="supportOrAdmin">
      <div>
        <b-tabs content-class="mt-3" card>
          <b-tab active>
            <template v-slot:title>
              <h2 class="ml-2 mr-2">
                Find User
              </h2>
            </template>
            <ModSupportFindUser :id="id" />
          </b-tab>
          <b-tab>
            <template v-slot:title>
              <h2 class="ml-2 mr-2">
                Find Community
              </h2>
            </template>
            <ModSupportFindGroup />
          </b-tab>
          <b-tab>
            <template v-slot:title>
              <h2 class="ml-2 mr-2">
                Find Message
              </h2>
            </template>
            <p>
              You can search for message by id, or by subject.  This will only return the first few results, so the more
              specific, the better.
            </p>
            <!--ModFindMessage /-->
            <div v-if="messages" class="mt-2">
              Message list TODO
              <!--ModMessage
                v-for="message in messages"
                :key="'message-' + message.id"
                :message="message"
                noactions
              /-->
            </div>
          </b-tab>
          <b-tab>
            <template v-slot:title>
              <h2 class="ml-2 mr-2">
                List Groups
              </h2>
            </template>
            <!--ModSupportListGroups /-->
          </b-tab>
          <b-tab>
            <template v-slot:title>
              <h2 class="ml-2 mr-2">
                Contact Group
              </h2>
            </template>
            <!--ModSupportContactGroup /-->
          </b-tab>
          <b-tab>
            <template v-slot:title>
              <h2 class="ml-2 mr-2">
                Add Group
              </h2>
            </template>
            <!--ModSupportAddGroup /-->
          </b-tab>
          <b-tab>
            <template v-slot:title>
              <h2 class="ml-2 mr-2">
                Check Volunteers
              </h2>
            </template>
            <ModSupportCheckVolunteers />
          </b-tab>
        </b-tabs>
      </div>
    </div>
    <NoticeMessage v-else variant="warning">
      You don't have access to Support Tools.
    </NoticeMessage>
  </div>
</template>
<script>
import NoticeMessage from '~/components/NoticeMessage'
import { useChatStore } from '../stores/chat'
import { useMessageStore } from '~/stores/message'

export default {
  async setup() {
    const chatStore = useChatStore()
    const messageStore = useMessageStore()
    return { chatStore, messageStore }
  },
  data() {
    return {
      id: 0
    }
  },
  computed: {
    messages() {
      /* TODO this.messageStore.all()*/
      return []
    }
  },
  async created() {
    const route = useRoute()
    this.id = 'id' in route.params ? parseInt(route.params.id) : 0
    this.chatStore.list = [] // this.chatStore.clear()
    this.messageStore.clear()
  }
}
</script>
<style scoped>
.max {
  max-width: 300px;
}
</style>
