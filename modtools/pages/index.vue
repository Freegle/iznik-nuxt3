<template>
  <div>
    <h1><HomeIcon /> ModTools!</h1>
    <p>
      Here's an <ExternalLink href="https://ilovefreegle.org">ExternalLink to the Freegle website</ExternalLink>
    </p>
    <NoticeMessage>
      Here's a notice.
      Does changing this show online?
    </NoticeMessage>
    <button @click="throwError">Throw error</button>
  </div>
</template>

<script setup>
function throwError() {
  throw new Error('Sentry Error2')
}
</script>
