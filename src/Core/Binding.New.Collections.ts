
module Classical.Binding.New.Collections {

    //#region Imports

    import u = Classical.Utilities;
    import Assert = Classical.Assert;

    //#endregion Imports

    //#region Collection

    export class Collection<T>
        implements ICollection<T>, ISynchronizable<CollectionUpdate<T>>  {

        //#region IEnumerable Members

        //Enumerates the elements of the sequence, calling the enumerator for each.
        getEnumerator(): IEnumerator<T> {
            return null;
        }

        //Enumerates the sequence
        forEach(operation: (item?: T) => void): void {
            return null;
        }

        //Returns an IEnumerable implementation that is queryable.
        query(): IQueryable<T> {
            return null;
        }

        //Returns a JavaScript array.
        array(): Array<T> {
            return null;
        }

        //Counts the number of elements in a sequence.
        count(): number {
            return null;
        }

        //#endregion IEnumerable Members

        //#region ICollection Members

        //Adds an item to the collection.
        add(item: T): ICollection<T> {
            return null;
        }

        //Adds a sequence of items to the collection.
        addRange(items: IEnumerable<T>): ICollection<T> {
            return null;
        }

        //Removes all instances of the item from the collection.
        remove(item: T): ICollection<T> {
            return null;
        }

        //Removes the element at the specified index.
        removeAt(index: number): ICollection<T> {
            return null;
        }

        //Clears all elements from the collection.
        clear(): ICollection<T> {
            return null;
        }

        //Returns the element at the specified index.
        get(index: number): T {
            return null;
        }

        //Returns the element at the specified index.
        set(index: number, item: T): ICollection<T> {
            return null;
        }

        //#endregion ICollection Members

        //#region ISynchronizable Members

        hasTarget(target: ISynchronizable<CollectionUpdate<T>>): boolean {
            return null;
        }

        hasSource(source: ISynchronizable<any>): boolean {
            return null;
        }

        bind(binder: IBinder<CollectionUpdate<T>>): void;
        bind(binder: IComplexBinder<CollectionUpdate<T>>): void;
        bind(binder: any): void {
            return null;
        }

        unbind(source: ISynchronizable<any>): boolean {
            return null;
        }

        observe(registration: (update: Array<CollectionUpdate<T>>, source: any) => void) {
            return null;
        }

        apply(updates: IEnumerable<CollectionUpdate<T>>): void {
            return null;
        }

        detach(): void {
            return null;
        }


        //#endregion ISynchronizable Members
    }

    //#endregion Collection

    //#region ICollectionBinder

    export interface ICollectionBinder<TValue> extends IObject {
        property: Collection<any>;
        converter: IConverter<any, TValue>;
    }

    //#endregion ICollectionBinder

    //#region CollectionUpdate

    export class CollectionUpdate<T> extends Update {

        //#region Fields

        type: CollectionUpdateType;
        oldValue: T;
        newValue: T;
        index: number;

        //#endregion Fields

        //#region Constructor

        constructor(...sources: Array<any>) {
            super();
            if (sources)
                sources.query().forEach(source => this.add(source));
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