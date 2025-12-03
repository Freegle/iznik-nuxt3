<template>
  <div class="mb-2 mt-2">
    <div v-if="group" class="group-header bg-white p-3 mb-3">
      <div class="d-flex align-items-start gap-3">
        <GroupProfileImage
          :image="group.profile ? group.profile : '/icon.png'"
          :alt-text="'Profile picture for ' + group.namedisplay"
        />
        <div class="flex-grow-1">
          <h1 class="h4 mb-1">{{ group.namedisplay }}</h1>
          <p v-if="group.tagline" class="text-muted mb-2">
            {{ group.tagline }}
          </p>
          <div class="d-flex flex-wrap gap-2 align-items-center">
            <JoinWithConfirm
              v-if="!oneOfMyGroups(group.id)"
              :id="group.id"
              :name="group.namedisplay"
              size="md"
              variant="primary"
            />
            <span v-else class="badge bg-success">Member</span>
            <ExternalLink
              :href="'mailto:' + group.modsemail"
              class="text-muted small"
            >
              <v-icon icon="envelope" class="fa-fw" />
              Contact volunteers
            </ExternalLink>
          </div>
        </div>
      </div>
    </div>
    <OurMessage v-if="msgid" :id="msgid" record-view class="mt-3" />
    <MessageList
      :messages-for-list="messagesToShow"
      :selected-group="id"
      :bump="bump"
      :exclude="msgid"
      :show-give-find="showGiveFind"
    />
  </div>
</template>
<script setup>
import { ref, computed, watch } from 'vue'
import MessageList from './MessageList'
import OurMessage from './OurMessage'
import GroupProfileImage from './GroupProfileImage'
import JoinWithConfirm from './JoinWithConfirm'
import ExternalLink from './ExternalLink'
import { useGroupStore } from '~/stores/group'
import { useMe } from '~/composables/useMe'

const props = defineProps({
  id: {
    validator: (prop) => typeof prop === 'number' || typeof prop === 'string',
    required: true,
  },
  msgid: {
    type: Number,
    required: false,
    default: null,
  },
  showGiveFind: {
    type: Boolean,
    required: false,
    default: false,
  },
})

const groupStore = useGroupStore()
const { oneOfMyGroups } = useMe()

const group = computed(() => {
  return groupStore?.get(props.id)
})

// Methods
function loadMore($state) {
  if (toShow.value < messages.value.length) {
    toShow.value++
    $state.loaded()
  } else {
    $state.complete()
  }
}

// Expose methods to parent components
defineExpose({
  loadMore,
})

const bump = ref(0)
const toShow = ref(20) // Assuming a default value for toShow

await groupStore.fetchMessagesForGroup(props.id)

// Computed properties
const messages = computed(() => {
  return groupStore?.getMessages(props.id)
})

const messagesToShow = computed(() => {
  const ids = messages.value ? messages.value.slice(0, toShow.value) : []
  return ids.map((id) => {
    return { id, groupid: props.id }
  })
})

// Watch for changes
watch(messagesToShow, () => {
  bump.value++
})
</script>
