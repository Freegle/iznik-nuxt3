<template>
  <!-- Mobile Layout -->
  <div class="d-block d-md-none mobile-group-header">
    <div class="mobile-hero">
      <div class="mobile-hero__content">
        <b-img
          rounded
          alt="Community profile picture"
          :src="group.profile ? group.profile : '/icon.png'"
          class="mobile-hero__logo"
        />
        <div class="mobile-hero__info">
          <h1 class="mobile-hero__title">
            {{ group.namedisplay }}
            <v-icon
              v-if="amAMember === 'Owner' || amAMember === 'Moderator'"
              icon="crown"
              class="text-success"
            />
          </h1>
          <p v-if="group.tagline" class="mobile-hero__tagline">
            {{ group.tagline }}
          </p>
        </div>
      </div>
      <div v-if="group.membercount" class="mobile-hero__stats">
        <span class="mobile-hero__stat">
          <v-icon icon="users" class="me-1" />
          {{ group.membercount.toLocaleString() }} freeglers
        </span>
        <span v-if="group.founded" class="mobile-hero__stat">
          <v-icon icon="calendar" class="me-1" />
          Since&nbsp;<DateFormatted :value="group.founded" format="dateonly" />
        </span>
      </div>
    </div>

    <div class="mobile-actions">
      <SpinButton
        v-if="!amAMember"
        icon-name="plus"
        variant="primary"
        class="mobile-actions__join"
        label="Join community"
        @handle="join"
      />
      <SpinButton
        v-if="amAMember === 'Member'"
        icon-name="trash-alt"
        variant="white"
        class="mobile-actions__leave"
        label="Leave"
        @handle="leave"
      />
    </div>

    <div v-if="showGiveFind" class="mobile-give-find">
      <NuxtLink to="/give" class="mobile-btn mobile-btn--give">
        <v-icon icon="gift" class="me-2" />Give stuff
      </NuxtLink>
      <NuxtLink to="/find" class="mobile-btn mobile-btn--find">
        <v-icon icon="search" class="me-2" />Find stuff
      </NuxtLink>
    </div>

    <div class="mobile-description">
      <p v-if="!description">
        Give and get stuff for free with {{ group.namedisplay }}. Offer things
        you don't need, and ask for things you'd like.
      </p>
      <!-- eslint-disable-next-line -->
      <span v-else v-html="description"/>
    </div>

    <div class="mobile-links">
      <nuxt-link no-prefetch :to="{ path: '/communityevents/' + group.id }">
        <v-icon icon="calendar-alt" class="me-1" />Events
      </nuxt-link>
      <nuxt-link no-prefetch :to="{ path: '/volunteerings/' + group.id }">
        <v-icon icon="hands-helping" class="me-1" />Volunteer
      </nuxt-link>
      <nuxt-link no-prefetch :to="{ path: '/stories/' + group.id }">
        <v-icon icon="book-open" class="me-1" />Stories
      </nuxt-link>
      <nuxt-link no-prefetch :to="{ path: '/stats/' + group.nameshort }">
        <v-icon icon="chart-bar" class="me-1" />Stats
      </nuxt-link>
    </div>

    <div class="mobile-volunteers">
      <p class="mobile-volunteers__label">Questions? Contact our volunteers:</p>
      <div class="mobile-volunteers__list">
        <ExternalLink v-if="!me" :href="'mailto:' + group.modsemail">
          <span class="btn btn-sm btn-outline-success">Contact</span>
        </ExternalLink>
        <ChatButton
          v-else
          :groupid="group.id"
          title="Contact"
          chattype="User2Mod"
          variant="outline-success"
          size="sm"
        />
        <div
          v-if="group.showmods && group.showmods.length"
          class="mobile-volunteers__avatars"
        >
          <template v-if="!me">
            <GroupShowMod
              v-for="mod in group.showmods"
              :key="'showmod-' + mod.id"
              :modtoshow="mod"
              class="mobile-volunteers__avatar"
            />
          </template>
          <template v-else>
            <ChatButton
              v-for="mod in group.showmods"
              :key="'showmod-' + mod.id"
              :groupid="group.id"
              chattype="User2Mod"
            >
              <GroupShowMod
                :modtoshow="mod"
                class="mobile-volunteers__avatar"
              />
            </ChatButton>
          </template>
        </div>
      </div>
    </div>

    <div v-if="group.sponsors" class="mobile-sponsors">
      <div
        v-for="sponsor in group.sponsors"
        :key="'sponsor-' + sponsor.id"
        class="mobile-sponsor"
      >
        <SponsorLogo
          :image="sponsor.imageurl"
          :alt-text="'Sponsor logo for ' + sponsor.name"
          class="mobile-sponsor__logo"
        />
        <div class="mobile-sponsor__info">
          <span class="mobile-sponsor__label">Sponsored by</span>
          <ExternalLink :href="sponsor.linkurl">{{
            sponsor.name
          }}</ExternalLink>
        </div>
      </div>
    </div>
  </div>

  <!-- Desktop Layout (original) -->
  <b-card bg-light class="d-none d-md-block">
    <div class="group mb-3">
      <div class="group__image">
        <b-img
          rounded
          thumbnail
          alt="Community profile picture"
          :src="group.profile ? group.profile : '/icon.png'"
          width="100"
          height="100"
        />
      </div>
      <div class="group__title">
        <b-card-title>
          {{ group.namedisplay }}
          <v-icon
            v-if="amAMember === 'Owner' || amAMember === 'Moderator'"
            icon="crown"
            class="text-success"
            :title="'You have role ' + amAMember"
          />
        </b-card-title>
        <b-card-subtitle>{{ group.tagline }}</b-card-subtitle>
        <div v-if="group.membercount && group.founded" class="text-muted small">
          Founded <DateFormatted :value="group.founded" format="dateonly" />.
          {{ group.membercount.toLocaleString() }} current freeglers.
        </div>
      </div>
      <div class="group__links text-muted small">
        See
        <!--eslint-disable-next-line-->
        <nuxt-link no-prefetch :to="{ path: '/communityevents/' + group.id }">community events</nuxt-link>,
        <!--eslint-disable-next-line-->
        <nuxt-link no-prefetch :to="{ path: '/volunteerings/' + group.id }">volunteer opportunities</nuxt-link>,
        <!--eslint-disable-next-line-->
        <nuxt-link no-prefetch :to="{ path: '/stories/' + group.id }">stories</nuxt-link>, or
        <!--eslint-disable-next-line-->
        <nuxt-link no-prefetch :to="{ path: '/stats/' + group.nameshort }">stats</nuxt-link>
      </div>
      <div class="mt-2 group__buttons">
        <div class="button__items">
          <SpinButton
            v-if="!amAMember"
            icon-name="plus"
            variant="primary"
            class="mb-1 ms-1"
            label="Join this community"
            @handle="join"
          />
          <SpinButton
            v-if="amAMember === 'Member'"
            icon-name="trash-alt"
            variant="white"
            class="mb-1 ms-1"
            label="Leave"
            @handle="leave"
          />
        </div>
      </div>
    </div>
    <div class="group-description">
      <p v-if="!description">
        Give and get stuff for free with {{ group.namedisplay }}. Offer things
        you don't need, and ask for things you'd like. Don't just recycle -
        reuse with Freegle!
      </p>
      <!-- eslint-disable-next-line -->
      <span v-else="description" v-html="description"/>
    </div>
    <div v-if="showGiveFind" class="d-flex justify-content-between flex-wrap">
      <b-button to="/give" class="mt-1" size="lg" block variant="primary">
        <v-icon icon="gift" />&nbsp;Give stuff
      </b-button>
      <b-button to="/find" class="mt-1" size="lg" block variant="secondary">
        <v-icon icon="shopping-cart" />&nbsp;Ask for stuff
      </b-button>
    </div>
    <div>
      <hr class="mt-2" />
      <h2 class="header--size5 mb-3">
        If you have questions, you can contact our lovely local volunteers here:
      </h2>
      <ExternalLink v-if="!me" :href="'mailto:' + group.modsemail">
        <span class="btn btn-white mb-3"> Contact&nbsp;volunteers </span>
        <div
          v-if="group.showmods && group.showmods.length"
          class="d-flex flex-wrap justify-content-start"
        >
          <GroupShowMod
            v-for="mod in group.showmods"
            :key="'showmod-' + mod.id"
            :modtoshow="mod"
            class="ms-1"
          />
        </div>
      </ExternalLink>
      <div v-else>
        <ChatButton
          :groupid="group.id"
          title="Contact Volunteers"
          chattype="User2Mod"
          variant="white"
        />
        <div
          v-if="group.showmods && group.showmods.length"
          class="d-flex flex-wrap justify-content-start mt-3"
        >
          <ChatButton
            v-for="mod in group.showmods"
            :key="'showmod-' + mod.id"
            :groupid="group.id"
            chattype="User2Mod"
          >
            <GroupShowMod :modtoshow="mod" class="ms-1" />
          </ChatButton>
        </div>
      </div>
    </div>
    <div
      v-if="group.sponsors"
      class="d-flex flex-wrap justify-content-between mt-1"
    >
      <b-card
        v-for="sponsor in group.sponsors"
        :key="'sponsor-' + sponsor.id"
        no-body
        class="max"
      >
        <b-card-body sub-title="" class="p-1">
          <div class="d-flex">
            <SponsorLogo
              :image="sponsor.imageurl"
              :alt-text="'Sponsor logo for ' + sponsor.name"
            />
            <div class="ms-2">
              <p class="small text-muted">
                This community is kindly sponsored by:
              </p>
              <ExternalLink :href="sponsor.linkurl">
                {{ sponsor.name }}
              </ExternalLink>
              <div v-if="sponsor.tagline" class="font-weight-bold">
                {{ sponsor.tagline }}
              </div>
            </div>
          </div>
          <!-- eslint-disable-next-line -->
          <div v-if="sponsor.description" class="small text-wrap" v-html="sponsor.description" />
        </b-card-body>
      </b-card>
    </div>
  </b-card>
