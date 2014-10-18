declare module Classical.Native {
}
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
declare module Classical.Utilities {
    function areEqual(first: any, second: any): boolean;
    function argumentsToArray<T>(args: IArguments): T[];
    function coalesce<T>(value: T, alternative: T): T;
    function extend(destination: any, source: any): any;
    function format(template: string, ...inputs: any[]): string;
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
        public message: string;
        public stackTrace: string;
        constructor(message?: string);
        public toString(): string;
        public setStackTrace(): void;
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
interface Array<T> extends ICollection<T>, IEnumerable<T> {
}
declare module Classical {
    class Enum<TValue extends IObject> {
        private _value;
        public value : TValue;
        constructor(value: TValue);
        public equals(other: any): boolean;
        public getHashCode(): number;
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
        public keys : IEnumerable<TKey>;
        public values : IEnumerable<TValue>;
        constructor(capacity?: number);
        public getEnumerator(): IEnumerator<KeyValuePair<TKey, TValue>>;
        public query(): IQueryable<KeyValuePair<TKey, TValue>>;
        public forEach(operation: (item: KeyValuePair<TKey, TValue>) => void): void;
        public array(): KeyValuePair<TKey, TValue>[];
        public add(key: TKey, value: TValue): Dictionary<TKey, TValue>;
        public remove(key: TKey): Dictionary<TKey, TValue>;
        public getValue(key: TKey): TValue;
        public containsKey(key: TKey): boolean;
        public clear(): void;
        public count(): number;
        private getIndex(key);
        private getElements(key);
        private getPair(elements, hashTable, numberOfBuckets, key);
        private addWithoutRebalancing(hashTable, numberOfBuckets, pair, checkForExistance?);
        private rebalanceIfNecessary();
        private rebalance();
    }
    class KeyValuePair<TKey, TValue> {
        public key: TKey;
        public value: TValue;
        constructor(key: TKey, value: TValue);
    }
}
declare function typeOf(ctor: IFunction): Classical.Reflection.Type;
declare function moduleOf(ctor: IFunction): Classical.Reflection.Module;
declare module Classical.Reflection {
    enum Modifier {
        Public = 0,
        NonPublic = 1,
        Instance = 2,
        Static = 3,
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
        public name : string;
        public fullName : string;
        public scope : any;
        constructor(password: number, name: string, scope: any, base?: Module);
        public getModules(): IQueryable<Module>;
        public getTypes(): IQueryable<Type>;
        public getFunctions(): IQueryable<Function>;
        public getVariables(): IQueryable<Variable>;
        private _initializeModules();
        private _initializeTypes();
        private _initializeFunctions();
        private _initializeVariables();
        private _findModule(type);
        private static _global;
        private static _anonymous;
        private static _modules;
        static global : Module;
        static anonymous : Module;
        static getModule(type: Type): Module;
        private static _isModule(moduleCandidate, moduleName?);
        private static _isType(typeCandidate);
    }
    class Type {
        private _ctor;
        private _base;
        private _module;
        private _name;
        private _members;
        private _properties;
        private _methods;
        public name : string;
        public fullName : string;
        public ctor : IFunction;
        public prototype : any;
        public base : Type;
        public module : Module;
        constructor(password: number, ctor: IFunction, mod?: Module);
        public toString(): string;
        public equals(other: any): boolean;
        public getHashCode(): number;
        public isAssignableTo(other: Type): boolean;
        public isAssignableFrom(other: Type): boolean;
        public getMembers(): IQueryable<Member>;
        public getMember(name: string): Member;
        public getProperties(...options: Modifier[]): IQueryable<Property>;
        public getProperty(name: string): Property;
        public getMethods(...options: Modifier[]): IQueryable<Method>;
        public getMethod(name: string): Method;
        private _initializeProperties();
        private _getProperOptions(options);
        static getType(ctor: IFunction): Type;
    }
    class Member {
        private _name;
        private _declaringType;
        private _isStatic;
        public name : string;
        public declaringType : Type;
        public isStatic : boolean;
        constructor(password: number, name: string, declaringType: Type, isStatic: boolean);
    }
    class Property extends Member {
        private _canWrite;
        private _canRead;
        private _isMethod;
        public isPublic : boolean;
        public isNotPublic : boolean;
        public canWrite : boolean;
        public canRead : boolean;
        public isMethod : boolean;
        constructor(password: number, name: string, declaringType: Type, canRead: boolean, canWrite: boolean, isMethod: boolean, isStatic: boolean);
        public getValue(instance: any): any;
        public setValue(instance: any, value: any): void;
    }
    class Variable extends Property {
        private _module;
        public module : Module;
        constructor(password: number, name: string, module: Module);
    }
    class Method extends Property {
        private _underlyingFunction;
        private _parameters;
        constructor(password: number, name: string, declaringType: Type, canWrite: boolean, underlyingFunction: IFunction, isStatic: boolean);
        public invoke(instance: any, ...args: any[]): any;
        public getParameters(): IQueryable<Parameter>;
        private _initializeParameters();
    }
    class Function extends Method {
        constructor(password: number, name: string, canWrite: boolean, underlyingFunction: IFunction);
    }
    class Parameter {
        private _name;
        private _position;
        public name : string;
        public position : number;
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
}
declare module Classical.Collections {
    class ImmutableCollection<T> implements IAccessibleCollection<T> {
        private _get;
        constructor(elements: IEnumerable<T>);
        public get(index: number): T;
        public getEnumerator(): IEnumerator<T>;
        public query(): IQueryable<T>;
        public forEach(operation: (item: T) => void): void;
        public array(): T[];
        public count(): number;
    }
    class Queryable<T> implements IQueryable<T> {
        public _enumerable: IEnumerable<T>;
        constructor(enumerable: IEnumerable<T>);
        public toString(): string;
        public getEnumerator(): IEnumerator<T>;
        public query(): Queryable<T>;
        public array(): T[];
        public count(): number;
        public forEach(operation: (item?: T) => void): void;
        public forEach(operation: (item: T) => void): IQueryable<T>;
        public cast<TElement>(): IQueryable<TElement>;
        public where(predicate: (item: T) => boolean): IQueryable<T>;
        public select<TSelected>(selector: (item: T) => TSelected): IQueryable<TSelected>;
        public selectMany<TSelected>(selector: (item: T) => IEnumerable<TSelected>): IQueryable<TSelected>;
        public orderBy<TSelected>(selector: (item: T) => TSelected, comparison?: (first: TSelected, second: TSelected) => number): IQueryable<T>;
        public orderByDescending<TSelected>(selector: (item: T) => TSelected, comparison?: (first: TSelected, second: TSelected) => number): IQueryable<T>;
        public aggregate<TAccumulate>(accumulator: (first: TAccumulate, second: T) => TAccumulate, seed?: TAccumulate): TAccumulate;
        public sum(selector?: (item: T) => number): number;
        public max(selector?: (item: T) => number): number;
        public min(selector?: (item: T) => number): number;
        public hasNone(predicate?: (item: T) => boolean): boolean;
        public hasAny(predicate?: (item: T) => boolean): boolean;
        public first(predicate?: (item: T) => boolean): T;
        public firstOrDefault(predicate?: (item: T) => boolean): T;
        public last(predicate?: (item: T) => boolean): T;
        public lastOrDefault(predicate?: (item: T) => boolean): T;
        public single(predicate?: (item: T) => boolean): T;
        public singleOrDefault(predicate?: (item: T) => boolean): T;
        public skip(count: number): IQueryable<T>;
        public take(count: number): IQueryable<T>;
        public at(index: number): T;
        public concat(other: IEnumerable<T>): IQueryable<T>;
        public distinct(): IQueryable<T>;
        public reverse(): IQueryable<T>;
        public dictionary<TKey, TValue>(keySelector: (item: T) => TKey, valueSelector: (item: T) => TValue): Dictionary<TKey, TValue>;
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
        public _subscribers: {
            (host: THost, info: TInformation): void;
        }[];
        public _host: THost;
        constructor(host: THost);
        public subscribe(registration: (host: THost, info: TInformation) => void): void;
        public unsubscribe(registration: (host: THost, info: TInformation) => void): void;
        public execute(info?: TInformation): void;
        public clear(): void;
        public count(): number;
    }
    class Request<THost, TInformation, TResponse> implements IRequest<THost, TInformation, TResponse> {
        public _subscribers: {
            (host: THost, info: TInformation): TResponse;
        }[];
        public _host: THost;
        constructor(host?: THost);
        public subscribe(registration: (host: THost, info: TInformation) => TResponse): void;
        public unsubscribe(registration: (host: THost, info: TInformation) => TResponse): void;
        public execute(info: TInformation): IEnumerable<TResponse>;
        public clear(): void;
        public count(): number;
    }
    class TallyRequest<THost, TInformation> extends Request<THost, TInformation, number> implements ITallyRequest<THost, TInformation> {
        constructor(host?: THost);
        public tally(info: TInformation): number;
    }
    class VoteRequest<THost, TInformation> extends Request<THost, TInformation, boolean> implements IVoteRequest<THost, TInformation> {
        public _undecidedResult: boolean;
        constructor(host?: THost, undecidedResult?: boolean);
        public subscribe(registration: (host: THost, info: TInformation) => boolean): void;
        public poll(info: TInformation): boolean;
    }
    class UnanimousVoteRequest<THost, TInformation> extends VoteRequest<THost, TInformation> {
        constructor(host?: THost, undecidedResult?: boolean);
        public poll(info: TInformation): boolean;
    }
}
declare class BindingType extends Classical.Enum<string> {
    constructor(value: string);
    static OneWay: BindingType;
    static TwoWay: BindingType;
}
interface IBindingProperty<TValue> extends IObject {
    propertyChanged: IEvent<any, TValue>;
    value: TValue;
    owner: any;
}
interface INotifyPropertyChanged {
    propertyChanged: IEvent<INotifyPropertyChanged, string>;
}
interface IBindingCollection<T> extends ICollection<T> {
    bindingOff(): void;
    bindingOn(): void;
    collectionChanged: IEvent<IBindingCollection<T>, ICollectionChangedArgs<T>>;
}
interface ICollectionChangedArgs<T> {
    action: Classical.Binding.CollectionAction;
    newItem?: T;
    newIndex?: number;
    oldItem?: T;
    oldIndex?: number;
}
interface IValueConverter<TSourceValue, TTargetValue> {
    convert(value: TSourceValue): TTargetValue;
    convertBack(value: TTargetValue): TSourceValue;
}
interface IBinder<TTargetValue> extends IObject {
    target: IBindingProperty<TTargetValue>;
    bind(): void;
}
interface ICollectionBinder<TTargetValue> extends IObject {
    target: IBindingCollection<TTargetValue>;
    bind(): void;
}
declare function bind<TValue>(source: IBindingProperty<TValue>): IBinder<TValue>;
declare function bind<TValue>(source: IBindingProperty<TValue>, bindingType: BindingType): IBinder<TValue>;
declare function bind<TSourceValue, TTargetValue>(source: IBindingProperty<TSourceValue>, converter: IValueConverter<TSourceValue, TTargetValue>): IBinder<TTargetValue>;
declare function bind<TSourceValue, TTargetValue>(source: IBindingProperty<TSourceValue>, converter: IValueConverter<TSourceValue, TTargetValue>, bindingType: BindingType): IBinder<TTargetValue>;
declare function bind<TValue>(source: INotifyPropertyChanged, property: string): IBinder<TValue>;
declare function bind<TValue>(source: INotifyPropertyChanged, property: string, bindingType: BindingType): IBinder<TValue>;
declare function bind<TSourceValue, TTargetValue>(source: INotifyPropertyChanged, property: string, converter: IValueConverter<TSourceValue, TTargetValue>): IBinder<TTargetValue>;
declare function bind<TSourceValue, TTargetValue>(source: INotifyPropertyChanged, property: string, converter: IValueConverter<TSourceValue, TTargetValue>, bindingType: BindingType): IBinder<TTargetValue>;
declare function bind<TValue>(source: IBindingCollection<TValue>): ICollectionBinder<TValue>;
declare function bind<TValue>(source: IBindingCollection<TValue>, bindingType: BindingType): ICollectionBinder<TValue>;
declare function bind<TSourceValue, TTargetValue>(source: IBindingCollection<TSourceValue>, converter: IValueConverter<TSourceValue, TTargetValue>): ICollectionBinder<TTargetValue>;
declare function bind<TSourceValue, TTargetValue>(source: IBindingCollection<TSourceValue>, converter: IValueConverter<TSourceValue, TTargetValue>, bindingType: BindingType): ICollectionBinder<TTargetValue>;
declare module Classical.Binding {
    class Property<TOwner, TValue> implements IBindingProperty<TValue> {
        private _beforeGet;
        private _beforeSet;
        private _owner;
        private _value;
        private _propertyChanged;
        public value : TValue;
        public propertyChanged : IEvent<any, TValue>;
        public owner : any;
        public name : string;
        constructor(owner: TOwner, initialValue?: TValue, beforeGet?: (value: TValue) => TValue, beforeSet?: (value: TValue) => TValue);
        public toString(): string;
    }
    class Binder<TTargetValue> implements IBinder<TTargetValue> {
        private _bindingType;
        public target: IBindingProperty<TTargetValue>;
        public bindingType : BindingType;
        constructor(bindingType: BindingType);
        public bind(): void;
    }
    class PropertyBinder<TSourceValue, TTargetValue> extends Binder<TTargetValue> {
        private _source;
        private _converter;
        public source : IBindingProperty<TSourceValue>;
        public converter : IValueConverter<TSourceValue, TTargetValue>;
        constructor(source: IBindingProperty<TSourceValue>, converter: IValueConverter<TSourceValue, TTargetValue>, bindingType?: BindingType);
        public bind(): void;
        public updateSource(host?: IBindingProperty<TTargetValue>, value?: TTargetValue): void;
        public updateTarget(host?: IBindingProperty<TSourceValue>, value?: TSourceValue): void;
    }
    class ComplexPropertyBinder<TSourceValue, TTargetValue> extends Binder<TTargetValue> {
        constructor(sources: IEnumerable<IBindingProperty<TSourceValue>>, converter: IValueConverter<TSourceValue, TTargetValue>);
    }
    class SimplePropertyBinder<TValue> extends PropertyBinder<TValue, TValue> {
        constructor(source: IBindingProperty<TValue>, bindingType?: BindingType);
    }
    class ObjectBinder<TSourceValue, TTargetValue> extends Binder<TTargetValue> {
        private _source;
        private _sourcePropertyName;
        private _converter;
        public source : INotifyPropertyChanged;
        public sourcePropertyName : string;
        public converter : IValueConverter<TSourceValue, TTargetValue>;
        constructor(source: INotifyPropertyChanged, sourcePropertyName: string, converter: IValueConverter<TSourceValue, TTargetValue>, bindingType?: BindingType);
        public bind(): void;
        public updateSource(host?: IBindingProperty<TTargetValue>, value?: TTargetValue): void;
        public updateTarget(owner?: INotifyPropertyChanged, property?: string): void;
    }
    class SimpleObjectBinder<TValue> extends ObjectBinder<TValue, TValue> {
        constructor(source: INotifyPropertyChanged, sourcePropertyName: string, bindingType?: BindingType);
    }
    class CollectionAction extends Enum<string> {
        constructor(value: string);
        static Add: CollectionAction;
        static Remove: CollectionAction;
    }
    class Collection<T> implements IBindingCollection<T> {
        private items;
        private _binding;
        constructor(items?: IEnumerable<T>);
        public add(item: T): ICollection<T>;
        public addRange(items: IEnumerable<T>): ICollection<T>;
        public remove(item: T): ICollection<T>;
        public removeAt(index: number): ICollection<T>;
        public clear(): ICollection<T>;
        public get(index: number): T;
        public set(index: number, item: T): ICollection<T>;
        public getEnumerator(): IEnumerator<T>;
        public query(): IQueryable<T>;
        public forEach(operation: (item: T) => void): void;
        public array(): T[];
        public count(): number;
        public bindingOff(): void;
        public bindingOn(): void;
        public collectionChanged: IEvent<IBindingCollection<T>, ICollectionChangedArgs<T>>;
    }
    class CollectionBinder<TSourceValue, TTargetValue> implements ICollectionBinder<TTargetValue> {
        private _bindingType;
        private _source;
        private _converter;
        public target: IBindingCollection<TTargetValue>;
        public source : IBindingCollection<TSourceValue>;
        public converter : IValueConverter<TSourceValue, TTargetValue>;
        public bindingType : BindingType;
        constructor(source: IBindingCollection<TSourceValue>, converter?: IValueConverter<TSourceValue, TTargetValue>, bindingType?: BindingType);
        public bind(): void;
        public updateSource(host: IBindingProperty<TTargetValue>, args: ICollectionChangedArgs<TTargetValue>): void;
        public updateTarget(host: IBindingProperty<TSourceValue>, args: ICollectionChangedArgs<TSourceValue>): void;
    }
    function bindProperty<TValue>(source: IBindingProperty<TValue>): IBinder<TValue>;
    function bindProperty<TValue>(source: IBindingProperty<TValue>, bindingType: BindingType): IBinder<TValue>;
    function bindProperty<TSourceValue, TTargetValue>(source: IBindingProperty<TSourceValue>, converter: IValueConverter<TSourceValue, TTargetValue>): IBinder<TTargetValue>;
    function bindProperty<TSourceValue, TTargetValue>(source: IBindingProperty<TSourceValue>, converter: IValueConverter<TSourceValue, TTargetValue>, bindingType: BindingType): IBinder<TTargetValue>;
    function bindObject<TValue>(source: INotifyPropertyChanged, property: string): IBinder<TValue>;
    function bindObject<TValue>(source: INotifyPropertyChanged, property: string, bindingType: BindingType): IBinder<TValue>;
    function bindObject<TSourceValue, TTargetValue>(source: INotifyPropertyChanged, property: string, converter: IValueConverter<TSourceValue, TTargetValue>): IBinder<TTargetValue>;
    function bindObject<TSourceValue, TTargetValue>(source: INotifyPropertyChanged, property: string, converter: IValueConverter<TSourceValue, TTargetValue>, bindingType: BindingType): IBinder<TTargetValue>;
    function bindCollection<TValue>(source: IBindingCollection<TValue>): ICollectionBinder<TValue>;
    function bindCollection<TValue>(source: IBindingCollection<TValue>, bindingType: BindingType): ICollectionBinder<TValue>;
    function bindCollection<TSourceValue, TTargetValue>(source: IBindingCollection<TSourceValue>, converter: IValueConverter<TSourceValue, TTargetValue>): ICollectionBinder<TTargetValue>;
    function bindCollection<TSourceValue, TTargetValue>(source: IBindingCollection<TSourceValue>, converter: IValueConverter<TSourceValue, TTargetValue>, bindingType: BindingType): ICollectionBinder<TTargetValue>;
    function getNullConverter<TValue>(): IValueConverter<TValue, TValue>;
}
declare module Classical.Binding.New {
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
        public has(source: any): boolean;
        public add(source: any): void;
        public transferTo<TUpdate extends Update>(update: TUpdate): TUpdate;
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
        convertBack? (value: TTarget): TSource;
    }
    class Synchronizer<TTargetUpdate extends Update> implements ISynchronizable<TTargetUpdate> {
        private _updateDepth;
        private _updates;
        private _target;
        private _binders;
        private _onUpdateEvent;
        public target : ISynchronizable<TTargetUpdate>;
        public updates : TTargetUpdate[];
        public updateDepth : number;
        constructor(source: ISynchronizable<TTargetUpdate>);
        public hasTarget(target: ISynchronizable<TTargetUpdate>): boolean;
        public hasSource(source: ISynchronizable<any>): boolean;
        public bind(binder: IBinder<TTargetUpdate>): void;
        public bind(binder: IComplexBinder<TTargetUpdate>): void;
        public unbind(source: ISynchronizable<any>): boolean;
        public apply(updates: IEnumerable<TTargetUpdate>): void;
        public observe(registration: (update: TTargetUpdate[], source: any) => void): void;
        public detach(): void;
        public add(update: TTargetUpdate): void;
        public filter(updates: IEnumerable<TTargetUpdate>): TTargetUpdate[];
        public sync(immediate?: boolean): boolean;
        public syncStart(): void;
        private _createComplexBinding(binder);
        private _runUpdates(groupUpdate);
        private _executeUpdates(groupUpdate);
        private _executeOnUpdate(updates);
    }
    class Property<TValue> implements ISynchronizable<PropertyUpdate<TValue>> {
        public updating: boolean;
        private _value;
        private _synchronizer;
        public value : TValue;
        constructor(value?: TValue);
        public toString(): string;
        public hasTarget(target: ISynchronizable<PropertyUpdate<TValue>>): boolean;
        public hasSource(source: ISynchronizable<any>): boolean;
        public bind(source: Property<TValue>): any;
        public bind(sources: ISynchronizable<Update>[], selector: (sources: any[]) => TValue): any;
        public bind(propertyBinder: IPropertyBinder<TValue>): any;
        public bind(binder: IBinder<PropertyUpdate<TValue>>): any;
        public bind(binder: IComplexBinder<PropertyUpdate<TValue>>): void;
        public unbind(partner: ISynchronizable<any>): boolean;
        public observe(registration: (update: PropertyUpdate<TValue>[], source: Property<TValue>) => void): void;
        public apply(updates: IEnumerable<PropertyUpdate<TValue>>): void;
        public detach(): void;
        private _createComplexBinder(sources, selector);
        private _sourceToBinder(source);
        private _propertyBinderToBinder(propertyBinder);
    }
    class ConfirmationProperty<TValue> extends Property<TValue> {
        private _newValue;
        private hasAccepted;
        public value : TValue;
        public newValue : TValue;
        private synchronizer;
        constructor(value?: TValue);
        public apply(updates: IEnumerable<PropertyUpdate<TValue>>): void;
        public accept(): void;
        public reject(): void;
        private _getValue();
        private _setValue(value);
    }
    interface IPropertyBinder<TValue> extends IObject {
        property: Property<any>;
        converter: IConverter<any, TValue>;
    }
    class PropertyUpdate<TValue> extends Update {
        public value: TValue;
        constructor(value: TValue, ...sources: any[]);
    }
}
