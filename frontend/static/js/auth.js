class APIClient {
    constructor(baseURL) {
        this.baseURL = baseURL;
        this.token = sessionStorage.getItem('authToken');
    }

    async login(username, password) {
        try {
            console.log('Tentative de connexion avec:', username);
            const response = await fetch(`${this.baseURL}/api/auth/login/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (!response.ok) {
                console.error('Erreur de connexion:', data.message);
                throw new Error(data.message || 'Erreur de connexion');
            }

            this.token = data.token;
            sessionStorage.setItem('authToken', this.token);
            sessionStorage.setItem('userRole', data.role);
            
            return data;
        } catch (error) {
            console.error('Erreur lors de la connexion:', error);
            throw error;
        }
    }

    async request(endpoint, options = {}) {
        this.token = sessionStorage.getItem('authToken');
        
        if (!this.token) {
            throw new Error('No token available');
        }

        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                ...options,
                headers: {
                    ...options.headers,
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || `Request failed with status ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error('Request error:', error);
            throw error;
        }
    }
}

async function checkTokenValidity() {
    const token = sessionStorage.getItem('authToken');
    if (!token) {
        throw new Error('No token available');
    }
    // Vous pouvez également vérifier si le token est valide ici
}
