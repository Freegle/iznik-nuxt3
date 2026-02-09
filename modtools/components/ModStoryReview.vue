<template>
  <div>
    <b-card v-if="show" no-body>
      <b-card-header>
        <div class="d-flex justify-content-between flex-wrap w-100">
          <span v-if="user">
            <ProfileImage
              :image="user.profile?.paththumb"
              :name="user.displayname || user.email"
              class="mr-1 ml-1 mb-1 mt-1 inline breakgrid"
              is-thumbnail
              size="sm"
            />
            <strong>{{ user.email }}</strong>
            <span class="small">
              <v-icon icon="hashtag" scale="0.75" class="text-muted" />{{
                user.id
              }}
            </span>
          </span>
          <span> posted {{ timeago(story.date) }} </span>
          <span>
            <v-icon icon="hashtag" scale="0.75" class="text-muted" />{{
              story.id
            }}
          </span>
        </div>
      </b-card-header>
      <b-card-body>
        <!-- eslint-disable-next-line -->
        <h3>{{ story.headline }}</h3>
        <div class="d-flex font-weight-bold">
          {{ story.story }}
          <b-img v-if="story.image" thumbnail :src="story.image.paththumb" />
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
            class="mr-2 mb-1"
            @click="dontUseForPublicity"
          >
            <v-icon icon="times" /> Hide
          </b-button>
          <div v-if="story.public">
            <b-button
              v-if="newsletter"
              variant="primary"
              class="mr-2 mb-1"
              @click="useForNewsletter"
            >
              <v-icon icon="check" /> Good for newsletter
            </b-button>
            <b-button
              v-else
              variant="primary"
              class="mr-2 mb-1"
              @click="useForPublicity"
            >
              <v-icon icon="check" /> Good for publicity
            </b-button>
          </div>
          <ChatButton
            v-if="story.userid"
            :userid="story.userid"
            title="Chat"
            variant="white"
            class="mr-2 mb-1"
          />
        </div>
      </b-card-footer>
    </b-card>
  </div>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '~/stores/user'

const { $api } = useNuxtApp()
const userStore = useUserStore()

const props = defineProps({
  story: {
    type: Object,
    required: true,
  },
  newsletter: {
    type: Boolean,
    required: false,
    default: false,
  },
})

const show = ref(true)

const user = computed(() => {
  return props.story.userid ? userStore.byId(props.story.userid) : null
})

onMounted(async () => {
  if (props.story.userid) {
    await userStore.fetch(props.story.userid)
  }
})

async function useForNewsletter() {
  await $api.stories.useForNewsletter(props.story.id)
  show.value = false
}

async function useForPublicity() {
  await $api.stories.useForPublicity(props.story.id)
  show.value = false
}

async function dontUseForPublicity() {
  await $api.stories.dontUseForPublicity(props.story.id)
  show.value = false
}
</script>
