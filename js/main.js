/*----------------------------------------------------- */
/*                VARIABLES GLOBALES                    */
/*----------------------------------------------------- */
let listaProductos = leerListaProductos([
    {
        nombre: 'Pan', 
        cantidad: 2,
        precio: 12.34
    },
    {
        nombre: 'Carne', 
        cantidad: 3,
        precio: 34.56
    },
    {
        nombre: 'Leche', 
        cantidad: 4,
        precio: 56.78
    },
    {
        nombre: 'Fideos', 
        cantidad: 5,
        precio: 78.90
    }
])

/*----------------------------------------------------- */
/*                FUNCIONES GLOBALES                    */
/*----------------------------------------------------- */
/*----------     API REST lista productos    ---------- */
function getURL(id) {
    return 'https://6092b6a485ff510017213794.mockapi.io/lista/' + (id ? id:'')
}

//GET
async function getProdWeb() {
    try {
        let url = getURL() + '?' + Date.now()
        let prod = await $.ajax({url, method: 'GET'})

        return prod
    } 
    catch(error) {
        console.log('Error getProdWeb', error)
        let prods = leerListaProductos(listaProductos)
        return prods
    }
}

//POST
async function postProdWeb(prod) {
    try {
        let url = getURL()
        let p = await $.ajax({url, method: 'POST', data: prod})

        return p
    } 
    catch(error) {
        console.log('Error postProdWeb', error)
        return {}
    }
}

//PUT
function PUTProdWeb(prod, id) {
    
}

//DELETE
async function deleteProdWeb(id) {
    try {
        let url = getURL(id)
        let prod = await $.ajax({url, method: 'DELETE'})

        return prod
    } 
    catch(error) {
        console.log('Error getProdWeb', error)
        return {}
    }
}
/*---------------    LOCAL STORAGE    ----------------- */
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
/*----------------------------------------------------- */



async function borrarProd(id) {
    //listaProductos.splice(index, 1)
    
    try {
        await deleteProdWeb(id)
        renderLista()
    }
    catch(error) {
        console.log('borrarProd', error)
    }
}

function cambiarCantidadProd(index, el) {
    let cantidad = parseInt(el.value)
    console.log('cambiarCantidadProd', index)
    listaProductos[index].cantidad = cantidad
    //console.dir(el)

    guardarListaProductos(listaProductos)
}

function cambiarPrecioProd(index, el) {
    //let precio = parseFloat(el.value)
    let precio = Number(el.value)
    console.log('cambiarPrecioProd', index)
    listaProductos[index].precio = precio
    //console.dir(el)

    guardarListaProductos(listaProductos)
}

async function renderLista() {
    try {
        //Leemos  la plantilla desde un archivo externo(plantilla-lista.hbs)
        //----- con fetch
        /* let datos = await fetch('plantilla-lista.hbs')
        let plantilla = await datos.text()*/

        //----- con ajax de jquery
        let plantilla = await $.ajax({url: 'plantilla-lista.hbs', method: 'GET'})
        //console.log(plantilla)
    
        //Compilamos la plantilla
        let template = Handlebars.compile(plantilla);

        //Obtengo la lista de productos de la web
        listaProductos = await getProdWeb()
        console.log(listaProductos)
        //Almacena la lista en el localstorage
        guardarListaProductos(listaProductos)
    
        //A traves de la funcion template (devuelta por el compilador de handlebars) inyectamos los datos en la plantilla
        //$('#lista').html(template({ listaProductos: listaProductos }));
        $('#lista').html(template({listaProductos}));
    
        let ul = $('#contenedor-lista')
        componentHandler.upgradeElements(ul)
    }
    catch(error) {
        console.error('Error en renderLista: ', error);
    }
}

function configurarListeners() {
    /* Ingreso de Producto */
    $('#btn-entrada-producto').click( async e => {
        console.log(e)

        let input = $('#ingreso-producto')
        let producto = input.val()

        console.log(producto)

        if(producto) {
            /* listaProductos.push({
                nombre: producto,
                cantidad: 1,
                precio: 0
            }) */
            try{
                let prod = {
                    nombre: producto,
                    cantidad: 1,
                    precio: 0
                }
    
                await postProdWeb(prod)
                renderLista()
                input.val(null)
            }
            catch(error) {
                console.log('Error: ', error)
            }
        }
    })

    /* Borrar Productos */
    $('#btn-borrar-productos').click( e => {
        console.log(e)

        if(listaProductos.length) {
            let dialog = $('dialog')[0];
            dialog.showModal();
        }

        /* if(confirm('Quiere borrar todo?')) {
            listaProductos = []
            renderLista()
        }  */
    })
}

function registrarServiceWorker() {
    if('serviceWorker' in navigator) {
        window.addEventListener('load', e => {
            this.navigator.serviceWorker.register('./sw.js')
            .then( reg => {
                //console.log('El servive worker se registro correctamente', reg)
            })
            .catch( err => {
                console.log('Error al registrar el service worker', err)
            })
        })
    } else {
        console.error('serviceWorker no esta disponible en este navegador')
    }
}

function iniDialog() {
    let dialog = $('dialog')[0];
    if (! dialog.showModal) {
      dialogPolyfill.registerDialog(dialog);
    }
    dialog.querySelector('.aceptar').addEventListener('click', e => {
        listaProductos = []
        renderLista()
        dialog.close()
    })
    dialog.querySelector('.cancelar').addEventListener('click', function() {
      dialog.close();
    });
}

/*----------------------------------------------------- */
/*                    PROMESAS TEST                     */
/*----------------------------------------------------- */
function delayPromise(ms) {
    return new Promise((resolve, reject) => {
        if(typeof ms == 'number') {
            setTimeout(() => resolve('Ok retardo'), ms)
        } else {
            let error = {
                mensaje: 'Error de parametro ms',
                ms: ms,
                typeof: typeof ms
            }
            reject(error)
        }
    })
}

function testPromesas() {
    console.warn('tIni', new Date().toLocaleString())
    delayPromise(3000)
    .then( respuesta => {
        console.log(respuesta)
        console.warn('tFin', new Date().toLocaleString())
    })
    .catch( err => {
        console.log(err)
    })
}

/*----------------------------------------------------- */
/*                      FETCH TEST                      */
/*----------------------------------------------------- */

function testFetch() {
    fetch('https://jsonplaceholder.typicode.com/todos/1')
        .then( response => response.json() )
        .then( json => console.log('OK FETCH THEN CATCH', json))
        .catch( error => console.error('ERROR FETCH THEN CATCH:::::', error))
}

async function testFetchAsyncAwait() {
    try {
        let response = await fetch('https://jsonplaceholder.typicode.com/todos/1')
        let json = await response.json() 
        console.log('OK FETCH ASYNC AWAIT', json)
    } catch {
        console.error('ERROR FETCH ASYNC AWAIT:::::', error)
    }
}

function start() {
    console.log('Super Lista')
    
    registrarServiceWorker()
    configurarListeners()
    iniDialog()

    //testPromesas()
    testFetch()
    testFetchAsyncAwait()

    renderLista()
}

/*----------------------------------------------------- */
/*                     EJECUCION                        */
/*----------------------------------------------------- */
//start()
//window.onload = start
$(document).ready(start)