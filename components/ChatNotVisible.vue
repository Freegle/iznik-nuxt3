<template>
  <b-alert variant="danger" class="mt-2" :model-value="true">
    <h3>That chat isn't for this account.</h3>
    <p>
      Please check your email in
      <!-- eslint-disable-next-line-->
        <nuxt-link no-prefetch to="/settings">Settings</nuxt-link>.
        If you have trouble, please contact <SupportLink />
      who can help you merge multiple accounts.
    </p>
  </b-alert>
</template>
<script setup>
import SupportLink from '~/components/SupportLink'
</script>
