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
            <b-img lazy src="/loader.gif" alt="Loading" />
          </span>
        </template>
      </infinite-loading>
    </client-only>
  </div>
</template>
<script>
import { useCommentStore } from '~/stores/comment'
import { useModGroupStore } from '@/stores/modgroup'

export default {
  setup() {
    const commentStore = useCommentStore()
    return {
      commentStore,
    }
  },
  data: function () {
    return {
      context: null,
      distance: 1000,
      limit: 2,
      show: 0,
      busy: false,
      complete: false,
      groupid: null,
      bump: 1,
    }
  },
  computed: {
    filteredComments() {
      return this.comments.filter((c) => {
        return (
          this.groupid === null ||
          this.groupid === c.groupid ||
          c.flag ||
          c.byuser?.id === this.myid
        )
      })
    },
    visibleComments() {
      return this.filteredComments.slice(0, this.show)
    },
    comments() {
      return this.commentStore.sortedList
    },
  },
  watch: {
    groupid() {
      this.bump++
      this.commentStore.clear()
      this.context = null
    },
  },
  mounted() {
    const modGroupStore = useModGroupStore()
    modGroupStore.getModGroups()
    this.commentStore.clear()
  },
  methods: {
    async loadMore($state) {
      this.busy = true

      if (this.show < this.comments.length) {
        // This means that we will gradually add the members that we have fetched from the server into the DOM.
        // Doing that means that we will complete our initial render more rapidly and thus appear faster.
        this.show++
        $state.loaded()
      } else {
        const currentCount = this.comments.length

        try {
          await this.commentStore.fetch({
            context: this.context,
            groupid: this.groupid,
          })

          this.context = this.commentStore.context

          if (currentCount === this.comments.length) {
            this.complete = true
            this.busy = false
            $state.complete()
          } else {
            $state.loaded()
            this.busy = false
            this.show++
          }
        } catch (e) {
          $state.complete()
          this.busy = false
          console.log('Complete on error', e)
        }
      }
    },
  },
}
</script>
<style scoped>
select {
  max-width: 300px;
}
</style>
