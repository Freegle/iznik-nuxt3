<template>
  <div>
    <b-card v-if="event" no-body>
      <b-card-title
        class="bg-light px-2 mb-0 pt-2 pb-2 d-flex justify-content-between header--size4"
        :title-tag="titleTag"
      >
        <nuxt-link
          no-prefetch
          :to="'/communityevent/' + event.id"
          class="event__link text-truncate"
        >
          {{ event.title }}
        </nuxt-link>
        <nuxt-link
          v-if="!summary"
          no-prefetch
          :to="'/communityevent/' + event.id"
          class="event__link small text-muted"
        >
          #{{ event.id }}
        </nuxt-link>
      </b-card-title>
      <b-card-body class="p-1 pt-0">
        <div v-if="summary">
          <div class="d-flex">
            <p class="text-truncate mb-0">
              <v-icon icon="info-circle" class="fa-fw" />
              {{ description }}
            </p>
          </div>
          <div v-if="event.earliestDate" class="d-flex">
            <p class="text-truncate mb-0 text-muted">
              <v-icon icon="clock" class="fa-fw" />
              {{ event.earliestDate.string.start }} -
              {{ event.earliestDate.string.end }}
            </p>
          </div>
          <div v-if="event.location" class="d-flex">
            <p class="text-truncate mb-0">
              <v-icon icon="map-marker-alt" class="fa-fw" />
              <span class="ml-1 small">
                {{ event.location }}
              </span>
            </p>
          </div>
          <div class="text-center mt-2 mb-2">
            <b-button
              variant="secondary"
              size="sm"
              :aria-label="
                'More info about ' + event.title + ' community event'
              "
              @click="showEventModal"
            >
              <v-icon icon="info-circle" /> More info
            </b-button>
          </div>
          <NuxtPicture
            v-if="event?.image?.externaluid"
            format="webp"
            fit="cover"
            provider="uploadcare"
            :src="event.image.externaluid"
            :modifiers="event.image.externalmods"
            alt="Community Event Photo"
            class="w-100"
          />
          <b-img
            v-else-if="event.image"
            lazy
            class="w-100"
            :src="event.image.path"
          />
        </div>
        <div v-else class="event">
          <div class="event__body">
            <div v-if="event.earliestDate" class="d-flex flex-row mt-2">
              <v-icon icon="clock" class="fa-fw mt-1" />
              <div class="ml-2">
                {{ event.earliestDate.string.start }} -
                {{ event.earliestDate.string.end }}
              </div>
            </div>
            <div v-if="event.location" class="d-flex flex-row mt-2">
              <v-icon icon="map-marker-alt" class="fa-fw mt-1" />
              <div class="ml-2 small">
                {{ event.location }}
              </div>
            </div>
            <div
              v-if="event.groups && event.groups.length > 0"
              class="d-flex flex-row mt-1"
            >
              <v-icon icon="users" class="fa-fw mt-1" />
              <div class="ml-2 small">
                Posted on
                <span v-for="(group, index) in groups" :key="index">
                  <span v-if="index > 0">, </span>
                  {{ group.namedisplay }}
                </span>
              </div>
            </div>
            <read-more
              v-if="description"
              :text="description"
              :max-chars="300"
              class="ml-1 font-weight-bold preline forcebreak nopara mt-1"
            />
            <div class="mt-2 mb-2 ml-1">
              <b-button
                variant="secondary"
                :aria-label="
                  'More info about ' + event.title + ' community event'
                "
                @click="showEventModal"
              >
                <v-icon icon="info-circle" /> More info
              </b-button>
            </div>
          </div>
          <b-img
            v-if="event.image"
            lazy
            :src="event.image.path"
            rounded
            thumbnail
            class="square"
            generator-unable-to-provide-required-alt=""
            title="Opportunity photo"
          />
        </div>
      </b-card-body>
    </b-card>
    <CommunityEventModal
      v-if="showModal"
      :id="id"
      @hidden="showModal = false"
    />
  </div>
</template>
<script>
import { useCommunityEventStore } from '../stores/communityevent'
import { useUserStore } from '../stores/user'
import { useGroupStore } from '../stores/group'
import ReadMore from '~/components/ReadMore'
import { twem } from '~/composables/useTwem'
const CommunityEventModal = defineAsyncComponent(() =>
  import('./CommunityEventModal')
)

export default {
  components: {
    CommunityEventModal,
    ReadMore,
  },
  props: {
    summary: {
      type: Boolean,
      required: true,
    },
    id: {
      type: Number,
      required: true,
    },
    filterGroup: {
      type: Number,
      required: false,
      default: null,
    },
    titleTag: {
      type: String,
      required: false,
      default: 'h3',
    },
  },
  async setup(props) {
    const communityEventStore = useCommunityEventStore()
    const userStore = useUserStore()
    const groupStore = useGroupStore()

    if (props.id) {
      const v = await communityEventStore.fetch(props.id)

      if (v) {
        await userStore.fetch(v.userid)

        v.groups?.forEach(async (id) => {
          await groupStore.fetch(id)
        })
      }
    }

    return {
      communityEventStore,
      userStore,
      groupStore,
    }
  },
  data() {
    return {
      renewed: false,
      showModal: false,
    }
  },
  computed: {
    event() {
      const v = this.communityEventStore?.byId(this.id)

      if (v) {
        if (!this.filterGroup) {
          return v
        }

        if (v.groups.includes(this.filterGroup)) {
          return v
        }
      }

      return null
    },
    groups() {
      const ret = []
      this.event?.groups?.forEach((id) => {
        const group = this.groupStore?.get(id)

        if (group) {
          ret.push(group)
        }
      })

      return ret
    },
    user() {
      return this.userStore?.byId(this.event?.userid)
    },
    description() {
      let desc = this.event?.description
      desc = desc ? twem(desc) : ''
      desc = desc.trim()
      return desc
    },
    warning() {
      const added = new Date(this.event?.added).getTime()
      const renewed = new Date(this.event?.renewed).getTime()
      const now = Date.now()

      let warn = false

      if (renewed) {
        warn = now - renewed > 31 * 24 * 60 * 60 * 1000
      } else {
        warn = now - added > 31 * 24 * 60 * 60 * 1000
      }

      return warn
    },
    mine() {
      return this.user?.id === this.myid
    },
  },
  methods: {
    showEventModal() {
      this.showModal = true
    },
  },
}
</script>
<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins/_breakpoints';

.square {
  object-fit: cover;
  width: 200px;
  height: 200px;
}

.event__link {
  color: $color-blue--2;
}

.event {
  display: flex;
  flex-direction: column;

  @include media-breakpoint-up(sm) {
    flex-direction: row;
  }
}

.event__body {
  flex-grow: 1;
}
</style>
