class APIResponse {
    constructor(message = '', status = false, code = 200, statusCode = 1, data = null, error = null) {
        if (message) {
            this.message = message
        }
        if (status) {
            this.status = status
        }
        if (code) {
            this.code = code
        }
        if (statusCode) {
            this.statusCode = statusCode
        }
        if (data) {
            this.data = data
        }

        if (error) {
            this.error = error
        }
    }
}

module.exports = APIResponse;
