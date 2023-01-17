<template>
  <b-modal id="profilemodal" v-model="showModal" size="lg" no-stacking>
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
                <b-img lazy fluid :src="event.image.path" class="mb-2 w-100" />
              </b-col>
            </b-row>
          </div>
          <b-row>
            <!-- eslint-disable-next-line-->
            <b-col class="mb-2 prewrap font-weight-bold forcebreak">{{ description }}</b-col>
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
          <b-row v-if="event.phone">
            <b-col cols="4" md="3" class="field"> Contact phone</b-col>
            <b-col cols="8" md="9">
              {{ event.contactphone }}
            </b-col>
          </b-row>
          <br />
          <p v-if="user" class="text-muted">
            Posted by {{ user.displayname }}
            <span v-for="(group, index) in groups" :key="index">
              <span v-if="index > 0">, </span><span v-else>on </span>
              {{ group.namedisplay }}
            </span>
          </p>
        </div>
        <Form v-else-if="event" ref="form">
          <b-row>
            <b-col cols="12" md="6">
              <b-form-group
                ref="groupid"
                label="For which community?"
                :state="true"
              >
                <GroupRememberSelect
                  v-model="groupid"
                  remember="editevent"
                  :systemwide="true"
                />
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
              <div v-if="event.image" class="float-right container">
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
                <div class="image">
                  <b-img
                    v-if="event.image"
                    fluid
                    :src="event.image.paththumb + '?' + cacheBust"
                  />
                  <b-img v-else width="250" thumbnail src="/placeholder.jpg" />
                </div>
              </div>
            </b-col>
          </b-row>
          <span v-if="enabled">
            <b-row>
              <b-col>
                <b-button
                  variant="primary"
                  class="mt-1 float-right"
                  @click="photoAdd"
                >
                  <v-icon icon="camera" /> Upload photo
                </b-button>
              </b-col>
            </b-row>
            <b-row v-if="uploading">
              <b-col>
                <OurFilePond
                  class="bg-white"
                  imgtype="CommunityEvent"
                  imgflag="communityevent"
                  :ocr="true"
                  @photoProcessed="photoProcessed"
                />
              </b-col>
            </b-row>

            <b-form-group
              ref="volunteering__description"
              label="What is it?"
              label-for="description"
              :state="true"
            >
              <Field
                id="description"
                v-model="event.description"
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
              ref="volunteering__location"
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
              ref="volunteering__contactname"
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
            allow Volunteer Opportunities.
          </NoticeMessage>
        </Form>
      </div>
    </template>
    <template #footer>
      <div v-if="added">
        <b-button
          variant="white"
          class="float-right"
          :disabled="uploadingPhoto"
          @click="hide"
        >
          Close
        </b-button>
      </div>
      <div v-else>
        <div
          v-if="event.canmodify"
          class="w-100 d-flex justify-content-between"
        >
          <b-button
            v-if="!editing"
            variant="white"
            class="float-left"
            :disabled="uploadingPhoto"
            @click="editing = true"
          >
            <v-icon icon="pen" />
            Edit
          </b-button>
          <b-button
            variant="white"
            class="float-left ml-1"
            :disabled="uploadingPhoto"
            @click="deleteIt"
          >
            <v-icon icon="trash-alt" />
            Delete
          </b-button>
        </div>
        <div class="w-100 d-flex justify-content-between">
          <b-button
            v-if="!editing"
            variant="white"
            class="float-right"
            :disabled="uploadingPhoto"
            @click="hide"
          >
            Close
          </b-button>
          <b-button
            v-if="editing"
            variant="white"
            class="float-right mr-1"
            :disabled="uploadingPhoto"
            @click="dontSave"
          >
            Hide
          </b-button>
          <SpinButton
            v-if="editing"
            variant="primary"
            :disabled="uploadingPhoto"
            :handler="saveIt"
            name="save"
            :label="event.id ? 'Save Changes' : 'Add Event'"
          />
        </div>
      </div>
    </template>
  </b-modal>
</template>
<script>
import { defineRule, Form, Field, ErrorMessage } from 'vee-validate'
import { required, email, min, max } from '@vee-validate/rules'
import { useCommunityEventStore } from '../stores/communityevent'
import { useComposeStore } from '../stores/compose'
import { useUserStore } from '../stores/user'
import { uid } from '../composables/useId'
import { useGroupStore } from '../stores/group'
import EmailValidator from './EmailValidator'
import modal from '@/mixins/modal'
import { twem } from '~/composables/useTwem'

const GroupRememberSelect = () => import('~/components/GroupRememberSelect')
const OurFilePond = () => import('~/components/OurFilePond')
const StartEndCollection = () => import('~/components/StartEndCollection')
const NoticeMessage = () => import('~/components/NoticeMessage')
const DonationButton = () => import('~/components/DonationButton')
const ExternalLink = () => import('~/components/ExternalLink')

defineRule('required', required)
defineRule('email', email)
defineRule('min', min)
defineRule('max', max)

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
    canmodify: null,
  }
}

