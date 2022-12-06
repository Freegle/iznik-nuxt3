<template>
  <div>
    <b-row class="align-items-end">
      <b-col cols="12" sm="6">
        <b-form-group label="OFFER and WANTED posts:">
          <b-form-select
            :model-value="emailfrequency"
            :class="highlightEmailFrequencyIfOn"
            @change="(newval) => outcast('emailfrequency', newval)"
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
          :handler="leaveGroup"
          name="trash-alt"
          label="Leave"
          class="mb-3"
        />
      </b-col>
    </b-row>
    <b-row>
      <b-col cols="12" sm="6">
        <b-form-group label="Community Event mails:">
          <OurToggle
            :model-value="eventsallowed"
            class="mt-2"
            :height="30"
            :width="100"
            font-size="14"
            :sync="true"
            :labels="{ checked: 'Weekly', unchecked: 'Off' }"
            color="#61AE24"
            @change="(newval) => outcast('eventsallowed', newval.value)"
          />
        </b-form-group>
      </b-col>
      <b-col cols="12" sm="6">
        <b-form-group label="Volunteer Opportunity mails:">
          <OurToggle
            :model-value="volunteeringallowed"
            class="mt-2"
            :height="30"
            :width="100"
            font-size="14"
            :sync="true"
            :labels="{ checked: 'Weekly', unchecked: 'Off' }"
            color="#61AE24"
            @change="(newval) => outcast('volunteeringallowed', newval.value)"
          />
        </b-form-group>
      </b-col>
    </b-row>
  </div>
</template>
<script>
import OurToggle from '~/components/OurToggle'

export default {
  components: {
    OurToggle,
  },
  props: {
    groupid: {
      type: Number,
      required: false,
      default: null,
    },
    emailfrequency: {
      type: Number,
      required: true,
    },
    eventsallowed: {
      type: Boolean,
      required: true,
    },
    volunteeringallowed: {
      type: Boolean,
      required: true,
    },
    leave: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  setup() {},
  data() {
    return {
      leaving: false,
    }
  },
  computed: {
    membership() {
      let ret = null

      if (this.myGroups) {
        this.myGroups.forEach((g) => {
          if (g.id === this.groupid) {
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
    outcast(param, val) {
      this.$emit('update:' + param, val)
      this.$emit('change', {
        groupid: this.groupid,
        param,
        val,
      })
    },
    leaveGroup() {
      this.$emit('leave')
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
