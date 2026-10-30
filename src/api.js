
const BASE_URL = 'http://127.0.0.1:8001/api';

export async function apiFetch(path, options = {}) {
    const token = localStorage.getItem('token');

    const headers = new Headers(options.headers || {});

    if (token) {
        headers.set('Authorization', `Token ${token}`);
    }

    const response = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers
    });

    return response;
}
