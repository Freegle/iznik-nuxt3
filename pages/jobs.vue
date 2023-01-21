<template>
  <div>
    <client-only>
      <b-row class="m-0">
        <b-col cols="0" md="3" class="d-none d-md-block" />
        <b-col cols="12" md="6" class="mt-2 bg-white">
          <h3>Jobs</h3>
          <p>
            Freegle will get a small amount if you are interested and click to
            view any of them, which will help keep us going.
          </p>
          <p>
            Some may ask you to sign up - sorry about that, it's not under our
            control.
          </p>
          <div class="d-flex mb-2 flex-wrap justify-content-between">
            <PlaceAutocomplete
              :value="location"
              class="mt-2"
              labeltext="Where are you looking?  Use a postcode or town name."
              @selected="search($event)"
            />
            <div class="mt-2 d-flex flex-column justify-content-end">
              <b-form-select
                v-model="category"
                :options="categories"
                size="lg"
                class="mt-md-4"
              />
            </div>
          </div>
          <div v-if="busy" class="d-flex justify-content-around">
            <b-img src="/loader.gif" alt="Loading..." />
          </div>
          <div v-else>
            <div v-for="job in list" :key="'job-' + job.job_reference">
              <JobOne :id="job.id" class="mb-1" />
            </div>
            <NoticeMessage v-if="blocked" variant="warning">
              It looks like you may have an AdBlocker or security software which
              is blocking these job ads.
            </NoticeMessage>
            <NoticeMessage v-else-if="location && !list?.length" variant="info">
              We didn't find any jobs here. Please search somewhere else.
            </NoticeMessage>
          </div>
        </b-col>
      </b-row>
    </client-only>
  </div>
</template>
<script>
import { mapState } from 'pinia'
import { useRoute } from 'vue-router'
import JobOne from '../components/JobOne'
import { useJobStore } from '../stores/job'
import { useAuthStore } from '../stores/auth'
import { buildHead } from '~/composables/useBuildHead'
import { ref } from '#imports'
import PlaceAutocomplete from '~/components/PlaceAutocomplete'
import NoticeMessage from '~/components/NoticeMessage'

export default {
  components: {
    PlaceAutocomplete,
    NoticeMessage,
    JobOne,
  },
  async setup() {
    const jobStore = useJobStore()
    const authStore = useAuthStore()

    const me = authStore.user
    const lat = ref(me?.lat)
    const lng = ref(me?.lng)

    const location = ref(me?.settings?.mylocation?.name || null)
    const route = useRoute()

    useHead(
      buildHead(
        route,
        'Jobs',
        'Freegle gets a little bit to help keep us going if you click on them.',
        null,
        {
          class: 'overflow-y-scroll',
        }
      )
    )

    if (location.value && lat && lng) {
      await jobStore.fetch(lat.value, lng.value)
    }

    return {
      jobStore,
      location,
      lat,
      lng,
    }
  },
  data() {
    return {
      category: null,
      busy: false,
    }
  },
  computed: {
    ...mapState(useJobStore, ['list', 'blocked']),
    categories() {
      const ret = [
        {
          value: null,
          text: 'All job categories',
        },
      ]
      ;[
        'Accounting/Financial/Insurance',
        'Administration',
        'Agriculture',
        'Arts/Graphic Design',
        'Automotive/Aerospace',
        'Car',
        'Catering',
        'Charity',
        'Construction',
        'Consulting',
        'Customer Services',
        'Distribution',
        'Electronics',
        'Hospitality/Hotel',
        'IT',
        'Legal',
        'Leisure/Tourism',
        'Management',
        'Manufacturing/Surveying',
        'Marketing',
        'Media',
        'Medical/Pharmaceutical/Scientific',
        'Military/Emergency/Government',
        'Other',
        'Personnel/Recruitment',
        'Property Services',
        'Public Sector',
        'Retail/Purchasing',
        'Sales',
        'Social Care',
        'Telecoms',
      ].forEach((c) => {
        ret.push({ value: c, text: c })
      })

      return ret
    },
  },
  watch: {
    category() {
      this.$nextTick(this.doSearch)
    },
  },
  methods: {
    search(e) {
      console.log('Got place', e.lat, e.lng)
      if (e && (e.lat || e.lng)) {
        this.lat = e.lat
        this.lng = e.lng
        this.doSearch()
      }
    },
    async doSearch() {
      this.busy = true
      await this.jobStore.fetch(this.lat, this.lng, this.category, true)
      this.busy = false
    },
  },
}
</script>
