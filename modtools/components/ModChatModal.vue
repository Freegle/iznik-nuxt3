<template>
  <div>
    <b-modal
      :id="'messageReportModal-' + id"
      ref="modal"
      size="lg"
      hide-header-close
      no-close-on-esc
      @hidden="emit('hidden')"
    >
      <template #header>
        <div
          v-if="user1 && pov == user1.id"
          class="d-flex justify-content-between w-100"
        >
          <div v-if="user2">
            {{ user2.displayname }}
            <span class="text-muted small">
              <v-icon icon="hashtag" class="text-muted" scale="0.8" />{{
                user2.id
              }}
              <span v-if="user2.ljuserid">
                &nbsp; LJ
                <v-icon icon="hashtag" class="text-muted" scale="0.8" />{{
                  user2.ljuserid
                }}
              </span>
              <span v-else-if="user2.tnuserid">
                &nbsp; TN
                <v-icon icon="hashtag" class="text-muted" scale="0.8" />{{
                  user2.tnuserid
                }}
              </span>
            </span>
          </div>
          <div v-if="user1">
            {{ user1.displayname }}
            <span class="text-muted small">
              <v-icon icon="hashtag" class="text-muted" scale="0.8" />{{
                user1.id
              }}
              <span v-if="user1.ljuserid">
                &nbsp; LJ
                <v-icon icon="hashtag" class="text-muted" scale="0.8" />{{
                  user1.ljuserid
                }}
              </span>
              <span v-else-if="user1.tnuserid">
                &nbsp; TN
                <v-icon icon="hashtag" class="text-muted" scale="0.8" />{{
                  user1.tnuserid
                }}
              </span>
            </span>
          </div>
          <div v-if="chat2 && chat2.group">
            {{ chat2.group.namedisplay }} Volunteers
          </div>
        </div>
        <div v-else class="d-flex justify-content-between w-100">
          <div v-if="user1">
            {{ user1.displayname }}
            <span class="text-muted small">
              <v-icon icon="hashtag" class="text-muted" scale="0.8" />{{
                user1.id
              }}
              <span v-if="user1.ljuserid">
                &nbsp; LJ
                <v-icon icon="hashtag" class="text-muted" scale="0.8" />{{
                  user1.ljuserid
                }}
              </span>
              <span v-else-if="user1.tnuserid">
                &nbsp; TN
                <v-icon icon="hashtag" class="text-muted" scale="0.8" />{{
                  user1.tnuserid
                }}
              </span>
            </span>
          </div>
          <div v-if="user1 && user2 && user1.id != user2.id">
            {{ user2.displayname }}
            <span class="text-muted small">
              <v-icon icon="hashtag" class="text-muted" scale="0.8" />{{
                user2.id
              }}
              <span v-if="user2.ljuserid">
                &nbsp; LJ
                <v-icon icon="hashtag" class="text-muted" scale="0.8" />{{
                  user2.ljuserid
                }}
              </span>
              <span v-else-if="user2.tnuserid">
                &nbsp; TN
                <v-icon icon="hashtag" class="text-muted" scale="0.8" />{{
                  user2.tnuserid
                }}
              </span>
            </span>
          </div>
          <div v-if="chat2 && chat2.group">
            {{ chat2.group.namedisplay }} Volunteers
          </div>
        </div>
      </template>
      <template #default>
        <div
          v-if="chat2"
          ref="chatContent"
          class="m-0 chatContent"
          infinite-wrapper
        >
          <infinite-loading
            direction="top"
            force-use-infinite-wrapper="true"
            :distance="10"
            @infinite="loadMore"
          >
            <template #spinner>
              <b-img lazy src="/loader.gif" alt="Loading" />
            </template>
          </infinite-loading>
          <div v-if="chatmessages.length === 0">No messages</div>
          <ul
            v-for="chatmessage in chatmessages"
            :key="'chatmessage-' + chatmessage.id"
            class="p-0 pt-1 list-unstyled mb-1"
          >
            <li v-if="chatmessage">
              <ChatMessage
                :id="chatmessage.id"
                :key="'chatmessage-' + chatmessage.id"
                :chatid="chatmessage.chatid"
                :last="
                  chatmessage.id === chatmessages[chatmessages.length - 1].id
                "
                :pov="pov"
                class="mb-1"
              />
            </li>
          </ul>
        </div>
      </template>
      <template #footer>
        <b-button variant="white" @click="closeit"> Close </b-button>
      </template>
    </b-modal>
  </div>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue'
import { useOurModal } from '~/composables/useOurModal'
import { setupChat } from '~/composables/useChat'

const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
  pov: {
    type: Number,
    required: true,
  },
})

const emit = defineEmits(['hidden'])

const { modal, hide } = useOurModal()

const { chatStore, chatmessages } = await setupChat(props.id)
const chat2 = ref(null)

// Construct basic user details by hand. u1settings and u2settings also available
// Depending on our p.o.v. we may need to swap user1 and user2
const user1 = computed(() => {
  let ret = null

  if (chat2.value) {
    if (chat2.value.user1 && chat2.value.user1.id === props.pov) {
      ret = chat2.value.user2
    } else {
      ret = chat2.value.user1
    }
  }
  return ret
})

const user2 = computed(() => {
  let ret = null

  if (chat2.value) {
    if (chat2.value.user2 && chat2.value.user2.id === props.pov) {
      ret = chat2.value.user2
    } else {
      ret = chat2.value.user1
    }
  }

  return ret
})

async function show() {
  // await chatStore.listChatsMT({ chattypes: ['User2Mod', 'Mod2Mod'] }, props.id)
  await chatStore.fetchChat(props.id)
  await chatStore.fetchMessages(props.id)
  chat2.value = chatStore.byChatId(props.id)
  modal.value.show()
}

function closeit() {
  // console.log('MCM closeit', props.id)
  // We have loaded this chat into store, but it's probably not ours.  So update the list, otherwise next
  // time we go into chats we'll see weirdness.  No need to await though, and that makes closing chats sluggish.
  /* MT3: Not done yet - is it needed?
  const modtools = this.$store.getters['misc/get']('modtools')
  this.$store.dispatch('chats/listChats', {
    chattypes: modtools
      ? ['User2Mod', 'Mod2Mod']
      : ['User2User', 'User2Mod']
  })
  */
  hide()
}

function loadMore($state) {
  $state.complete()
}

onMounted(async () => {
  await show()
})
</script>
<style scoped lang="scss">
//@import 'color-vars';

:deep(h5) {
  width: 100%;
}

.chatContent {
  overflow-y: scroll;
  overflow-x: hidden;
  max-height: 75vh;
  background-color: $color-yellow--light;
}
</style>
