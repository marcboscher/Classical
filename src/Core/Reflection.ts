
//#region IFunction

/**
 Defines the core JavaScript function. IFunction and Function are equivalent. 
 @remarks 
    This interface was created as an alias so that Function can refer to 
    the notion of a function in the reflection library.
*/
interface IFunction extends Function { }

//#endregion IFunction

//#region Collections

/**
 The core set of collections defined in Classical.
*/
module Classical.Collections {

    //#region Imports

    import u = Classical.Utilities;

    //#endregion Imports

    //#region Variables

    //The buckets numbers for the hashTable in DictionaryBase.
    //The number of buckets is approximately 2^(index + 3), and it is guaranteed to be prime.
    var numberOfBuckets: number[] = [7, 13, 23, 43, 83, 163, 317, 631, 1259, 2503, 5003, 9973, 19937, 39869, 79699, 159389, 318751, 637499, 1274989, 2549951, 5099893, 10199767, 20399531, 40799041, 81598067, 163196129, 326392249, 652784471];

    //#endregion Variables

    //#region Dictionary

    //A dictionary is a mapping between unique keys and arbitrary values.
    //Keys must implement getHashCode and equals from the IObject interface.
    export class Dictionary<TKey, TValue>
        implements IEnumerable<KeyValuePair<TKey, TValue>> {

        //#region Fields

        private _hashTable: Object;
        private _bucketIndex: number;
        private _numberOfBuckets: number;
        private _numberOfElements: number;
        private _initialCapacity: number;

        //#endregion Fields

        //#region Properties

        //Returns a sequence containing the keys of the dictionary.
        get keys(): IEnumerable<TKey> {
            return new DictionaryKeyCollection<TKey, TValue>(this);
        }

        //Returns a sequence containing the values of the dictionary.
        get values(): IEnumerable<TValue> {
            return this.query().select(pair => pair.value);
        }

        //#endregion Properties

        //#region constructor

        //Builds a new dictionary.
        //The capacity a lower bound on the capacity is the number of elements that can be stored without rebalancing.
        constructor(capacity?: number) {
            this._initialCapacity = u.coalesce(capacity, 0);
            this.clear();
        }

        //#endregion constructor

        //#region IEnumerable Members

        getEnumerator(): IEnumerator<KeyValuePair<TKey, TValue>> {
            return new DictionaryEnumerator<TKey, TValue>(this);
        }

        //Returns an IEnumerable implementation that is queryable.
        query(): IQueryable<KeyValuePair<TKey, TValue>> {
            return new Queryable<KeyValuePair<TKey, TValue>>(this);
        }

        //Enumerates the collection
        forEach(operation: (item: KeyValuePair<TKey, TValue>) => void): void {
            forEach(this, operation);
        }

        //Returns a JavaScript array.
        array(): KeyValuePair<TKey, TValue>[] {
            var array: any[] = [];
            <any>this.forEach(
                pair => { array.add(pair); });
            return array;
        }

        //#endregion IEnumerable Members

        //#region Methods

        //Adds a key-value pair to the dictionary.
        //If it exists, the existing value will be overwritten.
        //The key can be null, but not undefined.
        //If the key does not have .equals and .getHashCode methods, they will be added with reference semantics.
        add(key: TKey, value: TValue): Dictionary<TKey, TValue> {
            Assert.isDefined(key, 'The key is null or undefined.');

            var added = this.addWithoutRebalancing(this._hashTable, this._numberOfBuckets, {
                key: key,
                value: value
            });

            if (added) this._numberOfElements++;
            this.rebalanceIfNecessary();
            return this;
        }

        //Removes a key from the dictionary.
        remove(key: TKey): Dictionary<TKey, TValue> {
            var elements = this.getElements(key);
            var pair =
                this.getPair(
                    elements,
                    this._hashTable,
                    this._numberOfBuckets,
                    key);

            if (u.isDefined(pair)) {
                elements.remove(pair);
                this._numberOfElements--;
            }

            return this;
        }

        //Returns the value of the key if it exists; undefined otherwise.
        getValue(key: TKey): TValue {
            var keyAny = <any>key;
            if (u.isNullOrUndefined(key) ||
                !keyAny.equals || !keyAny.getHashCode)
                return undefined;

            var elements = this.getElements(key);
            if (elements === undefined)
                return undefined;

            for (var i = 0, elementsLength = elements.length; i < elementsLength; i++) {
                var pair = elements[i];
                if ((<any>pair.key).equals(key))
                    return pair.value;
            }

            return undefined;
        }

        //Returns true if the dictionary contains the specified key; False otherwise.
        containsKey(key: TKey): boolean {
            var keyAny = <any>key;
            if (u.isNullOrUndefined(key) ||
                !keyAny.equals || !keyAny.getHashCode)
                return false;

            var elements = this.getElements(key);
            return u.isDefined(
                this.getPair(
                    elements,
                    this._hashTable,
                    this._numberOfBuckets,
                    key));
        }

        //Removes all items from the dictionary.
        clear(): void {
            this._hashTable = {};
            this._numberOfElements = 0;
            var bucketIndex = DictionaryUtilities.capacityToBucketIndex(this._initialCapacity);

            this._bucketIndex = bucketIndex;
            this._numberOfBuckets = DictionaryUtilities.getNumberOfBuckets(bucketIndex);
        }

        //Counts the number of elements in the dictionary.
        count(): number {
            return this._numberOfElements;
        }

        //#endregion Methods

        //#region Utilities

        private getIndex(key: TKey): number {
            return (<any>key).getHashCode() % this._numberOfBuckets;
        }

        private getElements(key: TKey): KeyValuePair<TKey, TValue>[] {
            var index = this.getIndex(key);
            return <KeyValuePair<TKey, TValue>[]>this._hashTable[index];
        }

        private getPair(
            elements: KeyValuePair<TKey, TValue>[],
            hashTable: Object,
            numberOfBuckets: number,
            key: TKey):
            KeyValuePair<TKey, TValue> {

            if (elements === undefined)
                return null;

            var current: KeyValuePair<TKey, TValue>;
            for (var i = 0, elementsLength = elements.length; i < elementsLength; i++) {
                current = elements[i];
                if ((<any>current.key).equals(key))
                    return current;
            }

            return null;
        }

        private addWithoutRebalancing(
            hashTable: Object,
            numberOfBuckets: number,
            pair: KeyValuePair<TKey, TValue>,
            checkForExistance: boolean = true):
            boolean {

            var keyHashCode = (<any>pair.key).getHashCode() % numberOfBuckets;
            var elements = <KeyValuePair<TKey, TValue>[]>hashTable[keyHashCode];
            if (elements === undefined) {
                elements = [];
                hashTable[keyHashCode] = elements;
            }

            if (checkForExistance) {
                var foundPair = this.getPair(
                    elements,
                    hashTable,
                    numberOfBuckets,
                    pair.key);

                if (u.isDefined(foundPair)) {
                    foundPair.value = pair.value;
                    return false;
                }
            }

            elements.push(pair);
            return true;
        }

        private rebalanceIfNecessary(): void {
            if (this._numberOfElements > (DictionaryUtilities.loadFactor * this._numberOfBuckets))
                this.rebalance();
        }

        private rebalance(): void {
            var currentBucketIndex = this._bucketIndex,
                currentNumberOfBuckets = this._numberOfBuckets,
                currentHashTable = this._hashTable,
                nextBucketIndex = currentBucketIndex + 1,
                nextNumberOfBuckets = DictionaryUtilities.getNumberOfBuckets(nextBucketIndex),
                nextHashTable = {},
                elements: KeyValuePair<TKey, TValue>[];

            for (var i = 0; i < currentNumberOfBuckets; i++) {
                elements = <KeyValuePair<TKey, TValue>[]>currentHashTable[i];
                if (u.isDefined(elements)) {
                    for (var j = 0, elementsLength = elements.length; j < elementsLength; j++) {
                        this.addWithoutRebalancing(nextHashTable, nextNumberOfBuckets, elements[j], false);
                    }
                }
            }

            this._bucketIndex = nextBucketIndex;
            this._numberOfBuckets = nextNumberOfBuckets;
            this._hashTable = nextHashTable;
        }

        //#endregion Utilities
    }

