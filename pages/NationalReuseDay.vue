<template>
  <b-row class="m-0">
    <b-col cols="0" md="3" />
    <b-col cols="12" md="6">
      <div class="wrapper d-flex flex-column justify-content-around">
        <div class="inner">
          <div class="d-flex justify-content-around">
            <ProxyImage
              preload
              src="/councils/NationalReuseDay2.png"
              alt="National Reuse Day logo"
              class-name="image mt-2 w-100"
            />
          </div>
          <div class="d-flex justify-content-around w-100">
            <div class="ratio ratio-16x9">
              <iframe
                class="embed-responsive-item w-100"
                src="https://www.youtube.com/embed/1rjCVHPOIpA"
                allowfullscreen
              />
            </div>
          </div>
          <div class="spacer" />
          <div class="boxes ml-2 mr-2 d-flex flex-wrap justify-content-between">
            <NationalReuseDayBox
              title="A-Z Film"
              description="Watch and share our new Free Shop film!"
              image="/NRD/A-Zfilm.png"
              url="https://www.youtube.com/embed/1rjCVHPOIpA"
              colour="magenta"
            />
            <NationalReuseDayBox
              title="Resources"
              image="/NRD/resources.png"
              description="Free communications assets and key links"
              url="https://councils.ilovefreegle.org/"
              colour="blue"
            />
            <NationalReuseDayBox
              image="/NRD/ReuseStories.png"
              title="Share your reuse story"
              description="Tell us why you love Freegle and find out what others are saying too"
              url="https://www.ilovefreegle.org/stories"
              colour="purple"
            />
            <NationalReuseDayBox
              title="Freegle something"
              image="/NRD/FreegleIt.png"
              description="Give and get for free, locally!"
              url="https://www.ilovefreegle.org"
              colour="gold"
            />
            <NationalReuseDayBox
              title="Quiz"
              image="/NRD/ReuseQuiz.png"
              description="Test your knowledge and discover fun facts about reuse!"
              url="https://councils.ilovefreegle.org/"
              colour="orange"
            />
            <NationalReuseDayBox
              image="/NRD/TellAFriend.png"
              title="Refer a friend to Freegle"
              description="Get more reuse happening by spreading the word"
              url="https://www.ilovefreegle.org/promote"
              colour="blue"
            />
          </div>
          <div class="d-flex justify-content-around">
            <b-card class="cardwidth">
              <p>
                Join Freegle as we celebrate National Reuse Day On Friday 18th
                October. #NationalReuseDay is an annual event which celebrates
                the wonderful and powerful act of REUSE - in all its forms.
                Let's work together to put #Reuse firmly into the spotlight!
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
        </div>
      </div>
    </b-col>
  </b-row>
</template>
<script setup>
import { useRoute } from 'vue-router'
import { buildHead } from '~/composables/useBuildHead'

const runtimeConfig = useRuntimeConfig()
const route = useRoute()

definePageMeta({
  layout: 'no-navbar',
})

const head = buildHead(
  route,
  runtimeConfig,
  'National Reuse Day 2024',
  'Celebrate reuse and get involved',
  runtimeConfig.public.USER_SITE + '/councils/NationalReuseDay.png',
  {
    style: 'background-color: rgb(100 169 63)',
  }
)

head.style = ['https://fonts.googleapis.com/css?family=Varela+Round']

useHead(head)

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
  color: $color-white;
  font-weight: bold;
}

.spacer {
  height: 30px;

  @include media-breakpoint-up(md) {
    height: 40px;
  }
}

.boxes {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr 1fr;
  grid-column-gap: 50px;
  grid-row-gap: 0px;
  justify-items: center;

  @include media-breakpoint-up(md) {
    grid-template-columns: 1fr 1fr 1fr;
    grid-template-rows: 1fr 1fr;
    grid-row-gap: 20px;
  }
}

.cardwidth {
  width: 100vw;
  background-color: #f7f5ef;

  @include media-breakpoint-up(md) {
    width: 50vw;
  }
}

:deep(.image img) {
  width: 100%;
}

p,
li {
  color: #343841;
  font-family: 'Varela Round', 'Source Sans Pro', -apple-system,
    BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}
</style>
