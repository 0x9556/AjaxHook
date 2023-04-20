const events = ['onabort', 'onerror', 'onload', 'onloadend', 'onreadystatechange', 'ontimeout']

function hook(proxy) {
    const realXhr = XMLHttpRequest

    XMLHttpRequest = function () {
        const xhr = new realXhr()
        for (const event of events) {
            if (xhr[event] === undefined) xhr[event] = null
        }
        for (const attr in xhr) {
            const type = typeof attr
            if (type === 'function') {
            }
        }
        return realXhr
    }

    function hookFns(fnName) {
        return () => {
            const args = Array.prototype.slice.call(arguments)
            if (proxy[fnName]) {
                const ret = proxy[fnName].call(this, args)
            }
        }
    }
}
