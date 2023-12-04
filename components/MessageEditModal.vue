<template>
  <b-modal ref="modal" scrollable size="lg" title-class="w-100">
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
            <PostItem
              :id="id"
              ref="item"
              v-model:edititem="edititem"
              :type="type"
              edit
            />
          </b-col>
          <b-col cols="6" md="3">
            <PostCode
              label="Postcode"
              :find="false"
              size="lg"
              :value="postcode?.name"
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
            v-model="edittextbody"
            :placeholder="placeholder"
            rows="8"
            class="mt-2"
            :state="triedToSave ? !isSaveButtonDisabled : null"
          />
          <p class="invalid-feedback">
            Please provide either a description or a photo.
          </p>
        </b-col>
      </b-row>
      <b-row v-if="uploading" class="bg-white">
        <b-col class="p-0">
          <OurFilePond
            imgtype="Message"
            imgflag="message"
            @photo-processed="photoProcessed"
          />
        </b-col>
      </b-row>
      <b-row v-if="attachments?.length">
        <b-col>
          <draggable
            v-model="attachments"
            class="d-flex flex-wrap mb-1 mt-2"
            :item-key="(el) => `image-${el.id}`"
            :animation="150"
            ghost-class="ghost"
          >
            <template #item="{ element, index }">
              <div class="bg-transparent p-0">
                <PostPhoto
                  v-bind="element"
                  :primary="index === 0"
                  @remove="removePhoto"
                />
              </div>
            </template>
          </draggable>
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
        :disabled="uploadingPhoto || (!edittextbody && !attachments?.length)"
        name="save"
        label="Save"
        spinclass="text-white"
        @handle="save"
      />
    </template>
  </b-modal>
</template>

<script>
import { ref, toRaw } from 'vue'
import draggable from 'vuedraggable'
import { useMessageStore } from '../stores/message'
import { useComposeStore } from '../stores/compose'
import { useGroupStore } from '../stores/group'
import { uid } from '../composables/useId'
import NumberIncrementDecrement from './NumberIncrementDecrement'
import PostCode from '~/components/PostCode'
import { useModal } from '~/composables/useModal'
const OurFilePond = () => import('~/components/OurFilePond')
const PostItem = () => import('./PostItem')
const PostPhoto = () => import('./PostPhoto')

export default {
  components: {
    draggable,
    NumberIncrementDecrement,
    OurFilePond,
    PostCode,
    PostItem,
    PostPhoto,
  },
  props: {
    id: {
      type: Number,
      required: true,
    },
  },
  setup(props) {
    const messageStore = useMessageStore()
    const composeStore = useComposeStore()
    const groupStore = useGroupStore()

    const { modal, hide } = useModal()

    // Message was fetched by parent.  This allows us to avoid an async setup, which causes problems where waitForRef
    // returns before the component fully exists and therefore show() fails.
    const message = toRaw(messageStore.byId(props.id))
    const textbody = message.textbody
    const item = message.item?.name

    return {
      messageStore,
      composeStore,
      groupStore,
      modal,
      hide,
      message,
      attachments: ref(message.attachments),
      edittextbody: ref(textbody),
      availablenow: ref(message.availablenow),
      availableinitially: ref(message.availableinitially),
      type: ref(message.type),
      edititem: ref(item),
      postcode: ref(message.location),
    }
  },
  data() {
    return {
      uploading: false,
      myFiles: [],
      image: null,
      triedToSave: false,
    }
  },
  computed: {
    uniqueId() {
      return uid('posttype-')
    },
    uploadingPhoto() {
      return this.composeStore?.uploading
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
      return this.groupStore?.get(this.groupid)
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
    isSaveButtonDisabled() {
      return !this.edittextbody && !this.attachments?.length
    },
  },
  methods: {
    async save({ callback }) {
      this.triedToSave = true
      if (this.isSaveButtonDisabled) {
        callback()
        return
      }

      if (this.edititem && (this.edittextbody || this.attachments?.length)) {
        const attids = []

        if (this.attachments?.length) {
          for (const att of this.attachments) {
            attids.push(att.id)
          }
        }

        // We change both availablenow and available initially.  Probably the user is correcting a mistake in how
        // they originally posted.
        //
        // Conceivably they are wrongly editing rather than using Mark as TAKEN - but if that's what's happening then
        // they won't be able to get down as far as 0 available because we have a min value of 1.  That will keep
        // the post open, and they will hopefully realise their error and use Mark as TAKEN eventually.
        const params = {
          id: this.id,
          msgtype: this.type,
          item: this.edititem,
          location: this.postcode?.name,
          textbody: this.edittextbody,
          attachments: attids,
          availablenow: this.availablenow,
          availableinitially: this.availablenow,
        }

        this.hide()
        await this.messageStore.patch(params)
      }
      callback()
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

      if (!this.attachments) {
        console.log('Fix empty attach')
        this.attachments = []
      }

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
<style scoped lang="scss">
.ghost {
  opacity: 0.5;
}

:deep(.autocomplete-wrap) {
  border: 1px solid $color-gray-4 !important;

  input {
    min-height: calc(1.5em + 1rem) !important;
  }
}
</style>
