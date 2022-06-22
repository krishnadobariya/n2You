function socket(io) {
    
    io.on('connection', () => {
        console.log('a user is connected')
    })
}

module.exports = socket;