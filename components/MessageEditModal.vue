<template>
  <b-modal
    ref="modal"
    scrollable
    size="lg"
    title-class="w-100"
    @hidden="onModalHidden"
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
        <b-col cols="6" md="3">
          <div class="mt-3">
            <label :for="deadline"> Deadline </label>
            <b-input
              id="deadline"
              v-model="deadline"
              size="lg"
              type="date"
              :min="today"
              :max="defaultDeadline"
              placeholder="Click to enter a deadline"
            />
          </div>
        </b-col>
      </b-row>
      <b-row>
        <b-col>
          <b-form-textarea
            ref="textbodyRef"
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
      <b-row class="bg-white">
        <b-col class="p-0">
          <OurUploader v-model="attachments" type="Message" multiple />
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
                  :id="element.id"
                  :path="element.path"
                  :paththumb="element.paththumb"
                  :thumbnail="element.thumbnail"
                  :externaluid="element.externaluid"
                  :ouruid="element.ouruid"
                  :externalmods="element.externalmods"
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
      <b-button variant="white" :disabled="uploadingPhoto" @click="hide">
        Cancel
      </b-button>
      <SpinButton
        variant="primary"
        :disabled="uploadingPhoto || isSaveButtonDisabled"
        icon-name="save"
        label="Save"
        @handle="save"
      />
    </template>
  </b-modal>
</template>

<script setup>
import { ref, computed, defineAsyncComponent, toRaw } from 'vue'
import draggable from 'vuedraggable'
import { useMessageStore } from '../stores/message'
import { useComposeStore } from '../stores/compose'
import { useGroupStore } from '../stores/group'
import { uid } from '../composables/useId'
import NumberIncrementDecrement from './NumberIncrementDecrement'
import PostCode from '~/components/PostCode'
import { useOurModal } from '~/composables/useOurModal'
import { MESSAGE_EXPIRE_TIME } from '~/constants'

const OurUploader = defineAsyncComponent(() =>
  import('~/components/OurUploader')
)
const PostItem = defineAsyncComponent(() => import('./PostItem'))
const PostPhoto = defineAsyncComponent(() => import('./PostPhoto'))

const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
})

const emit = defineEmits(['hidden'])

const messageStore = useMessageStore()
const composeStore = useComposeStore()
const groupStore = useGroupStore()

const { modal, hide } = useOurModal()

// Message was fetched by parent.
const message = toRaw(messageStore.byId(props.id))
const textbody = message.textbody
const itemName = message.item?.name
const attachments = ref(message.attachments || [])
const triedToSave = ref(false)
const textbodyRef = ref(null)
const item = ref(null)

const defaultDeadline = new Date(
  Date.now() + MESSAGE_EXPIRE_TIME * 24 * 60 * 60 * 1000
)
  .toISOString()
  .substring(0, 10)

const today = computed(() => {
  return new Date(Date.now()).toISOString().substring(0, 10)
})

const edittextbody = ref(textbody)
const availablenow = ref(message.availablenow)
const deadline = ref(
  message.deadline
    ? new Date(message.deadline).toISOString().substring(0, 10)
    : null
)
const type = ref(message.type)
const edititem = ref(itemName)
const postcode = ref(message.location)

const uniqueId = computed(() => {
  return uid('posttype-')
})

const uploadingPhoto = computed(() => {
  return composeStore?.uploading
})

const placeholder = computed(() => {
  return message && type.value === 'Offer'
    ? "e.g. colour, condition, size, whether it's working etc."
    : "Explain what you're looking for, and why you'd like it."
})

const groupid = computed(() => {
  return message?.groups?.[0]?.groupid
})

const group = computed(() => {
  return groupStore?.get(groupid.value)
})

const typeOptions = computed(() => {
  return [
    {
      value: 'Offer',
      text: group.value?.settings?.keywords?.offer
        ? group.value.settings.keywords.offer
        : 'OFFER',
    },
    {
      value: 'Wanted',
      text: group.value?.settings?.keywords?.wanted
        ? group.value.settings.keywords.wanted
        : 'WANTED',
    },
  ]
})

const isSaveButtonDisabled = computed(() => {
  return !edittextbody.value && !attachments.value?.length
})

async function save() {
  triedToSave.value = true

  if (edititem.value && (edittextbody.value || attachments.value?.length)) {
    const attids = []

    if (attachments.value?.length) {
      for (const att of attachments.value) {
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
      id: props.id,
      msgtype: type.value,
      item: edititem.value,
      location: postcode.value?.name,
      textbody: edittextbody.value,
      attachments: attids,
      availablenow: availablenow.value,
      availableinitially: availablenow.value,
      deadline:
        deadline.value && deadline.value > '1970-01-01' ? deadline.value : null,
    }

    hide()
    await messageStore.patch(params)
  }
}

function removePhoto(id) {
  attachments.value = attachments.value.filter((item) => {
    return item.id !== id
  })
}

function postcodeSelect(pc) {
  postcode.value = pc
}

function postcodeClear() {
  postcode.value = null
}

function onModalHidden() {
  emit('hidden')
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
