
module Classical.Binding.New.Collections {

    //#region Imports

    import u = Classical.Utilities;
    import Assert = Classical.Assert;

    //#endregion Imports

    //#region Collection

    export class Collection<T>
        implements ICollection<T>, ISynchronizable<CollectionUpdate<T>>  {

        //#region Fields

        private _items: Array<T>;
        private _synchronizer = new Synchronizer<CollectionUpdate<T>>(this);

        //#endregion Fields

        //#region Constructor

        constructor(items?: IEnumerable<T>) {
            if (!items)
                items = [];

            this._items = items.array().slice(0);
        }

        //#endregion Constructor

        //#region IEnumerable Members

        //Enumerates the elements of the sequence, calling the enumerator for each.
        getEnumerator(): IEnumerator<T> {
            return this._items.getEnumerator();
        }

        //Enumerates the sequence
        forEach(operation: (item?: T) => void): void {
            this._items.forEach(operation);
        }

        //Returns an IEnumerable implementation that is queryable.
        query(): IQueryable<T> {
            return this._items.query();
        }

        //Returns a JavaScript array.
        array(): Array<T> {
            return this._items.array();
        }

        //Counts the number of elements in a sequence.
        count(): number {
            return this._items.count();
        }

        //#endregion IEnumerable Members

        //#region ICollection Members

        //Adds an item to the collection.
        add(item: T): ICollection<T> {
            this._items.add(item);
            this._synchronizer.add({
                type: CollectionUpdateType.Add,
                newValue: item
            });

            this._synchronizer.sync();
            return this;
        }

        //Adds a sequence of items to the collection.
        addRange(items: IEnumerable<T>): ICollection<T> {
            items = items || [];
            items.forEach(item => this.add(item));
            return this;
        }

        //Removes all instances of the item from the collection.
        remove(item: T): ICollection<T> {
            this._items.remove(item);
            this._synchronizer.add({
                type: CollectionUpdateType.Remove,
                oldValue: item
            });

            this._synchronizer.sync();
            return this;
        }

        //Removes the element at the specified index.
        removeAt(index: number): ICollection<T> {
            this._items.removeAt(index);
            this._synchronizer.add({
                type: CollectionUpdateType.RemoveAt,
                index: index
            });

            this._synchronizer.sync();
            return this;
        }

        //Clears all elements from the collection.
        clear(): ICollection<T> {
            var items = this._items;
            items.clear();
            while (items.length > 0) {
                items.removeAt(items.length - 1);
            }
            
            return this;
        }

        //Returns the element at the specified index.
        get(index: number): T {
            return this._items[index];
        }

        //Returns the element at the specified index.
        set(index: number, item: T): ICollection<T> {
            this._items.set(index, item);
            this._synchronizer.add({
                newValue: item,
                index: index
            });

            this._synchronizer.sync();
            return this;
        }

        //#endregion ICollection Members

        //#region ISynchronizable Members

        hasTarget(target: ISynchronizable<CollectionUpdate<T>>): boolean {
            return this._synchronizer.hasTarget(target);
        }

        hasSource(source: ISynchronizable<any>): boolean {
            return this._synchronizer.hasSource(source);
        }

        bind(binder: ICollectionBinder<T>): void;
        bind(sources: Array<ISynchronizable<Update>>, selector: (sources: Array<any>) => any);
        bind(binder: IBinder<CollectionUpdate<T>>): void;
        bind(binder: IComplexBinder<CollectionUpdate<T>>): void;
        
        //For overload resolution only.
        bind(arg1: any, arg2?: any) {
            var currentBinder: IBinder<CollectionUpdate<T>>;

            if (u.isArray(arg1)) /*sources*/ {
                var complexBinder = this._createComplexBinder(arg1, arg2);
                return this._synchronizer.bind(complexBinder);
            } else if (arg1.getType && this.getType().isAssignableFrom(arg1.getType())) /*target*/ {
                var source: Collection<T> = arg1;
                currentBinder = this._sourceToBinder(source);
            } else if (arg1.property) /*propertyBinder*/ {
                var propertyBinder: ICollectionBinder<T> = arg1;
                currentBinder = this._collectionBinderToBinder(arg1);
            } else  /*binder*/ {
                currentBinder = arg1;
            }

            this._synchronizer.bind(currentBinder);
        }

        unbind(source: ISynchronizable<any>): boolean {
            return this._synchronizer.unbind(source);
        }

        observe(registration: (update: Array<CollectionUpdate<T>>, source: any) => void) {
            this._synchronizer.observe(registration);
        }

        apply(updates: IEnumerable<CollectionUpdate<T>>): void {
            var synchronizer = this._synchronizer,
                updates = updates || [],
                updateQuery = updates.query();

            this._applyAdd(updateQuery.where(u => u.type === CollectionUpdateType.Add));
            this._applyAdd(updateQuery.where(u => u.type === CollectionUpdateType.Add));
            this._applyAdd(updateQuery.where(u => u.type === CollectionUpdateType.Add));
            this._applyAdd(updateQuery.where(u => u.type === CollectionUpdateType.Add));

            updateQuery.forEach(u => synchronizer.add(u));
            synchronizer.sync();
        }

        detach(): void {
            this._synchronizer.detach();
        }

        //#endregion ISynchronizable Members

        //#region Utilities

        //#region createComplexBinder

        private _createComplexBinder(sources: Array<ISynchronizable<Update>>, selector: (sources: Array<ISynchronizable<Update>>) => T): IComplexBinder<CollectionUpdate<T>> {
            return {
                sources: sources,
                converter: {
                    convert: sources => <any>selector(sources),
                }
            };
        }

        //#endregion createComplexBinder

        //#region sourceToBinder

        private _sourceToBinder(source: Collection<T>): IBinder<CollectionUpdate<T>> {
            return {
                source: source,
                init: () => {
                    this.clear();
                    this._items = source._items.slice(0);
                    this._synchronizer.sync();
                }
            };
        }

        //#endregion sourceToBinder

        //#region collectionBinderToBinder

        private _collectionBinderToBinder(collectionBinder: ICollectionBinder<T>): IBinder<CollectionUpdate<T>> {
            var converter: IConverter<Update, CollectionUpdate<T>> = null,
                valueConverter = collectionBinder.converter;

            converter = {
                convert: sourceUpdate => {
                    return <CollectionUpdate<T>><any>sourceUpdate.transferTo(
                        new CollectionUpdate(collectionBinder.collection));
                }
            };

            if (valueConverter.convertBack) {
                converter.convertBack = targetUpdate => {
                    var value = valueConverter.convertBack(
                        targetUpdate.newValue);
                    return targetUpdate.transferTo(
                        new CollectionUpdate(value));
                }
            }

            return {
                source: collectionBinder.collection,
                converter: converter,
                init: () => {
                    this.clear();
                    collectionBinder.collection.forEach(item => {
                        this.add(item);
                    });
                }
            };
        }

        //#endregion propertyBinderToBinder

        //#region applyAdd

        private _applyAdd(updates: IQueryable<CollectionUpdate<T>>) {
            updates.forEach(update => {
                this.add(update.newValue);
            });
        }

        //#endregion applyAdd

        //#region _applySet

        private applySet(updates: IQueryable<CollectionUpdate<T>>) {
            updates.forEach(update => {
                this.set(update.index, update.newValue);
            });
        }

        //#endregion _applySet

        //#region applyRemove

        private _applyRemove(updates: IQueryable<CollectionUpdate<T>>) {
            updates.forEach(update => {
                this.remove(update.oldValue);
            });
        }

        //#endregion applyRemove

        //#region applyRemoveAt

        private _applyRemoveAt(updates: IQueryable<CollectionUpdate<T>>) {
            updates.forEach(update => {
                this.removeAt(update.index);
            });
        }

        //#endregion applyRemoveAt

        //#endregion Utilities
    }

    //#endregion Collection

    //#region ICollectionBinder

    export interface ICollectionBinder<T> extends IObject {
        collection: Collection<any>;
        converter?: IConverter<any, T>;
    }

    //#endregion ICollectionBinder

    //#region CollectionUpdate

    export class CollectionUpdate<T> extends Update {

        //#region Fields

        type: CollectionUpdateType;
        oldValue: T = null;
        newValue: T = null;
        index: number = null;

        //#endregion Fields

        //#region Constructor

        constructor(...sources: Array<any>) {
            super();
            if (sources)
                sources.query().forEach(source => this.addSource(source));
        }

        //#endregion Constructor

        //#region Methods

        create(type: CollectionUpdateType, oldValue?: T, newValue?: T, index?: number) {
            Assert.isDefined(type, 'A CollectionUpdateType is required');
            this.type = type;
            this.oldValue = oldValue;
            this.newValue = newValue;
            this.index = index;
        }

        //#endregion Methods
    }

    //#endregion CollectionUpdate

    //#region CollectionUpdateType

    export enum CollectionUpdateType { Add, Set, Remove, RemoveAt }

    //#endregion CollectionUpdateType
} 