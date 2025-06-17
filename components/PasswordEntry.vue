<template>
  <b-form-group
    :label="placeholder"
    label-for="password"
    class="font-weight-bold"
  >
    <b-input-group
      id="input-password"
      :class="errorBorder ? ' border-danger' : ''"
    >
      <b-form-input
        id="password"
        v-model="password"
        :type="showPassword ? 'text' : 'password'"
        :placeholder="placeholder"
        class="password__input"
      />
      <span class="password__focus-element" />
      <slot name="append">
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
      </slot>
      <slot v-if="showSaveOption" name="append">
        <SpinButton
          variant="primary"
          aria-label="Save password"
          icon-name="save"
          label="Save"
          @handle="savePassword"
        />
      </slot>
    </b-input-group>
  </b-form-group>
</template>
<script setup>
import { ref, watch, onMounted } from 'vue'
import SpinButton from './SpinButton'
import { useAuthStore } from '~/stores/auth'

const props = defineProps({
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
  errorBorder: {
    type: Boolean,
    required: false,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue'])

const password = ref(null)
const showPassword = ref(false)

function togglePassword() {
  showPassword.value = !showPassword.value
}

async function savePassword(callback) {
  if (password.value) {
    const authStore = useAuthStore()
    await authStore.saveAndGet({
      password: password.value,
    })
  }
  callback()
}

watch(password, (newVal) => {
  emit('update:modelValue', newVal)
})

onMounted(() => {
  password.value = props.originalPassword
})
</script>
<style scoped lang="scss">
@import 'assets/css/_color-vars.scss';

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

:deep(.border-danger) {
  input {
    border: 1px solid $color-red !important;
    border-right-style: none !important;
  }

  .showpassword__button {
    border: 1px solid $color-red !important;
    border-left-style: none !important;
  }
}
</style>
