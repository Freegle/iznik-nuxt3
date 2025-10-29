<template>
  <div v-if="group && group.onmap">
    <div class="layout">
      <div class="profile">
        <GroupProfileImage
          :image="group.profile ? group.profile : '/icon.png'"
          :alt-text="'Profile picture for ' + group.namedisplay"
        />
      </div>
      <nuxt-link
        no-prefetch
        :to="'/explore/' + group.nameshort"
        class="name font-weight-bold"
      >
        {{ group.namedisplay }}
      </nuxt-link>
      <div class="tagline">
        <div v-if="group.tagline">
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
      <div class="join">
        <div>
          <b-button
            v-if="!oneOfMyGroups(group.id)"
            variant="primary"
            :to="'/explore/join/' + group.id"
          >
            Join
          </b-button>
        </div>
      </div>
      <div class="explore">
        <div>
          <b-button variant="secondary" :to="'/explore/' + group.nameshort">
            Explore
          </b-button>
        </div>
      </div>
    </div>
    <hr class="text-muted mt-0" />
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
  display: grid;
  grid-template-columns: 1fr 3fr 1fr;
  grid-template-rows: auto auto auto auto;
  grid-column-gap: 0.5rem;
  grid-row-gap: 0.5rem;

  .profile {
    grid-column: 1 / 2;
    grid-row: 1 / 3;
    margin-left: 0.5rem;

    :deep(.img-thumbnail) {
      max-width: unset;
    }
  }

  .name {
    grid-column: 2 / 4;
    grid-row: 1 / 2;

    @include media-breakpoint-up(lg) {
      grid-column: 2 / 3;
    }
  }

  .tagline {
    grid-column: 2 / 4;
    grid-row: 2 / 3;

    @include media-breakpoint-up(lg) {
      grid-column: 2 / 3;
    }
  }

  .join {
    grid-column: 1 / 2;
    grid-row: 3 / 4;
    margin-left: 0.5rem;

    @include media-breakpoint-up(lg) {
      grid-column: 3 / 4;
      grid-row: 1 / 2;
      margin-left: unset;
      margin-right: 0.5rem;
      display: flex;
      justify-content: flex-end;
    }
  }

  .explore {
    grid-column: 3 / 4;
    grid-row: 3 / 4;
    margin-right: 0.5rem;
    display: flex;
    justify-content: flex-end;

    @include media-breakpoint-up(lg) {
      grid-column: 3 / 4;
      grid-row: 2 / 3;
    }
  }
}
</style>
