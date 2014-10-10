
//#region BindingType

class BindingType extends Classical.Enum<string> {
    constructor(value: string) {
        super(value);
    }

    //Denotes that the source is bound to the target.
    static OneWay = new BindingType('OneWay');

    //Denotes that the source and target are bound together.
    static TwoWay = new BindingType('TwoWay');
}

//#endregion BindingType

//#region IBindingProperty

interface IBindingProperty<TValue> extends IObject {

    //Invoked when the value of the property is changed.
    propertyChanged: IEvent<any, TValue>;

    //Gets or sets the value of the property.
    value: TValue;

    //The owner of the property.
    owner: any;
}

//#endregion IBindingProperty

//#region INotifyPropertyChanged

interface INotifyPropertyChanged {

    //An event which is raised when a property value of the host has been changed.
    propertyChanged: IEvent<INotifyPropertyChanged, string>;
}

//#endregion INotifyPropertyChanged

//#region IBindingCollection

interface IBindingCollection<T> extends ICollection<T> {

    //Turns off binding updates.
    bindingOff(): void;

    //Turns on binding updates.
    bindingOn(): void;

    //An event which is raised when a property value of the host has been changed.
    collectionChanged: IEvent<IBindingCollection<T>, ICollectionChangedArgs<T>>;
}

//#endregion IBindingCollection

//#region ICollectionChangedArgs

//Information specified when an observable collection changes state.
interface ICollectionChangedArgs<T>{

    //The type of action that was performed on the collection.
    action: Classical.Binding.CollectionAction;

    //The new item, if one was added; undefined otherwise.
    newItem?: T;

    //The index of the new item, if one was added; underfined otherwise.
    newIndex?: number;

    //The old item, if one was removed; undefined otherise.
    oldItem?: T;

    //The index of the old item, if one was removed; undefined otherise.
    oldIndex?: number;
}

//#endregion ICollectionChangedArgs

//#region IValueConverter

interface IValueConverter<TSourceValue, TTargetValue> {

    //Converts a source value into a target value.
    convert(value: TSourceValue): TTargetValue;

    //Converts a target value into a source value.
    convertBack(value: TTargetValue): TSourceValue;

}

//#endregion IValueConverter

//#region IBinder

interface IBinder<TTargetValue> extends IObject {

    //The target that a source is bound to.
    target: IBindingProperty<TTargetValue>;

    //Binds the source to the target.
    bind(): void;
}

//#endregion IBinder

//#region ICollectionBinder

interface ICollectionBinder<TTargetValue> extends IObject {

    //The target collection that a source collection is bound to.
    target: IBindingCollection<TTargetValue>;

    //Binds the source to the target.
    bind(): void;
}

//#endregion IBinder

//#region bind

function bind<TValue>(
    source: IBindingProperty<TValue>):
    IBinder<TValue>;

function bind<TValue>(
    source: IBindingProperty<TValue>,
    bindingType: BindingType):
    IBinder<TValue>;

function bind<TSourceValue, TTargetValue>(
    source: IBindingProperty<TSourceValue>,
    converter: IValueConverter<TSourceValue, TTargetValue>):
    IBinder<TTargetValue>;

function bind<TSourceValue, TTargetValue>(
    source: IBindingProperty<TSourceValue>,
    converter: IValueConverter<TSourceValue, TTargetValue>,
    bindingType: BindingType):
    IBinder<TTargetValue>;

function bind<TValue>(
    source: INotifyPropertyChanged,
    property: string):
    IBinder<TValue>;

function bind<TValue>(
    source: INotifyPropertyChanged,
    property: string,
    bindingType: BindingType):
    IBinder<TValue>;

function bind<TSourceValue, TTargetValue>(
    source: INotifyPropertyChanged,
    property: string,
    converter: IValueConverter<TSourceValue, TTargetValue>):
    IBinder<TTargetValue>;

function bind<TSourceValue, TTargetValue>(
    source: INotifyPropertyChanged,
    property: string,
    converter: IValueConverter<TSourceValue, TTargetValue>,
    bindingType: BindingType):
    IBinder<TTargetValue>;

function bind<TValue>(
    source: IBindingCollection<TValue>):
    ICollectionBinder<TValue>;

function bind<TValue>(
    source: IBindingCollection<TValue>,
    bindingType: BindingType):
    ICollectionBinder<TValue>;

