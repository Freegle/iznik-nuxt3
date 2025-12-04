<template>
  <div :class="{ 'mb-2': !showFilters }">
    <h2 class="visually-hidden">Post Filters</h2>
    <b-collapse v-model="showFilters" class="p-2 bg-primary-subtle">
      <div variant="info" class="filters mb-2">
        <div class="group">
          <GroupSelect
            v-if="me"
            v-model="group"
            label="Show posts from:"
            all
            all-my
            custom-name="-- Nearby --"
            :custom-val="-1"
          />
        </div>
        <div class="type">
          <label for="typeOptions">Show these posts:</label>
          <b-form-select
            id="typeOptions"
            v-model="type"
            :options="typeOptions"
          />
        </div>
        <div class="sort mb-2">
          <label for="sortOptions">Sort by:</label>
          <b-form-select
            id="sortOptions"
            v-model="sort"
            :options="sortOptions"
            class="shrink"
          />
        </div>
        <div class="close d-flex justify-content-end">
          <b-button
            variant="link"
            title="Hide map and post filters"
            class="noborder close text-dark"
            @click="showFilters = false"
          >
            <v-icon icon="times" />
          </b-button>
        </div>
      </div>
      <div v-if="browseView === 'nearby'" class="isochrones">
        <IsoChrone
          v-for="(isochrone, ix) in isochroneList"
          :id="isochrone.id"
          :key="'isochrone-' + isochrone.id"
          :add-button="ix === 0"
          :last="ix === isochroneList.length - 1"
          @add="showAddIsochrone = true"
        />
        <IsoChrone v-if="showAddIsochrone" @added="added" @cancel="cancel" />
        <p class="help-text d-none d-md-block">
          Adjust the slider to show posts from nearer or further away.
          <nuxt-link no-prefetch to="/settings">Change postcode</nuxt-link>
        </p>
      </div>
      <hr />
      <div class="d-flex justify-content-around mt-2">
        <b-input-group class="shrink">
          <b-form-input
            v-model="search"
            type="text"
            placeholder="Search posts"
            autocomplete="off"
            class="flex-shrink-1"
            size="lg"
            @keyup.enter.exact="doSearch"
          />
          <slot name="append">
            <b-button variant="secondary" title="Search" @click="doSearch">
              <v-icon icon="search" />
            </b-button>
          </slot>
        </b-input-group>
      </div>
    </b-collapse>
    <div v-if="!showFilters" class="d-flex justify-content-between">
      <b-input-group class="shrink">
        <b-form-input
          v-model="search"
          type="text"
          placeholder="Search posts"
          autocomplete="off"
          class="flex-shrink-1"
          size="lg"
          @keyup.enter.exact="doSearch"
        />
        <slot name="append">
          <b-button variant="secondary" title="Search" @click="doSearch">
            <v-icon icon="search" />
          </b-button>
        </slot>
      </b-input-group>
      <b-button
        variant="white"
        title="Show map and post filters"
        class="ms-2"
        @click="showFilters = true"
      >
        <div class="d-flex">
          <div class="d-none d-md-block">Map & Filters</div>
          <v-icon icon="sliders" class="ms-md-2 align-self-center" />
          <v-icon icon="map" class="ms-1 align-self-center" />
        </div>
      </b-button>
    </div>
  </div>
</template>
<script setup>
import { useMiscStore } from '~/stores/misc'
import { useMessageStore } from '~/stores/message'
import { ref, watch } from '#imports'
import { useIsochroneStore } from '~/stores/isochrone'
import { useAuthStore } from '~/stores/auth'