    //#endregion Dictionary

    //#region DictionaryUtilities

    class DictionaryUtilities {
        static loadFactor = 2;

        constructor() {
            Assert.staticClass();
        }

        //Gets the number of buckets for the nth reordering, always a prime number.
        static getNumberOfBuckets(numberOfRebalances: number): number {
            var result = numberOfBuckets[numberOfRebalances];
            Assert.isDefined(result, 'The maximum size for a Dictionary has been exceeded.');

            return result;
        }

        //Returns the bucketIndex closest to matching the specified capacity.
        static capacityToBucketIndex(capacity: number) {
            var bucketValue: number = capacity / DictionaryUtilities.loadFactor,
                currentBucketValue: number;
            for (var i = 0, length = numberOfBuckets.length; i < length; i++) {
                currentBucketValue = numberOfBuckets[i];
                if (currentBucketValue > bucketValue)
                    return i;
            }

            Assert.isInvalid('The capacity is too large for the dictionary.');
        }
    }

    //#endregion DictionaryUtilities

    //#region DictionaryEnumerator

    class DictionaryEnumerator<TKey, TValue>
        implements IEnumerator<KeyValuePair<TKey, TValue>> {

        private _index = -1;
        private _hashTable: Dictionary<TKey, TValue>;
        private _numberOfBuckets: number;
        private _bucketIndex: number;
        private _elements: KeyValuePair<TKey, TValue>[];

        constructor(dictionary: Dictionary<TKey, TValue>) {
            Assert.isDefined(dictionary);
            this._hashTable = (<any>dictionary)._hashTable;
            this._numberOfBuckets = (<any>dictionary)._numberOfBuckets;
            this._bucketIndex = 0;
            this._elements = this._hashTable[this._bucketIndex];
        }

        get current(): KeyValuePair<TKey, TValue> {
            return this._elements[this._index];
        }

        moveNext(): boolean {
            var bucketIndex = this._bucketIndex,
                numberOfBuckets = this._numberOfBuckets,
                elements = this._elements,
                hashTable = this._hashTable;

            if (u.isDefined(elements)) {
                this._index++;
                if (this._index < elements.length)
                    return true;

                this._elements = undefined;
                elements = this._elements;
            }

            if (bucketIndex + 1 >= numberOfBuckets)
                return false;

            for (var i = this._bucketIndex + 1; i < numberOfBuckets; i++) {
                elements = hashTable[i];
                if (u.isDefined(elements)) {
                    this._elements = elements;
                    this._bucketIndex = i;
                    this._index = 0;
                    return true;
                }
            }

            return false;
        }
    }

    //#endregion DictionaryEnumerator

    //#region DictionaryKeyCollection

    class DictionaryKeyCollection<TKey, TValue>
        implements IEnumerable<TKey> {

        //#region Fields

        private _dictionary: Dictionary<TKey, TValue>;

        //#endregion Fields

        //#region Constructor

        constructor(dictionary: Dictionary<TKey, TValue>) {
            Assert.isDefined(dictionary);
            this._dictionary = dictionary;
        }

        //#endregion Constructor

        //#region IEnumerable Members

        getEnumerator(): IEnumerator<TKey> {
            return new DictionaryKeyEnumerator(this._dictionary);
        }

        query(): IQueryable<TKey> {
            return new Queryable<TKey>(this);
        }

        forEach(operation: (item: TKey) => void): void {
            forEach(this, operation);
        }

        array(): TKey[] {
            var array: TKey[] = new Array<TKey>();
            this.forEach(pair => array.add(pair));
            return array;
        }

        count(): number {
            return this._dictionary.count();
        }

        //#endregion IEnumerable Members
    }

