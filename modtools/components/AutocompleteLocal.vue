<template>
  <div class="autocomplete">
    <input
      v-model="search"
      class="form-control"
      type="text"
      :size="size"
      :placeholder="placeholder"
      @input="onChange"
      @keydown.down="onArrowDown"
      @keydown.up="onArrowUp"
      @keydown.enter="onEnter"
    />
    <ul v-show="isOpen" id="autocomplete-results" class="autocomplete-results">
      <li v-if="isLoading" class="loading">Loading results...</li>
      <li
        v-for="(result, i) in results"
        v-else
        :key="i"
        class="autocomplete-result"
        :class="{ 'is-active': i === arrowCounter }"
        @click="setResult(result)"
      >
        {{ result }}
      </li>
    </ul>
  </div>
</template>
<script setup>
// Originally based on https://alligator.io/vuejs/vue-autocomplete-component/ by
// https://alligator.io/author/filipa-lacerda
import { ref, watch, onMounted, onUnmounted, getCurrentInstance } from 'vue'

const props = defineProps({
  items: {
    type: Array,
    required: false,
    default: () => [],
  },
  isAsync: {
    type: Boolean,
    required: false,
    default: false,
  },
  size: {
    type: String,
    required: false,
    default: '20',
  },
  placeholder: {
    type: String,
    required: false,
    default: null,
  },
})

const emit = defineEmits(['update:modelValue', 'input'])

const isOpen = ref(false)
const results = ref([])
const search = ref('')
const isLoading = ref(false)
const arrowCounter = ref(0)

watch(
  () => props.items,
  (val, oldValue) => {
    if (val.length !== oldValue.length) {
      results.value = val
      isLoading.value = false
    }
  }
)

const instance = getCurrentInstance()

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

function onChange() {
  emit('update:modelValue', search.value)

  if (props.isAsync) {
    isLoading.value = true
  } else {
    filterResults()
    isOpen.value = true
  }
}

function filterResults() {
  results.value = props.items.filter((item) => {
    return item.toLowerCase().includes(search.value.toLowerCase())
  })
}

function setResult(result) {
  search.value = result
  isOpen.value = false
  emit('update:modelValue', search.value)
}

function onArrowDown() {
  if (arrowCounter.value < results.value.length) {
    arrowCounter.value = arrowCounter.value + 1
  }
}

function onArrowUp() {
  if (arrowCounter.value > 0) {
    arrowCounter.value = arrowCounter.value - 1
  }
}

function onEnter() {
  search.value = results.value[arrowCounter.value]
  emit('input', search.value)
  isOpen.value = false
  arrowCounter.value = -1
}

function handleClickOutside(evt) {
  if (!instance.proxy.$el.contains(evt.target)) {
    isOpen.value = false
    arrowCounter.value = -1
  }
}
</script>
<style scoped>
.autocomplete {
  position: relative;
}

.autocomplete-results {
  padding: 0;
  margin: 0;
  border: 1px solid #eeeeee;
  height: 120px;
  overflow: auto;
  width: 100%;
  background-color: white;
}

.autocomplete-result {
  list-style: none;
  text-align: left;
  padding: 4px 2px;
  cursor: pointer;
}

.autocomplete-result.is-active,
.autocomplete-result:hover {
  background-color: #4aae9b;
  color: white;
}
</style>
