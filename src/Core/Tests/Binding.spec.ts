
module Classical.Binding.Spec {

    //#region Variables

    var nullConverter = getNullConverter<number>();

    //#endregion Variables

    describe('Classical', () => {
        describe('Binding', () => {

            //#region Property

            describe('Property', () => {

                //#region value

                describe('value', () => {
                    it('should return the value of the property', () => {
                        var property = new Property<any, number>({}, 1);
                        expect(property.value).toBe(1);
                    });
                    it('should call the specified getter', () => {
                        var property = new Property<any, number>({}, 1, value => value + 1);
                        expect(property.value).toBe(2);
                    });
                    it('should call the specified setter', () => {
                        var property = new Property<any, number>({}, 0, null, value => value + 1);
                        property.value = 1;

                        expect(property.value).toBe(2);
                    });
                    it('should call propertyChanged when the value is changed', () => {
                        var property = new Property<any, number>({}, 1),
                            changed = false,
                            newValue: number;

                        property.propertyChanged.subscribe((host?, value?) => {
                            changed = true;
                            newValue = value;
                        });

                        property.value = 2;
                        expect(changed).toBe(true);
                        expect(newValue).toBe(2);
                    });
                    it('should not call propertyChanged when the value remains the same', () => {
                        var property = new Property<any, number>({}, 1),
                            changed = false;

                        property.propertyChanged.subscribe((host?, value?) => {
                            changed = true;
                        });

                        property.value = 1;
                        expect(changed).toBe(false);
                    });
                });

                //#endregion value

                //#region name

                describe('name', () => {
                    it('should return the name of the property on the owner', () => {
                        var owner: any = {};
                        owner.property = new Property<any, number>(owner, 1);
                        expect(owner.property.name).toBe('property');
                    });
                    it('should be undefined when the property cannot be found on the owner.', () => {
                        var owner = {},
                            property = new Property<any, number>(owner, 1);

                        expect(property.name).toBe(undefined);
                    });
                });

                //#endregion name
            });

            //#endregion Property

            //#region PropertyBinder

            describe('PropertyBinder', () => {

                //#region bind

                describe('bind', () => {
                    it('should update the target when the source is bound one way and changes', () => {
                        var source = new Property<any, number>({}, 1);
                        var target = new Property<any, number>({}, source.value);
                        var binder = new PropertyBinder<number, number>(source, nullConverter, BindingType.OneWay);

                        binder.target = target;
                        binder.bind();

                        source.value = 2;
                        expect(target.value).toBe(2);
                    });
                    it('should update the target when the source is bound two way and changes', () => {
                        var source = new Property<any, number>({}, 1);
                        var target = new Property<any, number>({}, source.value);
                        var binder = new PropertyBinder<number, number>(source, nullConverter, BindingType.TwoWay);

                        binder.target = target;
                        binder.bind();

                        source.value = 2;
                        expect(target.value).toBe(2);
                    });
                    it('should update the source when the target is bound two way and changes', () => {
                        var source = new Property<any, number>({}, 1);
                        var target = new Property<any, number>({}, source.value);
                        var binder = new PropertyBinder<number, number>(source, nullConverter, BindingType.TwoWay);

                        binder.target = target;
                        binder.bind();

                        target.value = 2;
                        expect(source.value).toBe(2);
                    });
                    it('should use the converter to convert from the source to the target', () => {
                        var source = new Property<any, number>({}, 1);
                        var target = new Property<any, string>({}, source.value.toString());
                        var binder = new PropertyBinder<number, string>(source, {
                            convert: value => value.toString(),
                            convertBack: value => +value
                        }, BindingType.TwoWay);

                        binder.target = target;
                        binder.bind();

                        source.value = 2;
                        expect(target.value).toBe('2');
                    });
                    it('should use the converter to convert from the target to the source', () => {
                        var source = new Property<any, number>({}, 1);
                        var target = new Property<any, string>({}, source.value.toString());
                        var binder = new PropertyBinder<number, string>(source, {
                            convert: value => value.toString(),
                            convertBack: value => +value
                        }, BindingType.TwoWay);

                        binder.target = target;
                        binder.bind();

                        target.value = '2';
                        expect(source.value).toBe(2);
                    });
                });

                //#endregion bind
            });

            //#endregion PropertyBinder

            //#region SimplePropertyBinder

            describe('SimplePropertyBinder', () => {

                //#region bind

                describe('bind', () => {
                    it('should update the target when the source is bound one way and changes', () => {
                        var source = new Property<any, number>({}, 1);
                        var target = new Property<any, number>({}, source.value);
                        var binder = new SimplePropertyBinder<number>(source, BindingType.OneWay);

                        binder.target = target;
                        binder.bind();

                        source.value = 2;
                        expect(target.value).toBe(2);
                    });
                    it('should update the target when the source is bound two way and changes', () => {
                        var source = new Property<any, number>({}, 1);
                        var target = new Property<any, number>({}, source.value);
                        var binder = new SimplePropertyBinder<number>(source, BindingType.TwoWay);

                        binder.target = target;
                        binder.bind();

                        source.value = 2;
                        expect(target.value).toBe(2);
                    });
                    it('should update the source when the target is bound two way and changes', () => {
                        var source = new Property<any, number>({}, 1);
                        var target = new Property<any, number>({}, source.value);
                        var binder = new SimplePropertyBinder<number>(source, BindingType.TwoWay);

                        binder.target = target;
                        binder.bind();

                        target.value = 2;
                        expect(source.value).toBe(2);
                    });
                });

                //#endregion bind
            });

            //#endregion SimplePropertyBinder

            //#region ObjectBinder

            describe('ObjectBinder', () => {

                //#region bind

                describe('bind', () => {
                    it('should update the target when the source is bound one way and changes', () => {
                        var source = new Notifier();
                        var target = new Property<any, number>({}, source.property);
                        var binder = new ObjectBinder<number, number>(source, 'property', nullConverter, BindingType.OneWay);

                        binder.target = target;
                        binder.bind();

                        source.property = 2;
                        expect(target.value).toBe(2);
                    });
                    it('should update the target when the source is bound two way and changes', () => {
                        var source = new Notifier();
                        var target = new Property<any, number>({}, source.property);
                        var binder = new ObjectBinder<number, number>(source, 'property', nullConverter, BindingType.TwoWay);

                        binder.target = target;
                        binder.bind();

                        source.property = 2;
                        expect(target.value).toBe(2);
                    });
                    it('should update the source when the target is bound two way and changes', () => {
                        var source = new Notifier();
                        var target = new Property<any, number>({}, source.property);
                        var binder = new ObjectBinder<number, number>(source, 'property', nullConverter, BindingType.TwoWay);

                        binder.target = target;
                        binder.bind();

                        target.value = 2;
                        expect(source.property).toBe(2);
                    });
                    it('should use the converter to convert from the source to the target', () => {
                        var source = new Notifier();
                        var target = new Property<any, string>({}, source.property.toString());
                        var binder = new ObjectBinder<number, string>(source, 'property', {
                            convert: value => value.toString(),
                            convertBack: value => +value
                        }, BindingType.TwoWay);

                        binder.target = target;
                        binder.bind();

                        source.property = 2;
                        expect(target.value).toBe('2');
                    });
                    it('should use the converter to convert from the target to the source', () => {
                        var source = new Notifier();
                        var target = new Property<any, string>({}, source.property.toString());
                        var binder = new ObjectBinder<number, string>(source, 'property', {
                            convert: value => value.toString(),
                            convertBack: value => +value
                        }, BindingType.TwoWay);

                        binder.target = target;
                        binder.bind();

                        target.value = '2';
                        expect(source.property).toBe(2);
                    });
                });

                //#endregion bind
            });

            //#endregion ObjectBinder

            //#region SimpleObjectBinder

            describe('SimpleObjectBinder', () => {

                //#region bind

                describe('bind', () => {
                    it('should update the target when the source is bound one way and changes', () => {
                        var source = new Notifier();
                        var target = new Property<any, number>({}, source.property);
                        var binder = new SimpleObjectBinder<number>(source, 'property', BindingType.OneWay);

                        binder.target = target;
                        binder.bind();

                        source.property = 2;
                        expect(target.value).toBe(2);
                    });
                    it('should update the target when the source is bound two way and changes', () => {
                        var source = new Notifier();
                        var target = new Property<any, number>({}, source.property);
                        var binder = new SimpleObjectBinder<number>(source, 'property', BindingType.TwoWay);

                        binder.target = target;
                        binder.bind();

                        source.property = 2;
                        expect(target.value).toBe(2);
                    });
                    it('should update the source when the target is bound two way and changes', () => {
                        var source = new Notifier();
                        var target = new Property<any, number>({}, source.property);
                        var binder = new SimpleObjectBinder<number>(source, 'property', BindingType.TwoWay);

                        binder.target = target;
                        binder.bind();

                        target.value = 2;
                        expect(source.property).toBe(2);
                    });
                });

                //#endregion bind
            });

            //#endregion SimpleObjectBinder

            //#region Collection

            describe('Collection', () => {

                //#region add

                describe('add', () => {
                    it('should add an element to the end of an collection', () => {
                        var collection = new Collection<number>([]);
                        collection.add(0).add(1);

                        expect(collection.count()).toBe(2);
                        expect(collection.get(0)).toBe(0);
                        expect(collection.get(1)).toBe(1);
                    });
                    it('should notify that an element has been added', () => {
                        var collection = new Collection<number>([]),
                            newItem = null,
                            newIndex = null;

                        collection.collectionChanged.subscribe((c, args) => {
                            expect(args.action).toBe(CollectionAction.Add);
                            newItem = args.newItem;
                            newIndex = args.newIndex;
                        });

                        collection.add(0);
                        expect(newItem).toBe(collection.get(0));
                        expect(newIndex).toBe(0);

                        collection.add(1);
                        expect(newItem).toBe(collection.get(1));
                        expect(newIndex).toBe(1);
                    });
                } );

                //#endregion add

                //#region addRange

                describe('addRange', () => {
                    it('should add a sequence of elements to the end of a collection', () => {
                        var collection = new Collection<number>([]);
                        collection.addRange([0, 1]);

                        expect(collection.count()).toBe(2);
                        expect(collection.get(0)).toBe(0);
                        expect(collection.get(1)).toBe(1);
                    });

                } );

                //#endregion add

                //#region remove

                describe('remove', () => {
                    it('should remove all elements in the collection that match the specified element', () => {
                        var collection = new Collection([0, 2, 1, 2]);
                        collection.remove(2);

                        expect(collection.count()).toBe(2);
                        expect(collection.get(0)).toBe(0);
                        expect(collection.get(1)).toBe(1);
                    });
                    it('should not remove any elements when the element is not found in the collection', () => {
                        var collection = new Collection([0, 1]);
                        collection.remove(3);

                        expect(collection.count()).toBe(2);
                        expect(collection.get(0)).toBe(0);
                        expect(collection.get(1)).toBe(1);
                    });
                    it('should notify that an element has been removed', () => {
                        var collection = new Collection<number>([1, 2]),
                            oldItem = null,
                            oldIndex = null;

                        collection.collectionChanged.subscribe((c, args) => {
                            expect(args.action).toBe(CollectionAction.Remove);
                            oldItem = args.oldItem;
                            oldIndex = args.oldIndex;
                        });

                        collection.remove(2);
                        expect(oldItem).toBe(2);
                        expect(oldIndex).toBe(1);

                        collection.remove(1);
                        expect(oldItem).toBe(1);
                        expect(oldIndex).toBe(0);
                    });
                });

                //#endregion remove

                //#region removeAt

                describe('removeAt', () => {
                    it('should remove the element at the specified index', () => {
                        var collection = new Collection([0, 5, 1]);
                        collection.removeAt(1);

                        expect(collection.count()).toBe(2);
                        expect(collection.get(0)).toBe(0);
                        expect(collection.get(1)).toBe(1);
                    });
                    it('should throw an exception when the index is out of bounds', () => {
                        var collection = new Collection([0, 1]);
                        expect(() => collection.removeAt(-1)).toThrow();
                        expect(() => collection.removeAt(3)).toThrow();
                    });
                    it('should notify that an element has been removed', () => {
                        var collection = new Collection<number>([0, 5, 1]),
                            oldItem = null,
                            oldIndex = null;

                        collection.collectionChanged.subscribe((c, args) => {
                            expect(args.action).toBe(CollectionAction.Remove);
                            oldItem = args.oldItem;
                            oldIndex = args.oldIndex;
                        });

                        collection.removeAt(1);
                        expect(oldItem).toBe(5);
                        expect(oldIndex).toBe(1);

                        collection.removeAt(0);
                        expect(oldItem).toBe(0);
                        expect(oldIndex).toBe(0);
                    });
                });

                //#endregion removeAt

                //#region clear

                describe('clear', () => {
                    it('should remove all elements from the collection', () => {
                        var collection = new Collection([0, 1, 2]);
                        collection.clear();

                        expect(collection.count()).toBe(0);
                    });
                });

                //#endregion clear

                //#region get

                describe('get', () => {
                    it('should get the element from the specified index', () => {
                        var collection = new Collection([0, 1, 2]);

                        expect(collection.get(0)).toBe(0);
                        expect(collection.get(1)).toBe(1);
                        expect(collection.get(2)).toBe(2);
                    });
                });

                //#endregion get

                //#region set

                describe('set', () => {
                    it('should set the element at the specified index to the specified value', () => {
                        var collection = new Collection([0, 1, 2]);
                        collection
                            .set(0, 2)
                            .set(1, 1)
                            .set(2, 0);

                        expect(collection.get(0)).toBe(2);
                        expect(collection.get(1)).toBe(1);
                        expect(collection.get(2)).toBe(0);
                    });
                });

                //#endregion get

                //#region bindingOff

                describe('bindingOff', () => {
                    it('should prevent updates.', () => {
                        var collection: Collection<number>,
                            wasCalled: boolean;

                        collection = new Collection<number>();
                        collection.collectionChanged.subscribe(() => {
                            wasCalled = true;
                        });

                        wasCalled = false;
                        collection.set(0, 1);
                        expect(wasCalled).toBe(true);

                        wasCalled = false;
                        collection.add(2);
                        expect(wasCalled).toBe(true);

                        wasCalled = false;
                        collection.remove(2);
                        expect(wasCalled).toBe(true);

                        wasCalled = false;
                        collection.removeAt(0);
                        expect(wasCalled).toBe(true);

                        collection.clear();
                        collection.bindingOff();

                        wasCalled = false;
                        collection.set(0, 1);
                        expect(wasCalled).toBe(false);

                        wasCalled = false;
                        collection.add(2);
                        expect(wasCalled).toBe(false);

                        wasCalled = false;
                        collection.remove(2);
                        expect(wasCalled).toBe(false);

                        wasCalled = false;
                        collection.removeAt(0);
                        expect(wasCalled).toBe(false);
                    });
                });

                //#endregion bindingOff

                //#region bindingOn

                describe('bindingOn', () => {
                    it('should enable updates.', () => {
                        var collection: Collection<number>,
                            wasCalled: boolean;

                        collection = new Collection<number>();
                        collection.collectionChanged.subscribe(() => {
                            wasCalled = true;
                        });

                        collection.bindingOff();

                        wasCalled = false;
                        collection.set(0, 1);
                        expect(wasCalled).toBe(false);

                        wasCalled = false;
                        collection.add(2);
                        expect(wasCalled).toBe(false);

                        wasCalled = false;
                        collection.remove(2);
                        expect(wasCalled).toBe(false);

                        wasCalled = false;
                        collection.removeAt(0);
                        expect(wasCalled).toBe(false);


                        collection.clear();
                        collection.bindingOn();

                        wasCalled = false;
                        collection.set(0, 1);
                        expect(wasCalled).toBe(true);

                        wasCalled = false;
                        collection.add(2);
                        expect(wasCalled).toBe(true);

                        wasCalled = false;
                        collection.remove(2);
                        expect(wasCalled).toBe(true);

                        wasCalled = false;
                        collection.removeAt(0);
                        expect(wasCalled).toBe(true);
                    });
                });

                //#endregion bindingOn
            });

            //#endregion Collection

            //#region CollectionBinder

            describe('CollectionBinder', () => {

                //#region bind

                describe('bind', () => {
                    it('should update the target when the source is bound one way and an element is added', () => {
                        var source = new Collection([1, 2, 3]),
                            target = new Collection([1, 2, 3]),
                            binder = new CollectionBinder(source, nullConverter, BindingType.OneWay);

                        binder.target = target;
                        binder.bind();

                        source.add(4);
                        expect(target.count()).toBe(source.count());
                        expect(target.get(3)).toBe(source.get(3));
                    });
                    it('should update the target when the source is bound one way and an element is removed', () => {
                        var source = new Collection([1, 2, 4, 3, 4]),
                            target = new Collection([1, 2, 4, 3, 4]),
                            binder = new CollectionBinder(source, nullConverter, BindingType.OneWay);

                        binder.target = target;
                        binder.bind();

                        source.remove(4);
                        expect(target.count()).toBe(source.count());
                        expect(target.get(0)).toBe(1);
                        expect(target.get(1)).toBe(2);
                        expect(target.get(2)).toBe(3);
                    });
                    it('should update the target when the source is bound two way and an element is added', () => {
                        var source = new Collection([1, 2, 3]),
                            target = new Collection([1, 2, 3]),
                            binder = new CollectionBinder(source, nullConverter, BindingType.TwoWay);

                        binder.target = target;
                        binder.bind();

                        source.add(4);
                        expect(target.count()).toBe(source.count());
                        expect(target.get(3)).toBe(source.get(3));
                    });
                    it('should update the source when the target is bound two way and an element is added', () => {
                        var source = new Collection([1, 2, 3]),
                            target = new Collection([1, 2, 3]),
                            binder = new CollectionBinder(source, nullConverter, BindingType.TwoWay);

                        binder.target = target;
                        binder.bind();

                        target.add(4);
                        expect(source.count()).toBe(target.count());
                        expect(source.get(3)).toBe(target.get(3));
                    });
                    it('should update the source when the target is bound two way and an element is removed', () => {
                        var source = new Collection([1, 2, 4, 3, 4]),
                            target = new Collection([1, 2, 4, 3, 4]),
                            binder = new CollectionBinder(source, nullConverter, BindingType.TwoWay);

                        binder.target = target;
                        binder.bind();

                        target.remove(4);
                        expect(source.count()).toBe(target.count());
                        expect(source.get(0)).toBe(1);
                        expect(source.get(1)).toBe(2);
                        expect(source.get(2)).toBe(3);
                    });
                });

                //#endregion bind
            });

            //#endregion CollectionBinder
        });
    });

