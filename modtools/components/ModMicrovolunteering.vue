<template>
  <div>
    {{ id }}
    <span v-if="!item">NO ITEM</span>
    <b-card v-if="item" no-body>
      <b-card-body>
        <div class="layout">
          <div class="date small">
            {{ datetimeshort(item.timestamp) }}
          </div>
          <div class="action font-italic">
            <div v-if="item.rotatedimage">
              <span v-if="item.result === 'Approve'">
                no need to rotate photo
              </span>
              <span
                v-if="item.result === 'Reject'"
                class="text-danger font-weight-bold"
              >
                rotated photo
                <br /><span class="text-muted">(current photo shown)</span>
              </span>
            </div>
            <div v-else-if="item.message">
              <span v-if="item.result === 'Approve'">
                thinks message looks ok
              </span>
              <span v-if="item.result === 'Reject'">
                <span
                  v-if="item.msgcategory === 'CouldBeBetter'"
                  class="text-warning font-weight-bold"
                >
                  thinks this message could be better
                </span>
                <span
                  v-else-if="item.msgcategory === 'ShouldntBeHere'"
                  class="text-danger font-weight-bold"
                >
                  thinks this message shouldn't be on Freegle
                </span>
                <span v-else> thinks: {{ item.msgcategory }} </span>
              </span>
            </div>
            <div v-else-if="item.item1">marked as related</div>
          </div>
          <div class="object">
            <nuxt-link
              v-if="item.rotatedimage"
              :to="'/message/' + item.rotatedimage.msgid"
            >
              <b-img thumbnail :src="item.rotatedimage.thumb" class="thumb" />
            </nuxt-link>
            <nuxt-link
              v-else-if="item.message"
              :to="'/message/' + item.message.id"
            >
              <v-icon icon="hashtag" class="text-muted" scale="0.75" />{{
                item.message.id
              }}
              {{ item.message.subject }}
            </nuxt-link>
            <div v-else-if="item.item1">
              <em>{{ item.item1.name }}</em>
              <span class="text-muted">and</span> <em>{{ item.item2.name }}</em>
            </div>
            <div v-else></div>
          </div>
        </div>
      </b-card-body>
    </b-card>
  </div>
</template>
<script>
import { useMicroVolunteeringStore } from '../stores/microvolunteering'
export default {
  props: {
    id: {
      type: Number,
      required: true,
    },
  },
  setup() {
    const microVolunteeringStore = useMicroVolunteeringStore()
    return {
      microVolunteeringStore,
    }
  },
  computed: {
    item() {
      return this.microVolunteeringStore.byId(this.id)
    },
    email() {
      let ret = null

      if (this.item.user && this.item.user.emails) {
        this.item.user.emails.forEach((e) => {
          if (!e.ourdomain && (!ret || e.preferred)) {
            ret = e.email
          }
        })
      }

      return ret
    },
  },
}
</script>
<style scoped lang="scss">
//@import 'color-vars';
@import 'bootstrap/scss/functions';
@import 'bootstrap/scss/variables';
@import 'bootstrap/scss/mixins/_breakpoints';

.thumb {
  width: 100px;
  height: 100px;
  object-fit: cover;
}

.layout {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: auto auto auto;

  @include media-breakpoint-up(md) {
    grid-template-columns: 2fr 2fr 3fr;
    grid-template-rows: auto;
  }

  .date {
    grid-row: 1 / 2;
    grid-column: 1 / 2;

    @include media-breakpoint-up(md) {
      grid-row: 1 / 2;
      grid-column: 1 / 2;
    }
  }

  .action {
    grid-row: 2 / 3;
    grid-column: 1 / 2;

    @include media-breakpoint-up(md) {
      grid-row: 1 / 2;
      grid-column: 2 / 3;
    }
  }

  .object {
    grid-row: 3 / 4;
    grid-column: 1 / 2;

    @include media-breakpoint-up(md) {
      grid-row: 1 / 2;
      grid-column: 3 / 4;
    }
  }
}
</style>
