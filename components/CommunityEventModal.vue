<template>
  <b-modal ref="modal" scrollable size="lg" no-stacking>
    <template #header>
      <h4 v-if="added">Your event has been added</h4>
      <h4 v-else-if="editing">
        <span v-if="event?.id"> Edit Community Event </span>
        <span v-else> Add Community Event </span>
      </h4>
      <span v-else>
        <h4>{{ event.title }}</h4>
        <a :href="event.url" target="_blank" class="small">{{ event.url }}</a>
      </span>
    </template>
    <template #default>
      <div v-if="added">
        <p>
          One of our volunteers will check over your event, and then we'll
          publicise it to other freeglers.
        </p>
        <p>
          Freegle is free to use, but not free to run. If you can,
          <strong>please donate &pound;1</strong> to keep us running - but
          anything you can give is very welcome.
        </p>
        <donation-button />
      </div>
      <div v-else-if="event">
        <div v-if="!editing">
          <div v-if="event.image">
            <notice-message class="mb-3">
              Scroll down past the picture for more information!
            </notice-message>
            <b-row>
              <b-col>
                <OurUploadedImage
                  v-if="event?.image?.ouruid"
                  width="200"
                  :src="event.image.ouruid"
                  :modifiers="event.image.imagemods"
                  alt="Community Event Photo"
                  class="mb-2 w-100"
                />
                <NuxtPicture
                  v-else-if="event?.image?.imageuid"
                  format="webp"
                  width="200"
                  provider="uploadcare"
                  :src="event.image.imageuid"
                  :modifiers="event.image.imagemods"
                  alt="Community Event Photo"
                  class="mb-2 w-100"
                />
                <b-img
                  v-else
                  lazy
                  fluid
                  :src="event.image.path"
                  class="mb-2 w-100"
                />
              </b-col>
            </b-row>
          </div>
          <b-row>
            <!-- eslint-disable-next-line-->
            <b-col class="mb-2 prewrap font-weight-bold forcebreak">{{ event.description }}</b-col>
          </b-row>
          <b-row>
            <b-col cols="4" md="3" class="field"> Where</b-col>
            <b-col cols="8" md="9" class="forcebreak">
              {{ event.location }}
            </b-col>
          </b-row>
          <b-row>
            <b-col cols="4" md="3" class="field"> When</b-col>
            <b-col cols="8" md="9">
              <div
                v-for="date in event?.dates"
                :key="
                  'event-' +
                  event?.id +
                  '-' +
                  (date.start ? date.start.toString() : '') +
                  '-' +
                  (date.end ? date.end.toString() : '')
                "
                :class="date && date.string && date.string.past ? 'inpast' : ''"
              >
                <span v-if="date && date.string">
                  <span v-if="date.string.start">
                    {{ date.string.start }}
                  </span>
                  <span v-if="date.string.start && date.string.end"> - </span>
                  <span v-if="date.string.end">
                    {{ date.string.end }}
                  </span>
                  <br />
                </span>
              </div>
            </b-col>
          </b-row>
          <b-row v-if="event.contactname">
            <b-col cols="4" md="3" class="field"> Contact name</b-col>
            <b-col cols="8" md="9">
              {{ event.contactname }}
            </b-col>
          </b-row>
          <b-row v-if="event.contactemail">
            <b-col cols="4" md="3" class="field"> Contact email</b-col>
            <b-col cols="8" md="9">
              <!-- eslint-disable-next-line -->
              <ExternalLink :href="'mailto:' + event.contactemail">
                {{ event.contactemail }}
              </ExternalLink>
            </b-col>
          </b-row>
          <b-row v-if="event.contacturl">
            <b-col cols="4" md="3" class="field"> Website</b-col>
            <b-col cols="8" md="9" class="forcebreak">
              <ExternalLink :href="event.contacturl">
                {{ event.contacturl }}
              </ExternalLink>
            </b-col>
          </b-row>
          <b-row v-if="event.contactphone">
            <b-col cols="4" md="3" class="field"> Contact phone</b-col>
            <b-col cols="8" md="9">
              {{ event.contactphone }}
            </b-col>
          </b-row>
          <br />
          <p class="text-muted">
            Posted
            <span v-if="user?.id">by {{ user.displayname }} </span>
            <span v-for="(group, index) in groups" :key="index">
              <span v-if="index > 0">, </span><span v-else>&nbsp;on</span>
              {{ group.namedisplay }}
            </span>
          </p>
        </div>
        <VeeForm v-else-if="event" ref="form">
          <b-row>
            <b-col cols="12" md="6">
              <b-form-group label="For which community?" :state="true">
                <GroupSelect v-model="groupid" :systemwide="true" />
                <p v-if="showGroupError" class="text-danger font-weight-bold">
                  Please select a community.
                </p>
                <NoticeMessage
                  v-if="groupid === -2"
                  variant="danger"
                  class="mt-1"
                >
                  This is a national community event which will go out to all
                  communities. Please review carefully.
                </NoticeMessage>
                <b-form-invalid-feedback>
                  Please select a community
                </b-form-invalid-feedback>
              </b-form-group>
              <b-form-group
                v-if="enabled"
                label="What's the event?"
                label-for="title"
                :state="true"
              >
                <Field
                  id="title"
                  v-model="event.title"
                  name="title"
                  type="text"
                  placeholder="Give the community event a short title"
                  :rules="validateTitle"
                  class="form-control"
                />
                <ErrorMessage
                  name="title"
                  class="text-danger font-weight-bold"
                />
              </b-form-group>
            </b-col>
            <b-col v-if="enabled" cols="12" md="6">
              <div v-if="image" class="container">
                <div
                  class="clickme rotateleft stacked"
                  label="Rotate left"
                  title="Rotate left"
                  @click="rotateLeft"
                >
                  <v-icon icon="circle" size="2x" />
                  <v-icon icon="reply" class="ml-2" />
                </div>
                <div
                  label="Rotate right"
                  class="rotateright clickme stacked"
                  title="Rotate right"
                  @click="rotateRight"
                >
                  <v-icon icon="circle" size="2x" />
                  <v-icon icon="reply" flip="horizontal" />
                </div>
                <div class="image d-flex justify-content-around">
                  <OurUploadedImage
                    v-if="image?.imageuid"
                    width="200"
                    :src="image.imageuid"
                    :modifiers="mods"
                    alt="Community Event Photo"
                    class="mb-2"
                  />
                  <b-img
                    v-else-if="image"
                    fluid
                    :src="image.paththumb + '?event=' + id + '-' + cacheBust"
                  />
                  <b-img v-else width="250" thumbnail src="/placeholder.jpg" />
                </div>
              </div>
            </b-col>
          </b-row>
          <span v-if="enabled">
            <OurUploader
              v-if="!image"
              v-model="currentAtts"
              class="bg-white"
              type="CommunityEvent"
            />

            <b-form-group
              ref="eventEdit__description"
              label="What is it?"
              label-for="description"
              :state="true"
            >
              <Field
                id="description"
                v-model="description"
                name="description"
                class="form-control mt-2"
                as="textarea"
                rows="5"
                max-rows="8"
                spellcheck="true"
                placeholder="Let people know what the event is - why they should come, what to expect, and any admission charge or fee (we only approve free or cheap events)."
                :rules="validateDescription"
              />
              <ErrorMessage
                name="description"
                class="text-danger font-weight-bold"
              />
            </b-form-group>
            <b-form-group
              ref="eventEdit__location"
              label="Where is it?"
              label-for="location"
              :state="true"
            >
              <Field
                id="location"
                v-model="event.location"
                name="location"
                class="form-control"
                placeholder="Where is it being held? Add a postcode to make sure people can find you!"
                :rules="validateLocation"
              />
              <ErrorMessage
                name="location"
                class="text-danger font-weight-bold"
              />
            </b-form-group>
            <b-form-group label="When is it?" :state="true">
              <p>
                You can add multiple dates if the event occurs several times.
              </p>
              <StartEndCollection
                v-if="event.dates"
                v-model="event.dates"
                time
              />
              <p v-if="showDateError" class="text-danger font-weight-bold">
                Please fill out the start and end date/time.
              </p>
            </b-form-group>
            <b-form-group
              ref="eventEdit__contactname"
              label="Contact name:"
              label-for="contactname"
              :state="true"
            >
              <Field
                id="contactname"
                v-model="event.contactname"
                class="form-control"
                name="contactname"
                type="text"
                placeholder="Is there a contact person for anyone who wants to find out more? (Optional)"
                :rules="validateContactName"
              />
              <ErrorMessage
                name="contactname"
                class="text-danger font-weight-bold"
              />
            </b-form-group>
            <EmailValidator
              v-model:email="event.contactemail"
              size="md"
              label="Contact email:"
              :required="false"
            />
            <b-form-group
              label="Contact phone:"
              label-for="contactphone"
              :state="true"
            >
              <Field
                id="contactphone"
                v-model="event.contactphone"
                class="form-control"
                name="contactphone"
                type="tel"
                placeholder="Can people reach you by phone? (Optional)"
              />
            </b-form-group>
            <b-form-group
              label="Web link:"
              label-for="contacturl"
              :state="true"
            >
              <Field
                id="contacturl"
                v-model="event.contacturl"
                name="contacturl"
                class="form-control"
                type="url"
                placeholder="Is there more information on the web? (Optional)"
              />
            </b-form-group>
          </span>
          <NoticeMessage v-else variant="warning" class="mt-2">
            <v-icon icon="info-circle" />&nbsp;This community has chosen not to
            allow Community Events.
          </NoticeMessage>
        </VeeForm>
      </div>
    </template>
    <template #footer>
      <div class="w-100 d-flex justify-content-between">
        <template v-if="added">
          <b-button variant="white" :disabled="uploadingPhoto" @click="hide">
            Close
          </b-button>
        </template>
        <template v-else>
          <template v-if="canmodify">
            <b-button
              v-if="!editing"
              variant="white"
              :disabled="uploadingPhoto"
              @click="editing = true"
            >
              <v-icon icon="pen" />
              Edit
            </b-button>
            <b-button
              variant="white"
              :disabled="uploadingPhoto"
              @click="deleteIt"
            >
              <v-icon icon="trash-alt" />
              Delete
            </b-button>
          </template>
          <b-button
            v-if="!editing"
            variant="white"
            :disabled="uploadingPhoto"
            @click="hide"
          >
            Close
          </b-button>
          <b-button
            v-if="editing"
            variant="white"
            :disabled="uploadingPhoto"
            @click="dontSave"
          >
            Cancel
          </b-button>
          <SpinButton
            v-if="editing && enabled"
            variant="primary"
            :disabled="uploadingPhoto"
            icon-name="save"
            :label="event.id ? 'Save Changes' : 'Add Event'"
            @handle="saveIt"
          />
        </template>
      </div>
    </template>
  </b-modal>
