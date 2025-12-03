<template>
  <div v-if="volunteering" class="volunteer-opportunity">
    <div class="opportunity-header">
      <span class="type-badge">
        <v-icon icon="hand-holding-heart" class="me-1" />
        Volunteering opportunity
      </span>
    </div>

    <h3 class="opportunity-title">{{ volunteering.title }}</h3>

    <div class="opportunity-meta">
      <span class="meta-item">
        {{ addedago }}
      </span>
      <span v-if="volunteering.groups?.length" class="meta-item">
        on
        <span v-for="(groupid, index) in volunteering.groups" :key="groupid">
          <span v-if="index > 0">, </span>
          <span v-if="group(groupid)">{{ group(groupid).namedisplay }}</span>
        </span>
      </span>
    </div>

    <div class="opportunity-content">
      <div class="opportunity-details">
        <div v-if="volunteering.description" class="detail-row">
          <v-icon icon="info-circle" class="detail-icon" />
          <span class="detail-text">{{ volunteering.description }}</span>
        </div>
        <div v-if="volunteering.location" class="detail-row">
          <v-icon icon="map-marker-alt" class="detail-icon" />
          <span class="detail-text">{{ volunteering.location }}</span>
        </div>
      </div>

      <div
        v-if="volunteering.image"
        class="opportunity-photo clickme"
        @click="moreInfo"
      >
        <OurUploadedImage
          v-if="volunteering.image?.ouruid"
          :src="volunteering.image?.ouruid"
          :modifiers="volunteering.image?.externalmods"
          alt="Volunteering Opportunity Photo"
        />
        <NuxtPicture
          v-else-if="volunteering.image?.externaluid"
          fit="cover"
          format="webp"
          provider="uploadcare"
          :src="volunteering.image?.externaluid"
          :modifiers="volunteering.image?.externalmods"
          alt="Volunteering Opportunity Photo"
        />
        <b-img
          v-else-if="volunteering.image.paththumb"
          lazy
          :src="volunteering.image.paththumb"
        />
      </div>
    </div>

    <div class="opportunity-actions">
      <b-button variant="primary" size="sm" @click="moreInfo">
        <v-icon icon="info-circle" /> More info
      </b-button>
      <b-button variant="link" size="sm" @click="addOpportunity">
        <v-icon icon="plus" /> Add yours
      </b-button>
    </div>

    <hr class="my-2" />

    <NewsLoveComment
      :newsfeed="newsfeed"
      @focus-comment="$emit('focus-comment')"
    />

    <VolunteerOpportunityModal
      v-if="showAddOpportunity"
      :start-edit="true"
      @hidden="showAddOpportunity"
    />
    <VolunteerOpportunityModal
      v-if="showMoreInfo"
      :id="newsfeed.volunteeringid"
      @hidden="showMoreInfo = false"
    />
  </div>
</template>
<script setup>
import { ref, computed, defineAsyncComponent } from 'vue'
import { useVolunteeringStore } from '~/stores/volunteering'
import { useNewsfeedStore } from '~/stores/newsfeed'
import { useUserStore } from '~/stores/user'
import { useGroupStore } from '~/stores/group'
import { timeago } from '~/composables/useTimeFormat'
import NewsLoveComment from '~/components/NewsLoveComment'

const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
})

const emit = defineEmits(['focus-comment', 'hide'])

const VolunteerOpportunityModal = defineAsyncComponent(() =>
  import('./VolunteerOpportunityModal')
)

// Store setup
const volunteeringStore = useVolunteeringStore()
const newsfeedStore = useNewsfeedStore()
const userStore = useUserStore()
const groupStore = useGroupStore()

// Reactive state
const showAddOpportunity = ref(false)
const showMoreInfo = ref(false)

// Computed properties
const newsfeed = computed(() => {
  return newsfeedStore.byId(props.id)
})

const volunteering = computed(() => {
  return volunteeringStore?.byId(newsfeed.value?.volunteeringid)
})

const addedago = computed(() => {
  return timeago(newsfeed.value?.added)
})

// Methods
function moreInfo() {
  showMoreInfo.value = true
}

function addOpportunity() {
  showAddOpportunity.value = true
}

function group(groupid) {
  return groupStore?.get(groupid)
}

// Fetch data
try {
  const currentNewsfeed = newsfeedStore.byId(props.id)
  await userStore.fetch(currentNewsfeed.userid)

  const volunteeringData = await volunteeringStore.fetch(
    currentNewsfeed.volunteeringid
  )

  if (volunteeringData?.groups) {
    for (const groupid of volunteeringData.groups) {
      await groupStore.fetch(groupid)
    }
  }

  if (!volunteeringData) {
    throw new Error('Volunteering opportunity not found')
  }
} catch (e) {
  // Most likely doesn't exist.
  emit('hide')
}
</script>
<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins/_breakpoints';
@import 'assets/css/_color-vars.scss';

.volunteer-opportunity {
  padding: 0.5rem 0;
}

.opportunity-header {
  margin-bottom: 0.5rem;
}

.type-badge {
  display: inline-flex;
  align-items: center;
  background: rgba($colour-success, 0.1);
  color: $colour-success;
  padding: 0.25rem 0.5rem;
  font-size: 0.8rem;
  font-weight: 600;
}

.opportunity-title {
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0 0 0.25rem 0;
  color: $color-gray--darker;
}

.opportunity-meta {
  font-size: 0.85rem;
  color: $color-gray--dark;
  margin-bottom: 0.75rem;

  .meta-item {
    &:not(:last-child)::after {
      content: ' · ';
    }
  }
}

.opportunity-content {
  display: flex;
  gap: 1rem;
  margin-bottom: 0.75rem;

  @include media-breakpoint-down(md) {
    flex-direction: column;
  }
}

.opportunity-details {
  flex: 1;
}

.detail-row {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  margin-bottom: 0.375rem;
  font-size: 0.9rem;
  line-height: 1.4;

  .detail-icon {
    flex-shrink: 0;
    color: $color-gray--dark;
    width: 1em;
    margin-top: 0.3em;
  }

  .detail-text {
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
}

.opportunity-photo {
  flex-shrink: 0;
  width: 120px;

  @include media-breakpoint-down(md) {
    width: 100%;
    max-width: 200px;
  }

  :deep(img) {
    width: 100%;
    height: auto;
    object-fit: cover;
  }
}

.opportunity-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  margin-bottom: 0.5rem;
}
</style>
