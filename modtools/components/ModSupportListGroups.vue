<template>
  <div>
    <SpinButton
      variant="primary"
      icon-name="users"
      label="Fetch communities"
      spinclass="text-white"
      @handle="fetchCommunities"
    />
    <div v-if="fetched && groups && groups.length" class="mt-2">
      <p>
        Here you can see info about all Freegle groups. Click on the column
        headings to sort. Click on the dropdown arrow to filter.
      </p>
      <p>Groups with the ID in light blue are caretaker groups.</p>
      <hot-table
        ref="hot"
        width="100%"
        :height="height + 'px'"
        :data="groups"
        license-key="non-commercial-and-evaluation"
        class="bg-white"
        :dropdown-menu="true"
        :filters="true"
        :cells="cells"
        :manual-column-freeze="true"
        :after-render="afterRender"
      >
        <hot-column title="ID" data="id" :renderer="idRenderer"> </hot-column>
        <hot-column title="Short Name" data="nameshort"> </hot-column>
        <hot-column title="Display Name" data="namedisplay"> </hot-column>
        <hot-column
          title="Last Auto-Approve"
          data="lastautoapprove"
          :renderer="dateRenderer"
        >
        </hot-column>
        <hot-column
          title="Auto-Approve %"
          data="recentautoapprovespercent"
          :renderer="autoApprovesRenderer"
        >
        </hot-column>
        <hot-column
          title="Auto-Approves"
          data="recentautoapproves"
          :renderer="centreRenderer"
        >
        </hot-column>
        <hot-column
          title="Active-owner"
          data="activeownercount"
          :renderer="centreRenderer"
        >
        </hot-column>
        <hot-column
          title="Active Mods"
          data="activemodcount"
          :renderer="centreRenderer"
        >
        </hot-column>
        <hot-column
          title="Last Moderated"
          data="lastmoderated"
          :renderer="dateRenderer"
        >
        </hot-column>
        <hot-column title="Publish?" data="publish" :renderer="boolRenderer">
        </hot-column>
        <hot-column title="FD?" data="onhere" :renderer="boolRenderer">
        </hot-column>
        <hot-column title="TN?" data="ontn" :renderer="boolRenderer">
        </hot-column>
        <hot-column title="LJ?" data="onlovejunk" :renderer="boolRenderer">
        </hot-column>
        <hot-column title="Region" data="region"> </hot-column>
        <hot-column title="Lat" data="lat" :renderer="latlngRenderer">
        </hot-column>
        <hot-column title="Lng" data="lng" :renderer="latlngRenderer">
        </hot-column>
        <hot-column title="Founded" data="founded"> </hot-column>
        <hot-column
          title="Affiliation Confirmed"
          data="affiliationconfirmed"
          :renderer="dateRenderer"
        >
        </hot-column>
        <hot-column
          title="Backup Owners Active"
          data="backupownersactive"
          :renderer="centreRenderer"
        >
        </hot-column>
        <hot-column
          title="Backup Mods Active"
          data="backupmodsactive"
          :renderer="centreRenderer"
        >
        </hot-column>
      </hot-table>
    </div>
  </div>
</template>
<script>
import dayjs from 'dayjs'
import { HotTable, HotColumn } from '@handsontable/vue3'
import { registerAllModules } from 'handsontable/registry'
import { useModGroupStore } from '@/stores/modgroup'
import 'handsontable/dist/handsontable.full.css'

registerAllModules()
// https://handsontable.com/docs/javascript-data-grid/vue3-custom-renderer-example/

export default {
  components: {
    HotTable,
    HotColumn,
  },
  setup() {
    const modGroupStore = useModGroupStore()
    return { modGroupStore }
  },
  data: function () {
    return {
      busy: false,
      fetched: false,
      height: 600,
      atts: [],
    }
  },
  computed: {
    groups() {
      const ret = Object.values(this.modGroupStore.allGroups)
      ret.sort((a, b) => {
        return a.nameshort
          .toLowerCase()
          .localeCompare(b.nameshort.toLowerCase())
      })
      return ret
    },
  },
  async mounted() {
    this.checkHeight()
  },
  beforeUnmount() {
    if (this.heightTimer) {
      clearTimeout(this.heightTimer)
    }
  },
  methods: {
    idRenderer(_instance, td, _row, _col, _prop, value) {
      const group = this.modGroupStore.get(value)
      if (group && group.mentored) {
        td.style.backgroundColor = 'lightblue'
      }
      td.innerHTML = value
    },
    dateRenderer(_instance, td, _row, _col, _prop, value) {
      let val = '-'
      td.style.textAlign = 'center'

      if (value) {
        val = dayjs(value).format('YYYY-MM-DD')
      }
      td.innerHTML = val
    },
    autoApprovesRenderer(_instance, td, _row, _col, _prop, value) {
      const group = this.groups[_row]
      let auto = parseInt(value)
      if (group && group.publish) {
        if (auto >= 50) {
          td.style.backgroundColor = 'orange'
        }
      } else {
        td.innerHTML = auto
      }
      td.style.textAlign = 'center'
      auto = Math.abs(auto)
      td.innerHTML = auto + '%'
    },
    centreRenderer(_instance, td, _row, _col, _prop, value) {
      td.style.textAlign = 'center'
      td.innerHTML = value
    },
    latlngRenderer(_instance, td, _row, _col, _prop, value) {
      td.style.textAlign = 'center'
      let val = parseFloat(value)
      val = Math.round(val * 100) / 100
      td.innerHTML = val
    },
    boolRenderer(_instance, td, _row, _col, _prop, value) {
      td.style.textAlign = 'center'
      td.innerHTML = value == 1 ? 'Y' : 'N'
    },

    async fetchCommunities(callback) {
      await this.modGroupStore.listMT({
        grouptype: 'Freegle',
        support: true,
      })

      // This prevents us rendering partial data that happens to be in store.
      this.fetched = true
      callback()
    },
    cells(row, col, prop) {
      return {
        editor: false,
      }
    },
    afterRender() {
      const inst = this.$refs.hot.hotInstance

      // Freeze the name
      const plugin = inst.getPlugin('ManualColumnFreeze')
      plugin.freezeColumn(1)
    },
    checkHeight() {
      if (process.client) {
        const height = Math.floor(window.innerHeight)

        if (this.$refs.hot) {
          const rect = this.$refs.hot.$el.getBoundingClientRect()

          this.height = height - rect.top - 50
        }

        this.heightTimer = setTimeout(this.checkHeight, 100)
      }
    },
  },
}
</script>
<style scoped>
input {
  max-width: 300px;
}

::v-deep .handsontable table thead th,
::v-deep .handsontable table tbody td {
  white-space: pre-line;
  max-width: 150px;
}
</style>
