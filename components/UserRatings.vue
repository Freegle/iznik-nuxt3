<template>
  <span
    class="d-inline user-ratings"
    data-test-static="hello"
    :data-debug-id="id"
    :data-debug-myid="myid"
    :data-debug-mounted="mounted"
  >
    <span v-if="user?.info?.ratings">
      <span v-if="showName">
        {{ user.displayname }}
      </span>
      <b-button
        v-b-tooltip.bottom="noTooltips || showDown || showRemove ? '' : uptitle"
        :size="size"
        :variant="user.info.ratings.Up > 0 ? 'primary' : 'white'"
        :disabled="disabled || user.id === myid"
        :class="{
          mine: user.info.ratings.Mine === 'Up',
          'mr-1': true,
        }"
        @click.stop="up"
      >
        <v-icon icon="thumbs-up" />&nbsp;{{ user.info.ratings.Up }}
      </b-button>
      <b-button
        v-b-tooltip.bottom="
          noTooltips || showDown || showRemove ? '' : downtitle
        "
        :size="size"
        :variant="user.info.ratings.Down > 0 ? 'warning' : 'white'"
        :disabled="disabled || user.id === myid"
        :class="{
          mine: user.info.ratings.Mine === 'Down',
          'ml-1': true,
        }"
        @click.stop="down"
      >
        <v-icon icon="thumbs-down" />&nbsp;{{ user.info.ratings.Down }}
      </b-button>
    </span>
    <UserRatingsDownModal
      v-if="showDown && !externalModals"
      :id="id"
      @rated="onModalRated"
    />
    <UserRatingsRemoveModal
      v-if="showRemove && !externalModals"
      :id="id"
      @rated="onModalRated"
    />
  </span>
</template>
<script setup>
import { onMounted } from 'vue'
import { useUserStore } from '~/stores/user'
import { useMe } from '~/composables/useMe'

// Use console.warn for debugging - console.log is stripped in production builds
console.warn('UserRatings: Script setup executing')

const UserRatingsDownModal = defineAsyncComponent(() =>
  import('~/components/UserRatingsDownModal')
)

const UserRatingsRemoveModal = defineAsyncComponent(() =>
  import('~/components/UserRatingsRemoveModal')
)

const props = defineProps({
  id: {
    type: Number,
    required: false,
    default: null,
  },
  size: {
    type: String,
    required: false,
    default: 'md',
  },
  disabled: {
    type: Boolean,
    required: false,
    default: false,
  },
  showName: {
    type: Boolean,
    required: false,
    default: false,
  },
  noTooltips: {
    type: Boolean,
    required: false,
    default: false,
  },
  externalModals: {
    type: Boolean,
    required: false,
    default: false,
  },
})

const emit = defineEmits([
  'modal-opening',
  'show-down-modal',
  'show-remove-modal',
])

const userStore = useUserStore()
const { myid } = useMe()

const showDown = ref(false)
const showRemove = ref(false)
const mounted = ref(false)

console.warn('UserRatings: Fetching user data for id:', props.id)

// Fetch user data - show cached immediately, then refresh in background.
// These are fire-and-forget - the computed will reactively update when store changes.
userStore.fetch(props.id)
userStore.fetch(props.id, true)

onMounted(() => {
  mounted.value = true
  console.warn(
    'UserRatings: onMounted called, id:',
    props.id,
    'myid:',
    myid.value
  )
})

const user = computed(() => {
  let ret = null

  if (props.id) {
    const u = userStore?.byId(props.id)

    if (u && u.info) {
      ret = u
    }
  }

  return ret
})

const uptitle = computed(() => {
  if (user.value?.info?.ratings?.Mine === 'Up') {
    return 'You gave them a thumbs up.  Click to undo.'
  } else {
    return (
      user.value?.info?.ratings?.Up +
      ' freegler' +
      (user.value?.info?.ratings?.Up !== 1 ? 's' : '') +
      '  gave them a thumbs up.  Click to rate, click again to undo.'
    )
  }
})

const downtitle = computed(() => {
  if (user.value?.info?.ratings?.Mine === 'Down') {
    return 'You gave them a thumbs down.  Click to undo.'
  } else {
    return (
      user.value?.info?.ratings?.Down +
      ' freegler' +
      (user.value?.info?.ratings?.Down !== 1 ? 's' : '') +
      '  gave them a thumbs down.  Click to rate, click again to undo.'
    )
  }
})

const rate = async (rating, reason, text) => {
  console.warn(
    'UserRatings: rate() called with:',
    rating,
    'for user:',
    props.id
  )
  await userStore.rate(props.id, rating, reason, text)
  console.warn('UserRatings: rate() completed, refreshing user data')
  // Explicitly refresh user data after rating to ensure UI updates
  await userStore.fetch(props.id, true)
  console.warn('UserRatings: User data refreshed')
}

const up = async () => {
  console.warn(
    'UserRatings: up() clicked, current Mine:',
    user.value?.info?.ratings?.Mine
  )
  showDown.value = false
  if (user.value?.info?.ratings?.Mine === 'Up') {
    console.warn('UserRatings: Already rated up, showing remove modal')
    emit('modal-opening')
    if (props.externalModals) {
      emit('show-remove-modal', props.id)
    } else {
      showRemove.value = true
    }
  } else {
    console.warn('UserRatings: Rating up')
    await rate('Up')
  }
}

const down = () => {
  console.warn(
    'UserRatings: down() clicked, current Mine:',
    user.value?.info?.ratings?.Mine
  )
  showDown.value = false

  if (user.value?.info?.ratings?.Mine === 'Down') {
    console.warn('UserRatings: Already rated down, showing remove modal')
    emit('modal-opening')
    if (props.externalModals) {
      emit('show-remove-modal', props.id)
    } else {
      showRemove.value = true
    }
  } else {
    console.warn('UserRatings: Showing down modal')
    emit('modal-opening')
    if (props.externalModals) {
      emit('show-down-modal', props.id)
    } else {
      showDown.value = true
    }
  }
}

const onModalRated = () => {
  console.warn('UserRatings: onModalRated called, refreshing user data')
  userStore.fetch(props.id, true)
}
</script>
<style scoped lang="scss">
.btn {
  margin: 1px;

  &.mine,
  &:hover {
    margin: 0px;
    border: 2px solid $color-black;
    box-shadow: 0px 0px 4px 1px $color-gray--dark;
  }
}

.btn-white:hover {
  background-color: white;
  color: black;
}
</style>
