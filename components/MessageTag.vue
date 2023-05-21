<template>
  <div
    :class="{
      inline: inline,
      tagbadge: true,
      tagdef: def,
      'font-weight-bold': true,
      forcebreak: true,
      'text-wrap': true,
      'text-start': true,
    }"
  >
    {{ tagForGroup }}
  </div>
</template>
<script>
import { useGroupStore } from '../stores/group'
import { useMessageStore } from '~/stores/message'

export default {
  props: {
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
  },
  async setup(props) {
    const messageStore = useMessageStore()
    const groupStore = useGroupStore()

    const message = await messageStore.fetch(props.id)
    const fetching = []

    if (message?.groups) {
      message.groups.forEach((group) => {
        fetching.push(groupStore.fetch(group.groupid))
      })
    }

    await Promise.all(fetching)

    return { messageStore, groupStore }
  },
  computed: {
    message() {
      return this.messageStore?.byId(this.id)
    },
    group() {
      return this.groupStore?.get(this.message.groups[0].groupid)
    },
    tagForGroup() {
      let ret = null

      this.message?.groups?.forEach((g) => {
        const group = this.groupStore?.get(g.groupid)

        if (group) {
          switch (this.message?.type) {
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
    },
  },
}
</script>
<style scoped lang="scss">
@import '~bootstrap/scss/functions';
@import '~bootstrap/scss/variables';
@import '~bootstrap/scss/mixins/_breakpoints';

.tagbadge {
  left: 10px;
  top: 10px;
  background-color: $color-green--mid;
  font-size: 1.25rem;
  color: white;
  border-radius: 4px;
  text-transform: uppercase;
  max-width: calc(100% - 20px);

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
