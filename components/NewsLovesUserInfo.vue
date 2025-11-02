<template>
  <div
    v-if="user"
    class="text-success nodecor clickme"
    :title="'Click to view profile for ' + user.displayname"
    @click="goto"
  >
    <div class="d-flex">
      <ProfileImage
        :image="user.profile.paththumb"
        class="ml-1 mb-1 inline"
        is-thumbnail
        size="lg"
      />
      <div class="ml-2">
        <span class="text-success font-weight-bold">
          {{ user.displayname }}
        </span>
        <br />
        <span class="text-muted small">
          <span v-if="publicLocation" class="pl-0">
            <v-icon icon="map-marker-alt" />&nbsp;{{ publicLocation.display }}
          </span>
          <span v-if="user.info.openoffers + user.info.openwanteds > 0">
            &bull;
            <span v-if="user.info.openoffers" class="text-success">
              {{ openoffers }}&nbsp;
            </span>
            <span v-if="user.info.openwanteds" class="text-success">
              {{ openwanted }}&nbsp;
            </span>
          </span>
          <span v-if="user.showmod">
            &bull;
            <v-icon icon="leaf" /> Freegle Volunteer
          </span>
        </span>
      </div>
    </div>
  </div>
</template>
<script setup>
import { computed } from 'vue'
import pluralize from 'pluralize'
import ProfileImage from './ProfileImage'
import { useUserStore } from '~/stores/user'

const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
})

const emit = defineEmits(['goto'])

const userStore = useUserStore()

// Initialize - fetch user data
await userStore.fetch(props.id)

// Get public location. Don't wait, as a bit slow.
userStore.fetchPublicLocation(props.id)

const user = computed(() => {
  return userStore?.byId(props.id)
})

const publicLocation = computed(() => {
  return props.id ? userStore?.publicLocationById(props.id) : null
})

const openoffers = computed(() => {
  let ret = null

  if (user.value?.info) {
    ret = pluralize('OFFER', user.value.info.openoffers, true)
  }

  return ret
})

const openwanted = computed(() => {
  let ret = null

  if (user.value?.info) {
    ret = pluralize('WANTED', user.value.info.openwanteds, true)
  }

  return ret
})

function goto(e) {
  emit('goto')
}
</script>
