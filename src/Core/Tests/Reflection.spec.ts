
module Classical.Reflection.Spec {
    
    //#region Imports

    import c = Classical.Collections;
    import u = Classical.Utilities;

    //#endregion Imports

    describe('Classical', () => {
        describe('Reflection', () => {

            //#region Module

            describe('Module', () => {
                describe('getFunctions', () => {
                    it('should return the functions of the module.', () => {
                        var testType = typeOf(TestModule.TestType);
                        var testModule = testType.module;
                        var functions = testModule.getFunctions();

                        expect(functions.count()).toBe(2);
                        expect(functions.hasAny(f => f.name == 'TestFunction')).toBe(true);
                        expect(functions.hasAny(f => f.name == 'TestParameteredFunction')).toBe(true);
                    });
                });

                describe('getVariables', () => {
                    it('should return the variables of the module.', () => {
                        var testType = typeOf(TestModule.TestType);
                        var testModule = testType.module;
                        var variables = testModule.getVariables();

                        expect(variables.count()).toBe(1);
                        expect(variables.hasAny(f => f.name == 'testVariable')).toBe(true);
                    });
                });
            });

            //#endregion Module

            //#region Type

            describe('Type', () => {

                //#region toString

                describe('toString', () => {
                    it('should return the name of the Type', () => {
                        var obj = {},
                            derived = new DerivedType();

                        expect(obj.getType().toString())
                            .toBe('Object');
                        expect(derived.getType().toString())
                            .toBe('DerivedType');
                    });

                });

                //#endregion toString

                //#region equals

                describe('equals', () => {
                    it('should return True for the types of different instances of the same type', () => {
                        var firsobject = {},
                            seconobject = {},
                            firstDerived = new DerivedType(),
                            secondDerived = new DerivedType();

                        expect(
                            firsobject.getType().equals(
                                seconobject.getType()))
                            .toBe(true);
                        expect(
                            firstDerived.getType().equals(
                                secondDerived.getType()))
                            .toBe(true);
                    });

                    it('should return False for the types of instances of different types', () => {
                        var obj = {},
                            derived = new DerivedType();

                        expect(
                            obj.getType().equals(
                                derived.getType()))
                            .toBe(false);
                    });

                });

                //#endregion equals

                //#region getHashCode

                describe('getHashCode', () => {
                    it('should return the same hash code types of different instances of the same type', () => {
                        var firstObject = {},
                            secondObject = {},
                            firstDerived = new DerivedType(),
                            secondDerived = new DerivedType();

                        expect(firstObject.getType().getHashCode())
                            .toBe(secondObject.getType().getHashCode());
                        expect(firstDerived.getType().getHashCode())
                            .toBe(secondDerived.getType().getHashCode());
                    });

                    it('should return different hash codes for the types of instances of different types', () => {
                        var obj = {},
                            derived = new DerivedType();

                        expect(obj.getType().getHashCode())
                            .not.toBe(derived.getType().getHashCode());
                    });

                });

                //#endregion getHashCode

                //#region base

                describe('base', () => {
                    it('should be the same as the type of a parent Type', () => {
                        var obj = {},
                            derived = new DerivedType();

                        expect(
                            obj.getType().equals(
                                derived.getType().base))
                            .toBe(true);
                    });
                });

                //#endregion base

                //#region module

                describe('module', () => {
                    it('should return the module of the given type.', () => {
                        var r = Classical.Reflection;
                        var objectType = typeOf(Object);
                        var numberType = typeOf(Number);
                        var booleanType = typeOf(Boolean);
                        var enumType = typeOf(Classical.Enum);
                        var methodType = typeOf(r.Method);

                        expect(objectType.module.fullName).toBe('Global');
                        expect(numberType.module.fullName).toBe('Global');
                        expect(booleanType.module.fullName).toBe('Global');
                        expect(enumType.module.fullName).toBe('Classical');
                        expect(methodType.module.fullName).toBe('Classical.Reflection');
                    });
                });

                //#endregion module

                //#region isAssignableTo

                describe('isAssignableTo', () => {
                    it('should return True when comparing a Type with itself.', () => {
                        var type = {}.getType(),
                            derivedType = new DerivedType().getType();

                        expect(type.isAssignableTo(type)).toBe(true);
                        expect(derivedType.isAssignableTo(derivedType)).toBe(true);
                    });

                    it('should return True when comparing anobjects Type with types on its ancestor chain.', () => {
                        var type = {}.getType(),
                            derivedType = new DerivedType().getType(),
                            moreDerivedType = new MoreDerivedType().getType();

                        expect(derivedType.isAssignableTo(type)).toBe(true);
                        expect(moreDerivedType.isAssignableTo(type)).toBe(true);
                        expect(moreDerivedType.isAssignableTo(derivedType)).toBe(true);
                    });
                });

                //#endregion isAssignableFrom

                //#region isAssignableFrom

                describe('isAssignableFrom', () => {
                    it('should return True when comparing a Type with itself.', () => {
                        var type = {}.getType(),
                            derivedType = new DerivedType().getType();

                        expect(type.isAssignableFrom(type)).toBe(true);
                        expect(derivedType.isAssignableFrom(derivedType)).toBe(true);
                    });

                    it('should return True when comparing anobjects Type with types on its predecessor tree.', () => {
                        var type = {}.getType(),
                            derivedType = new DerivedType().getType(),
                            moreDerivedType = new MoreDerivedType().getType();

                        expect(type.isAssignableFrom(derivedType)).toBe(true);
                        expect(type.isAssignableFrom(moreDerivedType)).toBe(true);
                        expect(derivedType.isAssignableFrom(moreDerivedType)).toBe(true);
                    });
                });

                //#endregion isAssignableFrom

                //#region getMembers

                describe('getMembers', () => {
                    it('should return the members of the given type.', () => {
                        var propertyTest = new ReflectionTest(),
                            propertyTestType = propertyTest.getType(),
                            members = propertyTestType.getMembers();

                        expect(members.query().hasAny(p => p.name == 'name')).toBe(true);
                    });
                });

                //#endregion getMembers

                //#region getMember

                describe('getMember', () => {
                    it('should return the specified member of the given type.', () => {
                        var propertyTest = new ReflectionTest(),
                            propertyTestType = propertyTest.getType(),
                            members = propertyTestType.getMembers(),
                            nameMember = propertyTestType.getMember('name');

                        expect(nameMember).toBeDefined();
                        expect(nameMember.name).toBe('name');
                    });
                    it('should return the correct declaring type of the member.', () => {
                        var derivedTest = new DerivedReflectionTest(),
                            derivedTestType = derivedTest.getType(),
                            propertyTestType = typeOf(ReflectionTest),
                            members = derivedTestType.getMembers(),
                            nameMember = derivedTestType.getMember('name'),
                            derivedMember = derivedTestType.getMember('derivedProperty');

                        expect(nameMember.declaringType).toBe(propertyTestType);
                        expect(derivedMember.declaringType).toBe(derivedTestType);
                    });
                });

                //#endregion getMember

                //#region getProperties

                describe('getProperties', () => {
                    it('should return the properties of the given type.', () => {
                        var propertyTest = new ReflectionTest(),
                            propertyTestType = propertyTest.getType(),
                            properties = propertyTestType.getProperties();

                        expect(properties.query().hasAny(p => p.name == 'name')).toBe(true);
                    });
                });

                //#endregion getProperties

                //#region getProperty

                describe('getProperty', () => {
                    it('should return the specified property of the given type.', () => {
                        var propertyTest = new ReflectionTest(),
                            propertyTestType = propertyTest.getType(),
                            properties = propertyTestType.getProperties(),
                            nameProperty = propertyTestType.getProperty('name');

                        expect(nameProperty).toBeDefined();
                        expect(nameProperty.name).toBe('name');

                    });
                    it('should return if the property can be get and set correctly.', () => {
                        var propertyTest = new ReflectionTest(),
                            propertyTestType = propertyTest.getType(),
                            properties = propertyTestType.getProperties(),
                            nameProperty = propertyTestType.getProperty('name'),
                            getSetProperty = propertyTestType.getProperty('getSetProperty'),
                            setProperty = propertyTestType.getProperty('setProperty');

                        expect(nameProperty).toBeDefined();
                        expect(nameProperty.name).toBe('name');
                        expect(nameProperty.canRead).toBe(true);
                        expect(nameProperty.canWrite).toBe(false);

                        expect(getSetProperty).toBeDefined();
                        expect(getSetProperty.name).toBe('getSetProperty');
                        expect(getSetProperty.canRead).toBe(true);
                        expect(getSetProperty.canWrite).toBe(true);

                        expect(setProperty).toBeDefined();
                        expect(setProperty.name).toBe('setProperty');
                        expect(setProperty.canRead).toBe(false);
                        expect(setProperty.canWrite).toBe(true);
                    });
                    it('should return null if the specified property does not exist.', () => {
                        var propertyTest = new ReflectionTest(),
                            propertyTestType = propertyTest.getType(),
                            properties = propertyTestType.getProperties(),
                            property = propertyTestType.getProperty('doesNotExist');

                        expect(u.isDefined(property)).toBe(false);
                    });
                    it('should return the same instance of Property when the same property is gotten from two different types of the same hierarchy.', () => {
                        var baseType = typeOf(BaseType);
                        var derivedType = typeOf(DerivedBaseType);
                        var secondDerivedType = typeOf(SecondDerivedType);

                        var baseProperty = baseType.getProperty('BaseProperty');
                        var derivedBaseProperty = derivedType.getProperty('BaseProperty');
                        var secondDerivedBaseProperty = secondDerivedType.getProperty('BaseProperty');

                        expect(baseProperty === derivedBaseProperty).toEqual(true);
                        expect(baseProperty === secondDerivedBaseProperty).toEqual(true);
                        expect(derivedBaseProperty === secondDerivedBaseProperty).toEqual(true);
                    });
                });

                //#endregion getProperty

                //#region getMethods

                describe('getMethods', () => {
                    it('should return the methods of the given type.', () => {
                        var reflectionTest = new ReflectionTest(),
                            reflectionTestType = reflectionTest.getType(),
                            methods = reflectionTestType.getMethods();

                        expect(methods.query().hasAny(p => p.name == 'returnNumber')).toBe(true);
                    });
                    it('should return public and private methods correctly.', () => {
                        var reflectionTest = new ReflectionTest(),
                            reflectionTestType = reflectionTest.getType(),
                            privateMethods = reflectionTestType.getMethods(Modifier.NonPublic),
                            publicMethods = reflectionTestType.getMethods(Modifier.Public);

                        expect(privateMethods.hasAny(m => m.name === '_firstPrivateMethod')).toBe(true);
                        expect(privateMethods.hasAny(m => m.name === '_secondPrivateMethod')).toBe(true);
                        expect(publicMethods.hasAny(m => m.name === 'returnNumber')).toBe(true);
                        expect(publicMethods.hasAny(m => m.name === 'returnParameter')).toBe(true);
                        
                    });
                });

                //#endregion getMethods

                //#region getMethod

                describe('getMethod', () => {
                    it('should return the specified method of the given type.', () => {
                        var reflectionTest = new ReflectionTest(),
                            reflectionTestType = reflectionTest.getType(),
                            method = reflectionTestType.getMethod('returnNumber');

                        expect(method).toBeDefined();
                        expect(method.name).toBe('returnNumber');
                    });
                });

                //#endregion getMethod
            });

            //#endregion Type

            //#region Property

            describe('Property', () => {

                //#region declaringType

                describe('declaringType', () => {
                    it('should return the declaring type of the property.', () => {
                        var baseType = typeOf(BaseType);
                        var derivedType = typeOf(DerivedBaseType);
                        var secondDerivedType = typeOf(SecondDerivedType);

                        var overriddenProperty = derivedType.getProperty('OverriddenProperty');
                        var secondOverriddenProperty = secondDerivedType.getProperty('SecondOverriddenProperty');
                        var overriddenDerivedProperty = secondDerivedType.getProperty('OverriddenDerivedProperty');
                        var derivedProperty = derivedType.getProperty('DerivedProperty');
                        var baseProperty = derivedType.getProperty('BaseProperty');

                        expect(baseProperty.declaringType).toBe(baseType);
                        expect(overriddenProperty.declaringType).toBe(baseType);
                        expect(secondOverriddenProperty.declaringType).toBe(baseType);
                        expect(overriddenDerivedProperty.declaringType).toBe(derivedType);
                        expect(derivedProperty.declaringType).toBe(derivedType);
                    });
                });

                //#endregion declaringType

                //#region isMethod

                describe('isMethod', () => {
                    it('should return a boolean result describing if the property is a method or not.', () => {
                        var baseType = typeOf(BaseType);
                        var derivedType = typeOf(DerivedBaseType);

                        var overriddenProperty = derivedType.getProperty('OverriddenProperty');
                        var baseMethod = baseType.getMethod('BaseMethod');

                        expect(overriddenProperty.isMethod).toBe(false);
                        expect(baseMethod.isMethod).toBe(true);
                    });
                });

                //#endregion isMethod

                //#region getValue

                describe('getValue', () => {
                    it('should get the value of the provided property.', () => {
                        var propertyTestInstance = new ReflectionTest(),
                            propertyTestType = propertyTestInstance.getType(),
                            derivedType = typeOf(DerivedReflectionTest),
                            firstNameProperty = propertyTestType.getProperty('getSetProperty'),
                            derivedProperty = derivedType.getProperty('derivedProperty');

                        propertyTestInstance.getSetProperty = 'Chris';

                        var value = firstNameProperty.getValue(propertyTestInstance);

                        expect(value).toBe(propertyTestInstance.getSetProperty);

                        try {
                            derivedProperty.getValue(propertyTestInstance);
                            throw 'the property cannot be gotten if it does not exist on the current type.';
                        }
                        catch (error) {
                        }
                    });
                    it('should get the value of the provided property, calling the correct overridden version given the specified type of the instance.', () => {
                        var baseType = typeOf(BaseType);
                        var derivedType = typeOf(DerivedBaseType);
                        var secondDerivedType = typeOf(SecondDerivedType);

                        var overriddenProperty = derivedType.getProperty('OverriddenProperty');
                        var secondOverriddenProperty = secondDerivedType.getProperty('SecondOverriddenProperty');
                        var overriddenDerivedProperty = secondDerivedType.getProperty('OverriddenDerivedProperty');
                        var derivedProperty = derivedType.getProperty('DerivedProperty');
                        var baseProperty = derivedType.getProperty('BaseProperty');

                        var baseInstance = new BaseType();
                        var derivedInstance = new DerivedBaseType();
                        var secondDerivedInstance = new SecondDerivedType();

                        expect(baseProperty.getValue(derivedInstance)).toBe(baseInstance.BaseProperty);
                        expect(baseProperty.getValue(secondDerivedInstance)).toBe(baseInstance.BaseProperty);

                        expect(overriddenProperty.getValue(baseInstance)).toBe(baseInstance.OverriddenProperty);
                        expect(overriddenProperty.getValue(derivedInstance)).toBe(derivedInstance.OverriddenProperty);

                        expect(secondOverriddenProperty.getValue(baseInstance)).toBe(baseInstance.SecondOverriddenProperty);
                        expect(secondOverriddenProperty.getValue(secondDerivedInstance)).toBe(secondDerivedInstance.SecondOverriddenProperty);
                    });
                });

                //#endregion getValue

                //#region setValue

                describe('setValue', () => {
                    it('should set the value of the provided property.', () => {
                        var propertyTestInstance = new ReflectionTest(),
                            propertyTestType = propertyTestInstance.getType(),
                            derivedType = typeOf(DerivedReflectionTest),
                            firstNameProperty = propertyTestType.getProperty('getSetProperty'),
                            derivedProperty = derivedType.getProperty('derivedProperty');

                        var changedValue = 'Chris';

                        firstNameProperty.setValue(propertyTestInstance, changedValue);

                        expect(propertyTestInstance.getSetProperty).toBe(changedValue);

                        try {
                            derivedProperty.setValue(propertyTestInstance, 'Christopher')

                        throw 'the property cannot be set if it does not exist on the current type.';
                        }
                        catch (error) {
                        }
                    });
                    it('should set the value of the provided property, calling the correct overridden version given the specified type of the instance.', () => {
                        var baseType = typeOf(BaseType);
                        var derivedType = typeOf(DerivedBaseType);
                        var secondDerivedType = typeOf(SecondDerivedType);

                        var baseSetterProperty = derivedType.getProperty('BaseSetter');

                        var baseInstance = new BaseType();
                        var derivedInstance = new DerivedBaseType();
                        var secondDerivedInstance = new SecondDerivedType();
                        var valueToSet = 6;

                        baseSetterProperty.setValue(baseInstance, valueToSet);
                        expect(baseInstance.secretNumber).toBe(valueToSet);

                        baseSetterProperty.setValue(derivedInstance, valueToSet);
                        expect(derivedInstance.secretNumber).toBe(valueToSet + 1);

                        baseSetterProperty.setValue(secondDerivedInstance, valueToSet);
                        expect(secondDerivedInstance.secretNumber).toBe(valueToSet + 2);
                    });
                });

                //#endregion setValue
            });

            //#endregion Property

            //#region Method

            describe('Method', () => {
                describe('invoke', () => {
                    it('should invoke the specified method, returning the correct value.', () => {
                        var reflectionTest = new ReflectionTest(),
                            reflectionTestType = reflectionTest.getType(),
                            method = reflectionTestType.getMethod('returnNumber');

                        var result = method.invoke(reflectionTest);

                        expect(result).toBe(reflectionTest.returnNumber());
                    });
                    it('should invoke the specified method with parameters, returning the correct value.', () => {
                        var reflectionTest = new ReflectionTest(),
                            reflectionTestType = reflectionTest.getType(),
                            method = reflectionTestType.getMethod('returnParameter');

                        var parameterValue = 'TestParameter';
                        var result = method.invoke(reflectionTest, parameterValue);

                        expect(result).toBe(reflectionTest.returnParameter(parameterValue));

                        parameterValue = 'SecondTestParameter';
                        result = method.invoke(reflectionTest, parameterValue);

                        expect(result).toBe(reflectionTest.returnParameter(parameterValue));
                    });
                });
                describe('getParameters', () => {
                    it('should return the correct number of parameters in the correct position.', () => {
                        var testType = typeOf(TestModule.TestType);
                        var testModule = testType.module;
                        var functions = testModule.getFunctions();
                        var parameteredFunction = functions.single(f => f.name === 'TestParameteredFunction');
                        var parameters = parameteredFunction.getParameters().array();

                        expect(parameters.length).toBe(2);

                        var firstParameter = parameters[0];
                        var secondParameter = parameters[1];

                        expect(firstParameter.name).toBe('first');
                        expect(firstParameter.position).toBe(0);
                        expect(secondParameter.name).toBe('second');
                        expect(secondParameter.position).toBe(1);
                    });
                });
            });

            //#endregion Method
        })
    });