</template>
<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import SpinButton from './SpinButton'
import ChatButton from '~/components/ChatButton'
import { useAuthStore } from '~/stores/auth'

const props = defineProps({
  group: {
    type: Object,
    required: true,
  },
  showJoin: {
    type: Boolean,
    required: true,
  },
  showGiveFind: {
    type: Boolean,
    required: false,
    default: false,
  },
})

const router = useRouter()
const authStore = useAuthStore()
const me = computed(() => authStore?.user)
const myid = computed(() => authStore?.user?.id)

// Computed properties
const amAMember = computed(() => {
  return authStore?.member(props.group?.id)
})

const description = computed(() => {
  let desc = props.group?.description

  if (desc) {
    // Remove some whitespace which appears in some group descriptions.
    desc = desc.replace(/<p><br><\/p>/g, '')
    desc = desc.replace(/<p><\/p>/g, '')
  }

  return desc
})

// Methods
async function leave(callback) {
  await authStore.leaveGroup(myid.value, props.group.id)
  callback()
}

async function join(callback) {
  if (!me.value) {
    // We need to force them to log in.
    callback()
    router.push('/explore/join/' + props.group.id)
  } else {
    await authStore.joinGroup(myid.value, props.group.id, true)
    callback()
  }
}
</script>

<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins/_breakpoints';
@import 'assets/css/_color-vars.scss';

