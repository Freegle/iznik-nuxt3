<template>
  <div>
    <div class="d-flex align-items-start justify-content-between mb-1">
      <h2 class="header--size4 pl-2">
        <nuxt-link :to="link" class="title__link" no-prefetch>
          <v-icon :icon="iconName" scale="2" /> {{ title }}
        </nuxt-link>
      </h2>
      <b-button
        variant="secondary"
        :aria-label="addButtonLabel"
        class="mr-1"
        @click="showModal"
      >
        <v-icon icon="plus" /> Add
      </b-button>
    </div>
    <b-card variant="white" no-body class="pt-2">
      <b-card-body class="p-0">
        <div class="p-1">
          <div v-if="items.length">
            <p class="text-center small text-muted">
              {{ itemDescription }}
            </p>
            <div v-for="id in items" :key="itemKey + id" class="">
              <CommunityEvent
                v-if="featureComponent === 'CommunityEvent'"
                :id="id"
                :summary="true"
              />
              <VolunteerOpportunity v-else :id="id" :summary="true" />
            </div>
          </div>
          <p v-else class="text-center p-1">
            {{ noItemsMessage }}
          </p>
        </div>
      </b-card-body>
    </b-card>
    <div v-if="showAdd">
      <CommunityEventModal
        v-if="featureComponent === 'CommunityEvent'"
        ref="modal"
        :start-edit="true"
      />
      <VolunteerOpportunityModal v-else ref="modal" :start-edit="true" />
    </div>
  </div>
</template>
<script setup>
import { waitForRef } from '~/composables/useWaitForRef'
import { ref, defineAsyncComponent } from '#imports'

const CommunityEvent = defineAsyncComponent(() => import('./CommunityEvent'))
const VolunteerOpportunity = defineAsyncComponent(() =>
  import('./VolunteerOpportunity')
)
const CommunityEventModal = defineAsyncComponent(() =>
  import('./CommunityEventModal')
)
const VolunteerOpportunityModal = defineAsyncComponent(() =>
  import('./VolunteerOpportunityModal')
)

defineProps({
  items: {
    type: Array,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  link: {
    type: String,
    required: true,
  },
  iconName: {
    type: String,
    required: true,
  },
  addButtonLabel: {
    type: String,
    required: true,
  },
  itemDescription: {
    type: String,
    required: true,
  },
  noItemsMessage: {
    type: String,
    required: true,
  },
  featureComponent: {
    type: String,
    required: true,
  },
  addModalComponent: {
    type: String,
    required: true,
  },
  itemKey: {
    type: String,
    required: true,
  },
})

const showAdd = ref(false)
const modal = ref('modal')

const showModal = async () => {
  showAdd.value = true
  await waitForRef(modal, 'show')
  modal.value?.show()
}
</script>
<style scoped lang="scss">
.title__link {
  color: $colour-header;
}

:deep(a) {
  text-decoration: none;
}
</style>
