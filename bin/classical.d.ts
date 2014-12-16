declare module Classical.Hash {
    function forNumber(key: number, seed?: number): number;
    /**
        * JS Implementation of MurmurHash3 (r136) (as of May 20, 2011)
        *
        * @author <a href="mailto:gary.court@gmail.com">Gary Court</a>
        * @see http://github.com/garycourt/murmurhash-js
        * @author <a href="mailto:aappleby@gmail.com">Austin Appleby</a>
        * @see http://sites.google.com/site/murmurhash/
        *
        * @param {string} key ASCII only
        * @param {number} seed Positive integer only
        * @return {number} 32-bit positive integer hash (default 37)
        */
    function forString(key: string, seed?: number): number;
}
declare module Classical.Native {
}
declare module Classical.Utilities {
    function areEqual(first: any, second: any): boolean;
    function argumentsToArray<T>(args: IArguments): T[];
    function coalesce<T>(value: T, alternative: T): T;
    function extend(destination: any, source: any): any;
    function format(template: string, ...inputs: any[]): string;
    function titleCase(title: string, ...exclude: string[]): string;
    function sentenceCase(sentence: string, ...exclude: string[]): string;
    function getPropertyNames(value: any): string[];
    function isNull(value: any): boolean;
    function isUndefined(value: any): boolean;
    function isNullOrUndefined(value: any): boolean;
    function isDefined(value: any): boolean;
    function isNumber(value: any): boolean;
    function isNaN(value: any): boolean;
    function isInfinity(value: any): boolean;
    function isInteger(value: any): boolean;
    function isString(value: any): boolean;
    function isBoolean(value: any): boolean;
    function isTrue(value: any): boolean;
    function isTruthy(value: any): boolean;
    function isFalse(value: any): boolean;
    function isFalsy(value: any): boolean;
    function isObject(value: any): boolean;
    function isEmptyObject(value: any): boolean;
    function isArray(value: any): boolean;
    function isFunction(value: any): boolean;
}
declare module Classical.Assert {
    function staticClass(): void;
    function isDefined(value: any, message?: string): void;
    function nullOrUndefined(value: any, message?: string): void;
    function isTrue(expression: boolean, message?: string): void;
    function isFalse(expression: boolean, message?: string): void;
    function isInvalid(message?: string): void;
    function notImplemented(message?: string): Exception;
    class Exception {
        message: string;
        stackTrace: string;
        constructor(message?: string);
        toString(): string;
        setStackTrace(): void;
    }
}
interface IHashable {
    equals(other: any): boolean;
    getHashCode(): number;
}
interface IObject extends IHashable {
    is(type: Function): boolean;
    as<TObject>(): TObject;
    getType(): Classical.Reflection.Type;
}
interface Object extends IObject {
    watch(property: string, handler: (property: string, oldValue: any, newValue: any) => void): void;
}
interface String extends IObject {
}
interface Number extends IObject {
}
interface Boolean extends IObject {
}
declare module Classical {
    class Enum<TValue extends IObject> {
        private _value;
        value: TValue;
        constructor(value: TValue);
        equals(other: any): boolean;
        getHashCode(): number;
    }
}
interface IFunction extends Function {
}
declare module Classical.Collections {
    class Dictionary<TKey, TValue> implements IEnumerable<KeyValuePair<TKey, TValue>> {
        private _hashTable;
        private _bucketIndex;
        private _numberOfBuckets;
        private _numberOfElements;
        private _initialCapacity;
        keys: IEnumerable<TKey>;
        values: IEnumerable<TValue>;
        constructor(capacity?: number);
        getEnumerator(): IEnumerator<KeyValuePair<TKey, TValue>>;
        query(): IQueryable<KeyValuePair<TKey, TValue>>;
        forEach(operation: (item: KeyValuePair<TKey, TValue>) => void): void;
        array(): KeyValuePair<TKey, TValue>[];
        add(key: TKey, value: TValue): Dictionary<TKey, TValue>;
        remove(key: TKey): Dictionary<TKey, TValue>;
        getValue(key: TKey): TValue;
        containsKey(key: TKey): boolean;
        clear(): void;
        count(): number;
        private getIndex(key);
        private getElements(key);
        private getPair(elements, hashTable, numberOfBuckets, key);
        private addWithoutRebalancing(hashTable, numberOfBuckets, pair, checkForExistance?);
        private rebalanceIfNecessary();
        private rebalance();
    }
    class KeyValuePair<TKey, TValue> {
        key: TKey;
        value: TValue;
        constructor(key: TKey, value: TValue);
    }
}
declare function typeOf(ctor: IFunction): Classical.Reflection.Type;
declare function moduleOf(ctor: IFunction): Classical.Reflection.Module;
declare module Classical.Reflection {
    enum Modifier {
        Public = 0,
        Protected = 1,
        Private = 2,
        Instance = 3,
        Static = 4,
    }
    class Module {
        private _name;
        private _fullName;
        private _scope;
        private _base;
        private _modules;
        private _types;
        private _functions;
        private _variables;
        name: string;
        fullName: string;
        scope: any;
        constructor(password: number, name: string, scope: any, base?: Module);
        getModules(): IQueryable<Module>;
        getTypes(): IQueryable<Type>;
        getFunctions(): IQueryable<Function>;
        getVariables(): IQueryable<Variable>;
        private _initializeModules();
        private _initializeTypes();
        private _initializeFunctions();
        private _initializeVariables();
        private _findModule(type);
        private static _global;
        private static _anonymous;
        private static _modules;
        static global: Module;
        static anonymous: Module;
        static getModule(type: Type): Module;
        private static _isModule(moduleCandidate, moduleName?);
        private static _isType(typeCandidate);
    }
    class Type {
        private _ctor;
        private _base;
        private _module;
        private _name;
        private _properties;
        private _fields;
        private _methods;
        isPublic: boolean;
        isPrivate: boolean;
        isProtected: boolean;
        isPrimitive: boolean;
        name: string;
        fullName: string;
        ctor: IFunction;
        prototype: any;
        base: Type;
        module: Module;
        constructor(password: number, ctor: IFunction, mod?: Module);
        toString(): string;
        equals(other: any): boolean;
        getHashCode(): number;
        isAssignableTo(other: Type): boolean;
        isAssignableFrom(other: Type): boolean;
        getFields(...options: Modifier[]): IQueryable<Field>;
        getField(name: string, ...options: Modifier[]): Field;
        getProperties(...options: Modifier[]): IQueryable<Property>;
        getProperty(name: string, ...options: Modifier[]): Property;
        getMethods(...options: Modifier[]): IQueryable<Method>;
        getMethod(name: string, ...options: Modifier[]): Method;
        private _initializeProperties();
        private _getStaticProperties();
        private _getInstanceProperties();
        private _getProperOptions(optionsList);
        private _isValidProperty(property, modifiers);
        static getType(ctor: IFunction): Type;
    }
    class Member {
        private _name;
        private _declaringType;
        private _isStatic;
        name: string;
        declaringType: Type;
        isStatic: boolean;
        constructor(password: number, name: string, declaringType: Type, isStatic: boolean);
    }
    class Property extends Member {
        private _canWrite;
        private _canRead;
        private _isMethod;
        private _isField;
        private _propertyDescriptor;
        isPublic: boolean;
        isPrivate: boolean;
        isProtected: boolean;
        canWrite: boolean;
        canRead: boolean;
        enumerable: boolean;
        configurable: boolean;
        isMethod: boolean;
        isField: boolean;
        constructor(password: number, name: string, declaringType: Type, propertyDescriptor: PropertyDescriptor, canRead: boolean, canWrite: boolean, isMethod: boolean, isField: boolean, isStatic: boolean);
        getValue(instance: any): any;
        setValue(instance: any, value: any): void;
    }
    class Field extends Property {
        isPublic: boolean;
        isPrivate: boolean;
        isProtected: boolean;
        constructor(password: number, name: string, declaringType: Type, isStatic: boolean);
        getValue(instance: any): any;
        setValue(instance: any, value: any): void;
    }
    class Variable extends Property {
        private _module;
        module: Module;
        constructor(password: number, name: string, module: Module);
    }
    class Method extends Property {
        private _underlyingFunction;
        private _parameters;
        constructor(password: number, name: string, declaringType: Type, propertyDescriptor: PropertyDescriptor, canWrite: boolean, underlyingFunction: IFunction, isStatic: boolean);
        invoke(instance: any, ...args: any[]): any;
        getParameters(): IQueryable<Parameter>;
        private _initializeParameters();
    }
    class Function extends Method {
        constructor(password: number, name: string, canWrite: boolean, underlyingFunction: IFunction);
    }
    class Parameter {
        private _name;
        private _position;
        name: string;
        position: number;
        constructor(password: number, name: string, position: number);
    }
}
declare module Classical.Anonymous {
}
interface IEnumerable<T> extends IObject {
    getEnumerator(): IEnumerator<T>;
    forEach(operation: (item?: T) => void): void;
    query(): IQueryable<T>;
    array(): T[];
    count(): number;
}
interface IEnumerator<T> extends IObject {
    current: T;
    moveNext(): boolean;
}
interface IAccessibleCollection<T> extends IEnumerable<T> {
    get(index: number): T;
}
interface ICollection<T> extends IAccessibleCollection<T> {
    add(item: T): ICollection<T>;
    addRange(items: IEnumerable<T>): ICollection<T>;
    remove(item: T): ICollection<T>;
    removeAt(index: number): ICollection<T>;
    clear(): ICollection<T>;
    set(index: number, item: T): ICollection<T>;
}
interface IQueryable<T> extends IEnumerable<T> {
    forEach(operation: (item: T) => void): IQueryable<T>;
    cast<TElement>(): IQueryable<TElement>;
    where(predicate: (item: T) => boolean): IQueryable<T>;
    select<TSelected>(selector: (item: T) => TSelected): IQueryable<TSelected>;
    selectMany<TSelected>(selector: (item: T) => IEnumerable<TSelected>): IQueryable<TSelected>;
    orderBy<TSelected>(selector: (item: T) => TSelected, comparison?: (first: TSelected, second: TSelected) => number): IQueryable<T>;
    orderByDescending<TSelected>(selector: (item: T) => TSelected, comparison?: (first: TSelected, second: TSelected) => number): IQueryable<T>;
    aggregate<TAccumulate>(accumulator: (first: TAccumulate, second: T) => TAccumulate, seed?: TAccumulate): TAccumulate;
    sum(selector?: (item: T) => number): number;
    max(selector?: (item: T) => number): number;
    min(selector?: (item: T) => number): number;
    first(predicate?: (item: T) => boolean): T;
    firstOrDefault(predicate?: (item: T) => boolean): T;
    last(predicate?: (item: T) => boolean): T;
    lastOrDefault(predicate?: (item: T) => boolean): T;
    single(predicate?: (item: T) => boolean): T;
    singleOrDefault(predicate?: (item: T) => boolean): T;
    skip(count: number): IQueryable<T>;
    take(count: number): IQueryable<T>;
    at(index: number): T;
    concat(other: IEnumerable<T>): IQueryable<T>;
    hasAny(predicate?: (item: T) => boolean): boolean;
    hasNone(predicate?: (item: T) => boolean): boolean;
    distinct(): IQueryable<T>;
    reverse(): IQueryable<T>;
    dictionary<TKey, TValue>(keySelector: (item: T) => TKey, valueSelector: (item: T) => TValue): Classical.Collections.Dictionary<TKey, TValue>;
    execute(): IQueryable<T>;
    result(): T[];
}
interface Array<T> extends ICollection<T>, IEnumerable<T> {
}
declare module Classical.Collections {
    class ImmutableCollection<T> implements IAccessibleCollection<T> {
        private _get;
        constructor(elements: IEnumerable<T>);
        get(index: number): T;
        getEnumerator(): IEnumerator<T>;
        query(): IQueryable<T>;
        forEach(operation: (item: T) => void): void;
        array(): T[];
        count(): number;
    }
    class Queryable<T> implements IQueryable<T> {
        _enumerable: IEnumerable<T>;
        constructor(enumerable: IEnumerable<T>);
        toString(): string;
        getEnumerator(): IEnumerator<T>;
        query(): Queryable<T>;
        array(): T[];
        count(): number;
        forEach(operation: (item?: T) => void): void;
        forEach(operation: (item: T) => void): IQueryable<T>;
        cast<TElement>(): IQueryable<TElement>;
        where(predicate: (item: T) => boolean): IQueryable<T>;
        select<TSelected>(selector: (item: T) => TSelected): IQueryable<TSelected>;
        selectMany<TSelected>(selector: (item: T) => IEnumerable<TSelected>): IQueryable<TSelected>;
        orderBy<TSelected>(selector: (item: T) => TSelected, comparison?: (first: TSelected, second: TSelected) => number): IQueryable<T>;
        orderByDescending<TSelected>(selector: (item: T) => TSelected, comparison?: (first: TSelected, second: TSelected) => number): IQueryable<T>;
        aggregate<TAccumulate>(accumulator: (first: TAccumulate, second: T) => TAccumulate, seed?: TAccumulate): TAccumulate;
        sum(selector?: (item: T) => number): number;
        max(selector?: (item: T) => number): number;
        min(selector?: (item: T) => number): number;
        hasNone(predicate?: (item: T) => boolean): boolean;
        hasAny(predicate?: (item: T) => boolean): boolean;
        first(predicate?: (item: T) => boolean): T;
        firstOrDefault(predicate?: (item: T) => boolean): T;
        last(predicate?: (item: T) => boolean): T;
        lastOrDefault(predicate?: (item: T) => boolean): T;
        single(predicate?: (item: T) => boolean): T;
        singleOrDefault(predicate?: (item: T) => boolean): T;
        skip(count: number): IQueryable<T>;
        take(count: number): IQueryable<T>;
        at(index: number): T;
        concat(other: IEnumerable<T>): IQueryable<T>;
        distinct(): IQueryable<T>;
        reverse(): IQueryable<T>;
        dictionary<TKey, TValue>(keySelector: (item: T) => TKey, valueSelector: (item: T) => TValue): Dictionary<TKey, TValue>;
        execute(): IQueryable<T>;
        result(): T[];
        private coalescePredicate(predicate);
    }
    module Enumerable {
        function range(end: number): IEnumerable<number>;
        function range(start: number, end: number): IEnumerable<number>;
        function range(start: number, increment: number, end: number): IEnumerable<number>;
        function forEach<T>(items: IEnumerable<T>, operation: (item?: T) => void): void;
    }
}
declare module Classical.Expression {
    function getProperty<TInstance>(instance: TInstance, selector: (instance: TInstance) => any): string;
    function getProperty<TInstance>(selector: (instance: TInstance) => any): string;
    function getArguments(func: Function): string[];
}
interface IEvent<THost, TInformation> extends IObject {
    subscribe(registration: (host: THost, info: TInformation) => void): void;
    unsubscribe(registration: (host: THost, info: TInformation) => void): void;
    execute(info: TInformation): void;
    clear(): void;
    count(): number;
}
interface IRequest<THost, TInformation, TResponse> extends IObject {
    subscribe(registration: (host: THost, info: TInformation) => TResponse): void;
    unsubscribe(registration: (host: THost, info: TInformation) => TResponse): void;
    execute(info: TInformation): IEnumerable<TResponse>;
    clear(): void;
    count(): number;
}
interface IVoteRequest<THost, TInformation> extends IRequest<THost, TInformation, boolean> {
    poll(info: TInformation): boolean;
}
interface ITallyRequest<THost, TInformation> extends IRequest<THost, TInformation, number> {
    tally(info: TInformation): number;
}
declare module Classical.Events {
    class Event<THost, TInformation> implements IEvent<THost, TInformation> {
        _subscribers: {
            (host: THost, info: TInformation): void;
        }[];
        _host: THost;
        constructor(host: THost);
        subscribe(registration: (host: THost, info: TInformation) => void): void;
        unsubscribe(registration: (host: THost, info: TInformation) => void): void;
        execute(info?: TInformation): void;
        clear(): void;
        count(): number;
    }
    class Request<THost, TInformation, TResponse> implements IRequest<THost, TInformation, TResponse> {
        _subscribers: {
            (host: THost, info: TInformation): TResponse;
        }[];
        _host: THost;
        constructor(host?: THost);
        subscribe(registration: (host: THost, info: TInformation) => TResponse): void;
        unsubscribe(registration: (host: THost, info: TInformation) => TResponse): void;
        execute(info: TInformation): IEnumerable<TResponse>;
        clear(): void;
        count(): number;
    }
    class TallyRequest<THost, TInformation> extends Request<THost, TInformation, number> implements ITallyRequest<THost, TInformation> {
        constructor(host?: THost);
        tally(info: TInformation): number;
    }
    class VoteRequest<THost, TInformation> extends Request<THost, TInformation, boolean> implements IVoteRequest<THost, TInformation> {
        _undecidedResult: boolean;
        constructor(host?: THost, undecidedResult?: boolean);
        subscribe(registration: (host: THost, info: TInformation) => boolean): void;
        poll(info: TInformation): boolean;
    }
    class UnanimousVoteRequest<THost, TInformation> extends VoteRequest<THost, TInformation> {
        constructor(host?: THost, undecidedResult?: boolean);
        poll(info: TInformation): boolean;
    }
}
declare function bind<TModel, TProperty>(model: TModel, selector: (obj: TModel) => TProperty): Classical.Binding.IBinder<Classical.Binding.PropertyUpdate<TProperty>>;
declare module Classical.Binding {
    interface ISynchronizable<TTargetUpdate extends Update> extends IObject {
        hasTarget(target: ISynchronizable<TTargetUpdate>): boolean;
        hasSource(source: ISynchronizable<any>): boolean;
        bind(binder: IBinder<TTargetUpdate>): void;
        bind(binder: IComplexBinder<TTargetUpdate>): void;
        unbind(source: ISynchronizable<any>): boolean;
        observe(registration: (update: TTargetUpdate[], source: any) => void): any;
        apply(updates: IEnumerable<TTargetUpdate>): void;
        detach(): void;
    }
    class Update {
        private _sources;
        constructor(sources: IEnumerable<any>);
        hasSource(source: any): boolean;
        addSource(source: any): void;
        transferSourcesTo<TUpdate extends Update>(update: TUpdate): TUpdate;
    }
    interface IBinder<TTargetUpdate extends Update> extends IObject {
        source: ISynchronizable<Update>;
        converter?: IConverter<any, TTargetUpdate>;
        init?: (target: ISynchronizable<TTargetUpdate>, source: ISynchronizable<Update>) => void;
    }
    interface IComplexBinder<TTargetUpdate extends Update> extends IObject {
        sources: ISynchronizable<Update>[];
        converter: IConverter<any[], TTargetUpdate>;
    }
    interface IConverter<TSource, TTarget> extends IObject {
        convert(value: TSource): TTarget;
        convertBack?(value: TTarget): TSource;
    }
    class Synchronizer<TTargetUpdate extends Update> implements ISynchronizable<TTargetUpdate> {
        private _updateDepth;
        private _updates;
        private _target;
        private _binders;
        private _onUpdateEvent;
        target: ISynchronizable<TTargetUpdate>;
        updates: TTargetUpdate[];
        updateDepth: number;
        constructor(target: ISynchronizable<TTargetUpdate>);
        hasTarget(target: ISynchronizable<TTargetUpdate>): boolean;
        hasSource(source: ISynchronizable<any>): boolean;
        bind(binder: IBinder<TTargetUpdate>): void;
        bind(binder: IComplexBinder<TTargetUpdate>): void;
        unbind(source: ISynchronizable<any>): boolean;
        apply(updates: IEnumerable<TTargetUpdate>): void;
        observe(registration: (update: TTargetUpdate[], source: any) => void): void;
        detach(): void;
        add(update: TTargetUpdate): void;
        filter(updates: IEnumerable<TTargetUpdate>): TTargetUpdate[];
        sync(immediate?: boolean): boolean;
        syncStart(): void;
        private _createComplexBinding(binder);
        private _executeUpdates(groupUpdate);
        private _executeOnUpdate(updates);
    }
    class Property<TValue> implements ISynchronizable<PropertyUpdate<TValue>> {
        updating: boolean;
        private _value;
        private _synchronizer;
        value: TValue;
        constructor(value?: TValue);
        toString(): string;
        hasTarget(target: ISynchronizable<PropertyUpdate<TValue>>): boolean;
        hasSource(source: ISynchronizable<any>): boolean;
        bind(source: Property<TValue>): any;
        bind(sources: ISynchronizable<Update>[], selector: (sources: any[]) => TValue): any;
        bind(propertyBinder: IPropertyBinder<TValue>): any;
        bind(binder: IBinder<PropertyUpdate<TValue>>): any;
        bind(binder: IComplexBinder<PropertyUpdate<TValue>>): void;
        unbind(partner: ISynchronizable<any>): boolean;
        observe(registration: (update: PropertyUpdate<TValue>[], source: Property<TValue>) => void): void;
        apply(updates: IEnumerable<PropertyUpdate<TValue>>): void;
        detach(): void;
        private _createComplexBinder(sources, selector);
        private _sourceToBinder(source);
    }
    class ConfirmationProperty<TValue> extends Property<TValue> {
        private _newValue;
        private hasAccepted;
        value: TValue;
        newValue: TValue;
        private synchronizer;
        constructor(value?: TValue);
        apply(updates: IEnumerable<PropertyUpdate<TValue>>): void;
        accept(): void;
        reject(): void;
        private _getValue();
        private _setValue(value);
    }
    interface IPropertyBinder<TValue> extends IObject {
        property: Property<any>;
        converter: IConverter<any, TValue>;
    }
    class PropertyUpdate<TValue> extends Update {
        value: TValue;
        constructor(value: TValue, sources?: IEnumerable<any>);
    }
    function getProperty<T>(obj: any, propertyName: string): Property<T>;
    function setProperty<T>(obj: any, propertyName: string, value: T): void;
    function propertyBinderToBinder<TValue>(propertyBinder: IPropertyBinder<TValue>): IBinder<PropertyUpdate<TValue>>;
}
declare module Classical.Binding.Collections {
    class Collection<T> implements ICollection<T>, ISynchronizable<CollectionUpdate<T>> {
        private _items;
        private _synchronizer;
        constructor(items?: IEnumerable<T>);
        getEnumerator(): IEnumerator<T>;
        forEach(operation: (item?: T) => void): void;
        query(): IQueryable<T>;
        array(): T[];
        count(): number;
        add(item: T): ICollection<T>;
        private _add(update);
        addRange(items: IEnumerable<T>): ICollection<T>;
        remove(item: T): ICollection<T>;
        private _remove(update);
        removeAt(index: number): ICollection<T>;
        private _removeAt(update);
        clear(): ICollection<T>;
        get(index: number): T;
        set(index: number, item: T): ICollection<T>;
        private _set(update);
        hasTarget(target: ISynchronizable<CollectionUpdate<T>>): boolean;
        hasSource(source: ISynchronizable<any>): boolean;
        bind(source: Collection<T>): void;
        bind(collectionBinder: ICollectionBinder<T>): void;
        bind(sources: ISynchronizable<Update>[], selector: (sources: any[]) => any): any;
        bind(binder: IBinder<CollectionUpdate<T>>): void;
        bind(binder: IComplexBinder<CollectionUpdate<T>>): void;
        unbind(source: ISynchronizable<any>): boolean;
        observe(registration: (update: CollectionUpdate<T>[], source: any) => void): void;
        apply(updates: IEnumerable<CollectionUpdate<T>>): void;
        detach(): void;
        toString(): string;
        private _createComplexBinder(sources, selector);
        private _sourceToBinder(source);
        private _collectionBinderToBinder(collectionBinder);
        private _applyAdd(updates);
        private _applySet(updates);
        private _applyRemove(updates);
        private _applyRemoveAt(updates);
    }
    interface ICollectionBinder<T> extends IObject {
        collection: Collection<any>;
        converter?: IConverter<any, T>;
    }
    class CollectionUpdate<T> extends Update {
        type: CollectionUpdateType;
        oldValue: T;
        newValue: T;
        index: number;
        constructor(sources?: IEnumerable<any>);
        create(type: CollectionUpdateType, oldValue: T, newValue: T, index: number): CollectionUpdate<T>;
    }
    enum CollectionUpdateType {
        Add = 0,
        Set = 1,
        Remove = 2,
        RemoveAt = 3,
    }
}
