<template>
  <client-only>
    <b-container fluid class="p-0 p-xl-2 bg-white">
      <h1 class="visually-hidden">Ad Test page</h1>
      <b-row class="m-0">
        <b-col cols="0" lg="3" class="p-0 pr-1"> </b-col>
        <b-col cols="12" lg="6" class="p-0">
          <p>
            This is a test page for Magnite. There is one ad, below here, which
            is configured only to prebid via Magnite.
          </p>
          <ExternalDa
            ad-unit-path="/22794232631/freegle_home_left"
            max-height="600px"
            max-width="300px"
            div-id="div-gpt-ad-1693235056629-0"
            class="mt-2"
            show-logged-out
          />
        </b-col>
        <b-col cols="0" lg="3" class="p-0 pl-1"> </b-col>
      </b-row>
    </b-container>
  </client-only>
</template>
<script setup>
import ExternalDa from '~/components/ExternalDa.vue'
</script>
