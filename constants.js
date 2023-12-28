export const EMAIL_REGEX =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
export const URL_REGEX =
  /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/g

// These are the most common words in UK addresses.
export const ADDRESS_WORDS = [
  'house',
  'flat',
  'road',
  'close',
  'lane',
  'drive',
  'avenue',
  'street',
  'way',
  'court',
  'place',
  'gardens',
  'crescent',
  'park',
  'grove',
  'terrace',
]

export const DAY_WORDS = [
  'mon',
  'tue',
  'wed',
  'thu',
  'fri',
  'sat',
  'sun',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
  'today',
  'tomorrow',
  'this afternoon',
  'this evening',
  'tonight',
]

export const MAX_MAP_ZOOM = 14

export const RECENT_MESSAGES = 31
export const OWN_POSTS_AGE = 120
export const MESSAGE_EXPIRE_TIME = 90
export const GROUP_REPOSTS = { offer: 3, wanted: 14, max: 10, chaseups: 2 }

export const TYPING_TIME_INVERVAL = 10000
