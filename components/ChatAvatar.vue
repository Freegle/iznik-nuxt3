<template>
  <div class="chat-avatar" :class="{ 'chat-avatar--large': large }">
    <ProfileImage
      :image="icon"
      :name="name"
      class="avatar-image"
      is-thumbnail
      size="lg"
    />
    <div v-if="supporter" class="hero-badge" title="Freegle Supporter">
      <v-icon icon="trophy" />
    </div>
    <div v-if="unreadCount" class="unread-badge">
      {{ unreadCount > 9 ? '9+' : unreadCount }}
    </div>
  </div>
</template>
<script setup>
import ProfileImage from '~/components/ProfileImage'

defineProps({
  icon: {
    type: String,
    default: null,
  },
  name: {
    type: String,
    required: true,
  },
  supporter: {
    type: Boolean,
    default: false,
  },
  unreadCount: {
    type: Number,
    default: 0,
  },
  large: {
    type: Boolean,
    default: false,
  },
})
</script>
<style scoped lang="scss">
@import 'assets/css/_color-vars.scss';

.chat-avatar {
  position: relative;
  flex-shrink: 0;
  width: 56px;
  height: 56px;

  &--large {
    width: 64px;
    height: 64px;
  }
}

// Force ProfileImage to fill the container
:deep(.avatar-image),
:deep(.ProfileImage__container) {
  width: 56px !important;
  height: 56px !important;
  min-width: 56px !important;
  min-height: 56px !important;
  max-width: 56px !important;
  max-height: 56px !important;
}

:deep(.avatar-image img),
:deep(.ProfileImage__container img),
:deep(.ProfileImage__container picture),
:deep(.ProfileImage__container picture img),
:deep(.ProfileImage__container .generated-avatar) {
  width: 56px !important;
  height: 56px !important;
  min-width: 56px !important;
  min-height: 56px !important;
  max-width: 56px !important;
  max-height: 56px !important;
  object-fit: cover;
  border-radius: 50%;
}

.hero-badge {
  position: absolute;
  bottom: -4px;
  right: -4px;
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, #ffd700 0%, #ffa500 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.unread-badge {
  position: absolute;
  top: -2px;
  right: -2px;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  background: #ef5350;
  color: white;
  font-size: 10px;
  font-weight: 600;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid white;
}
</style>
