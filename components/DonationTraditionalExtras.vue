<template>
  <div>
    <p class="mt-2 small">
      You'll get a cute little
      <SupporterInfo size="sm" class="d-inline" />
      badge for a year so that people can see you're a committed freegler, and
      we'll turn off ads for a month.
      <!-- eslint-disable-next-line -->
      Anything you can give is very welcome. You can find other ways to donate (e.g. bank transfer or cheque) <nuxt-link no-prefetch to="/donate?noguard=true">here</nuxt-link>.
    </p>
    <p
      v-if="groupid && !targetMet && !hideThermometer"
      class="text-muted small mt-1"
    >
      This will contribute to the general fund for the ongoing support of
      Freegle. If we raise more than the target, we'll use it to support other
      communities.
    </p>
    <p v-if="groupid && hideThermometer" class="text-muted small mt-1">
      This will contribute to the general fund for the ongoing support of
      {{ groupname }} and other communities.
    </p>
  </div>
</template>

<script setup>
import SupporterInfo from './SupporterInfo'

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
  targetMet: {
    type: Boolean,
    default: false,
  },
  hideThermometer: {
    type: Boolean,
    default: false,
  },
})
</script>
