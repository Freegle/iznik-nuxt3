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
<script setup>
import { ref, computed } from 'vue'
import pluralize from 'pluralize'
import { useMe } from '~/composables/useMe'

const props = defineProps({
  user: {
    type: Object,
    required: true,
  },
  expandComments: {
    type: Boolean,
    required: false,
    default: false,
  },
})

const emit = defineEmits(['updateComments', 'editing'])

const { oneOfMyGroups } = useMe()

const showAll = ref(false)

const showMore = computed(() => {
  pluralize.addIrregularRule('more note', 'more notes')
  return pluralize('more note', sortedComments.value.length - 1, true)
})

const sortedComments = computed(() => {
  const ret = props.user ? props.user.comments : []

  if (ret) {
    ret.sort((a, b) => {
      const aone = oneOfMyGroups(a.groupid)
      const bone = oneOfMyGroups(b.groupid)

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
})

const comments = computed(() => {
  if (showAll.value) {
    return sortedComments.value
  } else if (sortedComments.value.length) {
    return [sortedComments.value[0]]
  } else {
    return []
  }
})

function updated() {
  emit('updateComments')
}

function editing() {
  emit('editing')
}
</script>
