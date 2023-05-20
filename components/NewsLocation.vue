<template>
  <b-card no-body class="p-2">
    <b-card-text class="">
      <div class="d-block d-sm-none w-100">
        <b-form-select
          v-model="selectedArea"
          :options="areaOptions"
          class="d-block"
        />
        <div v-if="areaname" class="d-block mt-1">
          <v-icon icon="map-marker-alt" />
          <span
            v-b-tooltip="
              'This is where other people will see that you are.  Change your location from Settings.'
            "
            class="ml-1"
            >{{ areaname }}</span
          >
        </div>
      </div>
      <div class="d-none d-sm-flex align-items-center">
        <div v-if="areaname" class="w-50">
          <v-icon icon="map-marker-alt" />
          <span
            v-b-tooltip="
              'This is where other people will see that you are.  Change your location from Settings.'
            "
            class="ml-1"
            >{{ areaname }}</span
          >
        </div>
        <b-form-select
          v-model="selectedArea"
          :options="areaOptions"
          class="w-50"
        />
      </div>
    </b-card-text>
  </b-card>
</template>
<script>
import { useAuthStore } from '../stores/auth'
import { useLocationStore } from '../stores/location'
import { ref } from '#imports'

export default {
  async setup() {
    const authStore = useAuthStore()
    const locationStore = useLocationStore()
    const me = authStore.user

    console.log('me', me)
    const areaname = ref(me?.settings?.mylocation?.area?.name)
    const areaid = computed(() => me?.settings?.mylocation?.areaid)

    if (!areaname.value && areaid.value) {
      const loc = await locationStore.fetchv2(areaid.value)
      areaname.value = loc.name
    }

    return {
      authStore,
      areaname,
    }
  },
  data() {
    return {
      areaOptions: [
        {
          value: 'nearby',
          text: 'Show chitchat from nearby',
        },
        {
          value: 1609,
          text: 'Show chitchat within 1 mile',
        },
        {
          value: 3128,
          text: 'Show chitchat within 2 miles',
        },
        {
          value: 8046,
          text: 'Show chitchat within 5 miles',
        },
        {
          value: 16093,
          text: 'Show chitchat within 10 miles',
        },
        {
          value: 32186,
          text: 'Show chitchat within 20 miles',
        },
        {
          value: 80467,
          text: 'Show chitchat within 50 miles',
        },
        {
          value: '0',
          text: 'Show chitchat from anywhere',
        },
      ],
    }
  },
  computed: {
    selectedArea: {
      get() {
        const settings = this.me?.settings
        return settings?.newsfeedarea || 0
      },
      async set(newval) {
        const settings = this.me.settings
        settings.newsfeedarea = newval

        await this.authStore.saveAndGet({
          settings,
        })

        this.$emit('changed')
      },
    },
  },
}
</script>
