<template>
  <div class="clickme" title="Click to see their profile" @click="showInfo">
    <div class="d-flex clickme">
      <ProfileImage
        :image="newsfeed?.profile?.path"
        class="ml-1 mb-1 inline"
        is-thumbnail
        :is-moderator="Boolean(newsfeed.showmod)"
        size="lg"
      />
      <div class="media-body ml-2">
        <span class="text-success font-weight-bold">
          {{ newsfeed.displayname }}
        </span>
        {{ append }}
        <span v-if="appendBold"> "{{ appendBold }}" </span>
        <br />
        <span class="text-muted small pl-0">
          <span class="d-none d-md-inline">{{ addedago }}</span>
          <span class="d-md-none">{{ addedagoShort }}</span>
        </span>
        <NewsUserInfo :id="newsfeed.id" />
      </div>
    </div>
    <div v-if="mod && newsfeed?.type === 'AboutMe'" class="text-muted small">
      (Note to mods: Members are encouraged to introduce themselves, and then
      their introductions appear automatically on here, and also show to other
      freeglers in chats.)
    </div>
    <ProfileModal
      v-if="showProfileModal"
      :id="userid"
      @hidden="showProfileModal = false"
    />
  </div>
</template>
<script setup>
import { ref, computed, defineAsyncComponent } from 'vue'
import { timeago, timeagoShort } from '~/composables/useTimeFormat'
import { useAuthStore } from '~/stores/auth'
import NewsUserInfo from '~/components/NewsUserInfo'
import ProfileImage from '~/components/ProfileImage'

const ProfileModal = defineAsyncComponent(() =>
  import('~/components/ProfileModal')
)

const props = defineProps({
  userid: {
    type: Number,
    required: true,
  },
  newsfeed: {
    type: Object,
    required: true,
  },
  append: {
    type: String,
    required: false,
    default: '',
  },
  appendBold: {
    type: String,
    required: false,
    default: '',
  },
})

const authStore = useAuthStore()
const me = computed(() => authStore.user)
const showProfileModal = ref(false)

const addedago = computed(() => {
  return timeago(props.newsfeed.added)
})

const addedagoShort = computed(() => {
  return timeagoShort(props.newsfeed.added)
})

const mod = computed(() => {
  return (
    me.value &&
    (me.value.systemrole === 'Moderator' ||
      me.value.systemrole === 'Admin' ||
      me.value.systemrole === 'Support')
  )
})

function showInfo() {
  showProfileModal.value = true
}
</script>
