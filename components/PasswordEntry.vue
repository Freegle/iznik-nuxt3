<template>
  <b-form-group
    :label="placeholder"
    label-for="password"
    class="font-weight-bold"
  >
    <b-input-group id="input-password">
      <b-form-input
        id="password"
        v-model="password"
        :type="showPassword ? 'text' : 'password'"
        :placeholder="placeholder"
        class="password__input"
        @input="$emit('update:modelValue', $event)"
        @change="$emit('update:modelValue', $event)"
      />
      <span class="password__focus-element" />
      <b-input-group-append>
        <b-button
          variant="white"
          class="showpassword__button"
          :title="showPassword ? 'hide password' : 'show password'"
          :aria-label="showPassword ? 'hide password' : 'show password'"
          @click="togglePassword"
        >
          <div class="text-secondary">
            <v-icon icon="eye" flip="horizontal" />
            <v-icon v-if="showPassword" icon="slash" class="superimpose" />
          </div>
        </b-button>
      </b-input-group-append>
      <b-input-group-append v-if="showSaveOption">
        <SpinButton
          variant="primary"
          aria-label="Save password"
          name="save"
          label="Save"
          :handler="savePassword"
        />
      </b-input-group-append>
    </b-input-group>
  </b-form-group>
</template>
<script>
import SpinButton from './SpinButton'
import { useAuthStore } from '~/stores/auth'

export default {
  components: {
    SpinButton,
  },
  props: {
    originalPassword: {
      type: String,
      required: false,
      default: '',
    },
    showSaveOption: {
      type: Boolean,
      required: false,
      default: false,
    },
    placeholder: {
      type: String,
      required: false,
      default: 'Choose password',
    },
  },
  data() {
    return {
      password: null,
      showPassword: false,
    }
  },
  mounted() {
    this.password = this.originalPassword
  },
  methods: {
    togglePassword() {
      this.showPassword = !this.showPassword
    },
    async savePassword() {
      if (this.password) {
        const authStore = useAuthStore()
        await authStore.saveAndGet({
          password: this.password,
        })
      }
    },
  },
}
</script>
<style scoped lang="scss">
/* These classes are to give the complete password group of elements a focus indicator */
/* when the individual password input element gets focus.  It should not display for the */
/* other two individual elements */
.password__input:focus {
  /* Get rid of any default focus on the password input element added by bootstrap */
  box-shadow: none;
  border-right-color: $color-gray-4;
}

.password__input:focus + .password__focus-element {
  /* Add bootstrap style focus to the span element.  This element should encompass */
  /* the whole password group */
  position: absolute;
  height: 100%;
  width: 100%;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
  border-radius: 3px;
}

.showpassword__button {
  border-color: $color-gray-4 !important;
}

.superimpose {
  transform: translate(-1.5em, -0.5em);
}
</style>