export default {
  components: {
    EmailValidator,
    GroupRememberSelect,
    OurFilePond,
    StartEndCollection,
    NoticeMessage,
    DonationButton,
    ExternalLink,
    Form,
    Field,
    ErrorMessage,
  },
  mixins: [modal],
  props: {
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
  },
  async setup(props) {
    const communityEventStore = useCommunityEventStore()
    const composeStore = useComposeStore()
    const userStore = useUserStore()
    const groupStore = useGroupStore()

    if (props.id) {
      const v = await communityEventStore.fetch(props.id)
      await userStore.fetch(v.userid)

      v.groups?.forEach(async (id) => {
        await groupStore.fetch(id)
      })
    }

    return {
      communityEventStore,
      composeStore,
      userStore,
      groupStore,
    }
  },
  data() {
    return {
      editing: false,
      added: false,
      groupid: null,
      cacheBust: Date.now(),
      uploading: false,
      showGroupError: false,
      showDateError: false,
    }
  },
  computed: {
    event() {
      let ret = null

      if (this.id) {
        ret = this.communityEventStore.byId(this.id)
      }

      if (!ret) {
        ret = initialEvent()
      }

      return ret
    },
    groups() {
      const ret = []
      this.event.groups.forEach((id) => {
        const group = this.groupStore.get(id)

        if (group) {
          ret.push(group)
        }
      })

      return ret
    },
    user() {
      return this.userStore.byId(this.event?.userid)
    },
    uploadingPhoto() {
      return this.composeStore.uploading
    },
    isExisting() {
      return Boolean(this.event.id)
    },
    description() {
      let desc = this.event.description
      desc = desc ? twem(desc) : ''
      desc = desc.trim()
      return desc
    },
    enabled() {
      const group = this.myGroup(this.groupid)

      let ret = true

      if (group) {
        if ('volunteeringallowed' in group) {
          ret = group.volunteeringallowed
        }
      }

      return ret
    },
    shouldUpdatePhoto() {
      const { photo: oldPhoto } = this.event
      const { photo: newPhoto } = this.event
      return newPhoto && (oldPhoto ? newPhoto.id !== oldPhoto.id : true)
    },
  },
  methods: {
    show() {
      this.editing = this.startEdit
      this.added = false
      this.showModal = true
      if (this.event?.groups?.length > 0) {
        this.groupid = this.event.groups[0]
      }
    },
    hide() {
      this.editing = false
      this.uploading = false
      this.showModal = false
    },
    validateTitle(value) {
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
    },
    validateDescription(value) {
      if (!value) {
        return 'Please enter a description.'
      }

      return true
    },
    validateLocation(value) {
      if (!value) {
        return 'Please enter a location.'
      }

      return true
    },
    validateContactName(value) {
      if (value?.length > 60) {
        return 'Please enter 60 characters or fewer.'
      }

      return true
    },
    async deleteIt() {
      await this.communityEventStore.delete(this.event.id)
      this.hide()
    },
    async saveIt() {
      const validate = await this.$refs.form.validate()

      if (!this.groupid) {
        this.showGroupError = true
        return
      } else {
        this.showGroupError = false
      }

      if (this.event.dates?.length) {
        for (const date of this.event.dates) {
          if (!date.start || !date.end || !date.starttime || !date.endtime) {
            this.showDateError = true
            return
          }
        }

        this.showDateError = false
      } else {
        this.showDateError = true
      }

      if (!validate.valid) {
        return
      }

      if (this.isExisting) {
        const { id } = this.event
        // This is an edit.
        if (this.shouldUpdatePhoto) {
          await this.communityEventStore.setPhoto(id, this.event.image.id)
        }

        const oldgroupid =
          this.event.groups && this.event.groups.length
            ? this.event.groups[0]
            : null

        if (this.groupid !== oldgroupid) {
          // Save the new group, then remove the old group, so it won't get stranded.
          //
          // Checking for groupid > 0 allows systemwide opportunities.
          if (this.groupid > 0) {
            await this.communityEventStore.addGroup(id, this.groupid)
          }

          if (oldgroupid) {
            await this.communityEventStore.removeGroup(id, oldgroupid)
          }
        }

        await this.communityEventStore.setDates({
          id,
          olddates: this.event.dates,
          newdates: this.event.dates,
        })

        await this.communityEventStore.save(this.event)

        this.added = true
      } else {
        // This is an add.  First create it to get the id.
        const dates = this.event.dates
        const photoid = this.event.image ? this.event.image.id : null

        const id = await this.communityEventStore.add(this.event)

        if (id) {
          if (photoid) {
            await this.communityEventStore.setPhoto(id, photoid)
          }

          // Save the group.
          if (this.groupid > 0) {
            await this.communityEventStore.addGroup(id, this.groupid)
          }

          if (dates && dates.length) {
            await this.communityEventStore.setDates({
              id,
              olddates: [],
              newdates: dates,
            })
          }

          this.added = true
        }
      }
    },
    async dontSave() {
      if (this.id) {
        // We may have updated the event during the edit.  Fetch it again to reset those changes.
        await this.communityEventStore.fetch(this.event.id)
      }

      this.hide()
    },
    photoAdd() {
      // Flag that we're uploading.  This will trigger the render of the filepond instance and subsequently the
      // processed callback below.
      this.uploading = true
    },
    photoProcessed(imageid, imagethumb, image, ocr) {
      // We have uploaded a photo.  Remove the filepond instance.
      this.uploading = false

      this.event.image = {
        id: imageid,
        path: image,
        paththumb: imagethumb,
      }

      if (ocr) {
        // We might have some OCR text from a poster which we can add in.
        const p = ocr.indexOf('\n')
        const title = p !== -1 ? ocr.substring(0, p) : null
        const desc = p !== -1 ? ocr.substring(p + 1) : ocr

        if (!this.event.title) {
          this.event.title = title
        }

        if (!this.event.description) {
          this.event.description = desc
        }
      }
    },
    rotate(deg) {
      const runtimeConfig = useRuntimeConfig()
      const api = runtimeConfig.APIv1

      this.$axios
        .post(api + '/image', {
          id: this.event.image.id,
          rotate: deg,
          bust: Date.now(),
          communityevent: true,
        })
        .then(() => {
          this.cacheBust = Date.now()
        })
    },
    rotateLeft() {
      this.rotate(90)
    },
    rotateRight() {
      this.rotate(-90)
    },
  },
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
