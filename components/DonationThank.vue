<template>
  <div>
    <p>Thanks very much for donating to us. We'll use your money wisely.</p>
    <p v-if="!giftAidCompleted">
      If you're able to do a Gift Aid declaration your gift can go further.
      <b-button
        variant="primary"
        size="lg"
        to="/giftaid?noguard=true"
        class="mt-3"
      >
        Click here to fill out a Gift Aid declaration
      </b-button>
    </p>
    <p v-else>
      You have already made a gift aid declaration (or told us that you can't).
      You can find details of that
      <nuxt-link to="/giftaid?noguard=true">here</nuxt-link>.
    </p>
    <p>
      You can also support us by putting up posters, inviting people, and more.
      See <nuxt-link no-prefetch to="/promote?noguard=true">here</nuxt-link>.
    </p>
    <p>Happy freegling!</p>
  </div>
</template>
<script setup>
import { useGiftAidStore } from '~/stores/giftaid'

const giftAidStore = useGiftAidStore()
await giftAidStore.fetch()

const giftAidCompleted = giftAidStore.giftaid?.period
</script>
