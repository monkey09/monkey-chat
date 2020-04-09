const socket = io()
const messages = document.querySelector('#messages')
const sidebar = document.querySelector('#sidebar')
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML
const form = document.querySelector('#message-form')
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoScroll = () => {
    // New message element
    const newMessage = messages.lastElementChild
    // Height of new message
    const newMessageHeight = 
    parseInt(getComputedStyle(newMessage).marginBottom) + newMessage.offsetHeight
    // Visible height
    const visibleHeight = messages.offsetHeight
    // Messages container height
    const containerHeight = messages.scrollHeight
    const scrollOffset = messages.scrollTop + visibleHeight
    if (containerHeight - newMessageHeight <= scrollOffset) {
        messages.scrollTop = messages.scrollHeight
    }
}

socket.on('receive', message => {
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

socket.on('receiveURL', message => {
    const html = Mustache.render(locationTemplate, {
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    sidebar.innerHTML = html
})

form.addEventListener('submit', e => {
    e.preventDefault()
    form.querySelector('button').disabled = true
    const message = e.target.elements.message.value
    socket.emit('send', message, error => {
        if (error) alert(error)
        form.querySelector('input').value = ''
        form.querySelector('input').focus()
        form.querySelector('button').disabled = false
    })
})

const locationBtn = document.querySelector('#send-location')
locationBtn.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('oldy!!')
    }
    locationBtn.disabled = true
    navigator.geolocation.getCurrentPosition(position => {
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            locationBtn.disabled = false
        })
    })
})

socket.emit('join', { username, room }, error => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})