</template>
<script setup>
import { ref, computed, watch, defineAsyncComponent } from 'vue'
import { defineRule, Form as VeeForm, Field, ErrorMessage } from 'vee-validate'
import { required, email, min, max } from '@vee-validate/rules'
import EmailValidator from './EmailValidator'
import { useCommunityEventStore } from '~/stores/communityevent'
import { useComposeStore } from '~/stores/compose'
import { useUserStore } from '~/stores/user'
import { useAuthStore } from '~/stores/auth'
import { uid } from '~/composables/useId'
import { useGroupStore } from '~/stores/group'
import { useImageStore } from '~/stores/image'
import { twem } from '~/composables/useTwem'
import { useOurModal } from '~/composables/useOurModal'
import { useMe } from '~/composables/useMe'

// Define validation rules
defineRule('required', required)
defineRule('email', email)
defineRule('min', min)
defineRule('max', max)

// Load components asynchronously
const GroupSelect = defineAsyncComponent(() =>
  import('~/components/GroupSelect')
)
const OurUploader = defineAsyncComponent(() =>
  import('~/components/OurUploader')
)
const StartEndCollection = defineAsyncComponent(() =>
  import('~/components/StartEndCollection')
)
const NoticeMessage = defineAsyncComponent(() =>
  import('~/components/NoticeMessage')
)
const DonationButton = defineAsyncComponent(() =>
  import('~/components/DonationButton')
)
const ExternalLink = defineAsyncComponent(() =>
  import('~/components/ExternalLink')
)

