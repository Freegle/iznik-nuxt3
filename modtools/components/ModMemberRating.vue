<template>
  <div v-if="rating">
    <div id="visobserver" v-observe-visibility="visibilityChanged" />
    <b-card no-body>
      <b-card-header
        :header-bg-variant="rating.reviewrequired ? 'warning' : 'default'"
        class="d-flex justify-content-between flex-wrap"
      >
        <div>
          <!-- eslint-disable-next-line-->
          <nuxt-link :to="'/members/approved/' + rating.groupid + '/' + rating.rater"><strong>{{ rating.raterdisplayname }}</strong> (<v-icon
              icon="hashtag"
              class="text-muted"
              scale="0.75"
            />{{ rating.rater }})</nuxt-link
          >
          &hairsp;
          <span
            v-if="rating.rating === 'Down'"
            class="text-danger font-weight-bold"
            >gave a thumbs down to</span
          >
          <span
            v-else-if="rating.rating === 'Up'"
            class="text-success font-weight-bold"
            >gave a thumbs up to</span
          >
          <!-- eslint-disable-next-line-->
          &hairsp;<nuxt-link :to="'/members/approved/' + rating.groupid + '/' + rating.ratee"><strong>{{ rating.rateedisplayname }}</strong> (<v-icon
              icon="hashtag"
              class="text-muted"
              scale="0.75"
            />{{ rating.ratee }})</nuxt-link
          >
        </div>
        <div>
          {{ timeago(rating.timestamp) }},
          <span v-if="groupName"> both members of {{ groupName }} </span>
          <span
            v-if="rating.reviewrequired"
            class="text-danger font-weight-bold"
          >
            New
          </span>
        </div>
      </b-card-header>
      <b-card-body>
        <p v-if="rating.text" class="text-danger">
          <strong>{{ rating.reason }}</strong
          >: &quot;{{ rating.text }}&quot;
        </p>
        <div class="d-flex flex-wrap justify-content-between">
          <ChatButton
            :userid="rating.rater"
            :groupid="rating.groupid"
            :title="'Chat to ' + rating.raterdisplayname"
            variant="white"
          />
          <ChatButton
            :userid="rating.ratee"
            :groupid="rating.groupid"
            :title="'Chat to ' + rating.rateedisplayname"
            variant="white"
          />
        </div>
      </b-card-body>
    </b-card>
  </div>
</template>
<script setup>
import { computed } from 'vue'
import { useMemberStore } from '~/stores/member'
import { useUserStore } from '~/stores/user'
import { useModMe } from '~/composables/useModMe'

const props = defineProps({
  ratingid: {
    type: Number,
    required: true,
  },
})

const memberStore = useMemberStore()
const userStore = useUserStore()
const { amAModOn } = useModMe()

const rating = computed(() => memberStore.ratingById(props.ratingid))

const groupName = computed(() => {
  let ret = null

  if (rating.value?.rater) {
    const rater = userStore.byId(rating.value.rater)
    if (rater && rater.memberships) {
      rater.memberships.forEach((g) => {
        if (g.id === rating.value.groupid && amAModOn(g.id)) {
          ret = g.namedisplay
        }
      })
    }
  }

  return ret
})

function visibilityChanged(visible) {
  if (visible && rating.value?.reviewrequired) {
    // Mark this as reviewed.  They've had a chance to see it.
    userStore.ratingReviewed({
      id: rating.value.id,
    })
  }
}
</script>
