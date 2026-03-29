<template>
  <div>
    <b-card v-if="story && show" no-body>
      <b-card-header>
        <div class="d-flex justify-content-between flex-wrap w-100">
          <span v-if="storyUser">
            <ProfileImage
              :image="storyUser.profile?.turl || storyUser.profile?.paththumb"
              :name="storyUser.displayname || primaryEmail"
              class="me-1 ms-1 mb-1 mt-1 inline breakgrid"
              is-thumbnail
              size="sm"
            />
            <strong>{{ primaryEmail || storyUser.displayname }}</strong>
            <span class="small">
              <v-icon icon="hashtag" scale="0.75" class="text-muted" />{{
                storyUser.id
              }}
            </span>
          </span>
          <span>
            member of <strong>{{ groupName }}</strong
            >, posted {{ timeago(story.date) }}
          </span>
          <span>
            <v-icon icon="hashtag" scale="0.75" class="text-muted" />{{
              story.id
            }}
          </span>
        </div>
      </b-card-header>
      <b-card-body>
        <!-- eslint-disable-next-line -->
        <h3>{{ twem(story.headline) }}</h3>
        <div class="d-flex fw-bold">
          {{ twem(story.story) }}
          <b-img v-if="story.photo" thumbnail :src="story.photo.paththumb" />
        </div>
        <NoticeMessage v-if="!story.public" variant="info" class="mt-1">
          They've said this story isn't public, so this is just for you to read
          and then click Hide. You might also like to thank them via Chat.
        </NoticeMessage>
      </b-card-body>
      <b-card-footer>
        <div class="d-flex flex-wrap justify-content-start">
          <b-button
            variant="warning"
            class="me-2 mb-1"
            @click="dontUseForPublicity"
          >
            <v-icon icon="times" /> Hide
          </b-button>
          <div v-if="story.public">
            <b-button
              v-if="newsletter"
              variant="primary"
              class="me-2 mb-1"
              @click="useForNewsletter"
            >
              <v-icon icon="check" /> Good for newsletter
            </b-button>
            <b-button
              v-else
              variant="primary"
              class="me-2 mb-1"
              @click="useForPublicity"
            >
              <v-icon icon="check" /> Good for publicity
            </b-button>
          </div>
          <ChatButton
            v-if="storyUser"
            :userid="storyUser.id"
            :groupid="firstGroupId"
            title="Chat"
            variant="white"
            class="me-2 mb-1"
          />
        </div>
      </b-card-footer>
    </b-card>
  </div>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { useGroupStore } from '@/stores/group'
import { useStoryStore } from '@/stores/stories'
import { useModMe } from '~/modtools/composables/useModMe'
import { twem } from '~/composables/useTwem'
import { usePreferredEmail } from '~/modtools/composables/usePreferredEmail'

const { $api } = useNuxtApp()
const userStore = useUserStore()
const groupStore = useGroupStore()
const storyStore = useStoryStore()
const { checkWork } = useModMe()

const props = defineProps({
  storyid: {
    type: Number,
    required: true,
  },
  newsletter: {
    type: Boolean,
    required: false,
    default: false,
  },
})

const story = computed(() => storyStore.byId(props.storyid))

const show = ref(true)

const storyUser = computed(() => {
  return story.value?.userid ? userStore.byId(story.value.userid) : null
})

const primaryEmail = usePreferredEmail(storyUser)

const firstGroupId = computed(() => {
  const u = storyUser.value
  if (u?.memberships?.length) {
    return u.memberships[0].groupid
  }
  return null
})

const groupName = computed(() => {
  const gid = firstGroupId.value
  if (gid) {
    const g = groupStore.get(gid)
    return g?.namedisplay || g?.nameshort || ''
  }
  return ''
})

onMounted(async () => {
  if (story.value?.userid) {
    const u = await userStore.fetch(story.value.userid)
    // Fetch the first group so we can show its name.
    if (u?.memberships?.length) {
      await groupStore.fetch(u.memberships[0].groupid)
    }
  }
})

async function useForNewsletter() {
  await $api.stories.useForNewsletter(story.value.id)
  show.value = false
  checkWork(true)
}

async function useForPublicity() {
  await $api.stories.useForPublicity(story.value.id)
  show.value = false
  checkWork(true)
}

async function dontUseForPublicity() {
  await $api.stories.dontUseForPublicity(story.value.id)
  show.value = false
  checkWork(true)
}
</script>
