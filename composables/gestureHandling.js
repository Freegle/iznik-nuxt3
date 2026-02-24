/*
 * Leaflet Gesture Handling - ESM replacement
 *
 * Drop-in replacement for the `leaflet-gesture-handling` npm package, which is
 * a UMD module that accesses the global `L` at module-evaluation time.  That
 * breaks any bundler optimisation that changes script-loading order (Vite
 * pre-bundling, nuxt-vitalizer, manual-chunks, etc.).
 *
 * This version receives `L` as a parameter so it has zero global dependencies
 * and can be safely tree-shaken / code-split.
 *
 * Original: https://github.com/elmarquis/Leaflet.GestureHandling (MIT)
 */

const LanguageContent = {
  en: {
    touch: 'Use two fingers to move the map',
    scroll: 'Use ctrl + scroll to zoom the map',
    scrollMac: 'Use \u2318 + scroll to zoom the map',
  },
  'en-GB': {
    touch: 'Use two fingers to move the map',
    scroll: 'Use ctrl + scroll to zoom the map',
    scrollMac: 'Use \u2318 + scroll to zoom the map',
  },
  fr: {
    touch: 'Utilisez deux\u00A0doigts pour d\u00E9placer la carte',
    scroll:
      "Vous pouvez zoomer sur la carte \u00E0 l'aide de CTRL+Molette de d\u00E9filement",
    scrollMac:
      "Vous pouvez zoomer sur la carte \u00E0 l'aide de \u2318+Molette de d\u00E9filement",
  },
  de: {
    touch: 'Verschieben der Karte mit zwei Fingern',
    scroll: 'Verwende Strg+Scrollen zum Zoomen der Karte',
    scrollMac: '\u2318',
  },
  es: {
    touch: 'Para mover el mapa, utiliza dos dedos',
    scroll:
      'Mant\u00E9n pulsada la tecla Ctrl mientras te desplazas para acercar o alejar el mapa',
    scrollMac:
      'Mant\u00E9n pulsada la tecla \u2318 mientras te desplazas para acercar o alejar el mapa',
  },
  cy: {
    touch: 'Defnyddiwch ddau fys i symud y map',
    scroll: "Defnyddiwch ctrl + sgrolio i chwyddo'r map",
    scrollMac: "Defnyddiwch \u2318 + sgrolio i chwyddo'r map",
  },
}

/**
 * Register the gesture-handling handler on the given Leaflet instance.
 *
 * Call this once after `window.L` (or your local L reference) is ready.
 * It adds a `gestureHandling` handler that maps can opt into via
 * `{ gestureHandling: true }` in their options.
 *
 * @param {object} L  The Leaflet namespace object
 * @returns {Function} The GestureHandling handler class
 */
