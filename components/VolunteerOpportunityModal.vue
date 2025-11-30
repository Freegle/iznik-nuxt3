<template>
  <b-modal ref="modal" scrollable size="lg" no-stacking>
    <template #header>
      <h4 v-if="added">Your opportunity has been added</h4>
      <h4 v-else-if="editing">
        <span v-if="volunteering?.id"> Edit Volunteer Opportunity </span>
        <span v-else> Add Volunteer Opportunity </span>
      </h4>
      <span v-else>
        <h4>{{ volunteering.title }}</h4>
        <a :href="volunteering.url" target="_blank" class="small">{{
          volunteering.url
        }}</a>
      </span>
    </template>
    <template #default>
      <div v-if="added">
        <p>
          One of our volunteers will check over your opportunity, and then we'll
          publicise it to other freeglers.
        </p>
        <p>
          Hope you find someone! Please make sure you get back to everyone who
          replies, so that they feel good about your organisation (and
          Freegle!).
        </p>
        <p>
          Freegle is free to use, but not free to run. If you can,
          <strong>please donate &pound;1</strong> to keep us running - but
          anything you can give is very welcome.
        </p>
        <donation-button />
      </div>
      <div v-else-if="volunteering">
        <div v-if="!editing">
          <div v-if="volunteering.image">
            <notice-message class="mb-3">
              Scroll down past the picture for more information!
            </notice-message>
            <b-row>
              <b-col>
                <OurUploadedImage
                  v-if="volunteering?.image?.ouruid"
                  :src="volunteering.image.ouruid"
                  :modifiers="volunteering.image.imagemods"
                  alt="Volunteer Opportunity Photo"
                  class="mb-2 w-100"
                />
                <NuxtPicture
                  v-else-if="volunteering?.image?.imageuid"
                  width="200"
                  format="webp"
                  provider="uploadcare"
                  :src="volunteering.image.imageuid"
                  :modifiers="volunteering.image.imagemods"
                  alt="Volunteer Opportunity Photo"
                  class="mb-2 w-100"
                />
                <b-img
                  v-else
                  lazy
                  fluid
                  :src="volunteering.image.path"
                  class="mb-2 w-100"
                />
              </b-col>
            </b-row>
          </div>
          <b-row>
            <!-- eslint-disable-next-line-->
            <b-col class="mb-2 prewrap font-weight-bold forcebreak">{{ volunteering.description }}</b-col>
          </b-row>
          <b-row class="mt-2">
            <b-col cols="4" md="3" class="field"> Time commitment</b-col>
            <b-col cols="8" md="9" class="forcebreak">
              {{ volunteering.timecommitment }}
            </b-col>
          </b-row>
          <b-row>
            <b-col cols="4" md="3" class="field"> Where</b-col>
            <b-col cols="8" md="9" class="forcebreak">
              {{ volunteering.location }}
            </b-col>
          </b-row>
          <b-row>
            <b-col cols="4" md="3" class="field"> When</b-col>
            <b-col cols="8" md="9">
              <div
                v-for="date in volunteering?.dates"
                :key="
                  'volunteering-' +
                  volunteering?.id +
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
          <b-row v-if="volunteering.contactname">
            <b-col cols="4" md="3" class="field"> Contact name</b-col>
            <b-col cols="8" md="9">
              {{ volunteering.contactname }}
            </b-col>
          </b-row>
          <b-row v-if="volunteering.contactemail">
            <b-col cols="4" md="3" class="field"> Contact email</b-col>
            <b-col cols="8" md="9">
              <!-- eslint-disable-next-line -->
              <ExternalLink :href="'mailto:' + volunteering.contactemail">
                {{ volunteering.contactemail }}
              </ExternalLink>
            </b-col>
          </b-row>
          <b-row v-if="volunteering.contacturl">
            <b-col cols="4" md="3" class="field"> Website</b-col>
            <b-col cols="8" md="9" class="forcebreak">
              <ExternalLink :href="volunteering.contacturl">
                {{ volunteering.contacturl }}
              </ExternalLink>
            </b-col>
          </b-row>
          <b-row v-if="volunteering.contactphone">
            <b-col cols="4" md="3" class="field"> Contact phone</b-col>
            <b-col cols="8" md="9">
              {{ volunteering.contactphone }}
            </b-col>
          </b-row>
          <br />
          <p v-if="user" class="text-muted">
            Posted
            <span v-if="user.displayname">by {{ user.displayname }}</span>
            <span v-for="(group, index) in groups" :key="index">
              <span v-if="index > 0">, </span><span v-else>&nbsp;on</span>
              {{ group.namedisplay }}
            </span>
          </p>
        </div>
        <VeeForm v-else-if="volunteering" ref="form">
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
                  This is a national volunteer opportunity which will go out to
                  all communities. Please review carefully.
                </NoticeMessage>
                <b-form-invalid-feedback>
                  Please select a community
                </b-form-invalid-feedback>
              </b-form-group>
              <b-form-group
                v-if="enabled"
                label="What's the opportunity?"
                label-for="title"
                :state="true"
              >
                <Field
                  id="title"
                  v-model="volunteering.title"
                  name="title"
                  type="text"
                  placeholder="Give the opportunity a short title"
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
                    alt="Volunteer Opportunity Photo"
                    class="mb-2"
                  />
                  <b-img
                    v-else-if="image"
                    fluid
                    :src="
                      image.paththumb + '?volunteering=' + id + '-' + cacheBust
                    "
                  />
                  <b-img v-else width="250" thumbnail src="/placeholder.jpg" />
                </div>
              </div>
            </b-col>
          </b-row>
          <div v-if="enabled" class="mt-2">
            <OurUploader
              v-if="!image"
              v-model="currentAtts"
              class="bg-white"
              type="Volunteering"
            />

            <b-form-group
              ref="volunteering__description"
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
                placeholder="Please let people know what the opportunity is - any organisation which is involved, what you'd like them to do, and why they might like to do it."
                :rules="validateDescription"
              />
              <ErrorMessage
                name="description"
                class="text-danger font-weight-bold"
              />
            </b-form-group>
            <b-form-group
              ref="volunteering__timecommitment"
              label="Time commitment:"
              label-for="timecommitment"
              :state="true"
            >
              <Field
                id="timecommitment"
                v-model="volunteering.timecommitment"
                as="textarea"
                name="timecommitment"
                rows="2"
                max-rows="8"
                spellcheck="true"
                placeholder="Please let people know what the time commitment is that you're looking for, e.g. how many hours a week, what times of day."
                class="mt-2 form-control"
              />
              <ErrorMessage
                name="timecommitment"
                class="text-danger font-weight-bold"
              />
            </b-form-group>
            <b-form-group
              ref="volunteering__location"
              label="Where is it?"
              label-for="location"
              :state="true"
            >
              <Field
                id="location"
                v-model="volunteering.location"
                name="location"
                class="form-control"
                placeholder="Where does the volunteering happen? Add a postcode to make sure people can find you!"
                :rules="validateLocation"
              />
              <ErrorMessage
                name="location"
                class="text-danger font-weight-bold"
              />
            </b-form-group>
            <b-form-group label="When is it?" :state="true">
              <p>
                You can add multiple dates if the opportunity occurs several
                times.
              </p>
              <StartEndCollection
                v-if="volunteering.dates"
                v-model="volunteering.dates"
              />
            </b-form-group>
            <b-form-group
              ref="volunteering__contactname"
              label="Contact name:"
              label-for="contactname"
              :state="true"
            >
              <Field
                id="contactname"
                v-model="volunteering.contactname"
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
              v-model:email="volunteering.contactemail"
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
                v-model="volunteering.contactphone"
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
                v-model="volunteering.contacturl"
                name="contacturl"
                class="form-control"
                type="url"
                placeholder="Is there more information on the web? (Optional)"
              />
            </b-form-group>
          </div>
          <NoticeMessage v-else variant="warning" class="mt-2">
            <v-icon icon="info-circle" />&nbsp;This community has chosen not to
            allow Volunteer Opportunities.
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
            :label="volunteering.id ? 'Save Changes' : 'Add Opportunity'"
            @handle="saveIt"
          />
        </template>
      </div>
    </template>
  </b-modal>
