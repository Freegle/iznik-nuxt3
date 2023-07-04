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
import { useMobileStore } from '@/stores/mobile'

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
      e.preventDefault()
      e.stopPropagation()
      const mobileStore = useMobileStore()
      if( !mobileStore.isApp){
        const blob = new Blob([this.ics], { type: 'text/calendar;charset=utf-8' })
        await saveAs(blob, 'freegle-handover.ics')
        return
      }
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

      function getCalProp(lines,name){
        name += ':'
        const namelen = name.length
        for(let i=0;i<lines.length;i++){
          const line = lines[i]
          if( line.length>=namelen){
            if( line.substring(0,namelen)===name){
              let rv = line.substring(namelen)
              while (++i < lines.length) {
                const nextline = lines[i]
                if (nextline.substring(0,1)!==' ') break
                rv += nextline.substring(1)
              }
              return rv
            }
          }
        }
        return ''
      }
      const lines = this.ics.split('\r\n')
      const dtstart = getCalProp(lines, 'DTSTART;TZID=Europe/London') // 20210109T110000
      const year = parseInt(dtstart.substring(0,4))
      const month = parseInt(dtstart.substring(4,6))-1
      const dom = parseInt(dtstart.substring(6,8))
      const hour = parseInt(dtstart.substring(9,11))
      const mins = parseInt(dtstart.substring(11,13))
      const secs = parseInt(dtstart.substring(13,15))
      const startDate = new Date(year, month, dom, hour, mins, secs)
      const endDate = new Date(startDate.getTime()+5*60*1000)
      const title = getCalProp(lines, 'SUMMARY')
      const eventLocation = ''
      const notes = getCalProp(lines, 'DESCRIPTION')
      const success = function (message) { console.log("Add calendar success", JSON.stringify(message)) }
      const error = function (message) { alert("Error: " + message) } // TODO
      console.log('window.plugins',window.plugins)
      window.plugins.calendar.createEventInteractively(title, eventLocation, notes, startDate, endDate, success, error)
    },
  },
}
</script>
