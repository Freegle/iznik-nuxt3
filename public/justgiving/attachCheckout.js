"use strict";
(() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));

  // node_modules/prop-types/node_modules/react-is/cjs/react-is.development.js
  var require_react_is_development = __commonJS({
    "node_modules/prop-types/node_modules/react-is/cjs/react-is.development.js"(exports) {
      "use strict";
      if (true) {
        (function() {
          "use strict";
          var hasSymbol = typeof Symbol === "function" && Symbol.for;
          var REACT_ELEMENT_TYPE = hasSymbol ? Symbol.for("react.element") : 60103;
          var REACT_PORTAL_TYPE = hasSymbol ? Symbol.for("react.portal") : 60106;
          var REACT_FRAGMENT_TYPE = hasSymbol ? Symbol.for("react.fragment") : 60107;
          var REACT_STRICT_MODE_TYPE = hasSymbol ? Symbol.for("react.strict_mode") : 60108;
          var REACT_PROFILER_TYPE = hasSymbol ? Symbol.for("react.profiler") : 60114;
          var REACT_PROVIDER_TYPE = hasSymbol ? Symbol.for("react.provider") : 60109;
          var REACT_CONTEXT_TYPE = hasSymbol ? Symbol.for("react.context") : 60110;
          var REACT_ASYNC_MODE_TYPE = hasSymbol ? Symbol.for("react.async_mode") : 60111;
          var REACT_CONCURRENT_MODE_TYPE = hasSymbol ? Symbol.for("react.concurrent_mode") : 60111;
          var REACT_FORWARD_REF_TYPE = hasSymbol ? Symbol.for("react.forward_ref") : 60112;
          var REACT_SUSPENSE_TYPE = hasSymbol ? Symbol.for("react.suspense") : 60113;
          var REACT_SUSPENSE_LIST_TYPE = hasSymbol ? Symbol.for("react.suspense_list") : 60120;
          var REACT_MEMO_TYPE = hasSymbol ? Symbol.for("react.memo") : 60115;
          var REACT_LAZY_TYPE = hasSymbol ? Symbol.for("react.lazy") : 60116;
          var REACT_BLOCK_TYPE = hasSymbol ? Symbol.for("react.block") : 60121;
          var REACT_FUNDAMENTAL_TYPE = hasSymbol ? Symbol.for("react.fundamental") : 60117;
          var REACT_RESPONDER_TYPE = hasSymbol ? Symbol.for("react.responder") : 60118;
          var REACT_SCOPE_TYPE = hasSymbol ? Symbol.for("react.scope") : 60119;
          function isValidElementType(type) {
            return typeof type === "string" || typeof type === "function" || // Note: its typeof might be other than 'symbol' or 'number' if it's a polyfill.
              type === REACT_FRAGMENT_TYPE || type === REACT_CONCURRENT_MODE_TYPE || type === REACT_PROFILER_TYPE || type === REACT_STRICT_MODE_TYPE || type === REACT_SUSPENSE_TYPE || type === REACT_SUSPENSE_LIST_TYPE || typeof type === "object" && type !== null && (type.$$typeof === REACT_LAZY_TYPE || type.$$typeof === REACT_MEMO_TYPE || type.$$typeof === REACT_PROVIDER_TYPE || type.$$typeof === REACT_CONTEXT_TYPE || type.$$typeof === REACT_FORWARD_REF_TYPE || type.$$typeof === REACT_FUNDAMENTAL_TYPE || type.$$typeof === REACT_RESPONDER_TYPE || type.$$typeof === REACT_SCOPE_TYPE || type.$$typeof === REACT_BLOCK_TYPE);
          }
          function typeOf(object2) {
            if (typeof object2 === "object" && object2 !== null) {
              var $$typeof = object2.$$typeof;
              switch ($$typeof) {
                case REACT_ELEMENT_TYPE:
                  var type = object2.type;
                  switch (type) {
                    case REACT_ASYNC_MODE_TYPE:
                    case REACT_CONCURRENT_MODE_TYPE:
                    case REACT_FRAGMENT_TYPE:
                    case REACT_PROFILER_TYPE:
                    case REACT_STRICT_MODE_TYPE:
                    case REACT_SUSPENSE_TYPE:
                      return type;
                    default:
                      var $$typeofType = type && type.$$typeof;
                      switch ($$typeofType) {
                        case REACT_CONTEXT_TYPE:
                        case REACT_FORWARD_REF_TYPE:
                        case REACT_LAZY_TYPE:
                        case REACT_MEMO_TYPE:
                        case REACT_PROVIDER_TYPE:
                          return $$typeofType;
                        default:
                          return $$typeof;
                      }
                  }
                case REACT_PORTAL_TYPE:
                  return $$typeof;
              }
            }
            return void 0;
          }
          var AsyncMode = REACT_ASYNC_MODE_TYPE;
          var ConcurrentMode = REACT_CONCURRENT_MODE_TYPE;
          var ContextConsumer = REACT_CONTEXT_TYPE;
          var ContextProvider = REACT_PROVIDER_TYPE;
          var Element = REACT_ELEMENT_TYPE;
          var ForwardRef = REACT_FORWARD_REF_TYPE;
          var Fragment = REACT_FRAGMENT_TYPE;
          var Lazy = REACT_LAZY_TYPE;
          var Memo = REACT_MEMO_TYPE;
          var Portal = REACT_PORTAL_TYPE;
          var Profiler = REACT_PROFILER_TYPE;
          var StrictMode = REACT_STRICT_MODE_TYPE;
          var Suspense = REACT_SUSPENSE_TYPE;
          var hasWarnedAboutDeprecatedIsAsyncMode = false;
          function isAsyncMode(object2) {
            {
              if (!hasWarnedAboutDeprecatedIsAsyncMode) {
                hasWarnedAboutDeprecatedIsAsyncMode = true;
                console["warn"]("The ReactIs.isAsyncMode() alias has been deprecated, and will be removed in React 17+. Update your code to use ReactIs.isConcurrentMode() instead. It has the exact same API.");
              }
            }
            return isConcurrentMode(object2) || typeOf(object2) === REACT_ASYNC_MODE_TYPE;
          }
          function isConcurrentMode(object2) {
            return typeOf(object2) === REACT_CONCURRENT_MODE_TYPE;
          }
          function isContextConsumer(object2) {
            return typeOf(object2) === REACT_CONTEXT_TYPE;
          }
          function isContextProvider(object2) {
            return typeOf(object2) === REACT_PROVIDER_TYPE;
          }
          function isElement(object2) {
            return typeof object2 === "object" && object2 !== null && object2.$$typeof === REACT_ELEMENT_TYPE;
          }
          function isForwardRef(object2) {
            return typeOf(object2) === REACT_FORWARD_REF_TYPE;
          }
          function isFragment(object2) {
            return typeOf(object2) === REACT_FRAGMENT_TYPE;
          }
          function isLazy(object2) {
            return typeOf(object2) === REACT_LAZY_TYPE;
          }
          function isMemo(object2) {
            return typeOf(object2) === REACT_MEMO_TYPE;
          }
          function isPortal(object2) {
            return typeOf(object2) === REACT_PORTAL_TYPE;
          }
          function isProfiler(object2) {
            return typeOf(object2) === REACT_PROFILER_TYPE;
          }
          function isStrictMode(object2) {
            return typeOf(object2) === REACT_STRICT_MODE_TYPE;
          }
          function isSuspense(object2) {
            return typeOf(object2) === REACT_SUSPENSE_TYPE;
          }
          exports.AsyncMode = AsyncMode;
          exports.ConcurrentMode = ConcurrentMode;
          exports.ContextConsumer = ContextConsumer;
          exports.ContextProvider = ContextProvider;
          exports.Element = Element;
          exports.ForwardRef = ForwardRef;
          exports.Fragment = Fragment;
          exports.Lazy = Lazy;
          exports.Memo = Memo;
          exports.Portal = Portal;
          exports.Profiler = Profiler;
          exports.StrictMode = StrictMode;
          exports.Suspense = Suspense;
          exports.isAsyncMode = isAsyncMode;
          exports.isConcurrentMode = isConcurrentMode;
          exports.isContextConsumer = isContextConsumer;
          exports.isContextProvider = isContextProvider;
          exports.isElement = isElement;
          exports.isForwardRef = isForwardRef;
          exports.isFragment = isFragment;
          exports.isLazy = isLazy;
          exports.isMemo = isMemo;
          exports.isPortal = isPortal;
          exports.isProfiler = isProfiler;
          exports.isStrictMode = isStrictMode;
          exports.isSuspense = isSuspense;
          exports.isValidElementType = isValidElementType;
          exports.typeOf = typeOf;
        })();
      }
    }
  });

  // node_modules/prop-types/node_modules/react-is/index.js
  var require_react_is = __commonJS({
    "node_modules/prop-types/node_modules/react-is/index.js"(exports, module) {
      "use strict";
      if (false) {
        module.exports = null;
      } else {
        module.exports = require_react_is_development();
      }
    }
  });

  // node_modules/object-assign/index.js
  var require_object_assign = __commonJS({
    "node_modules/object-assign/index.js"(exports, module) {
      "use strict";
      var getOwnPropertySymbols = Object.getOwnPropertySymbols;
      var hasOwnProperty = Object.prototype.hasOwnProperty;
      var propIsEnumerable = Object.prototype.propertyIsEnumerable;
      function toObject(val) {
        if (val === null || val === void 0) {
          throw new TypeError("Object.assign cannot be called with null or undefined");
        }
        return Object(val);
      }
      function shouldUseNative() {
        try {
          if (!Object.assign) {
            return false;
          }
          var test1 = new String("abc");
          test1[5] = "de";
          if (Object.getOwnPropertyNames(test1)[0] === "5") {
            return false;
          }
          var test2 = {};
          for (var i3 = 0; i3 < 10; i3++) {
            test2["_" + String.fromCharCode(i3)] = i3;
          }
          var order2 = Object.getOwnPropertyNames(test2).map(function(n2) {
            return test2[n2];
          });
          if (order2.join("") !== "0123456789") {
            return false;
          }
          var test3 = {};
          "abcdefghijklmnopqrst".split("").forEach(function(letter) {
            test3[letter] = letter;
          });
          if (Object.keys(Object.assign({}, test3)).join("") !== "abcdefghijklmnopqrst") {
            return false;
          }
          return true;
        } catch (err) {
          return false;
        }
      }
      module.exports = shouldUseNative() ? Object.assign : function(target, source) {
        var from;
        var to = toObject(target);
        var symbols;
        for (var s3 = 1; s3 < arguments.length; s3++) {
          from = Object(arguments[s3]);
          for (var key in from) {
            if (hasOwnProperty.call(from, key)) {
              to[key] = from[key];
            }
          }
          if (getOwnPropertySymbols) {
            symbols = getOwnPropertySymbols(from);
            for (var i3 = 0; i3 < symbols.length; i3++) {
              if (propIsEnumerable.call(from, symbols[i3])) {
                to[symbols[i3]] = from[symbols[i3]];
              }
            }
          }
        }
        return to;
      };
    }
  });

  // node_modules/prop-types/lib/ReactPropTypesSecret.js
  var require_ReactPropTypesSecret = __commonJS({
    "node_modules/prop-types/lib/ReactPropTypesSecret.js"(exports, module) {
      "use strict";
      var ReactPropTypesSecret = "SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED";
      module.exports = ReactPropTypesSecret;
    }
  });

  // node_modules/prop-types/lib/has.js
  var require_has = __commonJS({
    "node_modules/prop-types/lib/has.js"(exports, module) {
      module.exports = Function.call.bind(Object.prototype.hasOwnProperty);
    }
  });

  // node_modules/prop-types/checkPropTypes.js
  var require_checkPropTypes = __commonJS({
    "node_modules/prop-types/checkPropTypes.js"(exports, module) {
      "use strict";
      var printWarning = function() {
      };
      if (true) {
        ReactPropTypesSecret = require_ReactPropTypesSecret();
        loggedTypeFailures = {};
        has = require_has();
        printWarning = function(text) {
          var message = "Warning: " + text;
          if (typeof console !== "undefined") {
            console.error(message);
          }
          try {
            throw new Error(message);
          } catch (x4) {
          }
        };
      }
      var ReactPropTypesSecret;
      var loggedTypeFailures;
      var has;
      function checkPropTypes(typeSpecs, values, location, componentName, getStack) {
        if (true) {
          for (var typeSpecName in typeSpecs) {
            if (has(typeSpecs, typeSpecName)) {
              var error;
              try {
                if (typeof typeSpecs[typeSpecName] !== "function") {
                  var err = Error(
                    (componentName || "React class") + ": " + location + " type `" + typeSpecName + "` is invalid; it must be a function, usually from the `prop-types` package, but received `" + typeof typeSpecs[typeSpecName] + "`.This often happens because of typos such as `PropTypes.function` instead of `PropTypes.func`."
                  );
                  err.name = "Invariant Violation";
                  throw err;
                }
                error = typeSpecs[typeSpecName](values, typeSpecName, componentName, location, null, ReactPropTypesSecret);
              } catch (ex) {
                error = ex;
              }
              if (error && !(error instanceof Error)) {
                printWarning(
                  (componentName || "React class") + ": type specification of " + location + " `" + typeSpecName + "` is invalid; the type checker function must return `null` or an `Error` but returned a " + typeof error + ". You may have forgotten to pass an argument to the type checker creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and shape all require an argument)."
                );
              }
              if (error instanceof Error && !(error.message in loggedTypeFailures)) {
                loggedTypeFailures[error.message] = true;
                var stack = getStack ? getStack() : "";
                printWarning(
                  "Failed " + location + " type: " + error.message + (stack != null ? stack : "")
                );
              }
            }
          }
        }
      }
      checkPropTypes.resetWarningCache = function() {
        if (true) {
          loggedTypeFailures = {};
        }
      };
      module.exports = checkPropTypes;
    }
  });

  // node_modules/prop-types/factoryWithTypeCheckers.js
  var require_factoryWithTypeCheckers = __commonJS({
    "node_modules/prop-types/factoryWithTypeCheckers.js"(exports, module) {
      "use strict";
      var ReactIs = require_react_is();
      var assign = require_object_assign();
      var ReactPropTypesSecret = require_ReactPropTypesSecret();
      var has = require_has();
      var checkPropTypes = require_checkPropTypes();
      var printWarning = function() {
      };
      if (true) {
        printWarning = function(text) {
          var message = "Warning: " + text;
          if (typeof console !== "undefined") {
            console.error(message);
          }
          try {
            throw new Error(message);
          } catch (x4) {
          }
        };
      }
      function emptyFunctionThatReturnsNull() {
        return null;
      }
      module.exports = function(isValidElement, throwOnDirectAccess) {
        var ITERATOR_SYMBOL = typeof Symbol === "function" && Symbol.iterator;
        var FAUX_ITERATOR_SYMBOL = "@@iterator";
        function getIteratorFn(maybeIterable) {
          var iteratorFn = maybeIterable && (ITERATOR_SYMBOL && maybeIterable[ITERATOR_SYMBOL] || maybeIterable[FAUX_ITERATOR_SYMBOL]);
          if (typeof iteratorFn === "function") {
            return iteratorFn;
          }
        }
        var ANONYMOUS = "<<anonymous>>";
        var ReactPropTypes = {
          array: createPrimitiveTypeChecker("array"),
          bigint: createPrimitiveTypeChecker("bigint"),
          bool: createPrimitiveTypeChecker("boolean"),
          func: createPrimitiveTypeChecker("function"),
          number: createPrimitiveTypeChecker("number"),
          object: createPrimitiveTypeChecker("object"),
          string: createPrimitiveTypeChecker("string"),
          symbol: createPrimitiveTypeChecker("symbol"),
          any: createAnyTypeChecker(),
          arrayOf: createArrayOfTypeChecker,
          element: createElementTypeChecker(),
          elementType: createElementTypeTypeChecker(),
          instanceOf: createInstanceTypeChecker,
          node: createNodeChecker(),
          objectOf: createObjectOfTypeChecker,
          oneOf: createEnumTypeChecker,
          oneOfType: createUnionTypeChecker,
          shape: createShapeTypeChecker,
          exact: createStrictShapeTypeChecker
        };
        function is(x4, y3) {
          if (x4 === y3) {
            return x4 !== 0 || 1 / x4 === 1 / y3;
          } else {
            return x4 !== x4 && y3 !== y3;
          }
        }
        function PropTypeError(message, data) {
          this.message = message;
          this.data = data && typeof data === "object" ? data : {};
          this.stack = "";
        }
        PropTypeError.prototype = Error.prototype;
        function createChainableTypeChecker(validate) {
          if (true) {
            var manualPropTypeCallCache = {};
            var manualPropTypeWarningCount = 0;
          }
          function checkType(isRequired, props, propName, componentName, location, propFullName, secret) {
            componentName = componentName || ANONYMOUS;
            propFullName = propFullName || propName;
            if (secret !== ReactPropTypesSecret) {
              if (throwOnDirectAccess) {
                var err = new Error(
                  "Calling PropTypes validators directly is not supported by the `prop-types` package. Use `PropTypes.checkPropTypes()` to call them. Read more at http://fb.me/use-check-prop-types"
                );
                err.name = "Invariant Violation";
                throw err;
              } else if (typeof console !== "undefined") {
                var cacheKey = componentName + ":" + propName;
                if (!manualPropTypeCallCache[cacheKey] && // Avoid spamming the console because they are often not actionable except for lib authors
                  manualPropTypeWarningCount < 3) {
                  printWarning(
                    "You are manually calling a React.PropTypes validation function for the `" + propFullName + "` prop on `" + componentName + "`. This is deprecated and will throw in the standalone `prop-types` package. You may be seeing this warning due to a third-party PropTypes library. See https://fb.me/react-warning-dont-call-proptypes for details."
                  );
                  manualPropTypeCallCache[cacheKey] = true;
                  manualPropTypeWarningCount++;
                }
              }
            }
            if (props[propName] == null) {
              if (isRequired) {
                if (props[propName] === null) {
                  return new PropTypeError("The " + location + " `" + propFullName + "` is marked as required " + ("in `" + componentName + "`, but its value is `null`."));
                }
                return new PropTypeError("The " + location + " `" + propFullName + "` is marked as required in " + ("`" + componentName + "`, but its value is `undefined`."));
              }
              return null;
            } else {
              return validate(props, propName, componentName, location, propFullName);
            }
          }
          var chainedCheckType = checkType.bind(null, false);
          chainedCheckType.isRequired = checkType.bind(null, true);
          return chainedCheckType;
        }
        function createPrimitiveTypeChecker(expectedType) {
          function validate(props, propName, componentName, location, propFullName, secret) {
            var propValue = props[propName];
            var propType = getPropType(propValue);
            if (propType !== expectedType) {
              var preciseType = getPreciseType(propValue);
              return new PropTypeError(
                "Invalid " + location + " `" + propFullName + "` of type " + ("`" + preciseType + "` supplied to `" + componentName + "`, expected ") + ("`" + expectedType + "`."),
                { expectedType }
              );
            }
            return null;
          }
          return createChainableTypeChecker(validate);
        }
        function createAnyTypeChecker() {
          return createChainableTypeChecker(emptyFunctionThatReturnsNull);
        }
        function createArrayOfTypeChecker(typeChecker) {
          function validate(props, propName, componentName, location, propFullName) {
            if (typeof typeChecker !== "function") {
              return new PropTypeError("Property `" + propFullName + "` of component `" + componentName + "` has invalid PropType notation inside arrayOf.");
            }
            var propValue = props[propName];
            if (!Array.isArray(propValue)) {
              var propType = getPropType(propValue);
              return new PropTypeError("Invalid " + location + " `" + propFullName + "` of type " + ("`" + propType + "` supplied to `" + componentName + "`, expected an array."));
            }
            for (var i3 = 0; i3 < propValue.length; i3++) {
              var error = typeChecker(propValue, i3, componentName, location, propFullName + "[" + i3 + "]", ReactPropTypesSecret);
              if (error instanceof Error) {
                return error;
              }
            }
            return null;
          }
          return createChainableTypeChecker(validate);
        }
        function createElementTypeChecker() {
          function validate(props, propName, componentName, location, propFullName) {
            var propValue = props[propName];
            if (!isValidElement(propValue)) {
              var propType = getPropType(propValue);
              return new PropTypeError("Invalid " + location + " `" + propFullName + "` of type " + ("`" + propType + "` supplied to `" + componentName + "`, expected a single ReactElement."));
            }
            return null;
          }
          return createChainableTypeChecker(validate);
        }
        function createElementTypeTypeChecker() {
          function validate(props, propName, componentName, location, propFullName) {
            var propValue = props[propName];
            if (!ReactIs.isValidElementType(propValue)) {
              var propType = getPropType(propValue);
              return new PropTypeError("Invalid " + location + " `" + propFullName + "` of type " + ("`" + propType + "` supplied to `" + componentName + "`, expected a single ReactElement type."));
            }
            return null;
          }
          return createChainableTypeChecker(validate);
        }
        function createInstanceTypeChecker(expectedClass) {
          function validate(props, propName, componentName, location, propFullName) {
            if (!(props[propName] instanceof expectedClass)) {
              var expectedClassName = expectedClass.name || ANONYMOUS;
              var actualClassName = getClassName(props[propName]);
              return new PropTypeError("Invalid " + location + " `" + propFullName + "` of type " + ("`" + actualClassName + "` supplied to `" + componentName + "`, expected ") + ("instance of `" + expectedClassName + "`."));
            }
            return null;
          }
          return createChainableTypeChecker(validate);
        }
        function createEnumTypeChecker(expectedValues) {
          if (!Array.isArray(expectedValues)) {
            if (true) {
              if (arguments.length > 1) {
                printWarning(
                  "Invalid arguments supplied to oneOf, expected an array, got " + arguments.length + " arguments. A common mistake is to write oneOf(x, y, z) instead of oneOf([x, y, z])."
                );
              } else {
                printWarning("Invalid argument supplied to oneOf, expected an array.");
              }
            }
            return emptyFunctionThatReturnsNull;
          }
          function validate(props, propName, componentName, location, propFullName) {
            var propValue = props[propName];
            for (var i3 = 0; i3 < expectedValues.length; i3++) {
              if (is(propValue, expectedValues[i3])) {
                return null;
              }
            }
            var valuesString = JSON.stringify(expectedValues, function replacer(key, value) {
              var type = getPreciseType(value);
              if (type === "symbol") {
                return String(value);
              }
              return value;
            });
            return new PropTypeError("Invalid " + location + " `" + propFullName + "` of value `" + String(propValue) + "` " + ("supplied to `" + componentName + "`, expected one of " + valuesString + "."));
          }
          return createChainableTypeChecker(validate);
        }
        function createObjectOfTypeChecker(typeChecker) {
          function validate(props, propName, componentName, location, propFullName) {
            if (typeof typeChecker !== "function") {
              return new PropTypeError("Property `" + propFullName + "` of component `" + componentName + "` has invalid PropType notation inside objectOf.");
            }
            var propValue = props[propName];
            var propType = getPropType(propValue);
            if (propType !== "object") {
              return new PropTypeError("Invalid " + location + " `" + propFullName + "` of type " + ("`" + propType + "` supplied to `" + componentName + "`, expected an object."));
            }
            for (var key in propValue) {
              if (has(propValue, key)) {
                var error = typeChecker(propValue, key, componentName, location, propFullName + "." + key, ReactPropTypesSecret);
                if (error instanceof Error) {
                  return error;
                }
              }
            }
            return null;
          }
          return createChainableTypeChecker(validate);
        }
        function createUnionTypeChecker(arrayOfTypeCheckers) {
          if (!Array.isArray(arrayOfTypeCheckers)) {
            true ? printWarning("Invalid argument supplied to oneOfType, expected an instance of array.") : void 0;
            return emptyFunctionThatReturnsNull;
          }
          for (var i3 = 0; i3 < arrayOfTypeCheckers.length; i3++) {
            var checker = arrayOfTypeCheckers[i3];
            if (typeof checker !== "function") {
              printWarning(
                "Invalid argument supplied to oneOfType. Expected an array of check functions, but received " + getPostfixForTypeWarning(checker) + " at index " + i3 + "."
              );
              return emptyFunctionThatReturnsNull;
            }
          }
          function validate(props, propName, componentName, location, propFullName) {
            var expectedTypes = [];
            for (var i4 = 0; i4 < arrayOfTypeCheckers.length; i4++) {
              var checker2 = arrayOfTypeCheckers[i4];
              var checkerResult = checker2(props, propName, componentName, location, propFullName, ReactPropTypesSecret);
              if (checkerResult == null) {
                return null;
              }
              if (checkerResult.data && has(checkerResult.data, "expectedType")) {
                expectedTypes.push(checkerResult.data.expectedType);
              }
            }
            var expectedTypesMessage = expectedTypes.length > 0 ? ", expected one of type [" + expectedTypes.join(", ") + "]" : "";
            return new PropTypeError("Invalid " + location + " `" + propFullName + "` supplied to " + ("`" + componentName + "`" + expectedTypesMessage + "."));
          }
          return createChainableTypeChecker(validate);
        }
        function createNodeChecker() {
          function validate(props, propName, componentName, location, propFullName) {
            if (!isNode(props[propName])) {
              return new PropTypeError("Invalid " + location + " `" + propFullName + "` supplied to " + ("`" + componentName + "`, expected a ReactNode."));
            }
            return null;
          }
          return createChainableTypeChecker(validate);
        }
        function invalidValidatorError(componentName, location, propFullName, key, type) {
          return new PropTypeError(
            (componentName || "React class") + ": " + location + " type `" + propFullName + "." + key + "` is invalid; it must be a function, usually from the `prop-types` package, but received `" + type + "`."
          );
        }
        function createShapeTypeChecker(shapeTypes) {
          function validate(props, propName, componentName, location, propFullName) {
            var propValue = props[propName];
            var propType = getPropType(propValue);
            if (propType !== "object") {
              return new PropTypeError("Invalid " + location + " `" + propFullName + "` of type `" + propType + "` " + ("supplied to `" + componentName + "`, expected `object`."));
            }
            for (var key in shapeTypes) {
              var checker = shapeTypes[key];
              if (typeof checker !== "function") {
                return invalidValidatorError(componentName, location, propFullName, key, getPreciseType(checker));
              }
              var error = checker(propValue, key, componentName, location, propFullName + "." + key, ReactPropTypesSecret);
              if (error) {
                return error;
              }
            }
            return null;
          }
          return createChainableTypeChecker(validate);
        }
        function createStrictShapeTypeChecker(shapeTypes) {
          function validate(props, propName, componentName, location, propFullName) {
            var propValue = props[propName];
            var propType = getPropType(propValue);
            if (propType !== "object") {
              return new PropTypeError("Invalid " + location + " `" + propFullName + "` of type `" + propType + "` " + ("supplied to `" + componentName + "`, expected `object`."));
            }
            var allKeys = assign({}, props[propName], shapeTypes);
            for (var key in allKeys) {
              var checker = shapeTypes[key];
              if (has(shapeTypes, key) && typeof checker !== "function") {
                return invalidValidatorError(componentName, location, propFullName, key, getPreciseType(checker));
              }
              if (!checker) {
                return new PropTypeError(
                  "Invalid " + location + " `" + propFullName + "` key `" + key + "` supplied to `" + componentName + "`.\nBad object: " + JSON.stringify(props[propName], null, "  ") + "\nValid keys: " + JSON.stringify(Object.keys(shapeTypes), null, "  ")
                );
              }
              var error = checker(propValue, key, componentName, location, propFullName + "." + key, ReactPropTypesSecret);
              if (error) {
                return error;
              }
            }
            return null;
          }
          return createChainableTypeChecker(validate);
        }
        function isNode(propValue) {
          switch (typeof propValue) {
            case "number":
            case "string":
            case "undefined":
              return true;
            case "boolean":
              return !propValue;
            case "object":
              if (Array.isArray(propValue)) {
                return propValue.every(isNode);
              }
              if (propValue === null || isValidElement(propValue)) {
                return true;
              }
              var iteratorFn = getIteratorFn(propValue);
              if (iteratorFn) {
                var iterator = iteratorFn.call(propValue);
                var step;
                if (iteratorFn !== propValue.entries) {
                  while (!(step = iterator.next()).done) {
                    if (!isNode(step.value)) {
                      return false;
                    }
                  }
                } else {
                  while (!(step = iterator.next()).done) {
                    var entry = step.value;
                    if (entry) {
                      if (!isNode(entry[1])) {
                        return false;
                      }
                    }
                  }
                }
              } else {
                return false;
              }
              return true;
            default:
              return false;
          }
        }
        function isSymbol(propType, propValue) {
          if (propType === "symbol") {
            return true;
          }
          if (!propValue) {
            return false;
          }
          if (propValue["@@toStringTag"] === "Symbol") {
            return true;
          }
          if (typeof Symbol === "function" && propValue instanceof Symbol) {
            return true;
          }
          return false;
        }
        function getPropType(propValue) {
          var propType = typeof propValue;
          if (Array.isArray(propValue)) {
            return "array";
          }
          if (propValue instanceof RegExp) {
            return "object";
          }
          if (isSymbol(propType, propValue)) {
            return "symbol";
          }
          return propType;
        }
        function getPreciseType(propValue) {
          if (typeof propValue === "undefined" || propValue === null) {
            return "" + propValue;
          }
          var propType = getPropType(propValue);
          if (propType === "object") {
            if (propValue instanceof Date) {
              return "date";
            } else if (propValue instanceof RegExp) {
              return "regexp";
            }
          }
          return propType;
        }
        function getPostfixForTypeWarning(value) {
          var type = getPreciseType(value);
          switch (type) {
            case "array":
            case "object":
              return "an " + type;
            case "boolean":
            case "date":
            case "regexp":
              return "a " + type;
            default:
              return type;
          }
        }
        function getClassName(propValue) {
          if (!propValue.constructor || !propValue.constructor.name) {
            return ANONYMOUS;
          }
          return propValue.constructor.name;
        }
        ReactPropTypes.checkPropTypes = checkPropTypes;
        ReactPropTypes.resetWarningCache = checkPropTypes.resetWarningCache;
        ReactPropTypes.PropTypes = ReactPropTypes;
        return ReactPropTypes;
      };
    }
  });

  // node_modules/prop-types/index.js
  var require_prop_types = __commonJS({
    "node_modules/prop-types/index.js"(exports, module) {
      if (true) {
        ReactIs = require_react_is();
        throwOnDirectAccess = true;
        module.exports = require_factoryWithTypeCheckers()(ReactIs.isElement, throwOnDirectAccess);
      } else {
        module.exports = null();
      }
      var ReactIs;
      var throwOnDirectAccess;
    }
  });

  // src/scripts/shared/isMobileDevice.ts
  function isMobileDevice() {
    return Boolean(window.navigator.userAgent.match(/Mobi/i));
  }
  var isMobileDevice_default = isMobileDevice;

  // src/scripts/shared/utils.ts
  var getCheckoutLink = ({ startedBy, linkType, charityId, linkId, referrer }) => {
    if (linkType === "linkService") {
      if (!charityId) {
        throw new Error("JG Widget: No charityId provided");
      }
      return `https://link.justgiving.com/v1/charity/donate/charityId/${charityId}?startedBy=${startedBy}${referrer ? `&referrer=${referrer}` : ""}${!isMobileDevice_default() ? "&checkoutmode=headless" : ""}`;
    }
    if (charityId && linkId || !charityId && !linkId) {
      throw new Error("JG Widget: Provide only one of charityId or linkId");
    }
    return charityId ? `https://checkout.justgiving.com/c/${charityId}?startedBy=${startedBy}` : `https://checkout.justgiving.com/${linkId}?startedBy=${startedBy}`;
  };
  var isValidHref = (href) => {
    const urlRegExp = new RegExp(/^https:\/\/(checkout|link)(\.staging\.|\.)justgiving\.com/);
    return urlRegExp.test(href);
  };

  // node_modules/preact/dist/preact.module.js
  var n;
  var l;
  var u;
  var i;
  var t;
  var r;
  var o;
  var f;
  var e;
  var c = {};
  var s = [];
  var a = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i;
  function h(n2, l3) {
    for (var u3 in l3)
      n2[u3] = l3[u3];
    return n2;
  }
  function v(n2) {
    var l3 = n2.parentNode;
    l3 && l3.removeChild(n2);
  }
  function y(l3, u3, i3) {
    var t3, r3, o4, f3 = {};
    for (o4 in u3)
      "key" == o4 ? t3 = u3[o4] : "ref" == o4 ? r3 = u3[o4] : f3[o4] = u3[o4];
    if (arguments.length > 2 && (f3.children = arguments.length > 3 ? n.call(arguments, 2) : i3), "function" == typeof l3 && null != l3.defaultProps)
      for (o4 in l3.defaultProps)
        void 0 === f3[o4] && (f3[o4] = l3.defaultProps[o4]);
    return p(l3, f3, t3, r3, null);
  }
  function p(n2, i3, t3, r3, o4) {
    var f3 = { type: n2, props: i3, key: t3, ref: r3, __k: null, __: null, __b: 0, __e: null, __d: void 0, __c: null, __h: null, constructor: void 0, __v: null == o4 ? ++u : o4 };
    return null == o4 && null != l.vnode && l.vnode(f3), f3;
  }
  function d() {
    return { current: null };
  }
  function _(n2) {
    return n2.children;
  }
  function k(n2, l3, u3, i3, t3) {
    var r3;
    for (r3 in u3)
      "children" === r3 || "key" === r3 || r3 in l3 || g(n2, r3, null, u3[r3], i3);
    for (r3 in l3)
      t3 && "function" != typeof l3[r3] || "children" === r3 || "key" === r3 || "value" === r3 || "checked" === r3 || u3[r3] === l3[r3] || g(n2, r3, l3[r3], u3[r3], i3);
  }
  function b(n2, l3, u3) {
    "-" === l3[0] ? n2.setProperty(l3, null == u3 ? "" : u3) : n2[l3] = null == u3 ? "" : "number" != typeof u3 || a.test(l3) ? u3 : u3 + "px";
  }
  function g(n2, l3, u3, i3, t3) {
    var r3;
    n:
      if ("style" === l3)
        if ("string" == typeof u3)
          n2.style.cssText = u3;
        else {
          if ("string" == typeof i3 && (n2.style.cssText = i3 = ""), i3)
            for (l3 in i3)
              u3 && l3 in u3 || b(n2.style, l3, "");
          if (u3)
            for (l3 in u3)
              i3 && u3[l3] === i3[l3] || b(n2.style, l3, u3[l3]);
        }
      else if ("o" === l3[0] && "n" === l3[1])
        r3 = l3 !== (l3 = l3.replace(/Capture$/, "")), l3 = l3.toLowerCase() in n2 ? l3.toLowerCase().slice(2) : l3.slice(2), n2.l || (n2.l = {}), n2.l[l3 + r3] = u3, u3 ? i3 || n2.addEventListener(l3, r3 ? w : m, r3) : n2.removeEventListener(l3, r3 ? w : m, r3);
      else if ("dangerouslySetInnerHTML" !== l3) {
        if (t3)
          l3 = l3.replace(/xlink(H|:h)/, "h").replace(/sName$/, "s");
        else if ("width" !== l3 && "height" !== l3 && "href" !== l3 && "list" !== l3 && "form" !== l3 && "tabIndex" !== l3 && "download" !== l3 && l3 in n2)
          try {
            n2[l3] = null == u3 ? "" : u3;
            break n;
          } catch (n3) {
          }
        "function" == typeof u3 || (null == u3 || false === u3 && -1 == l3.indexOf("-") ? n2.removeAttribute(l3) : n2.setAttribute(l3, u3));
      }
  }
  function m(n2) {
    t = true;
    try {
      return this.l[n2.type + false](l.event ? l.event(n2) : n2);
    } finally {
      t = false;
    }
  }
  function w(n2) {
    t = true;
    try {
      return this.l[n2.type + true](l.event ? l.event(n2) : n2);
    } finally {
      t = false;
    }
  }
  function x(n2, l3) {
    this.props = n2, this.context = l3;
  }
  function A(n2, l3) {
    if (null == l3)
      return n2.__ ? A(n2.__, n2.__.__k.indexOf(n2) + 1) : null;
    for (var u3; l3 < n2.__k.length; l3++)
      if (null != (u3 = n2.__k[l3]) && null != u3.__e)
        return u3.__e;
    return "function" == typeof n2.type ? A(n2) : null;
  }
  function P(n2) {
    var l3, u3;
    if (null != (n2 = n2.__) && null != n2.__c) {
      for (n2.__e = n2.__c.base = null, l3 = 0; l3 < n2.__k.length; l3++)
        if (null != (u3 = n2.__k[l3]) && null != u3.__e) {
          n2.__e = n2.__c.base = u3.__e;
          break;
        }
      return P(n2);
    }
  }
  function C(n2) {
    t ? setTimeout(n2) : f(n2);
  }
  function T(n2) {
    (!n2.__d && (n2.__d = true) && r.push(n2) && !$.__r++ || o !== l.debounceRendering) && ((o = l.debounceRendering) || C)($);
  }
  function $() {
    var n2, l3, u3, i3, t3, o4, f3, e3;
    for (r.sort(function(n3, l4) {
      return n3.__v.__b - l4.__v.__b;
    }); n2 = r.shift(); )
      n2.__d && (l3 = r.length, i3 = void 0, t3 = void 0, f3 = (o4 = (u3 = n2).__v).__e, (e3 = u3.__P) && (i3 = [], (t3 = h({}, o4)).__v = o4.__v + 1, M(e3, o4, t3, u3.__n, void 0 !== e3.ownerSVGElement, null != o4.__h ? [f3] : null, i3, null == f3 ? A(o4) : f3, o4.__h), N(i3, o4), o4.__e != f3 && P(o4)), r.length > l3 && r.sort(function(n3, l4) {
        return n3.__v.__b - l4.__v.__b;
      }));
    $.__r = 0;
  }
  function H(n2, l3, u3, i3, t3, r3, o4, f3, e3, a3) {
    var h3, v3, y3, d3, k4, b3, g4, m3 = i3 && i3.__k || s, w4 = m3.length;
    for (u3.__k = [], h3 = 0; h3 < l3.length; h3++)
      if (null != (d3 = u3.__k[h3] = null == (d3 = l3[h3]) || "boolean" == typeof d3 ? null : "string" == typeof d3 || "number" == typeof d3 || "bigint" == typeof d3 ? p(null, d3, null, null, d3) : Array.isArray(d3) ? p(_, { children: d3 }, null, null, null) : d3.__b > 0 ? p(d3.type, d3.props, d3.key, d3.ref ? d3.ref : null, d3.__v) : d3)) {
        if (d3.__ = u3, d3.__b = u3.__b + 1, null === (y3 = m3[h3]) || y3 && d3.key == y3.key && d3.type === y3.type)
          m3[h3] = void 0;
        else
          for (v3 = 0; v3 < w4; v3++) {
            if ((y3 = m3[v3]) && d3.key == y3.key && d3.type === y3.type) {
              m3[v3] = void 0;
              break;
            }
            y3 = null;
          }
        M(n2, d3, y3 = y3 || c, t3, r3, o4, f3, e3, a3), k4 = d3.__e, (v3 = d3.ref) && y3.ref != v3 && (g4 || (g4 = []), y3.ref && g4.push(y3.ref, null, d3), g4.push(v3, d3.__c || k4, d3)), null != k4 ? (null == b3 && (b3 = k4), "function" == typeof d3.type && d3.__k === y3.__k ? d3.__d = e3 = I(d3, e3, n2) : e3 = z(n2, d3, y3, m3, k4, e3), "function" == typeof u3.type && (u3.__d = e3)) : e3 && y3.__e == e3 && e3.parentNode != n2 && (e3 = A(y3));
      }
    for (u3.__e = b3, h3 = w4; h3--; )
      null != m3[h3] && ("function" == typeof u3.type && null != m3[h3].__e && m3[h3].__e == u3.__d && (u3.__d = L(i3).nextSibling), q(m3[h3], m3[h3]));
    if (g4)
      for (h3 = 0; h3 < g4.length; h3++)
        S(g4[h3], g4[++h3], g4[++h3]);
  }
  function I(n2, l3, u3) {
    for (var i3, t3 = n2.__k, r3 = 0; t3 && r3 < t3.length; r3++)
      (i3 = t3[r3]) && (i3.__ = n2, l3 = "function" == typeof i3.type ? I(i3, l3, u3) : z(u3, i3, i3, t3, i3.__e, l3));
    return l3;
  }
  function j(n2, l3) {
    return l3 = l3 || [], null == n2 || "boolean" == typeof n2 || (Array.isArray(n2) ? n2.some(function(n3) {
      j(n3, l3);
    }) : l3.push(n2)), l3;
  }
  function z(n2, l3, u3, i3, t3, r3) {
    var o4, f3, e3;
    if (void 0 !== l3.__d)
      o4 = l3.__d, l3.__d = void 0;
    else if (null == u3 || t3 != r3 || null == t3.parentNode)
      n:
        if (null == r3 || r3.parentNode !== n2)
          n2.appendChild(t3), o4 = null;
        else {
          for (f3 = r3, e3 = 0; (f3 = f3.nextSibling) && e3 < i3.length; e3 += 1)
            if (f3 == t3)
              break n;
          n2.insertBefore(t3, r3), o4 = r3;
        }
    return void 0 !== o4 ? o4 : t3.nextSibling;
  }
  function L(n2) {
    var l3, u3, i3;
    if (null == n2.type || "string" == typeof n2.type)
      return n2.__e;
    if (n2.__k) {
      for (l3 = n2.__k.length - 1; l3 >= 0; l3--)
        if ((u3 = n2.__k[l3]) && (i3 = L(u3)))
          return i3;
    }
    return null;
  }
  function M(n2, u3, i3, t3, r3, o4, f3, e3, c3) {
    var s3, a3, v3, y3, p3, d3, k4, b3, g4, m3, w4, A4, P3, C3, T4, $3 = u3.type;
    if (void 0 !== u3.constructor)
      return null;
    null != i3.__h && (c3 = i3.__h, e3 = u3.__e = i3.__e, u3.__h = null, o4 = [e3]), (s3 = l.__b) && s3(u3);
    try {
      n:
        if ("function" == typeof $3) {
          if (b3 = u3.props, g4 = (s3 = $3.contextType) && t3[s3.__c], m3 = s3 ? g4 ? g4.props.value : s3.__ : t3, i3.__c ? k4 = (a3 = u3.__c = i3.__c).__ = a3.__E : ("prototype" in $3 && $3.prototype.render ? u3.__c = a3 = new $3(b3, m3) : (u3.__c = a3 = new x(b3, m3), a3.constructor = $3, a3.render = B), g4 && g4.sub(a3), a3.props = b3, a3.state || (a3.state = {}), a3.context = m3, a3.__n = t3, v3 = a3.__d = true, a3.__h = [], a3._sb = []), null == a3.__s && (a3.__s = a3.state), null != $3.getDerivedStateFromProps && (a3.__s == a3.state && (a3.__s = h({}, a3.__s)), h(a3.__s, $3.getDerivedStateFromProps(b3, a3.__s))), y3 = a3.props, p3 = a3.state, a3.__v = u3, v3)
            null == $3.getDerivedStateFromProps && null != a3.componentWillMount && a3.componentWillMount(), null != a3.componentDidMount && a3.__h.push(a3.componentDidMount);
          else {
            if (null == $3.getDerivedStateFromProps && b3 !== y3 && null != a3.componentWillReceiveProps && a3.componentWillReceiveProps(b3, m3), !a3.__e && null != a3.shouldComponentUpdate && false === a3.shouldComponentUpdate(b3, a3.__s, m3) || u3.__v === i3.__v) {
              for (u3.__v !== i3.__v && (a3.props = b3, a3.state = a3.__s, a3.__d = false), u3.__e = i3.__e, u3.__k = i3.__k, u3.__k.forEach(function(n3) {
                n3 && (n3.__ = u3);
              }), w4 = 0; w4 < a3._sb.length; w4++)
                a3.__h.push(a3._sb[w4]);
              a3._sb = [], a3.__h.length && f3.push(a3);
              break n;
            }
            null != a3.componentWillUpdate && a3.componentWillUpdate(b3, a3.__s, m3), null != a3.componentDidUpdate && a3.__h.push(function() {
              a3.componentDidUpdate(y3, p3, d3);
            });
          }
          if (a3.context = m3, a3.props = b3, a3.__P = n2, A4 = l.__r, P3 = 0, "prototype" in $3 && $3.prototype.render) {
            for (a3.state = a3.__s, a3.__d = false, A4 && A4(u3), s3 = a3.render(a3.props, a3.state, a3.context), C3 = 0; C3 < a3._sb.length; C3++)
              a3.__h.push(a3._sb[C3]);
            a3._sb = [];
          } else
            do {
              a3.__d = false, A4 && A4(u3), s3 = a3.render(a3.props, a3.state, a3.context), a3.state = a3.__s;
            } while (a3.__d && ++P3 < 25);
          a3.state = a3.__s, null != a3.getChildContext && (t3 = h(h({}, t3), a3.getChildContext())), v3 || null == a3.getSnapshotBeforeUpdate || (d3 = a3.getSnapshotBeforeUpdate(y3, p3)), T4 = null != s3 && s3.type === _ && null == s3.key ? s3.props.children : s3, H(n2, Array.isArray(T4) ? T4 : [T4], u3, i3, t3, r3, o4, f3, e3, c3), a3.base = u3.__e, u3.__h = null, a3.__h.length && f3.push(a3), k4 && (a3.__E = a3.__ = null), a3.__e = false;
        } else
          null == o4 && u3.__v === i3.__v ? (u3.__k = i3.__k, u3.__e = i3.__e) : u3.__e = O(i3.__e, u3, i3, t3, r3, o4, f3, c3);
      (s3 = l.diffed) && s3(u3);
    } catch (n3) {
      u3.__v = null, (c3 || null != o4) && (u3.__e = e3, u3.__h = !!c3, o4[o4.indexOf(e3)] = null), l.__e(n3, u3, i3);
    }
  }
  function N(n2, u3) {
    l.__c && l.__c(u3, n2), n2.some(function(u4) {
      try {
        n2 = u4.__h, u4.__h = [], n2.some(function(n3) {
          n3.call(u4);
        });
      } catch (n3) {
        l.__e(n3, u4.__v);
      }
    });
  }
  function O(l3, u3, i3, t3, r3, o4, f3, e3) {
    var s3, a3, h3, y3 = i3.props, p3 = u3.props, d3 = u3.type, _4 = 0;
    if ("svg" === d3 && (r3 = true), null != o4) {
      for (; _4 < o4.length; _4++)
        if ((s3 = o4[_4]) && "setAttribute" in s3 == !!d3 && (d3 ? s3.localName === d3 : 3 === s3.nodeType)) {
          l3 = s3, o4[_4] = null;
          break;
        }
    }
    if (null == l3) {
      if (null === d3)
        return document.createTextNode(p3);
      l3 = r3 ? document.createElementNS("http://www.w3.org/2000/svg", d3) : document.createElement(d3, p3.is && p3), o4 = null, e3 = false;
    }
    if (null === d3)
      y3 === p3 || e3 && l3.data === p3 || (l3.data = p3);
    else {
      if (o4 = o4 && n.call(l3.childNodes), a3 = (y3 = i3.props || c).dangerouslySetInnerHTML, h3 = p3.dangerouslySetInnerHTML, !e3) {
        if (null != o4)
          for (y3 = {}, _4 = 0; _4 < l3.attributes.length; _4++)
            y3[l3.attributes[_4].name] = l3.attributes[_4].value;
        (h3 || a3) && (h3 && (a3 && h3.__html == a3.__html || h3.__html === l3.innerHTML) || (l3.innerHTML = h3 && h3.__html || ""));
      }
      if (k(l3, p3, y3, r3, e3), h3)
        u3.__k = [];
      else if (_4 = u3.props.children, H(l3, Array.isArray(_4) ? _4 : [_4], u3, i3, t3, r3 && "foreignObject" !== d3, o4, f3, o4 ? o4[0] : i3.__k && A(i3, 0), e3), null != o4)
        for (_4 = o4.length; _4--; )
          null != o4[_4] && v(o4[_4]);
      e3 || ("value" in p3 && void 0 !== (_4 = p3.value) && (_4 !== l3.value || "progress" === d3 && !_4 || "option" === d3 && _4 !== y3.value) && g(l3, "value", _4, y3.value, false), "checked" in p3 && void 0 !== (_4 = p3.checked) && _4 !== l3.checked && g(l3, "checked", _4, y3.checked, false));
    }
    return l3;
  }
  function S(n2, u3, i3) {
    try {
      "function" == typeof n2 ? n2(u3) : n2.current = u3;
    } catch (n3) {
      l.__e(n3, i3);
    }
  }
  function q(n2, u3, i3) {
    var t3, r3;
    if (l.unmount && l.unmount(n2), (t3 = n2.ref) && (t3.current && t3.current !== n2.__e || S(t3, null, u3)), null != (t3 = n2.__c)) {
      if (t3.componentWillUnmount)
        try {
          t3.componentWillUnmount();
        } catch (n3) {
          l.__e(n3, u3);
        }
      t3.base = t3.__P = null, n2.__c = void 0;
    }
    if (t3 = n2.__k)
      for (r3 = 0; r3 < t3.length; r3++)
        t3[r3] && q(t3[r3], u3, i3 || "function" != typeof n2.type);
    i3 || null == n2.__e || v(n2.__e), n2.__ = n2.__e = n2.__d = void 0;
  }
  function B(n2, l3, u3) {
    return this.constructor(n2, u3);
  }
  function D(u3, i3, t3) {
    var r3, o4, f3;
    l.__ && l.__(u3, i3), o4 = (r3 = "function" == typeof t3) ? null : t3 && t3.__k || i3.__k, f3 = [], M(i3, u3 = (!r3 && t3 || i3).__k = y(_, null, [u3]), o4 || c, c, void 0 !== i3.ownerSVGElement, !r3 && t3 ? [t3] : o4 ? null : i3.firstChild ? n.call(i3.childNodes) : null, f3, !r3 && t3 ? t3 : o4 ? o4.__e : i3.firstChild, r3), N(f3, u3);
  }
  function E(n2, l3) {
    D(n2, l3, E);
  }
  function F(l3, u3, i3) {
    var t3, r3, o4, f3 = h({}, l3.props);
    for (o4 in u3)
      "key" == o4 ? t3 = u3[o4] : "ref" == o4 ? r3 = u3[o4] : f3[o4] = u3[o4];
    return arguments.length > 2 && (f3.children = arguments.length > 3 ? n.call(arguments, 2) : i3), p(l3.type, f3, t3 || l3.key, r3 || l3.ref, null);
  }
  function G(n2, l3) {
    var u3 = { __c: l3 = "__cC" + e++, __: n2, Consumer: function(n3, l4) {
        return n3.children(l4);
      }, Provider: function(n3) {
        var u4, i3;
        return this.getChildContext || (u4 = [], (i3 = {})[l3] = this, this.getChildContext = function() {
          return i3;
        }, this.shouldComponentUpdate = function(n4) {
          this.props.value !== n4.value && u4.some(function(n5) {
            n5.__e = true, T(n5);
          });
        }, this.sub = function(n4) {
          u4.push(n4);
          var l4 = n4.componentWillUnmount;
          n4.componentWillUnmount = function() {
            u4.splice(u4.indexOf(n4), 1), l4 && l4.call(n4);
          };
        }), n3.children;
      } };
    return u3.Provider.__ = u3.Consumer.contextType = u3;
  }
  n = s.slice, l = { __e: function(n2, l3, u3, i3) {
      for (var t3, r3, o4; l3 = l3.__; )
        if ((t3 = l3.__c) && !t3.__)
          try {
            if ((r3 = t3.constructor) && null != r3.getDerivedStateFromError && (t3.setState(r3.getDerivedStateFromError(n2)), o4 = t3.__d), null != t3.componentDidCatch && (t3.componentDidCatch(n2, i3 || {}), o4 = t3.__d), o4)
              return t3.__E = t3;
          } catch (l4) {
            n2 = l4;
          }
      throw n2;
    } }, u = 0, i = function(n2) {
    return null != n2 && void 0 === n2.constructor;
  }, t = false, x.prototype.setState = function(n2, l3) {
    var u3;
    u3 = null != this.__s && this.__s !== this.state ? this.__s : this.__s = h({}, this.state), "function" == typeof n2 && (n2 = n2(h({}, u3), this.props)), n2 && h(u3, n2), null != n2 && this.__v && (l3 && this._sb.push(l3), T(this));
  }, x.prototype.forceUpdate = function(n2) {
    this.__v && (this.__e = true, n2 && this.__h.push(n2), T(this));
  }, x.prototype.render = _, r = [], f = "function" == typeof Promise ? Promise.prototype.then.bind(Promise.resolve()) : setTimeout, $.__r = 0, e = 0;

  // node_modules/preact/hooks/dist/hooks.module.js
  var t2;
  var r2;
  var u2;
  var i2;
  var o2 = 0;
  var f2 = [];
  var c2 = [];
  var e2 = l.__b;
  var a2 = l.__r;
  var v2 = l.diffed;
  var l2 = l.__c;
  var m2 = l.unmount;
  function d2(t3, u3) {
    l.__h && l.__h(r2, t3, o2 || u3), o2 = 0;
    var i3 = r2.__H || (r2.__H = { __: [], __h: [] });
    return t3 >= i3.__.length && i3.__.push({ __V: c2 }), i3.__[t3];
  }
  function p2(n2) {
    return o2 = 1, y2(B2, n2);
  }
  function y2(n2, u3, i3) {
    var o4 = d2(t2++, 2);
    if (o4.t = n2, !o4.__c && (o4.__ = [i3 ? i3(u3) : B2(void 0, u3), function(n3) {
      var t3 = o4.__N ? o4.__N[0] : o4.__[0], r3 = o4.t(t3, n3);
      t3 !== r3 && (o4.__N = [r3, o4.__[1]], o4.__c.setState({}));
    }], o4.__c = r2, !r2.u)) {
      r2.u = true;
      var f3 = r2.shouldComponentUpdate;
      r2.shouldComponentUpdate = function(n3, t3, r3) {
        if (!o4.__c.__H)
          return true;
        var u4 = o4.__c.__H.__.filter(function(n4) {
          return n4.__c;
        });
        if (u4.every(function(n4) {
          return !n4.__N;
        }))
          return !f3 || f3.call(this, n3, t3, r3);
        var i4 = false;
        return u4.forEach(function(n4) {
          if (n4.__N) {
            var t4 = n4.__[0];
            n4.__ = n4.__N, n4.__N = void 0, t4 !== n4.__[0] && (i4 = true);
          }
        }), !(!i4 && o4.__c.props === n3) && (!f3 || f3.call(this, n3, t3, r3));
      };
    }
    return o4.__N || o4.__;
  }
  function h2(u3, i3) {
    var o4 = d2(t2++, 3);
    !l.__s && z2(o4.__H, i3) && (o4.__ = u3, o4.i = i3, r2.__H.__h.push(o4));
  }
  function s2(u3, i3) {
    var o4 = d2(t2++, 4);
    !l.__s && z2(o4.__H, i3) && (o4.__ = u3, o4.i = i3, r2.__h.push(o4));
  }
  function _2(n2) {
    return o2 = 5, F2(function() {
      return { current: n2 };
    }, []);
  }
  function A2(n2, t3, r3) {
    o2 = 6, s2(function() {
      return "function" == typeof n2 ? (n2(t3()), function() {
        return n2(null);
      }) : n2 ? (n2.current = t3(), function() {
        return n2.current = null;
      }) : void 0;
    }, null == r3 ? r3 : r3.concat(n2));
  }
  function F2(n2, r3) {
    var u3 = d2(t2++, 7);
    return z2(u3.__H, r3) ? (u3.__V = n2(), u3.i = r3, u3.__h = n2, u3.__V) : u3.__;
  }
  function T2(n2, t3) {
    return o2 = 8, F2(function() {
      return n2;
    }, t3);
  }
  function q2(n2) {
    var u3 = r2.context[n2.__c], i3 = d2(t2++, 9);
    return i3.c = n2, u3 ? (null == i3.__ && (i3.__ = true, u3.sub(r2)), u3.props.value) : n2.__;
  }
  function x2(t3, r3) {
    l.useDebugValue && l.useDebugValue(r3 ? r3(t3) : t3);
  }
  function V() {
    var n2 = d2(t2++, 11);
    if (!n2.__) {
      for (var u3 = r2.__v; null !== u3 && !u3.__m && null !== u3.__; )
        u3 = u3.__;
      var i3 = u3.__m || (u3.__m = [0, 0]);
      n2.__ = "P" + i3[0] + "-" + i3[1]++;
    }
    return n2.__;
  }
  function b2() {
    for (var t3; t3 = f2.shift(); )
      if (t3.__P && t3.__H)
        try {
          t3.__H.__h.forEach(k2), t3.__H.__h.forEach(w2), t3.__H.__h = [];
        } catch (r3) {
          t3.__H.__h = [], l.__e(r3, t3.__v);
        }
  }
  l.__b = function(n2) {
    r2 = null, e2 && e2(n2);
  }, l.__r = function(n2) {
    a2 && a2(n2), t2 = 0;
    var i3 = (r2 = n2.__c).__H;
    i3 && (u2 === r2 ? (i3.__h = [], r2.__h = [], i3.__.forEach(function(n3) {
      n3.__N && (n3.__ = n3.__N), n3.__V = c2, n3.__N = n3.i = void 0;
    })) : (i3.__h.forEach(k2), i3.__h.forEach(w2), i3.__h = [])), u2 = r2;
  }, l.diffed = function(t3) {
    v2 && v2(t3);
    var o4 = t3.__c;
    o4 && o4.__H && (o4.__H.__h.length && (1 !== f2.push(o4) && i2 === l.requestAnimationFrame || ((i2 = l.requestAnimationFrame) || j2)(b2)), o4.__H.__.forEach(function(n2) {
      n2.i && (n2.__H = n2.i), n2.__V !== c2 && (n2.__ = n2.__V), n2.i = void 0, n2.__V = c2;
    })), u2 = r2 = null;
  }, l.__c = function(t3, r3) {
    r3.some(function(t4) {
      try {
        t4.__h.forEach(k2), t4.__h = t4.__h.filter(function(n2) {
          return !n2.__ || w2(n2);
        });
      } catch (u3) {
        r3.some(function(n2) {
          n2.__h && (n2.__h = []);
        }), r3 = [], l.__e(u3, t4.__v);
      }
    }), l2 && l2(t3, r3);
  }, l.unmount = function(t3) {
    m2 && m2(t3);
    var r3, u3 = t3.__c;
    u3 && u3.__H && (u3.__H.__.forEach(function(n2) {
      try {
        k2(n2);
      } catch (n3) {
        r3 = n3;
      }
    }), u3.__H = void 0, r3 && l.__e(r3, u3.__v));
  };
  var g2 = "function" == typeof requestAnimationFrame;
  function j2(n2) {
    var t3, r3 = function() {
      clearTimeout(u3), g2 && cancelAnimationFrame(t3), setTimeout(n2);
    }, u3 = setTimeout(r3, 100);
    g2 && (t3 = requestAnimationFrame(r3));
  }
  function k2(n2) {
    var t3 = r2, u3 = n2.__c;
    "function" == typeof u3 && (n2.__c = void 0, u3()), r2 = t3;
  }
  function w2(n2) {
    var t3 = r2;
    n2.__c = n2.__(), r2 = t3;
  }
  function z2(n2, t3) {
    return !n2 || n2.length !== t3.length || t3.some(function(t4, r3) {
      return t4 !== n2[r3];
    });
  }
  function B2(n2, t3) {
    return "function" == typeof t3 ? t3(n2) : t3;
  }

  // node_modules/preact/compat/dist/compat.module.js
  function g3(n2, t3) {
    for (var e3 in t3)
      n2[e3] = t3[e3];
    return n2;
  }
  function C2(n2, t3) {
    for (var e3 in n2)
      if ("__source" !== e3 && !(e3 in t3))
        return true;
    for (var r3 in t3)
      if ("__source" !== r3 && n2[r3] !== t3[r3])
        return true;
    return false;
  }
  function E2(n2, t3) {
    return n2 === t3 && (0 !== n2 || 1 / n2 == 1 / t3) || n2 != n2 && t3 != t3;
  }
  function w3(n2) {
    this.props = n2;
  }
  function R(n2, e3) {
    function r3(n3) {
      var t3 = this.props.ref, r4 = t3 == n3.ref;
      return !r4 && t3 && (t3.call ? t3(null) : t3.current = null), e3 ? !e3(this.props, n3) || !r4 : C2(this.props, n3);
    }
    function u3(e4) {
      return this.shouldComponentUpdate = r3, y(n2, e4);
    }
    return u3.displayName = "Memo(" + (n2.displayName || n2.name) + ")", u3.prototype.isReactComponent = true, u3.__f = true, u3;
  }
  (w3.prototype = new x()).isPureReactComponent = true, w3.prototype.shouldComponentUpdate = function(n2, t3) {
    return C2(this.props, n2) || C2(this.state, t3);
  };
  var x3 = l.__b;
  l.__b = function(n2) {
    n2.type && n2.type.__f && n2.ref && (n2.props.ref = n2.ref, n2.ref = null), x3 && x3(n2);
  };
  var N2 = "undefined" != typeof Symbol && Symbol.for && Symbol.for("react.forward_ref") || 3911;
  function k3(n2) {
    function t3(t4) {
      var e3 = g3({}, t4);
      return delete e3.ref, n2(e3, t4.ref || null);
    }
    return t3.$$typeof = N2, t3.render = t3, t3.prototype.isReactComponent = t3.__f = true, t3.displayName = "ForwardRef(" + (n2.displayName || n2.name) + ")", t3;
  }
  var A3 = function(n2, t3) {
    return null == n2 ? null : j(j(n2).map(t3));
  };
  var O2 = { map: A3, forEach: A3, count: function(n2) {
      return n2 ? j(n2).length : 0;
    }, only: function(n2) {
      var t3 = j(n2);
      if (1 !== t3.length)
        throw "Children.only";
      return t3[0];
    }, toArray: j };
  var T3 = l.__e;
  l.__e = function(n2, t3, e3, r3) {
    if (n2.then) {
      for (var u3, o4 = t3; o4 = o4.__; )
        if ((u3 = o4.__c) && u3.__c)
          return null == t3.__e && (t3.__e = e3.__e, t3.__k = e3.__k), u3.__c(n2, t3);
    }
    T3(n2, t3, e3, r3);
  };
  var I2 = l.unmount;
  function L2(n2, t3, e3) {
    return n2 && (n2.__c && n2.__c.__H && (n2.__c.__H.__.forEach(function(n3) {
      "function" == typeof n3.__c && n3.__c();
    }), n2.__c.__H = null), null != (n2 = g3({}, n2)).__c && (n2.__c.__P === e3 && (n2.__c.__P = t3), n2.__c = null), n2.__k = n2.__k && n2.__k.map(function(n3) {
      return L2(n3, t3, e3);
    })), n2;
  }
  function U(n2, t3, e3) {
    return n2 && (n2.__v = null, n2.__k = n2.__k && n2.__k.map(function(n3) {
      return U(n3, t3, e3);
    }), n2.__c && n2.__c.__P === t3 && (n2.__e && e3.insertBefore(n2.__e, n2.__d), n2.__c.__e = true, n2.__c.__P = e3)), n2;
  }
  function D2() {
    this.__u = 0, this.t = null, this.__b = null;
  }
  function F3(n2) {
    var t3 = n2.__.__c;
    return t3 && t3.__a && t3.__a(n2);
  }
  function M2(n2) {
    var e3, r3, u3;
    function o4(o5) {
      if (e3 || (e3 = n2()).then(function(n3) {
        r3 = n3.default || n3;
      }, function(n3) {
        u3 = n3;
      }), u3)
        throw u3;
      if (!r3)
        throw e3;
      return y(r3, o5);
    }
    return o4.displayName = "Lazy", o4.__f = true, o4;
  }
  function V2() {
    this.u = null, this.o = null;
  }
  l.unmount = function(n2) {
    var t3 = n2.__c;
    t3 && t3.__R && t3.__R(), t3 && true === n2.__h && (n2.type = null), I2 && I2(n2);
  }, (D2.prototype = new x()).__c = function(n2, t3) {
    var e3 = t3.__c, r3 = this;
    null == r3.t && (r3.t = []), r3.t.push(e3);
    var u3 = F3(r3.__v), o4 = false, i3 = function() {
      o4 || (o4 = true, e3.__R = null, u3 ? u3(l3) : l3());
    };
    e3.__R = i3;
    var l3 = function() {
      if (!--r3.__u) {
        if (r3.state.__a) {
          var n3 = r3.state.__a;
          r3.__v.__k[0] = U(n3, n3.__c.__P, n3.__c.__O);
        }
        var t4;
        for (r3.setState({ __a: r3.__b = null }); t4 = r3.t.pop(); )
          t4.forceUpdate();
      }
    }, c3 = true === t3.__h;
    r3.__u++ || c3 || r3.setState({ __a: r3.__b = r3.__v.__k[0] }), n2.then(i3, i3);
  }, D2.prototype.componentWillUnmount = function() {
    this.t = [];
  }, D2.prototype.render = function(n2, e3) {
    if (this.__b) {
      if (this.__v.__k) {
        var r3 = document.createElement("div"), o4 = this.__v.__k[0].__c;
        this.__v.__k[0] = L2(this.__b, r3, o4.__O = o4.__P);
      }
      this.__b = null;
    }
    var i3 = e3.__a && y(_, null, n2.fallback);
    return i3 && (i3.__h = null), [y(_, null, e3.__a ? null : n2.children), i3];
  };
  var W = function(n2, t3, e3) {
    if (++e3[1] === e3[0] && n2.o.delete(t3), n2.props.revealOrder && ("t" !== n2.props.revealOrder[0] || !n2.o.size))
      for (e3 = n2.u; e3; ) {
        for (; e3.length > 3; )
          e3.pop()();
        if (e3[1] < e3[0])
          break;
        n2.u = e3 = e3[2];
      }
  };
  function P2(n2) {
    return this.getChildContext = function() {
      return n2.context;
    }, n2.children;
  }
  function $2(n2) {
    var e3 = this, r3 = n2.i;
    e3.componentWillUnmount = function() {
      D(null, e3.l), e3.l = null, e3.i = null;
    }, e3.i && e3.i !== r3 && e3.componentWillUnmount(), n2.__v ? (e3.l || (e3.i = r3, e3.l = { nodeType: 1, parentNode: r3, childNodes: [], appendChild: function(n3) {
        this.childNodes.push(n3), e3.i.appendChild(n3);
      }, insertBefore: function(n3, t3) {
        this.childNodes.push(n3), e3.i.appendChild(n3);
      }, removeChild: function(n3) {
        this.childNodes.splice(this.childNodes.indexOf(n3) >>> 1, 1), e3.i.removeChild(n3);
      } }), D(y(P2, { context: e3.context }, n2.__v), e3.l)) : e3.l && e3.componentWillUnmount();
  }
  function j3(n2, e3) {
    var r3 = y($2, { __v: n2, i: e3 });
    return r3.containerInfo = e3, r3;
  }
  (V2.prototype = new x()).__a = function(n2) {
    var t3 = this, e3 = F3(t3.__v), r3 = t3.o.get(n2);
    return r3[0]++, function(u3) {
      var o4 = function() {
        t3.props.revealOrder ? (r3.push(u3), W(t3, n2, r3)) : u3();
      };
      e3 ? e3(o4) : o4();
    };
  }, V2.prototype.render = function(n2) {
    this.u = null, this.o = /* @__PURE__ */ new Map();
    var t3 = j(n2.children);
    n2.revealOrder && "b" === n2.revealOrder[0] && t3.reverse();
    for (var e3 = t3.length; e3--; )
      this.o.set(t3[e3], this.u = [1, 0, this.u]);
    return n2.children;
  }, V2.prototype.componentDidUpdate = V2.prototype.componentDidMount = function() {
    var n2 = this;
    this.o.forEach(function(t3, e3) {
      W(n2, e3, t3);
    });
  };
  var z3 = "undefined" != typeof Symbol && Symbol.for && Symbol.for("react.element") || 60103;
  var B3 = /^(?:accent|alignment|arabic|baseline|cap|clip(?!PathU)|color|dominant|fill|flood|font|glyph(?!R)|horiz|image|letter|lighting|marker(?!H|W|U)|overline|paint|pointer|shape|stop|strikethrough|stroke|text(?!L)|transform|underline|unicode|units|v|vector|vert|word|writing|x(?!C))[A-Z]/;
  var H2 = "undefined" != typeof document;
  var Z = function(n2) {
    return ("undefined" != typeof Symbol && "symbol" == typeof Symbol() ? /fil|che|rad/i : /fil|che|ra/i).test(n2);
  };
  function Y(n2, t3, e3) {
    return null == t3.__k && (t3.textContent = ""), D(n2, t3), "function" == typeof e3 && e3(), n2 ? n2.__c : null;
  }
  function q3(n2, t3, e3) {
    return E(n2, t3), "function" == typeof e3 && e3(), n2 ? n2.__c : null;
  }
  x.prototype.isReactComponent = {}, ["componentWillMount", "componentWillReceiveProps", "componentWillUpdate"].forEach(function(t3) {
    Object.defineProperty(x.prototype, t3, { configurable: true, get: function() {
        return this["UNSAFE_" + t3];
      }, set: function(n2) {
        Object.defineProperty(this, t3, { configurable: true, writable: true, value: n2 });
      } });
  });
  var G2 = l.event;
  function J() {
  }
  function K() {
    return this.cancelBubble;
  }
  function Q() {
    return this.defaultPrevented;
  }
  l.event = function(n2) {
    return G2 && (n2 = G2(n2)), n2.persist = J, n2.isPropagationStopped = K, n2.isDefaultPrevented = Q, n2.nativeEvent = n2;
  };
  var X;
  var nn = { configurable: true, get: function() {
      return this.class;
    } };
  var tn = l.vnode;
  l.vnode = function(n2) {
    var t3 = n2.type, e3 = n2.props, u3 = e3;
    if ("string" == typeof t3) {
      var o4 = -1 === t3.indexOf("-");
      for (var i3 in u3 = {}, e3) {
        var l3 = e3[i3];
        H2 && "children" === i3 && "noscript" === t3 || "value" === i3 && "defaultValue" in e3 && null == l3 || ("defaultValue" === i3 && "value" in e3 && null == e3.value ? i3 = "value" : "download" === i3 && true === l3 ? l3 = "" : /ondoubleclick/i.test(i3) ? i3 = "ondblclick" : /^onchange(textarea|input)/i.test(i3 + t3) && !Z(e3.type) ? i3 = "oninput" : /^onfocus$/i.test(i3) ? i3 = "onfocusin" : /^onblur$/i.test(i3) ? i3 = "onfocusout" : /^on(Ani|Tra|Tou|BeforeInp|Compo)/.test(i3) ? i3 = i3.toLowerCase() : o4 && B3.test(i3) ? i3 = i3.replace(/[A-Z0-9]/g, "-$&").toLowerCase() : null === l3 && (l3 = void 0), /^oninput$/i.test(i3) && (i3 = i3.toLowerCase(), u3[i3] && (i3 = "oninputCapture")), u3[i3] = l3);
      }
      "select" == t3 && u3.multiple && Array.isArray(u3.value) && (u3.value = j(e3.children).forEach(function(n3) {
        n3.props.selected = -1 != u3.value.indexOf(n3.props.value);
      })), "select" == t3 && null != u3.defaultValue && (u3.value = j(e3.children).forEach(function(n3) {
        n3.props.selected = u3.multiple ? -1 != u3.defaultValue.indexOf(n3.props.value) : u3.defaultValue == n3.props.value;
      })), n2.props = u3, e3.class != e3.className && (nn.enumerable = "className" in e3, null != e3.className && (u3.class = e3.className), Object.defineProperty(u3, "className", nn));
    }
    n2.$$typeof = z3, tn && tn(n2);
  };
  var en = l.__r;
  l.__r = function(n2) {
    en && en(n2), X = n2.__c;
  };
  var rn = { ReactCurrentDispatcher: { current: { readContext: function(n2) {
          return X.__n[n2.__c].props.value;
        } } } };
  function on(n2) {
    return y.bind(null, n2);
  }
  function ln(n2) {
    return !!n2 && n2.$$typeof === z3;
  }
  function cn(n2) {
    return ln(n2) ? F.apply(null, arguments) : n2;
  }
  function fn(n2) {
    return !!n2.__k && (D(null, n2), true);
  }
  function an(n2) {
    return n2 && (n2.base || 1 === n2.nodeType && n2) || null;
  }
  var sn = function(n2, t3) {
    return n2(t3);
  };
  var hn = function(n2, t3) {
    return n2(t3);
  };
  var vn = _;
  function dn(n2) {
    n2();
  }
  function pn(n2) {
    return n2;
  }
  function mn() {
    return [false, dn];
  }
  var yn = s2;
  function _n(n2, t3) {
    var e3 = t3(), r3 = p2({ h: { __: e3, v: t3 } }), u3 = r3[0].h, o4 = r3[1];
    return s2(function() {
      u3.__ = e3, u3.v = t3, E2(u3.__, t3()) || o4({ h: u3 });
    }, [n2, e3, t3]), h2(function() {
      return E2(u3.__, u3.v()) || o4({ h: u3 }), n2(function() {
        E2(u3.__, u3.v()) || o4({ h: u3 });
      });
    }, [n2]), e3;
  }
  var bn = { useState: p2, useId: V, useReducer: y2, useEffect: h2, useLayoutEffect: s2, useInsertionEffect: yn, useTransition: mn, useDeferredValue: pn, useSyncExternalStore: _n, startTransition: dn, useRef: _2, useImperativeHandle: A2, useMemo: F2, useCallback: T2, useContext: q2, useDebugValue: x2, version: "17.0.2", Children: O2, render: Y, hydrate: q3, unmountComponentAtNode: fn, createPortal: j3, createElement: y, createContext: G, createFactory: on, cloneElement: cn, createRef: d, Fragment: _, isValidElement: ln, findDOMNode: an, Component: x, PureComponent: w3, memo: R, forwardRef: k3, flushSync: hn, unstable_batchedUpdates: sn, StrictMode: vn, Suspense: D2, SuspenseList: V2, lazy: M2, __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED: rn };

  // node_modules/@babel/runtime/helpers/esm/objectWithoutPropertiesLoose.js
  function _objectWithoutPropertiesLoose(source, excluded) {
    if (source == null)
      return {};
    var target = {};
    var sourceKeys = Object.keys(source);
    var key, i3;
    for (i3 = 0; i3 < sourceKeys.length; i3++) {
      key = sourceKeys[i3];
      if (excluded.indexOf(key) >= 0)
        continue;
      target[key] = source[key];
    }
    return target;
  }

  // node_modules/@babel/runtime/helpers/esm/extends.js
  function _extends() {
    _extends = Object.assign ? Object.assign.bind() : function(target) {
      for (var i3 = 1; i3 < arguments.length; i3++) {
        var source = arguments[i3];
        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }
      return target;
    };
    return _extends.apply(this, arguments);
  }

  // node_modules/react-focus-lock/dist/es2015/Lock.js
  var import_prop_types2 = __toESM(require_prop_types());

  // node_modules/focus-lock/dist/es2015/constants.js
  var FOCUS_GROUP = "data-focus-lock";
  var FOCUS_DISABLED = "data-focus-lock-disabled";
  var FOCUS_ALLOW = "data-no-focus-lock";
  var FOCUS_AUTO = "data-autofocus-inside";
  var FOCUS_NO_AUTOFOCUS = "data-no-autofocus";

  // node_modules/use-callback-ref/dist/es2015/assignRef.js
  function assignRef(ref, value) {
    if (typeof ref === "function") {
      ref(value);
    } else if (ref) {
      ref.current = value;
    }
    return ref;
  }

  // node_modules/use-callback-ref/dist/es2015/useRef.js
  function useCallbackRef(initialValue, callback) {
    var ref = p2(function() {
      return {
        // value
        value: initialValue,
        // last callback
        callback,
        // "memoized" public interface
        facade: {
          get current() {
            return ref.value;
          },
          set current(value) {
            var last = ref.value;
            if (last !== value) {
              ref.value = value;
              ref.callback(value, last);
            }
          }
        }
      };
    })[0];
    ref.callback = callback;
    return ref.facade;
  }

  // node_modules/use-callback-ref/dist/es2015/useMergeRef.js
  function useMergeRefs(refs, defaultValue) {
    return useCallbackRef(defaultValue || null, function(newValue) {
      return refs.forEach(function(ref) {
        return assignRef(ref, newValue);
      });
    });
  }

  // node_modules/react-focus-lock/dist/es2015/FocusGuard.js
  var import_prop_types = __toESM(require_prop_types());
  var hiddenGuard = {
    width: "1px",
    height: "0px",
    padding: 0,
    overflow: "hidden",
    position: "fixed",
    top: "1px",
    left: "1px"
  };
  var InFocusGuard = function InFocusGuard2(_ref2) {
    var children = _ref2.children;
    return /* @__PURE__ */ y(_, null, /* @__PURE__ */ y("div", {
      key: "guard-first",
      "data-focus-guard": true,
      "data-focus-auto-guard": true,
      style: hiddenGuard
    }), children, children && /* @__PURE__ */ y("div", {
      key: "guard-last",
      "data-focus-guard": true,
      "data-focus-auto-guard": true,
      style: hiddenGuard
    }));
  };
  InFocusGuard.propTypes = true ? {
    children: import_prop_types.default.node
  } : {};
  InFocusGuard.defaultProps = {
    children: null
  };

  // node_modules/tslib/tslib.es6.js
  var __assign = function() {
    __assign = Object.assign || function __assign2(t3) {
      for (var s3, i3 = 1, n2 = arguments.length; i3 < n2; i3++) {
        s3 = arguments[i3];
        for (var p3 in s3)
          if (Object.prototype.hasOwnProperty.call(s3, p3))
            t3[p3] = s3[p3];
      }
      return t3;
    };
    return __assign.apply(this, arguments);
  };
  function __rest(s3, e3) {
    var t3 = {};
    for (var p3 in s3)
      if (Object.prototype.hasOwnProperty.call(s3, p3) && e3.indexOf(p3) < 0)
        t3[p3] = s3[p3];
    if (s3 != null && typeof Object.getOwnPropertySymbols === "function")
      for (var i3 = 0, p3 = Object.getOwnPropertySymbols(s3); i3 < p3.length; i3++) {
        if (e3.indexOf(p3[i3]) < 0 && Object.prototype.propertyIsEnumerable.call(s3, p3[i3]))
          t3[p3[i3]] = s3[p3[i3]];
      }
    return t3;
  }
  function __spreadArray(to, from, pack) {
    if (pack || arguments.length === 2)
      for (var i3 = 0, l3 = from.length, ar; i3 < l3; i3++) {
        if (ar || !(i3 in from)) {
          if (!ar)
            ar = Array.prototype.slice.call(from, 0, i3);
          ar[i3] = from[i3];
        }
      }
    return to.concat(ar || Array.prototype.slice.call(from));
  }

  // node_modules/use-sidecar/dist/es2015/medium.js
  function ItoI(a3) {
    return a3;
  }
  function innerCreateMedium(defaults, middleware) {
    if (middleware === void 0) {
      middleware = ItoI;
    }
    var buffer = [];
    var assigned = false;
    var medium = {
      read: function() {
        if (assigned) {
          throw new Error("Sidecar: could not `read` from an `assigned` medium. `read` could be used only with `useMedium`.");
        }
        if (buffer.length) {
          return buffer[buffer.length - 1];
        }
        return defaults;
      },
      useMedium: function(data) {
        var item = middleware(data, assigned);
        buffer.push(item);
        return function() {
          buffer = buffer.filter(function(x4) {
            return x4 !== item;
          });
        };
      },
      assignSyncMedium: function(cb) {
        assigned = true;
        while (buffer.length) {
          var cbs = buffer;
          buffer = [];
          cbs.forEach(cb);
        }
        buffer = {
          push: function(x4) {
            return cb(x4);
          },
          filter: function() {
            return buffer;
          }
        };
      },
      assignMedium: function(cb) {
        assigned = true;
        var pendingQueue = [];
        if (buffer.length) {
          var cbs = buffer;
          buffer = [];
          cbs.forEach(cb);
          pendingQueue = buffer;
        }
        var executeQueue = function() {
          var cbs2 = pendingQueue;
          pendingQueue = [];
          cbs2.forEach(cb);
        };
        var cycle = function() {
          return Promise.resolve().then(executeQueue);
        };
        cycle();
        buffer = {
          push: function(x4) {
            pendingQueue.push(x4);
            cycle();
          },
          filter: function(filter) {
            pendingQueue = pendingQueue.filter(filter);
            return buffer;
          }
        };
      }
    };
    return medium;
  }
  function createMedium(defaults, middleware) {
    if (middleware === void 0) {
      middleware = ItoI;
    }
    return innerCreateMedium(defaults, middleware);
  }
  function createSidecarMedium(options) {
    if (options === void 0) {
      options = {};
    }
    var medium = innerCreateMedium(null);
    medium.options = __assign({ async: true, ssr: false }, options);
    return medium;
  }

  // node_modules/use-sidecar/dist/es2015/exports.js
  var SideCar = function(_a) {
    var sideCar2 = _a.sideCar, rest = __rest(_a, ["sideCar"]);
    if (!sideCar2) {
      throw new Error("Sidecar: please provide `sideCar` property to import the right car");
    }
    var Target = sideCar2.read();
    if (!Target) {
      throw new Error("Sidecar medium not found");
    }
    return y(Target, __assign({}, rest));
  };
  SideCar.isSideCarExport = true;
  function exportSidecar(medium, exported) {
    medium.useMedium(exported);
    return SideCar;
  }

  // node_modules/react-focus-lock/dist/es2015/medium.js
  var mediumFocus = createMedium({}, function(_ref2) {
    var target = _ref2.target, currentTarget = _ref2.currentTarget;
    return {
      target,
      currentTarget
    };
  });
  var mediumBlur = createMedium();
  var mediumEffect = createMedium();
  var mediumSidecar = createSidecarMedium({
    async: true
    // focus-lock sidecar is not required on the server
    // however, it might be required for JSDOM tests
    // ssr: true,
  });

  // node_modules/react-focus-lock/dist/es2015/Lock.js
  var emptyArray = [];
  var FocusLock = /* @__PURE__ */ k3(function FocusLockUI(props, parentRef) {
    var _extends2;
    var _React$useState = p2(), realObserved = _React$useState[0], setObserved = _React$useState[1];
    var observed = _2();
    var isActive = _2(false);
    var originalFocusedElement = _2(null);
    var children = props.children, disabled = props.disabled, noFocusGuards = props.noFocusGuards, persistentFocus = props.persistentFocus, crossFrame = props.crossFrame, autoFocus = props.autoFocus, allowTextSelection = props.allowTextSelection, group = props.group, className = props.className, whiteList = props.whiteList, hasPositiveIndices = props.hasPositiveIndices, _props$shards = props.shards, shards = _props$shards === void 0 ? emptyArray : _props$shards, _props$as = props.as, Container = _props$as === void 0 ? "div" : _props$as, _props$lockProps = props.lockProps, containerProps = _props$lockProps === void 0 ? {} : _props$lockProps, SideCar2 = props.sideCar, shouldReturnFocus = props.returnFocus, focusOptions = props.focusOptions, onActivationCallback = props.onActivation, onDeactivationCallback = props.onDeactivation;
    var _React$useState2 = p2({}), id = _React$useState2[0];
    var onActivation = T2(function() {
      originalFocusedElement.current = originalFocusedElement.current || document && document.activeElement;
      if (observed.current && onActivationCallback) {
        onActivationCallback(observed.current);
      }
      isActive.current = true;
    }, [onActivationCallback]);
    var onDeactivation = T2(function() {
      isActive.current = false;
      if (onDeactivationCallback) {
        onDeactivationCallback(observed.current);
      }
    }, [onDeactivationCallback]);
    h2(function() {
      if (!disabled) {
        originalFocusedElement.current = null;
      }
    }, []);
    var returnFocus = T2(function(allowDefer) {
      var returnFocusTo = originalFocusedElement.current;
      if (returnFocusTo && returnFocusTo.focus) {
        var howToReturnFocus = typeof shouldReturnFocus === "function" ? shouldReturnFocus(returnFocusTo) : shouldReturnFocus;
        if (howToReturnFocus) {
          var returnFocusOptions = typeof howToReturnFocus === "object" ? howToReturnFocus : void 0;
          originalFocusedElement.current = null;
          if (allowDefer) {
            Promise.resolve().then(function() {
              return returnFocusTo.focus(returnFocusOptions);
            });
          } else {
            returnFocusTo.focus(returnFocusOptions);
          }
        }
      }
    }, [shouldReturnFocus]);
    var onFocus3 = T2(function(event) {
      if (isActive.current) {
        mediumFocus.useMedium(event);
      }
    }, []);
    var onBlur3 = mediumBlur.useMedium;
    var setObserveNode = T2(function(newObserved) {
      if (observed.current !== newObserved) {
        observed.current = newObserved;
        setObserved(newObserved);
      }
    }, []);
    if (true) {
      if (typeof allowTextSelection !== "undefined") {
        console.warn("React-Focus-Lock: allowTextSelection is deprecated and enabled by default");
      }
      h2(function() {
        if (!observed.current && typeof Container !== "string") {
          console.error("FocusLock: could not obtain ref to internal node");
        }
      }, []);
    }
    var lockProps = _extends((_extends2 = {}, _extends2[FOCUS_DISABLED] = disabled && "disabled", _extends2[FOCUS_GROUP] = group, _extends2), containerProps);
    var hasLeadingGuards = noFocusGuards !== true;
    var hasTailingGuards = hasLeadingGuards && noFocusGuards !== "tail";
    var mergedRef = useMergeRefs([parentRef, setObserveNode]);
    return /* @__PURE__ */ y(_, null, hasLeadingGuards && [
      // nearest focus guard
      /* @__PURE__ */ y("div", {
        key: "guard-first",
        "data-focus-guard": true,
        tabIndex: disabled ? -1 : 0,
        style: hiddenGuard
      }),
      // first tabbed element guard
      hasPositiveIndices ? /* @__PURE__ */ y("div", {
        key: "guard-nearest",
        "data-focus-guard": true,
        tabIndex: disabled ? -1 : 1,
        style: hiddenGuard
      }) : null
    ], !disabled && /* @__PURE__ */ y(SideCar2, {
      id,
      sideCar: mediumSidecar,
      observed: realObserved,
      disabled,
      persistentFocus,
      crossFrame,
      autoFocus,
      whiteList,
      shards,
      onActivation,
      onDeactivation,
      returnFocus,
      focusOptions
    }), /* @__PURE__ */ y(Container, _extends({
      ref: mergedRef
    }, lockProps, {
      className,
      onBlur: onBlur3,
      onFocus: onFocus3
    }), children), hasTailingGuards && /* @__PURE__ */ y("div", {
      "data-focus-guard": true,
      tabIndex: disabled ? -1 : 0,
      style: hiddenGuard
    }));
  });
  FocusLock.propTypes = true ? {
    children: import_prop_types2.node,
    disabled: import_prop_types2.bool,
    returnFocus: (0, import_prop_types2.oneOfType)([import_prop_types2.bool, import_prop_types2.object, import_prop_types2.func]),
    focusOptions: import_prop_types2.object,
    noFocusGuards: import_prop_types2.bool,
    hasPositiveIndices: import_prop_types2.bool,
    allowTextSelection: import_prop_types2.bool,
    autoFocus: import_prop_types2.bool,
    persistentFocus: import_prop_types2.bool,
    crossFrame: import_prop_types2.bool,
    group: import_prop_types2.string,
    className: import_prop_types2.string,
    whiteList: import_prop_types2.func,
    shards: (0, import_prop_types2.arrayOf)(import_prop_types2.any),
    as: (0, import_prop_types2.oneOfType)([import_prop_types2.string, import_prop_types2.func, import_prop_types2.object]),
    lockProps: import_prop_types2.object,
    onActivation: import_prop_types2.func,
    onDeactivation: import_prop_types2.func,
    sideCar: import_prop_types2.any.isRequired
  } : {};
  FocusLock.defaultProps = {
    children: void 0,
    disabled: false,
    returnFocus: false,
    focusOptions: void 0,
    noFocusGuards: false,
    autoFocus: true,
    persistentFocus: false,
    crossFrame: true,
    hasPositiveIndices: void 0,
    allowTextSelection: void 0,
    group: void 0,
    className: void 0,
    whiteList: void 0,
    shards: void 0,
    as: "div",
    lockProps: {},
    onActivation: void 0,
    onDeactivation: void 0
  };
  var Lock_default = FocusLock;

  // node_modules/react-focus-lock/dist/es2015/Trap.js
  var import_prop_types3 = __toESM(require_prop_types());

  // node_modules/@babel/runtime/helpers/esm/setPrototypeOf.js
  function _setPrototypeOf(o4, p3) {
    _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf2(o5, p4) {
      o5.__proto__ = p4;
      return o5;
    };
    return _setPrototypeOf(o4, p3);
  }

  // node_modules/@babel/runtime/helpers/esm/inheritsLoose.js
  function _inheritsLoose(subClass, superClass) {
    subClass.prototype = Object.create(superClass.prototype);
    subClass.prototype.constructor = subClass;
    _setPrototypeOf(subClass, superClass);
  }

  // node_modules/@babel/runtime/helpers/esm/typeof.js
  function _typeof(obj) {
    "@babel/helpers - typeof";
    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(obj2) {
      return typeof obj2;
    } : function(obj2) {
      return obj2 && "function" == typeof Symbol && obj2.constructor === Symbol && obj2 !== Symbol.prototype ? "symbol" : typeof obj2;
    }, _typeof(obj);
  }

  // node_modules/@babel/runtime/helpers/esm/toPrimitive.js
  function _toPrimitive(input, hint) {
    if (_typeof(input) !== "object" || input === null)
      return input;
    var prim = input[Symbol.toPrimitive];
    if (prim !== void 0) {
      var res = prim.call(input, hint || "default");
      if (_typeof(res) !== "object")
        return res;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return (hint === "string" ? String : Number)(input);
  }

  // node_modules/@babel/runtime/helpers/esm/toPropertyKey.js
  function _toPropertyKey(arg) {
    var key = _toPrimitive(arg, "string");
    return _typeof(key) === "symbol" ? key : String(key);
  }

  // node_modules/@babel/runtime/helpers/esm/defineProperty.js
  function _defineProperty(obj, key, value) {
    key = _toPropertyKey(key);
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }
    return obj;
  }

  // node_modules/react-clientside-effect/lib/index.es.js
  function withSideEffect(reducePropsToState2, handleStateChangeOnClient2) {
    if (true) {
      if (typeof reducePropsToState2 !== "function") {
        throw new Error("Expected reducePropsToState to be a function.");
      }
      if (typeof handleStateChangeOnClient2 !== "function") {
        throw new Error("Expected handleStateChangeOnClient to be a function.");
      }
    }
    function getDisplayName(WrappedComponent) {
      return WrappedComponent.displayName || WrappedComponent.name || "Component";
    }
    return function wrap(WrappedComponent) {
      if (true) {
        if (typeof WrappedComponent !== "function") {
          throw new Error("Expected WrappedComponent to be a React component.");
        }
      }
      var mountedInstances = [];
      var state;
      function emitChange() {
        state = reducePropsToState2(mountedInstances.map(function(instance) {
          return instance.props;
        }));
        handleStateChangeOnClient2(state);
      }
      var SideEffect = /* @__PURE__ */ function(_PureComponent) {
        _inheritsLoose(SideEffect2, _PureComponent);
        function SideEffect2() {
          return _PureComponent.apply(this, arguments) || this;
        }
        SideEffect2.peek = function peek() {
          return state;
        };
        var _proto = SideEffect2.prototype;
        _proto.componentDidMount = function componentDidMount() {
          mountedInstances.push(this);
          emitChange();
        };
        _proto.componentDidUpdate = function componentDidUpdate() {
          emitChange();
        };
        _proto.componentWillUnmount = function componentWillUnmount() {
          var index = mountedInstances.indexOf(this);
          mountedInstances.splice(index, 1);
          emitChange();
        };
        _proto.render = function render() {
          return /* @__PURE__ */ bn.createElement(WrappedComponent, this.props);
        };
        return SideEffect2;
      }(w3);
      _defineProperty(SideEffect, "displayName", "SideEffect(" + getDisplayName(WrappedComponent) + ")");
      return SideEffect;
    };
  }
  var index_es_default = withSideEffect;

  // node_modules/focus-lock/dist/es2015/utils/array.js
  var toArray = function(a3) {
    var ret = Array(a3.length);
    for (var i3 = 0; i3 < a3.length; ++i3) {
      ret[i3] = a3[i3];
    }
    return ret;
  };
  var asArray = function(a3) {
    return Array.isArray(a3) ? a3 : [a3];
  };
  var getFirst = function(a3) {
    return Array.isArray(a3) ? a3[0] : a3;
  };

  // node_modules/focus-lock/dist/es2015/utils/is.js
  var isElementHidden = function(node2) {
    if (node2.nodeType !== Node.ELEMENT_NODE) {
      return false;
    }
    var computedStyle = window.getComputedStyle(node2, null);
    if (!computedStyle || !computedStyle.getPropertyValue) {
      return false;
    }
    return computedStyle.getPropertyValue("display") === "none" || computedStyle.getPropertyValue("visibility") === "hidden";
  };
  var getParentNode = function(node2) {
    return node2.parentNode && node2.parentNode.nodeType === Node.DOCUMENT_FRAGMENT_NODE ? (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      node2.parentNode.host
    ) : node2.parentNode;
  };
  var isTopNode = function(node2) {
    return node2 === document || node2 && node2.nodeType === Node.DOCUMENT_NODE;
  };
  var isVisibleUncached = function(node2, checkParent) {
    return !node2 || isTopNode(node2) || !isElementHidden(node2) && checkParent(getParentNode(node2));
  };
  var isVisibleCached = function(visibilityCache, node2) {
    var cached = visibilityCache.get(node2);
    if (cached !== void 0) {
      return cached;
    }
    var result = isVisibleUncached(node2, isVisibleCached.bind(void 0, visibilityCache));
    visibilityCache.set(node2, result);
    return result;
  };
  var isAutoFocusAllowedUncached = function(node2, checkParent) {
    return node2 && !isTopNode(node2) ? isAutoFocusAllowed(node2) ? checkParent(getParentNode(node2)) : false : true;
  };
  var isAutoFocusAllowedCached = function(cache, node2) {
    var cached = cache.get(node2);
    if (cached !== void 0) {
      return cached;
    }
    var result = isAutoFocusAllowedUncached(node2, isAutoFocusAllowedCached.bind(void 0, cache));
    cache.set(node2, result);
    return result;
  };
  var getDataset = function(node2) {
    return node2.dataset;
  };
  var isHTMLButtonElement = function(node2) {
    return node2.tagName === "BUTTON";
  };
  var isHTMLInputElement = function(node2) {
    return node2.tagName === "INPUT";
  };
  var isRadioElement = function(node2) {
    return isHTMLInputElement(node2) && node2.type === "radio";
  };
  var notHiddenInput = function(node2) {
    return !((isHTMLInputElement(node2) || isHTMLButtonElement(node2)) && (node2.type === "hidden" || node2.disabled));
  };
  var isAutoFocusAllowed = function(node2) {
    var attribute = node2.getAttribute(FOCUS_NO_AUTOFOCUS);
    return ![true, "true", ""].includes(attribute);
  };
  var isGuard = function(node2) {
    var _a;
    return Boolean(node2 && ((_a = getDataset(node2)) === null || _a === void 0 ? void 0 : _a.focusGuard));
  };
  var isNotAGuard = function(node2) {
    return !isGuard(node2);
  };
  var isDefined = function(x4) {
    return Boolean(x4);
  };

  // node_modules/focus-lock/dist/es2015/utils/tabOrder.js
  var tabSort = function(a3, b3) {
    var tabDiff = a3.tabIndex - b3.tabIndex;
    var indexDiff = a3.index - b3.index;
    if (tabDiff) {
      if (!a3.tabIndex) {
        return 1;
      }
      if (!b3.tabIndex) {
        return -1;
      }
    }
    return tabDiff || indexDiff;
  };
  var orderByTabIndex = function(nodes, filterNegative, keepGuards) {
    return toArray(nodes).map(function(node2, index) {
      return {
        node: node2,
        index,
        tabIndex: keepGuards && node2.tabIndex === -1 ? (node2.dataset || {}).focusGuard ? 0 : -1 : node2.tabIndex
      };
    }).filter(function(data) {
      return !filterNegative || data.tabIndex >= 0;
    }).sort(tabSort);
  };

  // node_modules/focus-lock/dist/es2015/utils/tabbables.js
  var tabbables = [
    "button:enabled",
    "select:enabled",
    "textarea:enabled",
    "input:enabled",
    // elements with explicit roles will also use explicit tabindex
    // '[role="button"]',
    "a[href]",
    "area[href]",
    "summary",
    "iframe",
    "object",
    "embed",
    "audio[controls]",
    "video[controls]",
    "[tabindex]",
    "[contenteditable]",
    "[autofocus]"
  ];

  // node_modules/focus-lock/dist/es2015/utils/tabUtils.js
  var queryTabbables = tabbables.join(",");
  var queryGuardTabbables = "".concat(queryTabbables, ", [data-focus-guard]");
  var getFocusablesWithShadowDom = function(parent, withGuards) {
    return toArray((parent.shadowRoot || parent).children).reduce(function(acc, child) {
      return acc.concat(child.matches(withGuards ? queryGuardTabbables : queryTabbables) ? [child] : [], getFocusablesWithShadowDom(child));
    }, []);
  };
  var getFocusablesWithIFrame = function(parent, withGuards) {
    var _a;
    if (parent instanceof HTMLIFrameElement && ((_a = parent.contentDocument) === null || _a === void 0 ? void 0 : _a.body)) {
      return getFocusables([parent.contentDocument.body], withGuards);
    }
    return [parent];
  };
  var getFocusables = function(parents, withGuards) {
    return parents.reduce(function(acc, parent) {
      var _a;
      var focusableWithShadowDom = getFocusablesWithShadowDom(parent, withGuards);
      var focusableWithIframes = (_a = []).concat.apply(_a, focusableWithShadowDom.map(function(node2) {
        return getFocusablesWithIFrame(node2, withGuards);
      }));
      return acc.concat(
        // add all tabbables inside and within shadow DOMs in DOM order
        focusableWithIframes,
        // add if node is tabbable itself
        parent.parentNode ? toArray(parent.parentNode.querySelectorAll(queryTabbables)).filter(function(node2) {
          return node2 === parent;
        }) : []
      );
    }, []);
  };
  var getParentAutofocusables = function(parent) {
    var parentFocus = parent.querySelectorAll("[".concat(FOCUS_AUTO, "]"));
    return toArray(parentFocus).map(function(node2) {
      return getFocusables([node2]);
    }).reduce(function(acc, nodes) {
      return acc.concat(nodes);
    }, []);
  };

  // node_modules/focus-lock/dist/es2015/utils/DOMutils.js
  var filterFocusable = function(nodes, visibilityCache) {
    return toArray(nodes).filter(function(node2) {
      return isVisibleCached(visibilityCache, node2);
    }).filter(function(node2) {
      return notHiddenInput(node2);
    });
  };
  var filterAutoFocusable = function(nodes, cache) {
    if (cache === void 0) {
      cache = /* @__PURE__ */ new Map();
    }
    return toArray(nodes).filter(function(node2) {
      return isAutoFocusAllowedCached(cache, node2);
    });
  };
  var getTabbableNodes = function(topNodes, visibilityCache, withGuards) {
    return orderByTabIndex(filterFocusable(getFocusables(topNodes, withGuards), visibilityCache), true, withGuards);
  };
  var getAllTabbableNodes = function(topNodes, visibilityCache) {
    return orderByTabIndex(filterFocusable(getFocusables(topNodes), visibilityCache), false);
  };
  var parentAutofocusables = function(topNode, visibilityCache) {
    return filterFocusable(getParentAutofocusables(topNode), visibilityCache);
  };
  var contains = function(scope, element) {
    if (scope.shadowRoot) {
      return contains(scope.shadowRoot, element);
    } else {
      if (Object.getPrototypeOf(scope).contains !== void 0 && Object.getPrototypeOf(scope).contains.call(scope, element)) {
        return true;
      }
      return toArray(scope.children).some(function(child) {
        var _a;
        if (child instanceof HTMLIFrameElement) {
          var iframeBody = (_a = child.contentDocument) === null || _a === void 0 ? void 0 : _a.body;
          if (iframeBody) {
            return contains(iframeBody, element);
          }
          return false;
        }
        return contains(child, element);
      });
    }
  };

  // node_modules/focus-lock/dist/es2015/utils/all-affected.js
  var filterNested = function(nodes) {
    var contained = /* @__PURE__ */ new Set();
    var l3 = nodes.length;
    for (var i3 = 0; i3 < l3; i3 += 1) {
      for (var j4 = i3 + 1; j4 < l3; j4 += 1) {
        var position = nodes[i3].compareDocumentPosition(nodes[j4]);
        if ((position & Node.DOCUMENT_POSITION_CONTAINED_BY) > 0) {
          contained.add(j4);
        }
        if ((position & Node.DOCUMENT_POSITION_CONTAINS) > 0) {
          contained.add(i3);
        }
      }
    }
    return nodes.filter(function(_4, index) {
      return !contained.has(index);
    });
  };
  var getTopParent = function(node2) {
    return node2.parentNode ? getTopParent(node2.parentNode) : node2;
  };
  var getAllAffectedNodes = function(node2) {
    var nodes = asArray(node2);
    return nodes.filter(Boolean).reduce(function(acc, currentNode) {
      var group = currentNode.getAttribute(FOCUS_GROUP);
      acc.push.apply(acc, group ? filterNested(toArray(getTopParent(currentNode).querySelectorAll("[".concat(FOCUS_GROUP, '="').concat(group, '"]:not([').concat(FOCUS_DISABLED, '="disabled"])')))) : [currentNode]);
      return acc;
    }, []);
  };

  // node_modules/focus-lock/dist/es2015/utils/safe.js
  var safeProbe = function(cb) {
    try {
      return cb();
    } catch (e3) {
      return void 0;
    }
  };

  // node_modules/focus-lock/dist/es2015/utils/getActiveElement.js
  var getActiveElement = function(inDocument) {
    if (inDocument === void 0) {
      inDocument = document;
    }
    if (!inDocument || !inDocument.activeElement) {
      return void 0;
    }
    var activeElement = inDocument.activeElement;
    return activeElement.shadowRoot ? getActiveElement(activeElement.shadowRoot) : activeElement instanceof HTMLIFrameElement && safeProbe(function() {
      return activeElement.contentWindow.document;
    }) ? getActiveElement(activeElement.contentWindow.document) : activeElement;
  };

  // node_modules/focus-lock/dist/es2015/focusInside.js
  var focusInFrame = function(frame, activeElement) {
    return frame === activeElement;
  };
  var focusInsideIframe = function(topNode, activeElement) {
    return Boolean(toArray(topNode.querySelectorAll("iframe")).some(function(node2) {
      return focusInFrame(node2, activeElement);
    }));
  };
  var focusInside = function(topNode, activeElement) {
    if (activeElement === void 0) {
      activeElement = getActiveElement(getFirst(topNode).ownerDocument);
    }
    if (!activeElement || activeElement.dataset && activeElement.dataset.focusGuard) {
      return false;
    }
    return getAllAffectedNodes(topNode).some(function(node2) {
      return contains(node2, activeElement) || focusInsideIframe(node2, activeElement);
    });
  };

  // node_modules/focus-lock/dist/es2015/focusIsHidden.js
  var focusIsHidden = function(inDocument) {
    if (inDocument === void 0) {
      inDocument = document;
    }
    var activeElement = getActiveElement(inDocument);
    if (!activeElement) {
      return false;
    }
    return toArray(inDocument.querySelectorAll("[".concat(FOCUS_ALLOW, "]"))).some(function(node2) {
      return contains(node2, activeElement);
    });
  };

  // node_modules/focus-lock/dist/es2015/utils/correctFocus.js
  var findSelectedRadio = function(node2, nodes) {
    return nodes.filter(isRadioElement).filter(function(el) {
      return el.name === node2.name;
    }).filter(function(el) {
      return el.checked;
    })[0] || node2;
  };
  var correctNode = function(node2, nodes) {
    if (isRadioElement(node2) && node2.name) {
      return findSelectedRadio(node2, nodes);
    }
    return node2;
  };
  var correctNodes = function(nodes) {
    var resultSet = /* @__PURE__ */ new Set();
    nodes.forEach(function(node2) {
      return resultSet.add(correctNode(node2, nodes));
    });
    return nodes.filter(function(node2) {
      return resultSet.has(node2);
    });
  };

  // node_modules/focus-lock/dist/es2015/utils/firstFocus.js
  var pickFirstFocus = function(nodes) {
    if (nodes[0] && nodes.length > 1) {
      return correctNode(nodes[0], nodes);
    }
    return nodes[0];
  };
  var pickFocusable = function(nodes, index) {
    if (nodes.length > 1) {
      return nodes.indexOf(correctNode(nodes[index], nodes));
    }
    return index;
  };

  // node_modules/focus-lock/dist/es2015/solver.js
  var NEW_FOCUS = "NEW_FOCUS";
  var newFocus = function(innerNodes, outerNodes, activeElement, lastNode) {
    var cnt = innerNodes.length;
    var firstFocus = innerNodes[0];
    var lastFocus = innerNodes[cnt - 1];
    var isOnGuard = isGuard(activeElement);
    if (activeElement && innerNodes.indexOf(activeElement) >= 0) {
      return void 0;
    }
    var activeIndex = activeElement !== void 0 ? outerNodes.indexOf(activeElement) : -1;
    var lastIndex = lastNode ? outerNodes.indexOf(lastNode) : activeIndex;
    var lastNodeInside = lastNode ? innerNodes.indexOf(lastNode) : -1;
    var indexDiff = activeIndex - lastIndex;
    var firstNodeIndex = outerNodes.indexOf(firstFocus);
    var lastNodeIndex = outerNodes.indexOf(lastFocus);
    var correctedNodes = correctNodes(outerNodes);
    var correctedIndex = activeElement !== void 0 ? correctedNodes.indexOf(activeElement) : -1;
    var correctedIndexDiff = correctedIndex - (lastNode ? correctedNodes.indexOf(lastNode) : activeIndex);
    var returnFirstNode = pickFocusable(innerNodes, 0);
    var returnLastNode = pickFocusable(innerNodes, cnt - 1);
    if (activeIndex === -1 || lastNodeInside === -1) {
      return NEW_FOCUS;
    }
    if (!indexDiff && lastNodeInside >= 0) {
      return lastNodeInside;
    }
    if (activeIndex <= firstNodeIndex && isOnGuard && Math.abs(indexDiff) > 1) {
      return returnLastNode;
    }
    if (activeIndex >= lastNodeIndex && isOnGuard && Math.abs(indexDiff) > 1) {
      return returnFirstNode;
    }
    if (indexDiff && Math.abs(correctedIndexDiff) > 1) {
      return lastNodeInside;
    }
    if (activeIndex <= firstNodeIndex) {
      return returnLastNode;
    }
    if (activeIndex > lastNodeIndex) {
      return returnFirstNode;
    }
    if (indexDiff) {
      if (Math.abs(indexDiff) > 1) {
        return lastNodeInside;
      }
      return (cnt + lastNodeInside + indexDiff) % cnt;
    }
    return void 0;
  };

  // node_modules/focus-lock/dist/es2015/utils/auto-focus.js
  var findAutoFocused = function(autoFocusables) {
    return function(node2) {
      var _a;
      var autofocus = (_a = getDataset(node2)) === null || _a === void 0 ? void 0 : _a.autofocus;
      return (
        // @ts-expect-error
        node2.autofocus || //
        autofocus !== void 0 && autofocus !== "false" || //
        autoFocusables.indexOf(node2) >= 0
      );
    };
  };
  var pickAutofocus = function(nodesIndexes, orderedNodes, groups) {
    var nodes = nodesIndexes.map(function(_a) {
      var node2 = _a.node;
      return node2;
    });
    var autoFocusable = filterAutoFocusable(nodes.filter(findAutoFocused(groups)));
    if (autoFocusable && autoFocusable.length) {
      return pickFirstFocus(autoFocusable);
    }
    return pickFirstFocus(filterAutoFocusable(orderedNodes));
  };

  // node_modules/focus-lock/dist/es2015/utils/parenting.js
  var getParents = function(node2, parents) {
    if (parents === void 0) {
      parents = [];
    }
    parents.push(node2);
    if (node2.parentNode) {
      getParents(node2.parentNode.host || node2.parentNode, parents);
    }
    return parents;
  };
  var getCommonParent = function(nodeA, nodeB) {
    var parentsA = getParents(nodeA);
    var parentsB = getParents(nodeB);
    for (var i3 = 0; i3 < parentsA.length; i3 += 1) {
      var currentParent = parentsA[i3];
      if (parentsB.indexOf(currentParent) >= 0) {
        return currentParent;
      }
    }
    return false;
  };
  var getTopCommonParent = function(baseActiveElement, leftEntry, rightEntries) {
    var activeElements = asArray(baseActiveElement);
    var leftEntries = asArray(leftEntry);
    var activeElement = activeElements[0];
    var topCommon = false;
    leftEntries.filter(Boolean).forEach(function(entry) {
      topCommon = getCommonParent(topCommon || entry, entry) || topCommon;
      rightEntries.filter(Boolean).forEach(function(subEntry) {
        var common = getCommonParent(activeElement, subEntry);
        if (common) {
          if (!topCommon || contains(common, topCommon)) {
            topCommon = common;
          } else {
            topCommon = getCommonParent(common, topCommon);
          }
        }
      });
    });
    return topCommon;
  };
  var allParentAutofocusables = function(entries, visibilityCache) {
    return entries.reduce(function(acc, node2) {
      return acc.concat(parentAutofocusables(node2, visibilityCache));
    }, []);
  };

  // node_modules/focus-lock/dist/es2015/focusMerge.js
  var reorderNodes = function(srcNodes, dstNodes) {
    var remap = /* @__PURE__ */ new Map();
    dstNodes.forEach(function(entity) {
      return remap.set(entity.node, entity);
    });
    return srcNodes.map(function(node2) {
      return remap.get(node2);
    }).filter(isDefined);
  };
  var getFocusMerge = function(topNode, lastNode) {
    var activeElement = getActiveElement(asArray(topNode).length > 0 ? document : getFirst(topNode).ownerDocument);
    var entries = getAllAffectedNodes(topNode).filter(isNotAGuard);
    var commonParent = getTopCommonParent(activeElement || topNode, topNode, entries);
    var visibilityCache = /* @__PURE__ */ new Map();
    var anyFocusable = getAllTabbableNodes(entries, visibilityCache);
    var innerElements = getTabbableNodes(entries, visibilityCache).filter(function(_a) {
      var node2 = _a.node;
      return isNotAGuard(node2);
    });
    if (!innerElements[0]) {
      innerElements = anyFocusable;
      if (!innerElements[0]) {
        return void 0;
      }
    }
    var outerNodes = getAllTabbableNodes([commonParent], visibilityCache).map(function(_a) {
      var node2 = _a.node;
      return node2;
    });
    var orderedInnerElements = reorderNodes(outerNodes, innerElements);
    var innerNodes = orderedInnerElements.map(function(_a) {
      var node2 = _a.node;
      return node2;
    });
    var newId = newFocus(innerNodes, outerNodes, activeElement, lastNode);
    if (newId === NEW_FOCUS) {
      var focusNode = pickAutofocus(anyFocusable, innerNodes, allParentAutofocusables(entries, visibilityCache));
      if (focusNode) {
        return { node: focusNode };
      } else {
        console.warn("focus-lock: cannot find any node to move focus into");
        return void 0;
      }
    }
    if (newId === void 0) {
      return newId;
    }
    return orderedInnerElements[newId];
  };

  // node_modules/focus-lock/dist/es2015/focusables.js
  var getFocusabledIn = function(topNode) {
    var entries = getAllAffectedNodes(topNode).filter(isNotAGuard);
    var commonParent = getTopCommonParent(topNode, topNode, entries);
    var visibilityCache = /* @__PURE__ */ new Map();
    var outerNodes = getTabbableNodes([commonParent], visibilityCache, true);
    var innerElements = getTabbableNodes(entries, visibilityCache).filter(function(_a) {
      var node2 = _a.node;
      return isNotAGuard(node2);
    }).map(function(_a) {
      var node2 = _a.node;
      return node2;
    });
    return outerNodes.map(function(_a) {
      var node2 = _a.node, index = _a.index;
      return {
        node: node2,
        index,
        lockItem: innerElements.indexOf(node2) >= 0,
        guard: isGuard(node2)
      };
    });
  };

  // node_modules/focus-lock/dist/es2015/setFocus.js
  var focusOn = function(target, focusOptions) {
    if ("focus" in target) {
      target.focus(focusOptions);
    }
    if ("contentWindow" in target && target.contentWindow) {
      target.contentWindow.focus();
    }
  };
  var guardCount = 0;
  var lockDisabled = false;
  var setFocus = function(topNode, lastNode, options) {
    if (options === void 0) {
      options = {};
    }
    var focusable = getFocusMerge(topNode, lastNode);
    if (lockDisabled) {
      return;
    }
    if (focusable) {
      if (guardCount > 2) {
        console.error("FocusLock: focus-fighting detected. Only one focus management system could be active. See https://github.com/theKashey/focus-lock/#focus-fighting");
        lockDisabled = true;
        setTimeout(function() {
          lockDisabled = false;
        }, 1);
        return;
      }
      guardCount++;
      focusOn(focusable.node, options.focusOptions);
      guardCount--;
    }
  };

  // node_modules/focus-lock/dist/es2015/index.js
  var es2015_default = setFocus;

  // node_modules/react-focus-lock/dist/es2015/util.js
  function deferAction(action) {
    var _window = window, setImmediate = _window.setImmediate;
    if (typeof setImmediate !== "undefined") {
      setImmediate(action);
    } else {
      setTimeout(action, 1);
    }
  }

  // node_modules/react-focus-lock/dist/es2015/Trap.js
  var focusOnBody = function focusOnBody2() {
    return document && document.activeElement === document.body;
  };
  var isFreeFocus = function isFreeFocus2() {
    return focusOnBody() || focusIsHidden();
  };
  var lastActiveTrap = null;
  var lastActiveFocus = null;
  var lastPortaledElement = null;
  var focusWasOutsideWindow = false;
  var defaultWhitelist = function defaultWhitelist2() {
    return true;
  };
  var focusWhitelisted = function focusWhitelisted2(activeElement) {
    return (lastActiveTrap.whiteList || defaultWhitelist)(activeElement);
  };
  var recordPortal = function recordPortal2(observerNode, portaledElement) {
    lastPortaledElement = {
      observerNode,
      portaledElement
    };
  };
  var focusIsPortaledPair = function focusIsPortaledPair2(element) {
    return lastPortaledElement && lastPortaledElement.portaledElement === element;
  };
  function autoGuard(startIndex, end, step, allNodes) {
    var lastGuard = null;
    var i3 = startIndex;
    do {
      var item = allNodes[i3];
      if (item.guard) {
        if (item.node.dataset.focusAutoGuard) {
          lastGuard = item;
        }
      } else if (item.lockItem) {
        if (i3 !== startIndex) {
          return;
        }
        lastGuard = null;
      } else {
        break;
      }
    } while ((i3 += step) !== end);
    if (lastGuard) {
      lastGuard.node.tabIndex = 0;
    }
  }
  var extractRef = function extractRef2(ref) {
    return ref && "current" in ref ? ref.current : ref;
  };
  var focusWasOutside = function focusWasOutside2(crossFrameOption) {
    if (crossFrameOption) {
      return Boolean(focusWasOutsideWindow);
    }
    return focusWasOutsideWindow === "meanwhile";
  };
  var checkInHost = function checkInHost2(check, el, boundary) {
    return el && // find host equal to active element and check nested active element
      (el.host === check && (!el.activeElement || boundary.contains(el.activeElement)) || el.parentNode && checkInHost2(check, el.parentNode, boundary));
  };
  var withinHost = function withinHost2(activeElement, workingArea) {
    return workingArea.some(function(area) {
      return checkInHost(activeElement, area, area);
    });
  };
  var activateTrap = function activateTrap2() {
    var result = false;
    if (lastActiveTrap) {
      var _lastActiveTrap = lastActiveTrap, observed = _lastActiveTrap.observed, persistentFocus = _lastActiveTrap.persistentFocus, autoFocus = _lastActiveTrap.autoFocus, shards = _lastActiveTrap.shards, crossFrame = _lastActiveTrap.crossFrame, focusOptions = _lastActiveTrap.focusOptions;
      var workingNode = observed || lastPortaledElement && lastPortaledElement.portaledElement;
      var activeElement = document && document.activeElement;
      if (workingNode) {
        var workingArea = [workingNode].concat(shards.map(extractRef).filter(Boolean));
        if (!activeElement || focusWhitelisted(activeElement)) {
          if (persistentFocus || focusWasOutside(crossFrame) || !isFreeFocus() || !lastActiveFocus && autoFocus) {
            if (workingNode && !// active element is "inside" working area
              (focusInside(workingArea) || // check for shadow-dom contained elements
                activeElement && withinHost(activeElement, workingArea) || focusIsPortaledPair(activeElement, workingNode))) {
              if (document && !lastActiveFocus && activeElement && !autoFocus) {
                if (activeElement.blur) {
                  activeElement.blur();
                }
                document.body.focus();
              } else {
                result = es2015_default(workingArea, lastActiveFocus, {
                  focusOptions
                });
                lastPortaledElement = {};
              }
            }
            focusWasOutsideWindow = false;
            lastActiveFocus = document && document.activeElement;
          }
        }
        if (document) {
          var newActiveElement = document && document.activeElement;
          var allNodes = getFocusabledIn(workingArea);
          var focusedIndex = allNodes.map(function(_ref2) {
            var node2 = _ref2.node;
            return node2;
          }).indexOf(newActiveElement);
          if (focusedIndex > -1) {
            allNodes.filter(function(_ref2) {
              var guard = _ref2.guard, node2 = _ref2.node;
              return guard && node2.dataset.focusAutoGuard;
            }).forEach(function(_ref3) {
              var node2 = _ref3.node;
              return node2.removeAttribute("tabIndex");
            });
            autoGuard(focusedIndex, allNodes.length, 1, allNodes);
            autoGuard(focusedIndex, -1, -1, allNodes);
          }
        }
      }
    }
    return result;
  };
  var onTrap = function onTrap2(event) {
    if (activateTrap() && event) {
      event.stopPropagation();
      event.preventDefault();
    }
  };
  var onBlur = function onBlur2() {
    return deferAction(activateTrap);
  };
  var onFocus = function onFocus2(event) {
    var source = event.target;
    var currentNode = event.currentTarget;
    if (!currentNode.contains(source)) {
      recordPortal(currentNode, source);
    }
  };
  var FocusWatcher = function FocusWatcher2() {
    return null;
  };
  var FocusTrap = function FocusTrap2(_ref4) {
    var children = _ref4.children;
    return /* @__PURE__ */ y("div", {
      onBlur,
      onFocus
    }, children);
  };
  FocusTrap.propTypes = true ? {
    children: import_prop_types3.default.node.isRequired
  } : {};
  var onWindowBlur = function onWindowBlur2() {
    focusWasOutsideWindow = "just";
    setTimeout(function() {
      focusWasOutsideWindow = "meanwhile";
    }, 0);
  };
  var attachHandler = function attachHandler2() {
    document.addEventListener("focusin", onTrap);
    document.addEventListener("focusout", onBlur);
    window.addEventListener("blur", onWindowBlur);
  };
  var detachHandler = function detachHandler2() {
    document.removeEventListener("focusin", onTrap);
    document.removeEventListener("focusout", onBlur);
    window.removeEventListener("blur", onWindowBlur);
  };
  function reducePropsToState(propsList) {
    return propsList.filter(function(_ref5) {
      var disabled = _ref5.disabled;
      return !disabled;
    });
  }
  function handleStateChangeOnClient(traps) {
    var trap = traps.slice(-1)[0];
    if (trap && !lastActiveTrap) {
      attachHandler();
    }
    var lastTrap = lastActiveTrap;
    var sameTrap = lastTrap && trap && trap.id === lastTrap.id;
    lastActiveTrap = trap;
    if (lastTrap && !sameTrap) {
      lastTrap.onDeactivation();
      if (!traps.filter(function(_ref6) {
        var id = _ref6.id;
        return id === lastTrap.id;
      }).length) {
        lastTrap.returnFocus(!trap);
      }
    }
    if (trap) {
      lastActiveFocus = null;
      if (!sameTrap || lastTrap.observed !== trap.observed) {
        trap.onActivation();
      }
      activateTrap(true);
      deferAction(activateTrap);
    } else {
      detachHandler();
      lastActiveFocus = null;
    }
  }
  mediumFocus.assignSyncMedium(onFocus);
  mediumBlur.assignMedium(onBlur);
  mediumEffect.assignMedium(function(cb) {
    return cb({
      moveFocusInside: es2015_default,
      focusInside
    });
  });
  var Trap_default = index_es_default(reducePropsToState, handleStateChangeOnClient)(FocusWatcher);

  // node_modules/react-focus-lock/dist/es2015/Combination.js
  var FocusLockCombination = /* @__PURE__ */ k3(function FocusLockUICombination(props, ref) {
    return /* @__PURE__ */ y(Lock_default, _extends({
      sideCar: Trap_default,
      ref
    }, props));
  });
  var _ref = Lock_default.propTypes || {};
  var sideCar = _ref.sideCar;
  var propTypes = _objectWithoutPropertiesLoose(_ref, ["sideCar"]);
  FocusLockCombination.propTypes = true ? propTypes : {};
  var Combination_default = FocusLockCombination;

  // node_modules/react-focus-lock/dist/es2015/index.js
  var es2015_default2 = Combination_default;

  // node_modules/react-remove-scroll-bar/dist/es2015/constants.js
  var zeroRightClassName = "right-scroll-bar-position";
  var fullWidthClassName = "width-before-scroll-bar";
  var noScrollbarsClassName = "with-scroll-bars-hidden";
  var removedBarSizeVariable = "--removed-body-scroll-bar-size";

  // node_modules/react-remove-scroll/dist/es2015/medium.js
  var effectCar = createSidecarMedium();

  // node_modules/react-remove-scroll/dist/es2015/UI.js
  var nothing = function() {
    return;
  };
  var RemoveScroll = k3(function(props, parentRef) {
    var ref = _2(null);
    var _a = p2({
      onScrollCapture: nothing,
      onWheelCapture: nothing,
      onTouchMoveCapture: nothing
    }), callbacks = _a[0], setCallbacks = _a[1];
    var forwardProps = props.forwardProps, children = props.children, className = props.className, removeScrollBar = props.removeScrollBar, enabled = props.enabled, shards = props.shards, sideCar2 = props.sideCar, noIsolation = props.noIsolation, inert = props.inert, allowPinchZoom = props.allowPinchZoom, _b = props.as, Container = _b === void 0 ? "div" : _b, rest = __rest(props, ["forwardProps", "children", "className", "removeScrollBar", "enabled", "shards", "sideCar", "noIsolation", "inert", "allowPinchZoom", "as"]);
    var SideCar2 = sideCar2;
    var containerRef = useMergeRefs([ref, parentRef]);
    var containerProps = __assign(__assign({}, rest), callbacks);
    return y(
      _,
      null,
      enabled && y(SideCar2, { sideCar: effectCar, removeScrollBar, shards, noIsolation, inert, setCallbacks, allowPinchZoom: !!allowPinchZoom, lockRef: ref }),
      forwardProps ? cn(O2.only(children), __assign(__assign({}, containerProps), { ref: containerRef })) : y(Container, __assign({}, containerProps, { className, ref: containerRef }), children)
    );
  });
  RemoveScroll.defaultProps = {
    enabled: true,
    removeScrollBar: true,
    inert: false
  };
  RemoveScroll.classNames = {
    fullWidth: fullWidthClassName,
    zeroRight: zeroRightClassName
  };

  // node_modules/get-nonce/dist/es2015/index.js
  var currentNonce;
  var getNonce = function() {
    if (currentNonce) {
      return currentNonce;
    }
    if (typeof __webpack_nonce__ !== "undefined") {
      return __webpack_nonce__;
    }
    return void 0;
  };

  // node_modules/react-style-singleton/dist/es2015/singleton.js
  function makeStyleTag() {
    if (!document)
      return null;
    var tag = document.createElement("style");
    tag.type = "text/css";
    var nonce = getNonce();
    if (nonce) {
      tag.setAttribute("nonce", nonce);
    }
    return tag;
  }
  function injectStyles(tag, css) {
    if (tag.styleSheet) {
      tag.styleSheet.cssText = css;
    } else {
      tag.appendChild(document.createTextNode(css));
    }
  }
  function insertStyleTag(tag) {
    var head = document.head || document.getElementsByTagName("head")[0];
    head.appendChild(tag);
  }
  var stylesheetSingleton = function() {
    var counter = 0;
    var stylesheet = null;
    return {
      add: function(style) {
        if (counter == 0) {
          if (stylesheet = makeStyleTag()) {
            injectStyles(stylesheet, style);
            insertStyleTag(stylesheet);
          }
        }
        counter++;
      },
      remove: function() {
        counter--;
        if (!counter && stylesheet) {
          stylesheet.parentNode && stylesheet.parentNode.removeChild(stylesheet);
          stylesheet = null;
        }
      }
    };
  };

  // node_modules/react-style-singleton/dist/es2015/hook.js
  var styleHookSingleton = function() {
    var sheet = stylesheetSingleton();
    return function(styles, isDynamic) {
      h2(function() {
        sheet.add(styles);
        return function() {
          sheet.remove();
        };
      }, [styles && isDynamic]);
    };
  };

  // node_modules/react-style-singleton/dist/es2015/component.js
  var styleSingleton = function() {
    var useStyle = styleHookSingleton();
    var Sheet = function(_a) {
      var styles = _a.styles, dynamic = _a.dynamic;
      useStyle(styles, dynamic);
      return null;
    };
    return Sheet;
  };

  // node_modules/react-remove-scroll-bar/dist/es2015/utils.js
  var zeroGap = {
    left: 0,
    top: 0,
    right: 0,
    gap: 0
  };
  var parse = function(x4) {
    return parseInt(x4 || "", 10) || 0;
  };
  var getOffset = function(gapMode) {
    var cs = window.getComputedStyle(document.body);
    var left = cs[gapMode === "padding" ? "paddingLeft" : "marginLeft"];
    var top = cs[gapMode === "padding" ? "paddingTop" : "marginTop"];
    var right = cs[gapMode === "padding" ? "paddingRight" : "marginRight"];
    return [parse(left), parse(top), parse(right)];
  };
  var getGapWidth = function(gapMode) {
    if (gapMode === void 0) {
      gapMode = "margin";
    }
    if (typeof window === "undefined") {
      return zeroGap;
    }
    var offsets = getOffset(gapMode);
    var documentWidth = document.documentElement.clientWidth;
    var windowWidth = window.innerWidth;
    return {
      left: offsets[0],
      top: offsets[1],
      right: offsets[2],
      gap: Math.max(0, windowWidth - documentWidth + offsets[2] - offsets[0])
    };
  };

  // node_modules/react-remove-scroll-bar/dist/es2015/component.js
  var Style = styleSingleton();
  var getStyles = function(_a, allowRelative, gapMode, important) {
    var left = _a.left, top = _a.top, right = _a.right, gap = _a.gap;
    if (gapMode === void 0) {
      gapMode = "margin";
    }
    return "\n  .".concat(noScrollbarsClassName, " {\n   overflow: hidden ").concat(important, ";\n   padding-right: ").concat(gap, "px ").concat(important, ";\n  }\n  body {\n    overflow: hidden ").concat(important, ";\n    overscroll-behavior: contain;\n    ").concat([
      allowRelative && "position: relative ".concat(important, ";"),
      gapMode === "margin" && "\n    padding-left: ".concat(left, "px;\n    padding-top: ").concat(top, "px;\n    padding-right: ").concat(right, "px;\n    margin-left:0;\n    margin-top:0;\n    margin-right: ").concat(gap, "px ").concat(important, ";\n    "),
      gapMode === "padding" && "padding-right: ".concat(gap, "px ").concat(important, ";")
    ].filter(Boolean).join(""), "\n  }\n  \n  .").concat(zeroRightClassName, " {\n    right: ").concat(gap, "px ").concat(important, ";\n  }\n  \n  .").concat(fullWidthClassName, " {\n    margin-right: ").concat(gap, "px ").concat(important, ";\n  }\n  \n  .").concat(zeroRightClassName, " .").concat(zeroRightClassName, " {\n    right: 0 ").concat(important, ";\n  }\n  \n  .").concat(fullWidthClassName, " .").concat(fullWidthClassName, " {\n    margin-right: 0 ").concat(important, ";\n  }\n  \n  body {\n    ").concat(removedBarSizeVariable, ": ").concat(gap, "px;\n  }\n");
  };
  var RemoveScrollBar = function(props) {
    var noRelative = props.noRelative, noImportant = props.noImportant, _a = props.gapMode, gapMode = _a === void 0 ? "margin" : _a;
    var gap = F2(function() {
      return getGapWidth(gapMode);
    }, [gapMode]);
    return y(Style, { styles: getStyles(gap, !noRelative, gapMode, !noImportant ? "!important" : "") });
  };

  // node_modules/react-remove-scroll/dist/es2015/aggresiveCapture.js
  var passiveSupported = false;
  if (typeof window !== "undefined") {
    try {
      options = Object.defineProperty({}, "passive", {
        get: function() {
          passiveSupported = true;
          return true;
        }
      });
      window.addEventListener("test", options, options);
      window.removeEventListener("test", options, options);
    } catch (err) {
      passiveSupported = false;
    }
  }
  var options;
  var nonPassive = passiveSupported ? { passive: false } : false;

  // node_modules/react-remove-scroll/dist/es2015/handleScroll.js
  var alwaysContainsScroll = function(node2) {
    return node2.tagName === "TEXTAREA";
  };
  var elementCanBeScrolled = function(node2, overflow) {
    var styles = window.getComputedStyle(node2);
    return (
      // not-not-scrollable
      styles[overflow] !== "hidden" && // contains scroll inside self
      !(styles.overflowY === styles.overflowX && !alwaysContainsScroll(node2) && styles[overflow] === "visible")
    );
  };
  var elementCouldBeVScrolled = function(node2) {
    return elementCanBeScrolled(node2, "overflowY");
  };
  var elementCouldBeHScrolled = function(node2) {
    return elementCanBeScrolled(node2, "overflowX");
  };
  var locationCouldBeScrolled = function(axis, node2) {
    var current = node2;
    do {
      if (typeof ShadowRoot !== "undefined" && current instanceof ShadowRoot) {
        current = current.host;
      }
      var isScrollable = elementCouldBeScrolled(axis, current);
      if (isScrollable) {
        var _a = getScrollVariables(axis, current), s3 = _a[1], d3 = _a[2];
        if (s3 > d3) {
          return true;
        }
      }
      current = current.parentNode;
    } while (current && current !== document.body);
    return false;
  };
  var getVScrollVariables = function(_a) {
    var scrollTop = _a.scrollTop, scrollHeight = _a.scrollHeight, clientHeight = _a.clientHeight;
    return [
      scrollTop,
      scrollHeight,
      clientHeight
    ];
  };
  var getHScrollVariables = function(_a) {
    var scrollLeft = _a.scrollLeft, scrollWidth = _a.scrollWidth, clientWidth = _a.clientWidth;
    return [
      scrollLeft,
      scrollWidth,
      clientWidth
    ];
  };
  var elementCouldBeScrolled = function(axis, node2) {
    return axis === "v" ? elementCouldBeVScrolled(node2) : elementCouldBeHScrolled(node2);
  };
  var getScrollVariables = function(axis, node2) {
    return axis === "v" ? getVScrollVariables(node2) : getHScrollVariables(node2);
  };
  var getDirectionFactor = function(axis, direction) {
    return axis === "h" && direction === "rtl" ? -1 : 1;
  };
  var handleScroll = function(axis, endTarget, event, sourceDelta, noOverscroll) {
    var directionFactor = getDirectionFactor(axis, window.getComputedStyle(endTarget).direction);
    var delta = directionFactor * sourceDelta;
    var target = event.target;
    var targetInLock = endTarget.contains(target);
    var shouldCancelScroll = false;
    var isDeltaPositive = delta > 0;
    var availableScroll = 0;
    var availableScrollTop = 0;
    do {
      var _a = getScrollVariables(axis, target), position = _a[0], scroll_1 = _a[1], capacity = _a[2];
      var elementScroll = scroll_1 - capacity - directionFactor * position;
      if (position || elementScroll) {
        if (elementCouldBeScrolled(axis, target)) {
          availableScroll += elementScroll;
          availableScrollTop += position;
        }
      }
      target = target.parentNode;
    } while (
      // portaled content
    !targetInLock && target !== document.body || // self content
    targetInLock && (endTarget.contains(target) || endTarget === target)
      );
    if (isDeltaPositive && (noOverscroll && availableScroll === 0 || !noOverscroll && delta > availableScroll)) {
      shouldCancelScroll = true;
    } else if (!isDeltaPositive && (noOverscroll && availableScrollTop === 0 || !noOverscroll && -delta > availableScrollTop)) {
      shouldCancelScroll = true;
    }
    return shouldCancelScroll;
  };

  // node_modules/react-remove-scroll/dist/es2015/SideEffect.js
  var getTouchXY = function(event) {
    return "changedTouches" in event ? [event.changedTouches[0].clientX, event.changedTouches[0].clientY] : [0, 0];
  };
  var getDeltaXY = function(event) {
    return [event.deltaX, event.deltaY];
  };
  var extractRef3 = function(ref) {
    return ref && "current" in ref ? ref.current : ref;
  };
  var deltaCompare = function(x4, y3) {
    return x4[0] === y3[0] && x4[1] === y3[1];
  };
  var generateStyle = function(id) {
    return "\n  .block-interactivity-".concat(id, " {pointer-events: none;}\n  .allow-interactivity-").concat(id, " {pointer-events: all;}\n");
  };
  var idCounter = 0;
  var lockStack = [];
  function RemoveScrollSideCar(props) {
    var shouldPreventQueue = _2([]);
    var touchStartRef = _2([0, 0]);
    var activeAxis = _2();
    var id = p2(idCounter++)[0];
    var Style2 = p2(function() {
      return styleSingleton();
    })[0];
    var lastProps = _2(props);
    h2(function() {
      lastProps.current = props;
    }, [props]);
    h2(function() {
      if (props.inert) {
        document.body.classList.add("block-interactivity-".concat(id));
        var allow_1 = __spreadArray([props.lockRef.current], (props.shards || []).map(extractRef3), true).filter(Boolean);
        allow_1.forEach(function(el) {
          return el.classList.add("allow-interactivity-".concat(id));
        });
        return function() {
          document.body.classList.remove("block-interactivity-".concat(id));
          allow_1.forEach(function(el) {
            return el.classList.remove("allow-interactivity-".concat(id));
          });
        };
      }
      return;
    }, [props.inert, props.lockRef.current, props.shards]);
    var shouldCancelEvent = T2(function(event, parent) {
      if ("touches" in event && event.touches.length === 2) {
        return !lastProps.current.allowPinchZoom;
      }
      var touch = getTouchXY(event);
      var touchStart = touchStartRef.current;
      var deltaX = "deltaX" in event ? event.deltaX : touchStart[0] - touch[0];
      var deltaY = "deltaY" in event ? event.deltaY : touchStart[1] - touch[1];
      var currentAxis;
      var target = event.target;
      var moveDirection = Math.abs(deltaX) > Math.abs(deltaY) ? "h" : "v";
      if ("touches" in event && moveDirection === "h" && target.type === "range") {
        return false;
      }
      var canBeScrolledInMainDirection = locationCouldBeScrolled(moveDirection, target);
      if (!canBeScrolledInMainDirection) {
        return true;
      }
      if (canBeScrolledInMainDirection) {
        currentAxis = moveDirection;
      } else {
        currentAxis = moveDirection === "v" ? "h" : "v";
        canBeScrolledInMainDirection = locationCouldBeScrolled(moveDirection, target);
      }
      if (!canBeScrolledInMainDirection) {
        return false;
      }
      if (!activeAxis.current && "changedTouches" in event && (deltaX || deltaY)) {
        activeAxis.current = currentAxis;
      }
      if (!currentAxis) {
        return true;
      }
      var cancelingAxis = activeAxis.current || currentAxis;
      return handleScroll(cancelingAxis, parent, event, cancelingAxis === "h" ? deltaX : deltaY, true);
    }, []);
    var shouldPrevent = T2(function(_event) {
      var event = _event;
      if (!lockStack.length || lockStack[lockStack.length - 1] !== Style2) {
        return;
      }
      var delta = "deltaY" in event ? getDeltaXY(event) : getTouchXY(event);
      var sourceEvent = shouldPreventQueue.current.filter(function(e3) {
        return e3.name === event.type && e3.target === event.target && deltaCompare(e3.delta, delta);
      })[0];
      if (sourceEvent && sourceEvent.should) {
        if (event.cancelable) {
          event.preventDefault();
        }
        return;
      }
      if (!sourceEvent) {
        var shardNodes = (lastProps.current.shards || []).map(extractRef3).filter(Boolean).filter(function(node2) {
          return node2.contains(event.target);
        });
        var shouldStop = shardNodes.length > 0 ? shouldCancelEvent(event, shardNodes[0]) : !lastProps.current.noIsolation;
        if (shouldStop) {
          if (event.cancelable) {
            event.preventDefault();
          }
        }
      }
    }, []);
    var shouldCancel = T2(function(name, delta, target, should) {
      var event = { name, delta, target, should };
      shouldPreventQueue.current.push(event);
      setTimeout(function() {
        shouldPreventQueue.current = shouldPreventQueue.current.filter(function(e3) {
          return e3 !== event;
        });
      }, 1);
    }, []);
    var scrollTouchStart = T2(function(event) {
      touchStartRef.current = getTouchXY(event);
      activeAxis.current = void 0;
    }, []);
    var scrollWheel = T2(function(event) {
      shouldCancel(event.type, getDeltaXY(event), event.target, shouldCancelEvent(event, props.lockRef.current));
    }, []);
    var scrollTouchMove = T2(function(event) {
      shouldCancel(event.type, getTouchXY(event), event.target, shouldCancelEvent(event, props.lockRef.current));
    }, []);
    h2(function() {
      lockStack.push(Style2);
      props.setCallbacks({
        onScrollCapture: scrollWheel,
        onWheelCapture: scrollWheel,
        onTouchMoveCapture: scrollTouchMove
      });
      document.addEventListener("wheel", shouldPrevent, nonPassive);
      document.addEventListener("touchmove", shouldPrevent, nonPassive);
      document.addEventListener("touchstart", scrollTouchStart, nonPassive);
      return function() {
        lockStack = lockStack.filter(function(inst) {
          return inst !== Style2;
        });
        document.removeEventListener("wheel", shouldPrevent, nonPassive);
        document.removeEventListener("touchmove", shouldPrevent, nonPassive);
        document.removeEventListener("touchstart", scrollTouchStart, nonPassive);
      };
    }, []);
    var removeScrollBar = props.removeScrollBar, inert = props.inert;
    return y(
      _,
      null,
      inert ? y(Style2, { styles: generateStyle(id) }) : null,
      removeScrollBar ? y(RemoveScrollBar, { gapMode: "margin" }) : null
    );
  }

  // node_modules/react-remove-scroll/dist/es2015/sidecar.js
  var sidecar_default = exportSidecar(effectCar, RemoveScrollSideCar);

  // node_modules/react-remove-scroll/dist/es2015/Combination.js
  var ReactRemoveScroll = k3(function(props, ref) {
    return y(RemoveScroll, __assign({}, props, { ref, sideCar: sidecar_default }));
  });
  ReactRemoveScroll.classNames = RemoveScroll.classNames;
  var Combination_default2 = ReactRemoveScroll;

  // node_modules/preact/jsx-runtime/dist/jsxRuntime.module.js
  var _3 = 0;
  function o3(o4, e3, n2, t3, f3, l3) {
    var s3, u3, a3 = {};
    for (u3 in e3)
      "ref" == u3 ? s3 = e3[u3] : a3[u3] = e3[u3];
    var i3 = { type: o4, props: a3, key: n2, ref: s3, __k: null, __: null, __b: 0, __e: null, __d: void 0, __c: null, __h: null, constructor: void 0, __v: --_3, __source: f3, __self: l3 };
    if ("function" == typeof o4 && (s3 = o4.defaultProps))
      for (u3 in s3)
        void 0 === a3[u3] && (a3[u3] = s3[u3]);
    return l.vnode && l.vnode(i3), i3;
  }

  // src/scripts/shared/CheckoutHandler/Modal.tsx
  var modalBackgroundStyles = {
    position: "fixed",
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    zIndex: 1e5,
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  };
  var modalContainerStyles = {
    boxSizing: "border-box",
    position: "relative",
    borderRadius: "4px",
    backgroundColor: "#fafafa",
    padding: "55px",
    textAlign: "center",
    fontFamily: "sans-serif",
    maxWidth: "600px",
    color: "#262626",
    lineHeight: "1.4"
  };
  var closeButtonStyles = {
    padding: 0,
    cursor: "pointer",
    backgroundColor: "transparent",
    display: "flex",
    alignItems: "center",
    border: 0
  };
  var closeButtonIconStyles = {
    width: "24px",
    height: "24px",
    position: "absolute",
    top: "18px",
    right: "18px"
  };
  var Modal = ({
                 children,
                 modalTitle,
                 onModalClick = () => {
                 },
                 onOverlayClick = () => {
                 },
                 displayCloseButton,
                 onCloseRequest = () => {
                 }
               }) => {
    return /* @__PURE__ */ o3(Combination_default2, { children: /* @__PURE__ */ o3("div", { style: modalBackgroundStyles, onClick: onOverlayClick, children: /* @__PURE__ */ o3(es2015_default2, { returnFocus: true, persistentFocus: true, children: /* @__PURE__ */ o3(
            "div",
            {
              style: modalContainerStyles,
              role: "dialog",
              "aria-modal": "true",
              "aria-label": modalTitle,
              title: modalTitle,
              onClick: onModalClick,
              children: [
                displayCloseButton ? /* @__PURE__ */ o3("button", { type: "button", style: closeButtonStyles, "aria-label": "close", onClick: onCloseRequest, children: /* @__PURE__ */ o3("svg", { style: closeButtonIconStyles, viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", children: /* @__PURE__ */ o3("path", { d: "M19.8 2.908c-.185-.185-.554-.185-.738 0l-7.108 7.2L4.846 3c-.184-.185-.554-.185-.738 0l-1.2 1.2c-.185.185-.185.554 0 .738l7.107 7.108-7.107 7.108c-.185.184-.185.554 0 .738l1.2 1.2c.184.185.554.185.738 0l7.108-7.107 7.108 7.107c.184.185.553.185.738 0l1.2-1.2c.185-.184.185-.554 0-.738l-7.108-7.108L21 4.938c.277-.184.277-.553 0-.83l-1.2-1.2z" }) }) }) : null,
                children
              ]
            }
          ) }) }) });
  };

  // src/scripts/shared/CheckoutHandler/CheckoutHandler.tsx
  var modalBlockedImageStyles = {
    marginBottom: "18px"
  };
  var modalBlockedMessageStyles = {
    marginBottom: "32px"
  };
  var modalRefocusHeadingStyles = {
    fontSize: "36px",
    lineHeight: "1.3",
    fontWeight: "400",
    margin: "0 12px"
  };
  var modalBlockedButtonStyles = {
    maxWidth: "360px",
    width: "100%",
    fontSize: "18px",
    display: "block",
    margin: "0 auto 18px",
    backgroundColor: "#1667d9",
    padding: "12px",
    borderRadius: "3px",
    color: "#fff",
    outline: "none",
    border: "none",
    cursor: "pointer"
  };
  var modalRefocusMessageStyles = {
    fontSize: "17px",
    lineHeight: 1.4,
    fontWeight: 400,
    color: "#262626"
  };
  var CheckoutHandler = () => {
    console.log('CheckoutHandler')
    const [modalType, setModalType] = p2("closed");
    const [checkoutHref, setCheckoutHref] = p2("");
    const [popupWindow, setPopupWindow] = p2(null);
    const handleClickDonate = (event) => {
      console.log('Handle click donate', event)
      const href = event.detail.href;
      if (isValidHref(href)) {
        setCheckoutHref(href);
        const screenX = window.screenX;
        const screenY = window.screenY;
        const screenWidth = window.screen.width;
        const screenHeight = window.screen.height;
        const popupWidth = 600;
        const popupHeight = 850;
        const popupLeft = screenX + (screenWidth / 2 - popupWidth / 2);
        const popupTop = screenY + (screenHeight / 2 - popupHeight / 2);
        const windowFeatures = `width=${popupWidth},height=${popupHeight},left=${popupLeft},top=${popupTop}`;
        const popupCheckout = window.open(isMobileDevice_default() ? href.replace("checkoutmode=headless", "") : href, "_blank", windowFeatures);
        if (popupCheckout) {
          setPopupWindow(popupCheckout);
          if (!isMobileDevice_default()) {
            setModalType("refocus");
          }
        } else {
          setModalType("blocked");
        }
      }
    };
    h2(() => {
      if (modalType === "refocus") {
        const checkForClosedPopup = setInterval(() => {
          if (!popupWindow || popupWindow.closed) {
            setModalType("closed");
            clearTimeout(checkForClosedPopup);
          }
        }, 1e3);
        return () => {
          clearTimeout(checkForClosedPopup);
        };
      }
      return;
    }, [popupWindow, modalType]);
    const refocusPopup = (event) => {
      if (!popupWindow) {
        return;
      }
      popupWindow.focus();
      event.stopPropagation();
    };
    console.log('Before add event listener')
    h2(() => {
      console.log('Add event listener')
      addEventListener("click-jg-donate-embedded", (event) => { console.log('Inside listener'); handleClickDonate(event) });
      return () => {
        console.log('Remove event listener')
        removeEventListener("click-jg-donate-embedded", (event) => handleClickDonate(event));
      };
    }, []);
    return /* @__PURE__ */ o3(_, { children: [
        modalType === "refocus" && /* @__PURE__ */ o3(Modal, { onOverlayClick: refocusPopup, onModalClick: refocusPopup, modalTitle: "Checkout locating modal", children: [
            /* @__PURE__ */ o3("p", { style: modalRefocusMessageStyles, children: "Lost the checkout window?" }),
            /* @__PURE__ */ o3("p", { style: modalRefocusMessageStyles, children: "Click anywhere to retrieve it" })
          ] }),
        modalType === "blocked" && /* @__PURE__ */ o3(Modal, { displayCloseButton: true, onCloseRequest: () => setModalType("closed"), modalTitle: "Checkout popup blocked", children: [
            /* @__PURE__ */ o3(
              "img",
              {
                src: `https://images.justgiving.com/image/JG_Roundel_Laptop_User1.png`,
                alt: "",
                style: modalBlockedImageStyles
              }
            ),
            /* @__PURE__ */ o3("h1", { style: modalRefocusHeadingStyles, children: "It looks like you might be using an Adblocker" }),
            /* @__PURE__ */ o3("p", { style: modalBlockedMessageStyles, children: "Adblockers stop us from being able to show you the latest version of our donation checkout. Please disable your adblocker and allow pop-ups and try again. Or you can open the checkout in a new window below." }),
            /* @__PURE__ */ o3("button", { onClick: () => setModalType("closed"), type: "button", style: modalBlockedButtonStyles, children: "I'll turn it off and try again" }),
            /* @__PURE__ */ o3("a", { href: checkoutHref, target: "_blank", rel: "noopener noreferrer", onClick: () => setModalType("closed"), children: "Or open checkout in a new window" })
          ] })
      ] });
  };

  // src/scripts/shared/CheckoutHandler/injectCheckoutHandler.tsx
  var injectCheckoutHandler = () => {
    try {
      console.log('Inject checkout handler')
      const id = "jg-checkout-handler";
      if (document.getElementById(id))
        return;
      let checkoutContainer = document.createElement("div");
      checkoutContainer.id = id;
      document.body.appendChild(checkoutContainer);
      console.log('Added checkout handler')
      D(/* @__PURE__ */ o3(CheckoutHandler, {}), checkoutContainer);
    } catch (e) {
      console.log('Error injecting checkout handler', e)
    }
  };
  var injectCheckoutHandler_default = injectCheckoutHandler;

  // src/scripts/shared/types.ts
  var linkTypes = ["givingCheckout", "linkService"];

  // src/scripts/shared/typeGuards.ts
  var isLinkType = (attr) => {
    return linkTypes.some((type) => type === attr);
  };

  // src/scripts/attachCheckout/attachCheckout.tsx
  var attachCheckout = () => {
    try {
      const clickHandler = (href) => (e3) => {
        console.log('Click on button')
        var ret = dispatchEvent(new CustomEvent("click-jg-donate-embedded", { detail: { href } }));
        console.log('Dispatched', ret)
        e3.preventDefault();
      };
      const buttons = document.querySelectorAll("[data-jg-donate-button]");
      console.log('Found buttons', buttons.length, buttons)
      buttons.forEach((button) => {
        var _a;
        const attributes = button.dataset;
        const linkType = (_a = attributes.linktype) != null ? _a : "";
        if (!isLinkType(linkType)) {
          throw new Error(`JG Widget: data-linkType is not one of ${linkTypes.join(", ")}`);
        }
        const href = getCheckoutLink({
          startedBy: "widget-attachCheckout",
          linkType,
          charityId: attributes.charityid,
          linkId: attributes.linkid,
          referrer: attributes.referrer
        });
        const dispatchDonateEvent = clickHandler(href);
        console.log('Added click handler', dispatchDonateEvent, href, button)
        button.addEventListener("click", dispatchDonateEvent);
      });

      if (document.readyState == 'complete') {
        console.log('onload has already fired')
        injectCheckoutHandler_default()
      } else {
        window.onload = injectCheckoutHandler_default;
      }
    } catch (error) {
      console.error(error);
    }
  };
  attachCheckout();
})();
/*! Bundled license information:

react-is/cjs/react-is.development.js:
  (** @license React v16.13.1
   * react-is.development.js
   *
   * Copyright (c) Facebook, Inc. and its affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

object-assign/index.js:
  (*
  object-assign
  (c) Sindre Sorhus
  @license MIT
  *)
*/