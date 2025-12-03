<template>
  <nuxt-link to="/post" class="fab-link">
    <span class="fab-button">
      <svg viewBox="0 0 24 24" class="fab-icon">
        <path d="M12 4v16M4 12h16" />
      </svg>
    </span>
  </nuxt-link>
</template>
<script setup></script>
<style scoped lang="scss">
@import 'assets/css/_color-vars.scss';

@keyframes fab-entrance {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.15);
  }
  70% {
    transform: scale(0.95);
  }
  85% {
    transform: scale(1.05) rotate(5deg);
  }
  92% {
    transform: scale(1) rotate(-3deg);
  }
  100% {
    transform: scale(1) rotate(0deg);
    opacity: 1;
  }
}

.fab-link {
  display: block;
  text-decoration: none;
}

.fab-button {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(
    145deg,
    lighten($color-green-background, 8%) 0%,
    $color-green-background 50%,
    darken($color-green-background, 5%) 100%
  );
  width: 58px;
  height: 58px;
  border-radius: 50%;
  border: 3px solid white;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.3);
  box-sizing: border-box;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  animation: fab-entrance 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s both;

  &:active {
    transform: scale(0.92);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
  }
}

.fab-icon {
  width: 28px;
  height: 28px;
  fill: none;
  stroke: white;
  stroke-width: 3;
  stroke-linecap: round;
}
</style>
