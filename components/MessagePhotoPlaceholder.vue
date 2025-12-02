<template>
  <div
    class="message-placeholder"
    :class="[placeholderClass, { hidden: hidden }]"
  >
    <div class="placeholder-pattern"></div>
    <div class="icon-circle">
      <v-icon :icon="icon" class="placeholder-icon" />
    </div>
  </div>
</template>

<script setup>
defineProps({
  placeholderClass: {
    type: String,
    required: true,
  },
  icon: {
    type: String,
    required: true,
  },
  hidden: {
    type: Boolean,
    default: false,
  },
})
</script>

<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'assets/css/_color-vars.scss';

.message-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  transition: opacity 0.5s ease-in-out;

  &.hidden {
    opacity: 0;
  }

  &.offer-gradient {
    background: radial-gradient(
        ellipse at 30% 20%,
        rgba(129, 199, 132, 0.9) 0%,
        transparent 50%
      ),
      radial-gradient(
        ellipse at 70% 80%,
        rgba(56, 142, 60, 0.8) 0%,
        transparent 50%
      ),
      linear-gradient(160deg, #66bb6a 0%, #43a047 50%, #2e7d32 100%);
  }

  &.wanted-gradient {
    background: radial-gradient(
        ellipse at 25% 25%,
        rgba(144, 202, 249, 0.9) 0%,
        transparent 45%
      ),
      radial-gradient(
        ellipse at 75% 75%,
        rgba(66, 165, 245, 0.7) 0%,
        transparent 45%
      ),
      linear-gradient(160deg, #64b5f6 0%, #42a5f5 50%, #1e88e5 100%);
  }
}

.placeholder-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='70' height='70' viewBox='0 0 70 70'%3E%3Ctext x='35' y='52' font-family='Arial,sans-serif' font-size='50' font-weight='bold' fill='white' fill-opacity='0.12' text-anchor='middle'%3E?%3C/text%3E%3C/svg%3E");
  background-size: 70px 70px;
}

.icon-circle {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  z-index: 1;
}

.placeholder-icon {
  font-size: 2rem;
  color: rgba(255, 255, 255, 0.9);
}
</style>
