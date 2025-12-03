<template>
  <div
    :class="{
      inline: inline,
      tagbadge: true,
      tagdef: def,
      'tagbadge--wanted': isWanted,
      'font-weight-bold': true,
      forcebreak: true,
      'text-wrap': true,
      'text-start': true,
    }"
  >
    {{ tagForGroup }}
  </div>
</template>
<script setup>
import { computed, onMounted } from 'vue'
import { useGroupStore } from '~/stores/group'
import { useMessageStore } from '~/stores/message'

const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
  def: {
    type: Boolean,
    required: false,
    default: false,
  },
  inline: {
    type: Boolean,
    required: false,
    default: false,
  },
})

const messageStore = useMessageStore()
const groupStore = useGroupStore()

// Fetch data on mount
onMounted(async () => {
  const message = await messageStore.fetch(props.id)
  const fetching = []

  if (message?.groups) {
    message.groups.forEach((group) => {
      fetching.push(groupStore.fetch(group.groupid))
    })
  }

  await Promise.all(fetching)
})

const message = computed(() => {
  return messageStore?.byId(props.id)
})

const isWanted = computed(() => {
  return message.value?.type === 'Wanted'
})

const tagForGroup = computed(() => {
  let ret = null

  message.value?.groups?.forEach((g) => {
    const group = groupStore?.get(g.groupid)

    if (group) {
      switch (message.value?.type) {
        case 'Offer':
          ret = group.settings?.keywords?.offer
            ? group.settings.keywords.offer
            : 'OFFER'
          break
        case 'Wanted':
          ret = group.settings?.keywords?.wanted
            ? group.settings.keywords.wanted
            : 'WANTED'
          break
      }
    }
  })

  return ret
})
</script>
<style scoped lang="scss">
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins/_breakpoints';
@import 'assets/css/_color-vars.scss';

.tagbadge {
  left: 10px;
  top: 10px;
  background-color: $color-green--mid;
  font-size: 1.25rem;
  color: white;
  border-radius: 4px;
  text-transform: uppercase;
  max-width: calc(100% - 20px);
  z-index: 5;

  &--wanted {
    background-color: $color-blue--light;
  }

  &.tagdef {
    left: 0px;

    @include media-breakpoint-up(sm) {
      left: 10px;
    }
  }

  &:not(.inline) {
    position: absolute;
  }
}
</style>
