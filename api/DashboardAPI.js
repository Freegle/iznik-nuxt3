import BaseAPI from '@/api/BaseAPI'

export default class DashboardAPI extends BaseAPI {
  async fetch(params) {
    // Go API expects components as comma-separated string, not PHP-style array
    if (Array.isArray(params.components)) {
      params.components = params.components.join(',')
    }
    const { dashboard, components } = await this.$getv2('/dashboard', params)
    return dashboard || components
  }

  async fetchHeatmap(params) {
    const { heatmap } = await this.$getv2('/dashboard', {
      heatmap: true,
    })
    return heatmap
  }
}