function bind<TSourceValue, TTargetValue>(
    source: IBindingCollection<TSourceValue>,
    converter: IValueConverter<TSourceValue, TTargetValue>):
    ICollectionBinder<TTargetValue>;

function bind<TSourceValue, TTargetValue>(
    source: IBindingCollection<TSourceValue>,
    converter: IValueConverter<TSourceValue, TTargetValue>,
    bindingType: BindingType):
    ICollectionBinder<TTargetValue>;

/**
* For overload resolution only.
*/
function bind(
    source: any,
    arg2: any = undefined,
    arg3: any = undefined,
    arg4: any = undefined): any {

    Classical.Assert.isDefined(source, 'No source was specified.');
    if (Classical.Utilities.isString(arg2))
        return Classical.Binding.bindObject(source, arg2, arg3, arg4);
    else if (source.collectionChanged)
        return Classical.Binding.bindCollection(source, arg2, arg3);
    else
        return Classical.Binding.bindProperty(source, arg2, arg3);
}

    //#endregion bind

//Classes that enable objects to bind to each other.
module Classical.Binding {

    //#region Imports

    import u = Classical.Utilities;
    import e = Classical.Events;

    //#endregion Imports

    //#region Variables

    var anonymousPropertyName = '<Anonymous>';

    //#endregion Variables

    //#region Property

    //A property of an object that can be observed for changes.
    export class Property<TOwner, TValue>
        implements IBindingProperty<TValue> {

        //#region Fields

        private _beforeGet: (value: TValue) => TValue;
        private _beforeSet: (value: TValue) => TValue;
        private _owner: TOwner;
        private _value: TValue;
        private _propertyChanged: IEvent<any, TValue>;

        //#endregion //Fields

        //#region Properties

        //Returns the value of the property.
        //beforeGet is used to transform the value, if specified.
        get value(): TValue {
            var beforeGet = this._beforeGet;
            if (Utilities.isDefined(this._beforeGet))
                return beforeGet(this._value);

            return this._value;
        }

        //Sets the value of the property.
        //beforeSet is used to transform the value, if specified.
        //If the specified property value is different from the current property value, the propertyChanged event is raised. 
        set value(value: TValue) {
            var beforeSet = this._beforeSet,
                oldValue = this._value;

            if (beforeSet)
                value = beforeSet(value);

            if (!u.areEqual(value, oldValue)) {
                this._value = value;
                this._propertyChanged.execute(value);
            }
        }

        get propertyChanged(): IEvent<any, TValue> {
            return this._propertyChanged;
        }

        //The owner of the property.
        get owner(): any {
            return this._owner;
        }

        //Returns the name of the property on the owner, if one is found; undefined otherwise.
        get name(): string {
            var owner = this._owner;
            for (var property in owner) {
                if (this.equals(owner[property]))
                    return property;
            }

            return undefined;
        }

        //#endregion Properties

        //#region Constructor

        constructor(
            owner: TOwner,
            initialValue: TValue = null,
            beforeGet?: (value: TValue) => TValue,
            beforeSet?: (value: TValue) => TValue) {

            Assert.isDefined(owner);
            this._propertyChanged = new e.Event<any, TValue>(this);

            this._owner = owner;
            this._beforeGet = beforeGet;
            this._beforeSet = beforeSet;
            if (Utilities.isDefined(beforeSet))
                initialValue = beforeSet(initialValue);
            this._value = initialValue;
        }

        //#endregion Constructor

        //#region Methods

        //Returns the name of the property.
        toString(): string {
            return Utilities.coalesce(this.name, anonymousPropertyName);
        }

        //#endregion Methods
    }

    //#endregion Property

    //#region Binder

    //The base class for all data binders.
    export class Binder<TTargetValue>
        implements IBinder<TTargetValue> {

        private _bindingType: BindingType

        //The binding target, generally a property of a view.
        target: IBindingProperty<TTargetValue>;

        //Denotes the directionality of the binding created by the binder.
        get bindingType(): BindingType {
            return this._bindingType;
        }

        constructor(bindingType: BindingType) {
            Assert.isDefined(bindingType);
            this._bindingType = bindingType;
        }

        //Binds the values of the source and target.
        bind() {
            throw Assert.notImplemented();
        }
    }

    //#endregion Binder

    //#region PropertyBinder