    //#endregion //DictionaryKeyCollection

    //#region DictionaryKeyEnumerator

    class DictionaryKeyEnumerator<TKey, TValue>
        implements IEnumerator<TKey> {

        private _dictionaryEnumerator: IEnumerator<KeyValuePair<TKey, TValue>>;

        constructor(dictionary: Dictionary<TKey, TValue>) {
            Assert.isDefined(dictionary);
            this._dictionaryEnumerator = dictionary.getEnumerator();
        }

        get current(): TKey {
            return this._dictionaryEnumerator.current.key;
        }

        moveNext(): boolean {
            return this._dictionaryEnumerator.moveNext();
        }
    }

    //#endregion DictionaryKeyEnumerator

    //#region KeyValuePair

    export class KeyValuePair<TKey, TValue> {
        key: TKey;
        value: TValue;

        constructor(key: TKey, value: TValue) {
            this.key = key;
            this.value = value;
        }
    }

    //#endregion KeyValuePair

    //#region Utilities

    function forEach<T>(items: IEnumerable<T>, operation: (item?: T) => void) {
        var enumerator = items.getEnumerator(),
            current: T;

        while (enumerator.moveNext()) {
            var current = enumerator.current;
            operation.bind(current)(current);
        }
    }

    //#endregion Utilities
}

//#endregion Collections

//#region typeOf

function typeOf(ctor: IFunction) {
    return Classical.Reflection.Type.getType(ctor);
}

//#endregion typeOf

//#region moduleOf

function moduleOf(ctor: IFunction): Classical.Reflection.Module {
    var type = typeOf(ctor);
    if (!type) return null;

    return Classical.Reflection.Module.getModule(type);
}

//#endregion moduleOf

/**
 The core set of collections defined in Classical.
*/
module Classical.Reflection {

    //#region Imports

    import u = Classical.Utilities;
    import c = Classical.Collections;

    //#endregion Imports

    //#region Modifier

    /**
     An enumeration of the various properties that apply to the 
     language construct metadata described by the reflection api. 
     @seealso 
        Classical.Reflection.Type.getProperties, 
        Classical.Reflection.Type.getMethods
    */
    export enum Modifier {
        Public,
        Protected,
        Private,
        Instance,
        Static,
    }

    /**
     The public modifier
     @seealso Classical.Reflection.Modifier
    */
    export var Public = Modifier.Public;

    /**
     The protected modifier
     @seealso Classical.Reflection.Modifier
    */
    export var Protected = Modifier.Protected;

    /**
     The private modifier
     @seealso Classical.Reflection.Modifier
    */
    export var Private = Modifier.Private;

    /**
     The instance modifier
     @seealso Classical.Reflection.Modifier
    */
    export var Instance = Modifier.Instance;

    /**
     The static modifier
     @seealso Classical.Reflection.Modifier
    */
    export var Static = Modifier.Static;

    var defaultModifier = [Public, Instance];

    //#endregion Modifier

    //#region Module

    //#region Modifier

    /**
     A description of the metadata associated with in a module.
    */
    export class Module {

        //#region Fields

        private _name: string;
        private _fullName;
        private _scope: any;
        private _base: Module;
        private _modules: IEnumerable<Module>;
        private _types: IEnumerable<Type>;
        private _functions: IEnumerable<Function>;
        private _variables: IEnumerable<Variable>;

        //#endregion Fields

        //#region Properties

        //#region name

        get name(): string {
            return this._name;
        }

        //#endregion name

        //#region fullName

        get fullName(): string {
            return this._fullName;
        }

        //#endregion fullName

        //#region scope

        get scope(): any {
            return this._scope;
        }

        //#endregion scope

        //#endregion Properties

        //#region Constructors

        constructor(password: number, name: string, scope: any, base?: Module) {
            Assert.isTrue(password === constructorPassword,
                'You do not have permission to create instances of this type.');

            if (base && base != Module.global)
                this._fullName = u.format("{0}.{1}", base.fullName, name);
            else
                this._fullName = name;

            this._name = name;
            this._scope = scope;
            this._base = base;
        }

        //#endregion Constructors

        //#region Methods

        //#region getModules

        public getModules(): IQueryable<Module> {
            if (!this._modules)
                this._modules = this._initializeModules();

            return this._modules.array().query();
        }

        //#endregion getModules

        //#region getTypes

        getTypes(): IQueryable<Type> {
            if (!this._types)
                this._types = this._initializeTypes();

            return this._types.array().query();
        }

        //#endregion getTypes

        //#region getFunctions

        getFunctions(): IQueryable<Function> {
            if (!this._functions)
                this._functions = this._initializeFunctions();

            return this._functions.array().query();
        }

        //#endregion getFunctions

        //#region getVariables

        getVariables(): IQueryable<Variable> {
            if (!this._variables)
                this._variables = this._initializeVariables();

            return this._variables.array().query();
        }

        //#endregion getVariables

        //#endregion Methods

        //#region Utilities

        //#region _initializeModules

        private _initializeModules(): IEnumerable<Module> {
            var initializedModules = [];
            var scope = this.scope;
            var moduleProperties = Object.getOwnPropertyNames(scope);

            for (var i = 0; i < moduleProperties.length; i++) {
                var modulePropertyName = moduleProperties[i];
                var moduleProperty = scope[modulePropertyName];

                if (Module._isModule(moduleProperty, modulePropertyName)) {
                    var obj = <Object>moduleProperty;
                    if (Object.isFrozen(obj))
                        continue;

                    var newModule = modules.getValue(obj);
                    if (newModule === undefined) {
                        newModule = new Module(constructorPassword, modulePropertyName, moduleProperty, this);
                        modules.add(obj, newModule);
                    }

                    initializedModules.add(newModule);
                }
            }

            return initializedModules;
        }

