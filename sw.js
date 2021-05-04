self.addEventListener('install', e => {
    console.log('sw instal')
})

self.addEventListener('activate', e => {
    console.log('sw activate')
})  

self.addEventListener('fetch', e => {
    //console.log('sw fetch')
    let { url, method } = e.request
    //console.log(url, method)

    //console.log(url.includes('.css'))

    if(false) {
        if(url.includes('estilos.css')) {
            let respuesta = new Response(`
                .w-10 { width: 10%; }
                .w-20 { width: 20%; }
                .w-30 { width: 30%; }
                .w-40 { width: 40%; }
                .w-50 { width: 50%; }
                .w-60 { width: 60%; }
                .w-70 { width: 70%; }
                .w-80 { width: 80%; }
                .w-90 { width: 90%; }
                .w-100 { width: 100%; }

                .ml-item { margin-left: 20px; }

                .mdl-layout { min-width: 350px; }

                .contenedor {
                    display: flex;
                    justify-content: space-around;
                    align-items: center;
                    padding: 20px;
                }

                img {
                    width: 100%;
                    max-width: 800px;
                }
            `, 
            { 
                headers : {'Content-Type' : 'text/css'}
            })
            e.respondWith(respuesta)
        } 
        
        else if(url.includes('https://code.getmdl.io/1.3.0/material.indigo-pink.min.css')) {
            let respuesta = fetch('https://code.getmdl.io/1.3.0/material.pink-orange.min.css')
            e.respondWith(respuesta)
        } 
        
        else if(url.includes('super.jpg')) {
            console.log('PETICION DE LA IMAGEN')
        } 
        
        else if(url.includes('main.js')) {
            console.log('Peticion main interceptada')
        }
    }
     else {
        let respuesta = fetch(url)
        e.respondWith(respuesta)
    }

    //console.log('------------------------------------------')

})