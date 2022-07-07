<template>
  <b-alert variant="warning" class="mt-2" show>
    <h3>That chat isn't for this account.</h3>
    <p>
      Please check your email in
      <!-- eslint-disable-next-line-->
      <nuxt-link to="/settings">Settings</nuxt-link>.
      If you have trouble, please contact
      <!-- eslint-disable-next-line -->
      <ExternalLink href="mailto:support@ilovefreegle.org">support@ilovefreegle.org</ExternalLink>
      who can help you merge multiple accounts.
    </p>
  </b-alert>
</template>