</template>
<script setup>
import { ref, computed, defineAsyncComponent, watch } from 'vue'
import { defineRule, Form as VeeForm, Field, ErrorMessage } from 'vee-validate'
import { required, email, min, max } from '@vee-validate/rules'
import EmailValidator from './EmailValidator'
import { useVolunteeringStore } from '~/stores/volunteering'
import { useComposeStore } from '~/stores/compose'
import { useUserStore } from '~/stores/user'
import { useGroupStore } from '~/stores/group'
import { useMiscStore } from '~/stores/misc' // MT
import { useAuthStore } from '~/stores/auth'
import SpinButton from '~/components/SpinButton.vue'
import { twem } from '~/composables/useTwem'
import { useOurModal } from '~/composables/useOurModal'
import { useImageStore } from '~/stores/image'
import { useMe } from '~/composables/useMe'

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

defineRule('required', required)
defineRule('email', email)
defineRule('min', min)
defineRule('max', max)

function initialVolunteering() {
  return {
    id: null,
    title: null,
    description: null,
    photo: null,
    user: null,
    url: null,
    timecommitment: null,
    location: null,
    dates: [],
    groups: [],
    contactname: null,
    contactemail: null,
    contactphone: null,
    contacturl: null,
  }
}

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

const volunteeringStore = useVolunteeringStore()
const composeStore = useComposeStore()
const userStore = useUserStore()
const groupStore = useGroupStore()
const imageStore = useImageStore()
const authStore = useAuthStore()
const myid = computed(() => authStore.user?.id)
const form = ref(null)

// Data properties
const groupid = ref(null)
const cacheBust = ref(Date.now())
const showGroupError = ref(false)
const description = ref(null)
const currentAtts = ref([])
const mods = ref({})
const image = ref(null)

const { modal, hide } = useOurModal()

const editing = ref(props.startEdit)
const added = ref(false)

