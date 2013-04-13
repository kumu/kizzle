module("selector", { teardown: moduleTeardown });

// #### NOTE: ####
// jQuery should not be used in this module
// except for DOM manipulation
// If jQuery is mandatory for the selection, move the test to jquery/test/unit/selector.js
// Use t() or Sizzle()
// ###############

/*
  ======== QUnit Reference ========
  http://docs.jquery.com/QUnit

  Test methods:
    expect(numAssertions)
    stop()
    start()
      note: QUnit's eventual addition of an argument to stop/start is ignored in this test suite
      so that start and stop can be passed as callbacks without worrying about
        their parameters
  Test assertions:
    ok(value, [message])
    equal(actual, expected, [message])
    notEqual(actual, expected, [message])
    deepEqual(actual, expected, [message])
    notDeepEqual(actual, expected, [message])
    strictEqual(actual, expected, [message])
    notStrictEqual(actual, expected, [message])
    raises(block, [expected], [message])

  ======== testinit.js reference ========
  See data/testinit.js

  q(...);
    Returns an array of elements with the given IDs
    @example q("main", "foo", "bar") => [<div id="main">, <span id="foo">, <input id="bar">]

  t( testName, selector, [ "array", "of", "ids" ] );
    Asserts that a select matches the given IDs
    @example t("Check for something", "//[a]", ["foo", "baar"]);

  url( "some/url.php" );
    Add random number to url to stop caching
    @example url("data/test.html") => "data/test.html?10538358428943"
    @example url("data/test.php?foo=bar") => "data/test.php?foo=bar&10538358345554"
*/

function p(name, selector, expected) {
  deepEqual(Kizzle.parse(selector), expected, name);
}

function union(selectors) {
  return {selector: "union", selectors: selectors};
}

function intersection(selectors) {
  return {selector: "intersection", selectors: selectors};
}

function tag(tag) {
  return attr("tags", "~=", tag);
}

function attr(attribute, operator, value) {
  return {selector: "attribute", attribute: attribute, operator: operator, value: value};
}

function etype(type) {
  return {selector: "attribute", attribute: "element type", operator: "=", value: type};
}

function ctype(type) {
  return {selector: "attribute", attribute: "connection type", operator: "=", value: type};
}

function pseudo(pseudo, args) {
  return {selector: pseudo, args: args};
}

test("universal", function() {
  p("*", "*", {selector: "universal"});
});

test("id", function() {
  p("ids are returned as strings", "#1", {selector: "id", id: "1"});
  p("GUIDs are supported", "#40F3AF24-336F-41DC-9195-3E07C0153B7D", {selector: "id", id: "40F3AF24-336F-41DC-9195-3E07C0153B7D"});
});

test("generic", function() {
  p("element", "element", {selector: "generic", type: "element"});
  p("connection", "connection", {selector: "generic", type: "connection"});
});

test("tags", function() {
  p("handles single tags", ".critical", tag("critical"));
});

test("element type", function() {
  p("element types are recognized", "person", attr("element type", "=", "person"));
});

test("connection type", function() {
  p("connection types are recognized", "personal-connection", attr("connection type", "=", "personal"));
});

test("attribute presence", function() {
  p("attribute presence", "[label]", attr("label"));
  p("quoted attributes", "[\"label\"]", attr("label"));
  p("quoted attributes with quotes", "[\"label \\\"quoted\\\"\"]", attr("label \"quoted\""));
});

test("attribute absence", function() {
  p("attribute absence", ":not([label])", {selector: "not", subselector: attr("label")});
  p("attribute absence", "[!label]", attr("label", "!"));
});

test("attribute equals", function() {
  p("attribute equals", "[label=Ryan]", attr("label", "=", "Ryan"));
  p("with quoted value", "[label='Ryan Mohr']", attr("label", "=", "Ryan Mohr"));
  p("with quoted attribute and value", "['label'='Ryan Mohr']", attr("label", "=", "Ryan Mohr"));
});

test("attribute not equals", function() {
  p("attribute not equals", "[label!=Ryan]", attr("label", "!=", "Ryan"));
});

// always returns value as strings. the attribute fields will take care of any conversion
// that needs to be done before making the actual comparison.
test("relative attributes", function() {
  p("less than", "[value<0]", attr("value", "<", "0"));
  p("less than or equal", "[value<=0]", attr("value", "<=", "0"));
  p("greater than or equal", "[value>=0]", attr("value", ">=", "0"));
  p("greater than", "[value>0]", attr("value", ">", "0"));
});

test("unions", function() {
  p("unions", ".young, .influential", union([tag('young'), tag('influential')]));
});

test("intersections", function() {
  p("multiple tags", ".young.influential", intersection([tag('young'), tag('influential')]));
});

// would these select c or the path from a to c?
// a > b > c
// a b c
// a ~ c
// test("traversal", function() {
//   p("walking", "#me * #you", {selector: "traversal", selectors: [{}]})
// });

test("stress test", function() {
  expected = intersection([etype("person"), tag("young"), attr("salary", "=", "100K"), pseudo("out", "3")]);
  p("", "person.young[salary=100K]:out(3)", expected);
});