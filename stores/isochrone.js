import { defineStore } from 'pinia'
import api from '~/api'

export const useIsochroneStore = defineStore({
  id: 'isochrone',
  state: () => ({
    config: null,
    WKT: null,
    L: null,
    list: [],
    fetchingMessages: null,
    fetchingIsochrones: null,
    messageList: [],
    bounds: null,
  }),
  actions: {
    async loadLeaflet() {
      // No point loading leafleft (which is large) until we need it.
      if (process.client && (!this.Wkt || !window.L)) {
        this.Wkt = await import('wicket')
        window.L = await import('leaflet')
        await import('wicket/wicket-leaflet')
      }
    },
    init(config) {
      this.config = config
    },
    async fetch(force) {
      await this.loadLeaflet()

      if (!this.list?.length || force) {
        try {
          if (this.fetchingIsochrones) {
            await this.fetchingIsochrones
          } else {
            this.fetchingIsochrones = api(this.config).isochrone.fetchv2()
            this.list = await this.fetchingIsochrones
            this.fetchingIsochrones = null
          }
        } catch (e) {
          // Most likely a 403 error, which we get when there is no isochrone.  Call the old API, which will create one
          // for us.
          await api(this.config).isochrone.fetchv1()
          this.list = await api(this.config).isochrone.fetchv2()
        }
      }

      this.computeBounds()
      return this.list
    },
    async fetchMessages(force) {
      if (force || !this.messageList?.length) {
        if (this.fetchingMessages) {
          await this.fetchingMessages
        } else {
          this.fetchingMessages = api(this.config).isochrone.fetchMessages()
          this.messageList = await this.fetchingMessages
          this.fetchingMessages = null
        }
      }

      return this.messageList
    },
    async delete({ id }) {
      await api(this.config).isochrone.del(id)
      this.fetchMessages(true)
      await this.fetch(true)
    },
    async add(params) {
      const id = await api(this.config).isochrone.add(params)
      this.fetchMessages(true)
      await this.fetch(true)
      return id
    },
    async edit(params) {
      await api(this.config).isochrone.patch({
        id: params.id,
        transport: params.transport,
        minutes: params.minutes,
      })

      this.fetchMessages(true)
      await this.fetch(true)
    },
    computeBounds() {
      // We have a problem with getting the bounds using leaflet - it looks like a timing error.  So do it ourselves.
      const isochrones = this.list

      this.bounds = null

      if (isochrones?.length) {
        let swlat = null
        let swlng = null
        let nelat = null
        let nelng = null

        isochrones.forEach((i) => {
          try {
            const wkt = new this.Wkt.Wkt()
            wkt.read(i.polygon)
            const obj = wkt.toObject()
            const thisbounds = obj.getBounds()
            const thissw = thisbounds.getSouthWest()
            const thisne = thisbounds.getNorthEast()

            swlat = swlat === null ? thissw.lat : Math.min(swlat, thissw.lat)
            swlng = swlng === null ? thissw.lng : Math.min(swlng, thissw.lng)
            nelat = nelat === null ? thisne.lat : Math.max(nelat, thisne.lat)
            nelng = nelng === null ? thisne.lng : Math.min(nelng, thisne.lng)
          } catch (e) {
            console.log('WKT parse error on isochrone', i.id, e)
          }
        })

        if (swlat !== null) {
          this.bounds = [
            [swlat, swlng],
            [nelat, nelng],
          ]
        }
      }
    },
  },
  getters: {
    get: (state) => (id) => {
      return state.list.find((i) => i.id === id)
    },
  },
})
