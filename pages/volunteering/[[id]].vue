<template>
  <client-only>
    <div class="volunteering-page">
      <div class="volunteering-page__content">
        <NoticeMessage v-if="invalid" variant="danger">
          Sorry, that volunteer opportunity isn't around any more.
        </NoticeMessage>
        <VolunteerOpportunity
          v-else
          :id="id"
          :summary="false"
          title-tag="h1"
          @hide="invalid = true"
        />
      </div>
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
<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins/_breakpoints';
@import 'assets/css/_color-vars.scss';

.volunteering-page {
  background: $color-gray--lighter;
  min-height: 100vh;
  padding: 1rem;

  @include media-breakpoint-up(md) {
    padding: 1.5rem;
  }
}

.volunteering-page__content {
  max-width: 800px;
  margin: 0 auto;
}
</style>
