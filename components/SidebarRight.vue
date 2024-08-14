<template>
  <div class="sidebar__wrapper">
    <div class="d-flex flex-column justify-content-between mh-100">
      <div>
        <DonationMonthly
          v-if="supporter && !donor"
          class="w-100"
          variant="sidebar"
        />
      </div>
      <JobsSidebar
        v-if="showJobOpportunities"
        :class="itemclass"
        :shown-love-junk="shown"
      />
    </div>
  </div>
</template>
<script>
import JobsSidebar from './JobsSidebar'
import DonationMonthly from '~/components/DonationMonthly'

export default {
  components: {
    DonationMonthly,
    JobsSidebar,
  },
  props: {
    showJobOpportunities: {
      type: Boolean,
      required: false,
    },
  },
  data() {
    return {
      shown: false,
    }
  },
  computed: {
    itemclass() {
      return 'sidebar__full mt-2'
    },
  },
}
</script>
<style scoped>
.sidebar__item {
  flex: 0 1 50%;
  overflow-y: auto;
}
.sidebar__full {
  flex: 0 1 100%;
  overflow-y: auto;
}
</style>
