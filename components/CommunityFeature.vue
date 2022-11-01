<template>
  <div>
    <div class="d-flex align-items-start justify-content-between mb-1">
      <h2 class="header--size4 pl-2">
        <nuxt-link :to="link" class="title__link">
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
              <component :is="featureComponent" :id="id" :summary="true" />
            </div>
          </div>
          <p v-else class="text-center p-1">
            {{ noItemsMessage }}
          </p>
        </div>
      </b-card-body>
    </b-card>
    <component
      :is="addModalComponent"
      v-if="showAdd"
      ref="modal"
      :start-edit="true"
    />
  </div>
</template>
<script>
import CommunityEvent from './CommunityEvent'
import VolunteerOpportunity from './VolunteerOpportunity'
import CommunityEventModal from '~/components/CommunityEventModal'
import VolunteerOpportunityModal from '~/components/VolunteerOpportunityModal'

export default {
  name: 'CommunityFeature',
  components: {
    CommunityEvent,
    VolunteerOpportunity,
    CommunityEventModal,
    VolunteerOpportunityModal,
  },

  props: {
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
  },
  data() {
    return {
      showAdd: false,
    }
  },
  methods: {
    showModal() {
      this.showAdd = true
      this.waitForRef('modal', () => {
        this.$refs.modal.show()
      })
    },
  },
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
