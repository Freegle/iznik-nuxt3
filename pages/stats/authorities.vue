<template>
  <div>
    <b-row class="m-0">
      <b-col cols="0" md="3" class="d-none d-md-block" />
      <b-col cols="12" md="6" class="p-0">
        <h2>Statistics by Local Authority, Council etc</h2>
        <p>
          You can search for a council, local authority etc. Then we'll show you
          our impact in that area.
        </p>
        <AutoComplete
          ref="autocomplete"
          :url="source"
          param="search"
          anchor="name"
          label=""
          :classes="{ input: 'form-control', list: 'iteminp' }"
          :min="3"
          :debounce="100"
          :process="process"
          :on-select="select"
          :size="60"
          maxlength="60"
          spellcheck="true"
          placeholder="Type here then click to choose an area"
        />
      </b-col>
    </b-row>
  </div>
</template>
<script>
import { useRoute } from 'vue-router'
import { useStatsStore } from '~/stores/stats'
import AutoComplete from '~/components/AutoComplete'
import { buildHead } from '~/composables/useBuildHead'

export default {
  components: {
    AutoComplete,
  },
  setup() {
    const statsStore = useStatsStore()
    const runtimeConfig = useRuntimeConfig()
    const route = useRoute()

    useHead(
      buildHead(
        route,
        runtimeConfig,
        'Statistics by Authority',
        "You can search for a council, local authority etc. Then we'll show you our impact in that area."
      )
    )

    return {
      statsStore,
    }
  },
  data() {
    return {
      source: process.env.API + '/authority',
      results: [],
    }
  },
  computed: {},
  methods: {
    process(results) {
      const authorities =
        results.authorities.length > 5
          ? results.authorities.slice(0, 5)
          : results.authorities
      const ret = []
      for (const authority of authorities) {
        if (authority && authority.name) {
          ret.push(authority)
        }
      }

      this.results = ret
      return ret
    },
    select(auth) {
      if (auth) {
        this.$router.push('/stats/authority/' + auth.id)
      }
    },
  },
}
</script>
