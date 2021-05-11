/* ----------------------------------------------- */
/*               VARIABLES GLOBALES                */
/* ----------------------------------------------- */
let listaProductos = leerListaProductos([
    { nombre: 'Pan',    cantidad: 2,    precio: 12.34 },
    { nombre: 'Carne',  cantidad: 3,    precio: 34.56 },
    { nombre: 'Leche',  cantidad: 4,    precio: 56.78 },
    { nombre: 'Fideos', cantidad: 5,    precio: 78.90 }
])

/* ----------------------------------------------- */
/*               FUNCIONES GLOBALES                */
/* ----------------------------------------------- */


/* ------------------------------------------------------------------- */

/* ------------------- LOCALSTORAGE ----------------------- */
function guardarListaProductos(lista) {
    let prods = JSON.stringify(lista)
    localStorage.setItem('LISTA', prods)
}

function leerListaProductos(lista) {
    let prods = localStorage.getItem('LISTA')
    if(prods) {
        try {
            lista = JSON.parse(prods)
        }
        catch(error) {
            lista = []
            guardarListaProductos(lista)
        }
    }
    return lista
}
/* -------------------------------------------------------- */

async function borrarProd(id) {
    /* https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Array/splice */
    //listaProductos.splice(index,1)
    console.log(id)

    try {
        await api.deleteProdWeb(id)    
        renderLista()
    }
    catch(error) {
        console.log('borrarProd',error)
    }
}

async function cambiarValorProd(campo,id,el) {
    let index = listaProductos.findIndex(prod => prod.id == id )
    let valor = parseInt(el.value)
    console.log('cambiarValorProd', campo, id, index, valor)
    //console.dir(el)
    listaProductos[index][campo] = valor

    guardarListaProductos(listaProductos)

    //Actualizo el producto en el backend
    let prod = listaProductos[index]
    try {
        let p = await api.putProdWeb(prod,id)
        console.log(p)
    }
    catch(error) {
        console.error(`error en putProdWeb: cambiar ${campo}`)
    }
}
/*
async function cambiarCantidadProd(id,el) {
    let index = listaProductos.findIndex(prod => prod.id == id )
    let cantidad = parseInt(el.value)
    console.log('cambiarCantidadProd', id, index, cantidad)
    //console.dir(el)
    listaProductos[index].cantidad = cantidad

    guardarListaProductos(listaProductos)

    //Actualizo el producto en el backend
    let prod = listaProductos[index]
    try {
        let p = await api.putProdWeb(prod,id)
        console.log(p)
    }
    catch(error) {
        console.error('error en putProdWeb: cambiar cantidad')
    }
}

async function cambiarPrecioProd(id,el) {
    let index = listaProductos.findIndex(prod => prod.id == id )

    //let precio = parseFloat(el.value)
    let precio = Number(el.value)
    console.log('cambiarPrecioProd', id, index, precio)
    //console.dir(el)
    listaProductos[index].precio = precio

    guardarListaProductos(listaProductos)

    //Actualizo el producto en el backend
    let prod = listaProductos[index]
    try {
        let p = await api.putProdWeb(prod,id)
        console.log(p)
    }
    catch(error) {
        console.error('error en putProdWeb: cambiar precio')
    }
}
*/
async function renderLista() {
    try {
        //Leemos la plantilla desde un archiov externo (plantilla-lista.hbs)
        //----- con fetch ----
        /* let datos = await fetch('plantilla-lista.hbs')
        let plantilla = await datos.text() */
        
        //----- con ajax de jquery ----
        let plantilla = await $.ajax({url:'plantilla-lista.hbs', method: 'get'})
        
        //console.log(plantilla)
        //console.log('-------------------------------------------')

        // compilamos la plantilla
        let template = Handlebars.compile(plantilla);

        //Obtengo la lista de productos de la web
        listaProductos = await api.getProdWeb()
        //console.log(listaProductos)

        //almacena la lista en el localstorage
        guardarListaProductos(listaProductos)

        // a través de la función template (devuelta por el compilador de handlebars) inyectamos los datos en la plantilla
        //$('#lista').html(template({ listaProductos: listaProductos }))
        $('#lista').html(template({ listaProductos }))

        let ul = $('#contenedor-lista')
        componentHandler.upgradeElements(ul)
    }
    catch(error) {
        console.error('Error en renderLista', error)
    }
}

function configurarListeners() {

    /* Ingreso de producto */
    $('#btn-entrada-producto').click( async () => {
        console.log('btn-entrada-producto')

        let input = $('#ingreso-producto')
        let producto = input.val()
        console.log(producto)

        if(producto) {
            //listaProductos.push( { nombre: producto, cantidad: 1, precio: 0 } )
            try {
                let prod = { nombre: producto, cantidad: 1, precio: 0 }
                await api.postProdWeb(prod)
                renderLista()
                input.val(null)
            }
            catch(error) {
                console.error('entrada producto', error)
            }
        }
    })    

    /* Borrado de todos los productos */
    $('#btn-borrar-productos').click( () => {
        console.log('btn-borrar-productos')

        if(listaProductos.length) {
            var dialog = $('dialog')[0];
            dialog.showModal();
        }
        /*
        if(confirm('Confirma borrar todo?')) {
            listaProductos = []
            renderLista()
        }
        */
    })    
}

