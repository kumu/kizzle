###
Copyright 2013 Kumu Systems LLC. All rights reserved.
###

Sizzle = window.Sizzle

do (window, Sizzle) ->
  Kizzle = -> ;

  flatten = (selector) ->
    if selector.selectors?.length == 1
      selector.selectors[0]
    else
      selector

  union = -> {selector: "union", selectors: []}
  intersection = -> {selector: "intersection", selectors: []}

  transform = (selector) ->
    transformer = switch selector.type
      when "ID" then idSelector
      when "TAG" then typeSelector
      when "CLASS" then tagSelector
      when "ATTR" then attributeSelector
      when "PSEUDO" then pseudoSelector
      when " ", "+", "<", ">", "~", "|" then traversal
      else
        throw new Error("Unrecognized input, #{selector.type}");

    transformer(selector)

  idSelector = (selector) ->
    {selector: "id", id: selector.matches[0]}

  typeSelector = (selector) ->
    type = selector.matches[0]

    if type is "*"
      {selector: "universal"}
    else if /^(element|connection|loop)$/.test(type)
      {selector: "generic", type: type}
    else
      attribute = if /-connection$/.test(type) then "connection type" else "element type"
      {selector: "attribute", attribute: attribute, operator: "=", value: type.replace("-connection", "")}

  tagSelector = (selector) ->
    {selector: "attribute", attribute: "tags", operator: "~=", value: selector.matches[0]}

  attributeSelector = (selector) ->
    [attribute, operator, value] = selector.matches

    value = undefined unless operator && operator isnt "!"  # want undefined not empty strings
    value = value.slice(1, -1) if operator is "~="          # we use this for arrays, not whitespace separated lists

    {selector: "attribute", attribute: attribute, operator, operator, value: value}

  pseudoSelector = (selector) ->
    [pseudo, args] = selector.matches

    switch pseudo
      when "not" then {selector: "not", subselector: parse(args)}
      else {selector: pseudo, args: args}

  traversal = (combinator) ->
    {combinator: combinator.type}

  parse = Kizzle.parse = (string) ->
    s1 = union()
    result = Sizzle.tokenize(string)

    for list in result
      s2 = intersection()

      for selector in list
        s2.selectors.push(transform(selector))

      s1.selectors.push(flatten(s2))

    flatten(s1)

  if typeof define is "function" && define.amd
  	define(-> Kizzle)
  else
  	window.Kizzle = Kizzle
