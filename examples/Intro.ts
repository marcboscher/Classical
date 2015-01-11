/// <reference path="../Declarations/classical.d.ts" />

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

