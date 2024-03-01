<template>
  <client-only>
    <DatePicker
      v-model:value="date"
      append-to-body
      :lang="lang"
      :type="type"
      :format="format"
      :placeholder="placeholder"
    >
      <template v-for="(_, slot) of $slots" #[slot]="scope">
        <slot :name="slot" v-bind="scope" />
      </template>
    </DatePicker>
  </client-only>
</template>
<script setup>
// We use script setup because of https://github.com/nuxt/nuxt/issues/19964.  We put this into a subcomponent so that
// we don't have to rework the other components which use it into script setup.
import DatePicker from 'vue-datepicker-next'
import 'vue-datepicker-next/index.css'
import { ref, watch } from '#imports'

const props = defineProps({
  modelValue: {
    type: Date,
    required: true,
  },
  lang: {
    type: String,
    default: 'en',
  },
  type: {
    type: String,
    default: 'date',
  },
  format: {
    type: String,
    default: 'YYYY-MM',
  },
  placeholder: {
    type: String,
    default: '',
  },
})

const date = ref(props.modelValue)

const emit = defineEmits(['update:modelValue'])

watch(date, (newVal) => {
  emit('update:modelValue', newVal)
})
</script>
