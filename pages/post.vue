<template>
  <div class="post-choose-page">
    <div class="page-header">
      <h1 class="page-title">What would you like to do?</h1>
    </div>

    <div class="options-container">
      <!-- Offer -->
      <div class="option-card offer-card" @click="goto('/give')">
        <div class="icon-wrapper offer-icon">
          <v-icon icon="gift" />
        </div>
        <div class="option-content">
          <h3 class="option-title">Offer something</h3>
          <p class="option-description">
            Give away items you no longer need to someone nearby.
          </p>
        </div>
        <v-icon icon="chevron-right" class="chevron" />
      </div>

      <!-- Wanted -->
      <div class="option-card wanted-card" @click="goto('/find')">
        <div class="icon-wrapper wanted-icon">
          <v-icon icon="search" />
        </div>
        <div class="option-content">
          <h3 class="option-title">Find something</h3>
          <p class="option-description">
            Ask the community and see if anyone has one spare.
          </p>
        </div>
        <v-icon icon="chevron-right" class="chevron" />
      </div>

      <!-- ChitChat -->
      <div class="option-card chitchat-card" @click="goto('/chitchat')">
        <div class="icon-wrapper chitchat-icon">
          <v-icon icon="comments" />
        </div>
        <div class="option-content">
          <h3 class="option-title">ChitChat</h3>
          <p class="option-description">
            Chat with other freeglers in your community.
          </p>
        </div>
        <v-icon icon="chevron-right" class="chevron" />
      </div>

      <!-- Event -->
      <div class="option-card event-card" @click="goto('/communityevents')">
        <div class="icon-wrapper event-icon">
          <v-icon icon="calendar-alt" />
        </div>
        <div class="option-content">
          <h3 class="option-title">Community Event</h3>
          <p class="option-description">
            Share or find local events happening near you.
          </p>
        </div>
        <v-icon icon="chevron-right" class="chevron" />
      </div>

      <!-- Volunteering -->
      <div class="option-card volunteer-card" @click="goto('/volunteerings')">
        <div class="icon-wrapper volunteer-icon">
          <v-icon icon="hands-helping" />
        </div>
        <div class="option-content">
          <h3 class="option-title">Volunteering</h3>
          <p class="option-description">
            Find or share volunteering opportunities.
          </p>
        </div>
        <v-icon icon="chevron-right" class="chevron" />
      </div>
    </div>
  </div>
</template>
<script setup>
import { useRouter } from '#imports'

const router = useRouter()

function goto(path) {
  router.push(path)
}
</script>
<style scoped lang="scss">
@import 'assets/css/_color-vars.scss';

.post-choose-page {
  min-height: 100vh;
  background: linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%);
  padding-bottom: 2rem;
}

.page-header {
  padding: 1.5rem 1rem 1rem;
  text-align: center;
}

.page-title {
  font-size: 1.4rem;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.options-container {
  padding: 0 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.option-card {
  display: flex;
  align-items: center;
  background: white;
  border-radius: 16px;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:active {
    transform: scale(0.98);
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  }
}

.icon-wrapper {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 1.4rem;
  color: white;
}

.offer-icon {
  background: linear-gradient(135deg, #4caf50 0%, #66bb6a 100%);
}

.wanted-icon {
  background: linear-gradient(135deg, #2196f3 0%, #42a5f5 100%);
}

.chitchat-icon {
  background: linear-gradient(135deg, #9c27b0 0%, #ab47bc 100%);
}

.event-icon {
  background: linear-gradient(135deg, #ff9800 0%, #ffb74d 100%);
}

.volunteer-icon {
  background: linear-gradient(135deg, #e91e63 0%, #f06292 100%);
}

.option-content {
  flex: 1;
  padding: 0 0.75rem;
  min-width: 0;
}

.option-title {
  font-size: 1rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 0.25rem;
}

.option-description {
  font-size: 0.8rem;
  color: #666;
  margin: 0;
  line-height: 1.3;
}

.chevron {
  color: #ccc;
  font-size: 1rem;
  flex-shrink: 0;
}
</style>
