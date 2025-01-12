class Navigation {
    static styles = `
        body {
            display: flex;
            min-height: 100vh;
        }

        .sidebar {
            position: relative;
            top: 0;
            bottom: 0;
            left: 0;
            z-index: 100;
            padding: 48px 0 0;
            box-shadow: inset -1px 0 0 rgba(0, 0, 0, .1);
            width: 250px;
            background: #f8f9fa;
        }

        .main-content {
            flex: 1;
            padding: 20px;
        }

        @media (max-width: 768px) {
            .sidebar {
                width: 100%;
                height: auto;
                position: relative;
                padding: 0;
            }
            .main-content {
                margin-left: 0;
            }
        }

        .nav-link {
            color: #333;
            padding: 0.5rem 1rem;
            transition: all 0.3s;
        }

        .nav-link:hover {
            background-color: #e9ecef;
        }

        .nav-link.active {
            color: #007bff;
            background-color: #e9ecef;
        }
    `;

    constructor() {
        this.apiClient = new APIClient('http://localhost:3000');
        this.currentPage = window.location.pathname;
        this.setupNavigation();
    }

    setupNavigation() {
        if (this.currentPage !== '/login.html') {
            this.checkAuth();
        } else {
            this.setupLoginForm();
        }

        this.setupLogout();
        this.updateActiveNavLink();
    }

    static async loadNavigation() {
        const navigation = new Navigation();
        await navigation.checkAuth();
        navigation.createSidebar();
        
        if (!document.getElementById('navigationStyles')) {
            const styleSheet = document.createElement('style');
            styleSheet.id = 'navigationStyles';
            styleSheet.textContent = Navigation.styles;
            document.head.appendChild(styleSheet);
        }
    }

    createSidebar() {
        const navigationHtml = `
            <nav class="sidebar">
                <div class="sidebar-sticky">
                    <ul class="nav flex-column">
                        <li class="nav-item">
                            <a class="nav-link" href="/dashboard.html">
                                <i class="fas fa-home"></i> Dashboard
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="/clients.html">
                                <i class="fas fa-users"></i> Clients
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="/materiels.html">
                                <i class="fas fa-tools"></i> Matériels
                            </a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="/personnels.html">
                                <i class="fas fa-user-tie"></i> Personnels
                            </a>
                        </li>
                        <li class="nav-item mt-3">
                            <button class="btn btn-outline-danger mx-3" id="logoutBtn">
                                <i class="fas fa-sign-out-alt"></i> Déconnexion
                            </button>
                        </li>
                    </ul>
                </div>
            </nav>
        `;

        const navigationContainer = document.getElementById('navigation');
        if (navigationContainer) {
            navigationContainer.innerHTML = navigationHtml;
        }

        this.setupLogout();
        this.updateActiveNavLink();
    }

    async checkAuth() {
        const token = sessionStorage.getItem('authToken');
        if (!token) {
            this.redirectToLogin();
            return;
        }

        try {
            await this.apiClient.request('/api/auth/verifyToken', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            this.updateNavigation();
        } catch (error) {
            console.error('Erreur lors de la vérification du token:', error);
            this.redirectToLogin();
        }
    }

    setupLogout() {
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.clearSession();
                this.redirectToLogin();
            });
        }
    }

    updateActiveNavLink() {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === this.currentPage) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    clearSession() {
        sessionStorage.removeItem('authToken');
        sessionStorage.removeItem('userRole');
    }

    redirectToLogin() {
        if (window.location.pathname !== '/login.html') {
            window.location.href = '/login.html';
        }
    }

    setupLoginForm() {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                try {
                    const username = document.getElementById('username').value;
                    const password = document.getElementById('password').value;
                    await this.apiClient.login(username, password);
                    this.redirectToDashboard();
                } catch (error) {
                    console.error('Erreur lors de la connexion:', error);
                }
            });
        }
    }

    updateNavigation() {
        const userRole = sessionStorage.getItem('userRole');
        
        // Logique pour afficher ou masquer des éléments de navigation
        const adminLinks = document.querySelectorAll('.admin-link');
        if (userRole === 'administrateur') {
            adminLinks.forEach(link => link.style.display = 'block');
        } else {
            adminLinks.forEach(link => link.style.display = 'none');
        }
    }
} 