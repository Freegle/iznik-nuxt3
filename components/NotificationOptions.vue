<template>
  <b-dropdown
    id="notification-list"
    ref="theel"
    v-model="notificationsShown"
    class="white text-center notification-list topstack"
    :variant="smallScreen ? 'transparent' : ''"
    toggle-class="notification-list__dropdown-toggle p-xl-0"
    menu-class="notification-list__dropdown-menu"
    lazy
    right
    no-caret
    aria-label="notifications"
    @shown="loadLatestNotifications"
  >
    <template #button-content>
      <div
        class="position-relative me-md-2 me-xl-0"
        :class="{ 'text-center small': !smallScreen }"
      >
        <v-icon icon="bell" class="fa-2 notification-list__icon" />
        <b-badge
          v-if="unreadNotificationCount"
          variant="danger"
          class="notification-badge"
        >
          {{ unreadNotificationCount }}
        </b-badge>
        <div v-if="!smallScreen" class="nav-item__text">Notifications</div>
      </div>
    </template>
    <b-dropdown-item
      v-if="notifications.length"
      link-class="notification-list__item"
    >
      <div class="d-flex justify-content-end">
        <b-button variant="secondary" size="sm" @click="markAllRead">
          Mark all read
        </b-button>
      </div>
    </b-dropdown-item>
    <b-dropdown-divider />
    <b-dropdown-item
      v-for="notification in notificationsToShow"
      :key="'notification-' + notification.id"
      link-class="notification-list__item p-1"
    >
      <NotificationOne :id="notification.id" @show-modal="showAboutMe" />
    </b-dropdown-item>
    <infinite-loading
      :key="infiniteId"
      :distance="distance"
      force-use-infinite-wrapper="#notification-list"
      @infinite="loadMoreNotifications"
    >
      <template #no-results />
      <template #no-more />
      <template #spinner>
        <b-img lazy src="/loader.gif" alt="Loading" width="100px" />
      </template>
    </infinite-loading>
  </b-dropdown>
</template>
<script setup>
import { ref, watch, computed, defineAsyncComponent } from 'vue'
import { storeToRefs } from 'pinia'
import { useNotificationStore } from '~/stores/notification'

const InfiniteLoading = defineAsyncComponent(() =>
  import('~/components/InfiniteLoading')
)
const NotificationOne = defineAsyncComponent(() =>
  import('~/components/NotificationOne')
)

const notificationStore = useNotificationStore()

defineProps({
  distance: {
    type: Number,
    required: true,
  },
  smallScreen: {
    type: Boolean,
    required: false,
    default: false,
  },
})

const notificationsShown = ref(false)
const toShow = ref(5)
const infiniteId = ref(0)
const notifications = computed(() => {
  // return first
  return notificationStore.list
})
const notificationsToShow = computed(() => {
  return notifications.value.slice(0, toShow.value)
})

const { count } = storeToRefs(notificationStore)
const unreadNotificationCount = count

const theel = ref(null)

const loadLatestNotifications = async () => {
  // We want to make sure we have the most up to date notifications.
  await notificationStore.fetchList()
  infiniteId.value++
  toShow.value = 5

  if (theel.value) {
    theel.value.scrollTop = 0
  }
}

const loadMoreNotifications = ($state) => {
  if (toShow.value < notifications.value.length) {
    toShow.value = Math.min(notifications.value.length, toShow.value + 5)
    $state.loaded()
  } else {
    $state.complete()
  }
}
const markAllRead = async () => {
  await notificationStore.allSeen()
}

const emit = defineEmits([
  'update:notificationsShown',
  'update:unreadNotificationCount',
  'showAboutMe',
])

watch(unreadNotificationCount, (newVal) => {
  emit('update:unreadNotificationCount', newVal)
})

watch(notificationsShown, (newVal) => {
  emit('update:notificationsShown', newVal)
})

const showAboutMe = () => {
  emit('showAboutMe')
}
</script>
<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins/_breakpoints';

.notification-badge {
  position: absolute;
  top: 0px;
  left: 18px;

  @include media-breakpoint-up(xl) {
    left: 45px;
    top: 3px;
  }
}

.notification-list {
  max-width: 100%;
}

.notification-list__icon {
  height: 32px;
  margin-bottom: 0;
}

/* These classes style the bootstrap b-nav-item-dropdown component */
:deep(.notification-list__dropdown-toggle) {
  color: $color-white !important;

  &:hover {
    color: $color-white-opacity-75 !important;
  }
}

:deep(.notification-list__dropdown-menu) {
  height: 500px;
  width: min(400px, 100vw) !important;
  overflow-y: auto;

  @include media-breakpoint-down(md) {
    width: 300px;
    right: -51px;
  }
}

:deep(.notification-list .dropdown-item) {
  width: min(400px, 100vw) !important;
  max-width: 100%;
  padding-left: 5px;
  overflow-wrap: break-word;

  @include media-breakpoint-down(md) {
    width: 300px;
    right: -51px;
  }
}

:deep(.dropdown-toggle.show) {
  border-color: transparent !important;
}

.topstack {
  z-index: 10000;
}
</style>
