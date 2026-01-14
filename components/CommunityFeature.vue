<template>
  <div class="feature-container">
    <div class="feature-header">
      <nuxt-link :to="link" class="header-link" no-prefetch>
        <v-icon :icon="iconName" class="header-icon" />
        <span class="header-title">{{ title }}</span>
      </nuxt-link>
      <button :aria-label="addButtonLabel" class="add-btn" @click="showModal">
        <v-icon icon="plus" />
        <span>Add</span>
      </button>
    </div>
    <div class="feature-content">
      <div v-if="items.length">
        <p class="feature-description">
          {{ itemDescription }}
        </p>
        <div v-for="id in items" :key="itemKey + id">
          <CommunityEvent
            v-if="featureComponent === 'CommunityEvent'"
            :id="id"
            :summary="true"
          />
          <VolunteerOpportunity v-else :id="id" :summary="true" />
        </div>
      </div>
      <p v-else class="feature-empty">
        {{ noItemsMessage }}
      </p>
    </div>

    <template v-if="featureComponent === 'CommunityEvent'">
      <CommunityEventModal
        v-if="modalShown"
        :start-edit="true"
        @hidden="modalShown = false"
      />
    </template>
    <template v-else>
      <VolunteerOpportunityModal
        v-if="modalShown"
        :start-edit="true"
        @hidden="modalShown = false"
      />
    </template>
  </div>
</template>
<script setup>
import { ref, defineAsyncComponent } from 'vue'

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

const modalShown = ref(false)

function showModal() {
  modalShown.value = true
}
</script>
<style scoped lang="scss">
@import 'assets/css/_color-vars.scss';

.feature-container {
  background: white;
}

.feature-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.625rem 0.75rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.header-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;

  &:hover {
    text-decoration: none;
  }
}

.header-icon {
  color: $colour-success;
  font-size: 1.1rem;
}

.header-title {
  font-weight: 600;
  font-size: 1rem;
  color: $colour-success;
}

.add-btn {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  background: $colour-success;
  color: white;
  border: none;
  font-weight: 500;
  font-size: 0.85rem;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: darken($colour-success, 8%);
  }
}

.feature-content {
  padding: 0.75rem;
}

.feature-description {
  text-align: center;
  font-size: 0.85rem;
  color: $color-gray--dark;
  margin-bottom: 0.75rem;
}

.feature-empty {
  text-align: center;
  padding: 0.5rem;
  margin: 0;
  color: $color-gray--dark;
}

:deep(a) {
  text-decoration: none;
}
</style>
