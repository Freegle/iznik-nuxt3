<template>
  <div
    class="form__element p-2 d-flex justify-content-between flex-column flex-lg-row align-items-md-end"
  >
    <div class="d-flex flex-column flex-md-row mb-3 mb-lg-0">
      <div class="mr-0 mr-md-4 mb-3 mb-md-0 d-flex flex-column">
        <label for="startDate" class="date__label">{{ fromLabel }}</label>
        <b-input-group class="mb-3">
          <b-form-input
            ref="dateInput"
            v-model="current.start"
            type="text"
            placeholder="Start date"
            autocomplete="off"
          />
          <b-input-group-append>
            <b-form-input
              v-model="current.start"
              type="date"
              placeholder="Choose a date"
              :min="minDate"
              :max="maxDate"
            />
          </b-input-group-append>
        </b-input-group>
      </div>
      <div class="mr-lg-4 d-flex flex-column">
        <label for="endDate" class="date__label">{{ toLabel }}</label>
        <b-input-group class="mb-3">
          <b-form-input
            ref="dateInput"
            v-model="current.end"
            type="text"
            placeholder="Enddate"
            autocomplete="off"
          />
          <b-input-group-append>
            <b-form-input
              v-model="current.end"
              type="date"
              placeholder="Choose a date"
              :min="minDate"
              :max="maxDate"
            />
          </b-input-group-append>
        </b-input-group>
      </div>
    </div>
    <div>
      <b-button
        v-if="removable"
        variant="secondary"
        size="sm"
        @click="$emit('remove')"
      >
        <v-icon icon="trash-alt" title="Delete this date" aria-hidden="true" />
        <span class="delete__label">Remove</span>
      </b-button>
    </div>
  </div>
</template>
<script>
import { ref } from 'vue'
import dayjs from 'dayjs'

// Minimum length of event (it's rounded to 30 minute intervals anyway)
const MIN_DURATION_MINUTES = 30

const FORMAT = 'ddd, Do MMM HH:mm a'

export default {
  components: {},
  props: {
    value: {
      type: Object,
      required: true,
    },
    removable: {
      type: Boolean,
      required: false,
      default: true,
    },
    fromLabel: {
      type: String,
      required: false,
      default: 'Starts at:',
    },
    toLabel: {
      type: String,
      required: false,
      default: 'Ends at:',
    },
    maxDurationDays: {
      type: Number,
      required: false,
      default: null,
    },
  },
  setup(props) {
    const current = ref(props.value)

    return {
      current,
    }
  },
  computed: {
    oneHourAfterStart() {
      return dayjs(this.current ? this.current.start : null).add(1, 'hour')
    },
  },
  watch: {
    'current.start'(start, oldStart) {
      if (start) {
        // when the start changes, shift the end too
        const unit = dayjs(oldStart).isSame(dayjs(this.current.end), 'day')
          ? // if start/end are on the same day, shift the end time
            'minute'
          : // otherwise only shift the end day
            'day'
        const changed = dayjs(start).diff(oldStart, unit)
        if (changed !== 0) {
          this.current.end = dayjs(this.current.end).add(changed, unit).toDate()
        }
      } else {
        // clear the end date when the start date is cleared
        this.current.end = null
      }
    },
  },
  created() {
    // used for default start date, 9am bright and early :)
    this.todayAt9am = dayjs().hour(9).minute(0).second(0)

    // custom formatter using dayjs
    this.format = {
      stringify(date) {
        return date ? dayjs(date).format(FORMAT) : ''
      },
      parse(value) {
        return value ? dayjs(value, FORMAT).toDate() : null
      },
    }
  },
  methods: {
    minDate() {
      return dayjs().toDate()
    },
    maxDate() {
      const today = dayjs()
      const start = dayjs(this.current.start)
      const max = start.add(this.maxDurationDays - 1, 'day')

      return dayjs.max(today, start, max).toDate()
    },
    maxTime() {
      return dayjs(this.current.start).add(MIN_DURATION_MINUTES, 'minute')
    },
  },
}
</script>
<style scoped lang="scss">
.form__element {
  border: 1px solid $color-green--lighter;
  border-radius: 0.25rem;
}

.date__label {
  /* Override the style from bootstrap */
  margin-bottom: 0;
}

/* Override the class from Vue2 Datepicker */
.mx-datepicker {
  width: 100%;
}

.delete__label {
  font-size: 14px;
}

/* Style the icon inside the v-icon component */
.fa-icon {
  width: auto;
  height: 16px;
}
</style>