.img-thumbnail {
  margin-bottom: 20px;
}

.group-description {
  max-height: 300px;
  overflow-y: auto;
}

.group {
  display: grid;

  grid-template-columns: 40% auto;

  @include media-breakpoint-up(sm) {
    grid-template-columns: 30% auto;
  }

  @include media-breakpoint-up(md) {
    grid-template-columns: 15% auto 36%;
  }

  @include media-breakpoint-up(lg) {
    grid-template-columns: 25% auto;
  }

  @include media-breakpoint-up(xl) {
    grid-template-columns: 15% auto 36%;
  }
}

.group__image {
  grid-column: 1 / 2;
  grid-row: 1 / 2;

  padding-right: 15px;

  @include media-breakpoint-up(sm) {
    grid-row: 1 / 4;
    width: unset !important;
    height: unset !important;
  }

  @include media-breakpoint-up(md) {
    grid-row: 1 / 3;
    width: unset !important;
    height: unset !important;
  }

  @include media-breakpoint-up(lg) {
    grid-row: 1 / 2;
    width: unset !important;
    height: unset !important;
  }

  @include media-breakpoint-up(xl) {
    grid-row: 1 / 3;
    width: unset !important;
    height: unset !important;
  }
}

.group__title {
  grid-column: 2 / 3;
  grid-row: 1 / 2;
}

.group__links {
  grid-column: 1 / 3;
  grid-row: 2 / 3;

  @include media-breakpoint-up(sm) {
    grid-column: 2 / 3;
    grid-row: 2 / 3;
  }

  @include media-breakpoint-up(lg) {
    grid-column: 1 / 3;
    grid-row: 2 / 3;
  }

  @include media-breakpoint-up(xl) {
    grid-column: 2 / 3;
    grid-row: 2 / 3;
  }
}

