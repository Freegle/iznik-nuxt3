<template>
  <div>
    <ModComment
      v-for="comment in comments"
      :key="'modcomments-' + user.id + '-' + comment.id"
      :comment="comment"
      :user="user"
      :expand-comments="expandComments"
      @updated="updated"
      @editing="editing"
    />
    <div v-if="sortedComments.length > 1" class="mb-1">
      <b-button v-if="!showAll" variant="white" @click="showAll = true">
        <v-icon icon="tag" /> Show {{ showMore }}
      </b-button>
      <b-button v-else variant="white" @click="showAll = false">
        <v-icon icon="tag" /> Hide notes
      </b-button>
    </div>
  </div>
</template>
<script>
import pluralize from 'pluralize'

export default {
  props: {
    user: {
      type: Object,
      required: true,
    },
    expandComments: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  data: function () {
    return {
      showAll: false,
    }
  },
  computed: {
    showMore() {
      pluralize.addIrregularRule('more note', 'more notes')
      return pluralize('more note', this.sortedComments.length - 1, true)
    },
    sortedComments() {
      const ret = this.user ? this.user.comments : []

      if (ret) {
        ret.sort((a, b) => {
          const aone = this.oneOfMyGroups(a.groupid)
          const bone = this.oneOfMyGroups(b.groupid)

          if (aone && !bone) {
            return -1
          } else if (bone && !aone) {
            return 1
          } else {
            return 0
          }
        })
      }

      return ret || []
    },
    comments() {
      if (this.showAll) {
        return this.sortedComments
      } else if (this.sortedComments.length) {
        return [this.sortedComments[0]]
      } else {
        return []
      }
    },
  },
  methods: {
    updated() {
      this.$emit('updateComments')
    },
    editing() {
      this.$emit('editing')
    },
  },
}
</script>
