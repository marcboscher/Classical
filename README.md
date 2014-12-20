# Classical
####The TypeScript BCL 
*Version 0.1.5*

## Introduction
TypeScript was released. Now we have classes, modules, type annotations, generics and type inference on the web. We even have an ES6 preview! And we have all the design-time tooling that comes along with it. Life is good.


Unfortunately, we're still left with the same APIs developed for JavaScript, a powerful but, let's admit it, quirky, dynamic language. 
The JavaScript APIs just don't make use of the great features of classical object-oriented programming. If TypeScript is going to produce 
frameworks and applications that go above and beyond, we need a set of tools that make use of the power of TypeScript, which includes 
techniques from OOP, functional programming, and APIs with public interfaces that provide static typing even if they use the awesome 
dynamic flexibility of JavaScript behind the scenes. 


Our goal with Classical is to provide a base class library for TypeScript that is browser agnostic, and provides
you with the tools you need to truly use JavaScript for application scale development. 


Here's some of what you'll get.

### Reflection
```javascript
	var type = obj.getType();
	var properties = type.getProperties();
    var methods = type.getMethods();
```

### Dictionary
```javascript
	var functionMap = new Dictionary<Function, Type>();
	var dateToFunctionMap = new Dictionary<Date, (arg: Function): Function>();
```
     
### Querying
```javascript
    var squares = Enumerable.range(-1000, 1000).query()
		.where(x => x > 0)
        .select(x => { key: x, value: x * x})
        .dictionary(x => x.key, x => x.value);
```
  
### Expressions
```javascript
	  var obj = { x: 0 };
	  var property = Expression.getProperty(obj, o => o.x); //returns 'x'
	  function f(x, y, z) { }
	  var arguments = Expression.getArguments(f): //returns ['x', 'y', 'z']
```
	  
### Binding
```javascript
	  var source = new Property(1);
	  var target = new Property(0);
	  target.bind(source); //target.value === 1
	  source.value = 2; //target.value === 2
	  target.value = 3; //source.value === 3 (two-way)
```

### Classical.Html
A module containing a declarative, statically typed DOM API.
It provides MVVM style binding on plain old JavaScript objects completely in JavaScript -
No loosey-goosey html pseudo-languages to memorize


and more...


## Conclusion

Ultimately we want to build what you need. 
So give us a bit of time to get a bit more implemented, documented and polished.
Then we'll see just what can be accomplished when you create with the tools you enjoy using.
If you're a TypeScript wonk like we are, open up the bin, give the type declarations a once-over and get started with classical.js using the instructions below.

We'd love to hear from you! Please ping us if you have any questions or feedback:
doug.rubino@gmail.com
 
## [Install via Nuget](https://www.nuget.org/packages/Classical/)
###PM> Install-Package Classical

## Getting Started

Start out by exploring the modules in the code below. Don't worry, tutorials, code comments and documentation are coming soon.

```javascript
	module Classical.Introduction {
	
	    import Assert = Classical.Assert;
	    import Expression = Classical.Expression;
	    import u = Utilities;
	    import r = Classical.Reflection;
	    import e = Classical.Events;
	    import b = Classical.Binding;
	    import cc = Classical.Collections;
	    import bc = Classical.Binding.Collections;
	
	    //1. Read through the Classical.js code below
	    //2. Inspect the results in the browser console
	    //3. Explore each of the modules above using intellisense
	    //4. Have fun!
	
	    //Array extensions
	    export var array = []
	        .add(0).add(0.5).add(1)
	        .addRange([1.5, 2, 2.5])
	        .set(6, 3)
	        .query()
	        .concat(
	        cc.Enumerable
	        .range(3.5, .5, 10))
	        .where(x => x < 5)
	        .select(x => Math.round(x * 2))
	        .array();
	
	    //Query Comprehension
	    export var aggregation =
	        array.query()
	        .sum(x =>
	            Math.pow(Math.sin(x), 2) +
	            Math.pow(Math.cos(x), 2)) /
	        array.length;
	
	    //Query Information
	    export var queryType = typeOf(cc.Queryable);
	    export var queryMethods = queryType
	        .getMethods(r.Modifier.Public, r.Modifier.Instance)
	        .dictionary(
	            m => m.name,
	            m => u.format('{0}({1})',
	                m.name,
	                m.getParameters()
	                .select(p => p.name)
	                .array()));
	
	    //Reflection Classes
	    export var reflectionModule = moduleOf(r.Type);
	    export var reflectionClasses = reflectionModule
	        .getTypes().select(t => t.name)
	        .array();
	
	    //Type Members
	    export var typeType = queryType.getType();
	    export var typeMembers = typeType
	        .getProperties(r.Modifier.Public, r.Modifier.Instance, r.Modifier.Static)
	        .select(m => m.name)
	        .array();
	}
	
	document.addEventListener('DOMContentLoaded', () => {
	    title('array variable:');
	    log(intro.array);
	    newline();
	
	    title('array aggregation:');
	    log(intro.aggregation);
	    newline();
	
	    title('query.select:');
	    log(intro.queryMethods.getValue('select'));
	    newline();
	
	    title('query methods:')
	    log(intro.queryMethods.keys.array())
	    newline();
	
	    title('query method signatures:')
	    log(intro.queryMethods.values.array())
	    newline();
	
	    title('reflection classes:')
	    log(intro.reflectionClasses);
	    newline();
	
	    title('type members:')
	    log(intro.typeMembers);
	    newline();
	});
	
	//Display Utilities
	var intro = Classical.Introduction;
	var toScreen = (value: any, element: string = 'div', visible: boolean = true) => {
	    var div = document.createElement(element);
	    div.innerHTML = value;
	    if (!visible)
	        div.style.visibility = "hidden";
	    document.body.appendChild(div);
	};
	var log = (value, element?) => {
	    if (!element)
	        element = 'div';
	    value && value.getType().isAssignableTo(typeOf(Array)) ?
	    printArray(value) :
	    toScreen(value, element);
	    return '';
	};
	var title = value => log(value, 'b');
	var printArray = (array: Array<string>) => {
	    array = array.query().orderBy(i => i).array();
	    toScreen('value = [');
	    array.forEach((item, index) => {
	        if (index !== array.length - 1)
	            item += ',';
	        toScreen(space(5) + item);
	    });
	    toScreen(']');
	};
	var newline = () => toScreen('visible', 'div', false);
	var space = n => Classical.Collections.Enumerable.range(n).query()
	    .select(x => '&nbsp;').aggregate((x, y) => x + y);
```

