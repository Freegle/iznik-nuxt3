<template>
  <nuxt-link
    no-prefetch
    :to="'/profile/' + newsfeed.userid"
    class="text-success nodecor"
    :title="'Click to view profile for ' + newsfeed.displayname"
  >
    <span class="text-muted small">
      <span v-if="newsfeed.location" class="pl-0">
        <v-icon icon="map-marker-alt" class="ml-2" />&nbsp;{{
          newsfeed.location
        }}
      </span>
      <span
        v-if="newsfeed.userinfo.openoffers + newsfeed.userinfo.openwanteds > 0"
      >
        &bull;
        <span v-if="newsfeed.userinfo.openoffers" class="text-success">
          {{ openoffers }}&nbsp;
        </span>
        <span v-if="newsfeed.userinfo.openwanteds" class="text-success">
          {{ openwanted }}&nbsp;
        </span>
      </span>
      <span v-if="newsfeed.showmod">
        &bull;
        <v-icon icon="leaf" /> Freegle Volunteer
      </span>
    </span>
  </nuxt-link>
</template>
<script setup>
import pluralize from 'pluralize'
import { computed } from 'vue'
import { useNewsfeedStore } from '~/stores/newsfeed'

const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
})

const newsfeedStore = useNewsfeedStore()

const newsfeed = computed(() => {
  return newsfeedStore?.byId(props.id)
})

const openoffers = computed(() => {
  let ret = null

  if (newsfeed.value?.userinfo) {
    ret = pluralize('OFFER', newsfeed.value.userinfo.openoffers, true)
  }

  return ret
})

const openwanted = computed(() => {
  let ret = null

  if (newsfeed.value?.userinfo) {
    ret = pluralize('WANTED', newsfeed.value.userinfo.openwanteds, true)
  }

  return ret
})
</script>
