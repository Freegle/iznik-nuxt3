<template>
  <div class="settings-group">
    <div class="setting-row">
      <span class="setting-label">{{ label }}</span>
      <b-form-select
        v-model="emailfreq"
        :class="highlightEmailFrequencyIfOn"
        class="frequency-select"
      >
        <option value="-1">Immediately</option>
        <option value="24">Daily</option>
        <option value="0">Never</option>
      </b-form-select>
    </div>

    <div v-if="!eventshide" class="setting-row">
      <span class="setting-label">Community events</span>
      <OurToggle
        v-model="eventsallowed"
        size="sm"
        :labels="{ checked: 'On', unchecked: 'Off' }"
      />
    </div>

    <div v-if="!volunteerhide" class="setting-row">
      <span class="setting-label">Volunteer opportunities</span>
      <OurToggle
        v-model="volunteeringallowed"
        size="sm"
        :labels="{ checked: 'On', unchecked: 'Off' }"
      />
    </div>

    <div v-if="leave" class="leave-row">
      <SpinButton
        variant="link"
        icon-name="trash-alt"
        label="Leave this community"
        class="leave-btn"
        @handle="leaveGroup"
      />
    </div>
  </div>
</template>
<script setup>
import { computed } from 'vue'
import { useAuthStore } from '~/stores/auth'
import OurToggle from '~/components/OurToggle'
import SpinButton from '~/components/SpinButton'
import { useMe } from '~/composables/useMe'

const props = defineProps({
  membershipMT: {
    // MT and do not set groupid
    type: Object,
    required: false,
    default: null,
  },
  emailfrequency: {
    type: Number,
    required: false,
    default: null,
  },
  groupid: {
    type: Number,
    required: false,
    default: null,
  },
  leave: {
    type: Boolean,
    required: false,
    default: false,
  },
  label: {
    type: String,
    required: false,
    default: 'OFFER/WANTED emails',
  },
  eventshide: {
    type: Boolean,
    required: false,
    default: false,
  },
  volunteerhide: {
    type: Boolean,
    required: false,
    default: false,
  },
})

const emit = defineEmits([
  'update:emailfrequency',
  'update:eventsallowed',
  'update:volunteeringallowed',
  'leave',
])

const authStore = useAuthStore()
const { myGroups } = useMe()
const myid = computed(() => authStore.user?.id)

const membership = computed(() => {
  let ret = null
  if (props.membershipMT) return props.membershipMT // MT

  if (myGroups.value) {
    myGroups.value.forEach((g) => {
      if (!props.groupid || g.id === props.groupid) {
        ret = g
      }
    })
  }

  return ret
})

const highlightEmailFrequencyIfOn = computed(() => {
  return props.emailfrequency === 0 ? 'frequency-off' : 'frequency-on'
})

const emailfreq = computed({
  get() {
    if (membership.value) {
      return membership.value.emailfrequency.toString()
    }
    return props.emailfrequency?.toString()
  },
  async set(newval) {
    await changeValue('emailfrequency', newval)
  },
})

const eventsallowed = computed({
  get() {
    return Boolean(membership.value?.eventsallowed)
  },
  async set(newval) {
    await changeValue('eventsallowed', newval ? 1 : 0)
  },
})

const volunteeringallowed = computed({
  get() {
    return Boolean(membership.value?.volunteeringallowed)
  },
  async set(newval) {
    await changeValue('volunteeringallowed', newval ? 1 : 0)
  },
})

async function changeValue(param, val) {
  emit('update:' + param, val)

  if (props.groupid) {
    const params = {
      userid: myid.value,
      groupid: props.groupid,
    }
    params[param] = parseInt(val)
    await authStore.setGroup(params)
  }
}

function leaveGroup(callback) {
  emit('leave')
  callback()
}
</script>
<style scoped lang="scss">
@import 'assets/css/_color-vars.scss';

.settings-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.setting-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.setting-label {
  font-size: 0.9rem;
  color: $color-gray--darker;
}

.frequency-select {
  width: auto;
  min-width: 120px;
  font-size: 0.9rem;

  &.frequency-on {
    border: 2px solid $color-green-background;
  }

  &.frequency-off {
    border: 1px solid $color-gray--dark;
  }
}

.leave-row {
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.leave-btn {
  color: $color-gray--dark;
  padding: 0;
  font-size: 0.85rem;

  &:hover {
    color: $color-red;
  }
}
</style>
