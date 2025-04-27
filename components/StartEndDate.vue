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
<script setup>
import dayjs from 'dayjs'
import minMax from 'dayjs/plugin/minMax'
import { ref, computed, watch, nextTick } from 'vue'

dayjs.extend(minMax)

const props = defineProps({
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
})

const emit = defineEmits(['update:modelValue', 'remove'])

const current = ref(JSON.parse(JSON.stringify(props.modelValue)))

const oneHourAfterStart = computed(() => {
  return current.value?.start && current.value?.starttime
    ? dayjs(current.value.start + ' ' + current.value.starttime).add(1, 'hour')
    : null
})

const today = computed(() => {
  return dayjs().format('YYYY-MM-DD')
})

const minEndDate = computed(() => {
  const start = current.value?.start

  if (start) {
    return start
  } else {
    return today.value
  }
})

const timeList = computed(() => {
  const ret = []

  for (let hour = 0; hour < 24; hour++) {
    ;['00', 15, 30, 45].forEach((minute) => {
      ret.push(`${hour.toString().padStart(2, '0')}:${minute}`)
    })
  }

  return ret
})

function updateEndTime() {
  if (current.value?.start) {
    if (
      !current.value?.end ||
      dayjs(current.value.end).isBefore(current.value.start)
    ) {
      current.value.end = current.value.start
    }
  }

  if (current.value?.start && current.value?.starttime) {
    if (
      !current.value?.endtime ||
      dayjs(current.value.end + ' ' + current.value.endtime).isBefore(
        current.value.start + ' ' + current.value.starttime
      )
    ) {
      current.value.endtime = oneHourAfterStart.value.format('HH:mm')
    }
  }
}

watch(
  () => current.value.start,
  () => {
    nextTick(updateEndTime)
  }
)

watch(
  () => current.value.starttime,
  () => {
    nextTick(updateEndTime)
  }
)

watch(
  current,
  (newVal) => {
    emit('update:modelValue', newVal)
  },
  { deep: true }
)
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
