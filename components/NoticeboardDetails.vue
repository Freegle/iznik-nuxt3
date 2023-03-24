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
            :center="center"
            :style="'width: 100%; height: 200px'"
          >
            <l-tile-layer :url="osmtile" :attribution="attribution" />
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
            name="check"
            variant="primary"
            size="lg"
            :handler="putup"
            label="I put up a poster!"
            class="mb-2"
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
            name="times"
            variant="secondary"
            size="lg"
            :handler="shutup"
            label="Please ask someone else"
            class="mb-2"
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
            name="save"
            :handler="saveComments"
            label="Save comments"
            class="mt-2"
          />
        </b-form>
        <p class="mt-3">
          If this noticeboard is no longer active, please let us know:
        </p>
        <SpinButton
          variant="secondary"
          name="trash-alt"
          :handler="dead"
          label="Noticeboard no longer active"
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
            <span v-if="noticeboard.addedby">
              by {{ noticeboard.addedby.displayname }}
            </span>
          </div>
        </div>
      </b-card-body>
    </b-card>
  </div>
</template>
<script>
import dayjs from 'dayjs'
import { useNoticeboardStore } from '../stores/noticeboard'
import NoticeMessage from './NoticeMessage'
import SpinButton from './SpinButton'
import NoticeboardCheck from './NoticeboardCheck'
import { attribution, osmtile } from '~/composables/useMap'

export default {
  components: { NoticeboardCheck, SpinButton, NoticeMessage },
  props: {
    id: {
      type: Number,
      required: true,
    },
  },
  async setup(props) {
    const noticeboardStore = useNoticeboardStore()
    await noticeboardStore.fetch(props.id)

    const noticeboard = computed(() => {
      return noticeboardStore.byId(props.id)
    })

    const center = computed(() => {
      console.log('compute centre', noticeboard)
      if (noticeboard) {
        return [noticeboard?.value?.lat, noticeboard?.value?.lng]
      } else {
        return [53.945, -2.5209]
      }
    })

    return {
      noticeboardStore,
      osmtile: osmtile(),
      attribution: attribution(),
      noticeboard,
      center,
    }
  },
  data() {
    return {
      comments: null,
    }
  },
  computed: {
    added() {
      return this.noticeboard
        ? dayjs(this.noticeboard.added).format('Do MMMM, YYYY')
        : null
    },
  },
  methods: {
    async putup() {
      await this.noticeboardStore.refresh(this.id)
    },
    async shutup() {
      await this.noticeboardStore.decline(this.id)
    },
    async dead() {
      await this.noticeboardStore.inactive(this.id)
    },
    async saveComments() {
      await this.noticeboardStore.saveComments(this.id, this.comments)
    },
  },
}
</script>
