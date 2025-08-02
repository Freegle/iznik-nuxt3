<template>
  <div class="birthday-page">
    <!-- Hero Section with Modern Design -->
    <section class="hero-section">
      <div class="hero-background">
        <!-- Floating Freegle Logos -->
        <div class="floating-logos">
          <div
            v-for="n in 8"
            :key="n"
            class="logo"
            :class="`logo-${n}`"
            :style="`--delay: ${1.5 + n * 0.4}s; --duration: ${7 + n * 0.2}s;`"
          >
            <img
              src="/logos/user_logo_vector.svg"
              alt="Freegle Logo"
              class="logo-img"
            />
          </div>
        </div>
      </div>

      <b-container class="hero-content">
        <b-row class="align-items-center min-vh-100">
          <b-col cols="12" lg="10" offset-lg="1">
            <BirthdayHero
              :group-age="groupAge"
              :title="pageTitle"
              :group-id="groupId"
              :is-today="isToday"
              @donation-success="onDonationSuccess"
              @donation-click="onDonationClick"
            />
          </b-col>
        </b-row>
      </b-container>
    </section>

    <!-- Impact Stats Section -->
    <section v-if="group && dataReady" class="impact-section">
      <b-container>
        <b-row>
          <b-col cols="12" lg="10" offset-lg="1">
            <div class="section-header text-center mb-5">
              <h2 class="section-title">Our Impact</h2>
              <p class="section-subtitle">
                Look what {{ group.namefull }} achieved this year
              </p>
            </div>

            <!-- Main Impact Stats -->
            <div class="impact-card">
              <StatsImpact
                v-if="totalWeight > 0"
                range="in the last 12 months"
                :total-benefit="totalBenefit"
                :total-c-o2="totalCO2"
                :total-weight="totalWeight"
                :full-stats="true"
                class="mb-4"
              />

              <!-- Community Stats Grid -->
              <div class="community-stats">
                <div class="stat-card">
                  <div class="stat-icon">
                    <v-icon icon="users" />
                  </div>
                  <div class="stat-content">
                    <h3 class="stat-number">
                      {{ group.membercount?.toLocaleString() || 0 }}
                    </h3>
                    <p class="stat-label">Community members</p>
                  </div>
                </div>

                <div class="stat-card">
                  <div class="stat-icon">
                    <v-icon icon="gift" />
                  </div>
                  <div class="stat-content">
                    <h3 class="stat-number">
                      {{ messagesThisYear?.toLocaleString() || 0 }}
                    </h3>
                    <p class="stat-label">Items shared this year</p>
                  </div>
                </div>

                <div class="stat-card">
                  <div class="stat-icon">
                    <v-icon icon="heart" />
                  </div>
                  <div class="stat-content">
                    <h3 class="stat-number">{{ groupAge }}</h3>
                    <p class="stat-label">Years of caring</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Celebration Message -->
            <div class="celebration-message">
              <div class="message-content">
                <h3 class="text-white">
                  🎉 Thank you to our incredible community! 🎉
                </h3>
                <p>
                  Together, we've built something wonderful. Every item shared,
                  every connection made, and every item saved from landfill
                  makes a real difference. Here's to many more years of
                  community spirit and environmental impact!
                </p>
              </div>
            </div>
          </b-col>
        </b-row>
      </b-container>
    </section>

    <!-- Loading State -->
    <section v-else-if="loading" class="loading-section">
      <b-container>
        <div class="text-center py-5">
          <b-img src="/loader.gif" alt="Loading celebration..." />
          <p class="mt-3 text-muted">Preparing the birthday celebration...</p>
        </div>
      </b-container>
    </section>

    <!-- Error State -->
    <section v-else-if="!group && !loading" class="error-section">
      <b-container>
        <div class="text-center py-5">
          <h2>Community Not Found</h2>
          <p class="text-muted mb-4">
            We couldn't find a community with that name. Please check the
            spelling and try again.
          </p>
          <b-button variant="primary" size="lg" href="/">
            <v-icon icon="home" class="mr-2" />
            Go to Homepage
          </b-button>
        </div>
      </b-container>
    </section>
  </div>