export function registerGestureHandling(L) {
  L.Map.mergeOptions({
    gestureHandlingOptions: {
      text: {},
      duration: 1000,
    },
  })

  let draggingMap = false

  const GestureHandling = L.Handler.extend({
    addHooks() {
      this._handleTouch = this._handleTouch.bind(this)
      this._setupPluginOptions()
      this._setLanguageContent()
      this._disableInteractions()

      this._map._container.addEventListener('touchstart', this._handleTouch)
      this._map._container.addEventListener('touchmove', this._handleTouch)
      this._map._container.addEventListener('touchend', this._handleTouch)
      this._map._container.addEventListener('touchcancel', this._handleTouch)
      this._map._container.addEventListener('click', this._handleTouch)

      L.DomEvent.on(this._map._container, 'wheel', this._handleScroll, this)
      L.DomEvent.on(this._map, 'mouseover', this._handleMouseOver, this)
      L.DomEvent.on(this._map, 'mouseout', this._handleMouseOut, this)
      L.DomEvent.on(this._map, 'movestart', this._handleDragging, this)
      L.DomEvent.on(this._map, 'move', this._handleDragging, this)
      L.DomEvent.on(this._map, 'moveend', this._handleDragging, this)
    },

    removeHooks() {
      this._enableInteractions()

      this._map._container.removeEventListener('touchstart', this._handleTouch)
      this._map._container.removeEventListener('touchmove', this._handleTouch)
      this._map._container.removeEventListener('touchend', this._handleTouch)
      this._map._container.removeEventListener('touchcancel', this._handleTouch)
      this._map._container.removeEventListener('click', this._handleTouch)

      L.DomEvent.off(this._map._container, 'wheel', this._handleScroll, this)
      L.DomEvent.off(this._map, 'mouseover', this._handleMouseOver, this)
      L.DomEvent.off(this._map, 'mouseout', this._handleMouseOut, this)
      L.DomEvent.off(this._map, 'movestart', this._handleDragging, this)
      L.DomEvent.off(this._map, 'move', this._handleDragging, this)
      L.DomEvent.off(this._map, 'moveend', this._handleDragging, this)
    },

    _handleDragging(e) {
      if (e.type === 'movestart' || e.type === 'move') {
        draggingMap = true
      } else if (e.type === 'moveend') {
        draggingMap = false
      }
    },

    _disableInteractions() {
      this._map.dragging.disable()
      this._map.scrollWheelZoom.disable()
      if (this._map.tap) {
        this._map.tap.disable()
      }
    },

    _enableInteractions() {
      this._map.dragging.enable()
      this._map.scrollWheelZoom.enable()
      if (this._map.tap) {
        this._map.tap.enable()
      }
    },

    _setupPluginOptions() {
      if (this._map.options.gestureHandlingText) {
        this._map.options.gestureHandlingOptions.text =
          this._map.options.gestureHandlingText
      }
    },

    _setLanguageContent() {
      let languageContent
      const opts = this._map.options.gestureHandlingOptions

      if (opts?.text?.touch && opts?.text?.scroll && opts?.text?.scrollMac) {
        languageContent = opts.text
      } else {
        let lang = navigator.languages
          ? navigator.languages[0]
          : navigator.language || navigator.userLanguage

        if (!lang) lang = 'en'
        languageContent = LanguageContent[lang]

        if (!languageContent && lang.includes('-')) {
          lang = lang.split('-')[0]
          languageContent = LanguageContent[lang]
        }

        if (!languageContent) {
          languageContent = LanguageContent.en
        }
      }

      const isMac = navigator.platform.toUpperCase().includes('MAC')
      const scrollContent = isMac
        ? languageContent.scrollMac
        : languageContent.scroll

      this._map._container.setAttribute(
        'data-gesture-handling-touch-content',
        languageContent.touch
      )
      this._map._container.setAttribute(
        'data-gesture-handling-scroll-content',
        scrollContent
      )
    },

    _handleTouch(e) {
      const ignoreList = [
        'leaflet-control-minimap',
        'leaflet-interactive',
        'leaflet-popup-content',
        'leaflet-popup-content-wrapper',
        'leaflet-popup-close-button',
        'leaflet-control-zoom-in',
        'leaflet-control-zoom-out',
      ]

      let ignoreElement = false
      for (let i = 0; i < ignoreList.length; i++) {
        if (L.DomUtil.hasClass(e.target, ignoreList[i])) {
          ignoreElement = true
        }
      }

      if (ignoreElement) {
        if (
          L.DomUtil.hasClass(e.target, 'leaflet-interactive') &&
          e.type === 'touchmove' &&
          e.touches.length === 1
        ) {
          L.DomUtil.addClass(
            this._map._container,
            'leaflet-gesture-handling-touch-warning'
          )
          this._disableInteractions()
        } else {
          L.DomUtil.removeClass(
            this._map._container,
            'leaflet-gesture-handling-touch-warning'
          )
        }
        return
      }

      if (e.type !== 'touchmove' && e.type !== 'touchstart') {
        L.DomUtil.removeClass(
          this._map._container,
          'leaflet-gesture-handling-touch-warning'
        )
        return
      }

      if (e.touches.length === 1) {
        L.DomUtil.addClass(
          this._map._container,
          'leaflet-gesture-handling-touch-warning'
        )
        this._disableInteractions()
      } else {
        e.preventDefault()
        this._enableInteractions()
        L.DomUtil.removeClass(
          this._map._container,
          'leaflet-gesture-handling-touch-warning'
        )
      }
    },

    _isScrolling: false,

    _handleScroll(e) {
      if (e.metaKey || e.ctrlKey) {
        e.preventDefault()
        L.DomUtil.removeClass(
          this._map._container,
          'leaflet-gesture-handling-scroll-warning'
        )
        this._map.scrollWheelZoom.enable()
      } else {
        L.DomUtil.addClass(
          this._map._container,
          'leaflet-gesture-handling-scroll-warning'
        )
        this._map.scrollWheelZoom.disable()

        clearTimeout(this._isScrolling)
        this._isScrolling = setTimeout(() => {
          const warnings = document.getElementsByClassName(
            'leaflet-gesture-handling-scroll-warning'
          )
          for (let i = 0; i < warnings.length; i++) {
            L.DomUtil.removeClass(
              warnings[i],
              'leaflet-gesture-handling-scroll-warning'
            )
          }
        }, this._map.options.gestureHandlingOptions.duration)
      }
    },

    _handleMouseOver() {
      this._enableInteractions()
    },

    _handleMouseOut() {
      if (!draggingMap) {
        this._disableInteractions()
      }
    },
  })

  L.Map.addInitHook('addHandler', 'gestureHandling', GestureHandling)

  return GestureHandling
}
