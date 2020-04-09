// addUser, removeUser, getUser, getUsersInRoom
const users = []
// Add User
const addUser = ({ id, username, room }) => {
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()
    if (!username || !room) {
        return {
            error: 'username and room are required!'
        }
    }
    const userExist = users.find(user => {
        return user.username === username && user.room === room
    })
    if (userExist) {
        return {
            error: 'username is already in use!'
        }
    }
    const user = { id, username, room }
    users.push(user)
    return { user }
}
// Remove User By Id
const removeUser = id => {
    const index = users.findIndex(user => user.id === id)
    if (index !== -1) {
        return users.splice(index, 1)[0]
    }
}
// Get User By Id
const getUser = id => {
    return users.find(user => user.id === id)
}
// Get All Users In Same Room
const getUsersInRoom = room => {
    return users.filter(user => user.room === room)
}

module.exports = {
    getUser,
    getUsersInRoom,
    addUser,
    removeUser
}