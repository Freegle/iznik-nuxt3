<template>
  <div>
    <p>
      About once a month, we will randomly select one member of Freegle's
      national organisation (Freegle Ltd) to receive a surprise cake as a thank
      you. If you don't want the cake yourself, you are of course welcome to
      freegle it on your group - which could be good publicity!
    </p>
    <p>
      If you haven't signed up as an official member of Freegle Ltd then why not
      join now? You might get cake, and you will be able to take part in votes
      on our future and demonstrate your support. Find out more
      <!-- eslint-disable-next-line -->
      <external-link href="https://wiki.ilovefreegle.org/Freegle_Ltd_Membership">on the wiki</external-link>
      or
      <!-- eslint-disable-next-line -->
      <external-link href="http://freegle.in/JoinFreegleLtd">join here</external-link>.
    </p>
    <p>
      If you want cake, please click this button to change it to green. Most of
      us love cake, but if for any reason you'd prefer us not to send you any,
      just ignore this.
    </p>
    <OurToggle
      v-model="modcake"
      class="mt-2"
      :height="30"
      :width="150"
      :font-size="14"
      :sync="true"
      :labels="{ checked: 'Cake please', unchecked: 'No cake thanks' }"
      variant="modgreen"
    />
    <div v-if="modcake">
      <p>
        If you have specific dietary requirements (e.g. vegan, gluten free,
        citrus fruit allergy etc.) please let us know here.
      </p>
      <b-form-textarea
        v-model="cakenotes"
        placeholder="Any dietary requirements."
        rows="3"
        class="mt-2"
      />
      <SpinButton
        icon-name="save"
        label="Save notes"
        variant="primary"
        class="mt-2"
        @handle="saveNotes"
      />
    </div>
  </div>
</template>
<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useMe } from '~/composables/useMe'

const authStore = useAuthStore()
const { me } = useMe()

const notes = ref(null)

const modcake = computed({
  get() {
    if (me.value && me.value.settings) {
      return Object.keys(me.value.settings).includes('modcake')
        ? me.value.settings.modcake
        : false
    }
    return false
  },
  set(newval) {
    saveSetting('modcake', newval)
  },
})

const cakenotes = computed({
  get() {
    return Object.keys(me.value.settings).includes('modcakenotes')
      ? me.value.settings.modcakenotes
      : null
  },
  set(newval) {
    notes.value = newval
  },
})

async function saveSetting(name, val) {
  const settings = me.value.settings
  settings[name] = val
  await authStore.saveAndGet({
    settings,
  })
}

function saveNotes() {
  saveSetting('modcakenotes', notes.value)
}
</script>
