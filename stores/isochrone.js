import { defineStore } from 'pinia'
import Wkt from 'wicket'
import api from '~/api'

export const useIsochroneStore = defineStore({
  id: 'isochrone',
  state: () => ({
    config: null,
    list: [],
  }),
  actions: {
    init(config) {
      this.config = config
    },
    async fetch() {
      this.list = await api(this.config).isochrone.fetch()
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
            const wkt = new Wkt.Wkt()
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
            console.log('WKT parse error on isochrone', i.id)
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
  },
})