    export class PropertyBinder<TSourceValue, TTargetValue>
        extends Binder<TTargetValue> {

        private _source: IBindingProperty<TSourceValue>;
        private _converter: IValueConverter<TSourceValue, TTargetValue>;

        //The source of the binding, generally a property of a model or a view model.
        get source(): IBindingProperty<TSourceValue> {
            return this._source;
        }

        get converter(): IValueConverter<TSourceValue, TTargetValue> {
            return this._converter;
        }

        constructor(
            source: IBindingProperty<TSourceValue>,
            converter: IValueConverter<TSourceValue, TTargetValue>,
            bindingType: BindingType = BindingType.TwoWay) {
                
            super(bindingType);
            Assert.isDefined(source);
            Assert.isDefined(converter);
                
            this._source = source;
            this._converter = converter;
        }
        
        //Binds the values of the source and target.
        bind() {
            var target = this.target;
            Assert.isDefined(target);

            this._source.propertyChanged.subscribe(this.updateTarget.bind(this));
            if (this.bindingType.equals(BindingType.TwoWay))
                target.propertyChanged.subscribe(this.updateSource.bind(this));

            target.value = this.converter.convert(this._source.value);
        }

        updateSource(host?: IBindingProperty<TTargetValue>, value?: TTargetValue): void {
            var converter = this._converter;
            this._source.value = converter.convertBack(value);
        }

        updateTarget(host?: IBindingProperty<TSourceValue>, value?: TSourceValue): void {
            var converter = this._converter;
            this.target.value = this._converter.convert(value);
        }
    }

    //#endregion PropertyBinder

    //#region ComplexPropertyBinder

    export class ComplexPropertyBinder<TSourceValue, TTargetValue>
        extends Binder<TTargetValue> {

        constructor(
            sources: IEnumerable<IBindingProperty<TSourceValue>>,
            converter: IValueConverter<TSourceValue, TTargetValue>) {
            super(BindingType.OneWay);
        }

    }

    //#endregion ComplexPropertyBinder

    //#region SimplePropertyBinder

    export class SimplePropertyBinder<TValue>
        extends PropertyBinder<TValue, TValue> {

        constructor(
            source: IBindingProperty<TValue>,
            bindingType: BindingType = BindingType.TwoWay) {

            super(source, NullValueConverter.instance<TValue>(), bindingType);
        }
    }

    //#endregion SimplePropertyBinder

    //#region ObjectBinder

    export class ObjectBinder<TSourceValue, TTargetValue>
        extends Binder<TTargetValue> {
        
        private _source: INotifyPropertyChanged;
        private _sourcePropertyName: string
        private _converter: IValueConverter<TSourceValue, TTargetValue>;
        
        //The source of the binding, generally a property of a model or a view model.
        get source(): INotifyPropertyChanged {
            return this._source;
        }

        get sourcePropertyName(): string {
            return this._sourcePropertyName;
        }

        get converter(): IValueConverter<TSourceValue, TTargetValue> {
            return this._converter;
        }

        constructor(
            source: INotifyPropertyChanged,
            sourcePropertyName: string,
            converter: IValueConverter<TSourceValue, TTargetValue>,
            bindingType: BindingType = BindingType.TwoWay) {

            super(bindingType);
            Assert.isDefined(source);
            Assert.isDefined(sourcePropertyName);
            Assert.isDefined(converter);

            this._source = source;
            this._sourcePropertyName = sourcePropertyName;
            this._converter = converter;
        }

        //Binds the values of the source and target.
        bind() {
            var target = this.target;
            Assert.isDefined(target);

            this._source.propertyChanged.subscribe(this.updateTarget.bind(this));
            if (this.bindingType.equals(BindingType.TwoWay))
                target.propertyChanged.subscribe(this.updateSource.bind(this));

            target.value =
                this.converter.convert(
                    <TSourceValue>this._source[this._sourcePropertyName]);
        }

        updateSource(host?: IBindingProperty<TTargetValue>, value?: TTargetValue): void {
            var converter = this._converter;
            this._source[this._sourcePropertyName] = converter.convertBack(value);
        }

        updateTarget(owner?: INotifyPropertyChanged, property?: string): void {
            this.target.value = this._converter.convert(<TSourceValue>owner[property]);
        }
    }

    //#endregion ObjectBinder

    //#region SimpleObjectBinder

