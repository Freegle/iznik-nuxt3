<template>
  <b-card
    border-variant="info"
    header-bg-variant="info"
    header-text-variant="white"
    class="mt-2"
  >
    <template #header>
      <h2 class="bg-info header--size5 mb-0">
        <v-icon icon="cog" />
        Other
      </h2>
    </template>
    <b-card-body class="p-0 pt-1">
      <b-form-group>
        <h3 class="header--size5 header5__color">What the enter key does</h3>
        <p>
          Normally hitting enter/return sends chat messages, rather than add a
          new line.
        </p>
        <p v-if="enterNewLineLocal">
          You have this set to add a new line. This can cause problems on some
          devices, so if you have problems with this setting, then please change
          it back.
        </p>
        <OurToggle
          v-model="enterNewLineLocal"
          class="mt-2"
          :width="150"
          :sync="true"
          :labels="{
            checked: 'Inserts new line',
            unchecked: 'Sends message',
          }"
          color="#61AE24"
          @change="changeNewLine"
        />
      </b-form-group>
      <b-form-group>
        <h3 class="header--size5 header5__color mt-2">Auto-reposts</h3>
        <p>
          In most Freegle communities, your OFFER/WANTED posts will be
          automatically reposted (or "bumped") unless you've marked them as
          TAKEN/RECEIVED/Withdrawn from
          <!-- eslint-disable-next-line-->
            <nuxt-link  no-prefetch to="/myposts">My Posts</nuxt-link>.
        </p>
        <OurToggle
          v-model="autorepostsLocal"
          :width="150"
          :sync="true"
          :labels="{
            checked: 'Autoreposting is On',
            unchecked: 'Autoreposting is Off',
          }"
          color="#61AE24"
          @change="changeAutorepost"
        />
      </b-form-group>
    </b-card-body>
  </b-card>
</template>

<script setup>
import { ref, defineProps, defineEmits, watch } from 'vue'
import { useAuthStore } from '../../stores/auth'
import OurToggle from '~/components/OurToggle'

const props = defineProps({
  me: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['update'])

const authStore = useAuthStore()

// State
const autorepostsLocal = ref(true)
const enterNewLineLocal = ref(false)

// Methods
const changeNewLine = async (e) => {
  const settings = props.me.settings
  settings.enterNewLine = e
  await authStore.saveAndGet({
    settings,
  })

  enterNewLineLocal.value = e
  emit('update')
}

const changeAutorepost = async (e) => {
  const settings = props.me.settings
  settings.autorepostsdisable = !e
  await authStore.saveAndGet({
    settings,
  })

  emit('update')
}

// Update local refs when props change
watch(
  () => props.me,
  (newVal) => {
    if (newVal) {
      autorepostsLocal.value = !newVal.settings?.autorepostsdisable
      enterNewLineLocal.value = newVal.settings?.enterNewLine || false
    }
  },
  { immediate: true }
)
</script>

<style scoped lang="scss">
.header5__color {
  /* Need to override the h5 as it has higher specificity */
  color: #212529 !important;
}
</style>
