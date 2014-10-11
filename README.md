Classical
------------------
The TypeScript BCL
Version 0.1.0

We have classes, modules, type annotations, generic and type inference. We even have an ES6 preview on the web! 
And we have all the design-time  tooling that comes along with it. 
Life is good.

Unfortunately, we're still left with the same APIs developed for JavaScript, a quirky, dynamic language. 
These APIs just don't make use of the great features of classical object-oriented programming. If TypeScript is 
going to produce frameworks and applications that go above and beyond, we need a set of tools that make use of
the power of TypeScript, which includes techniques from OOP, functional programming, and static typing to encase 
APIs that make use of JavaScript's awesome dynamic flexibility that has made it so popular. 

Our goal with Classical is to provide a base class library for TypeScript that is browser agnostic, and provides
you with the tools you need to truly use JavaScript for application scale development. 

Here's some of what you'll get:

Reflection:
  var type = obj.getType();
  var properties = type.getProperties();
  var methods = type.getMethods();

Full Hashing support with a doubly-generic Dictionary:
     var functionMap = new Dictionary<Function, Type>();
     var dateMap = new Dictionary<Date, (arg: Function) => Function>();
     
Querying:
  var squares = Enumerable.range(-1000, 1000).query()
    .where(x => x > 0)
    .select(x => { key: x, value: x * x})
    .dictionary(x => x.key, x => x.value);
  
Expressions:
  var obj = { x: 0 };
  var property = Expression.getProperty(obj, o => o.x); //returns 'x'
  function f(x, y, z) { }
  var arguments = Expression.getArguments(f): //returns ['x', 'y', 'z']

Binding:
  var source = new Property(0);
  var target = new Property(-1);
  target.bind(source); //target.value === 0
  source.value = 1; //target.value === 1

Classical.Html: 
A module containing a declarative, statically typed DOM api.
It provides MVVM style binding on POJOs completely in JavaScript -
No loosey-goosey HTML DSLs to memorize

Ultimately we want to hear what you want. 
So give us a bit of time to get it implemented, documented and polished.
Then we can all see what we'll be able to accomplish with a powerful set of tools.



  
  


