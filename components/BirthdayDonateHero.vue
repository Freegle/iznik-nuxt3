<template>
  <div class="birthday-donate-hero">
    <!-- Floating Balloons -->
    <div class="floating-balloons">
      <div class="balloon balloon-1" :style="`--delay: 0s; --duration: 5.5s;`">
        <span style="filter: hue-rotate(0deg) brightness(1.2) saturate(1.3)"
          >🎈</span
        >
      </div>
      <div
        class="balloon balloon-2"
        :style="`--delay: 0.5s; --duration: 5.6s;`"
      >
        <span style="filter: hue-rotate(45deg) brightness(1.2) saturate(1.3)"
          >🎈</span
        >
      </div>
      <div class="balloon balloon-3" :style="`--delay: 1s; --duration: 5.7s;`">
        <span style="filter: hue-rotate(90deg) brightness(1.2) saturate(1.3)"
          >🎈</span
        >
      </div>
      <div
        class="balloon balloon-4"
        :style="`--delay: 1.5s; --duration: 5.8s;`"
      >
        <span style="filter: hue-rotate(135deg) brightness(1.2) saturate(1.3)"
          >🎈</span
        >
      </div>
      <div class="balloon balloon-5" :style="`--delay: 2s; --duration: 5.9s;`">
        <span style="filter: hue-rotate(180deg) brightness(1.2) saturate(1.3)"
          >🎈</span
        >
      </div>
      <div class="balloon balloon-6" :style="`--delay: 2.5s; --duration: 6s;`">
        <span style="filter: hue-rotate(225deg) brightness(1.2) saturate(1.3)"
          >🎈</span
        >
      </div>
      <div class="balloon balloon-7" :style="`--delay: 3s; --duration: 6.1s;`">
        <span style="filter: hue-rotate(270deg) brightness(1.2) saturate(1.3)"
          >🎈</span
        >
      </div>
      <div
        class="balloon balloon-8"
        :style="`--delay: 3.5s; --duration: 6.2s;`"
      >
        <span style="filter: hue-rotate(315deg) brightness(1.2) saturate(1.3)"
          >🎈</span
        >
      </div>
      <div class="balloon balloon-9" :style="`--delay: 4s; --duration: 6.3s;`">
        <span style="filter: hue-rotate(60deg) brightness(1.2) saturate(1.3)"
          >🎈</span
        >
      </div>
      <div
        class="balloon balloon-10"
        :style="`--delay: 4.5s; --duration: 6.4s;`"
      >
        <span style="filter: hue-rotate(300deg) brightness(1.2) saturate(1.3)"
          >🎈</span
        >
      </div>
    </div>

    <!-- Floating Birthday Cakes -->
    <div class="floating-cakes">
      <div
        v-for="n in 8"
        :key="n"
        class="cake"
        :class="`cake-${n}`"
        :style="`--delay: ${n * 0.3}s; --duration: ${6.5 + n * 0.2}s;`"
      >
        {{ n % 3 === 0 ? '🧁' : n % 2 === 0 ? '🍰' : '🎂' }}
      </div>
    </div>

    <!-- Party Poppers -->
    <div class="party-poppers">
      <div
        v-for="n in 3"
        :key="n"
        class="popper"
        :class="`popper-${n}`"
        :style="`--delay: ${n}s; --duration: ${4 + n * 0.2}s;`"
      >
        🎉
      </div>
    </div>

    <div class="hero-content">
      <div class="celebration-header text-center">
        <!-- Birthday Message -->
        <div v-if="!showThankYou" class="birthday-message">
          <!-- Animated elements around age badge -->
          <div class="age-area">
            <!-- Left side decorations -->
            <div class="age-decorations left">
              <div class="balloon-mini balloon-mini-1">
                <span
                  style="
                    filter: hue-rotate(30deg) brightness(1.2) saturate(1.3);
                  "
                  >🎈</span
                >
              </div>
              <div class="balloon-mini balloon-mini-2">
                <span
                  style="
                    filter: hue-rotate(120deg) brightness(1.2) saturate(1.3);
                  "
                  >🎈</span
                >
              </div>
              <div class="popper-mini popper-mini-1">🎉</div>
              <div class="cake-mini cake-mini-1">🎂</div>
              <div class="logo-mini logo-mini-1">
                <img
                  src="/logos/user_logo_vector.svg"
                  alt="Freegle Logo"
                  class="logo-img-mini"
                />
              </div>
              <div
                v-if="groupProfile && !groupLogoError"
                class="group-logo-mini group-logo-mini-1"
              >
                <img
                  :src="groupProfile"
                  :alt="`${groupName} Logo`"
                  class="group-logo-img-mini"
                  @error="groupLogoError = true"
                />
              </div>
            </div>

            <div class="age-display">
              <div class="age-number">{{ groupAge }}</div>
              <div class="age-text">YEARS</div>
            </div>

            <!-- Right side decorations -->
            <div class="age-decorations right">
              <div class="balloon-mini balloon-mini-3">
                <span
                  style="
                    filter: hue-rotate(210deg) brightness(1.2) saturate(1.3);
                  "
                  >🎈</span
                >
              </div>
              <div class="balloon-mini balloon-mini-4">
                <span
                  style="
                    filter: hue-rotate(330deg) brightness(1.2) saturate(1.3);
                  "
                  >🎈</span
                >
              </div>
              <div class="popper-mini popper-mini-2">🎉</div>
              <div class="cake-mini cake-mini-2">🧁</div>
              <div class="logo-mini logo-mini-2">
                <img
                  src="/logos/user_logo_vector.svg"
                  alt="Freegle Logo"
                  class="logo-img-mini"
                />
              </div>
              <div
                v-if="groupProfile && !groupLogoError"
                class="group-logo-mini group-logo-mini-2"
              >
                <img
                  :src="groupProfile"
                  :alt="`${groupName} Logo`"
                  class="group-logo-img-mini"
                  @error="groupLogoError = true"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Thank You Message -->
        <div v-if="showThankYou" class="thank-you-message">
          <!-- Thank You Cake Slice Graphic -->
          <div class="cake-slice-container">
            <img
              src="/birthday/thank-cake.png"
              alt="Thank You Cake Slice"
              class="cake-slice-graphic"
            />
          </div>
          <h1 class="thank-you-title">Thank you!</h1>
          <p class="thank-you-subtitle">
            Your generous donation of
            <strong>£{{ donationAmount }}</strong> will help keep
            {{ groupName || 'the community' }} thriving for another year. Have a
            slice of virtual cake!
          </p>
        </div>

        <!-- Donation Section -->
        <div v-if="!showThankYou" class="donation-section">
          <div ref="donationSectionRef" class="donation-wrapper">
            <DonationAskStripe
              ref="donationComponent"
              :groupid="props.groupId"
              :groupname="groupName"
              :default="donationAmount"
              :amounts="[donationAmount]"
              hide-intro
              hide-thermometer
              birthday-mode
              @success="$emit('donation-success')"
              @score="$emit('donation-click', $event)"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import DonationAskStripe from '~/components/DonationAskStripe'
