<template>
  <div>
    <p>
      Freegle spreads by <strong>word of mouth</strong>. Maybe you've got
      friends, family or work colleagues who've never heard of us, and who could
      help themseves or others by freegling?
    </p>
    <p>
      A personal recommendation is worth a thousand online ads - and anyway, we
      can't afford a thousand online ads!
    </p>
    <p>
      Could you help spread the word? Personalise your message and send it using
      the buttons below.
    </p>
    <InviteSomeone class="mt-2" :trust-pilot="false" @invited="invited" />
  </div>
</template>
<script setup>
import { useMicroVolunteeringStore } from '~/stores/microvolunteering'

const microVolunteeringStore = useMicroVolunteeringStore()
function invited() {
  microVolunteeringStore.respond({
    invite: true,
  })
}
</script>