        //#endregion _initializeModules

        //#region _initializeTypes

        private _initializeTypes(): IEnumerable<Type> {
            var initializedTypes = [];
            var scopeProperties = Object.getOwnPropertyNames(this._scope);

            for (var i = 0; i < scopeProperties.length; i++) {
                var propertyName = scopeProperties[i];

                if (propertyName == 'constructor' || propertyName.indexOf('_') === 0)
                    continue;

                var property = this._scope[propertyName];

                if (Module._isType(property)) {
                    var ctor = <IFunction>property;
                    var type = types.getValue(ctor);
                    if (type === undefined) {
                        type = new Type(constructorPassword, ctor, this);
                        types.add(ctor, type);
                    }
                    else if (!(<any>type)._module) {
                        (<any>type)._module = this;
                    }

                    initializedTypes.add(type);
                }
            }

            return initializedTypes;
        }

        //#endregion _initializeTypes

        //#region _initializeFunctions

        private _initializeFunctions(): IEnumerable<Function> {
            var initializedFunctions = [];
            var scopeProperties = Object.getOwnPropertyNames(this._scope);

            for (var i = 0; i < scopeProperties.length; i++) {
                var propertyName = scopeProperties[i];
                var property = this._scope[propertyName];

                if (!Module._isType(property) && u.isFunction(property)) {
                    var func = new Function(constructorPassword, propertyName, true, <IFunction>property);
                    initializedFunctions.add(func);
                }
            }

            return initializedFunctions;
        }

        //#endregion _initializeFunctions

        //#region _initializeVariables

        private _initializeVariables(): IEnumerable<Variable> {
            var initializedVariables = new Array<Variable>();
            var scopeProperties = Object.getOwnPropertyNames(this._scope).query().where(p => p !== '_hashCode').array();

            for (var i = 0; i < scopeProperties.length; i++) {
                var propertyName = scopeProperties[i];
                var property = this._scope[propertyName];

                if (!u.isFunction(property) && !Module._isModule(property)) {
                    var variable = new Variable(constructorPassword, propertyName, this);
                    initializedVariables.add(variable);
                }
            }

            return initializedVariables;
        }

        //#endregion _initializeVariables

        //#region _findModule

        private _findModule(type: Type): Module {
            var foundType = false;

            this.getTypes().forEach(t => {
                if (t === type)
                    foundType = true;
                else
                    (<any>t)._module = this;
            });

            if (foundType)
                return this;

            var modules = this.getModules().array();
            for (var i = 0; i < modules.length; i++) {
                var m = modules[i];
                var foundModule = m._findModule(type);

                if (foundModule !== null)
                    return foundModule;
            }

            return null;
        }

        //#endregion _findModule

        //#endregion Utilities

        //#region Static Members

        //#region Fields

        private static _global: Module;
        private static _anonymous: Module;
        private static _modules: IEnumerable<Module>;

        //#endregion Fields

        //#region Properties

        //#region global

        public static get global(): Module {
            if (!Module._global) {
                Module._global = new Module(constructorPassword, 'Global', global);
                modules.add(global, Module._global);
            }

            return Module._global;
        }

        //#endregion global

        //#region anonymous

        public static get anonymous(): Module {
            if (!Module._anonymous)
                Module._anonymous = new Module(constructorPassword, 'Anonymous', (<any>Classical).Anonymous);

            return Module._anonymous;
        }

        //#endregion anonymous

        //#endregion Properties

        //#region Methods

        //#region getModule

        static getModule(type: Type): Module {
            Assert.isDefined(type);
            if ((<any>type)._module)
                return (<any>type)._module;

            var foundModule = Module.global._findModule(type);
            if (foundModule) {
                (<any>type)._module = foundModule;
                return foundModule;
            }

            (<any>type)._module = Module.anonymous;
            return Module._anonymous;
        }

        //#endregion getModule

        //#endregion Methods

        //#region Utilities

        //#region _isModule

        private static _isModule(moduleCandidate: any, moduleName?: string): boolean {
            if (!u.isObject(moduleCandidate) || !u.isEmptyObject(Object.getPrototypeOf(moduleCandidate)))
                return false;

            var ownProperties = Object.getOwnPropertyNames(moduleCandidate);

            for (var i = 0; i < ownProperties.length; i++) {
                var ownProperty = ownProperties[i];
                try {
                    var moduleProperty = moduleCandidate[ownProperty];
                }
                catch (e) {
                    continue;
                }
                if (this._isType(moduleProperty))
                    return true;
            }

            if (!moduleName)
                return false;

            return moduleName[0] === moduleName[0].toUpperCase();
        }

        //#endregion _isModule

        //#region _isType

        private static _isType(typeCandidate: any): boolean {
            return typeCandidate === Object ||
                (u.isFunction(typeCandidate) &&
                u.isDefined(typeCandidate.prototype) &&
                !u.isEmptyObject(typeCandidate.prototype));
        }

        //#endregion _isType

        //#endregion Utilities

        //#endregion Static Members
    }

    //#endregion Module

    //#region Type

    /**
     A description of the metadata associated with in a class.
     @seealso getType
    */
    export class Type {

        //#region Fields

        private _ctor: IFunction;
        private _base: Type = null;
        private _module: Module;
        private _name: string = null;
        private _properties: IEnumerable<Property>;
        private _fields: IEnumerable<Field>;
        private _methods: IEnumerable<Method>;