const { supportOrAdmin } = useMe()

// Initialize data from props
if (props.id) {
  const v = await volunteeringStore.fetch(props.id)
  await userStore.fetch(v.userid)

  v.groups?.forEach(async (id) => {
    groupid.value = id
    await groupStore.fetch(id)
  })
}

const oldPhoto = ref(volunteeringStore.byId(props.id)?.image)

// Computed properties
const volunteering = computed(() => {
  let ret = null

  if (props.id) {
    ret = volunteeringStore?.byId(props.id)
  }

  if (!ret) {
    ret = initialVolunteering()
  }

  return ret
})

const canmodify = computed(() => {
  return volunteering.value?.userid === myid.value || supportOrAdmin
})

const groups = computed(() => {
  const ret = []
  volunteering.value?.groups?.forEach((id) => {
    const group = groupStore?.get(id)

    if (group) {
      ret.push(group)
    }
  })

  return ret
})

const user = computed(() => {
  return userStore?.byId(volunteering.value?.userid)
})

const uploadingPhoto = computed(() => {
  return composeStore?.uploading
})

const isExisting = computed(() => {
  return Boolean(volunteering.value?.id)
})

const enabled = computed(() => {
  const group = groupStore.get(groupid.value)

  let ret = true

  if (group?.settings) {
    if ('volunteering' in group.settings) {
      ret = group.settings.volunteering
    }
  }

  return ret
})

// Watchers
watch(
  () => volunteering.value?.description,
  (newVal) => {
    let desc = newVal
    desc = desc ? twem(desc) : ''
    desc = desc.trim()

    description.value = desc
  },
  { immediate: true }
)

// Populate currentAtts when editing an existing volunteering opportunity
watch(
  () => editing.value,
  (newVal) => {
    if (newVal && volunteering.value?.image) {
      // Populate currentAtts with existing image data for the uploader
      currentAtts.value = [
        {
          id: volunteering.value.image.id,
          ouruid:
            volunteering.value.image.ouruid ||
            volunteering.value.image.imageuid,
          externalmods: volunteering.value.image.imagemods || {},
        },
      ]
    }
  },
  { immediate: true }
)

watch(description, (newVal) => {
  if (volunteering.value) {
    volunteering.value.description = newVal
  }
})

watch(
  currentAtts,
  (newVal) => {
    if (newVal?.length) {
      volunteering.value.image = {
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

// Methods
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

async function deleteIt() {
  await volunteeringStore.delete(props.id)
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

  if (!validate.valid) {
    callback()
    return
  }

  if (isExisting.value) {
    const { id } = volunteering.value

    // Save the WIP volop before we start making changes, otherwise the saves will update the store and hence
    // what we're looking at.
    const wip = JSON.parse(JSON.stringify(volunteering.value))
    let shouldUpdatePhoto = null

    if (wip.image?.id !== oldPhoto.value?.id) {
      shouldUpdatePhoto = wip.image.id
    }

    if (shouldUpdatePhoto) {
      await volunteeringStore.setPhoto(id, shouldUpdatePhoto)
    }

    const oldgroupid = wip.groups && wip.groups.length ? wip.groups[0] : null

    if (groupid.value !== oldgroupid) {
      // Save the new group, then remove the old group, so it won't get stranded.
      //
      // Checking for groupid > 0 allows systemwide opportunities.
      if (groupid.value > 0) {
        await volunteeringStore.addGroup(id, groupid.value)
      }

      if (oldgroupid) {
        await volunteeringStore.removeGroup(id, oldgroupid)
      }
    }

    await volunteeringStore.setDates({
      id,
      olddates: wip.dates,
      newdates: wip.dates,
    })

    await volunteeringStore.save(wip)

    const miscStore = useMiscStore() // MT..
    if (miscStore.modtools) {
      hide()
    } else {
      added.value = true
    }
  } else {
    // This is an add.  First create it to get the id.
    const dates = volunteering.value.dates
    const photoid = volunteering.value.image
      ? volunteering.value.image.id
      : null

    const id = await volunteeringStore.add(volunteering.value)

    if (id) {
      if (photoid) {
        await volunteeringStore.setPhoto(id, photoid)
      }

      // Save the group.
      if (groupid.value > 0) {
        await volunteeringStore.addGroup(id, groupid.value)
      }

      if (dates && dates.length) {
        await volunteeringStore.setDates({
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
    // We may have updated the opportunity during the edit.  Fetch it again to reset those changes.
    await volunteeringStore.fetch(volunteering.value.id)
  }

  hide()
}

async function rotate(deg) {
  const curr = mods.value?.rotate || 0
  mods.value.rotate = curr + deg

  // Ensure between 0 and 360
  mods.value.rotate = (mods.value.rotate + 360) % 360

  await imageStore.post({
    id: volunteering.value.image.id,
    rotate: mods.value.rotate,
    bust: Date.now(),
    volunteering: true,
  })
}

function rotateLeft() {
  rotate(-90) // Fixed the bug where it was "-0"
}

function rotateRight() {
  rotate(90)
}
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
