<template>
  <div :class="getClass">
    <!-- eslint-disable-next-line -->
    <span v-if="indent" class="pl-3" /><nuxt-link :to="link" @mousedown.native="click">{{ name }}</nuxt-link>
    <b-badge v-if="count && getCount(count)" :variant="countVariant">
      {{ getCount(count) }}
    </b-badge>
    <b-badge v-if="othercount && getCount(othercount)" variant="info">
      {{ getCount(othercount) }}
    </b-badge>
  </div>
</template>
<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useModMe } from '~/composables/useModMe'

const props = defineProps({
  link: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  count: {
    type: Array,
    required: false,
    default: null,
  },
  othercount: {
    type: Array,
    required: false,
    default: null,
  },
  countVariant: {
    type: String,
    required: false,
    default: 'danger',
  },
  indent: {
    type: Boolean,
    required: false,
    default: false,
  },
})

defineEmits(['mobilehidemenu'])

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const { checkWork } = useModMe()

const work = computed(() => authStore.work)

const getClass = computed(() => {
  let linkmatch = route.path === props.link
  const linklen = props.link.length
  if (linklen > 1 && route.path.substr(0, linklen) === props.link)
    linkmatch = true
  return 'pl-1 ' + (linkmatch ? 'active' : '')
})

function getCount(types) {
  let total = 0

  if (types) {
    for (const key in work.value) {
      if (types.includes(key)) {
        total += work.value[key]
      }
    }
  }

  return total
}

function click(e) {
  if (props.link && e.button === 0) {
    if (route.fullPath === props.link) {
      // Click on current route.  Check for new work.
      e.stopPropagation()
      checkWork(true)
    } else {
      router.push(props.link)
    }
  }
}
</script>

<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins/_breakpoints';

@include media-breakpoint-down(xs) {
  .badge {
    margin-left: 0.3em;
  }
}

.active {
  background-color: $color-blue--light;

  a {
    color: $color-white;
  }
}
</style>
