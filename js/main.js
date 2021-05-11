/* ----------------------------------------------- */
/*               VARIABLES GLOBALES                */
/* ----------------------------------------------- */
let listaProductos = leerListaProductos([])

/* ----------------------------------------------- */
/*               FUNCIONES GLOBALES                */
/* ----------------------------------------------- */

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

async function renderLista() {
    try {
        //Leemos la plantilla desde un archivo externo (plantilla-lista.hbs)
        //----- con ajax de jquery ----
        let plantilla = await $.ajax({url:'plantilla-lista.hbs', method: 'get'})
        
        // compilamos la plantilla
        let template = Handlebars.compile(plantilla);

        //Obtengo la lista de productos de la web
        listaProductos = await api.getProdWeb()
        //console.log(listaProductos)

        //almacena la lista en el localstorage
        guardarListaProductos(listaProductos)

        // a través de la función template (devuelta por el compilador de handlebars) inyectamos los datos en la plantilla
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
    })    
}

function registrarServiceWorker() {
    if('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            this.navigator.serviceWorker.register('./sw.js')
            .then( reg => {
                //console.log('El service worker se registró correctamente', reg)

                initialiseUI(reg)
                
                //Habilitamos el funcionamiento de las carteles de notificación por parte de nuestra AWP
                Notification.requestPermission(function(result) {
                    if (result === 'granted') {
                        navigator.serviceWorker.ready.then(function(registration) {
                            console.log(registration)
                        });
                    }
                });

                //con skip waiting automático escucho evento de cambio de estado de SW para reiniciar la page
                reg.onupdatefound = () => {
                    const installingWorker = reg.installing
                    installingWorker.onstatechange = () => {
                        console.log('SW ------> ', installingWorker.state)
                        if(installingWorker.state == 'activated') {
                            console.log('REINICIANDO...')

                            //reinicio la página a los 2 segundos...
                            setTimeout(() => {
                                console.log('OK')
                                location.reload()
                            },2000)
                        }
                    }
                }
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
            await renderLista()
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

function start() {
    //console.log('Super Lista')

    registrarServiceWorker()
    configurarListeners()
    iniDialog()

    renderLista()
}

/* ----------------------------------------------- */
/*                    EJECUCIÓN                    */
/* ----------------------------------------------- */
$(document).ready(start)