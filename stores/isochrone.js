import { defineStore } from 'pinia'
import api from '~/api'

export const useIsochroneStore = defineStore({
  id: 'isochrone',
  state: () => ({
    config: null,
    WKT: null,
    L: null,
    list: [],
  }),
  actions: {
    async init(config) {
      this.Wkt = await import('wicket')
      window.L = await import('leaflet/dist/leaflet-src.esm')
      await import('wicket/wicket-leaflet')

      this.config = config
    },
    async fetch() {
      // TODO CACHE
      try {
        this.list = await api(this.config).isochrone.fetchv2()
      } catch (e) {
        // Most likely a 403 error, which we get when there is no isochrone.  Call the old API, which will create one
        // for us.
        this.list = await api(this.config).isochrone.fetchv1()
      }
    },
    async fetchMessages() {
      // TODO CACHE
      return await api(this.config).isochrone.fetchMessages()
    },
  },
  getters: {
    bounds: (state) => {
      // We have a problem with getting the bounds using leaflet - it looks like a timing error.  So do it ourselves.
      const isochrones = state.list

      if (isochrones?.length) {
        let swlat = null
        let swlng = null
        let nelat = null
        let nelng = null

        isochrones.forEach((i) => {
          try {
            const wkt = new state.Wkt.Wkt()
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
          return [
            [swlat, swlng],
            [nelat, nelng],
          ]
        }
      }

      return null
    },
    get: (state) => (id) => {
      return state.list.find((i) => i.id === id)
    },
  },
})
