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
                <NuxtImg
                  v-if="volunteering?.image?.imageuid"
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
            Posted by {{ user.displayname }}
            <span v-for="(group, index) in groups" :key="index">
              <span v-if="index > 0">, </span><span v-else>on </span>
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
              <div v-if="volunteering.image" class="container">
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
                  <NuxtImg
                    v-if="volunteering?.image?.imageuid"
                    format="webp"
                    provider="uploadcare"
                    :src="volunteering.image.imageuid"
                    :modifiers="mods"
                    alt="Volunteer Opportunity Photo"
                    class="mb-2 w-100"
                  />
                  <b-img
                    v-else-if="volunteering.image"
                    fluid
                    :src="volunteering.image.paththumb + '?' + cacheBust"
                  />
                  <b-img v-else width="250" thumbnail src="/placeholder.jpg" />
                </div>
              </div>
            </b-col>
          </b-row>
          <span v-if="enabled">
            <b-row>
              <b-col>
                <b-button variant="primary" class="mt-1" @click="photoAdd">
                  <v-icon icon="camera" /> Upload photo
                </b-button>
              </b-col>
            </b-row>
            <b-row v-if="uploading">
              <b-col>
                <OurUploader
                  v-model="currentAtts"
                  class="bg-white"
                  type="Volunteering"
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
                :rules="validateTimeCommitment"
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
          </span>
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
            Hide
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
<script>
import { defineRule, Form as VeeForm, Field, ErrorMessage } from 'vee-validate'
import { required, email, min, max } from '@vee-validate/rules'
import { useVolunteeringStore } from '../stores/volunteering'
import { useComposeStore } from '../stores/compose'
import { useUserStore } from '../stores/user'
import { useGroupStore } from '../stores/group'
import EmailValidator from './EmailValidator'
import SpinButton from '~/components/SpinButton.vue'
import { twem } from '~/composables/useTwem'
import { ref } from '#imports'
import { useModal } from '~/composables/useModal'
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

export default {
  components: {
    EmailValidator,
    SpinButton,
    GroupSelect,
    OurUploader,
    StartEndCollection,
    NoticeMessage,
    DonationButton,
    ExternalLink,
    VeeForm,
    Field,
    ErrorMessage,
  },
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
    const groupStore = useGroupStore()
    const groupid = ref(null)

    const { modal, hide } = useModal()

    if (props.id) {
      const v = await volunteeringStore.fetch(props.id)
      await userStore.fetch(v.userid)

      v.groups?.forEach(async (id) => {
        groupid.value = id
        await groupStore.fetch(id)
      })
    }

    const oldPhoto = ref(volunteeringStore.byId(props.id)?.image)

    const editing = ref(props.startEdit)
    const added = ref(false)

    return {
      volunteeringStore,
      composeStore,
      userStore,
      groupStore,
      groupid,
      oldPhoto,
      modal,
      hide,
      editing,
      added,
    }
  },
  data() {
    return {
      cacheBust: Date.now(),
      uploading: false,
      showGroupError: false,
      description: null,
      currentAtts: [],
      mods: {},
    }
  },
  computed: {
    volunteering() {
      let ret = null

      if (this.id) {
        ret = this.volunteeringStore?.byId(this.id)
      }

      if (!ret) {
        ret = initialVolunteering()
      }

      return ret
    },
    canmodify() {
      return this.volunteering?.userid === this.myid
    },
    groups() {
      const ret = []
      this.volunteering?.groups?.forEach((id) => {
        const group = this.groupStore?.get(id)

        if (group) {
          ret.push(group)
        }
      })

      return ret
    },
    user() {
      return this.userStore?.byId(this.volunteering?.userid)
    },
    uploadingPhoto() {
      return this.composeStore?.uploading
    },
    isExisting() {
      return Boolean(this.volunteering?.id)
    },
    enabled() {
      const group = this.groupStore.get(this.groupid)

      let ret = true

      if (group?.settings) {
        if ('volunteering' in group.settings) {
          ret = group.settings.volunteering
        }
      }

      return ret
    },
  },
  watch: {
    event: {
      handler(newVal) {
        let desc = newVal?.description
        desc = desc ? twem(desc) : ''
        desc = desc.trim()

        this.description = desc
      },
      immediate: true,
    },
    description: {
      handler(newVal) {
        this.volunteering.description = newVal
      },
    },
    currentAtts: {
      handler(newVal) {
        this.uploading = false

        this.volunteering.image = {
          id: newVal[0].id,
          imageuid: newVal[0].externaluid,
          imagemods: newVal[0].externalmods,
        }
      },
      deep: true,
    },
  },
  methods: {
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
    async saveIt(callback) {
      const validate = await this.$refs.form.validate()

      if (!this.groupid) {
        this.showGroupError = true
        callback()
        return
      } else {
        this.showGroupError = false
      }

      if (!validate.valid) {
        callback()
        return
      }

      if (this.isExisting) {
        const { id } = this.volunteering

        // Save the WIP volop before we start making changes, otherwise the saves will update the store and hence
        // what we're looking at.
        const wip = JSON.parse(JSON.stringify(this.volunteering))
        let shouldUpdatePhoto = null

        if (wip.image?.id !== this.oldPhoto?.id) {
          shouldUpdatePhoto = wip.image.id
        }

        if (shouldUpdatePhoto) {
          await this.volunteeringStore.setPhoto(id, shouldUpdatePhoto)
        }

        const oldgroupid =
          wip.groups && wip.groups.length ? wip.groups[0] : null

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
          olddates: wip.dates,
          newdates: wip.dates,
        })

        await this.volunteeringStore.save(wip)

        this.added = true
      } else {
        // This is an add.  First create it to get the id.
        const dates = this.volunteering.dates
        const photoid = this.volunteering.image
          ? this.volunteering.image.id
          : null

        const id = await this.volunteeringStore.add(this.volunteering)

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
      callback()
    },
    async dontSave() {
      if (this.id) {
        // We may have updated the opportunity during the edit.  Fetch it again to reset those changes.
        await this.volunteeringStore.fetch(this.volunteering.id)
      }

      this.hide()
    },
    photoAdd() {
      // Flag that we're uploading.  This will trigger the render of the filepond instance and subsequently the
      // processed callback below.
      this.uploading = true
    },
    async rotate(deg) {
      const curr = this.mods?.rotate || 0
      this.mods.rotate = curr + deg

      // Ensure between 0 and 360
      this.mods.rotate = (this.mods.rotate + 360) % 360

      await this.imageStore.post({
        id: this.volunteering.image.id,
        rotate: this.mods.rotate,
        bust: Date.now(),
        volunteering: true,
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
