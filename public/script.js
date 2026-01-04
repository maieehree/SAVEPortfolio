// Core Logic for Portfolio App

// --- Authentication Logic ---

// Toggle between Login and Register views
const authTitle = document.getElementById('auth-title');
const authSubtitle = document.getElementById('auth-subtitle');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const toggleText = document.getElementById('toggle-text');
const toggleBtn = document.getElementById('toggle-auth');

let isLoginView = true;

if (toggleBtn) {
    toggleBtn.addEventListener('click', (e) => {
        e.preventDefault();
        isLoginView = !isLoginView;

        if (isLoginView) {
            authTitle.innerText = "Welcome Back";
            authSubtitle.innerText = "Enter your details to access your portfolio";
            loginForm.style.display = 'block';
            registerForm.style.display = 'none';
            toggleText.innerHTML = `Don't have an account? <a href="#" style="color: var(--primary); font-weight: 600;" id="toggle-auth">Sign Up</a>`;
            document.getElementById('toggle-auth').addEventListener('click', toggleAuth); // Re-attach listener
        } else {
            authTitle.innerText = "Create Account";
            authSubtitle.innerText = "Start building your professional portfolio today";
            loginForm.style.display = 'none';
            registerForm.style.display = 'block';
            toggleText.innerHTML = `Already have an account? <a href="#" style="color: var(--primary); font-weight: 600;" id="toggle-auth">Sign In</a>`;
            document.getElementById('toggle-auth').addEventListener('click', toggleAuth); // Re-attach listener
        }
    });
}

function toggleAuth(e) {
    // Helper to re-attach if innerHTML changes
    e.preventDefault();
    toggleBtn.click();
}

// Handle Register
if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('reg-name').value;
        const email = document.getElementById('reg-email').value;
        const password = document.getElementById('reg-password').value;

        if (!name || !email || !password) return alert('Please fill all fields');

        const users = JSON.parse(localStorage.getItem('portfolio_users') || '[]');

        if (users.find(u => u.email === email)) {
            alert('Email already registered');
            return;
        }

        const newUser = { name, email, password };
        users.push(newUser);
        localStorage.setItem('portfolio_users', JSON.stringify(users));

        // Auto-login
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        window.location.href = 'dashboard.html';
    });
}

// Handle Login
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        const users = JSON.parse(localStorage.getItem('portfolio_users') || '[]');
        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            localStorage.setItem('currentUser', JSON.stringify(user));
            window.location.href = 'dashboard.html';
        } else {
            alert('Invalid credentials');
        }
    });
}

// --- Dashboard Logic ---

// Logout
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    });
}

// Tab Switching
function switchTab(tabId) {
    const viewPortfolio = document.getElementById('view-portfolio');
    const viewAdd = document.getElementById('view-add-new');
    const links = document.querySelectorAll('.nav-link');

    links.forEach(l => l.classList.remove('active'));

    if (tabId === 'portfolio') {
        viewPortfolio.style.display = 'block';
        viewAdd.style.display = 'none';
        links[0].classList.add('active');
        loadPortfolio();
    } else {
        viewPortfolio.style.display = 'none';
        viewAdd.style.display = 'block';
        links[1].classList.add('active');
    }
}

// Add New Work
const addWorkForm = document.getElementById('add-work-form');
if (addWorkForm) {
    addWorkForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const title = document.getElementById('work-title').value;
        const desc = document.getElementById('work-desc').value;
        const level = document.getElementById('work-level').value;
        const imageFile = document.getElementById('work-image').files[0];
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));

        if (!imageFile) return alert('Please upload an image');

        // Convert image to Base64
        const reader = new FileReader();
        reader.onloadend = function () {
            const base64String = reader.result;

            const newWork = {
                id: Date.now(),
                userEmail: currentUser.email,
                title,
                desc,
                level,
                image: base64String,
                date: new Date().toLocaleDateString()
            };

            const works = JSON.parse(localStorage.getItem('portfolio_works') || '[]');
            works.push(newWork);
            localStorage.setItem('portfolio_works', JSON.stringify(works));

            alert('Achievement Added!');
            addWorkForm.reset();
            switchTab('portfolio');
        }
        reader.readAsDataURL(imageFile);
    });
}

// Load Portfolio
function loadPortfolio() {
    const container = document.getElementById('portfolio-container');
    const emptyState = document.getElementById('empty-state');
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    if (!container || !currentUser) return;

    const works = JSON.parse(localStorage.getItem('portfolio_works') || '[]');
    const userWorks = works.filter(w => w.userEmail === currentUser.email);

    container.innerHTML = '';

    if (userWorks.length === 0) {
        emptyState.style.display = 'block';
        return;
    }

    emptyState.style.display = 'none';

    userWorks.forEach(work => {
        const card = document.createElement('div');
        card.className = 'portfolio-card animate-fade-in';
        card.onclick = () => openModal(work.id); // Add click event to open details
        card.innerHTML = `
            <img src="${work.image}" class="card-image" alt="${work.title}">
            <div class="card-content">
                <span class="badge badge-${work.level}">${work.level}</span>
                <h3 style="margin-top: 0.5rem; font-size: 1.25rem;">${work.title}</h3>
                <p style="font-size: 0.9rem; margin-bottom: 0.5rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; text-overflow: ellipsis;">${work.desc}</p>
                <div class="card-footer">
                    <span style="font-size: 0.8rem; color: var(--text-muted);">${work.date}</span>
                    <a href="${work.image}" download="portfolio-${work.title}.png" class="btn btn-outline" style="padding: 0.4rem 0.8rem; font-size: 0.8rem;" onclick="event.stopPropagation()">
                        <i class="fas fa-download"></i> Download
                    </a>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

// Modal Logic
function openModal(workId) {
    const works = JSON.parse(localStorage.getItem('portfolio_works') || '[]');
    const work = works.find(w => w.id === workId);
    if (!work) return;

    document.getElementById('modal-image').src = work.image;
    document.getElementById('modal-title').innerText = work.title;
    document.getElementById('modal-badge').innerText = work.level;
    document.getElementById('modal-badge').className = `badge badge-${work.level}`;
    document.getElementById('modal-desc').innerText = work.desc;
    document.getElementById('modal-date').innerText = work.date;
    document.getElementById('modal-download').href = work.image;
    document.getElementById('modal-download').download = `portfolio-${work.title}.png`;

    const modal = document.getElementById('detail-modal');
    modal.style.display = 'flex';
    // Small delay to allow display:flex to apply before adding opacity class for transition
    setTimeout(() => {
        modal.classList.add('active');
    }, 10);
}

function closeModal() {
    const modal = document.getElementById('detail-modal');
    modal.classList.remove('active');
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300); // Wait for transition
}

// Trigger initial load if on dashboard
if (document.getElementById('portfolio-container')) {
    loadPortfolio();
}
