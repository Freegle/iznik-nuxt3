<template>
  <b-modal id="profilemodal" v-model="showModal" size="lg" no-stacking>
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
      <div v-if="volunteering">
        <div v-if="added">
          <p>
            One of our volunteers will check over your opportunity, and then
            we'll publicise it to other freeglers.
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
        <div v-else>
          <div v-if="!editing">
            <div v-if="volunteering.image">
              <notice-message class="mb-3">
                Scroll down past the picture for more information!
              </notice-message>
              <b-row>
                <b-col>
                  <b-img
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
              <b-col class="mb-2 prewrap font-weight-bold forcebreak">{{ description }}</b-col>
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
                  :class="
                    date && date.string && date.string.past ? 'inpast' : ''
                  "
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

            <br />
            <p v-if="user" class="text-muted">
              Posted by {{ user.displayname }}
              <span class="text-faded">(#{{ user.id }})</span>
            </p>
          </div>
          <Form v-else-if="volunteering" ref="form">
            <b-row>
              <b-col cols="12" md="6">
                <b-form-group
                  ref="groupid"
                  label="For which community?"
                  :state="true"
                >
                  <GroupRememberSelect
                    v-model="groupid"
                    remember="editopportunity"
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
                    This is a national volunteer opportunity which will go out
                    to all communities. Please review carefully.
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
                <div class="float-right">
                  <div v-if="volunteering.image" class="container p-0">
                    <span @click="rotateLeft">
                      <v-icon
                        label="Rotate left"
                        class="topleft clickme"
                        title="Rotate left"
                      >
                        <v-icon icon="circle" scale="2" />
                        <v-icon icon="reply" class="rotate__icon" />
                      </v-icon>
                    </span>
                    <span @click="rotateRight">
                      <v-icon
                        label="Rotate right"
                        class="topright clickme"
                        title="Rotate right"
                        flip="horizontal"
                      >
                        <v-icon icon="circle" scale="2" />
                        <v-icon icon="reply" class="rotate__icon" />
                      </v-icon>
                    </span>
                  </div>
                  <b-img
                    v-if="volunteering.image"
                    thumbnail
                    :src="volunteering.image.paththumb + '?' + cacheBust"
                  />
                  <b-img v-else width="250" thumbnail src="/placeholder.jpg" />
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
                    imgtype="Volunteering"
                    imgflag="volunteering"
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
                  v-model="volunteering.description"
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
                  :rule="validateTimeCommitment"
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
            </span>
            <NoticeMessage v-else variant="warning" class="mt-2">
              <v-icon icon="info-circle" />&nbsp;This community has chosen not
              to allow Volunteer Opportunities.
            </NoticeMessage>
          </Form>
        </div>
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
          v-if="volunteering.canmodify"
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
          <SpinButton
            v-if="editing"
            variant="primary"
            :disabled="uploadingPhoto"
            :handler="saveIt"
            name="save"
            :label="volunteering.id ? 'Save Changes' : 'Add Opportunity'"
          />
          <b-button
            v-if="editing"
            variant="white"
            class="float-right mr-1"
            :disabled="uploadingPhoto"
            @click="dontSave"
          >
            Hide
          </b-button>
        </div>
      </div>
    </template>
  </b-modal>
</template>
<script>
import { defineRule, Form, Field, ErrorMessage } from 'vee-validate'
import { required, email, min, max } from '@vee-validate/rules'
import { useVolunteeringStore } from '../stores/volunteering'
import { useComposeStore } from '../stores/compose'
import { useUserStore } from '../stores/user'
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
    const volunteeringStore = useVolunteeringStore()
    const composeStore = useComposeStore()
    const userStore = useUserStore()

    if (props.id) {
      const v = await volunteeringStore.fetch(props.id)
      await userStore.fetch(v.userid)
    }

    return {
      volunteeringStore,
      composeStore,
      userStore,
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
    }
  },
  computed: {
    volunteering() {
      let ret = null

      if (this.id) {
        ret = this.volunteeringStore.byId(this.id)
      }

      if (!ret) {
        ret = initialVolunteering()
      }

      return ret
    },
    user() {
      return this.userStore.byId(this.volunteering?.userid)
    },
    uploadingPhoto() {
      return this.composeStore.uploading
    },
    isExisting() {
      return Boolean(this.volunteering.id)
    },
    description() {
      let desc = this.volunteering.description
      desc = desc ? twem(desc) : ''
      desc = desc.trim()
      return desc
    },
    enabled() {
      const group = this.myGroup(this.groupid)

      let ret = true

      if (group) {
        if ('volunteering' in group.settings) {
          ret = group.settings.volunteering
        }
      }

      return ret
    },
    shouldUpdatePhoto() {
      const { photo: oldPhoto } = this.volunteering
      const { photo: newPhoto } = this.volunteering
      return newPhoto && (oldPhoto ? newPhoto.id !== oldPhoto.id : true)
    },
  },
  methods: {
    show() {
      this.editing = this.startEdit
      this.showModal = true
      if (this.volunteering?.groups?.length > 0) {
        this.groupid = this.volunteering.groups[0]
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
    validateTimeCommitment(value) {
      if (!value) {
        return 'Please enter the time commitment.'
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
      await this.volunteeringStore.delete(this.volunteering.id)
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

      if (!validate.valid) {
        return
      }

      console.log('check group', this.groupid)
      if (this.isExisting) {
        const { id } = this.volunteering
        // This is an edit.
        if (this.shouldUpdatePhoto) {
          await this.volunteeringStore.setPhoto(id, this.volunteering.image.id)
        }

        const oldgroupid =
          this.volunteering.groups && this.volunteering.groups.length
            ? this.volunteering.groups[0]
            : null

        if (this.groupid !== oldgroupid) {
          // Save the new group, then remove the old group, so it won't get stranded.
          //
          // Checking for groupid > 0 allows systemwide opportunities.
          if (this.groupid > 0) {
            await this.volunteeringStore.addGroup(id, this.groupid)
          }

          if (oldgroupid) {
            await this.volunteeringStore.removeGroup(id, oldgroupid)
          }
        }

        await this.volunteeringStore.setDates({
          id,
          olddates: this.volunteering.dates,
          newdates: this.volunteering.dates,
        })

        await this.volunteeringStore.save(this.volunteering)

        this.added = true
      } else {
        // This is an add.  First create it to get the id.
        const dates = this.volunteering.dates
        const photoid = this.volunteering.image
          ? this.volunteering.image.id
          : null

        const id = await this.$store.dispatch(
          'volunteerops/add',
          this.volunteering
        )

        if (id) {
          if (photoid) {
            await this.volunteeringStore.setPhoto(id, photoid)
          }

          // Save the group.
          if (this.groupid > 0) {
            await this.volunteeringStore.addGroup(id, this.groupid)
          }

          if (dates && dates.length) {
            await this.volunteeringStore.setDates({
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
      // We may have updated the opportunity during the edit.  Fetch it again to reset those changes.
      await this.volunteeringStore.fetch(this.volunteering.id)
      this.hide()
    },
    photoAdd() {
      // Flag that we're uploading.  This will trigger the render of the filepond instance and subsequently the
      // processed callback below.
      this.uploading = true
    },
    photoProcessed(imageid, imagethumb, image) {
      // We have uploaded a photo.  Remove the filepond instance.
      this.uploading = false

      this.volunteering.image = {
        id: imageid,
        path: image,
        paththumb: imagethumb,
      }

      // We don't do OCR on these - volunteer op photos are much less likely to have useful text than community
      // events.
    },
    rotate(deg) {
      this.$axios
        .post(process.env.API + '/image', {
          id: this.volunteering.image.id,
          rotate: deg,
          bust: Date.now(),
          volunteering: true,
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

.topleft {
  top: 12px;
  left: 10px;
  position: absolute;
}

.topright {
  top: 12px;
  right: 10px;
  position: absolute;
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
</style>
