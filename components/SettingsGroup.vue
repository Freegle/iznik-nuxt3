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
<script>
import { useAuthStore } from '../stores/auth'
import OurToggle from '~/components/OurToggle'

export default {
  components: {
    OurToggle,
  },
  props: {
    membershipMT: { // TODO
      type: Object,
      required: false,
      default: null,
    },
    eventsallowedMT: { // TODO
      type: Number,
      required: false,
      default: null,
    },
    volunteeringallowedMT: { // TODO
      type: Number,
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
  },
  setup() {
    const authStore = useAuthStore()

    return {
      authStore,
    }
  },
  data() {
    return {
      leaving: false,
    }
  },
  computed: {
    emailfreq: {
      get() {
        if (this.membership) {
          return this.membership.emailfrequency.toString()
        }

        return this.emailfrequency
      },
      async set(newval) {
        await this.changeValue('emailfrequency', newval)
      },
    },
    eventsallowed: {
      get() {
        if( this.eventsallowedMT) return Boolean(this.eventsallowedMT)
        return Boolean(this.membership?.eventsallowed)
      },
      async set(newval) {
        console.log('Set eventsallowed', newval)
        await this.changeValue('eventsallowed', newval ? 1 : 0)
      },
    },
    volunteeringallowed: {
      get() {
        if( this.volunteeringallowedMT) return Boolean(this.volunteeringallowedMT)
        return Boolean(this.membership?.volunteeringallowed)
      },
      async set(newval) {
        await this.changeValue('volunteeringallowed', newval ? 1 : 0)
      },
    },
    membership() {
      let ret = null
      if( this.membershipMT) return this.membershipMT

      if (this.myGroups) {
        this.myGroups.forEach((g) => {
          // Groupid can be null for the simple settings which are shared across all groups.
          if (!this.groupid || g.id === this.groupid) {
            ret = g
          }
        })
      }

      return ret
    },
    highlightEmailFrequencyIfOn() {
      // 0 = Never receive email
      // All other values are receiving email
      return this.emailfrequency === 0
        ? 'email-frequency__dropdown--off'
        : 'email-frequency__dropdown--on'
    },
  },
  methods: {
    async changeValue(param, val) {
      this.$emit('update:' + param, val)

      if (this.groupid) {
        const params = {
          userid: this.myid,
          groupid: this.groupid,
        }

        params[param] = parseInt(val)

        await this.authStore.setGroup(params)
      }
    },
    leaveGroup(callback) {
      this.$emit('leave')
      callback()
    },
  },
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
