<template>
  <div :class="`${getClassName('wrapper')} autocomplete-wrapper`">
    <div :class="parentClass">
      <client-only>
        <b-input-group :class="wrapClass">
          <input
            :id="id"
            ref="input"
            v-model="type"
            type="text"
            :class="`${getClassName('input')} autocomplete-input`"
            :placeholder="placeholder"
            :name="name"
            autocomplete="off"
            :invalid="invalid"
            :size="size"
            @input="handleInput"
            @dblclick="handleDoubleClick"
            @blur="handleBlur"
            @keydown="handleKeyDown"
            @focus="handleFocus"
          />
          <slot name="append">
            <b-button
              variant="white"
              class="transbord p-0 pr-2"
              tabindex="-1"
              aria-label="Busy indicator"
            >
              <v-icon
                icon="sync"
                :class="
                  'text-success fa-spin ' +
                  (ajaxInProgress ? 'visible' : 'invisible')
                "
              />
            </b-button>
          </slot>
        </b-input-group>
        <b-button
          v-if="searchbutton"
          variant="primary"
          size="lg"
          class="searchbutton"
          @click="search"
        >
          <v-icon icon="search" />&nbsp;Search
        </b-button>
        <template #fallback>
          <div :class="'input-group ' + wrapClass" role="group">
            <input
              :id="id"
              ref="input"
              v-model="type"
              type="text"
              :class="`${getClassName('input')} autocomplete-input`"
              :placeholder="placeholder"
              :name="name"
              autocomplete="off"
              :invalid="invalid"
              :size="size"
            />
            <button
              class="btn btn-md btn-white transbord p-0 pr-2"
              type="button"
              tabindex="-1"
            >
              <svg
                class="svg-inline--fa fa-arrows-rotate text-success fa-spin invisible"
                aria-hidden="true"
                focusable="false"
                data-prefix="fas"
                data-icon="arrows-rotate"
                role="img"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 512 512"
              >
                <path
                  class=""
                  fill="currentColor"
                  d="M105.1 202.6c7.7-21.8 20.2-42.3 37.8-59.8c62.5-62.5 163.8-62.5 226.3 0L386.3 160H352c-17.7 0-32 14.3-32 32s14.3 32 32 32H463.5c0 0 0 0 0 0h.4c17.7 0 32-14.3 32-32V80c0-17.7-14.3-32-32-32s-32 14.3-32 32v35.2L414.4 97.6c-87.5-87.5-229.3-87.5-316.8 0C73.2 122 55.6 150.7 44.8 181.4c-5.9 16.7 2.9 34.9 19.5 40.8s34.9-2.9 40.8-19.5zM39 289.3c-5 1.5-9.8 4.2-13.7 8.2c-4 4-6.7 8.8-8.1 14c-.3 1.2-.6 2.5-.8 3.8c-.3 1.7-.4 3.4-.4 5.1V432c0 17.7 14.3 32 32 32s32-14.3 32-32V396.9l17.6 17.5 0 0c87.5 87.4 229.3 87.4 316.7 0c24.4-24.4 42.1-53.1 52.9-83.7c5.9-16.7-2.9-34.9-19.5-40.8s-34.9 2.9-40.8 19.5c-7.7 21.8-20.2 42.3-37.8 59.8c-62.5 62.5-163.8 62.5-226.3 0l-.1-.1L125.6 352H160c17.7 0 32-14.3 32-32s-14.3-32-32-32H48.4c-1.6 0-3.2 .1-4.8 .3s-3.1 .5-4.6 1z"
                ></path>
              </svg>
            </button>
          </div>
        </template>
      </client-only>
    </div>
    <div v-if="invalid" class="text-danger text-center">
      {{ notFoundMessage }}
    </div>
    <div
      v-show="showList && json.length"
      :class="`${getClassName(
        'list'
      )} autocomplete autocomplete-list position-relative`"
    >
      <v-icon
        v-if="closeButton"
        icon="times-circle"
        class="close mt-1 clickme"
        size="2x"
        @click="close"
      />
      <ul :class="`${getClassName('listentrylist')}`">
        <li
          v-for="(data, i) in json"
          :key="'autocomplete' + data.id"
          :class="activeClass(i) + ' ' + `${getClassName('listentry')}`"
        >
          <a
            href="#"
            @click.prevent="selectList(data)"
            @mousemove="mousemove(i)"
          >
            <!-- eslint-disable-next-line -->
            <div v-if="onShouldRenderChild" v-html="onShouldRenderChild(data)" />
            <div v-if="!onShouldRenderChild">
              <Highlighter
                :text-to-highlight="deepValue(data, anchor)"
                :search-words="[type]"
                highlight-class-name="highlight"
                auto-escape
                class="autocomplete-anchor-text"
              />
              <span class="autocomplete-anchor-label">{{
                deepValue(data, label)
              }}</span>
            </div>
          </a>
        </li>
      </ul>
    </div>
  </div>
</template>
<script setup>
/*
 * Originally based on:
 *
 *! Copyright (c) 2016 Naufal Rabbani (http://github.com/BosNaufal)
 * Licensed Under MIT (http://opensource.org/licenses/MIT)
 *
 * Vue 2 Autocomplete @ Version 0.0.1
 *
 * Modified by EH as that repository is no longer maintained.
 *
 */

/* eslint-disable */
import { ref, computed, watch, onMounted } from 'vue'
import cloneDeep from 'lodash.clonedeep'
import Highlighter from 'vue-highlight-words'

// Props
const props = defineProps({
  id: String,
  name: String,
  className: String,
  classes: {
    type: Object,
    default: () => ({
      wrapper: false,
      input: false,
      list: false,
      item: false,
      listentry: false,
      listentrylist: false
    })
  },
  placeholder: String,
  required: Boolean,

  // Initial Value
  initValue: {
    type: String,
    default: ''
  },

  // Manual List
  options: Array,

  // Filter After Get the data
  filterByAnchor: {
    type: Boolean,
    default: true
  },

  restrict: {
    type: Boolean,
    default: false
  },

  // Anchor of list
  anchor: {
    type: String,
    required: true
  },

  // Label of list
  label: String,

  // Debounce time
  debounce: Number,

  // ajax URL will be fetched
  url: {
    type: String,
    required: true
  },

  // query param
  param: {
    type: String,
    default: 'q'
  },

  encodeParams: {
    type: Boolean,
    default: true
  },

  // Custom Params
  customParams: Object,

  // Custom Headers
  customHeaders: Object,

  // minimum length
  min: {
    type: Number,
    default: 0
  },

  // Create a custom template from data.
  onShouldRenderChild: Function,

  // Process the result before retrieveng the result array.
  process: Function,

  // Callback
  onInput: Function,
  onShow: Function,
  onBlur: Function,
  onHide: Function,
  onFocus: Function,
  onSelect: Function,
  onBeforeAjax: Function,
  onAjaxProgress: Function,
  onAjaxLoaded: Function,
  onShouldGetData: Function,

  searchbutton: {
    type: String,
    required: false,
    default: ""
  },

  timeout: {
    type: Number,
    required: false,
    default: null
  },

  closeButton: {
    type: Boolean,
    required: false,
    default: false
  },

  size: {
    type: Number,
    required: false,
    default: null
  },

  variant: {
    type: String,
    required: false,
    default: null
  },

  notFoundMessage: {
    type: String,
    required: false,
    default: 'Sorry, we can\'t find that.'
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'search', 'invalid'])

// Refs
const input = ref(null)
const showList = ref(false)
const showTimer = ref(null)
const type = ref('')
const json = ref([])
const focusList = ref('')
const debounceTask = ref(undefined)
const ajaxInProgress = ref(null)
const ajaxDeferred = ref(null)
const invalid = ref(false)
const focused = ref(false)

// Computed
const wrapClass = computed(() => {
  let border

  switch (props.variant) {
    case 'primary': {
      border = ' border border-primary'
      break;
    }
    case 'success': {
      border = ' border border-success'
      break;
    }
    default: {
      border = ''
      break;
    }
  }

  return 'autocomplete-wrap ' + (focused.value ? ' autocomplete-wrap-focus' : '') + ' ' + border + ' ' +
    (invalid.value ? 'autocomplete-wrap-invalid' : '')
})

const parentClass = computed(() => {
  return 'd-flex ' + (props.searchbutton ? 'autocomplete-parent-focus' : '') + (invalid.value ? ' invalid' : '')
})

// Init
// Sync parent model with initValue Props
type.value = props.initValue ? props.initValue : null

// Watch
watch(() => props.options, (newVal, oldVal) => {
  if (props.filterByAnchor) {
    const regex = new RegExp(`${type.value}`, 'i')
    const filtered = newVal.filter(item => {
      const found = item[props.anchor].search(regex) !== -1
      return found
    })
    json.value = filtered
  } else {
    json.value = newVal
  }
})

watch(type, (newVal) => {
  // We want to alert users of this component to changed data.
  emit('update:modelValue', newVal)
})

// Lifecycle
onMounted(() => {
  if (props.required && input.value) input.value.setAttribute('required', props.required)
})

// Methods

function setValue(val) {
  type.value = val
}

defineExpose({
  setValue
})

function getClassName(part) {
  const { classes, className } = props
  if (classes[part]) return `${classes[part]}`
  return className ? `${className}-${part}` : ''
}

function clearTimer() {
  if (showTimer.value) {
    clearTimeout(showTimer.value)
  }
}

function startTimer() {
  clearTimer()
  showTimer.value = setTimeout(() => {
    showList.value = false
    showTimer.value = null
  }, 30000)
}

// Netralize Autocomplete
function clearInput() {
  showList.value = false
  clearTimer()
  type.value = ''
  json.value = []
  focusList.value = ''
}

// Get the original data
function cleanUp(data) {
  return data ? cloneDeep(data) : null
}

/* ==============================
  INPUT EVENTS
============================= */
function handleInput(e) {
  const { value } = e.target
  showList.value = true
  startTimer()
  // Callback Event
  if (props.onInput) props.onInput(value)
  // If Debounce
  if (props.debounce) {
    if (debounceTask.value !== undefined) clearTimeout(debounceTask.value)
    debounceTask.value = setTimeout(() => {
      return getData(value)
    }, props.debounce)
  } else {
    return getData(value)
  }
}

function handleKeyDown(e) {
  const key = e.keyCode

  // Disable when list isn't showing up
  if (!showList.value) return

  // Key List
  const DOWN = 40
  const UP = 38
  const ENTER = 13
  const ESC = 27

  // Prevent Default for Prevent Cursor Move & Form Submit
  switch (key) {
    case DOWN:
      e.preventDefault()
      focusList.value++
      break
    case UP:
      e.preventDefault()
      focusList.value--
      break
    case ENTER:
      e.preventDefault()

      if (ajaxInProgress.value) {
        // Wait until the ajax call has completed. Not in the most elegant way.
        setTimeout(() => {
          handleKeyDown(e)
        }, 100)
      } else {
        selectList(json.value[focusList.value])
        showList.value = false
        clearTimer()
      }
      break
    case ESC:
      showList.value = false
      clearTimer()
      break
  }

  const listLength = json.value.length - 1
  const outOfRangeBottom = focusList.value > listLength
  const outOfRangeTop = focusList.value < 0
  const topItemIndex = 0
  const bottomItemIndex = listLength

  let nextFocusList = focusList.value
  if (outOfRangeBottom) nextFocusList = topItemIndex
  if (outOfRangeTop) nextFocusList = bottomItemIndex
  focusList.value = nextFocusList
}

/* ==============================
  LIST EVENTS
============================= */

function handleDoubleClick() {
  json.value = []
  getData('')
  // Callback Event
  if (props.onShow) {
    props.onShow()
  }
  showList.value = true
  startTimer()
}

function handleBlur(e) {
  focused.value = false

  // Callback Event
  if (props.onBlur) {
    props.onBlur(e)
  }
  setTimeout(() => {
    // Callback Event
    if (props.onHide) {
      props.onHide()
    }
    showList.value = false
    clearTimer()
  }, 250)
}

function handleFocus(e) {
  focused.value = true
  focusList.value = 0

  // Force the list to show.
  showList.value = true
  startTimer()
  let value = input.value?.value
  if (value) {
    getData(value)
  }

  // Callback Event
  if (props.onFocus) {
    props.onFocus(e)
  }
}

function mousemove(i) {
  focusList.value = i
}

function activeClass(i) {
  const focusClass = i === focusList.value ? 'focus-list' : ''
  return `${focusClass}`
}

function selectList(data) {
  // Deep clone of the original object
  let clean = null
  if (!data) {
    // No data - revert
    type.value = props.initValue ? props.initValue : null
  } else {
    clean = cleanUp(data)
    // Put the selected data to type (model)
    type.value = clean[props.anchor]
  }
  // Hide List
  showList.value = false
  clearTimer()
  // Callback Event
  if (props.onSelect) {
    props.onSelect(clean)
  }
}

function deepValue(obj, path) {
  const arrayPath = path.split('.')
  for (let i = 0; i < arrayPath.length; i++) {
    obj = obj[arrayPath[i]]
  }
  return obj
}

/* ==============================
  AJAX EVENTS
============================= */

function composeParams(val) {
  const encode = val => (props.encodeParams ? encodeURIComponent(val) : val)
  let params = `${props.param}=${encode(val)}`
  if (props.customParams) {
    Object.keys(props.customParams).forEach(key => {
      params += `&${key}=${encode(props.customParams[key])}`
    })
  }
  return params
}

function composeHeader(ajax) {
  if (props.customHeaders) {
    Object.keys(props.customHeaders).forEach(key => {
      ajax.setRequestHeader(key, props.customHeaders[key])
    })
  }
}

async function doAjax(val) {
  invalid.value = false
  let beforeAjaxResult = []

  if (ajaxInProgress.value) {
    // We're already doing a request.  Don't send another one, partly out of politeness to the server, and
    // partly because if they complete out of sequence then we will end up with the wrong values.
    if (ajaxDeferred.value) {
      clearTimeout(ajaxDeferred.value)
    }

    ajaxDeferred.value = setTimeout(() => {
      doAjax(val)
    }, 100)
  } else {
    // Callback Event
    if (props.onBeforeAjax) {
      // This might return some results - if so they should be shown first.
      beforeAjaxResult = await props.onBeforeAjax(val)
    }

    // Compose Params
    const params = composeParams(val.trim())
    // Init Ajax
    const ajax = new XMLHttpRequest()

    // Save this request so that we know it's happening.
    ajaxInProgress.value = ajax

    ajax.open('GET', `${props.url}?${params}`, true)
    composeHeader(ajax)

    // Callback Event
    ajax.addEventListener('progress', data => {
      if (data.lengthComputable && props.onAjaxProgress)
        props.onAjaxProgress(data)
    })

    // On Done
    ajax.addEventListener('loadend', e => {
      const { status, responseText } = e.target

      if (status === 200) {
        const jsonResponse = JSON.parse(responseText)

        // Callback Event
        if (props.onAjaxLoaded) {
          props.onAjaxLoaded(jsonResponse)
        }

        json.value = beforeAjaxResult.concat(props.process ? props.process(jsonResponse) : jsonResponse)

        if (props.restrict && (!json.value || json.value.length === 0)) {
          // What we have doesn't match.  Indicate that we have selected an invalid value.
          if (props.onSelect) {
            emit('invalid')
            invalid.value = true
          }
        }
        else if (json.value && json.value.length === 1 && json.value[0].name.toLowerCase().replace(' ', '').trim() === val.toLowerCase().replace(' ', '').trim()) {
          // There is only one value, and it matches the value we were searching for.  Autoselect it.
          selectList(json.value[0])
        }
      } else {
        console.log("Autocomplete failed with", status)
      }

      // We no longer have a request in progress.
      ajaxInProgress.value = null
    })

    ajax.send()
  }
}

function getData(value) {
  if (value.length < props.min || !props.url) return
  if (props.onShouldGetData) manualGetData(value)
  else doAjax(value)
}

// Do Ajax Manually, so user can do whatever he want
function manualGetData(val) {
  const task = props.onShouldGetData(val)
  if (task && task.then) {
    return task.then(options => {
      json.value = options
    })
  }
}

function search() {
  emit('search')
}

function close() {
  showList.value = false
  clearTimer()
}

/* eslint-enable */
</script>

<style scoped lang="scss">
.transbord {
  border-color: transparent !important;
}

/* iteminp class is passed into this component in a prop */
.iteminp ul {
  width: 100% !important;
  right: 0px !important;
  padding-right: 15px !important;
  padding-left: 15px !important;
}

/* autocompletelist class is passed into this component in a prop */
.autocompletelist {
  z-index: 900;
}

.autocompletelist li {
  box-shadow: 1px 3px 5px 3px $color-black-opacity-60;
  width: 238px;
}

/* Deep selector for scoped CSS */
:deep(.pcinp) {
  min-width: 100px;
  max-width: 238px;
  margin: 0 auto;
}

.transition,
.autocomplete,
.showAll-transition,
.autocomplete ul,
.autocomplete ul li a {
  transition: all 0.3s ease-out;
  -moz-transition: all 0.3s ease-out;
  -webkit-transition: all 0.3s ease-out;
  -o-transition: all 0.3s ease-out;
}

.autocomplete ul {
  font-family: sans-serif;
  position: absolute;
  list-style: none;
  background: $color-white;
  padding: 0;
  margin: 0;
  display: inline-block;
  min-width: 15%;
  margin-top: 0px;
  z-index: 1000;
  right: 48%;
  border: 1px solid $color-gray--light;
  border-bottom-left-radius: 2px;
  border-bottom-right-radius: 2px;
}

:deep(.postcodelist.autocomplete ul) {
  position: initial;
}

.autocomplete-anchor-text {
  color: $color-gray--dark !important;
}

.autocomplete-anchor-text span {
  color: $color-gray--dark !important;
}

.autocomplete-anchor-text:hover {
  color: $color-gray--dark;
  background: $color-gray--lighter;
}

.autocomplete ul li a {
  text-decoration: none;
  display: block;
  padding: 5px;
  padding-left: 10px;
  color: $color-gray--dark;
  font-size: 13px;
}

.autocomplete ul li a:hover,
.autocomplete ul li.focus-list a {
  color: $color-gray--dark;
  background: $color-gray--lighter;
}

.autocomplete ul li a .autocomplete-anchor-label {
  display: block;
  margin-top: 3px;
  color: $color-gray--dark;
  font-size: 13px;
}

.autocomplete ul li a:hover .autocomplete-anchor-label,
.autocomplete ul li.focus-list a span,
.autocomplete ul li a:hover .autocomplete-anchor-label,
.autocomplete ul li.focus-list a span {
  color: $color-white;
}

.close {
  position: absolute;
  right: 0px;
  z-index: 2000;
}

input[invalid='true'] {
  box-shadow: 0 0 0 0.2rem $color-red;
  border: 1px solid red;
}
.autocomplete-wrap {
  border: 2px solid $color-gray--normal !important;
}
.autocomplete-wrap input:focus {
  outline: none;
  box-shadow: none;
  border: 1px solid $color-gray-4;
}
.autocomplete-wrap-focus {
  outline: 0;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
  border-color: $color-blue--x-light !important;
}
.autocomplete-wrap-invalid {
  border-color: transparent !important;
  outline: 0;
  box-shadow: none !important;
}

.input-group.autocomplete-wrap {
  border: 1px solid $color-gray-4;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
}
.autocomplete-parent-focus .input-group {
  border: 1px solid $color-gray-4;
  border-radius: 4px 0 0 4px;
}
.input-group.autocomplete-wrap input,
.input-group-append button {
  border: none !important;
}
.input-group-append button:focus {
  outline: none;
  box-shadow: none;
}

.searchbutton {
  border-radius: 0 4px 4px 0;
}

.invalid {
  box-shadow: 0 0 0 0.2rem $color-red;
  border: none !important;
  border-radius: 4px;
}
input[invalid='true'] {
  box-shadow: none;
}

:deep(.highlight) {
  font-weight: bold;
  background-color: initial;
}

:deep(mark) {
  padding: 0 !important;
}
</style>