    export class SimpleObjectBinder<TValue>
        extends ObjectBinder<TValue, TValue> {

        constructor(
            source: INotifyPropertyChanged,
            sourcePropertyName: string,
            bindingType: BindingType = BindingType.TwoWay) {

            super(source, sourcePropertyName, NullValueConverter.instance<TValue>(), bindingType);
        }
    }

    //#endregion SimpleObjectBinder

    //#region NullValueConverter

    //The null IValueConverter implementation, which leaves the value unchanged.
    class NullValueConverter<TValue>
        implements IValueConverter<TValue, TValue> {
        
        //Returns the specified value, unmodified.
        convert(value: TValue): TValue {
            return value;
        }

        //Returns the specified value, unmodified.
        convertBack(value: TValue): TValue {
            return value;
        }

        //Returns the singleton NullValueConverter instance.
        static instance<TValue>(): NullValueConverter<TValue> {
            if (!nullConverterInstance)
                nullConverterInstance = new NullValueConverter<any>();

            return <NullValueConverter<TValue>>nullConverterInstance;
        }
    }

    var nullConverterInstance: NullValueConverter<any>;

    //#endregion NullValueConverter

    //#region CollectionAction

    export class CollectionAction extends Enum<string> {
        constructor(value: string) {
            super(value);
        }

        static Add = new CollectionAction('Add');
        static Remove = new CollectionAction('Remove');
    }

    //#endregion CollectionAction

    //#region Collection

    export class Collection<T>
        implements IBindingCollection<T> {

        //#region Fields

        private items: Array<T> = [];
        private _binding = true;

        //#endregion Fields

        //#region Constructor

        constructor(items?: IEnumerable<T>) {
            this.collectionChanged =
                new Events.Event<
                    IBindingCollection<T>,
                    ICollectionChangedArgs<T>>(this);

            if (items)
                this.items.addRange(items);
        }

        //#endregion Constructor

        //#region ICollection Members

        //Adds an item to the collection.
        add(item: T): ICollection<T> {
            var items = this.items;

            items.add(item);
            if (this._binding) {
                this.collectionChanged.execute({
                    action: CollectionAction.Add,
                    newIndex: items.length - 1,
                    oldIndex: null,
                    newItem: item,
                    oldItem: null
                });
            }

            return this;
        }

        //Adds a sequence of items to the collection.
        addRange(items: IEnumerable<T>): ICollection<T> {
            Assert.isDefined(items);
            forall(items, item => this.add(item));
            return this;
        }

        //Removes all instances of the item from the collection.
        remove(item: T): ICollection<T> {
            this.array
            var items = this.items,
                currentItem: T;

            for (var i = 0, length = items.length; i < length; i++) {
                currentItem = items[i];
                if (u.areEqual(item, currentItem)) {
                    items.splice(i, 1);
                    if (this._binding) {
                        this.collectionChanged.execute({
                            action: CollectionAction.Remove,
                            newIndex: null,
                            oldIndex: i,
                            newItem: null,
                            oldItem: currentItem
                        });
                    }
                    i--;
                    length--;
                }
            }
            return this;
        }

        //Removes the element at the specified index.
        removeAt(index: number): ICollection<T> {
            //return this.bindingRemoveAt(index, true);

            var items = this.items,
                oldItem = items[index];

            this.items.removeAt(index);
            if (this._binding) {
                this.collectionChanged.execute({
                    action: CollectionAction.Remove,
                    newIndex: null,
                    oldIndex: index,
                    newItem: null,
                    oldItem: oldItem
                });
            }

            return this;
        }

        //Clears all elements from the collection.
        clear(): ICollection<T> {
            var items = this.items;
            while (items.length > 0) {
                items.remove(items[0]);
            }
            return this;
        }

        //Returns the element at the specified index.
        get(index: number): T {
            return this.items[index];
        }

        //Sets the item to the specified index, over-writing the item that was in that location.
        set(index: number, item: T): ICollection<T> {
            this.items[index] = item;
            if (this._binding) {
                this.collectionChanged.execute({
                    action: CollectionAction.Add,
                    newIndex: index,
                    oldIndex: null,
                    newItem: item,
                    oldItem: null
                });
            }

            return this;
        }

        //#endregion IICollection Members

        //#region IEnumerable Members

        //Enumerates the elements of the sequence, calling the enumerator for each.
        getEnumerator(): IEnumerator<T> {
            return this.items.getEnumerator();
        }

        //Returns an IEnumerable implementation that is queryable.
        query(): IQueryable<T> {
            return this.items.query();
        }

        //Returns a JavaScript array.
        array(): T[] {
            return this.items.slice(0);
        }

        //Counts the number of elements in a sequence.
        count(): number {
            return this.items.length;
        }

        //#endregion IEnumerable Members

        //#region IBindingCollection Members

        //Turns off binding updates.
        bindingOff(): void {
            this._binding = false;
        }

        //Turns on binding updates.
        bindingOn(): void {
            this._binding = true;
        }

        //An event which is raised when a property value of the host has been changed.
        collectionChanged: IEvent<IBindingCollection<T>, ICollectionChangedArgs<T>>;

        //#endregion IBindingCollection Members
    }

