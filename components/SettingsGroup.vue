<template>
  <div>
    <b-row class="align-items-end">
      <b-col cols="12" sm="6">
        <b-form-group :label="label">
          <b-form-select
            v-model="emailfreq"
            :class="highlightEmailFrequencyIfOn"
          >
            <option value="-1">Immediately</option>
            <option value="24">Every day</option>
            <option value="0">Never</option>
          </b-form-select>
        </b-form-group>
      </b-col>
      <b-col v-if="leave" cols="12" sm="6">
        <SpinButton
          variant="secondary"
          icon-name="trash-alt"
          label="Leave"
          class="mb-3"
          @handle="leaveGroup"
        />
      </b-col>
    </b-row>
    <b-row>
      <b-col v-if="!eventshide" cols="12" sm="6">
        <b-form-group label="Community Event mails:">
          <OurToggle
            v-model="eventsallowed"
            class="mt-2"
            :height="30"
            :width="100"
            font-size="14"
            :sync="true"
            :labels="{ checked: 'Sending weekly', unchecked: 'Not sending' }"
            color="#61AE24"
          />
        </b-form-group>
      </b-col>
      <b-col v-if="!volunteerhide" cols="12" sm="6">
        <b-form-group label="Volunteer Opportunity mails:">
          <OurToggle
            v-model="volunteeringallowed"
            class="mt-2"
            :height="30"
            :width="100"
            font-size="14"
            :sync="true"
            :labels="{ checked: 'Sending weekly', unchecked: 'Not sending' }"
            color="#61AE24"
          />
        </b-form-group>
      </b-col>
    </b-row>
  </div>
</template>
<script setup>
import { computed } from 'vue'
import { useAuthStore } from '~/stores/auth'
import OurToggle from '~/components/OurToggle'
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
    default: 'OFFER and WANTED posts:',
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
      // Groupid can be null for the simple settings which are shared across all groups.
      if (!props.groupid || g.id === props.groupid) {
        ret = g
      }
    })
  }

  return ret
})

const highlightEmailFrequencyIfOn = computed(() => {
  // 0 = Never receive email
  // All other values are receiving email
  return props.emailfrequency === 0
    ? 'email-frequency__dropdown--off'
    : 'email-frequency__dropdown--on'
})

// Computed with getters and setters
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
    console.log('Set eventsallowed', newval)
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

// Methods
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
.email-frequency__dropdown--on {
  border: 2px solid $colour-success;
}

.email-frequency__dropdown--off {
  border: 1px solid $color-gray-4;
}
</style>
