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
<script setup>
import { ref, computed } from 'vue'
import { useGroupStore } from '~/stores/group'

const groupStore = useGroupStore()

const nameshort = ref(null)
const namefull = ref(null)
const lat = ref(null)
const lng = ref(null)
const cga = ref(null)
const dpa = ref(null)
const groupAdded = ref(null)
const errorMessage = ref(null)
const creating = ref(false)

const valid = computed(() => {
  return (
    nameshort.value && namefull.value && lat.value && lng.value && cga.value
  )
})

async function checkGroupExists(name) {
  try {
    // First ensure we have all groups loaded
    await groupStore.fetch()

    // Check using the store's getter
    const existingGroup = groupStore.get(name)
    if (existingGroup) {
      return true
    }

    // Also check the raw state to be sure
    const allGroups = groupStore.$state.allGroups
    const lowerName = name.toLowerCase()
    const foundInAllGroups = allGroups[lowerName]

    return !!foundInAllGroups
  } catch (error) {
    // If fetch fails, we can't determine - let backend handle it
    return false
  }
}

async function add(callback) {
  // Prevent double-clicking
  if (creating.value) {
    callback()
    return
  }

  creating.value = true

  // Clear previous messages
  groupAdded.value = null
  errorMessage.value = null

  try {
    // Check if group already exists
    const groupExists = await checkGroupExists(nameshort.value)

    if (groupExists) {
      errorMessage.value = `A group with the name "${nameshort.value}" already exists. Please choose a different name.`
      creating.value = false
      callback()
      return
    }

    const groupId = await groupStore.addgroup({
      nameshort: nameshort.value,
      namefull: namefull.value,
      cga: cga.value,
      dpa: dpa.value,
      lat: lat.value,
      lng: lng.value,
    })

    if (groupId) {
      groupAdded.value = groupId
      creating.value = false
    } else {
      errorMessage.value = `Failed to create group "${nameshort.value}". Group creation was unsuccessful.`
    }
  } catch (error) {
    // Extract meaningful error message from API error
    if (error.message && error.message.includes('Create failed')) {
      errorMessage.value = `Failed to create group "${nameshort.value}". A group with this name already exists.`
    } else if (
      error.response &&
      error.response.data &&
      error.response.data.status
    ) {
      errorMessage.value = `Error creating group: ${error.response.data.status}`
    } else {
      errorMessage.value = `Error creating group: ${
        error.message || 'Unknown error occurred'
      }`
    }
  } finally {
    creating.value = false
  }

  callback()
}
</script>
