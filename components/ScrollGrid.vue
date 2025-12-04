<template>
  <div>
    <slot name="header" />

    <div v-if="items?.length" class="scroll-grid">
      <!-- Mobile/tablet: 2-column grid -->
      <VisibleWhen :at="['xs', 'sm', 'md']">
        <div v-for="(item, ix) in visibleItems" :key="itemKey(item, ix)">
          <div v-if="ix % 2 === 0">
            <!-- Full-width slot before this row -->
            <slot name="before-row" :item="item" :index="ix" />
            <slot
              v-if="ix + 1 < visibleItems.length"
              name="before-row"
              :item="visibleItems[ix + 1]"
              :index="ix + 1"
            />
            <div class="twocolumn">
              <div class="onecolumn">
                <slot name="item" :item="item" :index="ix" />
              </div>
              <div v-if="ix + 1 < visibleItems.length" class="onecolumn">
                <slot
                  name="item"
                  :item="visibleItems[ix + 1]"
                  :index="ix + 1"
                />
              </div>
            </div>
          </div>
        </div>
      </VisibleWhen>

      <!-- Desktop: single column -->
      <VisibleWhen :not="['xs', 'sm', 'md']">
        <div
          v-for="(item, ix) in visibleItems"
          :key="itemKey(item, ix)"
          class="scroll-grid__item"
        >
          <slot name="before-row" :item="item" :index="ix" />
          <slot name="item" :item="item" :index="ix" />
        </div>
      </VisibleWhen>

      <infinite-loading
        :identifier="infiniteId"
        :distance="distance"
        @infinite="loadMore"
      >
        <template #error>&nbsp;</template>
        <template #complete>&nbsp;</template>
        <template #spinner>
          <div class="text-center">
            <b-img lazy src="/loader.gif" alt="Loading" width="100px" />
          </div>
        </template>
      </infinite-loading>
    </div>

    <!-- Empty state -->
    <div v-else-if="!loading" class="scroll-grid__empty">
      <slot name="empty">
        <v-icon :icon="emptyIcon" class="scroll-grid__empty-icon" />
        <p>{{ emptyText }}</p>
      </slot>
    </div>

    <slot name="footer" />
  </div>
</template>
<script setup>
import { ref, computed, watch } from 'vue'
import VisibleWhen from '~/components/VisibleWhen'
import InfiniteLoading from '~/components/InfiniteLoading'

const props = defineProps({
  items: {
    type: Array,
    required: true,
  },
  keyField: {
    type: String,
    default: 'id',
  },
  loading: {
    type: Boolean,
    default: false,
  },
  distance: {
    type: Number,
    default: 1000,
  },
  emptyIcon: {
    type: String,
    default: 'inbox',
  },
  emptyText: {
    type: String,
    default: 'Nothing to show.',
  },
  initialCount: {
    type: Number,
    default: 10,
  },
})

const toShow = ref(props.initialCount)
const infiniteId = ref(+new Date())

const visibleItems = computed(() => {
  return props.items.slice(0, toShow.value)
})

function itemKey(item, index) {
  return props.keyField && item[props.keyField] ? item[props.keyField] : index
}

function loadMore($state) {
  if (toShow.value < props.items.length) {
    toShow.value++
    $state.loaded()
  } else {
    $state.complete()
  }
}

/* Reset when items change */
watch(
  () => props.items?.length,
  () => {
    toShow.value = props.initialCount
    infiniteId.value = +new Date()
  }
)
</script>
<style scoped lang="scss">
@import 'bootstrap/scss/_functions';
@import 'bootstrap/scss/_variables';
@import 'bootstrap/scss/mixins/_breakpoints';
@import 'assets/css/_color-vars.scss';

.scroll-grid__item {
  margin-bottom: 0.5rem;
}

.twocolumn {
  display: flex;
  flex-direction: column;
  margin-bottom: 5px;

  @media only screen and (min-width: 360px) {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-column-gap: 5px;
    align-items: stretch;
  }
}

.onecolumn {
  display: flex;
  flex-direction: column;
  margin-bottom: 5px;
  min-width: 0;

  @media only screen and (min-width: 360px) {
    margin-bottom: 0;
  }

  :deep(> *) {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  :deep(> * > *) {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  :deep(> * > * > *) {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  :deep(> * > * > * > *) {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
}

.scroll-grid__empty {
  text-align: center;
  padding: 3rem 1rem;
  background: white;
  margin: 0.5rem;

  .scroll-grid__empty-icon {
    font-size: 3rem;
    color: $color-gray--dark;
    margin-bottom: 1rem;
  }

  p {
    color: $color-gray--dark;
    margin-bottom: 1rem;
  }
}
</style>
