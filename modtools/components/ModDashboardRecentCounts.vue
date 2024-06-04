<template>
  <div v-if="RecentCounts">
    <p v-if="loading" class="text-faded pulsate">
      Loading...
    </p>
    <p v-else>
      During this time there have been
      <strong>{{ withplural('new post', RecentCounts.newmessages, true) }}</strong> and
      <strong>{{ withplural('new member', RecentCounts.newmembers, true) }}</strong>.
    </p>
  </div>
</template>
<script>
import { withplural } from '../composables/usePluralize'
import ModDashboardBase from '~/components/ModDashboardBase'

export default {
  extends: ModDashboardBase,
  data: function () {
    return {
      askfor: ['RecentCounts'],
      RecentCounts: null
    }
  }
}
</script>
