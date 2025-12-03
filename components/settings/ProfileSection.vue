<template>
  <div class="settings-section">
    <div class="section-header">
      <v-icon icon="globe-europe" class="section-icon" />
      <h2>Your Profile</h2>
      <span class="public-badge"><v-icon icon="eye" /> Public</span>
    </div>

    <div class="section-content">
      <!-- Name -->
      <div class="setting-row">
        <label for="myname">Your name (or nickname):</label>
        <b-input-group>
          <b-form-input
            id="myname"
            v-model="displayName"
            placeholder="Your name"
          />
          <template #append>
            <b-button variant="primary" @click="saveName">
              <v-icon icon="save" /> Save
            </b-button>
          </template>
        </b-input-group>
      </div>

      <!-- Profile photo and about -->
      <div class="profile-row">
        <div class="profile-photo-section">
          <div class="photo-container">
            <ProfileImage
              v-if="!me || !useProfile"
              image="/defaultprofile.png"
              is-thumbnail
              size="xl"
              alt-text="Default profile image"
            />
            <ProfileImage
              v-else-if="me?.profile?.externaluid"
              :externaluid="me.profile.externaluid"
              :externalmods="me.profile.externalmods"
              is-thumbnail
              size="xl"
              alt-text="My profile image"
            />
            <ProfileImage
              v-else
              :image="profileUrl + '?settings=' + myid + '-' + cacheBust"
              is-thumbnail
              size="xl"
              alt-text="My profile image"
            />
          </div>

          <OurToggle
            v-model="useProfileLocal"
            class="mt-2"
            :labels="{ checked: 'Showing', unchecked: 'Hidden' }"
            @change="changeUseProfile"
          />

          <div class="photo-actions">
            <button
              v-if="canRotate && !uploading"
              class="rotate-btn"
              title="Rotate left"
              @click="rotateLeft"
            >
              <v-icon icon="reply" />
            </button>
            <div v-if="uploading" class="uploader-container">
              <OurUploader v-model="currentAtts" type="User" />
            </div>
            <b-button
              v-else
              variant="secondary"
              size="sm"
              @click="uploadProfile"
            >
              <v-icon icon="camera" /> Upload
            </b-button>
            <button
              v-if="canRotate && !uploading"
              class="rotate-btn"
              title="Rotate right"
              @click="rotateRight"
            >
              <v-icon icon="reply" flip="horizontal" />
            </button>
          </div>

          <div v-if="eligibleSupporter" class="supporter-section">
            <SupporterInfo size="lg" :hidden="!showSupporter" />
            <button class="link-btn" @click="toggleSupporter">
              {{ showSupporter ? 'Hide from others' : 'Show to others' }}
            </button>
          </div>
        </div>

        <div class="about-section">
          <div v-if="aboutMe" class="about-content">
            <p class="about-text">"{{ aboutMe }}"</p>
            <button class="edit-btn" @click="addAbout">
              <v-icon icon="pen" /> Edit
            </button>
          </div>
          <div v-else class="about-empty">
            <p class="empty-text">Add a short intro about yourself</p>
            <p class="empty-hint">It helps when replying to OFFERs!</p>
            <b-button variant="primary" size="sm" @click="addAbout">
              <v-icon icon="pen" /> Introduce yourself
            </b-button>
          </div>
        </div>
      </div>

      <b-button variant="link" class="view-profile-btn" @click="viewProfile">
        <v-icon icon="eye" /> View your profile
      </b-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, defineEmits, watch } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useImageStore } from '~/stores/image'
import { useMe, fetchMe } from '~/composables/useMe'
import ProfileImage from '~/components/ProfileImage'
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
const useProfileLocal = ref(false)
const displayName = ref('')

// Computed properties
const showSupporter = computed(() => {
  const settings = me.value?.settings || {}
  return 'hidesupporter' in settings ? !settings.hidesupporter : true
})