</template>
<script setup>
import dayjs from 'dayjs'
import StatsImpact from '~/components/StatsImpact'
import BirthdayHero from '~/components/BirthdayHero'
import { useGroupStore } from '~/stores/group'
import { useStatsStore } from '~/stores/stats'
import { buildHead } from '~/composables/useBuildHead'
import { useRoute, definePageMeta } from '#imports'

// Use empty layout
definePageMeta({
  layout: 'no-navbar',
})

const route = useRoute()
const runtimeConfig = useRuntimeConfig()

// Initialize stores
const groupStore = useGroupStore()
const statsStore = useStatsStore()

// Route parameters
const groupname = route.params.groupname

// Reactive data
const loading = ref(true)
const dataReady = ref(false)

// Computed properties
const group = computed(() => {
  return groupStore.get(groupname)
})

const groupId = computed(() => {
  return group.value?.id || null
})

const groupAge = computed(() => {
  if (!group.value?.founded) return 0
  const founded = new Date(group.value.founded)
  const now = new Date()
  return Math.floor((now - founded) / (365.25 * 24 * 60 * 60 * 1000))
})

const isToday = computed(() => {
  if (!group.value?.founded) return false
  const founded = dayjs(group.value.founded)
  const today = dayjs()
  return founded.format('MM-DD') === today.format('MM-DD')
})

// Stats computed properties
const totalWeight = computed(() => {
  const weights = statsStore?.Weight
  let total = 0
  const now = dayjs()
  if (weights) {
    for (const w of weights) {
      if (now.diff(dayjs(w.date), 'days') <= 365) {
        total += w.count
      }
    }
  }
  return total / 1000 // Convert to tonnes
})

// Benefit of reuse per tonne is £711 and CO2 impact is -0.51tCO2eq based on WRAP figures.
// https://wrap.org.uk/resources/tool/benefits-reuse-tool
const totalBenefit = computed(() => {
  return totalWeight.value * 711
})

const totalCO2 = computed(() => {
  return totalWeight.value * 0.51
})

const messagesThisYear = computed(() => {
  const messages = statsStore.Activity || []
  return messages.reduce((total, item) => total + (item.count || 0), 0)
})

// Donation handlers
function onDonationClick(amount) {
  console.log('Donation clicked:', amount)
}

function onDonationSuccess() {
  console.log('Donation successful!')
  // Could show a success message or redirect
}

// Meta tags
const groupName = computed(() => group.value?.namefull || 'Community')
const pageTitle = computed(
  () => `${groupName.value} is ${groupAge.value} years old!`
)

// Set up page head
if (groupname) {
  await groupStore.fetch(groupname, true)

  useHead(
    buildHead(
      route,
      runtimeConfig,
      pageTitle.value,
      `Celebrate ${groupName.value}'s ${groupAge.value}th birthday! See the amazing impact our community has made and help us continue for another year.`,
      group.value?.profile ? group.value?.profile : null
    )
  )
}

// Lifecycle hooks
onMounted(async () => {
  try {
    loading.value = true

    if (!group.value) {
      loading.value = false
      return
    }

    // Set up date range for the last year
    const start = dayjs().subtract(1, 'year').startOf('month')
    const end = dayjs().endOf('month')

    // Clear previous stats and fetch new ones
    await statsStore.clear()
    await statsStore.fetch({
      group: groupId.value,
      grouptype: 'Freegle',
      systemwide: groupId.value === null,
      start: start.format('YYYY-MM-DD'),
      end: end.format('YYYY-MM-DD'),
    })

    dataReady.value = true
    loading.value = false
  } catch (err) {
    console.error('Error loading birthday page:', err)
    loading.value = false
  }
})
</script>

<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins/_breakpoints';

.birthday-page {
  background: white;
  min-height: 100vh;
  position: relative;
  overflow-x: hidden;
}

/* Hero Section */
.hero-section {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
}

