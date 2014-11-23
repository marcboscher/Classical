var Classical;
(function (Classical) {
    (function (Native) {
        var StringPrototype = String.prototype;
        var NumberPrototype = Number.prototype;
        var BooleanPrototype = Boolean.prototype;
        var ObjectPrototype = Object.prototype;
        var ArrayPrototype = Array.prototype;

        Object.defineProperty(ObjectPrototype, 'equals', {
            value: function (other) {
                return this === other;
            },
            enumerable: false,
            configurable: true,
            writable: true
        });

        Object.defineProperty(ObjectPrototype, 'getType', {
            value: function () {
            },
            enumerable: false,
            configurable: true,
            writable: true
        });

        Object.defineProperty(ObjectPrototype, 'getHashCode', {
            value: function () {
                Classical.Assert.isFalse(Object.isFrozen(this) && !this._hashCode, 'The object has been frozen before its hash code was generated. Consider calling getHashCode prior to freezing.');

                if (this._hashCode === undefined)
                    Object.defineProperty(this, '_hashCode', {
                        value: Classical.Hash.forNumber(Math.random()),
                        enumerable: false
                    });

                return this._hashCode;
            },
            enumerable: false,
            configurable: true,
            writable: true
        });

        var freeze = Object.freeze;
        Object.freeze = function (o) {
            if (o && o.getHashCode && !Object.isFrozen(o))
                o.getHashCode();
            freeze(o);
        };

        var stringify = JSON.stringify;
        JSON.stringify = function (value) {
            var hashCode = null;
            if (value && value._hashCode) {
                hashCode = value._hashCode;
                delete value._hashCode;
            }

            var result = stringify(value);

            if (hashCode)
                value._hashCode = hashCode;

            return result;
        };

        Object.defineProperty(ObjectPrototype, 'is', {
            value: function (type) {
                var u = Classical.Utilities;
                if (u.isNullOrUndefined(type))
                    return false;

                return this.getType().isAssignableTo(typeOf(type));
            },
            enumerable: false,
            configurable: true,
            writable: true
        });

        Object.defineProperty(ObjectPrototype, 'as', {
            value: function () {
                return this;
            },
            enumerable: false,
            configurable: true,
            writable: true
        });

        Object.defineProperty(ObjectPrototype, 'getType', {
            value: function () {
                return typeOf(this.constructor);
            },
            enumerable: false,
            configurable: true,
            writable: true
        });

        Object.defineProperty(StringPrototype, 'equals', {
            value: function (other) {
                if (!Classical.Utilities.isString(other))
                    return false;

                return this.toString() === other.toString();
            },
            enumerable: false,
            configurable: true,
            writable: true
        });

        Object.defineProperty(StringPrototype, 'getHashCode', {
            value: function () {
                return Classical.Hash.forString(this);
            },
            enumerable: false,
            configurable: true,
            writable: true
        });

        Object.defineProperty(NumberPrototype, 'equals', {
            value: function (other) {
                return (this + 0) === other;
            },
            enumerable: false,
            configurable: true,
            writable: true
        });

        Object.defineProperty(NumberPrototype, 'getHashCode', {
            value: function () {
                return Classical.Hash.forNumber(this + 0);
            },
            enumerable: false,
            configurable: true,
            writable: true
        });

        Object.defineProperty(BooleanPrototype, 'equals', {
            value: function (other) {
                if (!Classical.Utilities.isBoolean(other))
                    return false;

                return this == other;
            },
            enumerable: false,
            configurable: true,
            writable: true
        });

        Object.defineProperty(BooleanPrototype, 'getHashCode', {
            value: function () {
                return Classical.Hash.forNumber(+this);
            },
            enumerable: false,
            configurable: true,
            writable: true
        });

        ArrayPrototype.add = function (item) {
            this.push(item);
            return this;
        };

        ArrayPrototype.addRange = function (items) {
            var _this = this;
            Classical.Assert.isDefined(items);
            items.forEach(function (item) {
                return _this.add(item);
            });

            return this;
        };

        ArrayPrototype.remove = function (item) {
            var u = Classical.Utilities, array = this;

            for (var i = 0, length = this.length; i < length; i++) {
                if (u.areEqual(item, array[i])) {
                    array.splice(i, 1);
                    i--;
                    length--;
                }
            }

            return this;
        };

        ArrayPrototype.removeAt = function (index) {
            Classical.Assert.isTrue(index >= 0 && index < this.length, 'The index is out of range.');
            this.splice(index, 1);
            return this;
        };

        ArrayPrototype.clear = function () {
            this.length = 0;
            return this;
        };

        ArrayPrototype.get = function (index) {
            Classical.Assert.isTrue(index >= 0 && index < this.length, 'The index is out of range.');
            return this[index];
        };

        ArrayPrototype.set = function (index, item) {
            Classical.Assert.isTrue(index >= 0, 'The index must be greater than or equal to zero.');

            this[index] = item;
            return this;
        };
    })(Classical.Native || (Classical.Native = {}));
    var Native = Classical.Native;
})(Classical || (Classical = {}));
var Classical;
(function (Classical) {
    (function (Hash) {
        function forNumber(key, seed) {
            return Hash.forString(key.toString(), seed);
        }
        Hash.forNumber = forNumber;

        function forString(key, seed) {
            if (seed === undefined)
                seed = 37;

            var remainder, bytes, h1, h1b, c1, c1b, c2, c2b, k1, i;

            remainder = key.length & 3;
            bytes = key.length - remainder;
            h1 = seed;
            c1 = 0xcc9e2d51;
            c2 = 0x1b873593;
            i = 0;

            while (i < bytes) {
                k1 = ((key.charCodeAt(i) & 0xff)) | ((key.charCodeAt(++i) & 0xff) << 8) | ((key.charCodeAt(++i) & 0xff) << 16) | ((key.charCodeAt(++i) & 0xff) << 24);
                ++i;

                k1 = ((((k1 & 0xffff) * c1) + ((((k1 >>> 16) * c1) & 0xffff) << 16))) & 0xffffffff;
                k1 = (k1 << 15) | (k1 >>> 17);
                k1 = ((((k1 & 0xffff) * c2) + ((((k1 >>> 16) * c2) & 0xffff) << 16))) & 0xffffffff;

                h1 ^= k1;
                h1 = (h1 << 13) | (h1 >>> 19);
                h1b = ((((h1 & 0xffff) * 5) + ((((h1 >>> 16) * 5) & 0xffff) << 16))) & 0xffffffff;
                h1 = (((h1b & 0xffff) + 0x6b64) + ((((h1b >>> 16) + 0xe654) & 0xffff) << 16));
            }

            k1 = 0;

            switch (remainder) {
                case 3:
                    k1 ^= (key.charCodeAt(i + 2) & 0xff) << 16;
                case 2:
                    k1 ^= (key.charCodeAt(i + 1) & 0xff) << 8;
                case 1:
                    k1 ^= (key.charCodeAt(i) & 0xff);

                    k1 = (((k1 & 0xffff) * c1) + ((((k1 >>> 16) * c1) & 0xffff) << 16)) & 0xffffffff;
                    k1 = (k1 << 15) | (k1 >>> 17);
                    k1 = (((k1 & 0xffff) * c2) + ((((k1 >>> 16) * c2) & 0xffff) << 16)) & 0xffffffff;
                    h1 ^= k1;
            }

            h1 ^= key.length;

            h1 ^= h1 >>> 16;
            h1 = (((h1 & 0xffff) * 0x85ebca6b) + ((((h1 >>> 16) * 0x85ebca6b) & 0xffff) << 16)) & 0xffffffff;
            h1 ^= h1 >>> 13;
            h1 = ((((h1 & 0xffff) * 0xc2b2ae35) + ((((h1 >>> 16) * 0xc2b2ae35) & 0xffff) << 16))) & 0xffffffff;
            h1 ^= h1 >>> 16;

            return h1 >>> 0;
        }
        Hash.forString = forString;
    })(Classical.Hash || (Classical.Hash = {}));
    var Hash = Classical.Hash;
})(Classical || (Classical = {}));
var Classical;
(function (Classical) {
    (function (Utilities) {
        var toString = Object.prototype.toString;

        var slice = Array.prototype.slice;

        function areEqual(first, second) {
            if (isDefined(first) && isDefined(first.equals))
                return first.equals(second);
            if (isDefined(second) && isDefined(second.equals))
                return second.equals(first);

            return first === second;
        }
        Utilities.areEqual = areEqual;

        function argumentsToArray(args) {
            return slice.call(args, 0);
        }
        Utilities.argumentsToArray = argumentsToArray;

        function coalesce(value, alternative) {
            return isNullOrUndefined(value) ? alternative : value;
        }
        Utilities.coalesce = coalesce;

        function extend(destination, source) {
            Classical.Assert.isDefined(destination);
            Classical.Assert.isDefined(source);

            for (var property in source) {
                destination[property] = source[property];
            }
            return destination;
        }
        Utilities.extend = extend;

        function format(template) {
            var inputs = [];
            for (var _i = 0; _i < (arguments.length - 1); _i++) {
                inputs[_i] = arguments[_i + 1];
            }
            Classical.Assert.isDefined(template, 'The template is not defined.');
            var result = '', current, lookAhead, startIndex = 0, endIndex, inTemplate = false, length = template.length, maxIndex = length - 1, inputIndex, inputValue;

            for (var i = 0, length = template.length; i < length; i++) {
                current = template[i];
                if (!inTemplate && current === '{') {
                    lookAhead = i <= maxIndex ? template[i + 1] : '';
                    if (lookAhead === '{') {
                        endIndex = i;
                        result += template.substr(startIndex, endIndex - startIndex + 1);
                        startIndex = i + 2;
                        i++;
                    } else {
                        inTemplate = true;
                        endIndex = i - 1;
                        result += template.substr(startIndex, endIndex - startIndex + 1);
                        startIndex = i + 1;
                    }
                } else if (inTemplate && current === '}') {
                    inTemplate = false;
                    endIndex = i - 1;

                    inputIndex = +template.substr(startIndex, endIndex - startIndex + 1);
                    Classical.Assert.isFalse(isNaN(inputIndex), 'The template is not formatted correctly.');
                    Classical.Assert.isFalse(inputIndex > maxIndex, 'The template contains an index that is out of bounds.');

                    inputValue = inputs[inputIndex];
                    result += isDefined(inputValue) ? inputValue.toString() : '';
                    startIndex = i + 1;
                } else if (!inTemplate && current === '}') {
                    lookAhead = i <= maxIndex ? template[i + 1] : '';
                    Classical.Assert.isTrue(lookAhead === '}', 'The template contains a closing bracket without an opening bracket.');

                    endIndex = i;
                    result += template.substr(startIndex, endIndex - startIndex + 1);
                    startIndex = i + 2;
                    i++;
                }
            }

            Classical.Assert.isFalse(inTemplate, 'The template contains an opening bracket without a closing bracket.');

            if (!inTemplate && startIndex <= maxIndex) {
                endIndex = maxIndex;
                result += template.substr(startIndex, endIndex - startIndex + 1);
            }

            return result;
        }
        Utilities.format = format;

        function getPropertyNames(value) {
            if (isNullOrUndefined(value))
                return [];
            if (!isObject(value))
                value = value.constructor.prototype;

            var properties = [];
            while (value) {
                properties.addRange(Object.getOwnPropertyNames(value));
                value = Object.getPrototypeOf(value);
            }

            return properties.query().distinct().array();
        }
        Utilities.getPropertyNames = getPropertyNames;

        function isNull(value) {
            return value === null;
        }
        Utilities.isNull = isNull;

        function isUndefined(value) {
            return value === undefined;
        }
        Utilities.isUndefined = isUndefined;

        function isNullOrUndefined(value) {
            return value == null;
        }
        Utilities.isNullOrUndefined = isNullOrUndefined;

        function isDefined(value) {
            return !isNullOrUndefined(value);
        }
        Utilities.isDefined = isDefined;

        function isNumber(value) {
            return toString.call(value) === '[object Number]';
        }
        Utilities.isNumber = isNumber;

        function isNaN(value) {
            return isNumber(value) && window['isNaN'](value);
        }
        Utilities.isNaN = isNaN;

        function isInfinity(value) {
            return isNumber(value) && !Utilities.isNaN(value) && !isFinite(value);
        }
        Utilities.isInfinity = isInfinity;

        function isInteger(value) {
            return isDefined(value) && isNumber(value) && value % 1 === 0;
        }
        Utilities.isInteger = isInteger;

        function isString(value) {
            return toString.call(value) === '[object String]';
        }
        Utilities.isString = isString;

        function isBoolean(value) {
            return toString.call(value) === '[object Boolean]';
        }
        Utilities.isBoolean = isBoolean;

        function isTrue(value) {
            if (!isBoolean(value))
                return false;

            return value == true;
        }
        Utilities.isTrue = isTrue;

        function isTruthy(value) {
            return value ? true : false;
        }
        Utilities.isTruthy = isTruthy;

        function isFalse(value) {
            if (!isBoolean(value))
                return false;

            return value == false;
        }
        Utilities.isFalse = isFalse;

        function isFalsy(value) {
            return value ? false : true;
        }
        Utilities.isFalsy = isFalsy;

        function isObject(value) {
            return !isNull(value) && typeof (value) === 'object';
        }
        Utilities.isObject = isObject;

        function isEmptyObject(value) {
            return isObject(value) && objectToString.call(value) === objectToStringValue && !hasAdditionalProperties(value);
        }
        Utilities.isEmptyObject = isEmptyObject;

        function hasAdditionalProperties(value) {
            if (!objectProperties)
                objectProperties = getPropertyNames({});

            while (value !== Object.prototype) {
                var currentProperties = Object.getOwnPropertyNames(value);
                for (var i = 0, length = currentProperties.length; i < length; i++) {
                    var property = currentProperties[i];
                    if (objectProperties.indexOf(property) < 0)
                        return true;
                }

                value = Object.getPrototypeOf(value);
            }

            return false;
        }

        var objectToString = {}.toString;
        var objectToStringValue = '[object Object]';
        var objectProperties = null;

        function isArray(value) {
            return toString.call(value) === '[object Array]';
        }
        Utilities.isArray = isArray;

        function isFunction(value) {
            return typeof (value) === 'function';
        }
        Utilities.isFunction = isFunction;
    })(Classical.Utilities || (Classical.Utilities = {}));
    var Utilities = Classical.Utilities;
})(Classical || (Classical = {}));
var Classical;
(function (Classical) {
    (function (Assert) {
        var u = Classical.Utilities;

        function staticClass() {
            builder(false, 'Static classes cannot be instantiated.');
        }
        Assert.staticClass = staticClass;

        function isDefined(value, message) {
            builder(u.isDefined(value), message, 'The value is either null or undefined.');
        }
        Assert.isDefined = isDefined;

        function nullOrUndefined(value, message) {
            builder(u.isNullOrUndefined(value), message, 'The value is either null or undefined.');
        }
        Assert.nullOrUndefined = nullOrUndefined;

        function isTrue(expression, message) {
            builder(expression === true, message, 'The expression was not True.');
        }
        Assert.isTrue = isTrue;

        function isFalse(expression, message) {
            builder(expression === false, message, 'The expression was not False.');
        }
        Assert.isFalse = isFalse;

        function isInvalid(message) {
            builder(false, message, 'The system is in an invalid state.');
        }
        Assert.isInvalid = isInvalid;

        function notImplemented(message) {
            throw new Exception(u.coalesce(message, 'The method has not been been implemented.'));
        }
        Assert.notImplemented = notImplemented;

        function builder(expression, message, defaultMessage) {
            if (expression === false)
                throw new Exception(u.coalesce(message, defaultMessage));
        }

        var Exception = (function () {
            function Exception(message) {
                if (!message) {
                    message = 'An exception was encountered.';
                } else {
                    if (message[message.length - 1] !== '.')
                        message += '.';
                }

                this.message = message;
                this.setStackTrace();
            }
            Exception.prototype.toString = function () {
                return this.message + '\n' + this.stackTrace;
            };

            Exception.prototype.setStackTrace = function () {
                var error = new Error();
                if (error.stack) {
                    this.stackTrace = error.stack.toString();
                    return;
                }

                function getStackTrace(f) {
                    return !f ? [] : getStackTrace(f.caller).concat([f.toString().split('(')[0].substring(9) + '(' + f.arguments.join(',') + ')']);
                }

                var stackTrace = getStackTrace(arguments.callee.caller);
                this.stackTrace = '';
                for (var i = 0; i < stackTrace.length; i++)
                    this.stackTrace += (stackTrace[i] + '\n');
            };
            return Exception;
        })();
        Assert.Exception = Exception;
    })(Classical.Assert || (Classical.Assert = {}));
    var Assert = Classical.Assert;
})(Classical || (Classical = {}));






