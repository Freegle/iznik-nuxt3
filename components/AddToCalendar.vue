<template>
  <div>
    <b-button :variant="variant" :size="size" @click="download">
      <v-icon icon="calendar-alt" />
      Add to Calendar
    </b-button>
  </div>
</template>
<script>
import saveAs from 'save-file'
//import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';

export default {
  props: {
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
  },
  methods: {
    async download(e) {
      // https://www.npmjs.com/package/save-file
      console.log("AddToCalendar download", typeof this.ics, this.ics.length)
      e.preventDefault()
      e.stopPropagation()
      // const blob = new Blob([this.ics], { type: 'text/calendar;charset=utf-8' })
      // await saveAs(blob, 'freegle-handover.ics')
      /*const blob = new Blob([this.ics], { type: 'application/octet-stream' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = 'freegle-handover.ics'
      link.click()
      URL.revokeObjectURL(link.href)*/

      /*// https://capacitorjs.com/docs/apis/filesystem
      await Filesystem.writeFile({
        path: 'freegle-handover.ics',
        data: this.ics,
        directory: Directory.Documents,
        encoding: Encoding.UTF8,
      })*/

      // webcal://localhost/myCalendar.ics
      // https://www.npmjs.com/package/cordova-plugin-calendar

      console.log("DONE!")
    },
  },
}
</script>
