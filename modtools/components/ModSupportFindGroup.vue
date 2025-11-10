<template>
  <div>
    <AutocompleteLocal
      v-model="searchgroup"
      :items="groupitems"
      class="max"
      size="40"
      placeholder="Start typing a community name..."
      :disabled="loading"
    />
    <div v-if="group && group.url">
      <h3 class="mt-2">
        {{ group.nameshort }}
      </h3>
      <h4
        v-if="
          canonGroupName(group.namedisplay) !== canonGroupName(group.nameshort)
        "
        class="text-muted"
      >
        {{ group.namedisplay }}
      </h4>
      <div class="d-flex">
        <OurToggle
          :model-value="Boolean(group.publish)"
          :height="36"
          :width="150"
          :font-size="14"
          :labels="{ unchecked: 'Not visible', checked: 'Visible on site' }"
          disabled
          class="mr-2"
        />
        <OurToggle
          :model-value="Boolean(group.ontn)"
          :height="36"
          :width="150"
          :font-size="14"
          :labels="{ unchecked: 'Not on TN', checked: 'On TN' }"
          disabled
          class="mr-2"
        />
        <OurToggle
          :model-value="Boolean(group.onlovejunk)"
          :height="36"
          :width="150"
          :font-size="14"
          :labels="{ unchecked: 'Not on LoveJunk', checked: 'On LoveJunk' }"
          disabled
          class="mr-2"
        />
        <OurToggle
          :model-value="Boolean(group.onmap)"
          :height="36"
          :width="150"
          :font-size="14"
          :labels="{ unchecked: 'Not on map', checked: 'On map' }"
          disabled
          class="mr-2"
        />
        <b-form-group>
          <b-form-select
            v-model="region"
            :options="regionOptions"
            class="font-weight-bold ml-1"
          />
        </b-form-group>
      </div>
      <group-header
        :id="group.id"
        :key="'group-' + group.id"
        :group="group"
        :show-join="false"
      />
      <h4 class="mt-2">Group Info</h4>
      Group id
      <v-icon icon="hashtag" class="text-muted" scale="0.75" /><strong>{{
        group.id
      }}</strong
      >.
      <br />
      <br />
      <Clipboard v-if="group.url" class="mr-3 mb-1" :value="group.url" />
      Explore page:
      <ExternalLink :href="group.url">{{ group.url }}</ExternalLink>
      <br />
      <Clipboard
        v-if="group.modsemail"
        class="mr-3 mb-1"
        :value="group.modsemail"
      />
      Volunteers email:
      <!-- eslint-disable-next-line -->
      <ExternalLink :href="'mailto:' + group.modsemail">{{ group.modsemail }}</ExternalLink>
      <br />
      <Clipboard
        v-if="group.groupemail"
        class="mr-3 mb-1"
        :value="group.groupemail"
      />
      Posting address:
      <!-- eslint-disable-next-line -->
      <ExternalLink v-if="group.groupemail" :href="'mailto:' + group.groupemail">{{ group.groupemail }}</ExternalLink>
      <br />
      <div v-if="!group.facebook || !group.facebook.length">Facebook: none</div>
      <div v-else>
        <div
          v-for="facebook in group.facebook"
          :key="'facebook-' + facebook.id"
        >
          <div v-if="facebook.type === 'Page'">
            <Clipboard
              class="mr-3 mb-1"
              :value="'https://facebook.com/pg/' + facebook.id"
            />
            Facebook:
            <ExternalLink :href="'https://facebook.com/pg/' + facebook.id">
              {{ facebook.name }}
            </ExternalLink>
            <span v-if="!facebook.valid" class="text-danger"> Invalid </span>
          </div>
        </div>
      </div>
      <br />
      Affiliation last confirmed: {{ dateonly(group.affiliationconfirmed) }} by
      <v-icon icon="hashtag" class="text-muted" scale="0.75" />{{
        group.affiliationconfirmedby
      }}
      <br />
      <h4 class="mt-2">Centre</h4>
      <p>Lat/lng of group centre:</p>
      <div class="d-flex">
        <b-form-input v-model="group.lat" type="number" class="mr-2" />
        <b-form-input v-model="group.lng" type="number" class="mr-2" />
      </div>
      <p class="mt-2">Additional centre for large groups:</p>
      <div class="d-flex">
        <b-form-input
          v-model="group.altlat"
          type="number"
          class="mr-2 flex-shrink-1"
        />
        <b-form-input
          v-model="group.altlng"
          type="number"
          class="mr-2 flex-shrink-1"
        />
      </div>
      <SpinButton
        variant="white"
        icon-name="save"
        label="Save Update"
        class="mt-2"
        @handle="saveCentres"
      />
      <h4 class="mt-2">CGA</h4>
      <b-form-textarea v-model="group.cga" rows="4" class="mb-2" />
      <p v-if="CGAerror" class="text-danger">
        {{ CGAerror }}
      </p>
      <SpinButton
        variant="white"
        icon-name="save"
        label="Save Update"
        @handle="saveCGA"
      />
      <h4 class="mt-2">DPA</h4>
      <b-form-textarea v-model="group.dpa" rows="4" class="mb-2" />
      <p v-if="DPAerror" class="text-danger">
        {{ DPAerror }}
      </p>
      <SpinButton
        variant="white"
        icon-name="save"
        label="Save Update"
        @handle="saveDPA"
      />
      <h4 class="mt-2">Volunteers</h4>
      <OurToggle
        :model-value="Boolean(!group.mentored)"
        :height="36"
        :width="170"
        :font-size="14"
        :labels="{ checked: 'Local Volunteers', unchecked: 'Caretakers' }"
        disabled
        class="mr-2"
      />
      <b-img
        v-if="fetchingVolunteers"
        src="/loader.gif"
        alt="Loading"
        class="d-block"
      />
      <ModSupportFindGroupVolunteer
        v-for="volunteer in sortedVolunteers"
        :key="'volunteer-' + volunteer.id"
        :volunteer="volunteer"
        :groupid="group.id"
      />
    </div>
  </div>
