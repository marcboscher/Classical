
//#region IHashable

//Declares that an object can be used as a key in a Dictionary.
interface IHashable {
    equals(other: any): boolean;
    getHashCode(): number;
}

//#endregion IHashable

//#region IObject

//Theobject definition implemented by all interfaces used by the Core namespace.
interface IObject extends IHashable {

    //Returns True if the object is of the specified type.
    //type, in this context, is the constructor of an object.
    is(type: Function): boolean;

    //Casts the object to the specified type.
    as<TObject>(): TObject;

    //Returns the Type of anobject.
    getType(): Classical.Reflection.Type;
}

//#endregion IObject

//#region Object

//Declares that an Object implements IObject
interface Object extends IObject {
    watch(property: string, handler: (property: string, oldValue: any, newValue: any) => void): void;
}

//#endregion Object

//#region String

//Declares that a String implements IObject
interface String extends IObject { }

//#endregion String

//#region Number

//Declares that a Number implements IObject
interface Number extends IObject { }

//#endregion Number

//#region Boolean

//Declares that a Number implements IObject
interface Boolean extends IObject { }

//#endregion Boolean

module Classical {

    //#region Imports

    import u = Classical.Utilities;
    import c = Classical.Collections;

    //#endregion Imports

    //#region Enum

    //An enum class for arbitrary values.
    //Static properties of this class are meant to contain the values of the enum.
    export class Enum<TValue extends IObject> {
        private _value: TValue;
        get value(): TValue { return this._value; }

        constructor(value: TValue) {
            this._value = value;
        }

        //Returns true if two instances have the same value; False otherwise.
        equals(other: any): boolean {
            if (!other || !other.is || !other.is(this.getType().ctor))
                return false;

            var value = <any>this._value;

            if (value && value.equals)
                return value.equals(other.value);

            other.value === this.value;
        }

        //Returns the hash code of the value.
        getHashCode(): number {
            return this._value.getHashCode();
        }
    }

    //#endregion Enum
}