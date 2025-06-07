<template>
  <div>
    <b-card variant="white" class="border-white" no-body>
      <b-card-body class="pb-0">
        <b-row class="p-0">
          <b-col class="text-center">
            <v-icon
              icon="balance-scale-left"
              :class="fullStats ? 'gold titleicon' : 'purple'"
              :scale="scale"
            />
            <component :is="heading" :class="fullStats ? 'gold' : 'purple'">
              {{ roundIt(totalWeight).toLocaleString() }}
              <br />
              TONNES
              <span v-if="range && fullStats">
                <br />
                <span class="text-muted small">
                  {{ range }}
                </span>
              </span>
            </component>
          </b-col>
          <b-col class="text-center">
            <v-icon
              icon="calculator"
              :class="'gold ' + (fullStats ? 'titleicon' : '')"
              :scale="scale"
            />
            <component :is="heading" class="gold">
              £{{ roundIt(totalBenefit).toLocaleString() }}
              <br />
              BENEFIT
              <span v-if="range && fullStats">
                <br />
                <span class="text-muted small">
                  {{ range }}
                </span>
              </span>
            </component>
          </b-col>
          <b-col class="text-center">
            <v-icon
              icon="cloud"
              :class="fullStats ? 'gold titleicon' : 'green'"
              :scale="scale"
            />
            <component :is="heading" :class="fullStats ? 'gold' : 'green'">
              {{ roundIt(totalCO2).toLocaleString() }}
              <br />
              TONNES CO2
              <span v-if="range && fullStats">
                <br />
                <span class="text-muted small">
                  {{ range }}
                </span>
              </span>
            </component>
          </b-col>
          <b-col v-if="totalGifts" class="text-center">
            <v-icon icon="gift" class="purple titleicon" :scale="scale" />
            <component :is="heading" class="purple">
              {{ totalGifts.toLocaleString() }}
              <br />
              {{
                totalGifts
                  | pluralize(['GIFT', 'GIFTS'], { includeNumber: false })
              }}
              <span v-if="range">
                <br />
                <span class="text-muted small">
                  {{ range }}
                </span>
              </span>
            </component>
          </b-col>
          <b-col v-if="fullStats" class="text-center">
            <v-icon
              icon="users"
              class="text-primary titleicon"
              :scale="scale"
            />
            <component :is="heading" class="text-primary">
              {{ totalMembers.toLocaleString() }}
              <br />
              {{
                totalMembers
                  | pluralize(['MEMBER', 'MEMBERS'], { includeNumber: false })
              }}
              <span v-if="range">
                <br />
                <span class="text-muted small">
                  {{ end }}
                </span>
              </span>
            </component>
          </b-col>
          <b-col v-if="groupCount" class="text-center">
            <v-icon
              icon="map-marker-alt"
              class="green titleicon"
              :scale="scale"
            />
            <component :is="heading" class="green">
              {{ groupCount.toLocaleString() }}
              <br />
              {{
                groupCount
                  | pluralize(['COMMUNITY', 'COMMUNITIES'], {
                    includeNumber: false,
                  })
              }}
              <br />
              <span class="text-muted small">
                {{
                  groupCount
                    | pluralize(['SERVES', 'SERVE'], { includeNumber: false })
                }}
                THIS AREA
              </span>
            </component>
          </b-col>
        </b-row>
        <b-row v-if="range && !fullStats">
          <b-col class="text-center text-muted">
            These three figures are totals over {{ range }}.
          </b-col>
        </b-row>
      </b-card-body>
    </b-card>
    <b-row v-if="border" class="m-0 border border-light">
      <b-col class="bg-white text-faded">
        <div class="iconlist">
          <v-icon icon="glass-martini" />
          <v-icon icon="camera" />
          <v-icon icon="print" />
          <v-icon icon="binoculars" />
          <v-icon icon="umbrella" />
          <v-icon icon="coffee" />
          <v-icon icon="bath" />
          <v-icon icon="clock" />
          <v-icon icon="bicycle" />
          <v-icon icon="hat-wizard" />
          <v-icon icon="bed" />
          <v-icon icon="laptop" />
          <v-icon icon="gift" />
          <v-icon icon="utensils" />
          <v-icon icon="tablet-alt" />
          <v-icon icon="crown" />
          <v-icon icon="baby-carriage" />
          <v-icon icon="headphones" />
          <v-icon icon="tv" />
          <v-icon icon="car" />
          <v-icon icon="socks" />
          <v-icon icon="mobile-alt" />
          <v-icon icon="glass-martini" />
          <v-icon icon="camera" />
          <v-icon icon="print" />
          <v-icon icon="binoculars" />
          <v-icon icon="umbrella" />
          <v-icon icon="coffee" />
          <v-icon icon="bath" />
          <v-icon icon="clock" />
          <v-icon icon="bicycle" />
          <v-icon icon="hat-wizard" />
          <v-icon icon="bed" />
          <v-icon icon="laptop" />
          <v-icon icon="gift" />
          <v-icon icon="utensils" />
          <v-icon icon="tablet-alt" />
          <v-icon icon="crown" />
          <v-icon icon="baby-carriage" />
          <v-icon icon="headphones" />
          <v-icon icon="tv" />
          <v-icon icon="car" />
          <v-icon icon="socks" />
          <v-icon icon="mobile-alt" />
          <v-icon icon="glass-martini" />
          <v-icon icon="camera" />
          <v-icon icon="print" />
          <v-icon icon="binoculars" />
          <v-icon icon="umbrella" />
          <v-icon icon="coffee" />
          <v-icon icon="bath" />
          <v-icon icon="clock" />
          <v-icon icon="bicycle" />
          <v-icon icon="hat-wizard" />
          <v-icon icon="bed" />
          <v-icon icon="laptop" />
          <v-icon icon="gift" />
          <v-icon icon="utensils" />
          <v-icon icon="tablet-alt" />
          <v-icon icon="crown" />
          <v-icon icon="baby-carriage" />
          <v-icon icon="headphones" />
          <v-icon icon="tv" />
          <v-icon icon="car" />
          <v-icon icon="socks" />
          <v-icon icon="mobile-alt" />
          <v-icon icon="glass-martini" />
          <v-icon icon="camera" />
          <v-icon icon="print" />
          <v-icon icon="binoculars" />
          <v-icon icon="umbrella" />
          <v-icon icon="coffee" />
          <v-icon icon="bath" />
          <v-icon icon="clock" />
          <v-icon icon="bicycle" />
          <v-icon icon="hat-wizard" />
          <v-icon icon="bed" />
          <v-icon icon="laptop" />
          <v-icon icon="gift" />
          <v-icon icon="utensils" />
          <v-icon icon="tablet-alt" />
          <v-icon icon="crown" />
          <v-icon icon="baby-carriage" />
          <v-icon icon="headphones" />
          <v-icon icon="tv" />
          <v-icon icon="car" />
          <v-icon icon="socks" />
          <v-icon icon="mobile-alt" />
        </div>
      </b-col>
    </b-row>
  </div>
