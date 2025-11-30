<template>
  <div type="dark" class="ourBack layout fixed-top pt-1 pb-1">
    <OfflineIndicator v-if="!online" class="offline" />
    <div v-else class="backbutton d-flex flex-column justify-content-around">
      <b-button variant="white" class="nohover" @click="backButton">
        <v-icon icon="arrow-left" />
        <b-badge v-if="backButtonCount" variant="danger" class="ml-1">
          {{ backButtonCount }}
        </b-badge>
      </b-button>
    </div>
    <ProfileImage
      :image="chat.icon"
      :name="chat.name"
      class="profilepic clickme"
      is-thumbnail
      size="lg-always"
      border
      :title="'Click to view profile for ' + chat.name"
      @click="showInfo"
    />
    <div
      class="name d-flex flex-column justify-content-around clickme text-center"
      :title="'Click to view profile for ' + chat.name"
      @click="showInfo"
    >
      <h1 class="text-white truncate text-center header--size5 m-0">
        {{ chat.name }}
      </h1>
      <div
        v-if="!otheruser?.deleted && milesaway"
        class="text-white small text-truncate"
      >
        {{ milesstring }}
      </div>
    </div>
    <div
      v-if="otheruser && otheruser.info && !otheruser?.deleted"
      class="d-flex flex-column justify-content-around ratings"
    >
      <div class="d-flex flex-column align-content-between">
        <UserRatings
          :id="chat.otheruid"
          :key="'otheruser-' + chat.otheruid"
          class="d-flex justify-content-end"
          size="sm"
        />
        <SupporterInfo v-if="otheruser.supporter" class="align-self-end" />
      </div>
    </div>
    <ProfileModal
      v-if="showProfileModal"
      :id="otheruser?.id"
      close-on-message
      @hidden="showProfileModal = false"
    />
  </div>
</template>
<script setup>
import {
  clearNavBarTimeout,
  setNavBarHidden,
  useNavbar,
  navBarHidden,
} from '~/composables/useNavbar'
import { useChatStore } from '~/stores/chat'
import { setupChat } from '~/composables/useChat'

const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
})

const chatStore = useChatStore()
const chat = chatStore.byChatId(props.id)

const { online, backButtonCount, backButton } = useNavbar()

const { otheruser, milesaway, milesstring } = await setupChat(props.id)

// We want to hide the navbars when you scroll down.
onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onBeforeUnmount(() => {
  clearNavBarTimeout()
  window.removeEventListener('scroll', handleScroll)
})

function handleScroll() {
  const scrollY = window.scrollY

  if (scrollY > 200 && !navBarHidden.value) {
    // Scrolling down.  Hide the navbars.
    setNavBarHidden(true)
  } else if (scrollY < 100 && navBarHidden.value) {
    // At the top. Show the navbars.
    setNavBarHidden(false)
  }
}

const showProfileModal = ref(false)
function showInfo() {
  showProfileModal.value = true
}
</script>
<style scoped lang="scss">
@import 'assets/css/navbar.scss';

.layout {
  display: grid;
  grid-template-columns:
    0.25em 40px 50px calc(
      100vw - 0.5em - 40px - 0.25em - 50px - 0.25em - 110px - 0.5em
    )
    110px 0.25em;
  grid-column-gap: 0.25em;

  .offline,
  .backbutton {
    grid-row: 1 / 2;
    grid-column: 2 / 3;
  }

  .profilepic {
    grid-row: 1 / 2;
    grid-column: 3 / 4;
  }

  .name {
    grid-row: 1 / 2;
    grid-column: 4 / 5;
  }

  .ratings {
    grid-row: 1 / 2;
    grid-column: 5 / 6;
  }
}

:deep(.badge) {
  font-size: 0.6em;
}
</style>
