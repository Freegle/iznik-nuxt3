<template>
  <div>
    <client-only>
      <ScrollToTop />
      <ModHelpComments />
      <ModGroupSelect v-model="groupid" modonly all />
      <ModCommentUser
        v-for="comment in visibleComments"
        :key="'commentlist-' + comment.id"
        :comment="comment"
        class="p-0 mt-2"
      />
      <NoticeMessage v-if="!comments.length && !busy" class="mt-2">
        There are no comments to show at the moment.
      </NoticeMessage>

      <infinite-loading
        :key="bump"
        force-use-infinite-wrapper="body"
        :distance="distance"
        @infinite="loadMore"
      >
        <template #no-results>
          <span />
        </template>
        <template #no-more>
          <span />
        </template>
        <template #spinner>
          <span>
            <Spinner :size="50" />
          </span>
        </template>
      </infinite-loading>
    </client-only>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useCommentStore } from '~/stores/comment'
import { useMe } from '~/composables/useMe'

// Stores and composables
const commentStore = useCommentStore()
const { myid } = useMe()

// Local state (formerly data())
const context = ref(null)
const distance = ref(1000)
const show = ref(0)
const busy = ref(false)
const complete = ref(false)
const groupid = ref(null)
const bump = ref(1)

// Computed properties
const comments = computed(() => {
  return commentStore.sortedList
})

const filteredComments = computed(() => {
  return comments.value.filter((c) => {
    return (
      groupid.value === null ||
      groupid.value === c.groupid ||
      c.flag ||
      c.byuser?.id === myid.value
    )
  })
})

const visibleComments = computed(() => {
  return filteredComments.value.slice(0, show.value)
})

// Watchers
watch(groupid, () => {
  bump.value++
  commentStore.clear()
  context.value = null
})

// Lifecycle
onMounted(() => {
  commentStore.clear()
})

// Methods
async function loadMore($state) {
  busy.value = true

  if (show.value < comments.value.length) {
    // This means that we will gradually add the members that we have fetched from the server into the DOM.
    // Doing that means that we will complete our initial render more rapidly and thus appear faster.
    show.value++
    $state.loaded()
  } else {
    const currentCount = comments.value.length

    try {
      await commentStore.fetch({
        context: context.value,
        groupid: groupid.value,
      })

      context.value = commentStore.context

      if (currentCount === comments.value.length) {
        complete.value = true
        busy.value = false
        $state.complete()
      } else {
        $state.loaded()
        busy.value = false
        show.value++
      }
    } catch (e) {
      $state.complete()
      busy.value = false
      console.log('Complete on error', e)
    }
  }
}
</script>

<style scoped>
select {
  max-width: 300px;
}
</style>
