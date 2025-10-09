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
                src="https://www.youtube.com/embed/1SxLokz9F88?si=fcTHW2u75l9qMr6d"
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
              description="Find out about Freegle's Reuse Heroes."
              url="https://www.canva.com/design/DAG0jRT27LA/ZImvRlocTQiuEuaSICtL5w/view?utm_content=DAG0jRT27LA&utm_campaign=designshare&utm_medium=link&utm_source=viewer"
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
                National Reuse Day is an annual celebration of the simple yet
                powerful act of ‘Reuse’ - in all its forms. There are so many
                easy ways for all of us to reuse household items and pass things
                on when we no longer need them. Whether you opt to re-home items
                of furniture; take clothes you no longer wear to a charity shop
                or simply remember to take your reusable bags with you when you
                shop - it’s all reuse and it’s all good!
              </p>
              <p>
                National Reuse Day is celebrated each year on the third Friday
                in October. This year, Reuse Day will focus on the UK’s
                incredible network of ‘Reuse Heroes’. Reuse Heroes are
                individuals, organisations and projects - in communities up and
                down the UK - which help people to waste less and reuse more.
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