import { useGroupStore } from '~/stores/group'

const props = defineProps({
  groupAge: {
    type: Number,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  groupId: {
    type: Number,
    required: true,
  },
  isToday: {
    type: Boolean,
    default: false,
  },
  donationAmount: {
    type: Number,
    required: true,
  },
  showThankYou: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['donation-success', 'donation-click'])

const groupStore = useGroupStore()
const groupLogoError = ref(false)
const donationSectionRef = ref(null)
const donationComponent = ref(null)

// Ensure group data is fetched with full details
onMounted(async () => {
  if (props.groupId) {
    await groupStore.fetch(props.groupId, true) // Force fetch to get complete data
  }

  // Auto-trigger donation after a short delay to ensure Stripe component is ready
  setTimeout(() => {
    triggerAutoDonation()
  }, 2000)
})

function triggerAutoDonation() {
  // Auto-focus on donation section to encourage donation
  if (donationSectionRef.value && !props.showThankYou) {
    donationSectionRef.value.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    })

    // The donation will be automatically triggered when the Stripe component loads
    // since we've set the default amount and it's the only amount option
  }
}

// Computed properties for group data
const group = computed(() => {
  return groupStore.get(props.groupId)
})

const groupName = computed(() => {
  return group.value?.namefull || 'Community'
})

const groupProfile = computed(() => {
  return group.value?.profile || null
})
</script>

<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins/_breakpoints';

.birthday-donate-hero {
  position: relative;
  min-height: 80vh;
  display: flex;
  align-items: center;
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
}
.balloon-2 {
  left: 88%;
  top: 25%;
}
.balloon-3 {
  left: 15%;
  top: 70%;
}
.balloon-4 {
  left: 75%;
  top: 10%;
}
.balloon-5 {
  left: 92%;
  top: 60%;
}
.balloon-6 {
  left: 3%;
  top: 50%;
}
.balloon-7 {
  left: 70%;
  top: 85%;
}
.balloon-8 {
  left: 25%;
  top: 35%;
}
.balloon-9 {
  left: 50%;
  top: 85%;
}
.balloon-10 {
  left: 95%;
  top: 40%;
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
  animation: cakeFloat var(--duration) infinite ease-in-out;
  animation-delay: var(--delay);
}

