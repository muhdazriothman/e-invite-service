export function createMock<T extends object>(
    overrides: Partial<jest.Mocked<T>> = {},
): jest.Mocked<T> {
    const cache = new Map<PropertyKey, any>();

    const proxy = new Proxy(
        {},
        {
            get(_target, prop: PropertyKey) {
                // Avoid being treated as a Promise-like (thenable)
                if (prop === 'then' || prop === 'catch' || prop === 'finally') {
                    return undefined;
                }
                if (cache.has(prop)) {
                    return cache.get(prop);
                }
                const fn = jest.fn();
                cache.set(prop, fn);
                return fn;
            },
            set(_target, prop: PropertyKey, value: any) {
                cache.set(prop, value);
                return true;
            },
            has(_target, prop: PropertyKey) {
                if (prop === 'then' || prop === 'catch' || prop === 'finally') {
                    return false;
                }
                return cache.has(prop);
            },
        },
    );

    Object.assign(proxy as object, overrides);

    return proxy as jest.Mocked<T>;
}
