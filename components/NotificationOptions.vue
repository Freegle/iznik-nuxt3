<template>
  <component
    :is="notificationType"
    id="notification-list"
    class="white text-center notification-list"
    :class="{ 'mr-2': smallScreen, topstack: true }"
    :variant="smallScreen ? 'transparent' : ''"
    toggle-class="notification-list__dropdown-toggle p-0"
    menu-class="notification-list__dropdown-menu"
    lazy
    right
    no-caret
    aria-label="notifications"
    @shown="loadLatestNotifications"
  >
    <template #button-content>
      <div
        class="position-relative"
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
      <NotificationOne :id="notification.id" @showModal="showAboutMe" />
    </b-dropdown-item>
    <infinite-loading
      :key="infiniteId"
      :distance="distance"
      force-use-infinite-wrapper="#notification-list"
      @infinite="loadMoreNotifications"
    >
      <span slot="no-results" />
      <span slot="no-more" />
      <span slot="spinner">
        <b-img lazy src="/loader.gif" alt="Loading" />
      </span>
    </infinite-loading>
  </component>
</template>
<script>
import { useNotificationStore } from '../stores/notification'
import InfiniteLoading from '~/components/InfiniteLoading'

const NotificationOne = () => import('~/components/NotificationOne')

export default {
  name: 'NotificationOptions',
  components: {
    NotificationOne,
    InfiniteLoading,
  },
  props: {
    distance: {
      type: Number,
      required: true,
    },
    smallScreen: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  setup() {
    const notificationStore = useNotificationStore()

    // await notificationStore.fetchList()

    return {
      notificationStore,
    }
  },
  data() {
    return {
      toShow: 5,
      infiniteId: 0,
    }
  },
  computed: {
    notificationType() {
      return 'b-dropdown'
    },
    notifications() {
      // return first
      return this.notificationStore.list
    },
    notificationsToShow() {
      return this.notifications.slice(0, this.toShow)
    },
    unreadNotificationCount() {
      return this.notificationStore.count
    },
  },
  watch: {
    unreadNotificationCount() {
      this.$emit('update:unreadNotificationCount', this.unreadNotificationCount)
    },
  },
  methods: {
    async loadLatestNotifications() {
      // We want to make sure we have the most up to date notifications.
      this.$el.scrollTop = 0
      await this.notificationStore.fetchList()
      this.infiniteId++
      this.toShow = 5
    },
    loadMoreNotifications($state) {
      if (this.toShow < this.notifications.length) {
        this.toShow = Math.min(this.notifications.length, this.toShow + 5)
        $state.loaded()
      } else {
        $state.complete()
      }
    },
    async markAllRead() {
      await this.notificationStore.allSeen()
      await this.notificationStore.fetchCount()
    },
    showAboutMe() {
      this.$emit('showAboutMe')
    },
  },
}
</script>
<style scoped lang="scss">
@import '~bootstrap/scss/functions';
@import '~bootstrap/scss/variables';
@import '~bootstrap/scss/mixins/_breakpoints';

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
  width: min(400px, 100vw);
  overflow-y: auto;

  // The offset property of the b-dropdown doesn't function when contained
  // within a bootstrap nav element.  Therefore we have to manually shuffle
  // it so it fits on a smaller screen
  transform: translate(65px);

  @include media-breakpoint-up(sm) {
    transform: none;
  }
}

:deep(.notification-list .dropdown-item) {
  width: min(400px, 100vw);
  max-width: 100%;
  padding-left: 5px;
  overflow-wrap: break-word;
}

:deep(.dropdown-toggle.show) {
  border-color: transparent !important;
}

.topstack {
  z-index: 10000;
}
</style>
