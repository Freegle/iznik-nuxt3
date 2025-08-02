<template>
  <b-modal
    v-model="show"
    size="lg"
    centered
    hide-header
    hide-footer
    @hidden="$emit('close')"
  >
    <div class="birthday-modal-content">
      <BirthdayHero
        :group-age="groupAge"
        :title="title"
        :group-id="groupId"
        :is-today="true"
        @donation-success="onDonationSuccess"
        @donation-click="onDonationClick"
      />

      <div class="text-center mt-4">
        <b-button variant="secondary" size="lg" @click="closeModal">
          Maybe later
        </b-button>
      </div>
    </div>
  </b-modal>
</template>

<script setup>
import BirthdayHero from '~/components/BirthdayHero'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  groupAge: {
    type: Number,
    required: true,
  },
  groupName: {
    type: String,
    required: true,
  },
  groupId: {
    type: Number,
    required: true,
  },
})

const emit = defineEmits([
  'update:modelValue',
  'close',
  'donation-success',
  'donation-click',
])

const show = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const title = computed(
  () => `${props.groupName} is ${props.groupAge} years old!`
)

function closeModal() {
  show.value = false
}

function onDonationSuccess() {
  emit('donation-success')
  closeModal()
}

function onDonationClick(amount) {
  emit('donation-click', amount)
}
</script>

<style scoped lang="scss">
.birthday-modal-content {
  .birthday-hero {
    min-height: 60vh;
  }
}

/* Override modal background to be more festive */
:deep(.modal-content) {
  background: linear-gradient(135deg, #f8f9ff, #fff8f0);
  border: 3px solid #ff6b9d;
  border-radius: 20px;
}
</style>
