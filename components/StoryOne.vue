<template>
  <div>
    <b-card no-body>
      <b-card-header bg-variant="primary" text-variant="white">
        <div v-if="story" class="d-flex justify-content-between">
          <div>&quot;{{ story.headline }}&quot;</div>
          <div>
            <span v-if="story.likes">
              <v-icon icon="heart" class="fa-fw mr-2" /> {{ story.likes }}
            </span>
            <b-button
              v-if="loggedIn && !story.liked"
              variant="secondary"
              class="mr-2"
              @click="love"
            >
              <v-icon icon="heart" class="fa-fw" /><span
                class="d-none d-sm-inline"
                >&nbsp;Love this</span
              >
            </b-button>
            <b-button
              v-if="loggedIn && story.liked"
              variant="secondary"
              class="mr-2"
              @click="unlove"
            >
              <v-icon icon="heart" class="text-danger fa-fw" /><span
                class="d-none d-sm-inline"
                >&nbsp;Unlove this</span
              >
            </b-button>
            <b-button variant="secondary" class="mr-2" @click="share(story)">
              <v-icon icon="share-alt" class="fa-fw" />
            </b-button>
          </div>
        </div>
      </b-card-header>
      <b-card-body>
        <b-card-text class="pl-4 pr-4">
          <div v-if="story">
            <div v-if="story.story" class="preline">
              <div v-if="story.image">
                <b-img
                  lazy
                  :src="story.image.path"
                  class="storyphoto clickme"
                  thumbnail
                  @click="showPhotoModal = true"
                />
                <br />
              </div>
              <read-more
                v-if="story.story"
                :text="story.story"
                :max-chars="300"
              />
            </div>
            <div class="text-muted small d-flex justify-content-between">
              <span>
                {{ storydateago }}
                <span v-if="user?.displayname"> by {{ user.displayname }}</span>
                <span v-if="displayGroupName"> in {{ displayGroupName }} </span>
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
                class="text-muted nodecor"
              >
                #{{ story.id }}
              </nuxt-link>
            </div>
          </div>
        </b-card-text>
      </b-card-body>
    </b-card>
    <b-modal
      v-if="story?.image"
      ref="photoModal"
      v-model="showPhotoModal"
      scrollable
      title="Story Photo"
      generator-unable-to-provide-required-alt=""
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
<style scoped>
.storyphoto {
  max-height: 250px !important;
  max-width: 250px !important;
}
</style>
