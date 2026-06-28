import axios from 'axios';

// JSONPlaceholder is a free mock REST API. POST/PUT/DELETE calls are
// simulated by the server -- it returns a "successful" response (with
// the right status code and an echoed/faked payload) but does NOT
// persist any change. We work around this in usersApi.js by patching
// our local state optimistically after a successful response.
export const BASE_URL = 'https://jsonplaceholder.typicode.com';

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Normalize axios errors into a small, predictable shape the UI can render.
client.interceptors.response.use(
  (response) => response,
  (error) => {
    let message = 'Something went wrong. Please try again.';

    if (error.code === 'ECONNABORTED') {
      message = 'The request timed out. Check your connection and try again.';
    } else if (error.response) {
      message = `Server responded with an error (status ${error.response.status}).`;
    } else if (error.request) {
      message = 'No response from the server. Check your internet connection.';
    }

    return Promise.reject({ ...error, friendlyMessage: message });
  }
);

export default client;