var Classical;
(function (Classical) {
    var Enum = (function () {
        function Enum(value) {
            this._value = value;
        }
        Object.defineProperty(Enum.prototype, "value", {
            get: function () {
                return this._value;
            },
            enumerable: true,
            configurable: true
        });

        Enum.prototype.equals = function (other) {
            if (!other || !other.is || !other.is(this.getType().ctor))
                return false;

            var value = this._value;

            if (value && value.equals)
                return value.equals(other.value);

            other.value === this.value;
        };

        Enum.prototype.getHashCode = function () {
            return this._value.getHashCode();
        };
        return Enum;
    })();
    Classical.Enum = Enum;
})(Classical || (Classical = {}));
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};

var Classical;
(function (Classical) {
    (function (Collections) {
        var u = Classical.Utilities;

        var numberOfBuckets = [7, 13, 23, 43, 83, 163, 317, 631, 1259, 2503, 5003, 9973, 19937, 39869, 79699, 159389, 318751, 637499, 1274989, 2549951, 5099893, 10199767, 20399531, 40799041, 81598067, 163196129, 326392249, 652784471];

        var Dictionary = (function () {
            function Dictionary(capacity) {
                this._initialCapacity = u.coalesce(capacity, 0);
                this.clear();
            }
            Object.defineProperty(Dictionary.prototype, "keys", {
                get: function () {
                    return new DictionaryKeyCollection(this);
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Dictionary.prototype, "values", {
                get: function () {
                    return this.query().select(function (pair) {
                        return pair.value;
                    });
                },
                enumerable: true,
                configurable: true
            });

            Dictionary.prototype.getEnumerator = function () {
                return new DictionaryEnumerator(this);
            };

            Dictionary.prototype.query = function () {
                return new Collections.Queryable(this);
            };

            Dictionary.prototype.forEach = function (operation) {
                forEach(this, operation);
            };

            Dictionary.prototype.array = function () {
                var array = [];
                this.forEach(function (pair) {
                    array.add(pair);
                });
                return array;
            };

            Dictionary.prototype.add = function (key, value) {
                Classical.Assert.isDefined(key, 'The key is null or undefined.');

                var added = this.addWithoutRebalancing(this._hashTable, this._numberOfBuckets, {
                    key: key,
                    value: value
                });

                if (added)
                    this._numberOfElements++;
                this.rebalanceIfNecessary();
                return this;
            };

            Dictionary.prototype.remove = function (key) {
                var elements = this.getElements(key);
                var pair = this.getPair(elements, this._hashTable, this._numberOfBuckets, key);

                if (u.isDefined(pair)) {
                    elements.remove(pair);
                    this._numberOfElements--;
                }

                return this;
            };

            Dictionary.prototype.getValue = function (key) {
                var keyAny = key;
                if (u.isNullOrUndefined(key) || !keyAny.equals || !keyAny.getHashCode)
                    return undefined;

                var elements = this.getElements(key);
                if (elements === undefined)
                    return undefined;

                for (var i = 0, elementsLength = elements.length; i < elementsLength; i++) {
                    var pair = elements[i];
                    if (pair.key.equals(key))
                        return pair.value;
                }

                return undefined;
            };

            Dictionary.prototype.containsKey = function (key) {
                var keyAny = key;
                if (u.isNullOrUndefined(key) || !keyAny.equals || !keyAny.getHashCode)
                    return false;

                var elements = this.getElements(key);
                return u.isDefined(this.getPair(elements, this._hashTable, this._numberOfBuckets, key));
            };

            Dictionary.prototype.clear = function () {
                this._hashTable = {};
                this._numberOfElements = 0;
                var bucketIndex = DictionaryUtilities.capacityToBucketIndex(this._initialCapacity);

                this._bucketIndex = bucketIndex;
                this._numberOfBuckets = DictionaryUtilities.getNumberOfBuckets(bucketIndex);
            };

            Dictionary.prototype.count = function () {
                return this._numberOfElements;
            };

            Dictionary.prototype.getIndex = function (key) {
                return key.getHashCode() % this._numberOfBuckets;
            };

            Dictionary.prototype.getElements = function (key) {
                var index = this.getIndex(key);
                return this._hashTable[index];
            };

            Dictionary.prototype.getPair = function (elements, hashTable, numberOfBuckets, key) {
                if (elements === undefined)
                    return null;

                var current;
                for (var i = 0, elementsLength = elements.length; i < elementsLength; i++) {
                    current = elements[i];
                    if (current.key.equals(key))
                        return current;
                }

                return null;
            };

            Dictionary.prototype.addWithoutRebalancing = function (hashTable, numberOfBuckets, pair, checkForExistance) {
                if (typeof checkForExistance === "undefined") { checkForExistance = true; }
                var keyHashCode = pair.key.getHashCode() % numberOfBuckets;
                var elements = hashTable[keyHashCode];
                if (elements === undefined) {
                    elements = [];
                    hashTable[keyHashCode] = elements;
                }

                if (checkForExistance) {
                    var foundPair = this.getPair(elements, hashTable, numberOfBuckets, pair.key);

                    if (u.isDefined(foundPair)) {
                        foundPair.value = pair.value;
                        return false;
                    }
                }

                elements.push(pair);
                return true;
            };

            Dictionary.prototype.rebalanceIfNecessary = function () {
                if (this._numberOfElements > (DictionaryUtilities.loadFactor * this._numberOfBuckets))
                    this.rebalance();
            };

            Dictionary.prototype.rebalance = function () {
                var currentBucketIndex = this._bucketIndex, currentNumberOfBuckets = this._numberOfBuckets, currentHashTable = this._hashTable, nextBucketIndex = currentBucketIndex + 1, nextNumberOfBuckets = DictionaryUtilities.getNumberOfBuckets(nextBucketIndex), nextHashTable = {}, elements;

                for (var i = 0; i < currentNumberOfBuckets; i++) {
                    elements = currentHashTable[i];
                    if (u.isDefined(elements)) {
                        for (var j = 0, elementsLength = elements.length; j < elementsLength; j++) {
                            this.addWithoutRebalancing(nextHashTable, nextNumberOfBuckets, elements[j], false);
                        }
                    }
                }

                this._bucketIndex = nextBucketIndex;
                this._numberOfBuckets = nextNumberOfBuckets;
                this._hashTable = nextHashTable;
            };
            return Dictionary;
        })();
        Collections.Dictionary = Dictionary;

        var DictionaryUtilities = (function () {
            function DictionaryUtilities() {
                Classical.Assert.staticClass();
            }
            DictionaryUtilities.getNumberOfBuckets = function (numberOfRebalances) {
                var result = numberOfBuckets[numberOfRebalances];
                Classical.Assert.isDefined(result, 'The maximum size for a Dictionary has been exceeded.');

                return result;
            };

            DictionaryUtilities.capacityToBucketIndex = function (capacity) {
                var bucketValue = capacity / DictionaryUtilities.loadFactor, currentBucketValue;
                for (var i = 0, length = numberOfBuckets.length; i < length; i++) {
                    currentBucketValue = numberOfBuckets[i];
                    if (currentBucketValue > bucketValue)
                        return i;
                }

                Classical.Assert.isInvalid('The capacity is too large for the dictionary.');
            };
            DictionaryUtilities.loadFactor = 2;
            return DictionaryUtilities;
        })();

        var DictionaryEnumerator = (function () {
            function DictionaryEnumerator(dictionary) {
                this._index = -1;
                Classical.Assert.isDefined(dictionary);
                this._hashTable = dictionary._hashTable;
                this._numberOfBuckets = dictionary._numberOfBuckets;
                this._bucketIndex = 0;
                this._elements = this._hashTable[this._bucketIndex];
            }
            Object.defineProperty(DictionaryEnumerator.prototype, "current", {
                get: function () {
                    return this._elements[this._index];
                },
                enumerable: true,
                configurable: true
            });

            DictionaryEnumerator.prototype.moveNext = function () {
                var bucketIndex = this._bucketIndex, numberOfBuckets = this._numberOfBuckets, elements = this._elements, hashTable = this._hashTable;

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
            };
            return DictionaryEnumerator;
        })();

        var DictionaryKeyCollection = (function () {
            function DictionaryKeyCollection(dictionary) {
                Classical.Assert.isDefined(dictionary);
                this._dictionary = dictionary;
            }
            DictionaryKeyCollection.prototype.getEnumerator = function () {
                return new DictionaryKeyEnumerator(this._dictionary);
            };

            DictionaryKeyCollection.prototype.query = function () {
                return new Collections.Queryable(this);
            };

            DictionaryKeyCollection.prototype.forEach = function (operation) {
                forEach(this, operation);
            };

            DictionaryKeyCollection.prototype.array = function () {
                var array = new Array();
                this.forEach(function (pair) {
                    return array.add(pair);
                });
                return array;
            };

            DictionaryKeyCollection.prototype.count = function () {
                return this._dictionary.count();
            };
            return DictionaryKeyCollection;
        })();

        var DictionaryKeyEnumerator = (function () {
            function DictionaryKeyEnumerator(dictionary) {
                Classical.Assert.isDefined(dictionary);
                this._dictionaryEnumerator = dictionary.getEnumerator();
            }
            Object.defineProperty(DictionaryKeyEnumerator.prototype, "current", {
                get: function () {
                    return this._dictionaryEnumerator.current.key;
                },
                enumerable: true,
                configurable: true
            });

            DictionaryKeyEnumerator.prototype.moveNext = function () {
                return this._dictionaryEnumerator.moveNext();
            };
            return DictionaryKeyEnumerator;
        })();

        var KeyValuePair = (function () {
            function KeyValuePair(key, value) {
                this.key = key;
                this.value = value;
            }
            return KeyValuePair;
        })();
        Collections.KeyValuePair = KeyValuePair;

        function forEach(items, operation) {
            var enumerator = items.getEnumerator(), current;

            while (enumerator.moveNext()) {
                var current = enumerator.current;
                operation.bind(current)(current);
            }
        }
    })(Classical.Collections || (Classical.Collections = {}));
    var Collections = Classical.Collections;
})(Classical || (Classical = {}));

function typeOf(ctor) {
    return Classical.Reflection.Type.getType(ctor);
}

function moduleOf(ctor) {
    var type = typeOf(ctor);
    if (!type)
        return null;

    return Classical.Reflection.Module.getModule(type);
}

var Classical;
(function (Classical) {
    (function (Reflection) {
        var u = Classical.Utilities;
        var c = Classical.Collections;

        (function (Modifier) {
            Modifier[Modifier["Public"] = 0] = "Public";
            Modifier[Modifier["Protected"] = 1] = "Protected";
            Modifier[Modifier["Private"] = 2] = "Private";
            Modifier[Modifier["Instance"] = 3] = "Instance";
            Modifier[Modifier["Static"] = 4] = "Static";
        })(Reflection.Modifier || (Reflection.Modifier = {}));
        var Modifier = Reflection.Modifier;

        var defaultModifier = [0 /* Public */, 3 /* Instance */];

        var Module = (function () {
            function Module(password, name, scope, base) {
                Classical.Assert.isTrue(password === constructorPassword, 'You do not have permission to create instances of this type.');

                if (base && base != Module.global)
                    this._fullName = u.format("{0}.{1}", base.fullName, name);
                else
                    this._fullName = name;

                this._name = name;
                this._scope = scope;
                this._base = base;
            }
            Object.defineProperty(Module.prototype, "name", {
                get: function () {
                    return this._name;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Module.prototype, "fullName", {
                get: function () {
                    return this._fullName;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Module.prototype, "scope", {
                get: function () {
                    return this._scope;
                },
                enumerable: true,
                configurable: true
            });

            Module.prototype.getModules = function () {
                if (!this._modules)
                    this._modules = this._initializeModules();

                return this._modules.array().query();
            };

            Module.prototype.getTypes = function () {
                if (!this._types)
                    this._types = this._initializeTypes();

                return this._types.array().query();
            };

            Module.prototype.getFunctions = function () {
                if (!this._functions)
                    this._functions = this._initializeFunctions();

                return this._functions.array().query();
            };

            Module.prototype.getVariables = function () {
                if (!this._variables)
                    this._variables = this._initializeVariables();

                return this._variables.array().query();
            };

            Module.prototype._initializeModules = function () {
                var initializedModules = [];
                var scope = this.scope;
                var moduleProperties = Object.getOwnPropertyNames(scope);

                for (var i = 0; i < moduleProperties.length; i++) {
                    var modulePropertyName = moduleProperties[i];
                    var moduleProperty = scope[modulePropertyName];

                    if (Module._isModule(moduleProperty, modulePropertyName)) {
                        var obj = moduleProperty;
                        if (Object.isFrozen(obj))
                            continue;

                        var newModule = modules.getValue(obj);
                        if (newModule === undefined) {
                            newModule = new Module(constructorPassword, modulePropertyName, moduleProperty, this);
                            modules.add(obj, newModule);
                        }

                        initializedModules.add(newModule);
                    }
                }

                return initializedModules;
            };

            Module.prototype._initializeTypes = function () {
                var initializedTypes = [];
                var scopeProperties = Object.getOwnPropertyNames(this._scope);

                for (var i = 0; i < scopeProperties.length; i++) {
                    var propertyName = scopeProperties[i];

                    if (propertyName == 'constructor' || propertyName.indexOf('_') === 0)
                        continue;

                    var property = this._scope[propertyName];

                    if (Module._isType(property)) {
                        var ctor = property;
                        var type = types.getValue(ctor);
                        if (type === undefined) {
                            type = new Type(constructorPassword, ctor, this);
                            types.add(ctor, type);
                        } else if (!type._module) {
                            type._module = this;
                        }

                        initializedTypes.add(type);
                    }
                }

                return initializedTypes;
            };

            Module.prototype._initializeFunctions = function () {
                var initializedFunctions = [];
                var scopeProperties = Object.getOwnPropertyNames(this._scope);

                for (var i = 0; i < scopeProperties.length; i++) {
                    var propertyName = scopeProperties[i];
                    var property = this._scope[propertyName];

                    if (!Module._isType(property) && u.isFunction(property)) {
                        var func = new Function(constructorPassword, propertyName, true, property);
                        initializedFunctions.add(func);
                    }
                }

                return initializedFunctions;
            };

            Module.prototype._initializeVariables = function () {
                var initializedVariables = new Array();
                var scopeProperties = Object.getOwnPropertyNames(this._scope).query().where(function (p) {
                    return p !== '_hashCode';
                }).array();

                for (var i = 0; i < scopeProperties.length; i++) {
                    var propertyName = scopeProperties[i];
                    var property = this._scope[propertyName];

                    if (!u.isFunction(property) && !Module._isModule(property)) {
                        var variable = new Variable(constructorPassword, propertyName, this);
                        initializedVariables.add(variable);
                    }
                }

                return initializedVariables;
            };

            Module.prototype._findModule = function (type) {
                var _this = this;
                var foundType = false;

                this.getTypes().forEach(function (t) {
                    if (t === type)
                        foundType = true;
                    else
                        t._module = _this;
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
            };

            Object.defineProperty(Module, "global", {
                get: function () {
                    if (!Module._global) {
                        Module._global = new Module(constructorPassword, 'Global', window);
                        modules.add(window, Module._global);
                    }

                    return Module._global;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Module, "anonymous", {
                get: function () {
                    if (!Module._anonymous)
                        Module._anonymous = new Module(constructorPassword, 'Anonymous', Classical.Anonymous);

                    return Module._anonymous;
                },
                enumerable: true,
                configurable: true
            });

            Module.getModule = function (type) {
                Classical.Assert.isDefined(type);
                if (type._module)
                    return type._module;

                var foundModule = Module.global._findModule(type);
                if (foundModule) {
                    type._module = foundModule;
                    return foundModule;
                }

                type._module = Module.anonymous;
                return Module._anonymous;
            };

            Module._isModule = function (moduleCandidate, moduleName) {
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
            };

            Module._isType = function (typeCandidate) {
                return typeCandidate === Object || (u.isFunction(typeCandidate) && u.isDefined(typeCandidate.prototype) && !u.isEmptyObject(typeCandidate.prototype));
            };
            return Module;
        })();
        Reflection.Module = Module;

        var Type = (function () {
            function Type(password, ctor, mod) {
                this._base = null;
                this._name = null;
                Classical.Assert.isTrue(password === constructorPassword, 'You do not have permission to create instances of this type.');

                this._ctor = ctor;

                if (mod)
                    this._module = mod;
            }
            Object.defineProperty(Type.prototype, "isPublic", {
                get: function () {
                    return !this.isPrivate && !this.isProtected;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Type.prototype, "isPrivate", {
                get: function () {
                    return this.name.indexOf('_') === 0;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Type.prototype, "isProtected", {
                get: function () {
                    return this.name.indexOf('$') === 0;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Type.prototype, "isPrimitive", {
                get: function () {
                    return this === typeOf(Boolean) || this === typeOf(String) || this === typeOf(Number);
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Type.prototype, "name", {
                get: function () {
                    if (this._name === null) {
                        var name = this._ctor.name;
                        if (u.isNullOrUndefined(name)) {
                            var match = this._ctor.toString().match(/\s([\w\d]+)\(/);
                            if (match && match.length > 1)
                                name = match[1];
                        }
                        if (u.isNullOrUndefined(name))
                            name = "`Anonymous";
                        this._name = name;
                    }

                    return this._name;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Type.prototype, "fullName", {
                get: function () {
                    if (this.module)
                        return u.format("{0}.{1}", this.module.name, this.name);
                    else
                        return this.name;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Type.prototype, "ctor", {
                get: function () {
                    return this._ctor;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Type.prototype, "prototype", {
                get: function () {
                    return this._ctor.prototype;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Type.prototype, "base", {
                get: function () {
                    if (this._base === null) {
                        var prototype = Object.getPrototypeOf(this.ctor.prototype);
                        if (prototype == null || Classical.Utilities.isFunction(!prototype.getType))
                            return null;

                        this._base = prototype.getType();
                    }

                    return this._base;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Type.prototype, "module", {
                get: function () {
                    if (!this._module)
                        this._module = Module.getModule(this);

                    return this._module;
                },
                enumerable: true,
                configurable: true
            });

            Type.prototype.toString = function () {
                return this.name;
            };

            Type.prototype.equals = function (other) {
                if (u.isNullOrUndefined(other) || !other.is(Type))
                    return false;

                var otherType = other;
                return this.ctor === otherType.ctor;
            };

            Type.prototype.getHashCode = function () {
                return this._ctor.getHashCode();
            };

            Type.prototype.isAssignableTo = function (other) {
                var ctor = this.ctor, otherCtor = other.ctor, prototype = null;

                while (Classical.Utilities.isDefined(ctor)) {
                    if (ctor === otherCtor)
                        return true;

                    prototype = Object.getPrototypeOf(ctor.prototype);
                    if (Classical.Utilities.isDefined(prototype))
                        ctor = prototype['constructor'];
                    else
                        ctor = null;
                }

                return false;
            };

            Type.prototype.isAssignableFrom = function (other) {
                if (u.isNullOrUndefined(other))
                    return false;

                return other.isAssignableTo(this);
            };

            Type.prototype.getFields = function () {
                var options = [];
                for (var _i = 0; _i < (arguments.length - 0); _i++) {
                    options[_i] = arguments[_i + 0];
                }
                return this.getProperties.apply(this, options).where(function (p) {
                    return p.isField;
                }).cast();
            };

            Type.prototype.getField = function (name) {
                var options = [];
                for (var _i = 0; _i < (arguments.length - 1); _i++) {
                    options[_i] = arguments[_i + 1];
                }
                Classical.Assert.isDefined(name);

                return this.getFields.apply(this, options).query().singleOrDefault(function (f) {
                    return f.name === name;
                });
                ;
            };

            Type.prototype.getProperties = function () {
                var _this = this;
                var options = [];
                for (var _i = 0; _i < (arguments.length - 0); _i++) {
                    options[_i] = arguments[_i + 0];
                }
                if (!this._properties)
                    this._initializeProperties();

                options = this._getProperOptions(options);

                return this._properties.array().query().where(function (p) {
                    return _this._isValidProperty(p, options);
                }).distinct();
            };

            Type.prototype.getProperty = function (name) {
                var options = [];
                for (var _i = 0; _i < (arguments.length - 1); _i++) {
                    options[_i] = arguments[_i + 1];
                }
                Classical.Assert.isDefined(name);

                return this.getProperties.apply(this, options).query().singleOrDefault(function (p) {
                    return p.name === name;
                });
                ;
            };

            Type.prototype.getMethods = function () {
                var options = [];
                for (var _i = 0; _i < (arguments.length - 0); _i++) {
                    options[_i] = arguments[_i + 0];
                }
                return this.getProperties.apply(this, options).where(function (p) {
                    return p.isMethod;
                }).cast();
            };

            Type.prototype.getMethod = function (name) {
                var options = [];
                for (var _i = 0; _i < (arguments.length - 1); _i++) {
                    options[_i] = arguments[_i + 1];
                }
                Classical.Assert.isDefined(name);

                return this.getMethods.apply(this, options).query().singleOrDefault(function (m) {
                    return m.name === name;
                });
                ;
            };

            Type.prototype._initializeProperties = function () {
                var properties = new Array();
                var instance = this._ctor.prototype;

                properties.addRange(this._getStaticProperties());
                properties.addRange(this._getInstanceProperties());

                var baseType = this.base;
                if (Classical.Utilities.isDefined(baseType)) {
                    var baseTypeProperties = baseType.getProperties();
                    var propertiesToRemove = new Array();

                    properties.forEach(function (p) {
                        var baseTypeProperty = baseTypeProperties.singleOrDefault(function (prop) {
                            return prop.name == p.name;
                        });
                        if (baseTypeProperty) {
                            p._declaringType = baseTypeProperty.declaringType;
                            propertiesToRemove.add(p);
                        }
                    });

                    propertiesToRemove.forEach(function (p) {
                        properties.remove(p);
                    });

                    properties.addRange(baseTypeProperties);
                }

                this._properties = properties;
            };

            Type.prototype._getStaticProperties = function () {
                var _this = this;
                var properties = new Array();
                var instance = this._ctor.prototype;

                Object.getOwnPropertyNames(this._ctor).forEach(function (property) {
                    var propertyDescriptor = Object.getOwnPropertyDescriptor(_this._ctor, property);
                    var getter = propertyDescriptor.get;
                    var setter = propertyDescriptor.set;

                    if (Classical.Utilities.isDefined(getter) || Classical.Utilities.isDefined(setter))
                        properties.add(new Property(constructorPassword, property, typeOf(instance.constructor), propertyDescriptor, Classical.Utilities.isDefined(getter), Classical.Utilities.isDefined(setter), false, false, true));
                    else if (Classical.Utilities.isFunction(propertyDescriptor.value))
                        properties.add(new Method(constructorPassword, property, typeOf(instance.constructor), propertyDescriptor, propertyDescriptor.writable, propertyDescriptor.value, true));
                    else if (!Classical.Utilities.isDefined(getter) && !Classical.Utilities.isDefined(setter))
                        properties.add(new Field(constructorPassword, property, typeOf(instance.constructor), true));
                });

                return properties;
            };

            Type.prototype._getInstanceProperties = function () {
                var properties = new Array();
                var instance = this._ctor.prototype;

                Object.getOwnPropertyNames(instance).forEach(function (property) {
                    var propertyDescriptor = Object.getOwnPropertyDescriptor(instance, property);
                    var getter = propertyDescriptor.get;
                    var setter = propertyDescriptor.set;

                    if (Classical.Utilities.isDefined(getter) || Classical.Utilities.isDefined(setter))
                        properties.add(new Property(constructorPassword, property, typeOf(instance.constructor), propertyDescriptor, Classical.Utilities.isDefined(getter), Classical.Utilities.isDefined(setter), false, false, false));
                    else if (Classical.Utilities.isFunction(propertyDescriptor.value))
                        properties.add(new Method(constructorPassword, property, typeOf(instance.constructor), propertyDescriptor, propertyDescriptor.writable, propertyDescriptor.value, false));
                    else if (!Classical.Utilities.isDefined(getter) && !Classical.Utilities.isDefined(setter))
                        properties.add(new Field(constructorPassword, property, typeOf(instance.constructor), true));
                });

                return properties;
            };

            Type.prototype._getProperOptions = function (optionsList) {
                if (!optionsList || optionsList.length === 0)
                    return defaultModifier;

                var options = optionsList.query().distinct().array().query();
                var result = options.array();

                if (options.hasNone(function (o) {
                    return o === 0 /* Public */;
                }) && options.hasNone(function (o) {
                    return o === 1 /* Protected */;
                }) && options.hasNone(function (o) {
                    return o === 2 /* Private */;
                }))
                    result.add(0 /* Public */);
                if (options.hasNone(function (o) {
                    return o === 4 /* Static */;
                }) && options.hasNone(function (o) {
                    return o === 3 /* Instance */;
                }))
                    result.add(3 /* Instance */);

                return result;
            };

            Type.prototype._isValidProperty = function (property, modifiers) {
                var modifierQuery = modifiers.query();
                var accessModifiers = modifierQuery.where(function (m) {
                    return m !== 3 /* Instance */ && m !== 4 /* Static */;
                });
                var isValidAccessor = false;

                accessModifiers.forEach(function (m) {
                    switch (m) {
                        case 0 /* Public */: {
                            if (property.isPublic)
                                isValidAccessor = true;

                            break;
                        }
                        case 1 /* Protected */: {
                            if (property.isProtected)
                                isValidAccessor = true;

                            break;
                        }
                        case 2 /* Private */: {
                            if (property.isPrivate)
                                isValidAccessor = true;

                            break;
                        }
                    }
                });

                if (modifierQuery.hasAny(function (m) {
                    return m === 3 /* Instance */;
                }))
                    return isValidAccessor && !property.isStatic;
                else if (modifierQuery.hasAny(function (m) {
                    return m === 4 /* Static */;
                }))
                    return isValidAccessor && property.isStatic;

                return false;
            };

            Type.getType = function (ctor) {
                Classical.Assert.isDefined(ctor, 'The constructor is not defined.');
                var type = types.getValue(ctor);
                if (type === undefined) {
                    type = new Type(constructorPassword, ctor);
                    types.add(ctor, type);
                }

                return type;
            };
            return Type;
        })();
        Reflection.Type = Type;

        var Member = (function () {
            function Member(password, name, declaringType, isStatic) {
                Classical.Assert.isTrue(password === constructorPassword, 'You do not have permission to create instances of this type.');

                this._name = name;
                this._declaringType = declaringType;
                this._isStatic = isStatic;
            }
            Object.defineProperty(Member.prototype, "name", {
                get: function () {
                    return this._name;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Member.prototype, "declaringType", {
                get: function () {
                    return this._declaringType;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Member.prototype, "isStatic", {
                get: function () {
                    return this._isStatic;
                },
                enumerable: true,
                configurable: true
            });
            return Member;
        })();
        Reflection.Member = Member;

        var Property = (function (_super) {
            __extends(Property, _super);
            function Property(password, name, declaringType, propertyDescriptor, canRead, canWrite, isMethod, isField, isStatic) {
                _super.call(this, password, name, declaringType, isStatic);

                this._canWrite = canWrite;
                this._canRead = canRead;
                this._isMethod = isMethod;
                this._isField = isField;
                this._propertyDescriptor = propertyDescriptor;
            }
            Object.defineProperty(Property.prototype, "isPublic", {
                get: function () {
                    return !this.isPrivate && !this.isProtected;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Property.prototype, "isPrivate", {
                get: function () {
                    return this.name.indexOf('_') === 0;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Property.prototype, "isProtected", {
                get: function () {
                    return this.name.indexOf('$') === 0;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Property.prototype, "canWrite", {
                get: function () {
                    return this._canWrite;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Property.prototype, "canRead", {
                get: function () {
                    return this._canRead;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Property.prototype, "enumerable", {
                get: function () {
                    return this._propertyDescriptor && this._propertyDescriptor.enumerable;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Property.prototype, "configurable", {
                get: function () {
                    return this._propertyDescriptor && this._propertyDescriptor.configurable;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Property.prototype, "isMethod", {
                get: function () {
                    return this._isMethod;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Property.prototype, "isField", {
                get: function () {
                    return this._isField;
                },
                enumerable: true,
                configurable: true
            });

            Property.prototype.getValue = function (instance) {
                Classical.Assert.isDefined(instance);

                if (this.isStatic)
                    return this.declaringType.ctor[this.name];

                var type = typeOf(instance.constructor);
                var property = type.getProperty(this.name);

                if (Classical.Utilities.isNullOrUndefined(property))
                    throw Classical.Utilities.format('The property does not exist on type {0}.', type.name);
                else if (!property.canRead)
                    throw 'The property cannot be read.';

                var instanceType = instance.getType();

                if (instanceType && instanceType.ctor !== instance.constructor) {
                    var prototype = instanceType.prototype;
                    while (prototype) {
                        if (instanceType.ctor === prototype.constructor) {
                            return prototype[this.name];
                        }

                        var prototypeType = prototype.getType();
                        if (prototypeType)
                            prototype = prototypeType.prototype;
                        else
                            prototype = undefined;
                    }
                }

                return instance[this.name];
            };

            Property.prototype.setValue = function (instance, value) {
                Classical.Assert.isDefined(instance);

                if (this.isStatic) {
                    this.declaringType.ctor[this.name] = value;
                    return;
                }

                var type = typeOf(instance.constructor);
                var property = type.getProperty(this.name);

                if (Classical.Utilities.isNullOrUndefined(property))
                    throw Classical.Utilities.format('The property does not exist on type {0}.', type.name);
                else if (!property.canWrite)
                    throw 'The property cannot be written to.';

                instance[this.name] = value;
            };
            return Property;
        })(Member);
        Reflection.Property = Property;

        var Field = (function (_super) {
            __extends(Field, _super);
            function Field(password, name, declaringType, isStatic) {
                _super.call(this, password, name, declaringType, null, true, true, false, true, isStatic);
            }
            Object.defineProperty(Field.prototype, "isPublic", {
                get: function () {
                    return !this.isPrivate && !this.isProtected;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Field.prototype, "isPrivate", {
                get: function () {
                    return this.name.indexOf('_') === 0;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Field.prototype, "isProtected", {
                get: function () {
                    return this.name.indexOf('$') === 0;
                },
                enumerable: true,
                configurable: true
            });

            Field.prototype.getValue = function (instance) {
                Classical.Assert.isDefined(instance);

                if (this.isStatic)
                    return this.declaringType.ctor[this.name];

                var type = typeOf(instance.constructor);
                var property = type.getProperty(this.name);

                if (Classical.Utilities.isNullOrUndefined(property))
                    throw Classical.Utilities.format('The property does not exist on type {0}.', type.name);
                else if (!property.canRead)
                    throw 'The property cannot be read.';

                var instanceType = instance.getType();

                if (instanceType && instanceType.ctor !== instance.constructor) {
                    var prototype = instanceType.prototype;
                    while (prototype) {
                        if (instanceType.ctor === prototype.constructor) {
                            return prototype[this.name];
                        }

                        var prototypeType = prototype.getType();
                        if (prototypeType)
                            prototype = prototypeType.prototype;
                        else
                            prototype = undefined;
                    }
                }

                return instance[this.name];
            };

            Field.prototype.setValue = function (instance, value) {
                Classical.Assert.isDefined(instance);

                if (this.isStatic) {
                    this.declaringType.ctor[this.name] = value;
                    return;
                }

                var type = typeOf(instance.constructor);
                var property = type.getProperty(this.name);

                if (Classical.Utilities.isNullOrUndefined(property))
                    throw Classical.Utilities.format('The property does not exist on type {0}.', type.name);
                else if (!property.canWrite)
                    throw 'The property cannot be written to.';

                instance[this.name] = value;
            };
            return Field;
        })(Property);
        Reflection.Field = Field;

        var Variable = (function (_super) {
            __extends(Variable, _super);
            function Variable(password, name, module) {
                Classical.Assert.isDefined(module);

                _super.call(this, password, name, null, null, true, true, false, false, true);
            }
            Object.defineProperty(Variable.prototype, "module", {
                get: function () {
                    return this._module;
                },
                enumerable: true,
                configurable: true
            });
            return Variable;
        })(Property);
        Reflection.Variable = Variable;

        var Method = (function (_super) {
            __extends(Method, _super);
            function Method(password, name, declaringType, propertyDescriptor, canWrite, underlyingFunction, isStatic) {
                _super.call(this, password, name, declaringType, propertyDescriptor, true, canWrite, true, false, isStatic);

                this._underlyingFunction = underlyingFunction;
            }
            Method.prototype.invoke = function (instance) {
                var args = [];
                for (var _i = 0; _i < (arguments.length - 1); _i++) {
                    args[_i] = arguments[_i + 1];
                }
                Classical.Assert.isDefined(instance);

                if (this.isStatic)
                    return this.declaringType.ctor[this.name].apply(null, args);

                var type = typeOf(instance.constructor);
                var method = type.getMethod(this.name);

                if (Classical.Utilities.isNullOrUndefined(method))
                    throw Classical.Utilities.format('The method does not exist on type {0}.', type.name);

                return instance[this.name].apply(instance, args);
            };

            Method.prototype.getParameters = function () {
                if (!this._parameters)
                    this._parameters = this._initializeParameters();

                return this._parameters.array().query();
            };

            Method.prototype._initializeParameters = function () {
                var initializedParameters = new Array();
                var parameterNames = Classical.Expression.getArguments(this._underlyingFunction);

                for (var i = 0; i < parameterNames.length; i++) {
                    var parameterName = parameterNames[i];
                    var parameter = new Parameter(constructorPassword, parameterName, i);
                    initializedParameters.add(parameter);
                }

                return initializedParameters;
            };
            return Method;
        })(Property);
        Reflection.Method = Method;

        var Function = (function (_super) {
            __extends(Function, _super);
            function Function(password, name, canWrite, underlyingFunction) {
                _super.call(this, password, name, null, null, canWrite, underlyingFunction, true);
            }
            return Function;
        })(Method);
        Reflection.Function = Function;

        var Parameter = (function () {
            function Parameter(password, name, position) {
                Classical.Assert.isTrue(password === constructorPassword, 'You do not have permission to create instances of this type.');

                this._name = name;
                this._position = position;
            }
            Object.defineProperty(Parameter.prototype, "name", {
                get: function () {
                    return this._name;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Parameter.prototype, "position", {
                get: function () {
                    return this._position;
                },
                enumerable: true,
                configurable: true
            });
            return Parameter;
        })();
        Reflection.Parameter = Parameter;

        var modules = new c.Dictionary(5000);
        var types = new c.Dictionary(5000);

        var constructorPassword = Math.random();
    })(Classical.Reflection || (Classical.Reflection = {}));
    var Reflection = Classical.Reflection;
})(Classical || (Classical = {}));







var Classical;
(function (Classical) {
    (function (Collections) {
        var u = Classical.Utilities;
        var r = Classical.Reflection;
        var ce = Classical.Collections.Enumerable;

        var ArrayPrototype = Array.prototype;

        ArrayPrototype.getEnumerator = function () {
            return new ArrayEnumerator(this);
        };

        ArrayPrototype.array = function () {
            return this;
        };

        ArrayPrototype.query = function () {
            return new Queryable(this);
        };

        ArrayPrototype.count = function () {
            return this.length;
        };

        ArrayPrototype.equals = function (other) {
            return this === other;
        };

        ArrayPrototype.is = function (type) {
            if (Classical.Utilities.isNullOrUndefined(type))
                return true;

            return this.getType().isAssignableTo(typeOf(type));
        };

        ArrayPrototype.getType = function () {
            if (this._type == null) {
                this._type = r.Type.getType(this.constructor);
            }

            return this._type;
        };

        ArrayPrototype.getHashCode = function () {
            if (this._hashCode == undefined)
                this._hashCode = Classical.Hash.forNumber(Math.random());

            return this._hashCode;
        };

        var ArrayEnumerator = (function () {
            function ArrayEnumerator(array) {
                this._index = -1;
                Classical.Assert.isDefined(array);
                this._array = array;
            }
            Object.defineProperty(ArrayEnumerator.prototype, "current", {
                get: function () {
                    return this._array[this._index];
                },
                enumerable: true,
                configurable: true
            });

            ArrayEnumerator.prototype.moveNext = function () {
                this._index++;
                return this._index < this._array.length;
            };
            return ArrayEnumerator;
        })();

        var ImmutableCollection = (function () {
            function ImmutableCollection(elements) {
                Classical.Assert.isDefined(elements, 'The elements of the ImmutableCollection are not defined.');

                var elementsCopy = copy(elements);
                this._get = function (element, index) {
                    switch (element) {
                        case 0 /* Copy */:
                            return copy(elementsCopy);
                        case 1 /* Count */:
                            return elementsCopy.length;
                        case 2 /* Item */:
                            return elementsCopy[index];
                        default:
                            return null;
                    }
                };
            }
            ImmutableCollection.prototype.get = function (index) {
                return this._get(2 /* Item */, index);
            };

            ImmutableCollection.prototype.getEnumerator = function () {
                return this._get(0 /* Copy */).getEnumerator();
            };

            ImmutableCollection.prototype.query = function () {
                return this._get(0 /* Copy */).query();
            };

            ImmutableCollection.prototype.forEach = function (operation) {
                ce.forEach(this, operation);
            };

            ImmutableCollection.prototype.array = function () {
                return this._get(0 /* Copy */).array();
            };

            ImmutableCollection.prototype.count = function () {
                return this._get(1 /* Count */);
            };
            return ImmutableCollection;
        })();
        Collections.ImmutableCollection = ImmutableCollection;

        var Element;
        (function (Element) {
            Element[Element["Copy"] = 0] = "Copy";
            Element[Element["Count"] = 1] = "Count";
            Element[Element["Item"] = 2] = "Item";
        })(Element || (Element = {}));

        function copy(elements) {
            var result;
            if (u.isArray(elements))
                result = elements.slice(0);
            else
                result = elements.array().slice(0);

            return result;
        }

        var Queryable = (function () {
            function Queryable(enumerable) {
                Classical.Assert.isDefined(enumerable);
                this._enumerable = enumerable;
            }
            Queryable.prototype.toString = function () {
                return this.array().toString();
            };

            Queryable.prototype.getEnumerator = function () {
                return this._enumerable.getEnumerator();
            };

            Queryable.prototype.query = function () {
                return this;
            };

            Queryable.prototype.array = function () {
                var result = new Array(), enumerator = this.getEnumerator();
                while (enumerator.moveNext()) {
                    result.push(enumerator.current);
                }
                return result;
            };

            Queryable.prototype.count = function () {
                var result = 0, enumerator = this.getEnumerator();
                while (enumerator.moveNext()) {
                    result++;
                }
                return result;
            };

            Queryable.prototype.forEach = function (operation) {
                var enumerator = this.getEnumerator(), current;

                while (enumerator.moveNext()) {
                    var current = enumerator.current;
                    operation.bind(current)(current);
                }

                return this;
            };

            Queryable.prototype.cast = function () {
                return this;
            };

            Queryable.prototype.where = function (predicate) {
                return new WhereQueryable(this, predicate);
            };

            Queryable.prototype.select = function (selector) {
                return new SelectQueryable(this, selector);
            };

            Queryable.prototype.selectMany = function (selector) {
                return new ConcatQueryable(this.select(selector));
            };

            Queryable.prototype.orderBy = function (selector, comparison) {
                var result = this.array();
                var comparer = getComparer(result, selector, comparison, true);

                return result.sort(comparer).query();
            };

            Queryable.prototype.orderByDescending = function (selector, comparison) {
                var ordered = this.orderBy(selector, comparison);
                return ordered.where(function (i) {
                    return u.isDefined(i);
                }).reverse().concat(ordered.where(function (i) {
                    return !u.isDefined(i);
                }));
            };

            Queryable.prototype.aggregate = function (accumulator, seed) {
                Classical.Assert.isDefined(accumulator, 'No accumulator was specified.');
                var result = seed, skipFirst = false;

                if (arguments.length == 1) {
                    skipFirst = true;
                    result = this.firstOrDefault();
                    if (result === null && this.hasNone())
                        result = undefined;
                }

                var firstPass = true;
                this.forEach(function (item) {
                    if (skipFirst && firstPass) {
                        firstPass = false;
                        return;
                    }

                    result = accumulator(result, item);
                });

                return result;
            };

            Queryable.prototype.sum = function (selector) {
                if (this.hasNone())
                    return undefined;
                if (!selector)
                    selector = function (item) {
                        return item;
                    };

                return this.aggregate(function (first, second) {
                    return first + selector(second);
                }, 0);
            };

            Queryable.prototype.max = function (selector) {
                if (this.hasNone())
                    return undefined;
                if (!selector)
                    selector = function (item) {
                        return item;
                    };

                var result = this.aggregate(function (first, second) {
                    var secondValue = selector(second);
                    if (first > secondValue)
                        return first;
                    return secondValue;
                }, -Infinity);

                if (u.isInfinity(result) && this.hasNone(function (i) {
                    return selector(i) === result;
                })) {
                    return undefined;
                }

                return result;
            };

            Queryable.prototype.min = function (selector) {
                if (this.hasNone())
                    return undefined;
                if (!selector)
                    selector = function (item) {
                        return item;
                    };

                var result = this.aggregate(function (first, second) {
                    var secondValue = selector(second);
                    if (first < secondValue)
                        return first;
                    return secondValue;
                }, Infinity);

                if (u.isInfinity(result) && this.hasNone(function (i) {
                    return selector(i) === result;
                })) {
                    return undefined;
                }

                return result;
            };

            Queryable.prototype.hasNone = function (predicate) {
                return !this.hasAny(predicate);
            };

            Queryable.prototype.hasAny = function (predicate) {
                predicate = this.coalescePredicate(predicate);
                return new WhereQueryable(this._enumerable, predicate).getEnumerator().moveNext();
            };

            Queryable.prototype.first = function (predicate) {
                predicate = this.coalescePredicate(predicate);
                var result = this.where(predicate), enumerator = result.getEnumerator();

                Classical.Assert.isTrue(enumerator.moveNext(), 'The sequence does not have a first element.');

                return enumerator.current;
            };

            Queryable.prototype.firstOrDefault = function (predicate) {
                predicate = this.coalescePredicate(predicate);
                var result = this.where(predicate), enumerator = result.getEnumerator();

                if (!enumerator.moveNext())
                    return null;

                return enumerator.current;
            };

            Queryable.prototype.last = function (predicate) {
                return this.reverse().first(predicate);
            };

            Queryable.prototype.lastOrDefault = function (predicate) {
                return this.reverse().firstOrDefault(predicate);
            };

            Queryable.prototype.single = function (predicate) {
                predicate = this.coalescePredicate(predicate);
                var result = this.where(predicate), enumerator = result.getEnumerator();

                Classical.Assert.isTrue(enumerator.moveNext(), 'The sequence does not have any matching elements.');

                var current = enumerator.current;
                Classical.Assert.isFalse(enumerator.moveNext(), 'The sequence has more than one matching element.');

                return current;
            };

            Queryable.prototype.singleOrDefault = function (predicate) {
                predicate = this.coalescePredicate(predicate);
                var result = this.where(predicate), enumerator = result.getEnumerator();

                if (!enumerator.moveNext())
                    return null;

                var current = enumerator.current;
                Classical.Assert.isFalse(enumerator.moveNext(), 'The sequence has more than one matching element.');

                return current;
            };

            Queryable.prototype.skip = function (count) {
                return new SkipQueryable(this, count);
            };

            Queryable.prototype.take = function (count) {
                return new TakeQueryable(this, count);
            };

            Queryable.prototype.at = function (index) {
                Classical.Assert.isTrue(u.isDefined(index) && index >= 0, 'The index must be a positive integer.');

                var rest = this.skip(index);
                Classical.Assert.isTrue(rest.hasAny(), 'The index is out of range.');

                return rest.first();
            };

            Queryable.prototype.concat = function (other) {
                var enumerables = [this, other].query();
                return new ConcatQueryable(enumerables);
            };

            Queryable.prototype.distinct = function () {
                var map = new Collections.Dictionary(), enumerator = this.getEnumerator();
                while (enumerator.moveNext()) {
                    map.add(enumerator.current, true);
                }

                return map.keys.query();
            };

            Queryable.prototype.reverse = function () {
                return this.array().reverse().query();
            };

            Queryable.prototype.dictionary = function (keySelector, valueSelector) {
                var array = this.array(), length = array.length, result = new Collections.Dictionary(length), current, key, value;

                for (var i = 0; i < length; i++) {
                    current = array[i];
                    key = keySelector(current);
                    value = valueSelector(current);
                    result.add(key, value);
                }

                return result;
            };

            Queryable.prototype.execute = function () {
                return this.result().query();
            };

            Queryable.prototype.result = function () {
                return this.array();
            };

            Queryable.prototype.coalescePredicate = function (predicate) {
                return u.coalesce(predicate, function (item) {
                    return true;
                });
            };
            return Queryable;
        })();
        Collections.Queryable = Queryable;

        var QueryableEnumerator = (function () {
            function QueryableEnumerator(enumerator, iterator, selector) {
                this._enumerator = enumerator;
                this._iterator = iterator;
                this._selector = selector;
            }
            Object.defineProperty(QueryableEnumerator.prototype, "current", {
                get: function () {
                    return this._selector(this._enumerator.current);
                },
                enumerable: true,
                configurable: true
            });

            QueryableEnumerator.prototype.moveNext = function () {
                return this._iterator(this._enumerator);
            };
            return QueryableEnumerator;
        })();

        var WhereQueryable = (function (_super) {
            __extends(WhereQueryable, _super);
            function WhereQueryable(enumerable, predicate) {
                _super.call(this, enumerable);
                this._predicate = predicate;
            }
            WhereQueryable.prototype.getEnumerator = function () {
                var predicate = this._predicate, enumerator = this._enumerable.getEnumerator();

                return new QueryableEnumerator(enumerator, function (enumerator) {
                    do {
                        var hasNext = enumerator.moveNext();
                    } while(hasNext && !predicate(enumerator.current));
                    return hasNext;
                }, function (item) {
                    return item;
                });
            };
            return WhereQueryable;
        })(Queryable);

        var SelectQueryable = (function (_super) {
            __extends(SelectQueryable, _super);
            function SelectQueryable(enumerable, selector) {
                _super.call(this, new Array());
                this._selector = selector;
                this._selectedEnumerable = enumerable;
            }
            SelectQueryable.prototype.getEnumerator = function () {
                return new QueryableEnumerator(this._selectedEnumerable.getEnumerator(), function (enumerator) {
                    return enumerator.moveNext();
                }, this._selector);
            };
            return SelectQueryable;
        })(Queryable);

        var SkipQueryable = (function (_super) {
            __extends(SkipQueryable, _super);
            function SkipQueryable(enumerable, count) {
                _super.call(this, enumerable);
                Classical.Assert.isFalse(count < 0, 'The number of elements to skip must be greater than zero.');

                this._count = count;
            }
            SkipQueryable.prototype.getEnumerator = function () {
                var count = this._count, currentCount = 0;
                return new QueryableEnumerator(this._enumerable.getEnumerator(), function (enumerator) {
                    do {
                        var hasNext = enumerator.moveNext();
                        currentCount++;
                    } while(hasNext && currentCount <= count);
                    return hasNext;
                }, function (item) {
                    return item;
                });
            };
            return SkipQueryable;
        })(Queryable);

        var TakeQueryable = (function (_super) {
            __extends(TakeQueryable, _super);
            function TakeQueryable(enumerable, count) {
                _super.call(this, enumerable);
                Classical.Assert.isFalse(count < 0, 'The number of elements to take must be greater than zero.');

                this._count = count;
            }
            TakeQueryable.prototype.getEnumerator = function () {
                var count = this._count, currentCount = 0;
                return new QueryableEnumerator(this._enumerable.getEnumerator(), function (enumerator) {
                    do {
                        var hasNext = enumerator.moveNext();
                        currentCount++;
                    } while(hasNext && count < currentCount);
                    return hasNext;
                }, function (item) {
                    return item;
                });
            };
            return TakeQueryable;
        })(Queryable);

        var ConcatQueryable = (function (_super) {
            __extends(ConcatQueryable, _super);
            function ConcatQueryable(enumerables) {
                _super.call(this, this);
                this._enumerables = enumerables;
            }
            ConcatQueryable.prototype.getEnumerator = function () {
                var enumerators = this._enumerables.query().where(function (e) {
                    return u.isDefined(e);
                }).select(function (e) {
                    return e.getEnumerator();
                });

                return new ConcatQueryableEnumerator(enumerators);
            };
            return ConcatQueryable;
        })(Queryable);

        var ConcatQueryableEnumerator = (function () {
            function ConcatQueryableEnumerator(enumerators) {
                this._outerEnumerator = enumerators.getEnumerator();
                if (this._outerEnumerator.moveNext())
                    this._enumerator = this._outerEnumerator.current;
            }
            Object.defineProperty(ConcatQueryableEnumerator.prototype, "current", {
                get: function () {
                    return this._enumerator.current;
                },
                enumerable: true,
                configurable: true
            });

            ConcatQueryableEnumerator.prototype.moveNext = function () {
                var outerEnumerator = this._outerEnumerator, enumerator = this._enumerator;

                if (u.isNullOrUndefined(enumerator))
                    return false;
                if (enumerator.moveNext())
                    return true;
                if (outerEnumerator.moveNext()) {
                    this._enumerator = outerEnumerator.current;
                    return this.moveNext();
                }

                this._enumerator = null;
                return false;
            };
            return ConcatQueryableEnumerator;
        })();

        (function (Enumerable) {
            

            

            

            function range(start, increment, end) {
                if (arguments.length == 1) {
                    end = start;
                    start = 0;
                    increment = end < 0 ? -1 : 1;
                } else if (arguments.length == 2) {
                    end = increment;
                    increment = end < start ? -1 : 1;
                }
                if (start === end)
                    return [start];

                Classical.Assert.isFalse(increment == 0, 'The increment cannot be equal to zero.');
                Classical.Assert.isFalse(start < end && increment < 0, 'The increment must be positive for increasing ranges.');
                Classical.Assert.isFalse(end < start && increment > 0, 'The increment must be negative for decreasing ranges.');

                var result = [], current = start, adjustmentFactor = start < end ? 1 : -1, adjustedEnd = end * adjustmentFactor;

                while (current * adjustmentFactor <= adjustedEnd) {
                    result.push(current);
                    current += increment;
                }

                return result;
            }
            Enumerable.range = range;

            function forEach(items, operation) {
                var enumerator = items.getEnumerator(), current;

                while (enumerator.moveNext()) {
                    var current = enumerator.current;
                    operation.bind(current)(current);
                }
            }
            Enumerable.forEach = forEach;
        })(Collections.Enumerable || (Collections.Enumerable = {}));
        var Enumerable = Collections.Enumerable;

        function getComparer(array, selector, comparison, ascending) {
            if (!selector)
                selector = function (item) {
                    return item;
                };

            if (!u.isDefined(comparison)) {
                var firstElement;
                for (var i = 0; i < array.length; i++) {
                    var value = selector(array[i]);
                    if (u.isDefined(value)) {
                        firstElement = value;
                        break;
                    }
                }

                if (!u.isDefined(firstElement))
                    return null;
                else if (u.isNumber(firstElement))
                    comparison = compareNumbers;
                else if (u.isString(firstElement))
                    comparison = compareStrings;
                else if (firstElement instanceof Date)
                    comparison = compareDates;
                else if (u.isBoolean(firstElement))
                    comparison = compareBooleans;
                else
                    Classical.Assert.isInvalid('The sequence cannot be ordered without a comparison.');
            }

            if (ascending) {
                return function (first, second) {
                    return comparison(selector(first), selector(second));
                };
            }

            return function (first, second) {
                return -comparison(selector(first), selector(second));
            };
        }

        function compareNumbers(first, second) {
            var value = compareUndefined(first, second);
            if (u.isDefined(value))
                return value;

            return first - second;
        }

        function compareStrings(first, second) {
            var value = compareUndefined(first, second);
            if (u.isDefined(value))
                return value;

            if (first < second)
                return -1;
            if (first > second)
                return 1;
            return 0;
        }

        function compareBooleans(first, second) {
            var value = compareUndefined(first, second);
            if (u.isDefined(value))
                return value;

            if (first < second)
                return -1;
            if (first > second)
                return 1;
            return 0;
        }

        function compareDates(first, second) {
            var value = compareUndefined(first, second);
            if (u.isDefined(value))
                return value;

            return first - second;
        }

        function compareUndefined(first, second) {
            var firstIsDefined = u.isDefined(first);
            var secondIsDefined = u.isDefined(second);
            if (!firstIsDefined && !secondIsDefined)
                return 0;
            if (!secondIsDefined)
                return -Infinity;
            if (!firstIsDefined)
                return Infinity;

            return null;
        }
    })(Classical.Collections || (Classical.Collections = {}));
    var Collections = Classical.Collections;
})(Classical || (Classical = {}));
var Classical;
(function (Classical) {
    (function (Expression) {
        var u = Classical.Utilities;
        var Assert = Classical.Assert;

        

        function getProperty(arg1, arg2) {
            var selector = arg1;
            if (arguments.length > 1)
                selector = arg2;

            var matches = propertyPattern.exec(selector.toString());
            Assert.isDefined(matches, 'The property selector was not properly defined.');

            var property = matches.slice().query().skip(1).firstOrDefault(function (m) {
                return u.isDefined(m);
            });

            Assert.isDefined(property, 'The property selector was not properly defined.');

            return property;
        }
        Expression.getProperty = getProperty;

        var space = '\\s*';
        var identifierPattern = '[_$a-zA-Z][_$a-zA-Z0-9]*';
        var stringSingleQuotePattern = "'(([^'\\\\\]|\\\\[btnvfr'\\\\\])*)'";
        var stringDoubleQuotePattern = '"(([^"\\\\\]|\\\\[btnvfr"\\\\\])*)"';
        var stringPattern = '(?:' + stringSingleQuotePattern + '|' + stringDoubleQuotePattern + ')';
        var propertySelector = identifierPattern + space + '\\.' + space + '(' + identifierPattern + ')';
        var propertyAccessor = identifierPattern + space + '\\[' + space + stringPattern + space + '\\]';
        var functionStart = '^' + space + 'function' + space + '\\([^\\)]*\\)' + space + '{' + space + '(?:return)?' + space + '(?:';
        var functionEnd = ')' + space + ';?' + space + '}' + space + '$';
        var propertyPatternString = functionStart + propertySelector + '|' + propertyAccessor + '|' + stringPattern + functionEnd;
        var propertyPattern = new RegExp(propertyPatternString);

        function getArguments(func) {
            Assert.isDefined(func, 'The function was not specified.');

            var functionString = func.toString();
            var argumentString = functionPattern.exec(functionString).slice().query().skip(1).singleOrDefault();

            Assert.isDefined(argumentString, 'The arguments of the function cannot be parsed.');

            if (argumentString.length === 0)
                return [];

            return argumentString.split(argumentSpacePattern).query().select(function (a) {
                return a.trim();
            }).array();
        }
        Expression.getArguments = getArguments;

        var functionPattern = /^[\s]*function[\s]*(?:[_$a-zA-Z][_$a-zA-Z0-9]*)*\(([^\)]*)\)/;
        var argumentSpacePattern = /\s*,\s*/;
    })(Classical.Expression || (Classical.Expression = {}));
    var Expression = Classical.Expression;
})(Classical || (Classical = {}));




var Classical;
(function (Classical) {
    (function (Events) {
        var Event = (function () {
            function Event(host) {
                this._subscribers = [];
                Classical.Assert.isDefined(host, 'The host is null or undefined.');
                this._host = host;
            }
            Event.prototype.subscribe = function (registration) {
                Classical.Assert.isDefined(registration, 'The registration is null or undefined.');
                this._subscribers.add(registration);
            };

            Event.prototype.unsubscribe = function (registration) {
                this._subscribers.remove(registration);
            };

            Event.prototype.execute = function (info) {
                var host = this._host, subscribers = this._subscribers;

                if (subscribers.count() === 0)
                    return;

                subscribers.query().forEach(function (registration) {
                    registration(host, info);
                });
            };

            Event.prototype.clear = function () {
                this._subscribers = [];
            };

            Event.prototype.count = function () {
                return this._subscribers.length;
            };
            return Event;
        })();
        Events.Event = Event;

        var Request = (function () {
            function Request(host) {
                this._subscribers = [];
                this._host = host;
            }
            Request.prototype.subscribe = function (registration) {
                Classical.Assert.isDefined(registration, 'The registration is null or undefined.');
                this._subscribers.add(registration);
            };

            Request.prototype.unsubscribe = function (registration) {
                this._subscribers.remove(registration);
            };

            Request.prototype.execute = function (info) {
                var host = this._host, subscribers = this._subscribers;

                if (subscribers.count() === 0)
                    return [];

                var responses = [], response;

                subscribers.forEach(function (registration) {
                    response = registration(host, info);
                    Classical.Assert.isDefined(response, 'A subscriber gave a response which is null or undefined.');
                    responses.add(response);
                });

                return responses;
            };

            Request.prototype.clear = function () {
                this._subscribers = [];
            };

            Request.prototype.count = function () {
                return this._subscribers.length;
            };
            return Request;
        })();
        Events.Request = Request;

        var TallyRequest = (function (_super) {
            __extends(TallyRequest, _super);
            function TallyRequest(host) {
                _super.call(this);
                this._host = host;
            }
            TallyRequest.prototype.tally = function (info) {
                var responses = this.execute(info), tally = 0;

                responses.forEach(function (value) {
                    return tally += value;
                });
                return tally;
            };
            return TallyRequest;
        })(Request);
        Events.TallyRequest = TallyRequest;

        var VoteRequest = (function (_super) {
            __extends(VoteRequest, _super);
            function VoteRequest(host, undecidedResult) {
                if (typeof undecidedResult === "undefined") { undecidedResult = null; }
                _super.call(this);
                this._host = host;
                this._undecidedResult = undecidedResult;
            }
            VoteRequest.prototype.subscribe = function (registration) {
                _super.prototype.subscribe.call(this, registration);
            };

            VoteRequest.prototype.poll = function (info) {
                var responses = this.execute(info), tally = 0;

                if (responses.count() === 0)
                    return this._undecidedResult;

                responses.forEach(function (vote) {
                    vote ? tally++ : tally--;
                });

                if (tally === 0)
                    return this._undecidedResult;

                return tally > 0;
            };
            return VoteRequest;
        })(Request);
        Events.VoteRequest = VoteRequest;

        var UnanimousVoteRequest = (function (_super) {
            __extends(UnanimousVoteRequest, _super);
            function UnanimousVoteRequest(host, undecidedResult) {
                if (typeof undecidedResult === "undefined") { undecidedResult = null; }
                _super.call(this);
                this._host = host;
                this._undecidedResult = undecidedResult;
            }
            UnanimousVoteRequest.prototype.poll = function (info) {
                var responses = this.execute(info).array(), numberOfResponses = responses.length;

                if (numberOfResponses == 0)
                    return this._undecidedResult;

                for (var i = 0; i < numberOfResponses; i++) {
                    if (!responses[i])
                        return false;
                }

                return true;
            };
            return UnanimousVoteRequest;
        })(VoteRequest);
        Events.UnanimousVoteRequest = UnanimousVoteRequest;
    })(Classical.Events || (Classical.Events = {}));
    var Events = Classical.Events;
})(Classical || (Classical = {}));
var BindingType = (function (_super) {
    __extends(BindingType, _super);
    function BindingType(value) {
        _super.call(this, value);
    }
    BindingType.OneWay = new BindingType('OneWay');

    BindingType.TwoWay = new BindingType('TwoWay');
    return BindingType;
})(Classical.Enum);









function bind(source, arg2, arg3, arg4) {
    if (typeof arg2 === "undefined") { arg2 = undefined; }
    if (typeof arg3 === "undefined") { arg3 = undefined; }
    if (typeof arg4 === "undefined") { arg4 = undefined; }
    Classical.Assert.isDefined(source, 'No source was specified.');
    if (Classical.Utilities.isString(arg2))
        return Classical.Binding.bindObject(source, arg2, arg3, arg4);
    else if (source.collectionChanged)
        return Classical.Binding.bindCollection(source, arg2, arg3);
    else
        return Classical.Binding.bindProperty(source, arg2, arg3);
}

var Classical;
(function (Classical) {
    (function (Binding) {
        var u = Classical.Utilities;
        var e = Classical.Events;
        var ce = Classical.Collections.Enumerable;

        var anonymousPropertyName = '<Anonymous>';

        var Property = (function () {
            function Property(owner, initialValue, beforeGet, beforeSet) {
                if (typeof initialValue === "undefined") { initialValue = null; }
                Classical.Assert.isDefined(owner);
                this._propertyChanged = new e.Event(this);

                this._owner = owner;
                this._beforeGet = beforeGet;
                this._beforeSet = beforeSet;
                if (Classical.Utilities.isDefined(beforeSet))
                    initialValue = beforeSet(initialValue);
                this._value = initialValue;
            }
            Object.defineProperty(Property.prototype, "value", {
                get: function () {
                    var beforeGet = this._beforeGet;
                    if (Classical.Utilities.isDefined(this._beforeGet))
                        return beforeGet(this._value);

                    return this._value;
                },
                set: function (value) {
                    var beforeSet = this._beforeSet, oldValue = this._value;

                    if (beforeSet)
                        value = beforeSet(value);

                    if (!u.areEqual(value, oldValue)) {
                        this._value = value;
                        this._propertyChanged.execute(value);
                    }
                },
                enumerable: true,
                configurable: true
            });


            Object.defineProperty(Property.prototype, "propertyChanged", {
                get: function () {
                    return this._propertyChanged;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Property.prototype, "owner", {
                get: function () {
                    return this._owner;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(Property.prototype, "name", {
                get: function () {
                    var owner = this._owner;
                    for (var property in owner) {
                        if (this.equals(owner[property]))
                            return property;
                    }

                    return undefined;
                },
                enumerable: true,
                configurable: true
            });

            Property.prototype.toString = function () {
                return Classical.Utilities.coalesce(this.name, anonymousPropertyName);
            };
            return Property;
        })();
        Binding.Property = Property;

        var Binder = (function () {
            function Binder(bindingType) {
                Classical.Assert.isDefined(bindingType);
                this._bindingType = bindingType;
            }
            Object.defineProperty(Binder.prototype, "bindingType", {
                get: function () {
                    return this._bindingType;
                },
                enumerable: true,
                configurable: true
            });

            Binder.prototype.bind = function () {
                throw Classical.Assert.notImplemented();
            };
            return Binder;
        })();
        Binding.Binder = Binder;

        var PropertyBinder = (function (_super) {
            __extends(PropertyBinder, _super);
            function PropertyBinder(source, converter, bindingType) {
                if (typeof bindingType === "undefined") { bindingType = BindingType.TwoWay; }
                _super.call(this, bindingType);
                Classical.Assert.isDefined(source);
                Classical.Assert.isDefined(converter);

                this._source = source;
                this._converter = converter;
            }
            Object.defineProperty(PropertyBinder.prototype, "source", {
                get: function () {
                    return this._source;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(PropertyBinder.prototype, "converter", {
                get: function () {
                    return this._converter;
                },
                enumerable: true,
                configurable: true
            });

            PropertyBinder.prototype.bind = function () {
                var target = this.target;
                Classical.Assert.isDefined(target);

                this._source.propertyChanged.subscribe(this.updateTarget.bind(this));
                if (this.bindingType.equals(BindingType.TwoWay))
                    target.propertyChanged.subscribe(this.updateSource.bind(this));

                target.value = this.converter.convert(this._source.value);
            };

            PropertyBinder.prototype.updateSource = function (host, value) {
                var converter = this._converter;
                this._source.value = converter.convertBack(value);
            };

            PropertyBinder.prototype.updateTarget = function (host, value) {
                var converter = this._converter;
                this.target.value = this._converter.convert(value);
            };
            return PropertyBinder;
        })(Binder);
        Binding.PropertyBinder = PropertyBinder;

        var ComplexPropertyBinder = (function (_super) {
            __extends(ComplexPropertyBinder, _super);
            function ComplexPropertyBinder(sources, converter) {
                _super.call(this, BindingType.OneWay);
            }
            return ComplexPropertyBinder;
        })(Binder);
        Binding.ComplexPropertyBinder = ComplexPropertyBinder;

        var SimplePropertyBinder = (function (_super) {
            __extends(SimplePropertyBinder, _super);
            function SimplePropertyBinder(source, bindingType) {
                if (typeof bindingType === "undefined") { bindingType = BindingType.TwoWay; }
                _super.call(this, source, NullValueConverter.instance(), bindingType);
            }
            return SimplePropertyBinder;
        })(PropertyBinder);
        Binding.SimplePropertyBinder = SimplePropertyBinder;

        var ObjectBinder = (function (_super) {
            __extends(ObjectBinder, _super);
            function ObjectBinder(source, sourcePropertyName, converter, bindingType) {
                if (typeof bindingType === "undefined") { bindingType = BindingType.TwoWay; }
                _super.call(this, bindingType);
                Classical.Assert.isDefined(source);
                Classical.Assert.isDefined(sourcePropertyName);
                Classical.Assert.isDefined(converter);

                this._source = source;
                this._sourcePropertyName = sourcePropertyName;
                this._converter = converter;
            }
            Object.defineProperty(ObjectBinder.prototype, "source", {
                get: function () {
                    return this._source;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(ObjectBinder.prototype, "sourcePropertyName", {
                get: function () {
                    return this._sourcePropertyName;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(ObjectBinder.prototype, "converter", {
                get: function () {
                    return this._converter;
                },
                enumerable: true,
                configurable: true
            });

            ObjectBinder.prototype.bind = function () {
                var target = this.target;
                Classical.Assert.isDefined(target);

                this._source.propertyChanged.subscribe(this.updateTarget.bind(this));
                if (this.bindingType.equals(BindingType.TwoWay))
                    target.propertyChanged.subscribe(this.updateSource.bind(this));

                target.value = this.converter.convert(this._source[this._sourcePropertyName]);
            };

            ObjectBinder.prototype.updateSource = function (host, value) {
                var converter = this._converter;
                this._source[this._sourcePropertyName] = converter.convertBack(value);
            };

            ObjectBinder.prototype.updateTarget = function (owner, property) {
                this.target.value = this._converter.convert(owner[property]);
            };
            return ObjectBinder;
        })(Binder);
        Binding.ObjectBinder = ObjectBinder;

        var SimpleObjectBinder = (function (_super) {
            __extends(SimpleObjectBinder, _super);
            function SimpleObjectBinder(source, sourcePropertyName, bindingType) {
                if (typeof bindingType === "undefined") { bindingType = BindingType.TwoWay; }
                _super.call(this, source, sourcePropertyName, NullValueConverter.instance(), bindingType);
            }
            return SimpleObjectBinder;
        })(ObjectBinder);
        Binding.SimpleObjectBinder = SimpleObjectBinder;

        var NullValueConverter = (function () {
            function NullValueConverter() {
            }
            NullValueConverter.prototype.convert = function (value) {
                return value;
            };

            NullValueConverter.prototype.convertBack = function (value) {
                return value;
            };

            NullValueConverter.instance = function () {
                if (!nullConverterInstance)
                    nullConverterInstance = new NullValueConverter();

                return nullConverterInstance;
            };
            return NullValueConverter;
        })();

        var nullConverterInstance;

        var CollectionAction = (function (_super) {
            __extends(CollectionAction, _super);
            function CollectionAction(value) {
                _super.call(this, value);
            }
            CollectionAction.Add = new CollectionAction('Add');
            CollectionAction.Remove = new CollectionAction('Remove');
            return CollectionAction;
        })(Classical.Enum);
        Binding.CollectionAction = CollectionAction;

        var Collection = (function () {
            function Collection(items) {
                this.items = [];
                this._binding = true;
                this.collectionChanged = new Classical.Events.Event(this);

                if (items)
                    this.items.addRange(items);
            }
            Collection.prototype.add = function (item) {
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
            };

            Collection.prototype.addRange = function (items) {
                var _this = this;
                Classical.Assert.isDefined(items);
                items.forEach(function (item) {
                    return _this.add(item);
                });
                return this;
            };

            Collection.prototype.remove = function (item) {
                this.array;
                var items = this.items, currentItem;

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
            };

            Collection.prototype.removeAt = function (index) {
                var items = this.items, oldItem = items[index];

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
            };

            Collection.prototype.clear = function () {
                var items = this.items;
                while (items.length > 0) {
                    items.remove(items[0]);
                }
                return this;
            };

            Collection.prototype.get = function (index) {
                return this.items[index];
            };

            Collection.prototype.set = function (index, item) {
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
            };

            Collection.prototype.getEnumerator = function () {
                return this.items.getEnumerator();
            };

            Collection.prototype.query = function () {
                return this.items.query();
            };

            Collection.prototype.forEach = function (operation) {
                ce.forEach(this, operation);
            };

            Collection.prototype.array = function () {
                return this.items.slice(0);
            };

            Collection.prototype.count = function () {
                return this.items.length;
            };

            Collection.prototype.bindingOff = function () {
                this._binding = false;
            };

            Collection.prototype.bindingOn = function () {
                this._binding = true;
            };
            return Collection;
        })();
        Binding.Collection = Collection;

        var CollectionBinder = (function () {
            function CollectionBinder(source, converter, bindingType) {
                if (typeof converter === "undefined") { converter = NullValueConverter.instance(); }
                if (typeof bindingType === "undefined") { bindingType = BindingType.TwoWay; }
                Classical.Assert.isDefined(source);
                Classical.Assert.isDefined(converter);
                Classical.Assert.isDefined(bindingType);

                this._source = source;
                this._converter = converter;
                this._bindingType = bindingType;
            }
            Object.defineProperty(CollectionBinder.prototype, "source", {
                get: function () {
                    return this._source;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(CollectionBinder.prototype, "converter", {
                get: function () {
                    return this._converter;
                },
                enumerable: true,
                configurable: true
            });

            Object.defineProperty(CollectionBinder.prototype, "bindingType", {
                get: function () {
                    return this._bindingType;
                },
                enumerable: true,
                configurable: true
            });

            CollectionBinder.prototype.bind = function () {
                var _this = this;
                var target = this.target, source = this._source, converter = this._converter, isTwoWay = this.bindingType.equals(BindingType.TwoWay), sourceRegistration, targetRegistration;

                Classical.Assert.isDefined(target);

                target.clear();
                target.addRange(source.query().select(function (source) {
                    return converter.convert(source);
                }));

                sourceRegistration = function (host, args) {
                    if (isTwoWay)
                        target.collectionChanged.unsubscribe(targetRegistration);
                    _this.updateTarget(host, args);
                    if (isTwoWay)
                        target.collectionChanged.subscribe(targetRegistration);
                };

                if (isTwoWay) {
                    targetRegistration = function (host, args) {
                        source.collectionChanged.unsubscribe(sourceRegistration);
                        _this.updateSource(host, args);
                        source.collectionChanged.subscribe(sourceRegistration);
                    };
                }

                source.collectionChanged.subscribe(sourceRegistration);
                if (this.bindingType.equals(BindingType.TwoWay)) {
                    target.collectionChanged.subscribe(targetRegistration);
                }
            };

            CollectionBinder.prototype.updateSource = function (host, args) {
                if (args.action.equals(CollectionAction.Add)) {
                    this._source.set(args.newIndex, this.converter.convertBack(args.newItem));
                } else if (args.action.equals(CollectionAction.Remove)) {
                    this._source.removeAt(args.oldIndex);
                } else {
                    Classical.Assert.isInvalid("The CollectionAction was not recognized.");
                }
            };

            CollectionBinder.prototype.updateTarget = function (host, args) {
                if (args.action.equals(CollectionAction.Add)) {
                    this.target.set(args.newIndex, this.converter.convert(args.newItem));
                } else if (args.action.equals(CollectionAction.Remove)) {
                    this.target.removeAt(args.oldIndex);
                } else {
                    Classical.Assert.isInvalid("The CollectionAction was not recognized.");
                }
            };
            return CollectionBinder;
        })();
        Binding.CollectionBinder = CollectionBinder;

        

        function bindProperty(source, converter, bindingType) {
            if (typeof converter === "undefined") { converter = NullValueConverter.instance(); }
            if (typeof bindingType === "undefined") { bindingType = BindingType.TwoWay; }
            if (converter.getType && converter.getType() === bindingTypeType) {
                bindingType = converter;
                converter = NullValueConverter.instance();
            }

            return new PropertyBinder(source, converter, bindingType);
        }
        Binding.bindProperty = bindProperty;

        

        function bindObject(source, property, converter, bindingType) {
            if (typeof converter === "undefined") { converter = NullValueConverter.instance(); }
            if (typeof bindingType === "undefined") { bindingType = BindingType.TwoWay; }
            if (converter.getType && converter.getType() === bindingTypeType) {
                bindingType = converter;
                converter = NullValueConverter.instance();
            }

            return new ObjectBinder(source, property, converter, bindingType);
        }
        Binding.bindObject = bindObject;

        

        function bindCollection(source, converter, bindingType) {
            if (typeof converter === "undefined") { converter = NullValueConverter.instance(); }
            if (typeof bindingType === "undefined") { bindingType = BindingType.TwoWay; }
            if (converter.getType && converter.getType() === bindingTypeType) {
                bindingType = converter;
                converter = NullValueConverter.instance();
            }

            return new CollectionBinder(source, converter, bindingType);
        }
        Binding.bindCollection = bindCollection;

        function getNullConverter() {
            return NullValueConverter.instance();
        }
        Binding.getNullConverter = getNullConverter;

        var bindingTypeType = typeOf(BindingType);
    })(Classical.Binding || (Classical.Binding = {}));
    var Binding = Classical.Binding;
})(Classical || (Classical = {}));
var Classical;
(function (Classical) {
    (function (Binding) {
        (function (New) {
            var u = Classical.Utilities;
            var e = Classical.Events;
            var Assert = Classical.Assert;

            

            var Update = (function () {
                function Update(sources) {
                    var _this = this;
                    this._sources = [];
                    Assert.isDefined(sources, "The sources of the update are undefined.");
                    if (sources)
                        sources.query().forEach(function (s) {
                            return _this._sources.add(s);
                        });
                }
                Update.prototype.hasSource = function (source) {
                    var sources = this._sources;
                    for (var i = 0; i < sources.length; i++) {
                        if (source === sources[i])
                            return true;
                    }

                    return false;
                };

                Update.prototype.addSource = function (source) {
                    Assert.isDefined(source, 'The source is not defined.');
                    if (this._sources.query().hasNone(function (s) {
                        return s === source;
                    }))
                        this._sources.add(source);
                };

                Update.prototype.transferSourcesTo = function (update) {
                    Assert.isDefined(update, 'The update is not defined.');
                    var sources = update._sources.query();
                    update._sources.addRange(this._sources.query().where(function (s) {
                        return !sources.hasAny(function (s2) {
                            return s2 == s;
                        });
                    }));

                    return update;
                };
                return Update;
            })();
            New.Update = Update;

            

            

            

            var Synchronizer = (function () {
                function Synchronizer(target) {
                    this._updateDepth = 0;
                    this._updates = [];
                    this._binders = [];
                    Assert.isDefined(target, 'The target was not specified.');
                    this._target = target;
                    this._onUpdateEvent = new e.Event(target);
                }
                Object.defineProperty(Synchronizer.prototype, "target", {
                    get: function () {
                        return this._target;
                    },
                    enumerable: true,
                    configurable: true
                });

                Object.defineProperty(Synchronizer.prototype, "updates", {
                    get: function () {
                        return this._updates.array();
                    },
                    enumerable: true,
                    configurable: true
                });

                Object.defineProperty(Synchronizer.prototype, "updateDepth", {
                    get: function () {
                        return this._updateDepth;
                    },
                    enumerable: true,
                    configurable: true
                });

                Synchronizer.prototype.hasTarget = function (target) {
                    return target && this._binders.query().hasAny(function (b) {
                        return b.source === target;
                    });
                };

                Synchronizer.prototype.hasSource = function (source) {
                    return source && source.hasTarget(this._target);
                };

                Synchronizer.prototype.bind = function (arg) {
                    Assert.isDefined(arg, 'The binder was not specified.');
                    if (arg.sources)
                        return this._createComplexBinding(arg);

                    var binder = arg;
                    Assert.isTrue(u.isDefined(binder.source), 'The binder source was not specified.');
                    Assert.isFalse(this.target.equals(binder.source), 'An object cannot be bound to itself');

                    if (this._binders.query().hasAny(function (b) {
                        return b.source.equals(binder.source);
                    }))
                        return;

                    if (!binder.converter) {
                        binder.converter = {
                            convert: function (sourceUpdate) {
                                return sourceUpdate;
                            },
                            convertBack: function (targetUpdate) {
                                return targetUpdate;
                            }
                        };
                    }

                    var converter = binder.converter;
                    if (converter.convertBack)
                        this._binders.add(binder);

                    if (binder.init)
                        binder.init(this._target, binder.source);

                    var inverseBinder = {
                        source: this._target,
                        converter: {
                            convert: converter.convertBack,
                            convertBack: converter.convert
                        }
                    };

                    binder.source.bind(inverseBinder);
                };

                Synchronizer.prototype.unbind = function (source) {
                    var sourceHasTarget = source.hasTarget(this._target), sourceBinder = this._binders.query().singleOrDefault(function (b) {
                        return b.source === source;
                    });

                    if (sourceBinder)
                        this._binders.remove(sourceBinder);

                    if (!sourceHasTarget)
                        return false;

                    source.unbind(this._target);
                    return true;
                };

                Synchronizer.prototype.apply = function (updates) {
                    throw Assert.notImplemented("apply must be implemented by the parent ISynchronizable object rather than the child synchronizer.");
                };

                Synchronizer.prototype.observe = function (registration) {
                    this._onUpdateEvent.subscribe(function (host, info) {
                        registration(info, host);
                    });
                };

                Synchronizer.prototype.detach = function () {
                    var binders = this._binders, source = this._target;

                    while (binders.length > 0) {
                        binders.pop().source.unbind(source);
                    }
                };

                Synchronizer.prototype.add = function (update) {
                    Assert.isDefined(update, 'The update is not defined.');
                    update.addSource(this._target);
                    this._updates.add(update);
                };

                Synchronizer.prototype.filter = function (updates) {
                    var target = this._target;
                    return updates.query().where(function (u) {
                        return !u.hasSource(target);
                    }).array();
                };

                Synchronizer.prototype.sync = function (immediate) {
                    var _this = this;
                    if (typeof immediate === "undefined") { immediate = false; }
                    if (!immediate) {
                        this._updateDepth--;
                        if (this._updateDepth >= 0)
                            return false;
                    }

                    this._updateDepth = 0;
                    var updates = this._updates;
                    if (updates.length === 0)
                        return true;

                    this._updates = [];

                    var groupUpdate = {
                        isExecuted: false,
                        data: []
                    };

                    this._binders.query().forEach(function (binder) {
                        var converter = binder.converter;
                        if (!converter.convertBack)
                            return;

                        var sourceUpdates = updates.query().where(function (update) {
                            return !update.hasSource(binder.source);
                        }).forEach(function (update) {
                            var sourceUpdate = converter.convertBack(update);
                            update.transferSourcesTo(sourceUpdate);
                            update.addSource(_this.target);
                        }).array();

                        var sourceGroupUpdate = {
                            binder: binder,
                            updates: sourceUpdates
                        };

                        if (sourceGroupUpdate.updates.query().hasAny()) {
                            groupUpdate.data.add(sourceGroupUpdate);
                        }
                    });

                    if (groupUpdate.data.query().hasAny())
                        this._executeUpdates(groupUpdate);

                    this._executeOnUpdate(updates.slice());
                };

                Synchronizer.prototype.syncStart = function () {
                    this._updateDepth++;
                };

                Synchronizer.prototype._createComplexBinding = function (binder) {
                    var _this = this;
                    Assert.isDefined(binder.sources, 'The sources of the ComplexBinder are not defined');
                    var sources = binder.sources, sourcesQuery = sources.query(), bindingHandler = function () {
                        var update = binder.converter.convert(sources);
                        sourcesQuery.forEach(function (source) {
                            return update.addSource(source);
                        });
                        return _this.target.apply([update]);
                    };

                    sourcesQuery.forEach(function (source) {
                        return source.observe(bindingHandler);
                    });
                    bindingHandler();
                };

                Synchronizer.prototype._executeUpdates = function (groupUpdate) {
                    if (groupUpdate.isExecuted)
                        return;

                    groupUpdate.data.query().forEach(function (sourceUpdate) {
                        var sourceUpdateQuery = sourceUpdate.updates.query();
                        if (sourceUpdateQuery.hasAny()) {
                            sourceUpdate.binder.source.apply(sourceUpdate.updates);
                        }
                    });

                    groupUpdate.isExecuted = true;
                };

                Synchronizer.prototype._executeOnUpdate = function (updates) {
                    this._onUpdateEvent.execute(updates);
                };
                return Synchronizer;
            })();
            New.Synchronizer = Synchronizer;

            

            var Property = (function () {
                function Property(value) {
                    if (typeof value === "undefined") { value = null; }
                    this._synchronizer = new Synchronizer(this);
                    this._value = value;
                }
                Object.defineProperty(Property.prototype, "value", {
                    get: function () {
                        return this._value;
                    },
                    set: function (value) {
                        this._value = value;
                        this._synchronizer.add(new PropertyUpdate(value));
                        this._synchronizer.sync();
                    },
                    enumerable: true,
                    configurable: true
                });


                Property.prototype.toString = function () {
                    return u.coalesce(this.value, '').toString();
                };

                Property.prototype.hasTarget = function (target) {
                    return this._synchronizer.hasTarget(target);
                };

                Property.prototype.hasSource = function (source) {
                    return this._synchronizer.hasSource(source);
                };

                Property.prototype.bind = function (arg1, arg2) {
                    var currentBinder;

                    if (u.isArray(arg1)) {
                        var complexBinder = this._createComplexBinder(arg1, arg2);
                        return this._synchronizer.bind(complexBinder);
                    } else if (arg1.getType && this.getType().isAssignableFrom(arg1.getType())) {
                        var source = arg1;
                        currentBinder = this._sourceToBinder(source);
                    } else if (arg1.property) {
                        var propertyBinder = arg1;
                        currentBinder = this._propertyBinderToBinder(arg1);
                    } else {
                        currentBinder = arg1;
                    }

                    this._synchronizer.bind(currentBinder);
                };

                Property.prototype.unbind = function (partner) {
                    return this._synchronizer.unbind(partner);
                };

                Property.prototype.observe = function (registration) {
                    this._synchronizer.observe(registration);
                };

                Property.prototype.apply = function (updates) {
                    var synchronizer = this._synchronizer;

                    var update = synchronizer.filter(updates).query().lastOrDefault();

                    if (!u.isDefined(update) || u.areEqual(this._value, update.value))
                        return;

                    this._value = update.value;
                    synchronizer.add(update);
                    synchronizer.sync();
                };

                Property.prototype.detach = function () {
                    this._synchronizer.detach();
                };

                Property.prototype._createComplexBinder = function (sources, selector) {
                    return {
                        sources: sources,
                        converter: {
                            convert: function (sources) {
                                var value = selector(sources);
                                return new PropertyUpdate(value);
                            }
                        }
                    };
                };

                Property.prototype._sourceToBinder = function (source) {
                    var _this = this;
                    return {
                        source: source,
                        init: function () {
                            _this.value = source.value;
                        }
                    };
                };

                Property.prototype._propertyBinderToBinder = function (propertyBinder) {
                    var _this = this;
                    var converter = null, valueConverter = propertyBinder.converter;

                    converter = {
                        convert: function (sourceUpdate) {
                            var value = valueConverter.convert(sourceUpdate.value);
                            return sourceUpdate.transferSourcesTo(new PropertyUpdate(value));
                        }
                    };

                    if (valueConverter.convertBack) {
                        converter.convertBack = function (targetUpdate) {
                            var value = valueConverter.convertBack(targetUpdate.value);
                            return targetUpdate.transferSourcesTo(new PropertyUpdate(value));
                        };
                    }

                    return {
                        source: propertyBinder.property,
                        converter: converter,
                        init: function () {
                            _this.value = valueConverter.convert(propertyBinder.property.value);
                        }
                    };
                };
                return Property;
            })();
            New.Property = Property;

            var ConfirmationProperty = (function (_super) {
                __extends(ConfirmationProperty, _super);
                function ConfirmationProperty(value) {
                    if (typeof value === "undefined") { value = null; }
                    _super.call(this, value);
                    this._newValue = value;
                }
                Object.defineProperty(ConfirmationProperty.prototype, "value", {
                    get: function () {
                        return this._getValue();
                    },
                    set: function (value) {
                        this._newValue = value;
                    },
                    enumerable: true,
                    configurable: true
                });


                Object.defineProperty(ConfirmationProperty.prototype, "newValue", {
                    get: function () {
                        return this._newValue;
                    },
                    enumerable: true,
                    configurable: true
                });

                Object.defineProperty(ConfirmationProperty.prototype, "synchronizer", {
                    get: function () {
                        return this._synchronizer;
                    },
                    enumerable: true,
                    configurable: true
                });

                ConfirmationProperty.prototype.apply = function (updates) {
                    var synchronizer = this.synchronizer;

                    var update = synchronizer.filter(updates).query().lastOrDefault();

                    if (!u.isDefined(update) || u.areEqual(this._getValue(), update.value))
                        return;

                    this._newValue = update.value;
                };

                ConfirmationProperty.prototype.accept = function () {
                    this._setValue(this._newValue);
                    this.synchronizer.add(new PropertyUpdate(this._newValue));
                    this.synchronizer.sync();
                };

                ConfirmationProperty.prototype.reject = function () {
                    this._newValue = this.value;
                };

                ConfirmationProperty.prototype._getValue = function () {
                    return this._value;
                };

                ConfirmationProperty.prototype._setValue = function (value) {
                    this._value = value;
                };
                return ConfirmationProperty;
            })(Property);
            New.ConfirmationProperty = ConfirmationProperty;

            

            var PropertyUpdate = (function (_super) {
                __extends(PropertyUpdate, _super);
                function PropertyUpdate(value, sources) {
                    if (typeof sources === "undefined") { sources = []; }
                    var _this = this;
                    _super.call(this, sources);
                    this.value = value;
                    if (sources)
                        sources.query().forEach(function (source) {
                            return _this.addSource(source);
                        });
                }
                return PropertyUpdate;
            })(Update);
            New.PropertyUpdate = PropertyUpdate;
        })(Binding.New || (Binding.New = {}));
        var New = Binding.New;
    })(Classical.Binding || (Classical.Binding = {}));
    var Binding = Classical.Binding;
})(Classical || (Classical = {}));