    //#region Test Classes

    class SameByType {
        equals(other: any): boolean {
            if (Classical.Utilities.isNullOrUndefined(other) || !other.getType)
                return false;

            return this.is(other.getType().ctor);
        }
    }

    class DifferentType { }

    class Test { }

    class ReflectionTest {
        private _name: string;
        private _getSetProperty: string;
        private _setProperty: string;

        public get name(): string {
            return this._name;
        }

        public get getSetProperty(): string {
            return this._getSetProperty;
        }

        public set getSetProperty(value: string) {
            this._getSetProperty = value;
        }

        public set setProperty(value: string) {
            this._setProperty = value;
        }

        returnNumber(): number {
            return 42;
        }

        returnParameter(something: string): string {
            return something;
        }

        private _firstPrivateMethod(): void {
        }

        private _secondPrivateMethod(): void {
        }
    }

    class DerivedReflectionTest extends ReflectionTest {
        private _derivedProperty: string

        public get derivedProperty(): string {
            return this._derivedProperty;
        }
    }

    class DerivedType { }

    class MoreDerivedType extends DerivedType { }

    class BaseType {

        public secretNumber = 5;

        public get OverriddenProperty(): string {
            return 'Hello';
        }

        public get SecondOverriddenProperty(): string {
            return 'Hello';
        }

        public get BaseProperty(): string {
            return 'SomethingElse';
        }

        public set BaseSetter(value: number) {
            this.secretNumber = value;
        }

        BaseMethod(): void {
        }
    }

    class DerivedBaseType extends BaseType {
        public get OverriddenProperty(): string {
            return 'Bye';
        }

        public get OverriddenDerivedProperty(): string {
            return 'OverriddenDerivedProperty';
        }

        public get DerivedProperty(): string {
            return 'DerivedProperty';
        }

        public set BaseSetter(value: number) {
            this.secretNumber = value + 1;
        }
    }

    class SecondDerivedType extends DerivedBaseType {
        public get OverriddenDerivedProperty(): string {
            return 'OverriddenDerivedProperty2';
        }

        public get SecondOverriddenProperty(): string {
            return 'Hello3';
        }

        public set BaseSetter(value: number) {
            this.secretNumber = value + 2;
        }
    }

    //#endregion Test Classes

    //#region Test Modules

    export module TestModule {
        export class TestType {
            get testProp(): number {
                return 42;
            }
        }

        export function TestFunction() {

        }

        export function TestParameteredFunction(first: string, second: number) {
        }

        export var testVariable: string = 'This is a test';
    }

    //#endregion Test Modules

}