    //#region bind

    describe('bind', () => {
        it('should return a PropertyBinder when given a Property instance.', () => {
            var property = new Property(0, 0),
                binder: IBinder<number>,
                converter = getNullConverter<number>();

            binder = bind(property);
            expect(binder.is(PropertyBinder)).toBe(true);

            binder = bind(property, BindingType.OneWay);
            expect(binder.is(PropertyBinder)).toBe(true);

            binder = bind(property, nullConverter);
            expect(binder.is(PropertyBinder)).toBe(true);

            binder = bind(property, nullConverter, BindingType.OneWay);
            expect(binder.is(PropertyBinder)).toBe(true);
        });
        it('should return a PropertyBinder with the appropriate BindingType.', () => {
            var property = new Property(0, 0),
                binder: PropertyBinder<number, number>,
                converter = getNullConverter<number>();

            binder = <PropertyBinder<number, number>>bind(property);
            expect(binder.bindingType).toBe(BindingType.TwoWay);

            binder = <PropertyBinder<number, number>>bind(property, BindingType.OneWay);
            expect(binder.bindingType).toBe(BindingType.OneWay);

            binder = <PropertyBinder<number, number>>bind(property, nullConverter);
            expect(binder.bindingType).toBe(BindingType.TwoWay);

            binder = <PropertyBinder<number, number>>bind(property, nullConverter, BindingType.OneWay);
            expect(binder.bindingType).toBe(BindingType.OneWay);
        });
        it('should return a PropertyBinder with the appropriate converter.', () => {
            var property = new Property(0, 0),
                binder: PropertyBinder<number, number>,
                nullConverter = getNullConverter<number>(),
                converter: IValueConverter<number, number> = {
                    convert: value => value,
                    convertBack: value => value
                };

            binder = <PropertyBinder<number, number>>bind(property);
            expect(binder.converter).toBe(nullConverter);

            binder = <PropertyBinder<number, number>>bind(property, BindingType.OneWay);
            expect(binder.converter).toBe(nullConverter);

            binder = <PropertyBinder<number, number>>bind(property, converter);
            expect(binder.converter).toBe(converter);

            binder = <PropertyBinder<number, number>>bind(property, converter, BindingType.OneWay);
            expect(binder.converter).toBe(converter);
        });
        it('should return a CollectionBinder when given a Collection instance.', () => {
            var collection = new Collection([0]),
                binder: ICollectionBinder<number>,
                converter = getNullConverter<number>();

            binder = bind(collection);
            expect(binder.is(CollectionBinder)).toBe(true);

            binder = bind(collection, BindingType.OneWay);
            expect(binder.is(CollectionBinder)).toBe(true);

            binder = bind(collection, nullConverter);
            expect(binder.is(CollectionBinder)).toBe(true);

            binder = bind(collection, nullConverter, BindingType.OneWay);
            expect(binder.is(CollectionBinder)).toBe(true);
        });
        it('should return a CollectionBinder with the appropriate BindingType.', () => {
            var collection = new Collection([0]),
                binder: CollectionBinder<number, number>,
                converter = getNullConverter<number>();

            binder = <CollectionBinder<number, number>>bind(collection);
            expect(binder.bindingType).toBe(BindingType.TwoWay);

            binder = <CollectionBinder<number, number>>bind(collection, BindingType.OneWay);
            expect(binder.bindingType).toBe(BindingType.OneWay);

            binder = <CollectionBinder<number, number>>bind(collection, nullConverter);
            expect(binder.bindingType).toBe(BindingType.TwoWay);

            binder = <CollectionBinder<number, number>>bind(collection, nullConverter, BindingType.OneWay);
            expect(binder.bindingType).toBe(BindingType.OneWay);
        });
        it('should return a CollectionBinder with the appropriate converter.', () => {
            var collection = new Collection([0]),
                binder: CollectionBinder<number, number>,
                nullConverter = getNullConverter<number>(),
                converter: IValueConverter<number, number> = {
                    convert: value => value,
                    convertBack: value => value
                };

            binder = <CollectionBinder<number, number>>bind(collection);
            expect(binder.converter).toBe(nullConverter);

            binder = <CollectionBinder<number, number>>bind(collection, BindingType.OneWay);
            expect(binder.converter).toBe(nullConverter);

            binder = <CollectionBinder<number, number>>bind(collection, converter);
            expect(binder.converter).toBe(converter);

            binder = <CollectionBinder<number, number>>bind(collection, converter, BindingType.OneWay);
            expect(binder.converter).toBe(converter);
        });
        it('should return an ObjectBinder when given an instance that implements INotifyPropertyChanged.', () => {
            var source = new Notifier(),
                binder: IBinder<number>,
                converter = getNullConverter<number>();

            binder = bind<number>(source, 'property');
            expect(binder.is(ObjectBinder)).toBe(true);

            binder = bind<number>(source, 'property', BindingType.OneWay);
            expect(binder.is(ObjectBinder)).toBe(true);

            binder = bind(source, 'property', nullConverter);
            expect(binder.is(ObjectBinder)).toBe(true);

            binder = bind(source, 'property', nullConverter, BindingType.OneWay);
            expect(binder.is(ObjectBinder)).toBe(true);
        });
        it('should return an ObjectBinder with the appropriate BindingType.', () => {
            var source = new Notifier(),
                binder: ObjectBinder<number, number>,
                converter = getNullConverter<number>();

            binder = <ObjectBinder<number, number>>bind(source, 'property');
            expect(binder.bindingType).toBe(BindingType.TwoWay);

            binder = <ObjectBinder<number, number>>bind(source, 'property', BindingType.OneWay);
            expect(binder.bindingType).toBe(BindingType.OneWay);

            binder = <ObjectBinder<number, number>>bind(source, 'property', nullConverter);
            expect(binder.bindingType).toBe(BindingType.TwoWay);

            binder = <ObjectBinder<number, number>>bind(source, 'property', nullConverter, BindingType.OneWay);
            expect(binder.bindingType).toBe(BindingType.OneWay);
        });
        it('should return an ObjectBinder with the appropriate converter.', () => {
            var source = new Notifier(),
                binder: ObjectBinder<number, number>,
                nullConverter = getNullConverter<number>(),
                converter: IValueConverter<number, number> = {
                    convert: value => value,
                    convertBack: value => value
                };

            binder = <ObjectBinder<number, number>>bind(source, 'property');
            expect(binder.converter).toBe(nullConverter);

            binder = <ObjectBinder<number, number>>bind(source, 'property', BindingType.OneWay);
            expect(binder.converter).toBe(nullConverter);

            binder = <ObjectBinder<number, number>>bind(source, 'property', converter);
            expect(binder.converter).toBe(converter);

            binder = <ObjectBinder<number, number>>bind(source, 'property', converter, BindingType.OneWay);
            expect(binder.converter).toBe(converter);
        });
    });

    //#endregion bind

    //#region Test Classes

    class Notifier implements INotifyPropertyChanged {
        propertyChanged: IEvent<INotifyPropertyChanged, string>;

        private _property = 1;
        get property(): number { return this._property; }
        set property(value: number) {
            if (!this._property.equals(value)) {
                this._property = value;
                this.propertyChanged.execute('property');
            }
        }

        constructor() {
            this.propertyChanged = new Events.Event(this);
        }
    }

    //#endregion Test Classes
}