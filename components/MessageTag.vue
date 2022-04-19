<template>
  <div
    :class="{
      inline: inline,
      tagbadge: true,
      tagdef: def,
      'font-weight-bold': true,
    }"
  >
    {{ tag }}
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
    messageOverride: {
      type: Object,
      required: false,
      default: null,
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
  setup(props) {
    const messageStore = useMessageStore()
    const groupStore = useGroupStore()

    useAsyncData('message-' + props.id, () => messageStore.fetch(props.id))

    return { messageStore, groupStore }
  },
  computed: {
    message() {
      return this.messageStore.byId(this.id)
    },
    group() {
      return this.groupStore.get(this.message.groups[0].groupid)
    },
    tag() {
      // Get the tag from the group if we can
      if (this.message) {
        if (this.group && this.group.settings && this.group.settings.keywords) {
          const type =
            this.group.settings.keywords[this.message.type.toUpperCase()]
          return type || this.message.type
        } else {
          return this.message.type
        }
      } else {
        return null
      }
    },
  },
}
</script>
<style scoped lang="scss">
@import 'color-vars';
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
