<template>
  <div class="item header--size4">
    <h3 class="m-0 d-flex justify-content-between">
      <div class="w-100">
        <div>
          {{ type }}
        </div>
        <Highlighter
          v-if="matchedon"
          :search-words="[String(matchedon.word)]"
          :text-to-highlight="item"
          highlight-class-name="highlight"
          auto-escape
          class="item"
        />
        <span
          v-else
          :class="{
            item: true,
            nowrap: !expanded,
          }"
          itemprop="name"
        >
          <a
            class="nodecor text-wrap item"
            :href="'/message/' + id"
            @click="block"
            >{{ item }}</a
          >
        </span>
      </div>
      <div>
        <client-only>
          <b-badge
            v-if="message && message.availablenow > 1"
            variant="info"
            class="ms-2 me-2 mt-0 align-top"
          >
            {{ message.availablenow ? message.availablenow : '0' }} left
          </b-badge>
        </client-only>
      </div>
    </h3>
    <div class="spacer" />
    <div v-if="showLocation" class="location text-truncate">
      {{ location }}
    </div>
  </div>
</template>
<script setup>
import Highlighter from 'vue-highlight-words'
import { computed } from '#imports'
import { useMessageStore } from '~/stores/message'
import { twem } from '~/composables/useTwem'

const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
  matchedon: {
    type: Object,
    required: false,
    default: null,
  },
  type: {
    type: String,
    required: false,
    default: null,
  },
  expanded: {
    type: Boolean,
    required: false,
    default: false,
  },
  showLocation: {
    type: Boolean,
    required: false,
    default: true,
  },
})

const messageStore = useMessageStore()

// Computed properties
const message = computed(() => {
  return messageStore?.byId(props.id)
})

const subject = computed(() => {
  return message.value ? message.value.subject : null
})

const item = computed(() => {
  let ret = subject.value

  if (subject.value) {
    const matches = /(.*?):([^)].*)\((.*)\)/.exec(subject.value)

    if (matches && matches.length > 0 && matches[2].length > 0) {
      ret = matches[2]
    }
  }

  return ret ? twem(ret) : 'unknown'
})

const location = computed(() => {
  let ret = null

  if (subject.value) {
    const matches = /(.*?):([^)].*)\((.*)\)/.exec(subject.value)

    if (matches && matches.length > 0 && matches[3].length > 0) {
      ret = matches[3]
    }
  }

  return ret ? twem(ret) : null
})

// Methods
const block = (e) => {
  e.preventDefault()
}
</script>
<style scoped lang="scss">
@import 'bootstrap/scss/_functions';
@import 'bootstrap/scss/_variables';
@import 'bootstrap/scss/mixins/_breakpoints';
@import 'assets/css/message-images.scss';

.item {
  color: $colour-info-fg !important;

  a {
    color: $colour-info-fg !important;
  }

  font-weight: bold !important;
  text-overflow: ellipsis;
  overflow: hidden;
  display: inline-block;

  @media only screen and (max-width: 360px) {
    width: 100%;
  }

  @media only screen and (min-width: 360px) {
    font-size: 1rem;
    width: max($thumbnail-size, calc(50vw - 2rem));
  }

  @include media-breakpoint-up(md) {
    font-size: 1.5rem;
    width: 100%;
  }
}

.nowrap {
  white-space: nowrap;
}

.location {
  color: $color-gray--darker !important;
  font-size: 0.8rem;

  @include media-breakpoint-up(md) {
    font-size: 1.25rem;
  }
}
</style>