// Props
const props = defineProps({
  id: {
    type: Number,
    required: false,
    default: null,
  },
  startEdit: {
    type: Boolean,
    required: false,
    default: false,
  },
})

// Initialize stores
const communityEventStore = useCommunityEventStore()
const composeStore = useComposeStore()
const userStore = useUserStore()
const groupStore = useGroupStore()
const imageStore = useImageStore()
const authStore = useAuthStore()

// Refs for the form
const form = ref(null)

// State variables
const groupid = ref(null)
const oldPhoto = ref(null)
const editing = ref(props.startEdit)
const added = ref(false)
const cacheBust = ref(Date.now())
const showGroupError = ref(false)
const showDateError = ref(false)
const description = ref(null)
const currentAtts = ref([])
const mods = ref({})
const image = ref(null)

// Modal handling
const { modal, hide } = useOurModal()

const { supportOrAdmin } = useMe()

// Helper function to create initial event
function initialEvent() {
  return {
    id: null,
    title: null,
    description: null,
    photo: null,
    user: null,
    url: null,
    location: null,
    dates: [
      {
        uniqueid: uid('date-'),
        start: null,
        end: null,
        starttime: null,
        endtime: null,
        past: false,
      },
    ],
    groups: [],
    contactname: null,
    contactemail: null,
    contactphone: null,
    contacturl: null,
  }
}

