<template>
  <span class="d-inline user-ratings">
    <span v-if="user?.info?.ratings">
      <span v-if="showName">
        {{ user.displayname }}
      </span>
      <b-button
        :key="`up-${displayMine}-${displayUpCount}`"
        v-b-tooltip.bottom="noTooltips || showDown || showRemove ? '' : uptitle"
        :size="size"
        :variant="displayUpCount > 0 ? 'primary' : 'white'"
        :disabled="disabled || user.id === myid"
        :class="{
          mine: displayMine === 'Up',
          'mr-1': true,
        }"
        @click.stop="up"
      >
        <v-icon icon="thumbs-up" />&nbsp;{{ displayUpCount }}
      </b-button>
      <b-button
        :key="`down-${displayMine}-${displayDownCount}`"
        v-b-tooltip.bottom="
          noTooltips || showDown || showRemove ? '' : downtitle
        "
        :size="size"
        :variant="displayDownCount > 0 ? 'warning' : 'white'"
        :disabled="disabled || user.id === myid"
        :class="{
          mine: displayMine === 'Down',
          'ml-1': true,
        }"
        @click.stop="down"
      >
        <v-icon icon="thumbs-down" />&nbsp;{{ displayDownCount }}
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
import { useUserStore } from '~/stores/user'
import { useMe } from '~/composables/useMe'

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
// Use myid computed property from useMe composable for consistency
const { myid } = useMe()

const showDown = ref(false)
const showRemove = ref(false)

// Track the last rating we clicked locally. This ensures the UI updates
// immediately after a click, regardless of store timing/race conditions.
// null means we haven't clicked anything yet; 'Up', 'Down', or 'None' means we have.
const clickedRating = ref(null)
// Store the counts at the time of click so we can compute correct display values.
const clickedUpCount = ref(null)
const clickedDownCount = ref(null)

// Fetch user data
userStore.fetch(props.id)

const user = computed(() => {
  let ret = null

  if (props.id) {
    const user = userStore?.byId(props.id)

    if (user && user.info) {
      ret = user
    }
  }

  return ret
})

// Display values that prefer local click state over store state
const displayMine = computed(() => {
  if (clickedRating.value !== null) {
    return clickedRating.value === 'None' ? null : clickedRating.value
  }
  return user.value?.info?.ratings?.Mine
})

const displayUpCount = computed(() => {
  if (clickedRating.value !== null) {
    return clickedUpCount.value
  }
  return user.value?.info?.ratings?.Up ?? 0
})

const displayDownCount = computed(() => {
  if (clickedRating.value !== null) {
    return clickedDownCount.value
  }
  return user.value?.info?.ratings?.Down ?? 0
})

const uptitle = computed(() => {
  if (displayMine.value === 'Up') {
    return 'You gave them a thumbs up.  Click to undo.'
  } else {
    return (
      displayUpCount.value +
      ' freegler' +
      (displayUpCount.value !== 1 ? 's' : '') +
      '  gave them a thumbs up.  Click to rate, click again to undo.'
    )
  }
})

const downtitle = computed(() => {
  if (displayMine.value === 'Down') {
    return 'You gave them a thumbs down.  Click to undo.'
  } else {
    return (
      displayDownCount.value +
      ' freegler' +
      (displayDownCount.value !== 1 ? 's' : '') +
      '  gave them a thumbs down.  Click to rate, click again to undo.'
    )
  }
})

const setClickedState = (newRating) => {
  // Get current counts from display values (which may already be from a previous click)
  const currentUp = displayUpCount.value
  const currentDown = displayDownCount.value
  const currentMine = displayMine.value

  // Calculate the new counts based on what we're changing to
  let newUp = currentUp
  let newDown = currentDown

  // If we had a previous rating, remove its count
  if (currentMine === 'Up') {
    newUp--
  } else if (currentMine === 'Down') {
    newDown--
  }

  // Add count for the new rating (unless it's 'None' meaning we're removing)
  if (newRating === 'Up') {
    newUp++
  } else if (newRating === 'Down') {
    newDown++
  }

  clickedRating.value = newRating
  clickedUpCount.value = newUp
  clickedDownCount.value = newDown
}

const rate = async (rating, reason, text) => {
  await userStore.rate(props.id, rating, reason, text)
}

const up = async () => {
  showDown.value = false
  if (displayMine.value === 'Up') {
    // Already rated up - show modal to confirm removal
    emit('modal-opening')
    if (props.externalModals) {
      emit('show-remove-modal', props.id)
    } else {
      showRemove.value = true
    }
  } else {
    // Set local state immediately so UI updates
    setClickedState('Up')
    await rate('Up')
  }
}

const down = () => {
  showDown.value = false

  if (displayMine.value === 'Down') {
    // Already rated down - show modal to confirm removal
    emit('modal-opening')
    if (props.externalModals) {
      emit('show-remove-modal', props.id)
    } else {
      showRemove.value = true
    }
  } else {
    // Show down modal to collect reason
    emit('modal-opening')
    if (props.externalModals) {
      emit('show-down-modal', props.id)
    } else {
      showDown.value = true
    }
  }
}

const onModalRated = (rating) => {
  // Modal completed a rating action - update local state
  setClickedState(rating)
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
