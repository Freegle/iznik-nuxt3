<template>
  <div v-if="me.email">
    <p>Your email address is:</p>
    <p class="text--large">
      <strong>{{ me.email }}</strong>
    </p>
    <p>
      Replies will come back to this email address, as well as <em>Chats</em> on
      here. Please check your Spam folder!
    </p>
    <p>
      If you want to use a different email address, please change it in
      <nuxt-link to="/settings">Settings</nuxt-link>.
    </p>
  </div>
  <div v-else>
    <p>We don't have an email address for you.</p>
    <p>
      We need your email address to let you know when you have replies. We won't
      give your email to anyone else.
    </p>
    <p>
      Please add one in
      <nuxt-link to="/settings">Settings</nuxt-link>.
    </p>
    <b-button size="lg" variant="primary" to="/settings">
      Go to Settings
    </b-button>
  </div>
</template>
