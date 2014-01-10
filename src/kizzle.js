/*
Copyright 2013 Kumu Systems LLC. All rights reserved.
*/

var Sizzle;

Sizzle = window.Sizzle;

(function(window, Sizzle) {
  var Kizzle, attributeSelector, flatten, idSelector, intersection, parse, pseudoSelector, tagSelector, transform, traversal, typeSelector, union;

  Kizzle = function() {};
  flatten = function(selector) {
    var _ref;

    if (((_ref = selector.selectors) != null ? _ref.length : void 0) === 1) {
      return selector.selectors[0];
    } else {
      return selector;
    }
  };
  union = function() {
    return {
      selector: "union",
      selectors: []
    };
  };
  intersection = function() {
    return {
      selector: "intersection",
      selectors: []
    };
  };
  transform = function(selector) {
    var transformer;

    transformer = (function() {
      switch (selector.type) {
        case "ID":
          return idSelector;
        case "TAG":
          return typeSelector;
        case "CLASS":
          return tagSelector;
        case "ATTR":
          return attributeSelector;
        case "PSEUDO":
          return pseudoSelector;
        case " ":
        case "+":
        case "<":
        case ">":
        case "~":
        case "|":
          return traversal;
        default:
          throw new Error("Unrecognized input, " + selector.type);
      }
    })();
    return transformer(selector);
  };
  idSelector = function(selector) {
    return {
      selector: "id",
      id: selector.matches[0]
    };
  };
  typeSelector = function(selector) {
    var attribute, type;

    type = selector.matches[0];
    if (type === "*") {
      return {
        selector: "universal"
      };
    } else if (/^(element|connection|loop)$/.test(type)) {
      return {
        selector: "generic",
        type: type
      };
    } else {
      attribute = /-connection$/.test(type) ? "connection type" : "element type";
      return {
        selector: "attribute",
        attribute: attribute,
        operator: "=",
        value: type.replace("-connection", "")
      };
    }
  };
  tagSelector = function(selector) {
    return {
      selector: "attribute",
      attribute: "tags",
      operator: "~=",
      value: selector.matches[0]
    };
  };
  attributeSelector = function(selector) {
    var attribute, operator, value, _ref;

    _ref = selector.matches, attribute = _ref[0], operator = _ref[1], value = _ref[2];
    if (!(operator && operator !== "!")) {
      value = void 0;
    }
    if (operator === "~=") {
      value = value.slice(1, -1);
    }
    return {
      selector: "attribute",
      attribute: attribute,
      operator: operator,
      operator: operator,
      value: value
    };
  };
  pseudoSelector = function(selector) {
    var args, pseudo, _ref;

    _ref = selector.matches, pseudo = _ref[0], args = _ref[1];
    switch (pseudo) {
      case "not":
        return {
          selector: "not",
          subselector: parse(args)
        };
      default:
        return {
          selector: pseudo,
          args: args
        };
    }
  };
  traversal = function(combinator) {
    return {
      combinator: combinator.type
    };
  };
  parse = Kizzle.parse = function(string) {
    var list, result, s1, s2, selector, _i, _j, _len, _len1;

    s1 = union();
    result = Sizzle.tokenize(string);
    for (_i = 0, _len = result.length; _i < _len; _i++) {
      list = result[_i];
      s2 = intersection();
      for (_j = 0, _len1 = list.length; _j < _len1; _j++) {
        selector = list[_j];
        s2.selectors.push(transform(selector));
      }
      s1.selectors.push(flatten(s2));
    }
    return flatten(s1);
  };
  if (typeof define === "function" && define.amd) {
    return define(function() {
      return Kizzle;
    });
  } else {
    return window.Kizzle = Kizzle;
  }
})(window, Sizzle);
