"use strict";
(() => {
  // src/scripts/shared/types.ts
  var widgetTypes = ["donateButton", "attachCheckout"];

  // src/scripts/widget.ts
  var injectWidget = () => {
    var _a, _b;
    const script = document.currentScript;
    const attributes = script.dataset;
    const widgetType = attributes.widgettype;
    let widgetSpecificScriptSrc = "";
    switch (widgetType) {
      case "donateButton":
        widgetSpecificScriptSrc = "https://www.justgiving.com/widgets/scripts/donateButton/insertDonateButton.js";
        break;
      case "attachCheckout":
        widgetSpecificScriptSrc = "/justgiving/attachCheckout.js";
        break;
      default:
        console.error(`JG Widget: data-widgetType is not one of ${widgetTypes.join(", ")}`);
        script.remove();
        return;
    }
    const widgetSpecificScript = document.createElement("script");
    widgetSpecificScript.type = "text/javascript";
    widgetSpecificScript.src = widgetSpecificScriptSrc;
    for (const key in attributes) {
      widgetSpecificScript.setAttribute(`data-${key}`, (_a = attributes[key]) != null ? _a : "");
    }
    (_b = script.parentNode) == null ? void 0 : _b.insertBefore(widgetSpecificScript, script);
    script.remove();
  };
  if (true) {
    injectWidget();
  }
})();