.cake-1 {
  left: 12%;
  top: 20%;
}
.cake-2 {
  left: 82%;
  top: 55%;
}
.cake-3 {
  left: 35%;
  top: 75%;
}
.cake-4 {
  left: 65%;
  top: 30%;
}
.cake-5 {
  left: 18%;
  top: 60%;
}
.cake-6 {
  left: 85%;
  top: 15%;
}
.cake-7 {
  left: 45%;
  top: 10%;
}
.cake-8 {
  left: 8%;
  top: 80%;
}

@keyframes cakeFloat {
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

.hero-content {
  position: relative;
  z-index: 100;
  width: 100%;
}

.celebration-header {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 30px;
  padding: 3rem 2rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  max-width: 800px;
  margin: 0 auto;
}

.birthday-message {
  text-align: center;
}

.age-area {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  min-height: 200px;
}

.age-decorations {
  position: relative;
  width: 150px;
  height: 200px;

  &.left {
    margin-right: 2rem;
  }

  &.right {
    margin-left: 2rem;
  }
}

/* Mini balloons around age badge - using balloon float animation */
.balloon-mini {
  position: absolute;
  font-size: 1.5rem;
  animation: balloonFloat var(--duration, 6s) infinite ease-in-out;
  animation-delay: var(--delay, 0s);

  &.balloon-mini-1 {
    top: 20%;
    left: 10%;
    --delay: 0.2s;
    --duration: 5.8s;
  }

  &.balloon-mini-2 {
    top: 60%;
    left: 70%;
    --delay: 1.3s;
    --duration: 6.2s;
  }

  &.balloon-mini-3 {
    top: 25%;
    right: 15%;
    --delay: 0.8s;
    --duration: 5.5s;
  }

  &.balloon-mini-4 {
    top: 65%;
    right: 60%;
    --delay: 1.8s;
    --duration: 6.4s;
  }
}

/* Mini party poppers around age badge - using party popper animation */
.popper-mini {
  position: absolute;
  font-size: 1.2rem;
  animation: popperExplode var(--duration, 4s) infinite ease-out;
  animation-delay: var(--delay, 0s);

  &.popper-mini-1 {
    top: 35%;
    left: 40%;
    --delay: 0.5s;
    --duration: 4.2s;
  }

  &.popper-mini-2 {
    top: 40%;
    right: 35%;
    --delay: 2.3s;
    --duration: 3.8s;
  }
}

/* Mini cakes around age badge - using cake float animation */
.cake-mini {
  position: absolute;
  font-size: 1.3rem;
  animation: cakeFloat var(--duration) infinite ease-in-out;
  animation-delay: var(--delay);

  &.cake-mini-1 {
    top: 75%;
    left: 25%;
    --delay: 1.2s;
    --duration: 7.8s;
  }

  &.cake-mini-2 {
    top: 10%;
    right: 25%;
    --delay: 3.5s;
    --duration: 8.3s;
  }
}

/* Mini logos around age badge - using logo float animation */
.logo-mini {
  position: absolute;
  animation: logoFloat var(--duration, 8s) infinite ease-in-out;
  animation-delay: var(--delay, 0s);
  opacity: 0.8;

  &.logo-mini-1 {
    top: 45%;
    left: 5%;
    --delay: 2.1s;
    --duration: 7.5s;
  }

  &.logo-mini-2 {
    top: 50%;
    right: 5%;
    --delay: 4.3s;
    --duration: 8.1s;
  }
}

.logo-img-mini {
  width: 15px;
  height: 15px;
  filter: brightness(1.1) saturate(1.2);
}

/* Mini group logos around age badge - using enhanced logo float animation */
.group-logo-mini {
  position: absolute;
  animation: groupLogoFloat var(--duration, 6s) infinite ease-in-out;
  animation-delay: var(--delay, 0s);
  opacity: 0.8;

  &.group-logo-mini-1 {
    top: 20%;
    left: 35%;
    --delay: 0.8s;
    --duration: 5.5s;
  }

  &.group-logo-mini-2 {
    top: 65%;
    right: 35%;
    --delay: 2.5s;
    --duration: 6.2s;
  }
}

.group-logo-img-mini {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  filter: brightness(1.1) saturate(1.2);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

@keyframes groupLogoFloat {
  0%,
  100% {
    transform: translateY(0px) translateX(0px) rotate(0deg) scale(1);
    opacity: 0.7;
  }
  10% {
    transform: translateY(-25px) translateX(15px) rotate(60deg) scale(1.4);
    opacity: 0.9;
  }
  20% {
    transform: translateY(-45px) translateX(25px) rotate(120deg) scale(0.6);
    opacity: 0.8;
  }
  30% {
    transform: translateY(-35px) translateX(-10px) rotate(180deg) scale(1.6);
    opacity: 0.5;
  }
  40% {
    transform: translateY(-55px) translateX(-30px) rotate(240deg) scale(0.4);
    opacity: 0.6;
  }
  50% {
    transform: translateY(-65px) translateX(5px) rotate(300deg) scale(1.8);
    opacity: 0.8;
  }
  60% {
    transform: translateY(-50px) translateX(20px) rotate(360deg) scale(0.5);
    opacity: 0.7;
  }
  70% {
    transform: translateY(-40px) translateX(-15px) rotate(420deg) scale(1.5);
    opacity: 0.9;
  }
  80% {
    transform: translateY(-30px) translateX(10px) rotate(480deg) scale(0.7);
    opacity: 0.6;
  }
  90% {
    transform: translateY(-20px) translateX(-5px) rotate(540deg) scale(1.3);
    opacity: 0.8;
  }
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

/* Thank You Message Styles */
.thank-you-message {
  text-align: center;
  padding: 2rem 0;
}

/* Thank You Cake Slice Graphic */
.cake-slice-container {
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
}

.cake-slice-graphic {
  max-width: 200px;
  height: auto;
}

.thank-you-icon {
  margin-bottom: 2rem;
}

.heart-icon {
  font-size: 4rem;
  color: #e53e3e;
  animation: heartBeat 1.5s infinite;
}

@keyframes heartBeat {
  0% {
    transform: scale(1);
  }
  14% {
    transform: scale(1.2);
  }
  28% {
    transform: scale(1);
  }
  42% {
    transform: scale(1.2);
  }
  70% {
    transform: scale(1);
  }
}

.thank-you-title {
  font-size: 3.5rem;
  font-weight: bold;
  color: #2d3748;
  margin-bottom: 1.5rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

.thank-you-subtitle {
  font-size: 1.5rem;
  color: #4a5568;
  margin-bottom: 2rem;
}

.thank-you-details {
  background: rgba(248, 250, 252, 0.8);
  border-radius: 15px;
  padding: 2rem;
  margin-top: 2rem;
}

.thank-you-details p {
  font-size: 1.2rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.thank-you-details p:last-child {
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

/* Responsive Design */
@include media-breakpoint-down(md) {
  .birthday-title,
  .thank-you-title {
    font-size: 2.5rem;
  }

  .cta-heading {
    font-size: 2rem;
  }

  .celebration-header {
    padding: 2rem 1.5rem;
  }

  .age-area {
    flex-direction: column;
    min-height: 150px;
  }

  .age-decorations {
    width: 100px;
    height: 120px;

    &.left {
      margin-right: 1rem;
    }

    &.right {
      margin-left: 1rem;
    }
  }

  /* Reduce animated elements on medium and smaller screens */
  .balloon-7,
  .balloon-8,
  .balloon-9,
  .balloon-10 {
    display: none;
  }
  .cake-7,
  .cake-8 {
    display: none;
  }
  .popper-3 {
    display: none;
  }
}

@include media-breakpoint-down(sm) {
  .age-number {
    font-size: 1.8rem;
  }

  .birthday-title,
  .thank-you-title {
    font-size: 2rem;
  }

  .birthday-subtitle,
  .thank-you-subtitle {
    font-size: 1.2rem;
  }

  .cta-heading {
    font-size: 1.8rem;
  }

  .age-area {
    flex-direction: row;
    justify-content: center;
    align-items: center;
    min-height: 120px;
  }

  .age-decorations {
    width: 80px;
    height: 100px;

    &.left {
      margin-right: 0.5rem;
    }

    &.right {
      margin-left: 0.5rem;
    }
  }

  /* Scale down animation elements for small screens but keep them visible */
  .balloon-mini {
    font-size: 1.2rem;
  }

  .popper-mini {
    font-size: 1rem;
  }

  .cake-mini {
    font-size: 1.1rem;
  }

  .logo-img-mini {
    width: 12px;
    height: 12px;
  }

  .group-logo-img-mini {
    width: 28px;
    height: 28px;
  }

  /* Further reduce background animated elements on small screens */
  .balloon-4,
  .balloon-5,
  .balloon-6 {
    display: none;
  }
  .cake-5,
  .cake-6 {
    display: none;
  }
}
</style>
