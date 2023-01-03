<template>
  <div>
    <b-modal
      v-if="message"
      id="aboutmemodal"
      v-model="showModal"
      size="lg"
      title-class="w-100"
    >
      <template #title>
        <div class="d-flex flex-wrap justify-content-between w-100">
          <em>{{ message.subject }}</em>
        </div>
      </template>
      <template #default>
        <div v-if="message.location">
          <b-row>
            <b-col cols="6" md="3">
              <div class="d-flex flex-column">
                <label :for="uniqueId"> Type </label>
                <b-form-select
                  :id="uniqueId"
                  v-model="type"
                  :options="typeOptions"
                  size="lg"
                />
              </div>
            </b-col>
            <b-col cols="6">
              <PostItem ref="item" v-model="item" />
            </b-col>
            <b-col cols="6" md="3">
              <!--              TODO MINOR The postcode isn't the same height as the inputs.-->
              <PostCode
                label="Postcode"
                :find="false"
                size="lg"
                :value="message.location.name"
                @selected="postcodeSelect"
                @cleared="postcodeClear"
              />
            </b-col>
          </b-row>
        </div>
        <div v-else>
          <b-row>
            <b-col cols="6">
              <b-form-input v-model="message.subject" />
            </b-col>
          </b-row>
        </div>
        <b-row>
          <b-col cols="6" md="3">
            <NumberIncrementDecrement
              v-if="message.type === 'Offer'"
              v-model="availablenow"
              label="Quantity"
              append-text=" available"
              class="count mt-3"
              size="md"
              :min="1"
            />
          </b-col>
        </b-row>
        <b-row>
          <b-col>
            <b-form-textarea
              ref="textbody"
              v-model="message.textbody"
              :placeholder="placeholder"
              rows="8"
              class="mt-2"
            />
          </b-col>
        </b-row>
        <b-row v-if="uploading" class="bg-white">
          <b-col class="p-0">
            <OurFilePond
              imgtype="Message"
              imgflag="message"
              @photoProcessed="photoProcessed"
            />
          </b-col>
        </b-row>
        <b-row v-if="attachments && attachments.length">
          <b-col>
            <b-list-group horizontal class="mb-1 mt-2">
              <b-list-group-item
                v-for="att in attachments"
                :key="'image-' + att.id"
                class="bg-transparent p-0"
              >
                <PostPhoto v-bind="att" @remove="removePhoto" />
              </b-list-group-item>
            </b-list-group>
          </b-col>
        </b-row>
      </template>
      <template #footer>
        <b-button variant="secondary" class="mr-auto" @click="photoAdd">
          <v-icon icon="camera" />&nbsp;Add photo
        </b-button>
        <b-button variant="white" :disabled="uploadingPhoto" @click="hide">
          Cancel
        </b-button>
        <SpinButton
          variant="primary"
          :disabled="uploadingPhoto"
          name="save"
          label="Save"
          @click="save"
        />
      </template>
    </b-modal>
    <OutcomeModal ref="outcomeModal" :message="message" />
  </div>
</template>
<script>
import { useMessageStore } from '../stores/message'
import { useComposeStore } from '../stores/compose'
import { useGroupStore } from '../stores/group'
import { uid } from '../composables/useId'
import NumberIncrementDecrement from './NumberIncrementDecrement'
import { ref } from '#imports'
import modal from '@/mixins/modal'
import OutcomeModal from '~/components/OutcomeModal'
import PostCode from '~/components/PostCode'
const OurFilePond = () => import('~/components/OurFilePond')
const PostItem = () => import('./PostItem')
const PostPhoto = () => import('./PostPhoto')

export default {
  components: {
    OutcomeModal,
    NumberIncrementDecrement,
    OurFilePond,
    PostCode,
    PostItem,
    PostPhoto,
  },
  mixins: [modal],
  props: {
    id: {
      type: Number,
      required: true,
    },
  },
  async setup(props) {
    const messageStore = useMessageStore()
    const composeStore = useComposeStore()
    const groupStore = useGroupStore()

    const message = await messageStore.fetch(props.id, true)

    return {
      messageStore,
      composeStore,
      groupStore,
      message,
      attachments: ref(message.attachments),
      textbody: ref(message.textbody),
      availablenow: ref(message.availablenow),
      availableinitially: ref(message.availableinitially),
      type: ref(message.type),
      item: ref(message.item),
      postcode: ref(message.postcode),
    }
  },
  data() {
    return {
      uploading: false,
      myFiles: [],
      image: null,
    }
  },
  computed: {
    uniqueId() {
      return uid('posttype-')
    },
    uploadingPhoto() {
      return this.composeStore.uploading
    },
    placeholder() {
      return this.message && this.type === 'Offer'
        ? "e.g. colour, condition, size, whether it's working etc."
        : "Explain what you're looking for, and why you'd like it."
    },
    count() {
      return this.message ? this.message.availablenow : null
    },
    groupid() {
      return this.message?.groups?.[0]?.groupid
    },
    group() {
      return this.groupStore.get(this.groupid)
    },
    typeOptions() {
      return [
        {
          value: 'Offer',
          text: this.group?.settings?.keywords?.offer
            ? this.group.settings.keywords.offer
            : 'OFFER',
        },
        {
          value: 'Wanted',
          text: this.group?.settings?.keywords?.wanted
            ? this.group.settings.keywords.wanted
            : 'WANTED',
        },
      ]
    },
  },
  watch: {
    count(newVal) {
      if (newVal === 0) {
        this.hide()
        this.$refs.outcomeModal.show()
      }
    },
  },
  methods: {
    async save() {
      if (this.item && (this.message.textbody || this.attachments.length)) {
        const attids = []
        for (const att of this.attachments) {
          attids.push(att.id)
        }

        // We change both availablenow and available initially.  Probably the user is correcting a mistake in how
        // they originally posted.
        //
        // Conceivably they are wrongly editing rather than using Mark as TAKEN - but if that's what's happening then
        // they won't be able to get down as far as 0 available because we have a min value of 1.  That will keep
        // the post open, and they will hopefully realise their error and use Mark as TAKEN eventually.
        await this.messageStore.patch({
          id: this.message.id,
          msgtype: this.type,
          item: this.item,
          location: this.postcode.name,
          textbody: this.textbody,
          attachments: attids,
          availablenow: this.availablenow,
          availableinitially: this.availablenow,
        })

        this.hide()
      }
    },
    removePhoto(id) {
      this.attachments = this.attachments.filter((item) => {
        return item.id !== id
      })
    },
    photoAdd() {
      // Flag that we're uploading.  This will trigger the render of the filepond instance and subsequently the
      // init callback below.
      this.uploading = true
    },
    photoProcessed(imageid, imagethumb, image) {
      // We have uploaded a photo.  Remove the filepond instance.
      this.uploading = false

      this.attachments.push({
        id: imageid,
        paththumb: imagethumb,
        path: image,
      })
    },
    postcodeSelect(pc) {
      this.postcode = pc
    },
    postcodeClear() {
      this.postcode = null
    },
  },
}
</script>
