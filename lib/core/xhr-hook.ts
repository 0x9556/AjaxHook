type Events = 'onabort' | 'onerror' | 'onload' | 'onloadend' | 'onreadystatechange' | 'ontimeout'

interface HijackedXMLHttpRequest extends XMLHttpRequest {
    xhr: XMLHttpRequest
}

type XMLHttpRequestFnsNames = keyof Pick<
    XMLHttpRequest,
    { [K in keyof XMLHttpRequest]: XMLHttpRequest[K] extends Function ? K : never }[keyof XMLHttpRequest]
>

type XMLHttpRequestPropertyNames = keyof Pick<
    XMLHttpRequest,
    { [K in keyof XMLHttpRequest]: XMLHttpRequest[K] extends Function ? never : K }[keyof XMLHttpRequest]
>

const events: Events[] = ['onabort', 'onerror', 'onload', 'onloadend', 'onreadystatechange', 'ontimeout']

export function hijackXHR(proxy) {
    const realXhr = XMLHttpRequest

    function hijackedXHR(this: HijackedXMLHttpRequest) {
        const xhr = new realXhr()

        for (const event of events) {
            if (xhr[event] === undefined) xhr[event] = null
        }

        for (const attr in xhr) {
            const type = typeof attr
            if (type === 'function') {
                //hijack function
                //@ts-ignore
                this[attr] = hookFns(attr)
            } else {
                Object.defineProperty(this, attr, {
                    enumerable: true
                })
            }
        }

        this.xhr = xhr
    }

    function hookFns(fnName: XMLHttpRequestFnsNames) {
        return function (this: ThisParameterType<typeof hijackedXHR>) {
            const args = Array.prototype.slice.call(arguments)

            if (proxy[fnName]) {
                const ret = proxy[fnName].call(this, args, this.xhr)
                if (ret) return ret
            }

            return this.xhr[fnName].aplly(this.xhr, args)
        }
    }

    function getter(properties: XMLHttpRequestPropertyNames) {
        return function (this: ThisParameterType<typeof hijackedXHR>) {
            const v = this.hasOwnProperty(properties) ? this[properties] : this.xhr[properties]
        }
    }
}