        //#endregion Fields

        //#region Properties

        //#region name

        //The name of the Type.
        //This is largely for debugging or record keeping.
        //For Type equivalence, use the equals method.
        get name(): string {
            if (this._name === null) {
                var name = (<any>this._ctor).name;
                if (u.isNullOrUndefined(name)) {
                    var match = <string[]>this._ctor.toString().match(/\s([\w\d]+)\(/);
                    if (match && match.length > 1)
                        name = match[1];
                }
                if (u.isNullOrUndefined(name))
                    name = "`Anonymous";
                this._name = name;
            }

            return this._name;
        }

        //#endregion name

        //#region fullName

        get fullName(): string {

            if (this.module)
                return u.format("{0}.{1}", this.module.fullName, this.name);
            else
                return this.name;
        }

        //#endregion fullName

        //#region module

        get module(): Module {
            if (!this._module)
                this._module = Module.getModule(this);

            return this._module;
        }

        //#endregion module

        //#region isPublic

        get isPublic(): boolean {
            return !this.isPrivate && !this.isProtected;
        }

        //#endregion isPublic

        //#region isPrivate

        get isPrivate(): boolean {
            return this.name.indexOf('_') === 0;
        }

        //#endregion isPrivate

        //#region isProtected

        get isProtected(): boolean {
            return this.name.indexOf('$') === 0;
        }

        //#endregion isProtected

        //#region isPrimitive

        public get isPrimitive(): boolean {
            return this === typeOf(Boolean) ||
                this === typeOf(String) ||
                this === typeOf(Number);
        }

        //#endregion isPrimitive

        //#region ctor

        //The constructor of the type.
        get ctor(): IFunction {
            return this._ctor;
        }

        //#endregion ctor

        //#region prototype

        //The prototype of the type.
        get prototype(): any {
            return this._ctor.prototype;
        }

        //#endregion prototype

        //#region base

        //The parent type of the type, if define; Null otherwise.
        get base(): Type {
            if (this._base === null) {
                var prototype = Object.getPrototypeOf(this.ctor.prototype);
                if (prototype == null || Utilities.isFunction(!prototype.getType))
                    return null;

                this._base = <Type>prototype.getType();
            }

            return this._base;
        }

        //#endregion base

        //#endregion Properties

        //#region Constructors

        //Creates a Type, a wrapper around the constructor of a class.
        constructor(password: number, ctor: IFunction, mod?: Module) {
            Assert.isTrue(password === constructorPassword,
                'You do not have permission to create instances of this type.');

            this._ctor = ctor;

            //TODO: If the module is not provided add it to the Native Module(Current Classical.Native);
            if (mod)
                this._module = mod;
        }

        //#endregion Constructors

        //#region Methods

        //#region toString

        toString(): string {
            return this.name;
        }

        //#endregion toString

        //#region equals

        equals(other: any): boolean {
            if (u.isNullOrUndefined(other) ||
                !other.is(Type))
                return false;

            var otherType = <Type>other;
            return this.ctor === otherType.ctor;
        }

        //#endregion equals

        //#region getHashCode

        getHashCode(): number {
            return (<any>this._ctor).getHashCode();
        }

        //#endregion getHashCode

        //#region isAssignableTo

        //Returns True if the Type is assignable to the other Type.
        isAssignableTo(other: Type): boolean {
            var ctor = this.ctor,
                otherCtor = other.ctor,
                prototype = null;

            while (Utilities.isDefined(ctor)) {
                if (ctor === otherCtor)
                    return true;

                prototype = Object.getPrototypeOf(ctor.prototype);
                if (Utilities.isDefined(prototype))
                    ctor = prototype['constructor'];
                else
                    ctor = null;
            }

            return false;
        }

        //#endregion isAssignableTo

        //#region isAssignableFrom

        //Returns True if the other Type is assignable to this Type.
        isAssignableFrom(other: Type): boolean {
            if (u.isNullOrUndefined(other))
                return false;

            return other.isAssignableTo(this);
        }

        //#endregion isAssignableFrom

        //#region getFields

        getFieldsOf(instance: any, ...options: Array<Modifier>): IQueryable<Field> {
            Assert.isDefined(instance);

            if (instance.getType && Utilities.isFunction(instance.getType)) {
                var instanceType = instance.getType();
                if (instanceType !== this)
                    throw 'The instance passed in is not of type ' + this.name;
            }

            var fields = this._initializeFields(instance);
            options = this._getProperOptions(options);

            return fields.array().query().where(f => this._isValidProperty(f, options)).distinct();
        }

        //#endregion getFields

        //#region getFieldOf

        getFieldOf(instance: any, name: string, ...options: Array<Modifier>): Field {
            Assert.isDefined(name);

            var args = [instance, options];

            return (<IQueryable<Method>>this.getFieldsOf.apply(this, args)).query().singleOrDefault(f => f.name === name);;
        }

        //#endregion getFieldOf

        //#region getProperties

        getProperties(...options: Array<Modifier>): IQueryable<Property> {
            if (!this._properties)
                this._initializeProperties();

            options = this._getProperOptions(options);

            return this._properties.array().query().where(p => this._isValidProperty(p, options)).distinct();
        }

        //#endregion getProperties

        //#region getProperty

        getProperty(name: string, ...options: Array<Modifier>): Property {
            Assert.isDefined(name);

            return (<IQueryable<Method>>this.getProperties.apply(this, options)).query().singleOrDefault(p => p.name === name);;
        }

        //#endregion getProperty

        //#region getMethods

        getMethods(...options: Array<Modifier>): IQueryable<Method> {
            return (<IQueryable<Method>>this.getProperties.apply(this, options))
                .where(p => p.isMethod).cast<Method>();
        }

        //#endregion getMethods

        //#region getMethod

        getMethod(name: string, ...options: Array<Modifier>): Method {
            Assert.isDefined(name);

            return (<IQueryable<Method>>this.getMethods.apply(this, options)).query().singleOrDefault(m => m.name === name);;
        }

        //#endregion getMethod

        //#endregion Methods

        //#region Utilities

        //#region _initializeFields

        private _initializeFields(instance: any): IEnumerable<Field> {
            var fields = new Array<Field>();

            Object.getOwnPropertyNames(instance).forEach((property) => {
                var propertyDescriptor = Object.getOwnPropertyDescriptor(instance, property);
                var getter = propertyDescriptor.get;
                var setter = propertyDescriptor.set;

                if (!Utilities.isDefined(getter) && !Utilities.isDefined(setter) && !Utilities.isFunction(propertyDescriptor.value))
                    fields.add(new Field(constructorPassword, property, typeOf(instance.constructor), false));
            });

            return fields;
        }

        //#endregion _initializeFields

        //#region _initializeProperties

        private _initializeProperties(): void {
            var properties = new Array<Property>();
            var instance = this._ctor.prototype;

            properties.addRange(this._getStaticProperties());
            properties.addRange(this._getInstanceProperties());

            var baseType = this.base;
            if (Utilities.isDefined(baseType)) {
                var baseTypeProperties = baseType.getProperties();
                var propertiesToRemove = new Array<Property>();

                properties.forEach(p => {
                    var baseTypeProperty = baseTypeProperties.singleOrDefault(prop => prop.name == p.name);
                    if (baseTypeProperty) {
                        (<any>p)._declaringType = baseTypeProperty.declaringType;
                        propertiesToRemove.add(p);
                    }
                });

                propertiesToRemove.forEach(p => {
                    properties.remove(p);
                });

                properties.addRange(baseTypeProperties);
            }

            this._properties = properties;
        }

        //#endregion _initializeProperties

        //#region _getStaticProperties

        private _getStaticProperties(): IEnumerable<Property> {
            var properties = new Array<Property>();
            var instance = this._ctor.prototype;

            Object.getOwnPropertyNames(this._ctor).forEach((property) => {
                var propertyDescriptor = Object.getOwnPropertyDescriptor(this._ctor, property);
                var getter = propertyDescriptor.get;
                var setter = propertyDescriptor.set;

                if (Utilities.isDefined(getter) || Utilities.isDefined(setter))
                    properties.add(new Property(constructorPassword, property, typeOf(instance.constructor), propertyDescriptor, Utilities.isDefined(getter), Utilities.isDefined(setter), false, false, true));
                else if (Utilities.isFunction(propertyDescriptor.value))
                    properties.add(new Method(constructorPassword, property, typeOf(instance.constructor), propertyDescriptor, propertyDescriptor.writable, <IFunction>propertyDescriptor.value, true));
                else if (!Utilities.isDefined(getter) && !Utilities.isDefined(setter))
                    properties.add(new Field(constructorPassword, property, typeOf(instance.constructor), true));
            });

            return properties;
        }

        //#endregion _getStaticProperties

        //#region _getInstanceProperties

        private _getInstanceProperties(): IEnumerable<Property> {
            var properties = new Array<Property>();
            var instance = this._ctor.prototype;

            Object.getOwnPropertyNames(instance).forEach((property) => {
                var propertyDescriptor = Object.getOwnPropertyDescriptor(instance, property);
                var getter = propertyDescriptor.get;
                var setter = propertyDescriptor.set;

                if (Utilities.isDefined(getter) || Utilities.isDefined(setter))
                    properties.add(new Property(constructorPassword, property, typeOf(instance.constructor), propertyDescriptor, Utilities.isDefined(getter), Utilities.isDefined(setter), false, false, false));
                else if (Utilities.isFunction(propertyDescriptor.value))
                    properties.add(new Method(constructorPassword, property, typeOf(instance.constructor), propertyDescriptor, propertyDescriptor.writable, <IFunction>propertyDescriptor.value, false));
                else if (!Utilities.isDefined(getter) && !Utilities.isDefined(setter))
                    properties.add(new Field(constructorPassword, property, typeOf(instance.constructor), true));
            });

            return properties;
        }

        //#endregion _getInstanceProperties

        //#region _getProperOptions

        private _getProperOptions(optionsList: Array<Modifier>): Array<Modifier> {
            if (!optionsList || optionsList.length === 0)
                return defaultModifier;

            var options = optionsList.query().distinct().array().query();
            var result = options.array();

            if (options.hasNone(o => o === Modifier.Public) && options.hasNone(o => o === Modifier.Protected) && options.hasNone(o => o === Modifier.Private))
                result.add(Modifier.Public);
            if (options.hasNone(o => o === Modifier.Static) && options.hasNone(o => o === Modifier.Instance))
                result.add(Modifier.Instance);

            return result;
        }

        //#endregion _getProperOptions

        //#region _isValidProperty

        private _isValidProperty(property: Property, modifiers: IEnumerable<Modifier>): boolean {
            var modifierQuery = modifiers.query();
            var accessModifiers = modifierQuery.where(m => m !== Modifier.Instance && m !== Modifier.Static);
            var isValidAccessor = false;

            accessModifiers.forEach(m => {
                switch (m) {
                    case Modifier.Public: {
                        if (property.isPublic)
                            isValidAccessor = true;

                        break;
                    }
                    case Modifier.Protected: {
                        if (property.isProtected)
                            isValidAccessor = true;

                        break;
                    }
                    case Modifier.Private: {
                        if (property.isPrivate)
                            isValidAccessor = true;

                        break;
                    }
                }
            });

            if (modifierQuery.hasAny(m => m === Modifier.Instance))
                return isValidAccessor && !property.isStatic;
            else if (modifierQuery.hasAny(m => m === Modifier.Static))
                return isValidAccessor && property.isStatic;

            return false;
        }

        //#endregion _isValidProperty

        //#endregion Utilities

        //#region Static Members

        //#region getType

        //Looks up or creates a type for the specified constructor.
        static getType(ctor: IFunction): Type {
            Assert.isDefined(ctor, 'The constructor is not defined.');
            Assert.isTrue(u.isFunction(ctor), 'The constructor must be a function.');
            var type = types.getValue(ctor);
            if (type === undefined) {
                type = new Type(constructorPassword, ctor);
                types.add(ctor, type);
            }

            return type;
        }

        //#endregion getType

        //#endregion Static Members
    }