// Fetch data
if (props.id) {
  const v = await communityEventStore.fetch(props.id)
  await userStore.fetch(v.userid)

  v.groups?.forEach(async (id) => {
    groupid.value = id
    await groupStore.fetch(id)
  })

  oldPhoto.value = communityEventStore.byId(props.id)?.image
}

// Computed properties
const event = computed(() => {
  let ret = null

  if (props.id) {
    ret = communityEventStore?.byId(props.id)
  }

  if (!ret) {
    ret = initialEvent()
  }

  return ret
})

const canmodify = computed(() => {
  return event.value?.userid === authStore.user?.id || supportOrAdmin
})

const groups = computed(() => {
  const ret = []
  event.value?.groups?.forEach((id) => {
    const group = groupStore?.get(id)

    if (group) {
      ret.push(group)
    }
  })

  return ret
})

const user = computed(() => {
  return userStore?.byId(event.value?.userid)
})

const uploadingPhoto = computed(() => {
  return composeStore?.uploading
})

const isExisting = computed(() => {
  return Boolean(event.value?.id)
})

const enabled = computed(() => {
  const group = groupStore.get(groupid.value)

  let ret = true

  if (group?.settings) {
    if ('communityevents' in group.settings) {
      ret = group.settings.communityevents
    }
  }

  return ret
})

// Validation functions
function validateTitle(value) {
  if (!value) {
    return 'Please enter a title.'
  }

  if (value.length < 10) {
    return 'Title must be 10 or more characters.'
  }

  if (value.length > 80) {
    return 'Title must be fewer than 80 characters.'
  }

  return true
}

function validateDescription(value) {
  if (!value) {
    return 'Please enter a description.'
  }

  return true
}

function validateLocation(value) {
  if (!value) {
    return 'Please enter a location.'
  }

  return true
}

function validateContactName(value) {
  if (value?.length > 60) {
    return 'Please enter 60 characters or fewer.'
  }

  return true
}

// Methods
async function deleteIt() {
  await communityEventStore.delete(props.id)
  hide()
}

