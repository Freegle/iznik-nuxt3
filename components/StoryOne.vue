<template>
  <div v-if="story" class="story-card">
    <div class="story-card__header">
      <nuxt-link
        no-prefetch
        :to="'/story/' + story.id"
        class="story-card__headline"
      >
        "{{ story.headline }}"
      </nuxt-link>
      <div class="story-card__actions">
        <span v-if="story.likes" class="story-card__likes">
          <v-icon icon="heart" /> {{ story.likes }}
        </span>
        <b-button
          v-if="loggedIn && !story.liked"
          variant="secondary"
          size="sm"
          @click="love"
        >
          <v-icon icon="heart" />
          <span class="d-none d-sm-inline"> Love</span>
        </b-button>
        <b-button
          v-if="loggedIn && story.liked"
          variant="secondary"
          size="sm"
          @click="unlove"
        >
          <v-icon icon="heart" class="text-danger" />
          <span class="d-none d-sm-inline"> Unlove</span>
        </b-button>
        <b-button variant="secondary" size="sm" @click="share(story)">
          <v-icon icon="share-alt" />
        </b-button>
      </div>
    </div>

    <div class="story-card__body">
      <div v-if="story.image" class="story-card__image">
        <b-img
          lazy
          :src="story.image.path"
          class="story-card__photo"
          @click="showPhotoModal = true"
        />
      </div>
      <read-more
        v-if="story.story"
        :text="story.story"
        :max-chars="300"
        class="story-card__text"
      />
      <div class="story-card__meta">
        <span>
          {{ storydateago }}
          <span v-if="user?.displayname"> by {{ user.displayname }}</span>
          <span v-if="displayGroupName"> in {{ displayGroupName }}</span>
          <span v-else-if="userLocation?.display">
            in {{ userLocation.display }}
          </span>
          <span v-else-if="userLocation?.groupname">
            in {{ userLocation.groupname }}
          </span>
        </span>
        <nuxt-link
          no-prefetch
          :to="'/story/' + story.id"
          class="story-card__id"
        >
          #{{ story.id }}
        </nuxt-link>
      </div>
    </div>

    <b-modal
      v-if="story?.image"
      ref="photoModal"
      v-model="showPhotoModal"
      scrollable
      title="Story Photo"
      size="lg"
      no-stacking
      ok-only
    >
      <template #default>
        <b-img fluid rounded center :src="story.image.path" />
      </template>
    </b-modal>
    <StoryShareModal v-if="showShare" :id="id" @hidden="showShare = false" />
  </div>
</template>
<script setup>
import { ref, computed, defineAsyncComponent } from 'vue'
import { useStoryStore } from '~/stores/stories'
import { useUserStore } from '~/stores/user'
import { useAuthStore } from '~/stores/auth'
import { useGroupStore } from '~/stores/group'
import ReadMore from '~/components/ReadMore'
import { timeago } from '~/composables/useTimeFormat'

const StoryShareModal = defineAsyncComponent(() =>
  import('~/components/StoryShareModal')
)

const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
  groupId: {
    type: Number,
    required: false,
    default: null,
  },
})

const storyStore = useStoryStore()
const userStore = useUserStore()
const authStore = useAuthStore()
const groupStore = useGroupStore()
const loggedIn = computed(() => authStore.user !== null)

const showShare = ref(false)
const showPhotoModal = ref(false)

// Fetch data
const story = await storyStore.fetch(props.id)
const user = await userStore.fetch(story.userid)
const userLocation = await userStore.fetchPublicLocation(story.userid)

// Fetch group data if groupId is provided
let group = null
if (props.groupId) {
  group = await groupStore.fetch(props.groupId)
}

// Computed properties
const storydateago = computed(() => {
  return timeago(story.date)
})

const displayGroupName = computed(() => {
  if (props.groupId && group) {
    return group.namedisplay || group.nameshort
  }

  return null
})

// Methods
function share() {
  showShare.value = true
}

async function love() {
  await storyStore.love(props.id)
}

async function unlove() {
  await storyStore.unlove(props.id)
}
</script>
<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins/_breakpoints';
@import 'assets/css/_color-vars.scss';

.story-card {
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.story-card__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 1rem;
  background: $color-green--darker;
  color: white;
}

.story-card__headline {
  font-weight: 600;
  font-size: 1rem;
  color: white;
  text-decoration: none;
  flex: 1;

  &:hover {
    text-decoration: underline;
  }
}

.story-card__actions {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  flex-shrink: 0;
}

.story-card__likes {
  font-size: 0.875rem;
  margin-right: 0.5rem;
}

.story-card__body {
  padding: 1rem;
}

.story-card__image {
  margin-bottom: 1rem;
}

.story-card__photo {
  max-height: 250px;
  max-width: 250px;
  cursor: pointer;
  object-fit: cover;
}

.story-card__text {
  font-size: 0.9375rem;
  line-height: 1.6;
  color: $gray-700;
  margin-bottom: 1rem;
  white-space: pre-line;
}

.story-card__meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
  color: $gray-500;
}

.story-card__id {
  color: $gray-500;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
}
</style>
