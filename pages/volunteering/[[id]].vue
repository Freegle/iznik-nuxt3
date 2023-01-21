<template>
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
        />
        <NoticeMessage v-else>
          Sorry, we can't find that volunteer opportunity.
        </NoticeMessage>
      </b-col>
      <b-col cols="0" md="3" class="d-none d-md-block" />
    </b-row>
  </div>
</template>
<script>
import { useRoute } from 'vue-router'
import NoticeMessage from '../../components/NoticeMessage'
import { buildHead } from '../../composables/useBuildHead'
import { useVolunteeringStore } from '../../stores/volunteering'
import { useRouter } from '#imports'

const VolunteerOpportunity = () =>
  import('~/components/VolunteerOpportunity.vue')

export default {
  components: {
    NoticeMessage,
    VolunteerOpportunity,
  },
  setup() {
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
      const volunteering = volunteeringStore.fetch(id)
      useHead(
        buildHead(
          route,
          volunteering.title,
          volunteering.description,
          volunteering.image ? volunteering.image.path : null
        )
      )
    } catch (e) {
      invalid = true
      buildHead(
        route,
        'Volunteer Opportunity ' + id,
        "Sorry, that volunteer opportunity isn't around any more."
      )
    }

    return {
      volunteeringStore,
      invalid,
      id,
    }
  },
  computed: {
    volunteering() {
      return this.volunteeringStore.byId(this.$route.params.id)
    },
  },
}
</script>