.hero-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
}

/* Floating Balloons */
.floating-balloons {
  position: absolute;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 10;
}

.balloon {
  position: absolute;
  font-size: 2rem;
  animation: balloonFloat var(--duration, 6s) infinite ease-in-out;
  animation-delay: var(--delay, 0s);
}

.balloon-1 {
  left: 5%;
  top: 15%;
  filter: hue-rotate(0deg) brightness(1.2);
}
.balloon-2 {
  left: 88%;
  top: 25%;
  filter: hue-rotate(45deg) brightness(1.2);
}
.balloon-3 {
  left: 15%;
  top: 70%;
  filter: hue-rotate(90deg) brightness(1.2);
}
.balloon-4 {
  left: 75%;
  top: 10%;
  filter: hue-rotate(135deg) brightness(1.2);
}
.balloon-5 {
  left: 92%;
  top: 60%;
  filter: hue-rotate(180deg) brightness(1.2);
}
.balloon-6 {
  left: 3%;
  top: 50%;
  filter: hue-rotate(225deg) brightness(1.2);
}
.balloon-7 {
  left: 70%;
  top: 85%;
  filter: hue-rotate(270deg) brightness(1.2);
}
.balloon-8 {
  left: 25%;
  top: 35%;
  filter: hue-rotate(315deg) brightness(1.2);
}
.balloon-9 {
  left: 50%;
  top: 85%;
  filter: hue-rotate(60deg) brightness(1.2);
}
.balloon-10 {
  left: 95%;
  top: 40%;
  filter: hue-rotate(300deg) brightness(1.2);
}

@keyframes balloonFloat {
  0%,
  100% {
    transform: translateY(0px) translateX(0px) rotate(-2deg);
  }
  25% {
    transform: translateY(-20px) translateX(10px) rotate(2deg);
  }
  50% {
    transform: translateY(-40px) translateX(-5px) rotate(-1deg);
  }
  75% {
    transform: translateY(-25px) translateX(15px) rotate(3deg);
  }
}

/* Floating Birthday Cakes */
.floating-cakes {
  position: absolute;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 8;
}

.cake {
  position: absolute;
  font-size: 1rem;
  animation-fill-mode: both;
  animation-iteration-count: infinite;
  animation-timing-function: ease-in-out;
}

.cake-1 {
  left: 12%;
  top: 20%;
  animation: cakeFloat1 var(--duration) infinite ease-in-out;
  animation-delay: var(--delay);
}
.cake-2 {
  left: 82%;
  top: 55%;
  animation: cakeFloat2 var(--duration) infinite ease-in-out;
  animation-delay: var(--delay);
}
.cake-3 {
  left: 35%;
  top: 75%;
  animation: cakeFloat3 var(--duration) infinite ease-in-out;
  animation-delay: var(--delay);
}
.cake-4 {
  left: 65%;
  top: 30%;
  animation: cakeFloat4 var(--duration) infinite ease-in-out;
  animation-delay: var(--delay);
}
.cake-5 {
  left: 18%;
  top: 60%;
  animation: cakeFloat5 var(--duration) infinite ease-in-out;
  animation-delay: var(--delay);
}
.cake-6 {
  left: 85%;
  top: 15%;
  animation: cakeFloat6 var(--duration) infinite ease-in-out;
  animation-delay: var(--delay);
}
.cake-7 {
  left: 45%;
  top: 10%;
  animation: cakeFloat1 var(--duration) infinite ease-in-out;
  animation-delay: var(--delay);
}
.cake-8 {
  left: 8%;
  top: 80%;
  animation: cakeFloat2 var(--duration) infinite ease-in-out;
  animation-delay: var(--delay);
}
.cake-9 {
  left: 92%;
  top: 35%;
  animation: cakeFloat3 var(--duration) infinite ease-in-out;
  animation-delay: var(--delay);
}
.cake-10 {
  left: 28%;
  top: 45%;
  animation: cakeFloat4 var(--duration) infinite ease-in-out;
  animation-delay: var(--delay);
}
.cake-11 {
  left: 78%;
  top: 70%;
  animation: cakeFloat5 var(--duration) infinite ease-in-out;
  animation-delay: var(--delay);
}
.cake-12 {
  left: 5%;
  top: 25%;
  animation: cakeFloat6 var(--duration) infinite ease-in-out;
  animation-delay: var(--delay);
}
.cake-13 {
  left: 60%;
  top: 85%;
  animation: cakeFloat1 var(--duration) infinite ease-in-out;
  animation-delay: var(--delay);
}
.cake-14 {
  left: 95%;
  top: 50%;
  animation: cakeFloat2 var(--duration) infinite ease-in-out;
  animation-delay: var(--delay);
}
.cake-15 {
  left: 40%;
  top: 15%;
  animation: cakeFloat3 var(--duration) infinite ease-in-out;
  animation-delay: var(--delay);
}

