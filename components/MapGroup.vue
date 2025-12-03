<template>
  <div v-if="group && group.onmap">
    <div class="layout">
      <div class="profile">
        <GroupProfileImage
          :image="group.profile ? group.profile : '/icon.png'"
          :alt-text="'Profile picture for ' + group.namedisplay"
        />
      </div>
      <div class="content">
        <nuxt-link
          no-prefetch
          :to="'/explore/' + group.nameshort"
          class="name font-weight-bold"
        >
          {{ group.namedisplay }}
        </nuxt-link>
        <div v-if="group.tagline" class="tagline text-muted small">
          {{ group.tagline }}
        </div>
        <ExternalLink
          :href="'mailto:' + group.modsemail"
          class="text-muted small nodecor"
        >
          <v-icon icon="envelope" title="Contact volunteers" class="fa-0-8x" />
          Contact volunteers
        </ExternalLink>
      </div>
      <div class="actions">
        <b-button
          v-if="!oneOfMyGroups(group.id)"
          variant="primary"
          size="sm"
          :to="'/explore/join/' + group.id"
        >
          Join
        </b-button>
        <b-button
          variant="secondary"
          size="sm"
          :to="'/explore/' + group.nameshort"
        >
          Explore
        </b-button>
      </div>
    </div>
    <hr class="text-muted mt-0 mb-2" />
  </div>
</template>
<script setup>
import { computed } from 'vue'
import ExternalLink from './ExternalLink'
import GroupProfileImage from './GroupProfileImage'
import { useGroupStore } from '~/stores/group'
import { useMe } from '~/composables/useMe'

const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
})

const groupStore = useGroupStore()
const { oneOfMyGroups } = useMe()

// Fetch the full group so that we get the tagline.
groupStore.fetch(props.id, true)

const group = computed(() => {
  return groupStore?.get(props.id)
})
</script>
<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins/_breakpoints';

.layout {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.5rem;

  .profile {
    flex-shrink: 0;

    :deep(.img-thumbnail) {
      width: 50px;
      height: 50px;
    }
  }

  .content {
    flex: 1;
    min-width: 0;

    .name {
      display: block;
      line-height: 1.2;
    }

    .tagline {
      line-height: 1.2;
      margin-bottom: 0.25rem;
    }
  }

  .actions {
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;

    @include media-breakpoint-up(md) {
      flex-direction: row;
      gap: 0.5rem;
    }
  }
}
</style>