    //#endregion Type

    //#region Member

    /**
     A description of the metadata associated with in a member of a class.
     @abstract
    */
    export class Member {

        //#region Fields

        private _name: string;
        private _declaringType: Type;
        private _isStatic: boolean;

        //#endregion Fields

        //#region Properties

        //#region name

        get name(): string {
            return this._name;
        }

        //#endregion name

        //#region declaringType

        get declaringType(): Type {
            return this._declaringType;
        }

        //#endregion declaringType

        //#region isStatic

        get isStatic(): boolean {
            return this._isStatic;
        }

        //#endregion isStatic

        //#endregion Properties

        //#region Constructors

        constructor(password: number, name: string, declaringType: Type, isStatic: boolean) {
            Assert.isTrue(password === constructorPassword,
                'You do not have permission to create instances of this type.');

            this._name = name;
            this._declaringType = declaringType;
            this._isStatic = isStatic;
        }

        //#endregion Constructors
    }

    //#endregion Member

    //#region Property

    /**
     A description of the metadata associated with in a property of a class.
    */
    export class Property extends Member {

        //#region Fields

        private _canWrite: boolean;
        private _canRead: boolean;
        private _isMethod: boolean;
        private _isField: boolean;
        private _propertyDescriptor: PropertyDescriptor;