@keyframes cakeFloat1 {
  0%,
  100% {
    transform: translateY(0px) translateX(0px) rotate(-1deg);
  }
  25% {
    transform: translateY(-35px) translateX(25px) rotate(2deg);
  }
  50% {
    transform: translateY(-60px) translateX(-20px) rotate(-3deg);
  }
  75% {
    transform: translateY(-40px) translateX(30px) rotate(1deg);
  }
}

@keyframes cakeFloat2 {
  0%,
  100% {
    transform: translateY(0px) translateX(0px) rotate(2deg);
  }
  30% {
    transform: translateY(-45px) translateX(-30px) rotate(-2deg);
  }
  60% {
    transform: translateY(-25px) translateX(40px) rotate(4deg);
  }
  80% {
    transform: translateY(-55px) translateX(15px) rotate(-1deg);
  }
}

@keyframes cakeFloat3 {
  0%,
  100% {
    transform: translateY(0px) translateX(0px) rotate(-2deg);
  }
  20% {
    transform: translateY(-50px) translateX(35px) rotate(3deg);
  }
  45% {
    transform: translateY(-30px) translateX(-25px) rotate(-4deg);
  }
  70% {
    transform: translateY(-65px) translateX(20px) rotate(1deg);
  }
}

@keyframes cakeFloat4 {
  0%,
  100% {
    transform: translateY(0px) translateX(0px) rotate(1deg);
  }
  35% {
    transform: translateY(-40px) translateX(-35px) rotate(-3deg);
  }
  65% {
    transform: translateY(-70px) translateX(25px) rotate(2deg);
  }
  85% {
    transform: translateY(-20px) translateX(-15px) rotate(-1deg);
  }
}

@keyframes cakeFloat5 {
  0%,
  100% {
    transform: translateY(0px) translateX(0px) rotate(-3deg);
  }
  40% {
    transform: translateY(-55px) translateX(20px) rotate(4deg);
  }
  55% {
    transform: translateY(-35px) translateX(-40px) rotate(-2deg);
  }
  90% {
    transform: translateY(-45px) translateX(30px) rotate(1deg);
  }
}

@keyframes cakeFloat6 {
  0%,
  100% {
    transform: translateY(0px) translateX(0px) rotate(2deg);
  }
  15% {
    transform: translateY(-65px) translateX(-25px) rotate(-4deg);
  }
  50% {
    transform: translateY(-25px) translateX(45px) rotate(3deg);
  }
  75% {
    transform: translateY(-50px) translateX(-10px) rotate(-1deg);
  }
}

/* Party Poppers */
.party-poppers {
  position: absolute;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 12;
}

.popper {
  position: absolute;
  font-size: 1.2rem;
  animation: popperExplode var(--duration, 4s) infinite ease-out;
  animation-delay: var(--delay, 0s);
}

.popper-1 {
  left: 20%;
  top: 30%;
}
.popper-2 {
  left: 75%;
  top: 20%;
}
.popper-3 {
  left: 45%;
  top: 60%;
}
.popper-4 {
  left: 10%;
  top: 75%;
}
.popper-5 {
  left: 85%;
  top: 70%;
}

