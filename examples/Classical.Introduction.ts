
module Classical.Library {

    import Assert = Classical.Assert;
    import Expression = Classical.Expression;
    import u = Utilities;
    import r = Classical.Reflection;
    import e = Classical.Events;
    import b = Classical.Binding;
    import cc = Classical.Collections;
    import bc = Classical.Binding.Collections;
    var ctx = document;

    export class Base {
        private _hello = '';
        get hello() { return this._hello; }

        private _world = '';
        get world() { return this._world; }
    }

    export class Class extends Base {

        print(...text: Array<string>) {
            var query: Object =
                Array.prototype.slice.call(arguments, 0)
                    .query();

            var fullText = query
                .as<IQueryable<string>>()
                .aggregate((a, b) => a + ' ' + b, '');

            document.body.appendChild(
                document.createTextNode(fullText));
        }
    }

    window.addEventListener('load', () => {
        var c = new Class();
        c.print('hello', 'world');
    });
}