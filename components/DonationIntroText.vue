<template>
  <div v-if="!hideIntro">
    <p v-if="donated">
      You've donated before, so you know that
      <strong>{{ groupname }}</strong> is a charity that's free to use, but not
      free to run. If you're able to <strong>donate again</strong> that would be
      lovely.
    </p>
    <p v-else>
      <strong>{{ groupname }}</strong> is a charity that's free to use, but not
      free to run.
    </p>
    <p>
      This month we're trying to raise
      <strong>&pound;{{ target }}</strong
      ><span v-if="groupid && !targetMet"> for this community</span
      ><span v-else> across the UK</span>.
    </p>
    <p>
      If you can,
      <strong> please donate </strong>
      to keep us running.
    </p>
  </div>
</template>

<script setup>
defineProps({
  groupid: {
    type: Number,
    required: false,
    default: null,
  },
  groupname: {
    type: String,
    required: true,
  },
  target: {
    type: Number,
    default: 2000,
  },
  targetMet: {
    type: Boolean,
    default: false,
  },
  donated: {
    type: String,
    default: null,
  },
  hideIntro: {
    type: Boolean,
    required: false,
    default: false,
  },
})
</script>
