module Classical.Html.spec {

    //#region Imports

    import u = Classical.Utilities;
    import m = Classical.Html;
    import e = Classical.Html.Elements;
    import b = Classical.Binding;

    //#endregion Imports

    //#region Test Classes

    //#region TestElement

    class TestElement {

        //#region Fields

        private _name: string;
        private _elementName: string;
        private _factoryMethod: string;
        private _properties: IEnumerable<TestProperty>;

        //#endregion Fields

        //#region Properties

        get name(): string {
            return this._name;
        }

        get elementName(): string {
            return this._elementName;
        }

        get factoryMethod(): string {
            return this._factoryMethod;
        }

        get properties(): IEnumerable<TestProperty> {
            return this._properties;
        }

        //#endregion Properties

        //#region Constructors

        constructor(name: string, elementName: string, factoryMethod: string, properties: IEnumerable<TestProperty>) {
            this._name = name;
            this._elementName = elementName;
            this._factoryMethod = factoryMethod;
            this._properties = properties;
        }

        //#endregion Constructors

        //#region Methods

        public IsAutoGeneratedElement(): boolean {
            return this.name !== 'HtmlElement' && this.name !== 'HtmlElementContainer';
        }

        //#endregion Methods
    }

    //#endregion TestElement

    //#region TestProperty

    class TestProperty {

        //#region Fields

        private _propertyName: string;
        private _propertyElementName: string;
        private _type: string;
        private _testItems: IEnumerable<any>;
        private _testCode: string;
        private _isInitializable: boolean;
        private _isIdl: boolean;

        //#endregion Fields

        //#region Properties

        get propertyName(): string {
            return this._propertyName;
        }

        get propertyElementName(): string {
            return this._propertyElementName;
        }

        get type(): string {
            return this._type;
        }

        get testItems(): IEnumerable<any> {
            return this._testItems;
        }

        get testCode(): string {
            return this._testCode;
        }

        get isInitializable(): boolean {
            return this._isInitializable;
        }

        get isIdl(): boolean {
            return this._isIdl;
        }

        //#endregion Properties

        //#region Constructors

        constructor(propertyName: string, propertyElementName: string, factoryMethod: string, testItems: IEnumerable<any>, testCode?: string, isInitializable?: boolean, isIdl?: boolean) {
            this._propertyName = propertyName;
            this._propertyElementName = propertyElementName;
            this._type = factoryMethod;
            this._testItems = testItems;
            this._testCode = testCode;
            this._isInitializable = isInitializable;
            this._isIdl = isIdl;
        }

        //#endregion Constructors
    }

    //#endregion TestProperty

    //#endregion Test Classes

    //#region Variables

    var testHtmlElement: TestElement;
    var testHtmlElementContainer: TestElement;
    var elements = new Array<TestElement>();

    //## ArrayInitialization

    //#endregion Variables

