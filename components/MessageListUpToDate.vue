<template>
  <div>
    <NoticeMessage
      variant="info"
      class="text-center mt-3 ms-2 me-2 ms-md-0 me-md-0"
    >
      <v-icon icon="check-circle" class="text-success mt-2 text--largest" />
      <p class="text--large font-weight-bold">You're up to date.</p>
      <p>You've already seen posts below here.</p>
    </NoticeMessage>
  </div>
</template>
<script setup>
import NoticeMessage from './NoticeMessage'
</script>
