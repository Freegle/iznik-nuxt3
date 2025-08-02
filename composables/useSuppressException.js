export function suppressException(err) {
  if (
    err.message?.includes('leaflet') ||
    err.message?.includes('LatLng') ||
    err.stack?.includes('leaflet') ||
    err.stack?.includes('LMap') ||
    err.stack?.includes('LMarker') ||
    err.stack?.includes('layer') ||
    err.message?.includes('Map container not found')
  ) {
    // Leaflet throws all kinds of errors when the DOM elements are removed.  Ignore them all.
    console.log('Leaflet in stack - ignore')
    return true
  }
  if (
    // MT
    err.stack?.includes('chart element')
  ) {
    // GChart seems to show this error occasionally - ignore
    console.log('suppressException chart element - ignore')
    return true
  }

  return false
}