@keyframes popperExplode {
  0% {
    transform: translateY(0px) translateX(0px) rotate(0deg) scale(0.3);
    opacity: 0;
  }
  10% {
    transform: translateY(-20px) translateX(10px) rotate(180deg) scale(1.5);
    opacity: 1;
  }
  20% {
    transform: translateY(-40px) translateX(-15px) rotate(360deg) scale(1.2);
    opacity: 0.9;
  }
  30% {
    transform: translateY(-60px) translateX(25px) rotate(540deg) scale(0.8);
    opacity: 0.7;
  }
  50% {
    transform: translateY(-80px) translateX(-30px) rotate(720deg) scale(0.5);
    opacity: 0.4;
  }
  70% {
    transform: translateY(-100px) translateX(20px) rotate(900deg) scale(0.3);
    opacity: 0.2;
  }
  100% {
    transform: translateY(-120px) translateX(-10px) rotate(1080deg) scale(0.1);
    opacity: 0;
  }
}

/* Floating Freegle Logos */
.floating-logos {
  position: absolute;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 6;
}

.logo {
  position: absolute;
  animation: logoFloat var(--duration, 8s) infinite ease-in-out;
  animation-delay: var(--delay, 0s);
  opacity: 0.8;
}

.logo-img {
  width: 20px;
  height: 20px;
  filter: brightness(1.1) saturate(1.2);
}

.logo-1 {
  left: 22%;
  top: 40%;
}
.logo-2 {
  left: 68%;
  top: 25%;
}
.logo-3 {
  left: 15%;
  top: 80%;
}
.logo-4 {
  left: 85%;
  top: 65%;
}
.logo-5 {
  left: 38%;
  top: 15%;
}
.logo-6 {
  left: 7%;
  top: 55%;
}
.logo-7 {
  left: 78%;
  top: 45%;
}
.logo-8 {
  left: 45%;
  top: 75%;
}

@keyframes logoFloat {
  0%,
  100% {
    transform: translateY(0px) translateX(0px) rotate(0deg) scale(1);
    opacity: 0.7;
  }
  12.5% {
    transform: translateY(-15px) translateX(8px) rotate(45deg) scale(1.3);
    opacity: 0.8;
  }
  25% {
    transform: translateY(-25px) translateX(15px) rotate(90deg) scale(0.7);
    opacity: 0.9;
  }
  37.5% {
    transform: translateY(-35px) translateX(-5px) rotate(135deg) scale(1.4);
    opacity: 0.6;
  }
  50% {
    transform: translateY(-45px) translateX(-20px) rotate(180deg) scale(0.6);
    opacity: 0.5;
  }
  62.5% {
    transform: translateY(-40px) translateX(10px) rotate(225deg) scale(1.5);
    opacity: 0.7;
  }
  75% {
    transform: translateY(-30px) translateX(25px) rotate(270deg) scale(0.8);
    opacity: 0.8;
  }
  87.5% {
    transform: translateY(-20px) translateX(5px) rotate(315deg) scale(1.2);
    opacity: 0.9;
  }
}

.hero-content {
  position: relative;
  z-index: 100;
}

/* Fade animated elements when they overlap with central content */
.hero-content::before {
  content: '';
  position: absolute;
  top: -50px;
  left: -50px;
  right: -50px;
  bottom: -50px;
  z-index: -1;
  pointer-events: none;
  background: radial-gradient(
    ellipse at center,
    rgba(255, 255, 255, 0.1) 30%,
    rgba(255, 255, 255, 0.05) 50%,
    rgba(255, 255, 255, 0.02) 70%,
    transparent 100%
  );
}

.celebration-header {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 30px;
  padding: 3rem 2rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
}

.birthday-message {
  text-align: center;
  margin-bottom: 2rem;
}