.group__buttons {
  grid-column: 1 / 3;
  grid-row: 3 / 4;
  justify-self: start;

  @include media-breakpoint-up(sm) {
    grid-column: 2 / 3;
    justify-self: start;
  }

  @include media-breakpoint-up(md) {
    grid-column: 3 / 4;
    grid-row: 1 / 3;
    justify-self: end;
  }

  @include media-breakpoint-up(lg) {
    grid-column: 1 / 3;
    grid-row: 3 / 4;
    justify-self: start;
  }

  @include media-breakpoint-up(xl) {
    grid-column: 3 / 4;
    grid-row: 1 / 2;
    justify-self: end;
  }
}

.button__items {
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;

  @include media-breakpoint-up(sm) {
    justify-content: flex-start;
  }

  @include media-breakpoint-up(md) {
    justify-content: flex-end;
  }

  @include media-breakpoint-up(lg) {
    justify-content: flex-start;
  }

  @include media-breakpoint-up(xl) {
    justify-content: flex-end;
  }
}

.max {
  max-width: 100%;

  @include media-breakpoint-up(md) {
    max-width: 400px;
  }
}

// Mobile Layout Styles
.mobile-group-header {
  background: $color-white;
  padding: 0.75rem;
}

.mobile-hero {
  margin-bottom: 0.75rem;
}

.mobile-hero__content {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
}

.mobile-hero__logo {
  width: 60px;
  height: 60px;
  flex-shrink: 0;
  object-fit: cover;
}

.mobile-hero__info {
  flex: 1;
  min-width: 0;
}

.mobile-hero__title {
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0 0 0.25rem 0;
  color: $colour-header;
  line-height: 1.2;
}

.mobile-hero__tagline {
  font-size: 0.85rem;
  color: $color-gray--darker;
  margin: 0;
  line-height: 1.3;
}

.mobile-hero__stats {
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
  flex-wrap: wrap;
}

.mobile-hero__stat {
  font-size: 0.75rem;
  color: $color-gray--dark;
  display: flex;
  align-items: center;
}

.mobile-actions {
  margin-bottom: 0.75rem;

  &__join,
  &__leave {
    width: 100%;
  }
}

.mobile-give-find {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.mobile-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.6rem 1rem;
  font-size: 0.9rem;
  font-weight: 600;
  text-decoration: none;
  transition: transform 0.1s;

  &:active {
    transform: scale(0.98);
  }

  &--give {
    background: $colour-success;
    color: $color-white;

    &:hover {
      background: darken($colour-success, 5%);
      color: $color-white;
    }
  }

  &--find {
    background: $colour-secondary;
    color: $color-white;

    &:hover {
      background: darken($colour-secondary, 5%);
      color: $color-white;
    }
  }
}

.mobile-description {
  font-size: 0.85rem;
  color: $color-gray--darker;
  margin-bottom: 0.75rem;
  line-height: 1.4;

  p {
    margin: 0;
  }

  :deep(p) {
    margin-bottom: 0.5rem;

    &:last-child {
      margin-bottom: 0;
    }
  }
}

.mobile-links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  padding: 0.5rem 0;
  border-top: 1px solid $color-gray--light;
  border-bottom: 1px solid $color-gray--light;

  a {
    font-size: 0.8rem;
    color: $colour-success;
    text-decoration: none;
    display: flex;
    align-items: center;
    padding: 0.25rem 0.5rem;
    background: rgba($colour-success, 0.08);

    &:hover {
      background: rgba($colour-success, 0.15);
    }
  }
}

.mobile-volunteers {
  margin-bottom: 0.75rem;

  &__label {
    font-size: 0.8rem;
    color: $color-gray--dark;
    margin: 0 0 0.5rem 0;
  }

  &__list {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  &__avatars {
    display: flex;
    gap: 0.25rem;
  }

  &__avatar {
    width: 32px;
    height: 32px;
  }
}

.mobile-sponsors {
  padding-top: 0.5rem;
  border-top: 1px solid $color-gray--light;
}

.mobile-sponsor {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0;

  &__logo {
    width: 40px;
    height: 40px;
    object-fit: contain;
  }

  &__info {
    font-size: 0.8rem;
  }

  &__label {
    color: $color-gray--dark;
    display: block;
  }
}
</style>