const props = defineProps({
  selectedGroup: {
    type: Number,
    default: 0,
  },
  selectedType: {
    type: String,
    default: 'All',
  },
  selectedSort: {
    type: String,
    default: 'Unseen',
  },
  forceShowFilters: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits([
  'update:search',
  'update:selectedGroup',
  'update:selectedType',
  'update:selectedSort',
])

// Filters should always start closed - users can expand them if needed
const showFilters = ref(false)

watch(
  () => props.forceShowFilters,
  (newVal) => {
    showFilters.value = newVal
  },
  {
    immediate: true,
  }
)

watch(
  showFilters,
  (newVal) => {
    const miscStore = useMiscStore()

    // If we're showing the filters, we want to show the map.  Otherwise we don't.
    // It's a smell that the map is not in this component, but the restructuring to make that happen is quite
    // large
    miscStore.set({
      key: 'hidepostmap',
      value: !newVal,
    })
  },
  {
    immediate: true,
  }
)

// Isochrones
const showAddIsochrone = ref(false)

const isochroneList = computed(() => {
  const store = useIsochroneStore()
  return store.list
})

function added() {
  showAddIsochrone.value = false
}

function cancel() {
  showAddIsochrone.value = false
}

// Search
const search = ref('')

function doSearch() {
  if (search.value) {
    emit('update:search', search.value)
  }
}

watch(search, (newVal, oldVal) => {
  if (!newVal && oldVal) {
    // Search box cleared - trigger search.
    emit('update:search', '')
  }
})

// Selected group.  We have a special case for the 'nearby' group, which is -1.
const browseView = computed(
  () => useAuthStore().user?.settings?.browseView || 'nearby'
)
const group = ref(browseView.value === 'nearby' ? -1 : 0)

watch(
  () => props.selectedGroup,
  (newVal) => {
    group.value = newVal
  }
)

watch(group, async (newVal) => {
  const authStore = useAuthStore()
  const me = useAuthStore().user
  const settings = me?.settings
  const messageStore = useMessageStore()

  if (newVal === -1) {
    // Special case for nearby.
    settings.browseView = 'nearby'

    await authStore.saveAndGet({
      settings,
    })

    emit('update:selectedGroup', 0)

    if (me) {
      // We do this so that UpToDate doesn't show an old count.
      messageStore.fetchCount(me.settings?.browseView, false)
    }
  } else if (newVal === 0) {
    // Special case for all my groups.
    const settings = useAuthStore().user?.settings
    settings.browseView = 'mygroups'

    await authStore.saveAndGet({
      settings,
    })

    if (me) {
      // We do this so that UpToDate doesn't show an old count.
      messageStore.fetchCount(me.settings?.browseView, false)
    }

    emit('update:selectedGroup', 0)
  } else {
    emit('update:selectedGroup', newVal)
  }
})

// Selected type
const typeOptions = [
  {
    value: 'All',
    text: '-- OFFERs & WANTEDs --',
    selected: true,
  },
  {
    value: 'Offer',
    text: 'Just OFFERs',
  },
  {
    value: 'Wanted',
    text: 'Just WANTEDs',
  },
]

const type = ref('All')

watch(
  () => props.selectedType,
  (newVal) => {
    type.value = newVal
  }
)

watch(type, (newVal) => {
  emit('update:selectedType', newVal)
})

// Sort

const sortOptions = [
  {
    value: 'Unseen',
    text: 'Unseen posts first',
    selected: true,
  },
  {
    value: 'Newest',
    text: 'Newest posts first',
  },
]

const authStore = useAuthStore()
const sort = computed({
  get() {
    return authStore.user?.settings?.browseSort || 'Unseen'
  },
  async set(val) {
    const settings = useAuthStore().user?.settings
    settings.browseSort = val

    await authStore.saveAndGet({
      settings,
    })

    emit('update:selectedSort', val)
  },
})
</script>
<style scoped lang="scss">
@import 'assets/css/_color-vars.scss';
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins/_breakpoints';

.shrink {
  width: unset;
}

.noborder {
  border: none !important;
  border-color: $color-white !important;
}

// Remove curved corners from form controls
:deep(.form-select),
:deep(.form-control),
:deep(select),
:deep(input) {
  border-radius: 0 !important;
}

:deep(.input-group) {
  .form-control,
  .btn {
    border-radius: 0 !important;
  }
}

:deep(.btn) {
  border-radius: 0 !important;
}

// Compact labels for mobile
.filters label {
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: $color-gray--darker;
}

.filters {
  display: grid;

  grid-template-columns: 1fr 3rem;
  grid-template-rows: min-content min-content min-content min-content;
  grid-column-gap: 10px;
  grid-row-gap: 10px;

  @include media-breakpoint-up(md) {
    grid-template-columns: 2fr 1fr 3rem;
    grid-template-rows: min-content min-content min-content;
  }

  .group {
    grid-column: 1 / 2;
    grid-row: 1 / 2;
  }

  .type {
    grid-column: 1 / 2;
    grid-row: 2 / 3;

    @include media-breakpoint-up(md) {
      grid-column: 2 / 3;
      grid-row: 1 / 2;
    }
  }

  .sort {
    grid-column: 1 / 2;
    grid-row: 3 / 4;

    @include media-breakpoint-up(md) {
      grid-column: 1 / 2;
      grid-row: 3 / 4;
    }
  }

  .close {
    grid-column: 2 / 3;
    grid-row: 1 / 2;
    background-color: transparent !important;

    @include media-breakpoint-up(md) {
      grid-column: 3 / 4;
    }
  }

  .isochrones {
    grid-column: 1 / 3;
    grid-row: 4 / 5;

    @include media-breakpoint-up(md) {
      grid-column: 1 / 4;
      grid-row: 3 / 4;
    }
  }
}

// Help text - hidden on mobile
.help-text {
  font-size: 0.8rem;
  color: $color-gray--dark;
  margin-top: 0.5rem;
  margin-bottom: 0;
}
</style>
