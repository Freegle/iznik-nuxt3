<template>
  <b-modal
    ref="modal"
    size="lg"
    hide-header
    body-class="edit-modal-body"
    @hidden="onModalHidden"
  >
    <template #default>
      <div v-if="message.location" class="edit-form">
        <!-- Type and Location row - at top, space-between -->
        <div class="form-card form-card-row-spaced">
          <div class="form-field">
            <label :for="uniqueId" class="form-label">Type</label>
            <b-form-select
              :id="uniqueId"
              v-model="type"
              :options="typeOptions"
              class="form-select"
            />
          </div>
          <div class="form-field">
            <label class="form-label">Location</label>
            <PostCode
              :find="false"
              :value="postcode?.name"
              @selected="postcodeSelect"
              @cleared="postcodeClear"
            />
          </div>
        </div>

        <!-- What is it? -->
        <div class="form-card">
          <label class="form-label">
            {{ type === 'Offer' ? 'What is it?' : 'What are you looking for?' }}
          </label>
          <PostItem
            :id="id"
            ref="item"
            v-model:edititem="edititem"
            :type="type"
            edit
            class="form-input"
          />
        </div>

        <!-- Description -->
        <div class="form-card">
          <label for="edit-description" class="form-label">
            Any details that might help?
          </label>
          <b-form-textarea
            id="edit-description"
            v-model="edittextbody"
            :placeholder="placeholder"
            class="form-textarea"
            rows="4"
            :state="triedToSave ? !isSaveButtonDisabled : null"
          />
          <p class="invalid-feedback">
            Please provide either a description or a photo.
          </p>
        </div>

        <!-- Quantity and Deadline row -->
        <div class="form-card form-card-row-spaced">
          <div v-if="message.type === 'Offer'" class="form-field">
            <label class="form-label">How many?</label>
            <NumberIncrementDecrement
              v-model="availablenow"
              :min="1"
              :max="99"
              class="quantity-control"
            />
          </div>
          <div class="form-field form-field-date">
            <label for="edit-deadline" class="form-label">Deadline</label>
            <b-input
              id="edit-deadline"
              v-model="deadline"
              class="form-date"
              type="date"
              :min="today"
              :max="defaultDeadline"
            />
          </div>
        </div>

        <!-- Photo section - at the bottom, compact -->
        <div class="form-card photo-card">
          <label class="form-label">Photos</label>
          <div class="photo-grid">
            <PostPhoto
              v-for="(photo, index) in attachments"
              :id="photo.id"
              :key="photo.id || index"
              :path="photo.path"
              :paththumb="photo.paththumb"
              :ouruid="photo.ouruid"
              :externalmods="photo.externalmods"
              class="photo-item"
              @remove="removePhoto"
            />
            <div class="photo-add">
              <OurUploader
                v-model="attachments"
                type="Message"
                multiple
                compact
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Fallback for messages without location -->
      <div v-else class="form-card">
        <label class="form-label">Subject</label>
        <b-form-input v-model="message.subject" />
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
import NumberIncrementDecrement from './NumberIncrementDecrement'
import PostPhoto from './PostPhoto.vue'
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
    ? "e.g. colour, condition, size, whether it's working..."
    : "Explain what you're looking for, and why you'd like it..."
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
@import 'assets/css/_color-vars.scss';

/* Modal body background and height constraint for sticky ads */
:deep(.edit-modal-body) {
  background: #f8f9fa;
  padding: 0.5rem;
  max-height: calc(100vh - 200px) !important;

  @include media-breakpoint-up(md) {
    padding: 0.75rem;
    max-height: calc(100vh - 350px) !important;
  }
}

