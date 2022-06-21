import turfdistance from 'turf-distance'
import turfpoint from 'turf-point'

export function milesAway(flat, flng, tlat, tlng) {
  let ret = null

  if ((flat || flng) && (tlat || tlng)) {
    ret = turfdistance(
      turfpoint([flat, flng]),
      turfpoint([tlat, tlng]),
      'miles'
    )

    ret = ret > 2 ? Math.round(ret) : Math.round(ret * 10) / 10
  }

  return ret
}
