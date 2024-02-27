// This is our configuration for prebid.  It defines what ads we expose.
var small_banner_sizes = [
  [320, 50]
]

var medium_banner_sizes = [
  [728, 90]
]

var squarish_sizes = [
  [300, 250]
]

var PREBID_TIMEOUT = 1000
var FAILSAFE_TIMEOUT = 3000

var adUnits = [
  {
    code: '/22794232631/freegle_sticky',
    mediaTypes: {
      banner: {
        sizes: small_banner_sizes
      }
    },
    bids: [{
      bidder: 'pubmatic',
      params: {
        placementId: 5753989
      }
    }]
  },
  {
    code: '/22794232631/freegle_sticky_desktop',
    mediaTypes: {
      banner: {
        sizes: medium_banner_sizes
      }
    },
    bids: [{
      bidder: 'pubmatic',
      params: {
        placementId: 5753990
      }
    }]
  },
  {
    code: '/22794232631/freegle_product',
    mediaTypes: {
      banner: {
        sizes: squarish_sizes
      }
    },
    bids: [{
      bidder: 'pubmatic',
      params: {
        placementId: 5773059
      }
    }]
  },
  {
    code: '/22794232631/freegle_productemail',
    mediaTypes: {
      banner: {
        sizes: squarish_sizes
      }
    },
    bids: [{
      bidder: 'pubmatic',
      params: {
        placementId: 5753984
      }
    }]
  },
  {
    code: '/22794232631/freegle_myposts_desktop',
    mediaTypes: {
      banner: {
        sizes: squarish_sizes
      }
    },
    bids: [{
      bidder: 'pubmatic',
      params: {
        placementId: 5753988
      }
    }]
  },
  {
    code: '/22794232631/freegle_home_left',
    mediaTypes: {
      banner: {
        sizes: squarish_sizes
      }
    },
    bids: [{
      bidder: 'pubmatic',
      params: {
        placementId: 5753983
      }
    }]
  },
  {
    code: '/22794232631/freegle_home',
    mediaTypes: {
      banner: {
        sizes: squarish_sizes
      }
    },
    bids: [{
      bidder: 'pubmatic',
      params: {
        placementId: 5753982
      }
    }]
  },
  {
    code: '/22794232631/freegle_chat_app',
    mediaTypes: {
      banner: {
        sizes: small_banner_sizes
      }
    },
    bids: [{
      bidder: 'pubmatic',
      params: {
        placementId: 5753987
      }
    }]
  },
  {
    code: '/22794232631/freegle_chat_desktop',
    mediaTypes: {
      banner: {
        sizes: squarish_sizes
      }
    },
    bids: [{
      bidder: 'pubmatic',
      params: {
        placementId: 5753986
      }
    }]
  }
]

// ======== DO NOT EDIT BELOW THIS LINE =========== //
var googletag = googletag || {}
googletag.cmd = googletag.cmd || []
googletag.cmd.push(function() {
  googletag.pubads().disableInitialLoad()
})

var pbjs = pbjs || {}
pbjs.que = pbjs.que || []

pbjs.que.push(function() {
  pbjs.addAdUnits(adUnits)
  pbjs.requestBids({
    bidsBackHandler: initAdserver,
    timeout: PREBID_TIMEOUT
  })
})

function initAdserver () {
  if (pbjs.initAdserverSet) return
  pbjs.initAdserverSet = true
  googletag.cmd.push(function() {
    pbjs.que.push(function() {
      pbjs.setTargetingForGPTAsync()
      googletag.pubads().refresh()
    })
  })
}

// in case PBJS doesn't load
setTimeout(function() {
  initAdserver()
}, FAILSAFE_TIMEOUT)
