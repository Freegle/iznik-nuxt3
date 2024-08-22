<template>
  <div class="sidebar__wrapper">
    <div class="d-flex flex-column justify-content-between mh-100">
      <ExternalDa
        v-if="adShown"
        ad-unit-path="/22794232631/freegle_myposts_desktop_right"
        max-width="300px"
        max-height="600px"
        div-id="div-gpt-ad-1709056727559-0"
        class="mt-2"
        @rendered="adRendered"
      />
      <JobsSidebar v-if="showJobOpportunities" class="jobs mt-2" />
    </div>
  </div>
</template>
<script>
import JobsSidebar from './JobsSidebar'
import ExternalDa from '~/components/ExternalDa.vue'

export default {
  components: {
    ExternalDa,
    JobsSidebar,
  },
  props: {
    showJobOpportunities: {
      type: Boolean,
      required: false,
    },
  },
  data: function () {
    return {
      adShown: true,
    }
  },
  methods: {
    adRendered(adShown) {
      this.adShown = adShown
    },
  },
}
</script>
<style scoped>
.jobs {
  flex: 0 1 100%;
  overflow-y: auto;
}
</style>
