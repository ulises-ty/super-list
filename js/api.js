const api = (function() {

    /* -------- API REST lista productos contra https://mockapi.io ------- */
    function getURL(id) {
        return 'https://5c8ef17a3e557700145e85c7.mockapi.io/lista/' + (id? id:'')
    }

    /* GET */
    async function getProdWeb() {
        try {
            let url = getURL() + '?' + Date.now()
            //console.log(url)
            let prods = await $.ajax({url, method: 'get'})
            return prods
        }
        catch(error) {
            console.error('Error getProdWeb', error)
            let prods = leerListaProductos(listaProductos)
            return prods
        }
    }

    /* POST */
    async function postProdWeb(prod) {
        try {
            let url = getURL()
            //console.log(url)
            let p = await $.ajax({url, method: 'post', data: prod})
            //console.log(p)
            return p
        }
        catch(error) {
            console.error('Error postProdWeb', error)
            return {}
        }
    }

    /* PUT */
    async function putProdWeb(prod,id) {
        try {
            let url = getURL(id)
            //console.log(url)
            let p = await $.ajax({url, method: 'put', data: prod})
            //console.log(p)
            return p
        }
        catch(error) {
            console.error('Error putProdWeb', error)
            return {}
        }
    }

    /* DELETE */
    async function deleteProdWeb(id) {
        try {
            let url = getURL(id)
            //console.log(url)
            let prod = await $.ajax({url, method: 'delete'})
            //console.log(prod)
            return prod
        }
        catch(error) {
            console.error('Error deleteProdWeb', error)
            //return {}
            throw new Error('Error deleteProdWeb', error)
        }
    }

    const retardo = ms => new Promise(resolve => setTimeout(resolve,ms))

    /* DELETE ALL */
    async function deleteAllProdWeb() {

        let progress = $('progress')
        //console.log(progress)
        progress.css('display','block')

        let porcentaje = 0

        for(let i=0; i<listaProductos.length; i++) {

            porcentaje = parseInt((i * 100) / listaProductos.length)
            console.log(porcentaje)
            progress.attr('value', porcentaje)

            let id = listaProductos[i].id
            try {
                await deleteProdWeb(id)
                //await renderLista()
                await retardo(250)
            }
            catch(error) {
                await retardo(1000)
                i--
                console.error('Error deleteAllProdWeb', error)
            }
        }
        porcentaje = 100
        console.log(porcentaje)
        progress.attr('value', porcentaje)

        await retardo(2000)
        progress.css('display','none')
    }

    //console.log('Librería api instalada!')

    return {
        getProdWeb : () => getProdWeb(), // es igual a getProdWeb : getProdWeb,
        postProdWeb : prod => postProdWeb(prod),
        putProdWeb : (prod,id) => putProdWeb(prod,id),
        deleteProdWeb : id => deleteProdWeb(id),
        deleteAllProdWeb: () => deleteAllProdWeb()
    }
})()