<template>
  <div v-if="chat" class="layout">
    <div class="type">
      <v-icon
        v-if="chat.chattype === 'User2User'"
        class="text-success pe-1"
        icon="user"
      />
      <v-icon
        v-else-if="chat.chattype === 'User2Mod' || chat.chattype === 'Mod2Mod'"
        class="text-warning pe-1 mb-2"
        icon="crown"
      />
    </div>
    <div class="id text-muted">
      Chat <v-icon icon="hashtag" scale="0.5" class="text-muted" />{{ chat.id }}
    </div>
    <ModChatViewButton :id="chat.id" :pov="pov" class="button" />
    <div class="name d-flex">
      {{ otheruserName }}&nbsp;
      <span v-if="otheruserid" class="text-muted">
        <v-icon icon="hashtag" class="text-muted" scale="0.5" />{{
          otheruserid
        }}
      </span>
    </div>
    <div class="time">
      <span v-if="chat.lastdate" :title="datetime(chat.lastdate)">
        {{ timeago(chat.lastdate) }}
      </span>
      <span v-else>
        <em>No messages</em>
      </span>
    </div>
  </div>
</template>
<script setup>
import { computed } from 'vue'
import { useChatStore } from '~/stores/chat'
import { useUserStore } from '~/stores/user'

const chatStore = useChatStore()
const userStore = useUserStore()

const props = defineProps({
  chatid: {
    type: Number,
    required: true,
  },
  pov: {
    type: Number,
    required: false,
    default: null,
  },
})

const chat = computed(() => chatStore.byChatId(props.chatid))

const otheruserid = computed(() => {
  if (!chat.value || chat.value.chattype !== 'User2User') {
    return null
  } else {
    return chat.value.user1 === props.pov ? chat.value.user2 : chat.value.user1
  }
})

// Fetch the other user so we can show their displayname.
if (otheruserid.value) {
  userStore.fetch(otheruserid.value)
}

const otheruserName = computed(() => {
  if (otheruserid.value) {
    const u = userStore.byId(otheruserid.value)
    return u?.displayname || chat.value?.name || ''
  }
  return chat.value?.name || ''
})
</script>
<style scoped lang="scss">
//@import 'color-vars';
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins/_breakpoints';

.layout {
  display: grid;
  grid-template-rows: auto;
  grid-template-columns: 20px 1fr 130px 3fr 130px;
  gap: 0 8px;

  @include media-breakpoint-down(sm) {
    grid-template-rows: auto auto auto auto;
    grid-template-columns: 20px 1fr;

    .type {
      grid-row: 1 / 2;
      grid-column: 1 / 2;
    }

    .id {
      grid-row: 1 / 2;
      grid-column: 2 / 3;
    }

    .name {
      grid-row: 2 / 3;
      grid-column: 1 / 3;
    }

    .time {
      grid-row: 3 / 4;
      grid-column: 1 / 3;
    }

    .button {
      grid-row: 4 / 5;
      grid-column: 1 / 3;
    }
  }
}
</style>
