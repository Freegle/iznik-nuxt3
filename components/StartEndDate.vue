<template>
  <div
    class="form__element p-2 d-flex justify-content-between flex-column flex-lg-row align-items-md-end"
  >
    <div v-if="current" class="d-flex flex-column flex-md-row mb-3 mb-lg-0">
      <div class="pe-0 ps-md-2 mb-3 mb-md-0 d-flex flex-column">
        <label for="startDate" class="date__label">{{ fromLabel }}</label>
        <b-form-input
          v-model="current.start"
          type="date"
          placeholder="Choose a date"
          :min="today"
        />
      </div>
      <div class="pe-lg-4 ps-lg-2 d-flex flex-column">
        <label for="endDate" class="date__label">{{ toLabel }}</label>
        <b-form-input
          v-model="current.end"
          type="date"
          placeholder="Choose a date"
          :min="minEndDate"
        />
      </div>
    </div>
    <div>
      <b-button
        v-if="removable"
        variant="secondary"
        size="md"
        class="me-2"
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
import minMax from 'dayjs/plugin/minMax'

dayjs.extend(minMax)

export default {
  components: {},
  props: {
    modelValue: {
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
    const current = ref(props.modelValue)

    return {
      current,
    }
  },
  computed: {
    oneHourAfterStart() {
      return dayjs(this.current ? this.current.start : null).add(1, 'hour')
    },
    today() {
      return dayjs().format('YYYY-MM-DD')
    },
    minEndDate() {
      const start = this.current?.start

      if (start) {
        return start
      } else {
        return this.today
      }
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
          this.current.end = dayjs(this.current.end)
            .add(changed, unit)
            .format('YYYY-MM-DD')
        }
      } else {
        // clear the end date when the start date is cleared
        this.current.end = null
      }
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
