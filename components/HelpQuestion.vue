<template>
  <div v-show="matches.includes(id)" :id="id">
    <h3 class="text-black" @click="expand">
      <slot name="title"></slot>
    </h3>
    <slot v-if="expanded || matches.length <= 3" name="default"> </slot>
    <div v-else>
      <b-button variant="white" @click="expand">
        Click to show answer
      </b-button>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    id: {
      type: String,
      required: true,
    },
    matches: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      expanded: false,
    }
  },
  methods: {
    expand() {
      this.expanded = !this.expanded
    },
  },
}
</script>
