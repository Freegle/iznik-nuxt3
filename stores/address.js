import { defineStore } from 'pinia'
import { nextTick } from 'vue'
import convertStructuredToUnstructured from 'postman-paf'
import api from '~/api'

export const useAddressStore = defineStore({
  id: 'address',
  state: () => ({
    list: [],
    listById: {},
    fetching: null,
    properties: {},
  }),
  actions: {
    init(config) {
      this.config = config
    },
    async fetch(id, force) {
      if (id) {
        // Specific address which may or may not be ours.  If it's not, we'll get an error, which is a bug.  But we
        // also get an error if it's been deleted.  So don't log
        try {
          if (!this.listById[id] || force) {
            this.listById[id] = await api(this.config).address.fetchByIdv2(
              id,
              false
            )
          }
          return this.listById[id]
        } catch (e) {
          console.log('Failed to get address', e)
          return null
        }
      } else if (this.fetching) {
        await this.fetching
        await nextTick()
      } else {
        this.fetching = api(this.config).address.fetchv2()
        this.list = await this.fetching
        this.list = this.list || []

        this.list.forEach((address) => {
          this.listById[address.id] = address
        })

        this.fetching = null
      }
    },
    async delete(id) {
      await api(this.config).address.del(id)
      delete this.listById[id]
      await this.fetch()
    },
    async fetchProperties(postcodeid) {
      const addresses = await api(this.config).location.fetchAddresses(
        postcodeid
      )
      console.log('Returned addresses', addresses)

      // Add the singleline property to each address
      addresses.forEach((address) => {
        // "locations.name as postcode, "+
        // "buildingname, "+
        // "buildingnumber, "+
        // "p.subbuildingname, "+
        // "departmentname, "+
        // "dependentlocality, "+
        // "doubledependentlocality, "+
        // "dependentthoroughfaredescriptor, "+
        // "organisationname, "+
        // "suorganisationindicator, "+
        // "deliverypointsuffix, "+
        // "udprn, "+
        // "posttown, "+
        // "postcodetype, "+
        // "pobox, "+
        // "thoroughfaredescriptor "+

        const toConvert = {
          postcode: address.postcode,
          buildingName: address.buildingname,
          buildingNumber: address.buildingnumber,
          subBuildingName: address.subbuildingname,
          departmentName: address.departmentname,
          dependentLocality: address.dependentlocality,
          doubleDependentLocality: address.doubledependentlocality,
          dependentThoroughfareDescriptor:
            address.dependentthoroughfaredescriptor,
          organisationName: address.organisationname,
          suOrganisationIndicator: address.suorganisationindicator,
          deliveryPointSuffix: address.deliverypointsuffix,
          udprn: address.udprn,
          postTown: address.posttown,
          postcodeType: address.postcodetype,
          poBoxNumber: address.pobox,
          thoroughfareDescriptor: address.thoroughfaredescriptor,
        }

        console.log('Converting', toConvert)
        const converted = convertStructuredToUnstructured(toConvert)
        console.log('Converted', converted)
        address.singleline = ''

        for (let line = 1; line <= 5; line++) {
          if (converted['line' + line]) {
            address.singleline += converted['line' + line] + ', '
          }
        }

        address.singleline += ' ' + address.postcode
        console.log('Single line', address.singleline)
      })

      if (addresses?.length) {
        addresses.forEach((address) => {
          this.properties[address.id] = address
        })
      }
    },
    async update(params) {
      await api(this.config).address.update(params)
      this.fetch(params.id, true)
    },
    async add(params) {
      const { id } = await api(this.config).address.add(params)
      await this.fetch()
      return id
    },
  },
  getters: {
    get: (state) => (id) => {
      return state.listById(id)
    },
  },
})
