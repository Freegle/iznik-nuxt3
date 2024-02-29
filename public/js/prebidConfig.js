// This is our configuration for prebid.  It defines what ads we expose.

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
        publisherId: '164422',
        adSlot: '5753989'
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
        publisherId: '164422',
        adSlot: '5753990'
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
        publisherId: '164422',
        adSlot: '5773059'
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
        publisherId: '164422',
        adSlot: '5753984'
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
        publisherId: '164422',
        adSlot: '5753988'
      }
    }]
  },
  {
    code: '/22794232631/freegle_myposts_desktop_right',
    mediaTypes: {
      banner: {
        sizes: squarish_sizes
      }
    },
    bids: [{
      bidder: 'pubmatic',
      params: {
        publisherId: '164422',
        adSlot: '5753988'
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
        publisherId: '164422',
        adSlot: '5753983'
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
        publisherId: '164422',
        adSlot: '5753982'
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
        publisherId: '164422',
        adSlot: '5753987'
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
        publisherId: '164422',
        adSlot: '5753986'
      }
    }]
  }
]

// ======== DO NOT EDIT BELOW THIS LINE =========== //
var pbjs = pbjs || {}
pbjs.que = pbjs.que || []

pbjs.que.push(function() {
  pbjs.addAdUnits(adUnits)
  pbjs.requestBids({
    bidsBackHandler: backHandler,
    timeout: PREBID_TIMEOUT
  })
})

function initAdserver () {
  if (pbjs.initAdserverSet) return
  pbjs.initAdserverSet = true
  googletag.cmd.push(function() {
    pbjs.que.push(function() {
      pbjs.setTargetingForGPTAsync()

      // Signal that the prebid is complete, which will trigger rendering in ExternalDa.
      console.log('Signal that prebid is complete')
      window.miscStore.adPrebidComplete = true
      console.log('Set it ok')
      window.googletag.enableServices()
    })
  })
}

// Prebid callback
function backHandler(bids, timedOut, auctionId) {
  console.log('Back handler', bids, timedOut, auctionId)
  initAdserver()
}

// in case PBJS doesn't load
setTimeout(function() {
  initAdserver()
}, FAILSAFE_TIMEOUT)
