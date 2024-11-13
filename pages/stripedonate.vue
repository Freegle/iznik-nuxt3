<template>
  <client-only>
    <div class="example">
      <div class="d-flex justify-content-around">
        <div class="d-flex flex-column">
          <p>This is a test page for Stripe Donate.</p>
          <div class="d-flex flex-column justify-content-between">
            <div
              class="d-flex flex-column align-content-around text-center font-weight-bold"
            >
              <StripeDonate :price="1" />
            </div>
            <div
              class="d-flex flex-column align-content-around text-center font-weight-bold"
            >
              <StripeDonate :price="5" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </client-only>
</template>
<script setup>
import StripeDonate from '~/components/StripeDonate.vue'
</script>
