<template>
  <div class="wrapper d-flex flex-column justify-content-around">
    <div class="inner">
      <h1 class="text-center text-white">National Reuse Day 2024</h1>
      <div class="d-flex justify-content-around">
        <ProxyImage
          preload
          src="/councils/NationalReuseDay2.png"
          alt="National Reuse Day logo"
          class-name="image mt-2"
        />
      </div>
      <div class="d-flex justify-content-around">
        <b-card class="bg-white cardwidth">
          <p>
            Join Freegle as we celebrate National Reuse Day On Friday 18th
            October. #NationalReuseDay is an annual event which celebrates the
            wonderful and powerful act of REUSE - in all its forms. Let's work
            together to put #Reuse firmly into the spotlight!
          </p>
          <p>
            This year we will be asking people to #ChooseToReuse everyday,
            because it's simple, anyone can do it and it's a great way for
            everyone to:
          </p>
          <ul class="list-unstyled mb-0">
            <li>✅ Save money.</li>
            <li>✅ Cut waste.</li>
            <li>✅ Help others.</li>
            <li>✅ Protect the planet.</li>
          </ul>
        </b-card>
      </div>
      <div class="spacer" />
      <div class="boxes ml-2 mr-2">
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
  width: 100vw;

  img {
    width: 100vw;
  }

  @include media-breakpoint-up(md) {
    width: 50vw;

    img {
      width: 50vw;
    }
  }
}

.cardwidth {
  width: 100vw;

  @include media-breakpoint-up(md) {
    width: 50vw;
  }
}
</style>
