<template>
  <div class="pt-4">
    <b-row class="m-0">
      <b-col cols="0" lg="3" class="d-none d-lg-block" />
      <b-col cols="12" lg="6" class="p-0">
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
<script setup>
import { ref, useRoute, useRouter, useHead, useRuntimeConfig } from '#imports'
import AutoComplete from '~/components/AutoComplete.vue'
import { buildHead } from '~/composables/useBuildHead'

// Setup stores and route
const runtimeConfig = useRuntimeConfig()
const route = useRoute()
const router = useRouter()
const autocomplete = ref(null)

// API base URL
const api = runtimeConfig.public.APIv1
const source = api + '/authority'

// Set page head
useHead(
  buildHead(
    route,
    runtimeConfig,
    'Statistics by Authority',
    "You can search for a council, local authority etc. Then we'll show you our impact in that area."
  )
)

// Methods
function process(results) {
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

  results.value = ret
  return ret
}

function select(auth) {
  if (auth) {
    router.push('/stats/authority/' + auth.id)
  }
}
</script>
