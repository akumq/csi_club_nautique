class APIClient {
    constructor(baseURL) {
        this.baseURL = baseURL;
        this.token = sessionStorage.getItem('authToken');
    }

    async login(username, password) {
        try {
            const response = await fetch(`${this.baseURL}/api/auth/login/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            if (!response.ok) {
                throw new Error('Login failed');
            }

            const data = await response.json();
            this.token = data.token;
            sessionStorage.setItem('authToken', this.token);
            console.log('Login successful! Token stored in session storage.');
            window.location.href = '/dashboard.html'; // Redirection après connexion
        } catch (error) {
            console.log(error);
            console.log('Error logging in.');
        }
    }

    async request(endpoint, options = {}) {

        if (!this.token) {
            throw new Error('No token available. Please login first.');
        }
    
        const headers = {
            ...options.headers,
            Authorization: `Bearer ${this.token}`,
        };
    
        const response = await fetch(`${this.baseURL}${endpoint}`, {
            ...options,
            headers
        });
    
        if (!response.ok) {
            throw new Error('Request failed');
        }
    
        return await response.json();
    }
}

function setupLoginForm() {
    const apiClient = new APIClient('http://localhost:3000');

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            await apiClient.login(username, password);
        });
    }

    // Check session storage for token
    if (sessionStorage.getItem('authToken')) {
        console.log('Token found in session storage:', sessionStorage.getItem('authToken'));
    } else {
        console.log('No token found in session storage. Please login.');
    }
}
