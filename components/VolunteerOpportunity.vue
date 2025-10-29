<template>
  <div>
    <b-card v-if="volunteering" no-body>
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
          <div class="image-wrapper summary">
            <OurUploadedImage
              v-if="volunteering?.image?.ouruid"
              :src="volunteering.image.ouruid"
              :modifiers="volunteering.image.externalmods"
              alt="Volunteering Opportunity Photo"
              class="mb-2"
            />
            <NuxtPicture
              v-else-if="volunteering?.image?.externaluid"
              fit="cover"
              format="webp"
              provider="uploadcare"
              :src="volunteering.image.externaluid"
              :modifiers="volunteering.image.externalmods"
              alt="Volunteering Opportunity Photo"
              class="mb-2"
            />
            <b-img
              v-else-if="volunteering.image"
              lazy
              :src="volunteering.image.path"
            />
          </div>
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
          <div class="image-wrapper">
            <OurUploadedImage
              v-if="volunteering?.image?.ouruid"
              :src="volunteering.image.ouruid"
              :modifiers="volunteering.image.externalmods"
              alt="Volunteering Opportunity Photo"
              class="mb-2"
            />
            <NuxtPicture
              v-else-if="volunteering?.image?.externaluid"
              fit="cover"
              format="webp"
              provider="uploadcare"
              :src="volunteering.image.externaluid"
              :modifiers="volunteering.image.externalmods"
              alt="Volunteering Opportunity Photo"
              class="mb-2"
            />
            <b-img
              v-else-if="volunteering.image"
              lazy
              :src="volunteering.image.path"
            />
          </div>
        </div>
      </b-card-body>
    </b-card>
    <VolunteerOpportunityModal
      v-if="showModal"
      :id="id"
      @hidden="showModal = false"
    />
  </div>
</template>
<script setup>
import { ref, computed, defineAsyncComponent } from 'vue'
import NoticeMessage from './NoticeMessage'
import { useVolunteeringStore } from '~/stores/volunteering'
import { useUserStore } from '~/stores/user'
import { useGroupStore } from '~/stores/group'
import { useAuthStore } from '~/stores/auth'
import ReadMore from '~/components/ReadMore'
import { twem } from '~/composables/useTwem'

const VolunteerOpportunityModal = defineAsyncComponent(() =>
  import('./VolunteerOpportunityModal')
)

const props = defineProps({
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
})

const volunteeringStore = useVolunteeringStore()
const userStore = useUserStore()
const groupStore = useGroupStore()
const authStore = useAuthStore()
const myid = computed(() => authStore.user?.id)

const renewed = ref(false)
const showModal = ref(false)

// Initialize data from props
if (props.id) {
  const v = await volunteeringStore.fetch(props.id)
  if (v) {
    await userStore.fetch(v.userid)

    v.groups?.forEach(async (id) => {
      await groupStore.fetch(id)
    })
  }
}

// Computed properties
const volunteering = computed(() => {
  const v = volunteeringStore?.byId(props.id)

  if (v) {
    if (!props.filterGroup) {
      return v
    }

    if (v.groups.includes(props.filterGroup)) {
      return v
    }
  }

  return null
})

const groups = computed(() => {
  const ret = []
  volunteering.value?.groups?.forEach((id) => {
    const group = groupStore?.get(id)

    if (group) {
      ret.push(group)
    }
  })

  return ret
})

const user = computed(() => {
  return userStore?.byId(volunteering.value?.userid)
})

const description = computed(() => {
  let desc = volunteering.value?.description
  desc = desc ? twem(desc) : ''
  desc = desc.trim()
  return desc
})

const warning = computed(() => {
  const added = new Date(volunteering.value?.added).getTime()
  const renewed = new Date(volunteering.value?.renewed).getTime()
  const now = Date.now()

  let warn = false

  if (renewed) {
    warn = now - renewed > 31 * 24 * 60 * 60 * 1000
  } else {
    warn = now - added > 31 * 24 * 60 * 60 * 1000
  }

  return warn
})

const mine = computed(() => {
  return user.value?.id === myid.value
})

// Methods
function showOpportunityModal() {
  showModal.value = true
}

async function renew() {
  await volunteeringStore.renew(volunteering.value.id)
  renewed.value = true
}

function expire() {
  volunteeringStore.expire(volunteering.value.id)
}
</script>
<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins/_breakpoints';

.image-wrapper {
  :deep(img) {
    object-fit: cover;
    width: 200px;
  }

  &.summary {
    :deep(img) {
      width: 100%;
      height: unset;
    }
  }
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