</template>
<script>
import { useMemberStore } from '~/stores/member'
import { useModGroupStore } from '@/stores/modgroup'

export default {
  async setup() {
    const modGroupStore = useModGroupStore()
    const memberStore = useMemberStore()

    await modGroupStore.listMT({ grouptype: 'Freegle' })

    return { modGroupStore, memberStore }
  },
  data: function () {
    return {
      loading: false,
      searchgroup: null,
      fetchingVolunteers: false,
      CGAerror: null,
      DPAerror: null,
    }
  },
  computed: {
    groups() {
      const groups = Object.values(this.modGroupStore.allGroups)
      return groups
    },
    groupitems() {
      const ret = []

      if (this.groups) {
        this.groups.forEach((g) => {
          if (
            this.canonGroupName(g.nameshort) !==
            this.canonGroupName(g.namedisplay)
          ) {
            ret.push(g.nameshort + ' / ' + g.namedisplay)
          } else {
            ret.push(g.nameshort)
          }
        })
      }

      return ret
    },
    groupid() {
      let ret = null

      if (this.searchgroup) {
        ret = this.groups.find((g) => {
          let name = g.nameshort

          if (
            this.canonGroupName(g.nameshort) !==
            this.canonGroupName(g.namedisplay)
          ) {
            name = g.nameshort + ' / ' + g.namedisplay
          }

          return name === this.searchgroup
        })

        ret = ret ? ret.id : null
      }

      return ret
    },
    group() {
      return this.modGroupStore.get(this.groupid)
    },
    volunteers() {
      return this.memberStore.getByGroup(this.groupid)
    },
    sortedVolunteers() {
      const r = this.volunteers
      r.sort((a, b) => {
        if (a.lastmoderated && !b.lastmoderated) {
          return -1
        } else if (b.lastmoderated && !a.lastmoderated) {
          return 1
        } else {
          return (
            new Date(b.lastmoderated).getTime() -
            new Date(a.lastmoderated).getTime()
          )
        }
      })

      return r
    },
    regionOptions() {
      return [
        { text: 'East', value: 'East' },
        { text: 'London', value: 'London' },
        { text: 'Midlands West', value: 'West Midlands' },
        { text: 'Midlands East', value: 'East Midlands' },
        { text: 'North East', value: 'North East' },
        { text: 'North West', value: 'North West' },
        { text: 'Northern Ireland', value: 'Northern Ireland' },
        { text: 'South East', value: 'South East' },
        { text: 'South West', value: 'South West' },
        { text: 'Wales', value: 'Wales' },
        { text: 'Yorkshire and the Humber', value: 'Yorkshire and the Humber' },
        { text: 'Scotland', value: 'Scotland' },
      ]
    },
    region: {
      get() {
        return this.group.region
      },
      set(newval) {
        this.modGroupStore.updateMT({
          id: this.group.id,
          region: newval,
        })
      },
    },
  },
  watch: {
    async groupid(id) {
      if (id) {
        // Get the full group info
        await this.modGroupStore.fetchIfNeedBeMT(id)

        // And the list of volunteers
        this.fetchingVolunteers = true
        this.memberStore.clear()

        await this.memberStore.fetchMembers({
          groupid: this.groupid,
          collection: 'Approved',
          modtools: true,
          summary: false,
          limit: 1000,
          filter: 2,
        })

        this.fetchingVolunteers = false
      } else {
        this.memberStore.clear()
      }
    },
  },
  methods: {
    canonGroupName(name) {
      return name ? name.toLowerCase().replace(/-|_| /g, '') : null
    },
    async saveCGA(callback) {
      console.log('saveCGA', this.group.cga)
      this.CGAerror = null
      try {
        await this.modGroupStore.updateMT({
          id: this.groupid,
          polyofficial: this.group.cga,
        })
      } catch (e) {
        this.CGAerror = e.message
      }
      callback()
    },
    async saveDPA(callback) {
      this.DPAerror = null
      try {
        await this.modGroupStore.updateMT({
          id: this.groupid,
          poly: this.group.dpa,
        })
      } catch (e) {
        this.DPAerror = e.message
      }
      callback()
    },
    async saveCentres(callback) {
      this.modGroupStore.updateMT({
        id: this.groupid,
        lat: this.group.lat,
        lng: this.group.lng,
        altlat: this.group.altlat,
        altlng: this.group.altlng,
      })
      callback()
    },
  },
}
</script>
<style scoped>
.max {
  max-width: 300px;
}
</style>
