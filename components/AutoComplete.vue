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
<script>
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

import cloneDeep from 'lodash.clonedeep'
import Highlighter from 'vue-highlight-words'

export default {
  components: {
    Highlighter
  },
  props: {
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
  },

  data() {
    return {
      showList: false,
      showTimer: null,
      type: '',
      json: [],
      focusList: '',
      debounceTask: undefined,
      ajaxInProgress: null,
      ajaxDeferred: null,
      invalid: false,
      focused: false
    }
  },

  computed: {
    wrapClass() {
      let border

      switch (this.variant) {
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

      return 'autocomplete-wrap ' + (this.focused ? ' autocomplete-wrap-focus' : '') + ' ' + border + ' ' +
        (this.invalid ? 'autocomplete-wrap-invalid' : '')
    },
    parentClass() {
      return 'd-flex ' + (this.searchbutton ? 'autocomplete-parent-focus' : '') + (this.invalid ? ' invalid' : '')
    }
  },

  watch: {
    options(newVal, oldVal) {
      if (this.filterByAnchor) {
        const { type, anchor } = this
        const regex = new RegExp(`${type}`, 'i')
        const filtered = newVal.filter(item => {
          const found = item[anchor].search(regex) !== -1
          return found
        })
        this.json = filtered
      } else {
        this.json = newVal
      }
    },
    type(newVal) {
      // We want to alert users of this component to changed data.
      this.$emit('update:modelValue', newVal)
    }
  },

  created() {
    // Sync parent model with initValue Props
    this.type = this.initValue ? this.initValue : null
  },

  mounted() {
    if (this.required) this.$refs.input.setAttribute('required', this.required)
  },

  methods: {
    getClassName(part) {
      const { classes, className } = this
      if (classes[part]) return `${classes[part]}`
      return className ? `${className}-${part}` : ''
    },

    clearTimer() {
      if (this.showTimer) {
        clearTimeout(this.showTimer)
      }
    },

    startTimer() {
      this.clearTimer()
      this.showTimer = setTimeout(() => {
        this.showList = false
        this.showTimer = null
      }, 30000)
    },

    // Netralize Autocomplete
    clearInput() {
      this.showList = false
      this.clearTimer()
      this.type = ''
      this.json = []
      this.focusList = ''
    },

    // Get the original data
    cleanUp(data) {
      return data ? cloneDeep(data) : null
    },

    /* ==============================
      INPUT EVENTS
    ============================= */
    handleInput(e) {
      const { value } = e.target
      this.showList = true
      this.startTimer()
      // Callback Event
      if (this.onInput) this.onInput(value)
      // If Debounce
      if (this.debounce) {
        if (this.debounceTask !== undefined) clearTimeout(this.debounceTask)
        this.debounceTask = setTimeout(() => {
          return this.getData(value)
        }, this.debounce)
      } else {
        return this.getData(value)
      }
    },

    handleKeyDown(e) {
      const key = e.keyCode

      // Disable when list isn't showing up
      if (!this.showList) return

      // Key List
      const DOWN = 40
      const UP = 38
      const ENTER = 13
      const ESC = 27

      // Prevent Default for Prevent Cursor Move & Form Submit
      switch (key) {
        case DOWN:
          e.preventDefault()
          this.focusList++
          break
        case UP:
          e.preventDefault()
          this.focusList--
          break
        case ENTER:
          e.preventDefault()

          if (this.ajaxInProgress) {
            // Wait until the ajax call has completed. Not in the most elegant way.
            let self = this
            setTimeout(() => {
              self.handleKeyDown.apply(self, [e])
            }, 100)
          } else {
            this.selectList(this.json[this.focusList])
            this.showList = false
            this.clearTimer()
          }
          break
        case ESC:
          this.showList = false
          this.clearTimer()
          break
      }

      const listLength = this.json.length - 1
      const outOfRangeBottom = this.focusList > listLength
      const outOfRangeTop = this.focusList < 0
      const topItemIndex = 0
      const bottomItemIndex = listLength

      let nextFocusList = this.focusList
      if (outOfRangeBottom) nextFocusList = topItemIndex
      if (outOfRangeTop) nextFocusList = bottomItemIndex
      this.focusList = nextFocusList
    },

    setValue(val) {
      this.type = val
    },

    /* ==============================
      LIST EVENTS
    ============================= */

    handleDoubleClick() {
      this.json = []
      this.getData('')
      // Callback Event
      if (this.onShow) {
        this.onShow()
      }
      this.showList = true
      this.startTimer()
    },

    handleBlur(e) {
      this.focused = false

      // Callback Event
      if (this.onBlur) {
        this.onBlur(e)
      }
      setTimeout(() => {
        // Callback Event
        if (this.onHide) {
          this.onHide()
        }
        this.showList = false
        this.clearTimer()
      }, 250)
    },

    handleFocus(e) {
      this.focused = true
      this.focusList = 0

      // Force the list to show.
      this.showList = true
      this.startTimer()
      let value = this.$refs.input?.value
      if (value) {
        this.getData(value)
      }

      // Callback Event
      if (this.onFocus) {
        this.onFocus(e)
      }
    },

    mousemove(i) {
      this.focusList = i
    },

    activeClass(i) {
      const focusClass = i === this.focusList ? 'focus-list' : ''
      return `${focusClass}`
    },

    selectList(data) {
      // Deep clone of the original object
      let clean = null
      if (!data) {
        // No data - revert
        this.type = this.initValue ? this.initValue : null
      } else {
        clean = this.cleanUp(data)
        // Put the selected data to type (model)
        this.type = clean[this.anchor]
      }
      // Hide List
      this.showList = false
      this.clearTimer()
      // Callback Event
      if (this.onSelect) {
        this.onSelect(clean)
      }
    },

    deepValue(obj, path) {
      const arrayPath = path.split('.')
      for (let i = 0; i < arrayPath.length; i++) {
        obj = obj[arrayPath[i]]
      }
      return obj
    },

    /* ==============================
      AJAX EVENTS
    ============================= */

    composeParams(val) {
      const encode = val => (this.encodeParams ? encodeURIComponent(val) : val)
      let params = `${this.param}=${encode(val)}`
      if (this.customParams) {
        Object.keys(this.customParams).forEach(key => {
          params += `&${key}=${encode(this.customParams[key])}`
        })
      }
      return params
    },

    composeHeader(ajax) {
      if (this.customHeaders) {
        Object.keys(this.customHeaders).forEach(key => {
          ajax.setRequestHeader(key, this.customHeaders[key])
        })
      }
    },

    async doAjax(val) {
      this.invalid = false
      let beforeAjaxResult = []

      if (this.ajaxInProgress) {
        // We're already doing a request.  Don't send another one, partly out of politeness to the server, and
        // partly because if they complete out of sequence then we will end up with the wrong values.
        if (this.ajaxDeferred) {
          clearTimeout(this.ajaxDeferred)
        }

        this.ajaxDeferred = setTimeout(() => {
          this.doAjax(val)
        }, 100)
      } else {
        // Callback Event
        if (this.onBeforeAjax) {
          // This might return some results - if so they should be shown first.
          beforeAjaxResult = await this.onBeforeAjax(val)
        }

        // Compose Params
        const params = this.composeParams(val.trim())
        // Init Ajax
        const ajax = new XMLHttpRequest()

        // Save this request so that we know it's happening.
        this.ajaxInProgress = ajax

        ajax.open('GET', `${this.url}?${params}`, true)
        this.composeHeader(ajax)

        // Callback Event
        ajax.addEventListener('progress', data => {
          if (data.lengthComputable && this.onAjaxProgress)
            this.onAjaxProgress(data)
        })

        // On Done
        ajax.addEventListener('loadend', e => {
          const { status, responseText } = e.target

          if (status === 200) {
            const json = JSON.parse(responseText)

            // Callback Event
            if (this.onAjaxLoaded) {
              this.onAjaxLoaded(json)
            }

            this.json = beforeAjaxResult.concat(this.process ? this.process(json) : json)

            if (this.restrict && (!this.json || this.json.length === 0)) {
              // What we have doesn't match.  Indicate that we have selected an invalid value.
              if (this.onSelect) {
                this.$emit('invalid')
                this.invalid = true
              }
            }
            else if (this.json && this.json.length === 1 && this.json[0].name.toLowerCase().replace(' ', '').trim() === val.toLowerCase().replace(' ', '').trim()) {
              // There is only one value, and it matches the value we were searching for.  Autoselect it.
              this.selectList(this.json[0])
            }
          } else {
            console.log("Autocomplete failed with", status)
          }

          // We no longer have a request in progress.
          this.ajaxInProgress = null
        })

        ajax.send()
      }
    },

    getData(value) {
      if (value.length < this.min || !this.url) return
      if (this.onShouldGetData) this.manualGetData(value)
      else this.doAjax(value)
    },

    // Do Ajax Manually, so user can do whatever he want
    manualGetData(val) {
      const task = this.onShouldGetData(val)
      if (task && task.then) {
        return task.then(options => {
          this.json = options
        })
      }
    },

    search() {
      this.$emit('search')
    },

    close() {
      this.showList = false
      this.clearTimer()
    }
  }
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
