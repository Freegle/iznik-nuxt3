<template>
  <div class="birthday-donate-page">
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
            <BirthdayDonateHero
              :group-age="groupAge"
              :title="pageTitle"
              :group-id="groupId"
              :is-today="isToday"
              :donation-amount="donationAmount"
              :show-thank-you="showThankYou"
              @donation-success="onDonationSuccess"
              @donation-click="onDonationClick"
            />
          </b-col>
        </b-row>
      </b-container>
    </section>

    <!-- Error State -->
    <section v-if="!group" class="error-section">
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
import BirthdayDonateHero from '~/components/BirthdayDonateHero'
import { useRoute, definePageMeta } from '#imports'
import { useBirthday } from '~/composables/useBirthday'
import Api from '~/api'

// Use empty layout
definePageMeta({
  layout: 'no-navbar',
})

const route = useRoute()
const runtimeConfig = useRuntimeConfig()
const api = Api(runtimeConfig)

// Use birthday composable
const {
  group,
  groupId,
  groupName,
  groupAge,
  isToday,
  pageTitle,
  setupPageHead,
} = useBirthday()

// Donation specific data
const donationAmount = computed(() => parseFloat(route.query.amount) || 5)
const showThankYou = ref(false)

// Donation handlers
function onDonationClick(amount) {
  console.log('Donation clicked:', amount)
}

async function onDonationSuccess() {
  console.log('Donation successful!')
  showThankYou.value = true

  // Record abtest conversion for successful donation from email
  try {
    await api.bandit.chosen({
      uid: 'birthdayappeal',
      variant: 'fromemail',
    })
  } catch (err) {
    console.error('Error recording donation conversion:', err)
  }
}

// Set up page head with custom description
await setupPageHead(
  `Celebrate ${groupName.value}'s ${groupAge.value}th birthday! Help us continue for another year with a donation.`
)

// Record abtest view as 'fromemail' and load data
onMounted(async () => {
  try {
    // Record abtest view
    await api.bandit.shown({
      uid: 'birthdayappeal',
      variant: 'fromemail',
    })
  } catch (err) {
    console.error('Error loading birthday donation page:', err)
  }
})
</script>

<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins/_breakpoints';

.birthday-donate-page {
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

/* Loading and Error States */
.loading-section,
.error-section {
  min-height: 100vh;
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.95);
}

/* Responsive Design */
</style>
