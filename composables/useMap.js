export function osmtile() {
  const runtimeConfig = useRuntimeConfig()
  return runtimeConfig.public.OSM_TILE
}

export function attribution() {
  return 'Map data &copy; <a href="https://www.openstreetmap.org/" rel="noopener noreferrer">OpenStreetMap</a> contributors'
}

export function mapWidth() {
  const contWidth = this.$refs.mapcont ? this.$refs.mapcont.clientWidth : 0
  return contWidth + this.bump - this.bump
}
