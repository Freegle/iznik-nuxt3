<template>
  <b-row class="m-0">
    <b-col cols="0" md="3" />
    <b-col cols="12" md="6">
      <div class="wrapper d-flex flex-column justify-content-around">
        <div class="inner">
          <div class="d-flex justify-content-around">
            <ProxyImage
              preload
              src="/NRD/Banner.png?a=1"
              alt="National Reuse Day banner"
              class-name="image mt-2 w-100"
            />
          </div>
          <div class="d-flex justify-content-around w-100">
            <div class="ratio ratio-16x9">
              <iframe
                class="embed-responsive-item w-100"
                src="https://www.youtube.com/embed/jyrAq57nqPM?si=892mIXfXSGpFxvJG"
                allowfullscreen
              />
            </div>
          </div>
          <div class="spacer" />
          <div class="boxes ml-2 mr-2 d-flex flex-wrap justify-content-between">
            <NationalReuseDayBox
              title="A-Z Film"
              description="Watch and share our new film about the Freegle Free Shop."
              image="/NRD/A-Zfilm.png"
              url="https://youtu.be/SMtiMAiEb20?si=7VI3TxOaHzguem65"
              colour="magenta"
            />
            <NationalReuseDayBox
              title="Resources"
              image="/NRD/resources.png"
              description="Free communications assets, images and press release."
              url="https://drive.google.com/drive/folders/1TuJV6LOVv_1x3UMmUBhhkCsc48uhDwA4?usp=share_link"
              colour="blue"
            />
            <NationalReuseDayBox
              image="/NRD/ReuseStories.png"
              title="Share your reuse story"
              description="Tell us why you love Freegle and find out what others are saying too."
              url="https://www.ilovefreegle.org/stories"
              colour="purple"
            />
            <NationalReuseDayBox
              title="Freegle something"
              image="/NRD/FreegleIt.png"
              description="Give and get stuff for free, locally."
              url="https://www.ilovefreegle.org"
              colour="gold"
            />
            <NationalReuseDayBox
              title="#ReuseHeroes"
              image="/NRD/ReuseHeroes.png"
              description="Tell us about your local Reuse Heroes."
              url="mailto:partnerships@ilovefreegle.org"
              colour="orange"
            />
            <NationalReuseDayBox
              image="/NRD/TellAFriend.png"
              title="Refer a friend to Freegle"
              description="Get more reuse happening by spreading the word."
              url="https://www.ilovefreegle.org/promote"
              colour="blue"
            />
          </div>
          <div class="d-flex justify-content-around">
            <b-card class="cardwidth">
              <p>
                Join Freegle as we celebrate National Reuse Day on Friday 17th
                October.
              </p>
              <p>
                #NationalReuseDay is an annual event, held each year on the
                third Friday of October. National Reuse Day celebrates the
                wonderful and powerful act of REUSE - in all its forms. Let's
                work together to put #Reuse firmly into the spotlight!
              </p>
              <p>
                This year will focus on the UK's #ReuseHeroes. Up and down the
                UK there are some incredible initiatives going on, helping
                people to waste less and reuse more. We want to shine a light on
                the amazing reuse that's already happening and the fabulous
                'Reuse Heroes', who are helping to inspire communities to waste
                less and reuse more.
              </p>
              <p class="mt-2">
                For more information about National Reuse Day contact us here:
                <SupportLink
                  email="partnerships@ilovefreegle.org"
                  text="partnerships@ilovefreegle.org"
                />.
              </p>
            </b-card>
          </div>
        </div>
      </div>
    </b-col>
  </b-row>
</template>
<script setup>
import { useRoute } from 'vue-router'
import { onMounted, definePageMeta, useHead, useRuntimeConfig } from '#imports'
import { buildHead } from '~/composables/useBuildHead'
import ProxyImage from '~/components/ProxyImage.vue'
import SupportLink from '~/components/SupportLink.vue'
import NationalReuseDayBox from '~/components/NationalReuseDayBox.vue'

const runtimeConfig = useRuntimeConfig()
const route = useRoute()

definePageMeta({
  layout: 'no-navbar',
})

const head = buildHead(
  route,
  runtimeConfig,
  'National Reuse Day 2025',
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
}

:deep(p, li) {
  font-family: 'Varela Round', 'Source Sans Pro', -apple-system,
    BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}
</style>
