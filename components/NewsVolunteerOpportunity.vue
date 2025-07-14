<template>
  <div v-if="volunteering">
    <div class="d-flex">
      <ProfileImage
        v-if="user?.profile?.paththumb"
        :image="user.profile.paththumb"
        class="ml-1 mr-2 mb-1 inline"
        is-thumbnail
        :is-moderator="Boolean(user.showmod)"
        size="lg"
      />
      <div>
        <span v-if="user?.id">
          <span class="text-success font-weight-bold">{{
            user.displayname
          }}</span>
          posted a volunteering opportunity
        </span>
        <span v-else> Volunteering opportunity</span>
        <span class="d-none d-md-inline-block">:</span
        ><span class="d-block d-md-none" /><span class="d-none d-md-inline"
          >&nbsp;</span
        ><strong>{{ volunteering.title }}</strong>
        <br />
        <span class="text-muted small">
          {{ addedago }}
          on
          <span v-for="groupid in volunteering.groups" :key="groupid">
            <span v-if="group(groupid)">
              {{ group(groupid).namedisplay }}
            </span>
          </span>
        </span>
      </div>
    </div>
    <div class="volunteering__container">
      <div class="volunteering__description">
        <div v-if="volunteering.description" class="text-truncate">
          <v-icon icon="info-circle" class="fa-fw" />
          {{ volunteering.description }}
        </div>
        <div v-if="volunteering.location" class="text-truncate">
          <v-icon icon="map-marker-alt" class="fa-fw" />
          {{ volunteering.location }}
        </div>
        <b-button variant="secondary" class="mt-3 mb-2" @click="moreInfo">
          <v-icon icon="info-circle" /> More info
        </b-button>
      </div>
      <div class="volunteering__photo">
        <OurUploadedImage
          v-if="volunteering.image?.ouruid"
          :src="volunteering.image?.ouruid"
          :modifiers="volunteering.image?.externalmods"
          alt="Community Event Photo"
          :width="200"
          @click="moreInfo"
        />
        <NuxtPicture
          v-else-if="volunteering.image?.externaluid"
          fit="cover"
          format="webp"
          provider="uploadcare"
          :src="volunteering.image?.externaluid"
          :modifiers="volunteering.image?.externalmods"
          alt="Community Event Photo"
          :width="200"
          :height="200"
          @click="moreInfo"
        />
        <b-img
          v-else-if="volunteering.image"
          rounded
          lazy
          :src="volunteering.image.paththumb"
          class="clickme mt-2 mt-md-0 w-100"
          @click="moreInfo"
        />
      </div>
    </div>
    <hr />
    <div class="mt-2 d-flex flex-wrap justify-content-between">
      <NewsLoveComment
        :newsfeed="newsfeed"
        @focus-comment="$emit('focus-comment')"
      />
      <div>
        <b-button variant="secondary" size="sm" @click="addOpportunity">
          <v-icon icon="plus" /> Add your opportunity
        </b-button>
      </div>
    </div>
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
import { useVolunteeringStore } from '../stores/volunteering'
import { useNewsfeedStore } from '../stores/newsfeed'
import { useUserStore } from '../stores/user'
import { useGroupStore } from '../stores/group'
import { timeago } from '~/composables/useTimeFormat'
import NewsLoveComment from '~/components/NewsLoveComment'
import ProfileImage from '~/components/ProfileImage'

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

const user = computed(() => {
  if (newsfeed.value?.userid) {
    return userStore.byId(newsfeed.value.userid)
  }
  return null
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

.volunteering__container {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}

.volunteering__description {
  width: 100%;

  @include media-breakpoint-up(lg) {
    width: 65%;
    padding-right: 15px;
  }
}

.volunteering__photo {
  width: 100%;

  @include media-breakpoint-up(lg) {
    width: 30%;
  }
}
</style>