function registrarServiceWorker() {
    if('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            this.navigator.serviceWorker.register('./sw.js')
            .then( reg => {
                //console.log('El service worker se registró correctamente', reg)
            })
            .catch( err => {
                console.error('Error al registrar el service worker', err)
            })
        })
    }
    else {
        console.error('serviceWorker no está disponible en este navegador')
    }
}

function iniDialog() {
    var dialog = $('dialog')[0];
    //console.log(dialog)
    if (! dialog.showModal) {
      dialogPolyfill.registerDialog(dialog);
    }

    $('dialog .aceptar').click ( async () => {
        try {
            dialog.close();
            await api.deleteAllProdWeb()
            //listaProductos = []
            renderLista()
            //dialog.close();
        }
        catch(error) {
            console.error('Borrar todo', error)
        }
    });    
  
    $('dialog .cancelar').click( () => {
      dialog.close();
    });    
}

/* ---------------------------------------------------------------- */
/*                         PROMESAS TEST                            */
/* ---------------------------------------------------------------- */
function delayPromise(ms) {
    return new Promise((resolve,reject) => {
        if(typeof ms == 'number') {
            setTimeout(() => resolve('Ok retardo'), ms)
        }
        else {
            let error = {
                mensaje: 'error de parámetro ms',
                ms: ms,
                typeof: typeof ms
            }
            reject(error)
        }
    })
}

function testPromesas() {
    console.warn('tIni',new Date().toLocaleString())

    delayPromise(3000)
    .then(respuesta => {
        console.log(respuesta)
        console.warn('tFin',new Date().toLocaleString())
    })
    .catch(error => console.error(error))
}

/* ---------------------------------------------------------------- */
/*                           FETCH TEST                             */
/* ---------------------------------------------------------------- */
function testFetchThenCatch() {
    fetch('https://jsonplaceholder.typicode.com/todos/1')
    .then(response => response.json())
    .then(json => console.log('OK FETCH THEN CATCH',json))
    .catch(error => console.error('ERROR FETCH THEN CATCH',error))    
}

async function testFetchAsyncAwait() {
    try {
        let response = await fetch('https://jsonplaceholder.typicode.com/todos/1')
        let json = await response.json()
        console.log('OK FETCH ASYNC AWAIT',json)
    }
    catch(error) {
        console.error('ERROR FETCH ASYNC AWAIT',error)
    }
}

function testCache() {
    //https://caniuse.com/?search=caches
    if(window.caches) {
        console.log('El browser soporta caches')

        /* Creo espacios de cache */
        caches.open('prueba-1')
        caches.open('prueba-2')
        caches.open('prueba-3')

        /* Comprueba si el cache existe o no */
        //caches.has('prueba-3').then(rta => console.log(rta))
        caches.has('prueba-3').then(console.log)

        /* Borro un cache */
        caches.delete('prueba-1').then(console.log)

        /* Listo todos los caches */
        caches.keys().then(console.log)

        /* Abro un cache y trabajo con el */
        caches.open('cache-v1.1').then( cache => {
            console.log(cache)
            console.log(caches)

            /* Agrego un recurso al cache */
            //cache.add('/index.html')

            /* Agrego varios recursos al cache */
            cache.addAll([
                '/index.html',
                '/css/estilos.css',
                '/images/super.jpg'
            ]).then( () => {
                console.log('recursos agregados!')

                /* Borro un recurso del cache */
                cache.delete('/css/estilos.css').then(console.log)

                //cache.match('/index.html').then( res => {
                cache.match('/css/estilos.css').then( res => {
                    if(res) {
                        console.log('Recurso encontrado')
                        /* Accedo al contenido del recurso  */
                        res.text().then(console.log)
                    }
                    else {
                        console.error('Recurso inexistente')
                    }
                })

                /* Creo ó modifico el contenido de un recurso */
                cache.put('/index.html', new Response('Hola Mundo!'))

                /* Listo todos LOS RECURSOS que contiene ese cache */
                cache.keys().then( recursos => console.log('Recursos de cache', recursos))
                cache.keys().then( recursos => {
                    recursos.forEach( recurso => {
                        console.log(recurso.url)
                    })
                })

                /* Listo todos los NOMBRES DE LOS ESPACIOS DE CACHE en el caches (CacheStorage) */
                caches.keys().then( nombres => {
                    console.log('Nombre de caches:', nombres)
                })
            })
        })  
    }
    else {
        console.log('caches no soportado')
    }
}

function start() {
    //console.log('Super Lista')

    registrarServiceWorker()
    configurarListeners()
    iniDialog()

    //testPromesas()
    //testFetchThenCatch()
    //testFetchAsyncAwait()
    //testCache()

    renderLista()
}

/* ----------------------------------------------- */
/*                    EJECUCIÓN                    */
/* ----------------------------------------------- */
//start()
//window.onload = start
$(document).ready(start)