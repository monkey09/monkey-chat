const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { generateMessage, generateLocation } = require('./utils/messages')
const { addUser, getUser, removeUser, getUsersInRoom } = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const publicDirectory = path.join(__dirname, '../public')
app.use(express.static(publicDirectory))

io.on('connection', socket => {
    socket.on('join', (options, callback) => {
        const { error, user } = addUser({id: socket.id, ...options})
        if (error) {
            return callback(error)
        }
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        socket.join(user.room)
        socket.emit('receive', generateMessage('monkey', 'Welcome!'))
        socket.broadcast.to(user.room).emit('receive', generateMessage('monkey', `${user.username} has join!`))
        callback()
    })
    // receive a message from client and send it to another
    socket.on('send', (message, callback) => {
        const filter = new Filter()
        if (filter.isProfane(message)) {
            return callback('No curces!')
        }
        const user = getUser(socket.id)
        io.to(user.room).emit('receive', generateMessage(user.username, message))
        callback()
    })
    // receive a location from client and send it to another
    socket.on('sendLocation', ({ latitude, longitude }, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('receiveURL', generateLocation(user.username, `https://google.com/maps?q=${latitude},${longitude}`))
        callback()
    })
    // firesomething when the client has disconnect
    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if (user) {
            io.to(user.room).emit('receive', generateMessage('monkey', `${user.username} has left!`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })
})

const port = process.env.PORT || 5000
server.listen(port, () => console.log(`up on port ${port}`))