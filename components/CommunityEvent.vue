<template>
  <div v-if="event" class="event-card">
    <component :is="titleTag" class="event-card__header">
      <nuxt-link
        no-prefetch
        :to="'/communityevent/' + event.id"
        class="event-card__title"
      >
        {{ event.title }}
      </nuxt-link>
      <span v-if="!summary" class="event-card__id">#{{ event.id }}</span>
    </component>

    <div class="event-card__body">
      <div v-if="summary" class="event-card__summary">
        <p v-if="description" class="event-card__desc">
          {{ description }}
        </p>
        <div class="event-card__meta">
          <div v-if="event.earliestDate" class="event-card__meta-item">
            <v-icon icon="clock" />
            <span
              >{{ event.earliestDate.string.start }} -
              {{ event.earliestDate.string.end }}</span
            >
          </div>
          <div v-if="event.location" class="event-card__meta-item">
            <v-icon icon="map-marker-alt" />
            <span>{{ event.location }}</span>
          </div>
        </div>
        <div class="event-card__actions">
          <b-button
            variant="secondary"
            size="sm"
            :aria-label="'More info about ' + event.title + ' community event'"
            @click="showEventModal"
          >
            <v-icon icon="info-circle" /> More info
          </b-button>
        </div>
        <div
          v-if="event.image"
          class="event-card__image event-card__image--full"
        >
          <OurUploadedImage
            v-if="event?.image?.ouruid"
            :src="event.image.ouruid"
            :modifiers="event.image.externalmods"
            alt="Community Event Photo"
          />
          <NuxtPicture
            v-else-if="event?.image?.externaluid"
            format="webp"
            fit="cover"
            provider="uploadcare"
            :src="event.image.externaluid"
            :modifiers="event.image.externalmods"
            alt="Community Event Photo"
          />
          <b-img v-else lazy :src="event.image.path" />
        </div>
      </div>

      <div v-else class="event-card__detail">
        <div class="event-card__content">
          <div class="event-card__meta">
            <div v-if="event.earliestDate" class="event-card__meta-item">
              <v-icon icon="clock" />
              <span
                >{{ event.earliestDate.string.start }} -
                {{ event.earliestDate.string.end }}</span
              >
            </div>
            <div v-if="event.location" class="event-card__meta-item">
              <v-icon icon="map-marker-alt" />
              <span>{{ event.location }}</span>
            </div>
            <div
              v-if="event.groups && event.groups.length > 0"
              class="event-card__meta-item"
            >
              <v-icon icon="users" />
              <span>
                Posted on
                <span v-for="(group, index) in groups" :key="index">
                  <span v-if="index > 0">, </span>
                  {{ group.namedisplay }}
                </span>
              </span>
            </div>
          </div>
          <read-more
            v-if="description"
            :text="description"
            :max-chars="300"
            class="event-card__description"
          />
          <div class="event-card__actions">
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
        <div v-if="event.image" class="event-card__image">
          <OurUploadedImage
            v-if="event?.image?.ouruid"
            :src="event.image.ouruid"
            :modifiers="event.image.externalmods"
            alt="Community Event Photo"
          />
          <NuxtPicture
            v-else-if="event?.image?.externaluid"
            format="webp"
            fit="cover"
            provider="uploadcare"
            :src="event.image.externaluid"
            :modifiers="event.image.externalmods"
            alt="Community Event Photo"
          />
          <b-img v-else lazy :src="event.image.path" />
        </div>
      </div>
    </div>

    <CommunityEventModal
      v-if="showModal"
      :id="id"
      @hidden="showModal = false"
    />
  </div>
</template>
<script setup>
import { ref, computed, defineAsyncComponent } from 'vue'
import { useCommunityEventStore } from '~/stores/communityevent'
import { useUserStore } from '~/stores/user'
import { useGroupStore } from '~/stores/group'
import ReadMore from '~/components/ReadMore'
import { twem } from '~/composables/useTwem'

const CommunityEventModal = defineAsyncComponent(() =>
  import('./CommunityEventModal')
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

// Store references
const communityEventStore = useCommunityEventStore()
const userStore = useUserStore()
const groupStore = useGroupStore()

// State
const showModal = ref(false)

// Fetch data
if (props.id) {
  const v = await communityEventStore.fetch(props.id)

  if (v) {
    await userStore.fetch(v.userid)

    v.groups?.forEach(async (id) => {
      await groupStore.fetch(id)
    })
  }
}

// Computed properties
const event = computed(() => {
  const v = communityEventStore?.byId(props.id)

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
  event.value?.groups?.forEach((id) => {
    const group = groupStore?.get(id)

    if (group) {
      ret.push(group)
    }
  })

  return ret
})

const description = computed(() => {
  let desc = event.value?.description
  desc = desc ? twem(desc) : ''
  desc = desc.trim()
  return desc
})

// Methods
function showEventModal() {
  showModal.value = true
}
</script>
<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins/_breakpoints';
@import 'assets/css/_color-vars.scss';

.event-card {
  background: white;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.event-card__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  margin: 0;
  border-bottom: 1px solid $gray-200;
  font-size: 1.1rem;
  font-weight: 600;
}

.event-card__title {
  flex: 1;
  min-width: 0;
  color: $color-blue--base;
  text-decoration: none;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &:hover {
    text-decoration: underline;
  }
}

.event-card__id {
  color: $gray-500;
  font-size: 0.85rem;
  font-weight: normal;
  flex-shrink: 0;
  margin-left: 0.5rem;
}

.event-card__body {
  padding: 1rem;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.event-card__desc {
  font-size: 0.9375rem;
  color: $gray-700;
  margin: 0 0 0.75rem 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.event-card__meta {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.event-card__meta-item {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: $gray-600;

  svg {
    flex-shrink: 0;
    margin-top: 0.2rem;
    color: $gray-500;
  }
}

.event-card__description {
  font-size: 0.9375rem;
  line-height: 1.6;
  color: $gray-700;
  margin-bottom: 1rem;
  flex: 1;

  :deep(p) {
    display: -webkit-box;
    -webkit-line-clamp: 5;
    -webkit-box-orient: vertical;
    overflow: hidden;
    white-space: pre-wrap;
    word-break: break-word;
  }
}

.event-card__detail {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  flex: 1;

  @include media-breakpoint-up(md) {
    flex-direction: row;
  }
}

.event-card__content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.event-card__actions {
  margin-top: auto;
  margin-bottom: 0;
  padding-top: 0.5rem;
}

.event-card__image {
  flex-shrink: 0;

  :deep(img) {
    object-fit: cover;
    width: 100%;
    max-width: 200px;
  }

  &--full {
    :deep(img) {
      width: 100%;
      max-width: none;
    }
  }
}

.event-card__summary {
  .event-card__actions {
    text-align: center;
  }
}
</style>
