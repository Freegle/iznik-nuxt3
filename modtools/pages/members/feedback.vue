<template>
  <div>
    <client-only>
      <ScrollToTop />
      <ModHelpFeedback />
      <b-tabs content-class="mt-3" card>
        <b-tab active>
          <template v-slot:title>
            <h4 class="header--size4 ml-2 mr-2">
              Feedback <span v-if="members.length">({{ members.length }})</span>
            </h4>
          </template>
          <div class="d-flex justify-content-between">
            <GroupSelect v-model="groupid" modonly all remember="membersfeedback" />
            <b-form-select v-model="filter">
              <option value="Comments">
                With Comments
              </option>
              <option value="Happy">
                Happy
              </option>
              <option value="Unhappy">
                Unhappy
              </option>
              <option value="Fine">
                Fine
              </option>
            </b-form-select>
            <b-button variant="white" @click="markAll">
              Mark all as seen
            </b-button>
          </div>
          <b-card v-if="happinessData.length" variant="white" class="mt-1">
            <b-card-text>
              <p class="text-center">
                This is what people have said over the last year<span v-if="!groupid"> across all of Freegle</span>.
              </p>
              <div class="d-flex flex-wrap justify-content-between">
                <GChart
                  type="PieChart"
                  :data="happinessData"
                  :options="happinessOptions"
                />
                <GChart
                  type="BarChart"
                  :data="happinessData"
                  :options="happinessOptions"
                />
              </div>
            </b-card-text>
          </b-card>

          <NoticeMessage v-if="!members.length && !busy" class="mt-2">
            There are no items to show at the moment.
          </NoticeMessage>

          <div v-for="item in visibleItems" :key="'memberlist-' + item.id" class="p-0 mt-2">
            <ModMemberHappiness v-if="item.type === 'Member' && filterMatch(item.object)" :id="item.object.id" />
          </div>
        </b-tab>
        
        <b-tab>
          <template v-slot:title>
            <h4 class="header--size4 ml-2 mr-2">
              Thumbs Up/Down <span v-if="ratings.length">({{ ratings.length }})</span>
            </h4>
          </template>

          <div v-for="item in visibleItems" :key="'memberlist-' + item.id" class="p-0 mt-2">
            <ModMemberRating v-if="item.type === 'Rating'" :rating="item.object" class="mt-2" />
          </div>
        </b-tab>
      </b-tabs>
      <infinite-loading direction="top" force-use-infinite-wrapper="true" :distance="distance" @infinite="loadMore" :identifier="bump">
        <template #no-results>
        </template>
        <template #no-more>
        </template>
        <template #spinner>
          <b-img lazy src="/loader.gif" alt="Loading" />
        </template>
      </infinite-loading>
    </client-only>
  </div>
</template>
<script>
import dayjs from 'dayjs'
import { useMemberStore } from '@/stores/member'
import { GChart } from 'vue-google-charts'
import { setupModMembers } from '../../composables/useModMembers'

export default {
  components: {
    GChart,
  },
  //layout: 'modtools',
  mixins: [
    //loginRequired,
    //createGroupRoute('modtools/members/feedback'),
    //modMembersPage
  ],
  async setup() {
    const memberStore = useMemberStore()
    const modMembers = setupModMembers()
    modMembers.collection.value = 'Happiness'
    return {
      memberStore,
      ...modMembers // busy, context, group, groupid, limit, workType, show, collection, messageTerm, memberTerm, distance, summary, members, visibleMembers, work, loadMore
    }
  },
  data: function() {
    return {
      happinessData: [],
      bump: 0,
      //collection: 'Happiness',
      happinessOptions: {
        // title: 'Freegler Feedback',
        chartArea: {
          width: '80%',
          height: '80%'
        },
        pieSliceBorderColor: 'darkgrey',
        colors: ['green', '#f8f9fa', 'orange'],
        slices2: {
          1: { offset: 0.2 },
          2: { offset: 0.2 },
          3: { offset: 0.2 }
        }
      },
      // Get everything (probably) so that the ratings and feedback are interleaved.
      //limit: 1000
    }
  },
  computed: {
    ratings() {
      // TODO return this.$store.getters['members/getRatings']
      return []
    },
    sortedItems() {
      console.log('sortedItems A')
      const objs = []

      this.members.forEach(m => {
        objs.push({
          type: 'Member',
          object: m,
          timestamp: m.timestamp,
          id: 'member-' + m.id
        })
      })

      this.ratings.forEach(r => {
        objs.push({
          type: 'Rating',
          object: r,
          timestamp: r.timestamp,
          id: 'rating-' + r.id
        })
      })
      console.log('sortedItems B', objs.length)

      objs.sort(function(a, b) {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      })

      return objs
    },
    visibleItems() {
      console.log('visibleItems',this.show)
      return this.sortedItems.slice(0, this.show)
      //return this.sortedItems
    }
  },
  watch: {
    filter() {
      this.context = null
      this.show = 0
      this.memberStore.clear()
      this.bump++
    }
  },
  async mounted() {
    this.filter = 'Comments'
    const start = dayjs().subtract(1, 'year').toDate().toISOString()
    console.log('feedback mounted',start)
    const ret = await this.$api.dashboard.fetch({
      components: ['Happiness'],
      start: start,
      end: new Date().toISOString(),
      allgroups: !this.groupid,
      group: this.groupid > 0 ? this.groupid : null,
      systemwide: this.groupid < 0
    })

    if (ret.Happiness) {
      this.happinessData = [['Feedback', 'Count']]

      ret.Happiness.forEach(h => {
        this.happinessData.push([h.happiness, h.count])
      })
    }
  },
  methods: {
    filterMatch(member) {
      const val = member.happiness

      if (!this.filter) {
        return true
      }

      if (this.filter === 'Comments') {
        const comment = member.comments
          ? ('' + member.comments).replace(/[\n\r]+/g, '').trim()
          : ''

        if (comment.length) {
          return true
        }
      } else {
        if (this.filter === val) {
          return true
        }

        if (this.filter === 'Fine' && !val) {
          return true
        }
      }

      return false
    },
    async markAll() {
      await this.$store.dispatch('members/clear')

      await this.$store.dispatch('members/fetchMembers', {
        groupid: this.groupid,
        collection: this.collection,
        modtools: true,
        summary: false,
        context: null,
        limit: 1000
      })

      this.$nextTick(() => {
        this.members.forEach(async member => {
          if (!member.reviewed) {
            await this.$store.dispatch('members/happinessReviewed', {
              userid: member.fromuser,
              groupid: member.groupid,
              happinessid: member.id
            })
          }
        })

        this.ratings.forEach(async rating => {
          if (rating.reviewrequired) {
            await this.$store.dispatch('user/ratingReviewed', {
              id: rating.id
            })
          }
        })

        this.fetchMe(['work'])
      })
    }
  }
}
</script>
<style scoped>
select {
  max-width: 300px;
}
</style>
