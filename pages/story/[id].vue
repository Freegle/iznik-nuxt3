<template>
  <client-only>
    <div>
      <b-row v-if="invalid" class="m-0">
        <b-col cols="12" lg="6" class="p-0" offset-lg="3">
          <NoticeMessage variant="danger" class="mt-2">
            Sorry, that story isn't around any more.
          </NoticeMessage>
        </b-col>
      </b-row>
      <b-row v-else class="m-0">
        <b-col cols="0" lg="3" class="d-none d-lg-block" />
        <b-col cols="12" lg="6" class="p-0">
          <div class="bg-white p-4">
            <p>
              We love to hear why you freegle and what your experiences have
              been - and it helps show new freeglers what it's all about.
            </p>
            <p>So please tell us your story!</p>
            <b-button variant="primary" @click="showAddModal">
              <v-icon icon="book-open" /> Tell us your story!
            </b-button>
          </div>
          <StoryOne :id="story.id" class="mt-2" />
          <b-button variant="secondary" to="/stories" class="mt-2">
            View more stories
          </b-button>
        </b-col>
        <b-col cols="0" lg="3" class="d-none d-lg-block" />
      </b-row>
      <StoryAddModal
        v-if="showStoryAddModal"
        @hidden="showStoryAddModal = false"
      />
    </div>
  </client-only>
</template>
<script setup>
import { useRoute } from 'vue-router'
import { buildHead } from '~/composables/useBuildHead'
import { useStoryStore } from '~/stores/stories'
import { ref, defineAsyncComponent, useHead, useRuntimeConfig } from '#imports'
import NoticeMessage from '~/components/NoticeMessage'
import StoryOne from '~/components/StoryOne'

const StoryAddModal = defineAsyncComponent(() =>
  import('~/components/StoryAddModal')
)

const runtimeConfig = useRuntimeConfig()
const route = useRoute()
const storyStore = useStoryStore()

const id = parseInt(route.params.id)

const invalid = ref(false)
const story = ref(null)

try {
  story.value = await storyStore.fetch(id)
} catch (e) {
  invalid.value = true
}

if (invalid.value) {
  useHead(buildHead(route, runtimeConfig, 'Story #' + id))
} else {
  useHead(
    buildHead(
      route,
      runtimeConfig,
      story.value
        ? 'Freegle Story: ' + story.value.headline
        : 'Freegle Stories',
      story.value.story,
      story.value.image
    )
  )
}

const showStoryAddModal = ref(false)

function showAddModal() {
  showStoryAddModal.value = true
}
</script>
