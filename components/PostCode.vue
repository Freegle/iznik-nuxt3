<template>
  <div class="d-flex">
    <div class="d-flex flex-column">
      <label v-if="label" :for="id">{{ label }}</label>
      <div class="d-flex">
        <v-tooltip
          :triggers="[]"
          :shown="wip && (!results || results?.length > 1)"
          placement="top"
          :delay="{ show: 3000 }"
        >
          <AutoComplete
            :id="id"
            ref="autocomplete"
            :init-value="wip"
            restrict
            :url="source"
            param="typeahead"
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
            @invalid="invalid"
          />

          <!--          -->
          <template #popper> Keep typing your full postcode... </template>
        </v-tooltip>

        <v-tooltip
          :shown="showToolTip"
          :target="id"
          placement="top"
          variant="primary"
          :triggers="[]"
          :skidding="-50"
        >
          <template #popper>
            <div class="font-weight-bold">
              Your device thinks you're here.<br /><br />

              If it's wrong, please change it.
            </div>
          </template>
        </v-tooltip>

        <div v-if="find && !wip">
          <b-button
            variant="secondary"
            :size="size"
            title="Find my device's location instead of typing a postcode"
            class="tweakHeight"
            @click="findLoc"
          >
            <v-icon v-if="locating" icon="sync" class="fa-spin" />
            <v-icon v-else-if="locationFailed" icon="exclamation-triangle" />
            <v-icon v-else icon="map-marker-alt" />
          </b-button>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { ref } from 'vue'
import { uid } from '../composables/useId'
import { useAuthStore } from '../stores/auth'
import { useComposeStore } from '~/stores/compose'
import AutoComplete from '~/components/AutoComplete'

export default {
  components: {
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

    let value = props.value
    const me = authStore.user

    if (props.pconly && value === null && me?.settings?.mylocation?.name) {
      // If we are logged in then we may have a known location to use as the default.
      value = me?.settings?.mylocation?.name
    }

    if (props.pconly && !value && !props.noStore) {
      // We might have one we are composing.
      const pc = composeStore.postcode

      if (pc?.name) {
        value = pc.name
      }
    }

    // Unique id
    const id = uid('postcode')

    return {
      composeStore,
      wip: ref(value),
      id,
    }
  },
  data() {
    return {
      results: [],
      locating: false,
      locationFailed: false,
      showToolTip: false,
    }
  },
  computed: {
    source() {
      const runtimeConfig = useRuntimeConfig()
      return runtimeConfig.APIv1 + '/locations'
    },
  },
  mounted() {
    this.waitForRef('autocomplete', () => {
      if (this.focus) {
        // Focus on postcode to grab their attention.
        this.$refs.autocomplete.$refs.input.focus()
      }

      // We need some fettling of the input keystrokes.
      const input = this.$refs.autocomplete.$refs.input
      input.addEventListener('keydown', this.keydown, false)
    })
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
        this.showToolTip = false
      }
    },
    process(results) {
      const names = []
      const ret = []

      if (results && results.locations) {
        for (let i = 0; i < results.locations.length && names.length < 5; i++) {
          const loc = results.locations[i]

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
      if (pc) {
        // We have the name.  We need the full postcode.
        const loc = await this.$axios.get(this.source, {
          params: {
            typeahead: pc.name,
          },
        })

        if (loc?.data?.locations?.length === 1) {
          this.$emit('selected', loc.data.locations[0])
        }
      } else {
        this.$emit('cleared')
      }
    },
    findLoc() {
      try {
        if (
          navigator &&
          navigator.geolocation &&
          navigator.geolocation.getCurrentPosition
        ) {
          this.locating = true
          navigator.geolocation.getCurrentPosition(async (position) => {
            const res = await this.$axios.get(this.source, {
              params: {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              },
            })

            if (
              res.data.ret === 0 &&
              res.data.location &&
              res.data.location.name &&
              this.$refs.autocomplete
            ) {
              // Got it - put it in the autocomplete input, and indicate that we've selected it.
              this.$refs.autocomplete.setValue(res.data.location.name)
              this.select({
                name: res.data.location.name,
              })

              // Show the user we've done this, and make them think.
              this.showToolTip = true
              setTimeout(() => (this.showToolTip = false), 10000)
            } else {
              this.locationFailed = true
            }
          })
        } else {
          console.log('Navigation not supported.  ')
          this.locationFailed = true
        }
      } catch (e) {
        console.error('Find location failed with', e)
        this.locationFailed = true
      }

      this.locating = false
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

.tweakHeight {
  line-height: 1.7em;
}
</style>
