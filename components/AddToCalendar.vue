<template>
  <div>
    <b-button
      :variant="variant"
      :size="size"
      :class="btnClass"
      @click="download"
    >
      <v-icon icon="calendar-alt" />
      Add to Calendar
    </b-button>
  </div>
</template>
<script setup>
import saveAs from 'save-file'

const props = defineProps({
  variant: {
    type: String,
    required: false,
    default: 'secondary',
  },
  ics: {
    type: String,
    required: true,
  },
  size: {
    type: String,
    required: false,
    default: 'md',
  },
  btnClass: {
    type: String,
    required: false,
    default: '',
  },
})

async function download(e) {
  e.preventDefault()
  e.stopPropagation()
  const blob = new Blob([props.ics], { type: 'text/calendar;charset=utf-8' })
  await saveAs(blob, 'freegle-handover.ics')
}
</script>
