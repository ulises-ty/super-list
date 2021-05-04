/*----------------------------------------------------- */
/*                VARIABLES GLOBALES                    */
/*----------------------------------------------------- */
let listaProductos = [
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
]

let crearLista = true
let ul 

/*----------------------------------------------------- */
/*                FUNCIONES GLOBALES                    */
/*----------------------------------------------------- */
function borrarProd(index) {
    listaProductos.splice(index, 1)
    renderLista()
}

function cambiarCantidadProd(index, el) {
    let cantidad = parseInt(el.value)
    console.log('cambiarCantidadProd', index)
    listaProductos[index].cantidad = cantidad
    //console.dir(el)
}

function cambiarPrecioProd(index, el) {
    //let precio = parseFloat(el.value)
    let precio = Number(el.value)
    console.log('cambiarPrecioProd', index)
    listaProductos[index].precio = precio
    //console.dir(el)
}

function renderLista() {
    if(crearLista) {
        ul = document.createElement('ul')
        ul.classList.add('demo-list-icon', 'mdl-list', 'w-100')
    }

    ul.innerHTML = ''

    listaProductos.forEach( (prod, index) => {
        ul.innerHTML += 
            `
                <li class="mdl-list__item">
                    <!-- Icono del Producto -->
                    <span class="mdl-list__item-primary-content w-10">
                        <i class="material-icons mdl-list__item-icon">shopping_cart</i>
                    </span>
    
                    <!-- Nombre del Producto -->
                    <span class="mdl-list__item-primary-content w-30">
                        ${prod.nombre}
                    </span>
    
                    <!-- Cantidad del producto -->
                    <span class="mdl-list__item-primary-content w-20">
                        <!-- Textfield with Floating Label -->
                        <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
                            <input onchange="cambiarCantidadProd(${index}, this)" class="mdl-textfield__input" type="text" id="sample-cantidad-${index}" value="${prod.cantidad}">
                            <label class="mdl-textfield__label" for="sample-cantidad-${index}">Cantidad<label>
                        </div>
    
                    </span>
    
                    <!-- Precio del Producto -->
                    <span class="mdl-list__item-primary-content w-20 ml-item">
                        <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label">
                            <input onchange="cambiarPrecioProd(${index}, this)" class="mdl-textfield__input" type="text" id="sample-precio-${index}" value="${prod.precio}">
                            <label class="mdl-textfield__label" for="sample-precio-${index}">Precio ($)<label>
                        </div>
                    </span>
    
                    <!-- Accion (Borrar Producto) -->
                    <span class="mdl-list__item-primary-content w-20 ml-item">
                        <!-- Colored FAB button with ripple -->
                        <button onclick="borrarProd(${index})" class="mdl-button mdl-js-button mdl-button--fab mdl-js-ripple-effect mdl-button--colored">
                            <i class="material-icons">remove_shopping_cart</i>
                        </button>
                    </span>
    
                </li>
            `
    })

    if(crearLista) {
        document.getElementById('lista').append(ul)
        crearLista = false
    } else {
        componentHandler.upgradeElements(ul)
    }
}

function configurarListeners() {
    /* Ingreso de Producto */
    document.getElementById('btn-entrada-producto').addEventListener('click', e => {
        console.log(e)

        let input = document.getElementById('ingreso-producto')
        let producto = input.value

        console.log(producto)

        if(producto) {
            listaProductos.push({
                nombre: producto,
                cantidad: 1,
                precio: 0
            })
            renderLista()
            input.value = null
        }
    })

    /* Borrar Productos */
    document.getElementById('btn-borrar-productos').addEventListener('click', e => {
        console.log(e)

        if(listaProductos.length) {
            let dialog = document.querySelector('dialog');
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
    let dialog = document.querySelector('dialog');
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
start()