/* Form layout */
.edit-form {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

/* Card style for each section */
.form-card {
  background: white;
  padding: 0.875rem;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

/* Row layout for combined fields - space between */
.form-card-row-spaced {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;

  @include media-breakpoint-up(sm) {
    flex-direction: row;
    align-items: flex-end;
    justify-content: space-between;
    gap: 1rem;
  }
}

.form-field {
  flex: 0 0 auto;
  min-width: 140px;
}

.form-field-date {
  flex: 0 0 auto;
  width: 160px;
}

/* Conversational label style */
.form-label {
  display: block;
  font-size: 0.9rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.375rem;
}

/* Input styling */
.form-input {
  :deep(input) {
    font-size: 1rem;
    padding: 0.5rem 0.75rem;
    border: 2px solid #e5e7eb;
    transition: border-color 0.2s;

    &:focus {
      border-color: $color-green-background;
      box-shadow: 0 0 0 2px rgba($color-green-background, 0.1);
    }
  }

  :deep(label) {
    display: none;
  }
}

.form-textarea {
  font-size: 0.95rem;
  padding: 0.5rem 0.75rem;
  border: 2px solid #e5e7eb;
  resize: vertical;
  min-height: 80px;
  transition: border-color 0.2s;

  &:focus {
    border-color: $color-green-background;
    box-shadow: 0 0 0 2px rgba($color-green-background, 0.1);
  }
}

.form-select {
  font-size: 1rem;
  padding: 0.5rem 0.75rem;
  border: 2px solid #e5e7eb;
  text-transform: uppercase;
  transition: border-color 0.2s;
  min-height: 42px;
  width: 100%;

  &:focus {
    border-color: $color-green-background;
    box-shadow: 0 0 0 2px rgba($color-green-background, 0.1);
  }
}

.form-date {
  font-size: 1rem;
  padding: 0.5rem 0.75rem;
  border: 2px solid #e5e7eb;
  transition: border-color 0.2s;
  min-height: 42px;
  width: 100%;

  &:focus {
    border-color: $color-green-background;
    box-shadow: 0 0 0 2px rgba($color-green-background, 0.1);
  }
}

.quantity-control {
  :deep(label) {
    display: none;
  }

  :deep(.input-group) {
    min-height: 42px;
  }

  :deep(input) {
    min-height: 42px;
  }

  :deep(.btn) {
    min-height: 42px;
  }
}

/* PostCode styling */
:deep(.autocomplete-wrap) {
  border: 2px solid #e5e7eb !important;
  min-height: 42px;

  input {
    font-size: 1rem !important;
    padding: 0.5rem 0.75rem !important;
    border: none !important;
    min-height: 38px !important;
  }

  &:focus-within {
    border-color: $color-green-background !important;
    box-shadow: 0 0 0 2px rgba($color-green-background, 0.1);
  }
}

:deep(.postcode-input-wrapper) {
  min-width: 150px;
}

:deep(.postcode-input-wrapper .pcinp) {
  padding-right: 2.5rem;
}

/* Photo section - compact grid */
.photo-card {
  padding: 0.75rem;
}

.photo-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: flex-start;
}

.photo-item {
  width: 100px;
  height: 100px;
  margin: 0 !important;

  :deep(.container) {
    width: 100px !important;
    height: 100px !important;
    padding: 0 !important;
    margin: 0 !important;
  }

  :deep(.image-wrapper) {
    width: 100px;
    height: 100px;

    img,
    picture {
      width: 100px !important;
      height: 100px !important;
      object-fit: cover;
    }
  }

  :deep(.square) {
    width: 100px !important;
    height: 100px !important;
    min-width: 100px !important;
    min-height: 100px !important;
    max-width: 100px !important;
    max-height: 100px !important;
  }
}

.photo-add {
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px dashed #e5e7eb;
  border-radius: 8px;
  background: #f9fafb;

  :deep(.wrapper) {
    width: 100% !important;
    height: 100% !important;
    min-height: unset !important;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 0.5rem;
  }

  :deep(.camera) {
    font-size: 1.5rem !important;
    margin-bottom: 0.25rem;
  }

  :deep(.btn) {
    padding: 0.25rem 0.5rem !important;
    font-size: 0.7rem !important;
  }

  :deep(.d-flex) {
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
  }
}
</style>