        //#endregion Fields

        //#region Properties

        //#region isPublic

        get isPublic(): boolean {
            return !this.isPrivate && !this.isProtected;
        }

        //#endregion isPublic

        //#region isPrivate

        get isPrivate(): boolean {
            return this.name.indexOf('_') === 0;
        }

        //#endregion isPrivate

        //#region isProtected

        get isProtected(): boolean {
            return this.name.indexOf('$') === 0;
        }

        //#endregion isProtected

        //#region canWrite

        get canWrite(): boolean {
            return this._canWrite;
        }

        //#endregion canWrite

        //#region canRead

        get canRead(): boolean {
            return this._canRead;
        }

        //#endregion canRead

        //#region enumerable

        get enumerable(): boolean {
            return this._propertyDescriptor && this._propertyDescriptor.enumerable;
        }

        //#endregion enumerable

        //#region configurable

        get configurable(): boolean {
            return this._propertyDescriptor && this._propertyDescriptor.configurable;
        }

        //#endregion configurable

        //#region isMethod

        public get isMethod(): boolean {
            return this._isMethod;
        }

        //#endregion isMethod

        //#region isField

        get isField(): boolean {
            return this._isField;
        }

        //#endregion isField

        //#endregion Properties

        //#region Constructors

        constructor(password: number, name: string, declaringType: Type, propertyDescriptor: PropertyDescriptor, canRead: boolean, canWrite: boolean, isMethod: boolean, isField: boolean, isStatic: boolean) {
            super(password, name, declaringType, isStatic);

            this._canWrite = canWrite;
            this._canRead = canRead;
            this._isMethod = isMethod;
            this._isField = isField;
            this._propertyDescriptor = propertyDescriptor;
        }

        //#endregion Constructors

        //#region Methods

        //#region getValue

        getValue(instance: any): any {
            Assert.isDefined(instance);

            if (this.isStatic)
                return this.declaringType.ctor[this.name];

            var type = typeOf(instance.constructor);
            var property = type.getProperty(this.name);

            if (Utilities.isNullOrUndefined(property))
                throw Utilities.format('The property does not exist on type {0}.', type.name);
            else if (!property.canRead)
                throw 'The property cannot be read.';

            var instanceType = <Type>instance.getType();

            if (instanceType && instanceType.ctor !== instance.constructor) {
                var prototype = instanceType.prototype;
                while (prototype) {
                    if (instanceType.ctor === prototype.constructor) {
                        return prototype[this.name];
                    }

                    var prototypeType = <Type>prototype.getType();
                    if (prototypeType)
                        prototype = prototypeType.prototype;
                    else
                        prototype = undefined;
                }
            }

            return instance[this.name];
        }

        //#endregion getValue

        //#region setValue

        setValue(instance: any, value: any): void {
            Assert.isDefined(instance);

            if (this.isStatic) {
                this.declaringType.ctor[this.name] = value;
                return;
            }

            var type = typeOf(instance.constructor);
            var property = type.getProperty(this.name);

            if (Utilities.isNullOrUndefined(property))
                throw Utilities.format('The property does not exist on type {0}.', type.name);
            else if (!property.canWrite)
                throw 'The property cannot be written to.';

            instance[this.name] = value;
        }

        //#endregion setValue

        //#endregion Methods
    }

    //#endregion Property

    //#region Field

    /**
     A description of the metadata associated with in a field of a class.
    */
    export class Field extends Property {

        //#region Properties

        //#region isPublic

        get isPublic(): boolean {
            return !this.isPrivate && !this.isProtected;
        }

        //#endregion isPublic

        //#region isPrivate

        get isPrivate(): boolean {
            return this.name.indexOf('_') === 0;
        }

        //#endregion isPrivate

        //#region isProtected

        get isProtected(): boolean {
            return this.name.indexOf('$') === 0;
        }

