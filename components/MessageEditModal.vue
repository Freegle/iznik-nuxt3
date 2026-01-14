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
      <!-- Photo gallery - at the top -->
      <div v-if="attachments?.length" class="form-field photo-gallery">
        <draggable
          v-model="attachments"
          class="d-flex flex-wrap"
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
      </div>

      <!-- Photo uploader -->
      <div class="form-field uploader-container">
        <OurUploader v-model="attachments" type="Message" multiple />
      </div>

      <div v-if="message.location" class="edit-form">
        <!-- Row 1: Type and Item - stacked on mobile, side by side on desktop -->
        <div class="form-row">
          <div class="form-field form-field--type">
            <label :for="uniqueId">Type</label>
            <b-form-select
              :id="uniqueId"
              v-model="type"
              :options="typeOptions"
              size="lg"
            />
          </div>
          <div class="form-field form-field--item">
            <PostItem
              :id="id"
              ref="item"
              v-model:edititem="edititem"
              :type="type"
              edit
            />
          </div>
        </div>

        <!-- Row 2: Postcode -->
        <div class="form-row">
          <div class="form-field form-field--postcode">
            <PostCode
              label="Postcode"
              :find="false"
              size="lg"
              :value="postcode?.name"
              @selected="postcodeSelect"
              @cleared="postcodeClear"
            />
          </div>
        </div>

        <!-- Row 3: Quantity and Deadline - side by side -->
        <div class="form-row form-row--compact">
          <div
            v-if="message.type === 'Offer'"
            class="form-field form-field--quantity"
          >
            <NumberIncrementDecrement
              v-model="availablenow"
              label="Quantity"
              append-text=" available"
              class="count"
              size="md"
              :min="1"
            />
          </div>
          <div class="form-field form-field--deadline">
            <label for="deadline">Deadline</label>
            <b-input
              id="deadline"
              v-model="deadline"
              class="deadline-input"
              type="date"
              :min="today"
              :max="defaultDeadline"
            />
          </div>
        </div>

        <!-- Description -->
        <div class="form-field">
          <b-form-textarea
            ref="textbodyRef"
            v-model="edittextbody"
            :placeholder="placeholder"
            rows="6"
            :state="triedToSave ? !isSaveButtonDisabled : null"
          />
          <p class="invalid-feedback">
            Please provide either a description or a photo.
          </p>
        </div>
      </div>

      <div v-else>
        <div class="form-field">
          <b-form-input v-model="message.subject" />
        </div>
      </div>
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
import NumberIncrementDecrement from './NumberIncrementDecrement'
import { useMessageStore } from '~/stores/message'
import { useComposeStore } from '~/stores/compose'
import { useGroupStore } from '~/stores/group'
import { uid } from '~/composables/useId'
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
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins/_breakpoints';

.edit-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-row {
  display: flex;
  flex-direction: column;
  gap: 1rem;

  @include media-breakpoint-up(md) {
    flex-direction: row;
    align-items: flex-start;
  }
}

.form-row--compact {
  flex-direction: row;
  flex-wrap: wrap;
}

.form-field {
  display: flex;
  flex-direction: column;

  label {
    margin-bottom: 0.25rem;
    font-weight: 500;
  }
}

.form-field--type {
  flex: 0 0 auto;
  min-width: 120px;

  @include media-breakpoint-up(md) {
    flex: 0 0 140px;
  }
}

.form-field--item {
  flex: 1 1 auto;
}

.form-field--postcode {
  flex: 0 0 auto;
  max-width: 200px;
}

.form-field--quantity {
  flex: 0 0 auto;
  min-width: 140px;
}

.form-field--deadline {
  flex: 0 0 auto;
  min-width: 140px;
}

/* Fix date input on mobile - smaller font to prevent overlap with calendar icon */
.deadline-input {
  font-size: 0.875rem;
  padding-right: 0.5rem;

  @include media-breakpoint-up(md) {
    font-size: 1rem;
  }
}

.photo-gallery {
  margin-bottom: 0.5rem;
}

.uploader-container {
  margin-bottom: 1rem;

  :deep(.wrapper) {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
}

/* Add padding to postcode input to prevent text overlapping tick */
:deep(.postcode-input-wrapper .pcinp) {
  padding-right: 2.5rem;
}

:deep(.autocomplete-wrap) {
  border: 1px solid $color-gray-4 !important;

  input {
    min-height: calc(1.5em + 1rem) !important;
  }
}

.ghost {
  opacity: 0.5;
}
</style>
