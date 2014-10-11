﻿
//#region IFunction

interface IFunction extends Function { }

//#endregion IFunction

//#region Collections

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

        //Returns a JavaScript array.
        array(): KeyValuePair<TKey, TValue>[] {
            var array: any[] = [];
            forall(
                <any>this,
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

        array(): TKey[] {
            var array: TKey[] = new Array<TKey>();
            forall(this, pair => array.add(pair));
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

module Classical.Reflection {

    //#region Imports

    import u = Classical.Utilities;
    import c = Classical.Collections;

    //#endregion Imports

    //#region BindingFlag

    export enum BindingFlag {
        Public,
        NonPublic
    }

    //#endregion BindingFlag

    //#region Module

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

        //#region variables

            getVariables(): IQueryable<Variable> {
            if (!this._variables)
                this._variables = this._initializeVariables();

            return this._variables.array().query();
        }

        //#endregion variables

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

            this.getTypes().foreach(t => {
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
                Module._global = new Module(constructorPassword, 'Global', window);
                modules.add(window, Module._global);
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
                if (this._isType(moduleCandidate[ownProperty]))
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

    //A cached wrapper around a constructor to provide easy access to type information.
    export class Type {

        //#region Fields

        private _ctor: IFunction;
        private _base: Type = null;
        private _module: Module;
        private _name: string = null;
        private _members: IEnumerable<Member>;
        private _properties: IEnumerable<Property>;
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
                return u.format("{0}.{1}", this.module.name, this.name);
            else
                return this.name;
        }

        //#endregion fullName

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

        //#region module

        get module(): Module {
            if (!this._module)
                this._module = Module.getModule(this);

            return this._module;
        }

        //#endregion module

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

        //#region getMembers

        getMembers(): IQueryable<Member> {
            if (!this._members)
                this._members = this.getProperties();

            return this._members.array().query();
        }

        //#endregion getMembers

        //#region getMember

        getMember(name: string): Member {
            Assert.isDefined(name);

            return this.getMembers().query().singleOrDefault(m => m.name === name);
        }

        //#endregion getMember

        //#region getProperties

        getProperties(): IQueryable<Property> {
            if (!this._properties)
                this._initializeProperties();

            return this._properties.array().query();
        }

        //#endregion getProperties

        //#region getProperty

        getProperty(name: string): Property {
            Assert.isDefined(name);

            return this.getProperties().query().singleOrDefault(p => p.name === name);
        }

        //#endregion getProperty

        //#region getMethods

        getMethods(bindingFlag?: BindingFlag): IQueryable<Method> {
            if (!this._methods)
                this._methods = this.getProperties().where(p => p.isMethod).cast<Method>().array();

            if (bindingFlag) {
                switch (bindingFlag) {
                    case BindingFlag.NonPublic: {
                        return this._methods.array().query().where(m => m.isPrivate);
                    }
                    case BindingFlag.Public: {
                        return this._methods.array().query().where(m => m.isPublic);
                    }
                    default: {
                        throw 'Unrecognized BindingFlag';
                    }
                }
            }

            return this._methods.array().query();
        }

        //#endregion getMethods

        //#region getMethod

        getMethod(name: string): Method {
            Assert.isDefined(name);

            return this.getMethods().query().singleOrDefault(m => m.name === name);
        }

        //#endregion getMethod

        //#endregion Methods

        //#region Utilities

        //#region initializeProperties

        private _initializeProperties(): void {
            var properties = new Array<Property>();
            var instance = this._ctor.prototype;

            Object.getOwnPropertyNames(instance).forEach((property) => {
                var propertyDescriptor = Object.getOwnPropertyDescriptor(instance, property);

                if (Utilities.isDefined(propertyDescriptor.get) || Utilities.isDefined(propertyDescriptor.set))
                    properties.add(new Property(constructorPassword, property, typeOf(instance.constructor), Utilities.isDefined(propertyDescriptor.get), Utilities.isDefined(propertyDescriptor.set), false));
                else if (Utilities.isFunction(propertyDescriptor.value))
                    properties.add(new Method(constructorPassword, property, typeOf(instance.constructor), propertyDescriptor.writable, <IFunction>propertyDescriptor.value));
            });

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

        //#endregion initializeProperties

        //#endregion Utilities

        //#region Static Members

        //#region getType

        //Looks up or creates a type for the specified constructor.
        static getType(ctor: IFunction): Type {
            Assert.isDefined(ctor, 'The constructor is not defined.');
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

    export class Member {

        //#region Fields

        private _name: string;
        private _declaringType: Type;

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

        //#endregion Properties

        //#region Constructors

        constructor(password: number, name: string, declaringType: Type) {
            Assert.isTrue(password === constructorPassword,
                'You do not have permission to create instances of this type.');

            this._name = name;
            this._declaringType = declaringType;
        }

        //#endregion Constructors
    }

    //#endregion Member

    //#region Property

    export class Property extends Member {

        //#region Fields

        private _canWrite: boolean;
        private _canRead: boolean;
        private _isMethod: boolean;

        //#endregion Fields

        //#region Properties

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

        //#region isMethod

        public get isMethod(): boolean {
            return this._isMethod;
        }

        //#endregion isMethod

        //#endregion Properties

        //#region Constructors

        constructor(password: number, name: string, declaringType: Type, canRead: boolean, canWrite: boolean, isMethod: boolean) {
            super(password, name, declaringType);

            this._canWrite = canWrite;
            this._canRead = canRead;
            this._isMethod = isMethod;
        }

        //#endregion Constructors

        //#region Methods

        //#region getValue

        getValue(instance: any): any {
            Assert.isDefined(instance);

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

        setValue(instance: any, value: any): any {
            Assert.isDefined(instance);

            var type = typeOf(instance.constructor);
            var property = type.getProperty(this.name);

            if (Utilities.isNullOrUndefined(property))
                throw Utilities.format('The property does not exist on type {0}.', type.name);
            else if (!property.canWrite)
                throw 'The property cannot be written to.';

            instance[this.name] = value;

            //var instanceType = <Type>instance.getType();

            //if (instanceType && instanceType.ctor === instance.constructor) {
            //    instance[this.name] = value;
            //}
            //else {
            //    var prototype = instanceType.prototype;
            //    while (prototype) {
            //        if (instanceType.ctor === prototype.constructor) {
            //            prototype[this.name] = value;

            //            break;
            //        }

            //        var prototypeType = <Type>prototype.getType();
            //        if (prototypeType)
            //            prototype = prototypeType.prototype;
            //        else
            //            prototype = undefined;
            //    }
            //}
        }

        //#endregion setValue

        //#endregion Methods
    }

    //#endregion Property

    //#region Variable

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

            super(password, name, undefined, true, true, false);
        }

        //#endregion Constructors
    }

    //#endregion Variable

    //#region Method

    export class Method extends Property {

        //#region Fields

        private _underlyingFunction: IFunction;
        private _parameters: IEnumerable<Parameter>;

        //#endregion Fields

        //#region Properties

        //#region isPublic

        get isPublic(): boolean {
            return this.name.indexOf('_') !== 0;
        }

        //#endregion isPublic

        //#region isPrivate

        get isPrivate(): boolean {
            return !this.isPublic;
        }

        //#endregion isPrivate

        //#endregion Properties

        //#region Constructors

        constructor(password: number, name: string, declaringType: Type, canWrite: boolean, underlyingFunction: IFunction) {
            super(password, name, declaringType, true, canWrite, true);

            this._underlyingFunction = underlyingFunction;
        }

        //#endregion Constructors

        //#region Methods

        //#region invoke

        invoke(instance: any, ...args: any[]) {
            Assert.isDefined(instance);

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

    export class Function extends Method {

        //#region Constructors

        constructor(password: number, name: string, canWrite: boolean, underlyingFunction: IFunction) {
            super(password, name, undefined, canWrite, underlyingFunction);
        }

        //#endregion Constructors
    }

    //#endregion Function

    //#region Parameter

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

//#region Anonymous

module Classical.Anonymous { }

//#endregion Anonymous