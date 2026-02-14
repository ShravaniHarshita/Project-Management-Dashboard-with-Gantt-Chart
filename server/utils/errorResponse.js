/**
 * Custom Error Response Class
 * Extends Error to include status code for HTTP responses
 */
class ErrorResponse extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
  }
}

module.exports = ErrorResponse;