.age-display {
  display: inline-block;
  position: relative;
  margin-bottom: 2rem;
  text-align: center;
  background: linear-gradient(
    45deg,
    #ff6b9d,
    #ff8a5c,
    #ffc83d,
    #4ecdc4,
    #45b7d1,
    #9c88ff,
    #ff6b9d
  );
  background-size: 300% 300%;
  animation: rainbowShift 3s ease-in-out infinite;
  padding: 1rem 3rem;
  border-radius: 100px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

#birthday-cake:before {
  content: '';
  position: absolute;
  background-color: #ede0d4;
  width: 400px;
  height: 140px;
  border-radius: 50%;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -10%);
  box-shadow: inset -2px -5px #e6ccb2;
}

.cake {
  position: absolute;
  background-color: #ddb892;
  width: 350px;
  height: 130px;
  transform: translate(-50%, -60%);
  left: 50%;
  top: 60%;
}

.cake:before,
.middle,
.middle:before {
  border-radius: 50% 50% 50% 50% / 0% 0% 100% 100%;
  width: 350px;
  height: 50px;
}

.middle {
  position: absolute;
  background-color: #ddb892;
  top: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.top {
  position: absolute;
  background-color: #7f5539;
  width: 350px;
  height: 90px;
  border-radius: 50%;
  z-index: 2;
  top: -45px;
  box-shadow: inset -5px -1px #fff, inset -70px 2px rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.chocs {
  position: absolute;
  background-color: #7f5539;
  width: 100%;
  height: 100%;
  border-radius: 50%;
}

.candles {
  position: absolute;
  width: 30px;
  height: 80px;
  background-color: #0081a7;
  top: -160px;
  left: 48%;
}

.flame,
.flame2,
.flame3 {
  position: absolute;
  width: 30px;
  height: 30px;
  background-color: rgba(252, 191, 73, 0.8);
  transform: rotate(-45deg);
  animation: flame 0.5s infinite;
}

.flame2 {
  left: 30px;
  animation-delay: 0.2s;
}

.flame3 {
  left: 60px;
  animation-delay: 0.4s;
}

@keyframes flame {
  0%,
  25%,
  100% {
    transform: scaleY(1) rotate(-45deg);
  }
  50%,
  75% {
    transform: scaleY(1.1) rotate(-45deg);
  }
}

.age-number {
  font-size: 4rem;
  font-weight: bold;
  color: white;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  margin-bottom: 0.5rem;
  display: block;
}

@keyframes rainbowShift {
  0%,
  100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

.cake-logo {
  width: 35px;
  height: 35px;
  filter: brightness(1.8) contrast(1.3)
    drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.7));
  z-index: 10;
}

.age-text {
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 2px;
  color: #2d3748;
  margin-top: 1rem;
  text-align: center;
}

.birthday-title {
  font-size: 3.5rem;
  font-weight: bold;
  color: #2d3748;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

.birthday-subtitle {
  font-size: 1.5rem;
  color: #4a5568;
  margin-bottom: 0;
}

.cta-section {
  margin-top: 1rem;
}

.cta-heading {
  font-size: 2.5rem;
  font-weight: bold;
  color: #2d3748;
  margin-bottom: 1rem;
}

.cta-text {
  font-size: 1.3rem;
  color: #4a5568;
  margin-bottom: 2rem;
}

.donation-wrapper {
  max-width: 600px;
  margin: 0 auto;
}

.donation-wrapper .d-flex > * {
  margin: 0.25rem;
}

/* Ensure monthly checkbox has red border */
:deep(.form-check-input) {
  border: 1px solid red !important;
}

/* Impact Section */
.impact-section {
  background: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0),
    rgba(255, 255, 255, 0.95)
  );
  padding: 4rem 0;
  position: relative;
  z-index: 50;
}

/* Fade animated elements when they overlap with impact section */
.impact-section::before {
  content: '';
  position: absolute;
  top: -50px;
  left: -50px;
  right: -50px;
  bottom: -50px;
  z-index: -1;
  pointer-events: none;
  background: radial-gradient(
    ellipse at center,
    rgba(255, 255, 255, 0.08) 40%,
    rgba(255, 255, 255, 0.04) 60%,
    rgba(255, 255, 255, 0.01) 80%,
    transparent 100%
  );
}

