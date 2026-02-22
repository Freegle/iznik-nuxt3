export function osmtile() {
  const runtimeConfig = useRuntimeConfig()
  return runtimeConfig.public.OSM_TILE
}

export function attribution() {
  return 'Map data &copy; <a href="https://www.openstreetmap.org/" rel="noopener noreferrer">OpenStreetMap</a> contributors'
}

export function toRadian(degree) {
  return (degree * Math.PI) / 180
}

export function getDistance(origin, destination) {
  // return distance in meters
  const lon1 = toRadian(origin[1])
  const lat1 = toRadian(origin[0])
  const lon2 = toRadian(destination[1])
  const lat2 = toRadian(destination[0])

  const deltaLat = lat2 - lat1
  const deltaLon = lon2 - lon1

  const a =
    Math.pow(Math.sin(deltaLat / 2), 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(deltaLon / 2), 2)
  const c = 2 * Math.asin(Math.sqrt(a))
  const EARTH_RADIUS = 6371
  return c * EARTH_RADIUS * 1000
}

export function calculateMapHeight(heightFraction) {
  let height = 0

  if (process.client) {
    height = window.innerHeight / heightFraction - 70
    height = height < 200 ? 200 : height
  }

  return height
}

export async function loadLeaflet() {
  if (process.client && !window.L) {
    // Load Leaflet CSS alongside the JS (lazy-loaded so non-map pages skip it)
    await import('leaflet/dist/leaflet.css')

    // Rebuild the object to avoid "not extensible" issues when loading old-fashioned leaflet plugins.
    window.L = { ...(await import('leaflet/dist/leaflet-src.esm')) }
    window.L.Map.addInitHook(
      'addHandler',
      'gestureHandling',
      await import('leaflet-gesture-handling').GestureHandling
    )

    window.Wkt = await import('wicket')
    await import('wicket/wicket-leaflet')
  }
}
