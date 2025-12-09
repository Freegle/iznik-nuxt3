<template>
  <span class="d-inline user-ratings">
    <span v-if="user?.info?.ratings">
      <span v-if="showName">
        {{ user.displayname }}
      </span>
      <b-button
        v-b-tooltip.bottom="showDown || showRemove ? '' : uptitle"
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
        v-b-tooltip.bottom="showDown || showRemove ? '' : downtitle"
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
    <UserRatingsDownModal v-if="showDown" :id="id" />
    <UserRatingsRemoveModal v-if="showRemove" :id="id" />
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
})

const emit = defineEmits(['modal-opening'])

const userStore = useUserStore()
// Use myid computed property from useMe composable for consistency
const { myid } = useMe()

const showDown = ref(false)
const showRemove = ref(false)

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
  await userStore.rate(props.id, rating, reason, text)
}

const up = async () => {
  showDown.value = false
  if (user.value?.info?.ratings?.Mine === 'Up') {
    emit('modal-opening')
    showRemove.value = true
  } else {
    await rate('Up')
  }
}

const down = () => {
  showDown.value = false

  if (user.value?.info?.ratings?.Mine === 'Down') {
    emit('modal-opening')
    showRemove.value = true
  } else {
    emit('modal-opening')
    showDown.value = true
  }
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