.section-header {
  margin-bottom: 3rem;
}

.section-title {
  font-size: 3rem;
  font-weight: bold;
  color: #2d3748;
  margin-bottom: 1rem;
}

.section-subtitle {
  font-size: 1.3rem;
  color: #4a5568;
}

.impact-card {
  background: white;
  border-radius: 20px;
  padding: 3rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.community-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-top: 3rem;
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 2rem;
  background: linear-gradient(135deg, #f8f9ff, #e3f2fd);
  border-radius: 15px;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1.5rem;
  font-size: 1.5rem;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: bold;
  color: #2d3748;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 1rem;
  color: #4a5568;
  margin: 0;
}

.celebration-message {
  background: linear-gradient(135deg, #2d3748, #1a202c);
  border-radius: 20px;
  padding: 3rem;
  text-align: center;
  color: white;
  box-shadow: 0 15px 40px rgba(45, 55, 72, 0.4);
  border: 2px solid #4a5568;
}

.message-content h3 {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.message-content p {
  font-size: 1.2rem;
  opacity: 0.95;
  margin: 0;
}

/* Loading and Error States */
.loading-section,
.error-section {
  min-height: 100vh;
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.95);
}

/* Responsive Design */
@include media-breakpoint-down(md) {
  .birthday-decorations {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .decoration-img {
    max-width: 80px;
  }

  .birthday-title {
    font-size: 2.5rem;
  }

  .cta-heading {
    font-size: 2rem;
  }

  .section-title {
    font-size: 2.5rem;
  }

  .celebration-header {
    padding: 2rem 1.5rem;
  }

  .impact-card {
    padding: 2rem;
  }

  .community-stats {
    grid-template-columns: 1fr;
  }

  .stat-card {
    flex-direction: column;
    text-align: center;
  }

  .stat-icon {
    margin-right: 0;
    margin-bottom: 1rem;
  }

  /* Reduce animated elements on medium and smaller screens */
  .balloon-7,
  .balloon-8,
  .balloon-9,
  .balloon-10 {
    display: none;
  }
  .cake-9,
  .cake-10,
  .cake-11,
  .cake-12,
  .cake-13,
  .cake-14,
  .cake-15 {
    display: none;
  }
  .popper-4,
  .popper-5 {
    display: none;
  }
  .logo-5,
  .logo-6,
  .logo-7,
  .logo-8 {
    display: none;
  }
}

@include media-breakpoint-down(sm) {
  #birthday-cake {
    width: 250px;
    height: 150px;
  }

  #birthday-cake:before {
    width: 280px;
    height: 100px;
  }

  .cake {
    width: 250px;
    height: 90px;
  }

  .cake:before,
  .middle,
  .middle:before {
    width: 250px;
    height: 35px;
  }

  .top {
    width: 250px;
    height: 65px;
    top: -32px;
  }

  .candles {
    width: 25px;
    height: 60px;
    top: -120px;
  }

  .flame,
  .flame2,
  .flame3 {
    width: 25px;
    height: 25px;
  }

  .age-number {
    font-size: 1.8rem;
  }

  .cake-logo {
    width: 30px;
    height: 30px;
  }

  .birthday-title {
    font-size: 2rem;
  }

  .birthday-subtitle {
    font-size: 1.2rem;
  }

  .cta-heading {
    font-size: 1.8rem;
  }

  /* Further reduce animated elements on small screens */
  .balloon-4,
  .balloon-5,
  .balloon-6 {
    display: none;
  }
  .cake-5,
  .cake-6,
  .cake-7,
  .cake-8 {
    display: none;
  }
  .popper-3 {
    display: none;
  }
  .logo-3,
  .logo-4 {
    display: none;
  }
}

@include media-breakpoint-down(xs) {
  /* Minimal animated elements on extra small screens */
  .balloon-3 {
    display: none;
  }
  .cake-3,
  .cake-4 {
    display: none;
  }
  .logo-2 {
    display: none;
  }
}
</style>
