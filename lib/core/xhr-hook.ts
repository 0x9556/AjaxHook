// type Events = Extract<'onabort' | 'onerror' | 'onload' | 'onloadend' | 'onreadystatechange' | 'ontimeout', keyof XMLHttpRequest>
type Events = 'onabort' | 'onerror' | 'onload' | 'onloadend' | 'onreadystatechange' | 'ontimeout'

interface HijackedXMLHttpRequest extends XMLHttpRequest {
    xhr:XMLHttpRequest
}

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
            }
        }
    }

    function hookFns(this: ThisParameterType<typeof hijackedXHR>, fnName: string) {
        return () => {
            const args = Array.prototype.slice.call(arguments)

            if (proxy[fnName]) {
                const ret = proxy[fnName].call(this, args, this.xhr)
                if (ret) return ret
            }

            return this.xhr[fnName].aplly(this.xhr, args)
        }
    }
}
