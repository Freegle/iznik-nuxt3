<template>
  <div>
    <p>
      NOT TESTED IN MT3. This lets you add a new Freegle community. This will be
      added with you as an Owner. It will be set not to be published.
    </p>
    <NoticeMessage variant="warning" class="mb-2">
      We don't check whether this overlaps with other existing groups, or do
      much verification on the inputs. Be careful!
    </NoticeMessage>
    <b-form-group>
      <b-form-text> Short name: </b-form-text>
      <b-form-input
        v-model="nameshort"
        placeholder="e.g. EdinburghFreegle.  No spaces.  Keep it short."
      />
    </b-form-group>
    <b-form-group>
      <b-form-text> Full name: </b-form-text>
      <b-form-input
        v-model="namefull"
        placeholder="e.g. Edinburgh Freegle.  Spaces ok.  Not too long."
      />
    </b-form-group>
    <b-form-group>
      <b-form-text> Centre of group: </b-form-text>
      <b-row>
        <b-col cols="6">
          <b-form-input v-model="lat" type="number" placeholder="Latitude" />
        </b-col>
        <b-col cols="6">
          <b-form-input v-model="lng" type="number" placeholder="Longitude" />
        </b-col>
      </b-row>
    </b-form-group>
    <b-form-group>
      <b-form-text>
        Core Group Area. Draw with
        <!-- eslint-disable-next-line -->
        <ExternalLink href="https://arthur-e.github.io/Wicket/sandbox-gmaps3.html">this</ExternalLink>.
      </b-form-text>
      <b-form-textarea
        v-model="cga"
        rows="5"
        placeholder="Core Group Area (WKT format)"
      />
    </b-form-group>
    <b-form-group>
      <b-form-text> Default Posting Area (or empty). </b-form-text>
      <b-form-textarea
        v-model="dpa"
        rows="5"
        placeholder="Default Posting Area (WKT format)"
      />
    </b-form-group>
    <SpinButton
      variant="primary"
      icon-name="save"
      label="Add Group"
      spinclass="text-white"
      :disabled="!valid || creating"
      @handle="add"
    />
    <NoticeMessage v-if="groupAdded" variant="primary" class="mt-2">
      Group "{{ namefull }}" has been successfully created! Group ID:
      {{ groupAdded }}
    </NoticeMessage>
    <NoticeMessage v-if="errorMessage" variant="danger" class="mt-2">
      {{ errorMessage }}
    </NoticeMessage>
  </div>
</template>
<script>
import { useGroupStore } from '../stores/group'
export default {
  setup() {
    const groupStore = useGroupStore()
    return { groupStore }
  },
  data: function () {
    return {
      nameshort: null,
      namefull: null,
      lat: null,
      lng: null,
      cga: null,
      dpa: null,
      groupAdded: null,
      errorMessage: null,
      creating: false,
    }
  },
  computed: {
    valid() {
      return this.nameshort && this.namefull && this.lat && this.lng && this.cga
    },
  },
  methods: {
    async checkGroupExists(nameshort) {
      try {
        // First ensure we have all groups loaded
        await this.groupStore.fetch()

        // Check using the store's getter
        const existingGroup = this.groupStore.get(nameshort)
        if (existingGroup) {
          return true
        }

        // Also check the raw state to be sure
        const allGroups = this.groupStore.$state.allGroups
        const lowerName = nameshort.toLowerCase()
        const foundInAllGroups = allGroups[lowerName]

        return !!foundInAllGroups
      } catch (error) {
        // If fetch fails, we can't determine - let backend handle it
        return false
      }
    },

    async add(callback) {
      // Prevent double-clicking
      if (this.creating) {
        callback()
        return
      }

      this.creating = true

      // Clear previous messages
      this.groupAdded = null
      this.errorMessage = null

      try {
        // Check if group already exists
        const groupExists = await this.checkGroupExists(this.nameshort)

        if (groupExists) {
          this.errorMessage = `A group with the name "${this.nameshort}" already exists. Please choose a different name.`
          this.creating = false
          callback()
          return
        }

        const groupId = await this.groupStore.addgroup({
          nameshort: this.nameshort,
          namefull: this.namefull,
          cga: this.cga,
          dpa: this.dpa,
          lat: this.lat,
          lng: this.lng,
        })

        if (groupId) {
          this.groupAdded = groupId
          this.creating = false
        } else {
          this.errorMessage = `Failed to create group "${this.nameshort}". Group creation was unsuccessful.`
        }
      } catch (error) {
        // Extract meaningful error message from API error
        if (error.message && error.message.includes('Create failed')) {
          this.errorMessage = `Failed to create group "${this.nameshort}". A group with this name already exists.`
        } else if (
          error.response &&
          error.response.data &&
          error.response.data.status
        ) {
          this.errorMessage = `Error creating group: ${error.response.data.status}`
        } else {
          this.errorMessage = `Error creating group: ${
            error.message || 'Unknown error occurred'
          }`
        }
      } finally {
        this.creating = false
      }

      callback()
    },
  },
}
</script>
