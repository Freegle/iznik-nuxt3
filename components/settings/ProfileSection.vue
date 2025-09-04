<template>
  <b-card
    border-variant="info"
    header-bg-variant="info"
    header-text-variant="white"
    class="mt-2"
  >
    <template #header>
      <h2 class="bg-info header--size5 mb-0">
        <v-icon icon="globe-europe" />
        Your Public Profile
      </h2>
    </template>
    <b-card-body class="p-0 pt-1">
      <p class="text-muted">This is what other freeglers can see about you.</p>
      <b-row>
        <b-col cols="12">
          <label> Your name (or a nickname): </label>
          <b-input-group>
            <b-form-input
              id="myname"
              v-model="displayName"
              placeholder="Your name"
            />
            <slot name="append">
              <b-button variant="white" @click="saveName">
                <v-icon icon="save" />&nbsp;Save
              </b-button>
            </slot>
          </b-input-group>
        </b-col>
      </b-row>
      <b-row class="mt-2">
        <b-col cols="12" xl="6">
          <b-card>
            <b-card-body class="text-center p-2">
              <div :key="bump" class="d-flex justify-content-around">
                <ProfileImage
                  v-if="!me || !useProfile"
                  image="/defaultprofile.png"
                  class="mr-1 mb-1 mt-1 inline"
                  is-thumbnail
                  size="xl"
                  alt-text="Default profile image"
                />
                <ProfileImage
                  v-else-if="me?.profile?.externaluid"
                  :externaluid="me.profile.externaluid"
                  :externalmods="me.profile.externalmods"
                  class="mr-1 mb-1 mt-1 inline"
                  is-thumbnail
                  size="xl"
                  alt-text="My profile image"
                />
                <ProfileImage
                  v-else
                  :image="profileUrl + '?settings=' + myid + '-' + cacheBust"
                  class="mr-1 mb-1 mt-1 inline"
                  is-thumbnail
                  size="xl"
                  alt-text="My profile image"
                />
              </div>
              <div class="d-flex justify-content-around mb-2">
                <OurToggle
                  v-model="useProfileLocal"
                  class="mt-2"
                  :labels="{ checked: 'Showing', unchecked: 'Hidden' }"
                  @change="changeUseProfile"
                />
              </div>
              <div class="d-flex justify-content-around align-items-center">
                <div
                  v-if="
                    (me?.profile?.ours || me?.profile?.externaluid) &&
                    useProfile &&
                    !showProfileModal &&
                    !uploading
                  "
                  class="clickme image__icon stacked mt-2"
                  title="Rotate left"
                  @click="rotateLeft"
                >
                  <v-icon icon="circle" size="2x" />
                  <v-icon icon="reply" class="pl-2" />
                </div>
                <div
                  v-if="uploading"
                  class="bg-white d-flex justify-content-around"
                >
                  <OurUploader v-model="currentAtts" type="User" />
                </div>
                <b-button
                  v-else
                  variant="secondary"
                  class="mt-2"
                  @click="uploadProfile"
                >
                  <v-icon icon="camera" /> Upload photo
                </b-button>
                <div
                  v-if="
                    (me?.profile?.ours || me?.profile?.externaluid) &&
                    useProfile &&
                    !showProfileModal &&
                    !uploading
                  "
                  class="clickme image__icon stacked mt-2"
                  title="Rotate right"
                  @click="rotateRight"
                >
                  <v-icon icon="circle" size="2x" />
                  <v-icon icon="reply" flip="horizontal" class="pr-2" />
                </div>
              </div>
              <div v-if="eligibleSupporter" class="mt-4">
                <SupporterInfo size="lg" :hidden="!showSupporter" />
                <b-button variant="link" size="sm" @click="toggleSupporter">
                  <span v-if="showSupporter"> Click to hide from others </span>
                  <span v-else> Click to show to others </span>
                </b-button>
                <p class="text-muted small mt-2">
                  <span v-if="showSupporter">
                    Other freeglers can see that you have kindly supported
                    Freegle recently with time or funds.
                  </span>
                  <span v-else> Other freeglers can't see this. </span>
                </p>
              </div>
            </b-card-body>
          </b-card>
        </b-col>
        <b-col cols="12" xl="6">
          <b-card no-body>
            <b-card-body class="text-start p-0 p-sm-2">
              <div v-if="aboutMe">
                &quot;{{ aboutMe }}&quot;
                <br />
                <b-button variant="white" class="mt-2" @click="addAbout">
                  <v-icon icon="pen" /> Edit
                </b-button>
              </div>
              <div v-else>
                <notice-message>
                  Please write something to let other freeglers know a bit about
                  you. It makes freegling more fun and helps get a better
                  response when you're replying to OFFERs.
                </notice-message>
                <b-button variant="white" class="mt-2" @click="addAbout">
                  <v-icon icon="pen" /> Introduce yourself
                </b-button>
              </div>
            </b-card-body>
          </b-card>
        </b-col>
      </b-row>
      <b-row>
        <b-col>
          <b-button variant="white" class="mt-2" @click="viewProfile">
            <v-icon icon="eye" /> View Your Profile
          </b-button>
        </b-col>
      </b-row>
    </b-card-body>
  </b-card>
