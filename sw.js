const CACHE_STATIC_NAME = 'static-v04'
const CACHE_INMUTABLE_NAME = 'inmutable-v04'
const CACHE_DYNAMIC_NAME = 'dynamic-v04'

self.addEventListener('install', e => {
    console.log('sw install!')

    //const cache = caches.open('cache-1').then( cache => {
    const cacheStatic = caches.open(CACHE_STATIC_NAME).then( cache => {
        //console.log(cache)

        //Guardo todos los recursos estáticos de la APP SHELL: estáticos
        //(necesarios para que nuestra AWP funcione offline)
        return cache.addAll([
            '/index.html',
            'css/estilos.css',
            '/js/main.js',
            '/js/api.js',
            '/plantilla-lista.hbs',
            '/images/super.jpg'
        ])
    })

    const cacheInmutable = caches.open(CACHE_INMUTABLE_NAME).then( cache => {
        //console.log(cache)

        //Guardo todos los recursos estáticos de la APP SHELL: inmutable
        //(necesarios para que nuestra AWP funcione offline)
        return cache.addAll([
            '/js/handlebars.min-v4.7.7.js',
            'https://code.jquery.com/jquery-3.6.0.min.js',
            'https://code.getmdl.io/1.3.0/material.min.js',
            'https://code.getmdl.io/1.3.0/material.indigo-pink.min.css'
        ])
    })

    //e.waitUntil(cache)

    //https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Promise
    e.waitUntil( Promise.all([cacheStatic,cacheInmutable]) )
})

self.addEventListener('activate', e => {
    console.log('sw activate!')

    const cacheWhiteList = [
        CACHE_STATIC_NAME,
        CACHE_INMUTABLE_NAME,
        CACHE_DYNAMIC_NAME
    ]

    //borrar todos los caches que no correspondan a la versión actual
    e.waitUntil(
        caches.keys().then(keys => {
            //console.log(keys)
            return Promise.all(
                keys.map( cache => {
                    //console.log(cache)
                    if(!cacheWhiteList.includes(cache)) {
                        return caches.delete(cache)
                    }
                })
            )
        })
    )
})

self.addEventListener('fetch', e => {
    //console.log('sw fetch!!!!')

    let {url, method} = e.request
    console.log(method, url)

    if(method == 'GET' && !url.includes('mockapi.io')) {
        const respuesta = caches.match(e.request).then( res => {
            if(res) {
                console.log('EXISTE: el recurso existe en el cache', url)
                return res
            }
            console.error('NO EXISTE: el recurso no existe en el cache',url)
            return fetch(e.request).then( nuevaRespuesta => {
                caches.open(CACHE_DYNAMIC_NAME).then(cache => {
                    cache.put(e.request,nuevaRespuesta)
                })
                return nuevaRespuesta.clone()
            })
        })

        e.respondWith(respuesta)
    }
    else {
        console.warn('BYPASS', method, url)
    }
})
