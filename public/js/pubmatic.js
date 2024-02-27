// Callback code start

var IHPWT = {} //Initialize Namespace
var pbjs = pbjs || {}
pbjs.que = pbjs.que || []
var googletag = googletag || {}
googletag.cmd = googletag.cmd || []
var gptRan = false
IHPWT.jsLoaded = function() { //PubMatic pwt.js on load callback is used to load GPT
  loadGPT()
}
var loadGPT = function() {
  // Check the gptRan flag
  if (!gptRan) {
    gptRan = true
    var pbjsEl = document.createElement('script')
    pbjsEl.type = 'text/javascript'
    pbjsEl.async = true
    pbjsEl.src = '/js/prebid.js'
    var pbjsTargetEl = document.getElementsByTagName('head')[0]
    pbjsTargetEl.insertBefore(pbjsEl, pbjsTargetEl.firstChild)
  }
}
// Failsafe to call gpt
setTimeout(loadGPT, 500);

// Callback code end

// ID hub code for EU traffic start

(function() {
  var purl = window.location.href
  var url = '//ads.pubmatic.com/AdServer/js/pwt/164422/12426/'
  var profileVersionId = ''
  if (purl.indexOf('pwtv=') > 0) {
    var regexp = /pwtv=(.*?)(&|$)/g
    var matches = regexp.exec(purl)
    if (matches.length >= 2 && matches[1].length > 0) {
      profileVersionId = '/' + matches[1]
    }
  }
  var wtads = document.createElement('script')
  wtads.async = true
  wtads.type = 'text/javascript'
  wtads.src = url + profileVersionId + '/pwt.js'
  var node = document.getElementsByTagName('script')[0]
  node.parentNode.insertBefore(wtads, node)
})();

// ID hub code for EU traffic End

// ID hub code for Non EU traffic start

(function() {
  var purl = window.location.href
  var url = '//ads.pubmatic.com/AdServer/js/pwt/164422/12427/'
  var profileVersionId = ''
  if (purl.indexOf('pwtv=') > 0) {
    var regexp = /pwtv=(.*?)(&|$)/g
    var matches = regexp.exec(purl)
    if (matches.length >= 2 && matches[1].length > 0) {
      profileVersionId = '/' + matches[1]
    }
  }
  var wtads = document.createElement('script')
  wtads.async = true
  wtads.type = 'text/javascript'
  wtads.src = url + profileVersionId + '/pwt.js'
  var node = document.getElementsByTagName('script')[0]
  node.parentNode.insertBefore(wtads, node)
})()

// ID hub code for Non EU traffic End






