module Classical.Expression {

    //#region Imports

    import u = Classical.Utilities;
    import Assert = Classical.Assert;

    //#endregion Imports

    //#region getProperty

    //TODO: Document valid property selectors for TypeScript for both overloads
    export function getProperty<TInstance>(instance: TInstance, selector: (instance: TInstance) => any): string;
    export function getProperty<TInstance>(selector: (instance: TInstance) => any): string;

    //For overload resolution only
    export function getProperty(arg1: any, arg2?: any): string {
        var selector: Function = arg1;
        if (arguments.length > 1)
            selector = arg2;

        var matches = propertyPattern.exec(selector.toString());
        Assert.isDefined(matches,
            'The property selector was not properly defined.');

        var property =
            matches.slice().query()
                .skip(1).firstOrDefault(m => u.isDefined(m));

        Assert.isDefined(property,
            'The property selector was not properly defined.');

        return property;
    }

    //#region Variables

    //The set of JavaScript identifiers is MUCH larger than what we currently support:
    //http://stackoverflow.com/questions/1661197/valid-characters-for-javascript-variable-names.
    var space = '\\s*';
    var identifierPattern = '[_$a-zA-Z][_$a-zA-Z0-9]*';
    var stringSingleQuotePattern = "'(([^'\\\\\]|\\\\[btnvfr'\\\\\])*)'";
    var stringDoubleQuotePattern = '"(([^"\\\\\]|\\\\[btnvfr"\\\\\])*)"';
    var stringPattern = '(?:' + stringSingleQuotePattern + '|' + stringDoubleQuotePattern + ')';
    var propertySelector = identifierPattern + space + '\\.' + space + '(' + identifierPattern + ')';
    var propertyAccessor = identifierPattern + space + '\\[' + space + stringPattern + space + '\\]';
    var functionStart = '^' + space + 'function' + space + '\\([^\\)]*\\)' + space + '{' + space + '(?:return)?' + space + '(?:';
    var functionEnd = ')' + space + ';?' + space + '}' + space + '$';
    var propertyPatternString = functionStart + propertySelector + '|' + propertyAccessor + '|' + stringPattern + functionEnd;
    var propertyPattern = new RegExp(propertyPatternString);

    //#endregion Variables

    //#endregion getProperty

    //#region getArguments

    export function getArguments(func: Function): Array<string> {
        Assert.isDefined(func,
            'The function was not specified.');

        var functionString = func.toString();
        var argumentString =
            functionPattern.exec(functionString).slice()
                .query().skip(1).singleOrDefault();

        Assert.isDefined(argumentString,
            'The arguments of the function cannot be parsed.');

        if (argumentString.length === 0)
            return [];

        return argumentString
            .split(argumentSpacePattern).query()
            .select(a => a.trim())
            .array();
    }

    //#region Variables

    var functionPattern = /^[\s]*function[\s]*(?:[_$a-zA-Z][_$a-zA-Z0-9]*)*\(([^\)]*)\)/;
    var argumentSpacePattern = /\s*,\s*/

    //#endregion Variables

    //#endregion getArguments
} 