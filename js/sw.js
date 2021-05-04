self.addEventListener('install', e => {
    console.log('sw instal')
})

self.addEventListener('activate', e => {
    console.log('sw activate')
})  

self.addEventListener('fetch', e => {
    console.log('sw fetch')
})