</template>
<script>
export default {
  props: {
    totalWeight: {
      type: Number,
      required: true,
    },
    totalBenefit: {
      type: Number,
      required: true,
    },
    totalCO2: {
      type: Number,
      required: true,
    },
    totalGifts: {
      type: Number,
      required: false,
      default: null,
    },
    totalMembers: {
      type: Number,
      required: false,
      default: null,
    },
    groupCount: {
      type: Number,
      required: false,
      default: null,
    },
    range: {
      type: String,
      required: false,
      default: null,
    },
    start: {
      type: String,
      required: false,
      default: null,
    },
    end: {
      type: String,
      required: false,
      default: null,
    },
    border: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  computed: {
    fullStats() {
      // Have we been passed a full set of stats or just the first three?
      return this.totalMembers
    },
    scale() {
      return this.fullStats ? 3 : 4
    },
    heading() {
      return this.fullStats ? 'h5' : 'h2'
    },
  },
  methods: {
    roundIt(val) {
      let ret = null

      if (val < 100) {
        ret = Math.round(val * 10) / 10
      } else {
        ret = Math.round(val)
      }

      return ret
    },
  },
}
</script>
<style scoped lang="scss">
.purple {
  color: $color-purple !important;
}

.gold {
  color: $color-gold !important;
}

.green {
  color: $color-green--darker !important;
}

.iconlist {
  white-space: nowrap;
  overflow-x: hidden;
}

.titleicon {
  width: 2rem;
  height: 2rem;
}
</style>