    //#endregion CollectionAction

    //#region CollectionBinder

    //A binder for IBindingCollections.
    export class CollectionBinder<TSourceValue, TTargetValue>
        implements ICollectionBinder<TTargetValue> {

        //#region Fields

        private _bindingType: BindingType
        private _source: IBindingCollection<TSourceValue>;
        private _converter: IValueConverter<TSourceValue, TTargetValue>;

        //The binding target, generally a property of a view.
        target: IBindingCollection<TTargetValue>;

        //#endregion Fields

        //#region Properties

        //The source of the binding, generally a property of a model or a view model.
        get source(): IBindingCollection<TSourceValue> {
            return this._source;
        }

        get converter(): IValueConverter<TSourceValue, TTargetValue> {
            return this._converter;
        }

        //Denotes the directionality of the binding created by the binder.
        get bindingType(): BindingType {
            return this._bindingType;
        }

        //#endregion Properties

        //#region Constructor

        constructor(
            source: IBindingCollection<TSourceValue>,
            converter: IValueConverter<TSourceValue, TTargetValue> = NullValueConverter.instance<any>(),
            bindingType: BindingType = BindingType.TwoWay) {

            Assert.isDefined(source);
            Assert.isDefined(converter);
            Assert.isDefined(bindingType);    

            this._source = source;
            this._converter = converter;
            this._bindingType = bindingType;
        }

        //#endregion Constructor

        //#region Methods

        //Binds the values of the source and target.
        bind() {
            var target = this.target,
                source = this._source,
                converter = this._converter,
                isTwoWay = this.bindingType.equals(BindingType.TwoWay),
                sourceRegistration: any, //TODO Uncomment: (host: IBindingProperty<TSourceValue>, args: ICollectionChangedArgs<TSourceValue>) => void,
                targetRegistration: any; //TODO Uncomment: (host: IBindingProperty<TTargetValue>, args: ICollectionChangedArgs<TTargetValue>) => void;

            Assert.isDefined(target);

            target.clear();
            target.addRange(
                source.query()
                .select(source =>
                    converter.convert(source)));

            sourceRegistration = (host, args) => {
                if (isTwoWay)
                    target.collectionChanged.unsubscribe(targetRegistration);
                this.updateTarget(host, args);
                if (isTwoWay)
                    target.collectionChanged.subscribe(targetRegistration);
            };

            if (isTwoWay) {
                targetRegistration = (host, args) => {
                    source.collectionChanged.unsubscribe(sourceRegistration);
                    this.updateSource(host, args);
                    source.collectionChanged.subscribe(sourceRegistration);
                };
            }

            source.collectionChanged.subscribe(sourceRegistration);
            if (this.bindingType.equals(BindingType.TwoWay)) {
                target.collectionChanged.subscribe(targetRegistration);
            }
        }

        updateSource(host: IBindingProperty<TTargetValue>, args: ICollectionChangedArgs<TTargetValue>): void {
            if (args.action.equals(CollectionAction.Add)) {
                this._source.set(args.newIndex, this.converter.convertBack(args.newItem));
            } else if (args.action.equals(CollectionAction.Remove)) {
                this._source.removeAt(args.oldIndex);
            } else {
                Assert.isInvalid("The CollectionAction was not recognized.");
            }
        }

        updateTarget(host: IBindingProperty<TSourceValue>, args: ICollectionChangedArgs<TSourceValue>): void {
            if (args.action.equals(CollectionAction.Add)) {
                this.target.set(args.newIndex, this.converter.convert(args.newItem));
            } else if (args.action.equals(CollectionAction.Remove)) {
                this.target.removeAt(args.oldIndex);
            } else {
                Assert.isInvalid("The CollectionAction was not recognized.");
            }
        }

        //#endregion Methods
    }

