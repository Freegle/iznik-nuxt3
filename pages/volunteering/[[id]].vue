<template>
  <client-only>
    <b-row v-if="invalid" class="m-0">
      <b-col cols="12" lg="6" class="p-0" offset-lg="3">
        <NoticeMessage variant="danger" class="mt-2">
          Sorry, that volunteer opportunity isn't around any more.
        </NoticeMessage>
      </b-col>
    </b-row>
    <div v-else>
      <b-row class="m-0">
        <b-col cols="0" md="3" class="d-none d-md-block" />
        <b-col cols="12" md="6" class="p-0">
          <VolunteerOpportunity
            v-if="!invalid"
            :id="id"
            :summary="false"
            class="mt-1"
            title-tag="h1"
            @hide="invalid = true"
          />
          <NoticeMessage v-else>
            Sorry, we can't find that volunteer opportunity.
          </NoticeMessage>
        </b-col>
        <b-col cols="0" md="3" class="d-none d-md-block" />
      </b-row>
    </div>
  </client-only>
</template>
<script setup>
import { useRoute } from 'vue-router'
import { buildHead } from '~/composables/useBuildHead'
import { useVolunteeringStore } from '~/stores/volunteering'
import NoticeMessage from '~/components/NoticeMessage'
import { useRouter } from '#imports'
import VolunteerOpportunity from '~/components/VolunteerOpportunity'

const runtimeConfig = useRuntimeConfig()
const volunteeringStore = useVolunteeringStore()
const route = useRoute()
const router = useRouter()
const id = parseInt(route.params.id)

if (!id) {
  // Probably here by mistake - send to the list of all of them.
  router.push('/volunteerings')
}

let invalid = false

try {
  await volunteeringStore.fetch(id)
  const volunteering = computed(() => {
    return volunteeringStore.byId(id)
  })

  useHead(
    buildHead(
      route,
      runtimeConfig,
      volunteering.value.title,
      volunteering.value.description,
      volunteering.value.image ? volunteering.value.image.path : null
    )
  )
} catch (e) {
  console.log('Failed to fetch', id, e)
  invalid = true
  buildHead(
    route,
    useRuntimeConfig(),
    'Volunteer Opportunity ' + id,
    "Sorry, that volunteer opportunity isn't around any more."
  )
}
</script>