const eligibleSupporter = computed(() => {
  if (!me.value) return false
  const isMod = me.value.systemrole && me.value.systemrole !== 'User'
  const hasRecentDonation =
    me.value.donated &&
    new Date(me.value.donated) >
      new Date(Date.now() - 360 * 24 * 60 * 60 * 1000)
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

const canRotate = computed(() => {
  return (
    (me.value?.profile?.ours || me.value?.profile?.externaluid) &&
    useProfile.value
  )
})

// Methods
const toggleSupporter = async () => {
  const settings = me.value.settings
  settings.hidesupporter = showSupporter.value
  await authStore.saveAndGet({ settings })
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
  await authStore.saveAndGet({ settings })
  emit('update')
}

const saveName = async () => {
  await authStore.saveAndGet({ displayname: displayName.value })
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
  curr = (curr + 360) % 360

  await imageStore.post({
    id: me.value.profile.id,
    rotate: curr,
    bust: Date.now(),
    user: true,
  })

  await fetchMe(true)
  cacheBust.value = Date.now()
  emit('update')
}

const rotateLeft = () => rotate(-90)
const rotateRight = () => rotate(90)

// Watch for me changes
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
      const atts = {
        externaluid: newVal[0].ouruid,
        externalmods: newVal[0].externalmods,
        imgtype: 'User',
        msgid: me?.value.id,
      }
      await imageStore.post(atts)
    }
    await fetchMe(true)
    emit('update')
  },
  { deep: true }
)
</script>

<style scoped lang="scss">
@import 'assets/css/_color-vars.scss';

.settings-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 1rem;
  overflow: hidden;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);

  h2 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: $color-green-background;
    flex: 1;
  }

  .section-icon {
    color: $color-green-background;
  }
}

.public-badge {
  font-size: 0.75rem;
  color: $color-blue--bright;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.section-content {
  padding: 1rem 1.25rem;
}

.setting-row {
  margin-bottom: 1rem;

  label {
    display: block;
    font-weight: 500;
    margin-bottom: 0.25rem;
    font-size: 0.9rem;
  }
}

.profile-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-top: 1rem;

  @media (max-width: 576px) {
    grid-template-columns: 1fr;
  }
}

.profile-photo-section {
  text-align: center;
  padding: 1rem;
  background: $color-gray--lighter;
  border-radius: 8px;
}

.photo-container {
  margin-bottom: 0.5rem;
}

.photo-actions {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.75rem;
}

.rotate-btn {
  background: $color-gray--dark;
  color: white;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  &:hover {
    background: $color-green-background;
  }
}

.uploader-container {
  background: white;
  padding: 0.5rem;
  border-radius: 4px;
}

.supporter-section {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.link-btn {
  background: none;
  border: none;
  color: $color-blue--bright;
  font-size: 0.85rem;
  cursor: pointer;
  padding: 0;

  &:hover {
    text-decoration: underline;
  }
}

.about-section {
  padding: 1.25rem;
  background: linear-gradient(135deg, #f8fdf5 0%, #f0f9e8 100%);
  border-radius: 8px;
  border: 1px solid rgba($color-green-background, 0.15);
}

.about-content {
  position: relative;
}

.about-text {
  font-style: italic;
  color: $color-gray--darker;
  line-height: 1.6;
  font-size: 0.95rem;
  margin: 0;
}

.edit-btn {
  background: none;
  border: none;
  color: $color-blue--bright;
  font-size: 0.85rem;
  padding: 0;
  margin-top: 0.75rem;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
}

.about-empty {
  text-align: center;
}

.empty-text {
  font-weight: 500;
  color: $color-gray--darker;
  margin-bottom: 0.25rem;
}

.empty-hint {
  font-size: 0.85rem;
  color: $color-gray--dark;
  margin-bottom: 1rem;
}

.view-profile-btn {
  padding: 0;
  margin-top: 0.5rem;
}
</style>