    //#endregion CollectionBinder

    //#region Functions

    //#region bindProperty

    export function bindProperty<TValue>(
        source: IBindingProperty<TValue>):
        IBinder<TValue>;

    export function bindProperty<TValue>(
        source: IBindingProperty<TValue>,
        bindingType: BindingType):
        IBinder<TValue>;

    export function bindProperty<TSourceValue, TTargetValue>(
        source: IBindingProperty<TSourceValue>,
        converter: IValueConverter<TSourceValue, TTargetValue>):
        IBinder<TTargetValue>;

    export function bindProperty<TSourceValue, TTargetValue>(
        source: IBindingProperty<TSourceValue>,
        converter: IValueConverter<TSourceValue, TTargetValue>,
        bindingType: BindingType):
        IBinder<TTargetValue>;

    /**
    * For overload resolution only.
    */
    export function bindProperty(
        source: any,
        converter: any = NullValueConverter.instance<any>(),
        bindingType: any  = BindingType.TwoWay): any {

        if (converter.getType && converter.getType() === bindingTypeType) {
            bindingType = converter;
            converter = NullValueConverter.instance<any>();
        }

        return new PropertyBinder<any, any>(source, converter, bindingType);
    }

    //#endregion bindProperty

    //#region bindOject

    export function bindObject<TValue>(
        source: INotifyPropertyChanged,
        property: string):
        IBinder<TValue>;

    export function bindObject<TValue>(
        source: INotifyPropertyChanged,
        property: string,
        bindingType: BindingType):
        IBinder<TValue>;

    export function bindObject<TSourceValue, TTargetValue>(
        source: INotifyPropertyChanged,
        property: string,
        converter: IValueConverter<TSourceValue, TTargetValue>):
        IBinder<TTargetValue>;

    export function bindObject<TSourceValue, TTargetValue>(
        source: INotifyPropertyChanged,
        property: string,
        converter: IValueConverter<TSourceValue, TTargetValue>,
        bindingType: BindingType):
        IBinder<TTargetValue>;

    /**
    * For overload resolution only.
    */
    export function bindObject(
        source: INotifyPropertyChanged,
        property: string,
        converter: any = NullValueConverter.instance<any>(),
        bindingType: any = BindingType.TwoWay): any {

        if (converter.getType && converter.getType() === bindingTypeType) {
            bindingType = converter;
            converter = NullValueConverter.instance<any>();
        }

        return new ObjectBinder<any, any>(source, property, converter, bindingType);
    }

    //#endregion bindOject

    //#region bindCollection

    export function bindCollection<TValue>(
        source: IBindingCollection<TValue>):
        ICollectionBinder<TValue>;

    export function bindCollection<TValue>(
        source: IBindingCollection<TValue>,
        bindingType: BindingType):
        ICollectionBinder<TValue>;

    export function bindCollection<TSourceValue, TTargetValue>(
        source: IBindingCollection<TSourceValue>,
        converter: IValueConverter<TSourceValue, TTargetValue>):
        ICollectionBinder<TTargetValue>;

    export function bindCollection<TSourceValue, TTargetValue>(
        source: IBindingCollection<TSourceValue>,
        converter: IValueConverter<TSourceValue, TTargetValue>,
        bindingType: BindingType):
        ICollectionBinder<TTargetValue>;

    /**
    * For overload resolution only.
    */
    export function bindCollection(
        source: any,
        converter: any = NullValueConverter.instance<any>(),
        bindingType: any = BindingType.TwoWay): any {

        if (converter.getType && converter.getType() === bindingTypeType) {
            bindingType = converter;
            converter = NullValueConverter.instance<any>();
        }

        return new CollectionBinder<any, any>(source, converter, bindingType);
    }

    //#endregion bindCollection

    //#region getNullConverter

    export function getNullConverter<TValue>(): IValueConverter<TValue, TValue> {
        return NullValueConverter.instance<TValue>();
    }

    //#endregion getNullConverter

    //#endregion Functions

    //#region Variables

    var bindingTypeType = typeOf(BindingType);

    //#endregion Variables
}