async function saveIt(callback) {
  const validate = await form.value.validate()

  if (!groupid.value) {
    showGroupError.value = true
    callback()
    return
  } else {
    showGroupError.value = false
  }

  if (event.value.dates?.length) {
    for (const date of event.value.dates) {
      if (!date.start || !date.end || !date.starttime || !date.endtime) {
        showDateError.value = true
        callback()
        return
      }
    }

    showDateError.value = false
  } else {
    showDateError.value = true
  }

  if (!validate.valid) {
    callback()
    return
  }

  if (isExisting.value) {
    const { id } = event.value

    // Save the WIP event before we start making changes, otherwise the saves will update the store and hence
    // what we're looking at.
    const wip = JSON.parse(JSON.stringify(event.value))
    let shouldUpdatePhoto = null

    if (wip.image?.id !== oldPhoto.value?.id) {
      shouldUpdatePhoto = wip.image.id
    }

    if (shouldUpdatePhoto) {
      await communityEventStore.setPhoto(id, shouldUpdatePhoto)
    }

    const oldgroupid = wip.groups?.length ? wip.groups[0] : null

    if (groupid.value !== oldgroupid) {
      // Save the new group, then remove the old group, so it won't get stranded.
      //
      // Checking for groupid > 0 allows systemwide opportunities.
      if (groupid.value > 0) {
        await communityEventStore.addGroup(id, groupid.value)
      }

      if (oldgroupid) {
        await communityEventStore.removeGroup(id, oldgroupid)
      }
    }

    await communityEventStore.setDates({
      id,
      olddates: wip.dates,
      newdates: wip.dates,
    })

    await communityEventStore.save(wip)

    added.value = true
  } else {
    // This is an add.  First create it to get the id.
    const dates = event.value.dates
    const photoid = event.value.image ? event.value.image.id : null

    const id = await communityEventStore.add(event.value)

    if (id) {
      if (photoid) {
        await communityEventStore.setPhoto(id, photoid)
      }

      // Save the group.
      if (groupid.value > 0) {
        await communityEventStore.addGroup(id, groupid.value)
      }

      if (dates && dates.length) {
        await communityEventStore.setDates({
          id,
          olddates: [],
          newdates: dates,
        })
      }

      added.value = true
    }
  }
  callback()
}

async function dontSave() {
  if (props.id) {
    // We may have updated the event during the edit.  Fetch it again to reset those changes.
    await communityEventStore.fetch(event.value.id)
  }

  hide()
}

async function rotate(deg) {
  const curr = mods.value?.rotate || 0
  mods.value.rotate = curr + deg

  // Ensure between 0 and 360
  mods.value.rotate = (mods.value.rotate + 360) % 360

  await imageStore.post({
    id: event.value.image.id,
    rotate: mods.value.rotate,
    bust: Date.now(),
    communityevent: true,
  })
}

function rotateLeft() {
  rotate(-90)
}

function rotateRight() {
  rotate(90)
}

// Watchers
watch(
  event,
  (newVal) => {
    let desc = newVal?.description
    desc = desc ? twem(desc) : ''
    desc = desc.trim()

    description.value = desc
  },
  { immediate: true }
)

// Populate currentAtts when editing an existing community event
watch(
  () => editing.value,
  (newVal) => {
    if (newVal && event.value?.image) {
      // Populate currentAtts with existing image data for the uploader
      currentAtts.value = [
        {
          id: event.value.image.id,
          ouruid: event.value.image.ouruid || event.value.image.imageuid,
          externalmods: event.value.image.imagemods || {},
        },
      ]
    }
  },
  { immediate: true }
)

watch(description, (newVal) => {
  if (event.value) {
    event.value.description = newVal
  }
})

watch(
  currentAtts,
  (newVal) => {
    if (newVal?.length) {
      event.value.image = {
        id: newVal[0].id,
        imageuid: newVal[0].ouruid,
        imagemods: newVal[0].externalmods,
      }
      image.value = {
        id: newVal[0].id,
        imageuid: newVal[0].ouruid,
        imagemods: newVal[0].externalmods,
      }
    }
  },
  { deep: true }
)
</script>
<style scoped lang="scss">
.field {
  font-weight: bold;
  color: $color-green--darker;
}

.container {
  position: relative;
}

.rotate__icon {
  color: $color-white;
}

.modal-footer > div {
  width: 100%;
}

.container {
  display: grid;
  grid-template-columns: 32px 250px 32px;
  justify-content: end;
}

.rotateleft {
  grid-row: 1 / 2;
  grid-column: 1 / 2;
  z-index: 10000;
}

.rotateright {
  grid-row: 1 / 2;
  grid-column: 3 / 4;
  z-index: 10000;
}

.image {
  grid-row: 1 / 2;
  grid-column: 2 / 3;
}

.image__icon {
  color: $color-white;

  &.fa-flip-horizontal {
    transform: translate(-1.5em, -0.5em) scaleX(-1);
  }
}

.stacked {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 1fr;

  svg {
    grid-row: 1 / 2;
    grid-column: 1 / 2;
  }

  svg:nth-child(2) {
    z-index: 10000;
    color: white;
    padding-top: 7px;
    padding-right: 7px;
  }
}
</style>
