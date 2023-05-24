<template>
  <div
    class="form__element p-2 d-flex justify-content-between flex-column flex-lg-row align-items-md-end"
  >
    <div v-if="current" class="d-flex flex-column flex-md-row mb-3 mb-lg-0">
      <div class="pe-0 ps-md-2 mb-3 mb-md-0 d-flex flex-column">
        <label for="startDate" class="date__label">{{ fromLabel }}</label>
        <div class="d-flex">
          <b-form-input
            v-model="current.start"
            type="date"
            placeholder="Choose a date"
            :min="today"
            size="15"
          />
          <b-form-input
            v-if="time"
            v-model="current.starttime"
            type="time"
            class="ml-2"
            placeholder="Choose a time"
            list="times"
          />
        </div>
      </div>
      <div class="pe-lg-4 ps-lg-2 d-flex flex-column">
        <label for="endDate" class="date__label">{{ toLabel }}</label>
        <div class="d-flex">
          <b-form-input
            v-model="current.end"
            type="date"
            placeholder="Choose a date"
            :min="minEndDate"
          />
          <b-form-input
            v-if="time"
            v-model="current.endtime"
            type="time"
            class="ml-2"
            placeholder="Choose a time"
            list="times"
          />
        </div>
      </div>
      <datalist id="times">
        <option v-for="atime in timeList" :key="atime" :value="atime" />
      </datalist>
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
import dayjs from 'dayjs'
import minMax from 'dayjs/plugin/minMax'
import { ref } from '#imports'

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
    time: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  setup(props) {
    const current = ref(JSON.parse(JSON.stringify(props.modelValue)))

    return {
      current,
    }
  },
  computed: {
    oneHourAfterStart() {
      return this.current?.start && this.current?.starttime
        ? dayjs(this.current.start + ' ' + this.current.starttime).add(
            1,
            'hour'
          )
        : null
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
    timeList() {
      const ret = []

      for (let hour = 0; hour < 24; hour++) {
        ;['00', 15, 30, 45].forEach((minute) => {
          ret.push(`${hour.toString().padStart(2, '0')}:${minute}`)
        })
      }

      return ret
    },
  },
  watch: {
    'current.start'() {
      this.$nextTick(this.updateEndTime)
    },
    'current.starttime'() {
      this.$nextTick(this.updateEndTime)
    },
    current(newVal) {
      this.$emit('update:modelValue', newVal)
    },
  },
  methods: {
    updateEndTime() {
      if (this.current?.start) {
        if (
          !this.current?.end ||
          dayjs(this.current.end).isBefore(this.current.start)
        ) {
          this.current.end = this.current.start
        }
      }

      if (this.current?.start && this.current?.starttime) {
        if (
          !this.current?.endtime ||
          dayjs(this.current.end + ' ' + this.current.endtime).isBefore(
            this.current.start + ' ' + this.current.starttime
          )
        ) {
          this.current.endtime = this.oneHourAfterStart.format('HH:mm')
        }
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

:deep(input[type='date']) {
  min-width: 140px;
}
</style>
