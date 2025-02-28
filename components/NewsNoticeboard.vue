<template>
  <div>
    <NewsUserIntro
      v-if="userid"
      :userid="userid"
      :newsfeed="newsfeed"
      append="put up a poster"
      :append-bold="info.title"
    />
    <p>
      To help Freegle, <strong>{{ newsfeed.displayname }}</strong> printed a
      Freegle poster and put it up where people can see it.
    </p>
    <notice-message v-if="info.description || info.name" class="prewrap">
      <strong v-if="info.name">"{{ info.name.trim() }}"</strong>
      <br v-if="info.name && info.description" />
      <em v-if="info.description">"{{ info.description.trim() }}"</em>
    </notice-message>
    <div v-if="info.photo" class="noticeboard__photo">
      <OurUploadedImage
        v-if="info.photofull?.ouruid"
        :src="info.photofull.ouruid"
        :modifiers="JSON.parse(info.photofull.externalmods)"
        alt="Noticeboard Photo"
        width="100"
        class="clickme replyphoto mt-2 mb-2"
        @click="moreInfo"
      />
      <NuxtPicture
        v-else-if="info.photofull?.externaluid"
        format="webp"
        fit="cover"
        provider="uploadcare"
        :src="info.photofull.externaluid"
        :modifiers="JSON.parse(info.photofull.externalmods)"
        alt="Noticeboard Photo"
        width="100"
        class="clickme replyphoto mt-2 mb-2"
        @click="moreInfo"
      />
      <b-img
        v-else-if="info.photo"
        rounded
        lazy
        :src="photo"
        class="clickme mt-2 mt-md-0 w-100"
        @click="moreInfo"
      />
    </div>
    <p class="mt-1">
      <strong>We need your help to get more people freegling</strong>. Could you
      put one up too?
    </p>
    <l-map
      ref="map"
      :zoom="14"
      :max-zoom="maxZoom"
      :center="[info.lat, info.lng]"
      :style="'width: 100%; height: 200px'"
    >
      <l-tile-layer :url="osmtile" :attribution="attribution" />
      <l-marker :lat-lng="[info.lat, info.lng]" :interactive="false" />
    </l-map>
    <div class="mt-2 d-flex flex-wrap justify-content-between">
      <NewsLoveComment
        :newsfeed="newsfeed"
        @focus-comment="$emit('focus-comment')"
      />
      <nuxt-link no-prefetch to="/promote">
        <b-button variant="secondary" size="sm" class="d-inline-block">
          <v-icon icon="bullhorn" /> Put up a poster
        </b-button>
      </nuxt-link>
    </div>
    <NewsShareModal
      v-if="showNewsShareModal"
      :newsfeed="newsfeed"
      @hidden="showNewsShareModal = false"
    />
  </div>
</template>
<script>
import { defineAsyncComponent } from 'vue'
import { twem } from '~/composables/useTwem'
import NewsBase from '~/components/NewsBase'
import NewsUserIntro from '~/components/NewsUserIntro'
import NewsLoveComment from '~/components/NewsLoveComment'
import NoticeMessage from '~/components/NoticeMessage'
import { attribution, osmtile } from '~/composables/useMap'
import { MAX_MAP_ZOOM } from '~/constants'

const NewsShareModal = defineAsyncComponent(() =>
  import('~/components/NewsShareModal')
)

export default {
  components: {
    NewsUserIntro,
    NewsLoveComment,
    NoticeMessage,
    NewsShareModal,
  },
  extends: NewsBase,
  async setup() {
    let L = null

    if (process.client) {
      L = await import('leaflet/dist/leaflet-src.esm')
    }

    const runtimeConfig = useRuntimeConfig()

    return {
      L,
      osmtile: osmtile(),
      attribution: attribution(),
      runtimeConfig,
    }
  },
  computed: {
    maxZoom() {
      return MAX_MAP_ZOOM
    },
    info() {
      let info = {}
      try {
        info = JSON.parse(this.newsfeed?.message)

        if (info?.description) {
          const desc = twem(info.description)
          info.description = desc
        }

        const p = info?.photofull?.externaluid.indexOf('freegletusd-')
        if (p !== -1) {
          info.photofull.ouruid = info.photofull.externaluid
        }
      } catch (e) {
        console.log('Invalid noticeboard', this.newsfeed)
      }

      return info
    },
    photo() {
      let ret = null

      if (this.info) {
        const id = this.info.photo
        ret = this.runtimeConfig?.public?.IMAGE_SITE + '/bimg_' + id + '.jpg'
      }

      return ret
    },
  },
}
</script>
