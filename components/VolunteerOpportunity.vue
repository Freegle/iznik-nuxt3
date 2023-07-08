<template>
  <div>
    <b-card v-if="volunteering" variant="success" no-body>
      <b-card-title
        class="bg-light px-2 mb-0 pt-2 pb-2 d-flex justify-content-between header--size4"
        :title-tag="titleTag"
      >
        <nuxt-link
          :to="'/volunteering/' + volunteering.id"
          class="volunteerop__link text-truncate"
          no-prefetch
        >
          {{ volunteering.title }}
        </nuxt-link>
        <nuxt-link
          v-if="!summary"
          :to="'/volunteering/' + volunteering.id"
          no-prefetch
          class="volunteerop__link small text-muted"
        >
          #{{ volunteering.id }}
        </nuxt-link>
      </b-card-title>
      <b-card-body class="p-1 pt-0">
        <div v-if="mine && !renewed && !summary">
          <notice-message v-if="warning" variant="warning" class="mb-1">
            <span v-if="volunteering.expired">
              We've stopped showing this opportunity, but you can reactivate it.
            </span>
            <span v-else>
              We'll stop showing this opportunity soon unless you tell us it's
              still active. Please click to let us know.
            </span>
          </notice-message>
          <notice-message v-else class="mb-1">
            <span v-if="volunteering.expired">
              We've stopped showing this opportunity, but you can reactivate it.
            </span>
            <span v-else>
              You created this opportunity. Please click to let us know if it's
              still active.
            </span>
          </notice-message>
          <b-button variant="primary" class="mr-2" @click="renew">
            <v-icon icon="check" /> Yes, it's still active
          </b-button>
          <b-button variant="secondary" @click="expire">
            <v-icon icon="trash-alt" /> No, please remove it
          </b-button>
        </div>
        <div v-if="summary" class="pt-1">
          <div class="d-flex">
            <p class="text-truncate mb-0">
              <v-icon icon="info-circle" class="fa-fw" />
              {{ description }}
            </p>
          </div>
          <div v-if="volunteering.earliestDate">
            <div class="d-flex">
              <p class="text-truncate mb-0">
                <v-icon icon="clock" class="fa-fw" />
                {{ volunteering.earliestDate.string.start }} -
                {{ volunteering.earliestDate.string.end }}
              </p>
            </div>
          </div>
          <div v-if="volunteering.location">
            <span class="d-flex">
              <p class="text-truncate mb-0">
                <v-icon icon="map-marker-alt" class="fa-fw" />
                <span class="small ml-1">
                  {{ volunteering.location }}
                </span>
              </p>
            </span>
          </div>
          <div class="text-center mt-2 mb-2">
            <b-button
              variant="secondary"
              size="sm"
              :aria-label="
                'More info about ' +
                volunteering.title +
                ' volunteering opportunity'
              "
              @click="showOpportunityModal"
            >
              <v-icon icon="info-circle" /> More info
            </b-button>
          </div>
          <b-img
            v-if="volunteering.image"
            lazy
            class="w-100"
            :src="volunteering.image.path"
          />
        </div>
        <div v-else class="volunteerop">
          <div class="volunteerop__body">
            <div v-if="volunteering.earliestDate" class="d-flex flex-row mt-2">
              <v-icon icon="clock" class="fa-fw mt-1" />
              <div class="ml-2">
                {{ volunteering.earliestDate.string.start }} -
                {{ volunteering.earliestDate.string.end }}
              </div>
            </div>
            <div v-if="volunteering.location" class="d-flex flex-row mt-2">
              <v-icon icon="map-marker-alt" class="fa-fw mt-1" />
              <div class="ml-2 small">
                {{ volunteering.location }}
              </div>
            </div>
            <div
              v-if="volunteering.groups && volunteering.groups.length > 0"
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
                  'More info about ' +
                  volunteering.title +
                  ' volunteering opportunity'
                "
                @click="showOpportunityModal"
              >
                <v-icon icon="info-circle" /> More info
              </b-button>
            </div>
          </div>
          <b-img
            v-if="volunteering.image"
            lazy
            :src="volunteering.image.path"
            rounded
            thumbnail
            class="square"
            generator-unable-to-provide-required-alt=""
            title="Opportunity photo"
          />
        </div>
      </b-card-body>
    </b-card>
    <VolunteerOpportunityModal
      v-if="showModal"
      :id="id"
      ref="opportunitymodal"
    />
  </div>
</template>
<script>
import ReadMore from 'vue-read-more3/src/ReadMoreComponent'
import { useVolunteeringStore } from '../stores/volunteering'
import { useUserStore } from '../stores/user'
import { useGroupStore } from '../stores/group'
import NoticeMessage from './NoticeMessage'
import { twem } from '~/composables/useTwem'
const VolunteerOpportunityModal = () => import('./VolunteerOpportunityModal')

export default {
  components: {
    NoticeMessage,
    VolunteerOpportunityModal,
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
    const volunteeringStore = useVolunteeringStore()
    const userStore = useUserStore()
    const groupStore = useGroupStore()

    if (props.id) {
      const v = await volunteeringStore.fetch(props.id)
      if (v) {
        await userStore.fetch(v.userid)

        v.groups?.forEach(async (id) => {
          await groupStore.fetch(id)
        })
      }
    }

    return {
      volunteeringStore,
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
    volunteering() {
      const v = this.volunteeringStore?.byId(this.id)

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
      this.volunteering?.groups?.forEach((id) => {
        const group = this.groupStore?.get(id)

        if (group) {
          ret.push(group)
        }
      })

      return ret
    },
    user() {
      return this.userStore?.byId(this.volunteering?.userid)
    },
    description() {
      let desc = this.volunteering?.description
      desc = desc ? twem(desc) : ''
      desc = desc.trim()
      return desc
    },
    warning() {
      const added = new Date(this.volunteering?.added).getTime()
      const renewed = new Date(this.volunteering?.renewed).getTime()
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
      return this.user.id === this.myid
    },
  },
  methods: {
    async showOpportunityModal() {
      this.showModal = true
      await this.waitForRef('opportunitymodal')
      this.$refs.opportunitymodal.show()
    },
    async renew() {
      await this.volunteeringStore.renew(this.volunteering.id)
      this.renewed = true
    },
    expire() {
      this.volunteeringStore.expire(this.volunteering.id)
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

.volunteerop__link {
  color: $color-blue--2;
}

.volunteerop {
  display: flex;
  flex-direction: column;

  @include media-breakpoint-up(sm) {
    flex-direction: row;
  }
}

.volunteerop__body {
  flex-grow: 1;
}
</style>