    describe('Classical', () => {

        describe('Html', () => {

            //#region Factory Methods

            elements.query().where(t => t.IsAutoGeneratedElement()).foreach(element => {
                var factoryMethod = element.factoryMethod;
                var elementName = element.name;

                describe(factoryMethod, () => {
                    it('should return an instance of ' + elementName + '.', () => {
                        var element = m[factoryMethod]();
                        expect(element.getType()).toBe(typeOf(e[elementName]));
                    });
                    it('should not initialize the returned instance.', () => {
                        var element = m[factoryMethod]();
                        expect(element.isInitialized()).toBe(false);
                    });
                });
            });

            //#endregion Factory Methods

            //#region Elements

            describe('Elements', () => {

                //#region HtmlElement

                describe('HtmlElement', () => {
                    it('should throw an error for an invalid property value.', () => {
                        var model = {
                            property: new b.Property({}, 0)
                        };

                        var audioElement = m.create(m.audio());
                        expect(() => audioElement.volume = 2).toThrow();
                        expect(audioElement.element['volume']).toBe(audioElement.volume);

                        audioElement = m.create(m.audio({
                            volumeBinder: bind(model.property)
                        }));
                        expect(() => model.property.value = 2).toThrow();
                        expect(audioElement.element['volume']).toBe(audioElement.volume);
                        expect(audioElement.element['volume']).toBe(model.property.value);

                        model = {
                            property: new b.Property({}, 10)
                        };

                        var inputElement = m.create(m.input({
                            size: 10
                        }));
                        expect(() => inputElement.size = 0).toThrow();
                        expect(inputElement.size).toBe(10);
                        expect(inputElement.element['size']).toBe(inputElement.size);

                        inputElement = m.create(m.input({
                            sizeBinder: bind(model.property)
                        }));
                        expect(() => model.property.value = 0).toThrow();
                        expect(inputElement.size).toBe(10);
                        expect(inputElement.element['size']).toBe(inputElement.size);
                        expect(inputElement.element['size']).toBe(model.property.value);

                    });
                });

                //#endregion HtmlElement

                //#region HtmlElementContainer

                //#endregion HtmlElementContainer

                //#region Concrete Elements

                elements.query().where(t => !t.IsAutoGeneratedElement()).foreach(element => {
                    var name = element.name;
                    var elementName = element.elementName;
                    var factoryMethod = element.factoryMethod;

                    describe(name, () => {

                        element.properties.query().foreach(prop => {
                            var propertyName = prop.propertyName;

                            describe(propertyName, () => {
                                it('should have the same value as the ' + propertyName + ' property in the config.', () => {
                                    elements.query().where(t => t.IsAutoGeneratedElement()).foreach(testElement => {
                                        var element;
                                        var factoryMethod = testElement.factoryMethod;
                                        var config = new Object();

                                        prop.testItems.query().foreach(testItem => {
                                            config[propertyName] = testItem;
                                            element = m.create(m[factoryMethod](config));
                                            expect(element[propertyName]).toBe(testItem);
                                        });
                                    });
                                });
                                it('should have the same value as the ' + propertyName + 'Binder property in the config.', () => {
                                    elements.query().where(t => t.IsAutoGeneratedElement()).foreach(testElement => {
                                        var element;
                                        var factoryMethod = testElement.factoryMethod;
                                        var config = new Object();

                                        prop.testItems.query().foreach(testItem => {
                                            config[propertyName + 'Binder'] = bind(new b.Property({}, testItem));

                                            element = m.create(m[factoryMethod](config));
                                            expect(element[propertyName]).toBe(testItem);
                                        });
                                    });
                                });
                            });
                        });
                    });
                });

                elements.query().where(t => t.IsAutoGeneratedElement()).foreach(element => {
                    var name = element.name;
                    var elementName = element.elementName;
                    var factoryMethod = element.factoryMethod;

                    describe(name, () => {

                        //#region elementName

                        describe('elementName', () => {
                            it('should be ' + elementName + '.', () => {
                                var elementVariable = m.create(m[factoryMethod]());
                                expect(elementVariable.elementName).toBe(elementName);
                            });
                            it('should equal the nodeName of the element returned by document.createElement.', () => {
                                var elementVariable = m.create(m[factoryMethod]()),
                                    element = document.createElement(elementVariable.elementName);
                                expect(elementVariable.elementName).toBe(element.nodeName.toLowerCase());
                            });
                        });

                        //#endregion elementName

                        //#region createElement

                        describe('createElement', () => {
                            it('should create an element.', () => {
                                var elementVariable = m.create(m[factoryMethod]()),
                                    element = elementVariable.createElement(document);
                                expect(u.isDefined(element)).toBe(true);
                            });
                            it('should create an element with a nodeName of ' + elementName + '.', () => {
                                var elementVariable = m.create(m[factoryMethod]()),
                                    element = elementVariable.createElement(document);
                                expect(element.nodeName.toLowerCase()).toBe(elementName);
                            });
                        });

                        //#endregion createElement

                        //#region Properties

                        element.properties.query().foreach(prop => {
                            var propertyName = prop.propertyName;
                            var propertyElementName = prop.propertyElementName;
                            var testCode = prop.testCode;

                            describe(propertyName, () => {

                                if (prop.isInitializable) {
                                    it('should have the same value as the ' + propertyName + ' property in the config.', () => {
                                        prop.testItems.query().foreach(testItem => {
                                            var config = new Object();
                                            config[propertyName] = testItem;

                                            var element = m.create(m[factoryMethod](config));
                                            if (testCode) eval(testCode);

                                            expect(element[propertyName]).toBe(testItem);
                                            expect(element.element[propertyElementName]).toBe(testItem);
                                        });
                                    });
                                    it('should have the same value as the ' + propertyName + 'Binder property in the config.', () => {
                                        prop.testItems.query().foreach(testItem => {
                                            var config = new Object();
                                            config[propertyName + 'Binder'] = bind(new b.Property({}, testItem));

                                            var element = m.create(m[factoryMethod](config));
                                            if (testCode) eval(testCode);

                                            expect(element[propertyName]).toBe(testItem);
                                            expect(element.element[propertyElementName]).toBe(testItem);
                                        });
                                    });
                                }

                                it('should get and set the value of the ' + propertyName + ' property.', () => {
                                    var element = m.create(m[factoryMethod]());
                                    if (testCode) eval(testCode);

                                    prop.testItems.query().foreach(testItem => {
                                        element[propertyName] = testItem;
                                        expect(element[propertyName]).toBe(testItem);
                                    });
                                });
                                it('should bind to a model.', () => {
                                    var first,
                                        second,
                                        model,
                                        element;
                                    var testItems = prop.testItems;

                                    for (var i = 0; i < testItems.count(); i++) {
                                        var testItem = testItems[i];
                                        var nextItem = (i == (testItems.count() - 1)) ? testItems[0] : testItems[i + 1];

                                        first = testItem;
                                        second = nextItem;
                                        model = {
                                            property: new b.Property({}, first)
                                        };

                                        element = m.create(m[factoryMethod]());
                                        if (testCode) eval(testCode);
                                        var binder = bind(model.property);
                                        binder.target = element[propertyName + 'Property'];
                                        binder.bind();

                                        model.property.value = second;
                                        expect(element[propertyName]).toBe(second);
                                        expect((<any>element.element)[propertyElementName]).toBe(second);
                                        model.property.value = first;

                                        element[propertyName] = second;
                                        expect(model.property.value).toBe(second);
                                        expect((<any>element.element)[propertyElementName]).toBe(second);
                                        model.property.value = first;

                                        if (!prop.isIdl) {
                                            runs(() => {
                                                (<any>element.element)[propertyElementName] = second;
                                            });
                                            waitsFor(() => {
                                                return model.property.value === second;
                                            }, 'The model was not updated correctly from value "' + first + '" to value "' + second + '".', 20);
                                            waitsFor(() => {
                                                return element[propertyName] === second;
                                            }, 'The decorator was not updated correctly from value "' + first + '" to value "' + second + '".', 20);
                                        }
                                    }
                                });
                            });

                        });

                        //#endregion Properties

                    });
                });

                //#endregion Concrete Elements
            });

            //#endregion Elements

            //#region Events

            describe('Events', () => {
                //#region MouseEvents

                describe('Click Event', () => {
                    it('Should change values of an object when the click event executes.', () => {
                        testClassicalEvent('clickEvent');
                    });

                    it('Should change values of an object when the click event is fired via the DOM.', () => {
                        testDomEvent('clickEvent', 'click');
                    });

                    it('Should change values of an object when the click event is added using addEventListener.', () => {
                        testAddEventListener('click');
                    });
                });

                describe('Double Click Event', () => {
                    it('Should change values of an object when the double click event executes.', () => {
                        testClassicalEvent('doubleClickEvent');
                    });

                    it('Should change values of an object when the double click event is fired via the DOM.', () => {
                        testDomEvent('doubleClickEvent', 'dblclick');
                    });

                    it('Should change values of an object when the double click event is added using addEventListener.', () => {
                        testAddEventListener('dblclick');
                    });
                });

                describe('Mouse Move Event', () => {
                    it('Should change values of an object when the mouse move event executes.', () => {
                        testClassicalEvent('mouseMoveEvent');
                    });

                    it('Should change values of an object when the mouse move is fired via the DOM.', () => {
                        testDomEvent('mouseMoveEvent', 'mousemove');
                    });

                    it('Should change values of an object when the mouse move event is added using addEventListener.', () => {
                        testAddEventListener('mousemove');
                    });
                });

                describe('Mouse Up Event', () => {
                    it('Should change values of an object when the mouse up event executes.', () => {
                        testClassicalEvent('mouseUpEvent');
                    });

                    it('Should change values of an object when the mouse up is fired via the DOM.', () => {
                        testDomEvent('mouseUpEvent', 'mouseup');
                    });

                    it('Should change values of an object when the mouse up event is added using addEventListener.', () => {
                        testAddEventListener('mouseup');
                    });
                });

                describe('Mouse Down Event', () => {
                    it('Should change values of an object when the mouse down event executes.', () => {
                        testClassicalEvent('mouseDownEvent');
                    });

                    it('Should change values of an object when the mouse down is fired via the DOM.', () => {
                        testDomEvent('mouseDownEvent', 'mousedown');
                    });

                    it('Should change values of an object when the mouse down event is added using addEventListener.', () => {
                        testAddEventListener('mousedown');
                    });
                });

                describe('Mouse Enter Event', () => {
                    it('Should change values of an object when the mouse enter event executes.', () => {
                        testClassicalEvent('mouseEnterEvent');
                    });

                    it('Should change values of an object when the mouse enter is fired via the DOM.', () => {
                        testDomEvent('mouseEnterEvent', 'mouseenter');
                    });

                    it('Should change values of an object when the mouse enter event is added using addEventListener.', () => {
                        testAddEventListener('mouseenter');
                    });
                });

                describe('Mouse Leave Event', () => {
                    it('Should change values of an object when the mouse leave event executes.', () => {
                        testClassicalEvent('mouseLeaveEvent');
                    });

                    it('Should change values of an object when the mouse leave is fired via the DOM.', () => {
                        testDomEvent('mouseLeaveEvent', 'mouseleave');
                    });

                    it('Should change values of an object when the mouse leave event is added using addEventListener.', () => {
                        testAddEventListener('mouseleave');
                    });
                });

                describe('Mouse Over Event', () => {
                    it('Should change values of an object when the mouse over event executes.', () => {
                        testClassicalEvent('mouseOverEvent');
                    });

                    it('Should change values of an object when the mouse over is fired via the DOM.', () => {
                        testDomEvent('mouseOverEvent', 'mouseover');
                    });

                    it('Should change values of an object when the mouse over event is added using addEventListener.', () => {
                        testAddEventListener('mouseover');
                    });
                });

                describe('Mouse Out Event', () => {
                    it('Should change values of an object when the mouse out event executes.', () => {
                        testClassicalEvent('mouseOutEvent');
                    });

                    it('Should change values of an object when the mouse out is fired via the DOM.', () => {
                        testDomEvent('mouseOutEvent', 'mouseout');
                    });

                    it('Should change values of an object when the mouse out event is added using addEventListener.', () => {
                        testAddEventListener('mouseout');
                    });
                });

                //#endregion MouseEvents

                //#region KeyboardEvents

                describe('Key Up Event', () => {
                    it('Should change values of an object when the key up event executes.', () => {
                        testClassicalEvent('keyUpEvent');
                    });

                    it('Should change values of an object when the key up event is fired via the DOM.', () => {
                        testDomEvent('keyUpEvent', 'keyup');
                    });

                    it('Should change values of an object when the key up event is added using addEventListener.', () => {
                        testAddEventListener('keyup');
                    });
                });

                describe('Key Down Event', () => {
                    it('Should change values of an object when the key down event executes.', () => {
                        testClassicalEvent('keyDownEvent');
                    });

                    it('Should change values of an object when the key down event is fired via the DOM.', () => {
                        testDomEvent('keyDownEvent', 'keydown');
                    });

                    it('Should change values of an object when the key down event is added using addEventListener.', () => {
                        testAddEventListener('keydown');
                    });
                });

                describe('Key Press Event', () => {
                    it('Should change values of an object when the key press event executes.', () => {
                        testClassicalEvent('keyPressEvent');
                    });

                    it('Should change values of an object when the key press event is fired via the DOM.', () => {
                        testDomEvent('keyPressEvent', 'keypress');
                    });

                    it('Should change values of an object when the key press event is added using addEventListener.', () => {
                        testAddEventListener('keypress');
                    });
                });

                //#endregion KeyboardEvents

                describe('Focus Event', () => {
                    it('Should change values of an object when the focus event executes.', () => {
                        testClassicalEvent('focusEvent');
                    });

                    it('Should change values of an object when the focus event is fired via the DOM.', () => {
                        testDomEvent('focusEvent', 'focus');
                    });

                    it('Should change values of an object when the focus event is added using addEventListener.', () => {
                        testAddEventListener('focus');
                    });
                });

                describe('Blur Event', () => {
                    it('Should change values of an object when the blur event executes.', () => {
                        testClassicalEvent('blurEvent');
                    });

                    it('Should change values of an object when the blur event is fired via the DOM.', () => {
                        testDomEvent('blurEvent', 'blur');
                    });

                    it('Should change values of an object when the blur event is added using addEventListener.', () => {
                        testAddEventListener('blur');
                    });
                });

                describe('Copy Event', () => {
                    it('Should change values of an object when the copy event executes.', () => {
                        testClassicalEvent('copyEvent');
                    });

                    it('Should change values of an object when the copy event is fired via the DOM.', () => {
                        testDomEvent('copyEvent', 'copy');
                    });

                    it('Should change values of an object when the copy event is added using addEventListener.', () => {
                        testAddEventListener('copy');
                    });
                });

                describe('Cut Event', () => {
                    it('Should change values of an object when the cut event executes.', () => {
                        testClassicalEvent('cutEvent');
                    });

                    it('Should change values of an object when the cut event is fired via the DOM.', () => {
                        testDomEvent('cutEvent', 'cut');
                    });

                    it('Should change values of an object when the cut event is added using addEventListener.', () => {
                        testAddEventListener('cut');
                    });
                });

                describe('Paste Event', () => {
                    it('Should change values of an object when the paste event executes.', () => {
                        testClassicalEvent('pasteEvent');
                    });

                    it('Should change values of an object when the paste event is fired via the DOM.', () => {
                        testDomEvent('pasteEvent', 'paste');
                    });

                    it('Should change values of an object when the paste event is added using addEventListener.', () => {
                        testAddEventListener('paste');
                    });
                });

                describe('Scroll Event', () => {
                    it('Should change values of an object when the scroll event executes.', () => {
                        testClassicalEvent('scrollEvent');
                    });

                    it('Should change values of an object when the scroll event is fired via the DOM.', () => {
                        testDomEvent('scrollEvent', 'scroll');
                    });

                    it('Should change values of an object when the scroll event is added using addEventListener.', () => {
                        testAddEventListener('scroll');
                    });
                });

                describe('Resize Event', () => {
                    it('Should change values of an object when the resize event executes.', () => {
                        testClassicalEvent('resizeEvent');
                    });

                    it('Should change values of an object when the resize event is fired via the DOM.', () => {
                        testDomEvent('resizeEvent', 'resize');
                    });

                    it('Should change values of an object when the resize event is added using addEventListener.', () => {
                        testAddEventListener('resize');
                    });
                });
            });

            //#region testClassicalEvent

            function testClassicalEvent(eventPropertyName: string) {
                var testObject = {
                    firstValue: 0,
                    secondValue: 0,
                    thirdValue: 0
                };

                var divisionElement = m.div();
                divisionElement = m.create(divisionElement);
                divisionElement.scrollEvent
                var firstTestFunction = (node, info) => { testObject.firstValue = 1; };
                
                divisionElement[eventPropertyName].subscribe(firstTestFunction);
                divisionElement[eventPropertyName].subscribe((node, info) => { testObject.secondValue = 2; });
                divisionElement[eventPropertyName].subscribe((node, info) => { testObject.thirdValue = 3; });
                divisionElement[eventPropertyName].execute(null);
                
                expect(testObject.firstValue).toBe(1);
                expect(testObject.secondValue).toBe(2);
                expect(testObject.thirdValue).toBe(3);

                testObject = {
                    firstValue: 0,
                    secondValue: 0,
                    thirdValue: 0
                };

                divisionElement[eventPropertyName].unsubscribe(firstTestFunction);
                divisionElement[eventPropertyName].execute(null);

                expect(testObject.firstValue).toBe(0);
                expect(testObject.secondValue).toBe(2);
                expect(testObject.thirdValue).toBe(3);
            }

            //#endregion testClassicalEvent

            //#region testDomEvent

            function testDomEvent(eventPropertyName: string, eventType: string): void {
                var divisionId = 'divisionElementTest';
                var testObject = {
                    firstValue: 0,
                    secondValue: 0,
                    thirdValue: 0
                };

                var divisionConfig = {
                    id: divisionId,
                };
                var divisionElement = m.div(divisionConfig);
                divisionElement = m.create(divisionElement);

                document.body.appendChild(divisionElement.element);

                var firstTestFunction = (node, info) => { testObject.firstValue = 1; };

                divisionElement[eventPropertyName].subscribe(firstTestFunction);
                divisionElement[eventPropertyName].subscribe((node, info) => { testObject.secondValue = 2; });
                divisionElement[eventPropertyName].subscribe((node, info) => { testObject.thirdValue = 3; });
                
                var event = document.createEvent('Event');
                event.initEvent(eventType, true, true);

                document.getElementById(divisionId).dispatchEvent(event);

                expect(testObject.firstValue).toBe(1);
                expect(testObject.secondValue).toBe(2);
                expect(testObject.thirdValue).toBe(3);

                testObject = {
                    firstValue: 0,
                    secondValue: 0,
                    thirdValue: 0
                };

                divisionElement[eventPropertyName].unsubscribe(firstTestFunction);
                document.getElementById(divisionId).dispatchEvent(event);

                expect(testObject.firstValue).toBe(0);
                expect(testObject.secondValue).toBe(2);
                expect(testObject.thirdValue).toBe(3);

                document.body.removeChild(divisionElement.element);
            }

            //#endregion testDomEvent

            //#region testAddEventListener

            function testAddEventListener(eventName: string) {
                var divisionId = 'divisionElementTest';
                var testObject = {
                    firstValue: 0,
                    secondValue: 0,
                    thirdValue: 0
                };

                var divisionConfig = {
                    id: divisionId,
                };
                var divisionElement = m.div(divisionConfig);
                divisionElement = m.create(divisionElement);

                document.body.appendChild(divisionElement.element);

                var firstTestFunction = (e) => { testObject.firstValue = 1; };

                divisionElement.element.addEventListener(eventName, firstTestFunction);
                divisionElement.element.addEventListener(eventName, (e) => { testObject.secondValue = 2; });
                divisionElement.element.addEventListener(eventName, (e) => { testObject.thirdValue = 3; });

                var event = document.createEvent('Event');
                event.initEvent(eventName, true, true);

                document.getElementById(divisionId).dispatchEvent(event);

                expect(testObject.firstValue).toBe(1);
                expect(testObject.secondValue).toBe(2);
                expect(testObject.thirdValue).toBe(3);

                testObject = {
                    firstValue: 0,
                    secondValue: 0,
                    thirdValue: 0
                };

                divisionElement.element.removeEventListener(eventName, firstTestFunction);
                document.getElementById(divisionId).dispatchEvent(event);

                expect(testObject.firstValue).toBe(0);
                expect(testObject.secondValue).toBe(2);
                expect(testObject.thirdValue).toBe(3);

                document.body.removeChild(divisionElement.element);
            }

            //#endregion testAddEventListener

            //#endregion Events
        });
    });
}