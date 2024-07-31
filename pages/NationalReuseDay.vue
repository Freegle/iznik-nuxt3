<template>
  <div class="wrapper d-flex flex-column justify-content-around">
    <div class="inner">
      <h1 class="text-center text-white">National Reuse Day 2024</h1>
      <p class="text-center">Intro text blah blah blah</p>
      <div class="d-flex justify-content-around">
        <ProxyImage
          preload
          src="/councils/NationalReuseDay.png"
          alt="National Reuse Day logo"
          class-name="image mt-2"
        />
      </div>
      <div class="spacer" />
      <div class="boxes">
        <NationalReuseDayBox
          title="Video"
          description="Watch and share our new A-Z of Freegle!"
          url="https://example.com"
          colour="magenta"
        />
        <NationalReuseDayBox
          title="Resources"
          description="Free communications assets and key links"
          url="https://councils.ilovefreegle.org/"
          colour="blue"
        />
        <NationalReuseDayBox
          title="Share your reuse story"
          description="Tell us why you love Freegle and find out what others are saying too"
          url="https://www.ilovefreegle.org/stories"
          colour="purple"
        />
        <NationalReuseDayBox
          title="Freegle something"
          description="Give and get for free, locally!"
          url="https://www.ilovefreegle.org"
          colour="gold"
        />
        <NationalReuseDayBox
          title="Quiz"
          description="Test your knowledge and discover fun facts about reuse!"
          url="https://councils.ilovefreegle.org/"
          colour="orange"
        />
        <NationalReuseDayBox
          title="Refer a friend to Freegle"
          description="Get more reuse happening by spreading the word"
          url="https://www.ilovefreegle.org/promote"
          colour="blue"
        />
      </div>
    </div>
  </div>
</template>
<script setup>
import { useRoute } from 'vue-router'
import { buildHead } from '~/composables/useBuildHead'

const runtimeConfig = useRuntimeConfig()
const route = useRoute()

definePageMeta({
  layout: 'no-navbar',
})

buildHead(
  route,
  runtimeConfig,
  'National Reuse Day 2024',
  'Celebrate reuse and get involved',
  runtimeConfig.public.USER_SITE + '/councils/NationalReuseDay.png'
)

function removeNavbar() {
  // Remove nav elements from the DOM.  Bit hacky, but it'll do.
  const navbars = document.querySelectorAll('.navbar')

  navbars.forEach((navbar) => {
    navbar.remove()
  })

  setTimeout(removeNavbar, 100)
}

onMounted(() => {
  removeNavbar()
})
</script>
<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins/_breakpoints';

.wrapper {
  background-color: #5eca24;
  color: $color-white;
  font-weight: bold;
  height: 100vh;
}

.spacer {
  height: 80px;
}

.boxes {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr 1fr;
  grid-column-gap: 50px;
  grid-row-gap: 50px;
  justify-items: center;

  @include media-breakpoint-up(md) {
    grid-template-columns: 1fr 1fr 1fr;
    grid-template-rows: 1fr 1fr;
  }
}

:deep(.image) {
  width: 50vw;

  img {
    width: 50vw;
  }
}
</style>