        //#endregion isProtected

        //#endregion Properties

        //#region Constructors

        constructor(password: number, name: string, declaringType: Type, isStatic: boolean) {
            super(password, name, declaringType, null, true, true, false, true, isStatic);
        }

        //#endregion Constructors

        //#region Methods

        //#region getValue

        getValue(instance: any): any {
            Assert.isDefined(instance);

            if (this.isStatic)
                return this.declaringType.ctor[this.name];

            var type = typeOf(instance.constructor);
            var property = type.getProperty(this.name);

            if (Utilities.isNullOrUndefined(property))
                throw Utilities.format('The property does not exist on type {0}.', type.name);
            else if (!property.canRead)
                throw 'The property cannot be read.';

            var instanceType = <Type>instance.getType();

            if (instanceType && instanceType.ctor !== instance.constructor) {
                var prototype = instanceType.prototype;
                while (prototype) {
                    if (instanceType.ctor === prototype.constructor) {
                        return prototype[this.name];
                    }

                    var prototypeType = <Type>prototype.getType();
                    if (prototypeType)
                        prototype = prototypeType.prototype;
                    else
                        prototype = undefined;
                }
            }

            return instance[this.name];
        }

        //#endregion getValue

        //#region setValue

        setValue(instance: any, value: any): void {
            Assert.isDefined(instance);

            if (this.isStatic) {
                this.declaringType.ctor[this.name] = value;
                return;
            }

            var type = typeOf(instance.constructor);
            var property = type.getProperty(this.name);

            if (Utilities.isNullOrUndefined(property))
                throw Utilities.format('The property does not exist on type {0}.', type.name);
            else if (!property.canWrite)
                throw 'The property cannot be written to.';

            instance[this.name] = value;
        }

        //#endregion setValue

        //#endregion Methods
    }

    //#endregion Field

    //#region Variable

    /**
     A description of the metadata associated with in a variable of a module.
    */
    export class Variable extends Property {

        //#region Fields

        private _module: Module;

        //#endregion Fields

        //#region Properties

        //#region module

        get module(): Module {
            return this._module;
        }

        //#endregion module

        //#endregion Properties

        //#region Constructors

        constructor(password: number, name: string, module: Module) {
            Assert.isDefined(module);

            super(password, name, null, null, true, true, false, false, true);
        }

        //#endregion Constructors
    }

    //#endregion Variable

    //#region Method

    /**
     A description of the metadata associated with in a method of a class.
     @remarks 
        In JavaScript methods are properties of type function. 
        Therefore a Method is a Property.
    */
    export class Method extends Property {

        //#region Fields

        private _underlyingFunction: IFunction;
        private _parameters: IEnumerable<Parameter>;

        //#endregion Fields

        //#region Constructors

        constructor(password: number, name: string, declaringType: Type, propertyDescriptor: PropertyDescriptor, canWrite: boolean, underlyingFunction: IFunction, isStatic: boolean) {
            super(password, name, declaringType, propertyDescriptor, true, canWrite, true, false, isStatic);

            this._underlyingFunction = underlyingFunction;
        }

        //#endregion Constructors

        //#region Methods

        //#region invoke

        invoke(instance: any, ...args: any[]) {
            Assert.isDefined(instance);

            if (this.isStatic)
                return this.declaringType.ctor[this.name].apply(null, args);

            var type = typeOf(instance.constructor);
            var method = type.getMethod(this.name);

            if (Utilities.isNullOrUndefined(method))
                throw Utilities.format('The method does not exist on type {0}.', type.name);

            return instance[this.name].apply(instance, args);
        }

        //#endregion invoke

        //#region getParameters

        getParameters(): IQueryable<Parameter> {
            if (!this._parameters)
                this._parameters = this._initializeParameters();

            return this._parameters.array().query();
        }

        //#endregion getParameters

        //#endregion Methods

        //#region Utilities

        //#region _initializeParameters

        private _initializeParameters(): IEnumerable<Parameter> {
            var initializedParameters = new Array<Parameter>();
            var parameterNames = Classical.Expression.getArguments(this._underlyingFunction);

            for (var i = 0; i < parameterNames.length; i++) {
                var parameterName = parameterNames[i];
                var parameter = new Parameter(constructorPassword, parameterName, i);
                initializedParameters.add(parameter);
            }

            return initializedParameters;
        }

        //#endregion _initializeParameters

        //#endregion Utilities
    }

    //#endregion Method

    //#region Function

    /**
     A description of the metadata associated with in a function of a module.
    */
    export class Function extends Method {

        //#region Constructors

        constructor(password: number, name: string, canWrite: boolean, underlyingFunction: IFunction) {
            super(password, name, null, null, canWrite, underlyingFunction, true);
        }

        //#endregion Constructors
    }

    //#endregion Function

    //#region Parameter

    /**
     A description of the metadata associated with in a parameter of a function.
    */
    export class Parameter {

        //#region Fields

        private _name: string;
        private _position: number;

        //#endregion Fields

        //#region Properties

        //#region name

        get name(): string {
            return this._name;
        }

        //#endregion name

        //#region position

        get position(): number {
            return this._position;
        }

        //#endregion position

        //#endregion Properties

        //#region Constructors

        constructor(password: number, name: string, position: number) {
            Assert.isTrue(password === constructorPassword,
                'You do not have permission to create instances of this type.');

            this._name = name;
            this._position = position;
        }

        //#endregion Constructors
    }

    //#endregion Parameter

    //#region Initialization

    //The global dictionaries of modules and types for runtime caching.
    var modules = new c.Dictionary<Object, Module>(5000);
    var types = new c.Dictionary<IFunction, Type>(5000);

    //A password used to manage private constructors
    var constructorPassword = Math.random();

    //#endregion Initialization
}