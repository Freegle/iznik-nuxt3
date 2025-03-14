<template>
  <div class="d-flex">
    <div class="d-flex flex-column">
      <label v-if="label" :for="id">{{ label }}</label>
      <div class="d-flex">
        <div
          v-b-tooltip="{
            title: 'Keep typing your full postcode...',
            triggers: [],
            shown: wip && (!results || results?.length > 1),
            placement: 'top',
            delay: { show: 3000 },
          }"
        >
          <AutoComplete
            :id="id"
            ref="autocomplete"
            :init-value="wip"
            restrict
            :url="source"
            :custom-params="{ pconly: pconly }"
            anchor="name"
            label=""
            :placeholder="pconly ? 'Type postcode' : 'Type location'"
            :classes="{
              input: 'form-control form-control-' + size + ' text-center pcinp',
              list: 'postcodelist',
              listentry: 'w-100',
              listentrylist: 'listentry',
            }"
            class="mr-1"
            :min="3"
            :debounce="200"
            :process="process"
            :on-select="select"
            :size="10"
            :variant="variant"
            not-found-message="Not a valid postcode."
            @invalid="invalid"
          />
        </div>
        <b-popover
          v-if="showLocated"
          content="Your device thinks you're here. If it's wrong, please change it."
          :target="id"
          placement="top"
          variant="primary"
          :show="true"
          :skidding="-50"
        />
        <div v-if="find && !wip">
          <SpinButton
            style="line-height: 1.7em"
            variant="secondary"
            :flex="false"
            button-title="Find my device's location instead of typing a postcode"
            done-icon=""
            :icon-name="
              locationFailed ? 'exclamation-triangle' : 'map-marker-alt'
            "
            :size="size"
            @handle="findLoc"
          />
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { uid } from '../composables/useId'
import { useAuthStore } from '../stores/auth'
import { useLocationStore } from '../stores/location'
import SpinButton from './SpinButton'
import { ref } from '#imports'
import { useComposeStore } from '~/stores/compose'
import AutoComplete from '~/components/AutoComplete'

export default {
  components: {
    SpinButton,
    AutoComplete,
  },
  props: {
    value: {
      type: String,
      required: false,
      default: null,
    },
    label: {
      type: String,
      required: false,
      default: null,
    },
    focus: {
      type: Boolean,
      required: false,
      default: false,
    },
    find: {
      type: Boolean,
      required: false,
      default: true,
    },
    size: {
      type: String,
      required: false,
      default: 'lg',
    },
    pconly: {
      type: Boolean,
      required: false,
      default: true,
    },
    noStore: {
      type: Boolean,
      required: false,
      default: true,
    },
    variant: {
      type: String,
      required: false,
      default: null,
    },
  },
  setup(props) {
    const composeStore = useComposeStore()
    const authStore = useAuthStore()
    const locationStore = useLocationStore()

    const wip = ref(props.value)
    const me = authStore.user

    if (props.pconly && wip.value === null && me?.settings?.mylocation?.name) {
      // If we are logged in then we may have a known location to use as the default.
      wip.value = me?.settings?.mylocation?.name
    }

    if (props.pconly && !wip.value && !props.noStore) {
      // We might have one we are composing.
      const pc = composeStore.postcode

      if (pc?.name) {
        wip.value = pc.name
      }
    }

    // Unique id
    const id = uid('postcode')

    return {
      composeStore,
      locationStore,
      wip,
      id,
    }
  },
  data() {
    return {
      results: [],
      locationFailed: false,
      showLocated: false,
      callbackToCall: null,
    }
  },
  computed: {
    source() {
      const runtimeConfig = useRuntimeConfig()
      return runtimeConfig.public.APIv2 + '/location/typeahead'
    },
  },
  beforeUnmount() {
    if (this.callbackToCall) {
      this.callbackToCall()
    }
  },
  mounted() {
    if (this.$refs.autocomplete) {
      if (this.focus) {
        // Focus on postcode to grab their attention.
        this.$refs.autocomplete.$refs.input.focus()
      }

      // We need some fettling of the input keystrokes.
      const input = this.$refs.autocomplete.$refs.input
      input.addEventListener('keydown', this.keydown, false)
    } else {
      // Not quite sure how this happens, but it does.
    }

    if (this.wip) {
      this.select({
        name: this.wip,
      })
    }
  },
  methods: {
    invalid() {
      // Parent might want to know that we don't have a valid postcode any more.
      this.$emit('cleared')
      this.wip = null
      this.results = []
    },
    keydown(e) {
      if (e.which === 8) {
        // Backspace means we no longer have a full postcode.
        this.invalid()
      } else {
        // Hide the tooltip in case it's showing from a use of the find button.
        this.showLocated = false
      }
    },
    process(results) {
      const names = []
      const ret = []

      if (results) {
        for (let i = 0; i < results.length && names.length < 5; i++) {
          const loc = results[i]

          if (!names.includes(loc.name)) {
            names.push(loc.name)
            ret.push(loc)
          }
        }
      }

      this.results = ret
      return ret
    },
    async select(pc) {
      console.log('Select', pc)
      if (pc) {
        if (pc.name && !pc.id) {
          // Find the location this corresponds to.
          const locs = await this.locationStore.typeahead(pc.name)

          if (locs?.length) {
            pc = locs[0]
          }
        }
        this.$emit('selected', pc)
      } else {
        this.$emit('cleared')
      }

      this.locationFailed = false
    },
    findLoc(callback) {
      this.callbackToCall = callback

      try {
        if (
          navigator &&
          navigator.geolocation &&
          navigator.geolocation.getCurrentPosition
        ) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const res = await this.locationStore.fetchByLatLng(
                position.coords.latitude,
                position.coords.longitude
              )

              if ((res.lat || res.lng) && this.$refs.autocomplete) {
                // Got it - put it in the autocomplete input, and indicate that we've selected it.
                this.$refs.autocomplete.setValue(res.name)
                await this.select(res)

                // Show the user we've done this, and make them think.
                this.showLocated = true
                setTimeout(() => (this.showLocated = false), 10000)
              } else {
                this.locationFailed = true
              }
            },
            (e) => {
              console.error('Find location failed with', e)
              this.locationFailed = true
            }
          )
        } else {
          console.log('Navigation not supported.  ')
          this.locationFailed = true
        }
      } catch (e) {
        console.error('Find location failed with', e)
        this.locationFailed = true
      } finally {
        this.callbackToCall = null
        callback()
      }
    },
  },
}
</script>
<style scoped lang="scss">
:deep(.listentry) {
  width: 100%;
  right: 0 !important;
  text-align: center;
  border-color: $color-blue--light;
  outline: 0;
  box-shadow: 0 1px 0 0.2rem rgba(0, 123, 255, 0.25);
}

:deep(.popover) {
  background-color: black;
}
</style>
