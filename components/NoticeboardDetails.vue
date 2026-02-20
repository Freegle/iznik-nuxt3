<template>
  <div>
    <h1 class="text-center">
      {{ noticeboard?.name }}
    </h1>
    <b-card v-if="noticeboard" no-body>
      <b-card-body>
        <client-only>
          <l-map
            ref="map"
            :zoom="14"
            :max-zoom="maxZoom"
            :center="center"
            :style="'width: 100%; height: 200px'"
          >
            <l-tile-layer :url="osmtile()" :attribution="attribution()" />
            <l-marker
              :lat-lng="[noticeboard.lat, noticeboard.lng]"
              :interactive="false"
            />
          </l-map>
        </client-only>
        <div v-if="noticeboard.description">
          <NoticeMessage class="mb-2">
            {{ noticeboard.description }}
          </NoticeMessage>
        </div>
        <h2>Keep spreading the word!</h2>
        <p>
          Can you help us by printing out and putting up another poster if there
          isn't one already? Please let us know.
        </p>
        <div class="d-flex flex-wrap justify-content-between">
          <SpinButton
            icon-name="check"
            variant="primary"
            size="lg"
            label="I put up a poster!"
            class="mb-2"
            @handle="putup"
          />
          <b-button
            variant="secondary"
            size="lg"
            to="/posters/A4.jpg"
            class="mb-2"
          >
            <v-icon icon="download" /> Download the poster
          </b-button>
          <SpinButton
            icon-name="times"
            variant="secondary"
            size="lg"
            label="Please ask someone else"
            class="mb-2"
            @handle="shutup"
          />
        </div>
        <b-form>
          <label for="noticeboard-comments">Comments</label>
          <p>Got new information about how to access this or where it is?</p>
          <b-form-textarea
            id="noticeboard-comments"
            v-model="comments"
            class="mt-2"
            placeholder="Please enter any new information or comments about this noticeboard."
          />
          <SpinButton
            variant="secondary"
            icon-name="save"
            label="Save comments"
            class="mt-2"
            @handle="saveComments"
          />
        </b-form>
        <p class="mt-3">
          If this noticeboard is no longer active, please let us know:
        </p>
        <SpinButton
          variant="secondary"
          icon-name="trash-alt"
          label="Noticeboard no longer active"
          @handle="dead"
        />
        <hr />
        <h2 class="mt-2">History</h2>
        <NoticeboardCheck
          v-for="check in noticeboard.checks"
          :key="'check-' + check.id"
          :noticeboard="noticeboard"
          :check="check"
        />
        <div v-if="added" class="d-flex justify-content-between">
          <div>
            {{ added }}
          </div>
          <div>
            Added
            <span v-if="noticeboard.addedbyuser">
              by {{ noticeboard.addedbyuser.displayname }}
            </span>
          </div>
        </div>
      </b-card-body>
    </b-card>
  </div>
</template>
<script setup>
import { ref, computed } from 'vue'
import dayjs from 'dayjs'
import NoticeMessage from './NoticeMessage'
import SpinButton from './SpinButton'
import NoticeboardCheck from './NoticeboardCheck'
import { useNoticeboardStore } from '~/stores/noticeboard'
import { attribution, osmtile } from '~/composables/useMap'
import { MAX_MAP_ZOOM } from '~/constants'

const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
})

// Refs
const map = ref(null)
const comments = ref(null)

// Store setup
const noticeboardStore = useNoticeboardStore()

// Fetch data
await noticeboardStore.fetch(props.id)

// Computed properties
const noticeboard = computed(() => {
  return noticeboardStore.byId(props.id)
})

const center = computed(() => {
  if (noticeboard.value) {
    return [noticeboard.value?.lat, noticeboard.value?.lng]
  } else {
    return [53.945, -2.5209]
  }
})

const maxZoom = computed(() => {
  return MAX_MAP_ZOOM
})

const added = computed(() => {
  return noticeboard.value
    ? dayjs(noticeboard.value.added).format('Do MMMM, YYYY')
    : null
})

// Methods
async function putup(callback) {
  await noticeboardStore.refresh(props.id)
  callback()
}

async function shutup(callback) {
  await noticeboardStore.decline(props.id)
  callback()
}

async function dead(callback) {
  await noticeboardStore.inactive(props.id)
  callback()
}

async function saveComments(callback) {
  await noticeboardStore.saveComments(props.id, comments.value)
  callback()
}
</script>