</template>

<script setup>
import { ref, computed, defineEmits, watch } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { useImageStore } from '../../stores/image'
import { useMe, fetchMe } from '../../composables/useMe'
import ProfileImage from '~/components/ProfileImage'
import NoticeMessage from '~/components/NoticeMessage'
import OurUploader from '~/components/OurUploader'
import OurToggle from '~/components/OurToggle'
import SupporterInfo from '~/components/SupporterInfo'

const emit = defineEmits([
  'update',
  'show-about-me-modal',
  'show-profile-modal',
])

const authStore = useAuthStore()
const imageStore = useImageStore()
const { me, myid } = useMe()

// State
const uploading = ref(false)
const cacheBust = ref(Date.now())
const currentAtts = ref([])
const bump = ref(0)
const useProfileLocal = ref(false)
const displayName = ref('')

// Computed properties
const showSupporter = computed(() => {
  const settings = me.value?.settings || {}
  return 'hidesupporter' in settings ? !settings.hidesupporter : true
})

const supporter = computed(() => me.value?.supporter)

// Check if user is eligible to be a supporter (regardless of hidesupporter setting)
// This replicates the server-side logic for determining supporter eligibility
const eligibleSupporter = computed(() => {
  if (!me.value) return false
  
  // Check if they're a mod/admin (systemrole != 'User')
  const isMod = me.value.systemrole && me.value.systemrole !== 'User'
  
  // Check if they've donated recently (within 360 days - SUPPORTER_PERIOD)
  const hasRecentDonation = me.value.donated && 
    new Date(me.value.donated) > new Date(Date.now() - 360 * 24 * 60 * 60 * 1000)
  
  // For microactions, we can't easily check from the frontend, so we'll rely on 
  // the server having set supporter=true at some point, or the other conditions
  
  return isMod || hasRecentDonation || me.value.supporter
})

const useProfile = computed(() => {
  let ret = true

  if (me.value && me.value.settings) {
    if (Object.keys(me.value.settings).includes('useprofile')) {
      ret = me.value.settings.useprofile
    }
  }

  return ret
})

const profileUrl = computed(() => {
  return me.value && useProfile.value && me.value.profile?.path
    ? me.value.profile.path
    : '/defaultprofile.png'
})

const aboutMe = computed(() => {
  return me.value && me.value.aboutme ? me.value.aboutme.text : ''
})

// Methods
const toggleSupporter = async () => {
  const settings = me.value.settings
  // If showSupporter is true, we want to hide it (set hidesupporter to true)
  // If showSupporter is false, we want to show it (set hidesupporter to false)
  settings.hidesupporter = showSupporter.value

  await authStore.saveAndGet({
    settings,
  })

  emit('update')
}

const addAbout = () => {
  emit('show-about-me-modal')
}

const viewProfile = () => {
  emit('show-profile-modal')
}

const changeUseProfile = async (value) => {
  const settings = me.value.settings
  settings.useprofile = value
  await authStore.saveAndGet({
    settings,
  })

  emit('update')
}

const saveName = async () => {
  await authStore.saveAndGet({
    displayname: displayName.value,
  })

  emit('update')
}

const uploadProfile = () => {
  uploading.value = true
}

const rotate = async (deg) => {
  let curr = 0

  if (me.value.profile.externaluid) {
    curr = me.value.profile.externalmods?.rotate || 0
  }

  curr += deg

  // Ensure between 0 and 360
  curr = (curr + 360) % 360

  await imageStore.post({
    id: me.value.profile.id,
    rotate: curr,
    bust: Date.now(),
    user: true,
  })

  // Refresh the user - which in turn should update the image displayed.
  await fetchMe(true)

  cacheBust.value = Date.now()
  emit('update')
}

const rotateLeft = () => {
  rotate(-90)
}

const rotateRight = () => {
  rotate(90)
}

// Update local refs when me changes
watch(
  () => me.value,
  (newVal) => {
    if (newVal) {
      displayName.value = newVal.displayname || ''
      useProfileLocal.value = useProfile.value
    }
  },
  { immediate: true }
)

// Watch for attachment changes
watch(
  currentAtts,
  async (newVal) => {
    uploading.value = false

    if (newVal?.length) {
      // We want to replace our profile picture. The API for this is a bit odd - msgid will get used as the
      // id of the user.
      const atts = {
        externaluid: newVal[0].ouruid,
        externalmods: newVal[0].externalmods,
        imgtype: 'User',
        msgid: me?.value.id,
      }

      console.log('Post image', atts)
      await imageStore.post(atts)
    }

    // Refresh the user - which in turn should update the image displayed.
    await fetchMe(true)

    bump.value++
    emit('update')
  },
  { deep: true }
)
</script>

<style scoped lang="scss">
.image__icon {
  color: $color-white;
}

.stacked {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 1fr;
  color: $color-gray--dark;

  svg {
    grid-row: 1 / 2;
    grid-column: 1 / 2;
  }

  svg:nth-child(2) {
    z-index: 10000;
    color: white;
    padding-top: 7px;
  }
}
</style>
