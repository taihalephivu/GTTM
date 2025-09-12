<!-- Header Styles -->
<style>
    .header {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: white;
        padding: 0 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        z-index: 9999;
        height: 60px;
        pointer-events: auto;
    }

    .header-left {
        display: flex;
        align-items: center;
        gap: 12px;
    }

    .header-center {
        flex: 1;
        max-width: 800px;
        padding: 0 20px;
        transition: none;
    }

    .header-center.hidden {
        opacity: 0;
        pointer-events: none;
    }

    .header-center.hidden .search-results {
        display: none;
    }

    @media (max-width: 768px) {
        .header-center {
            position: fixed;
            top: 70px;
            left: 16px;
            right: 16px;
            padding: 0;
            z-index: 998;
        }

        .search-box {
            background: white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }

        .search-results {
            margin-top: 4px;
            max-height: calc(100vh - 180px);
        }
    }

    .header-right {
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .menu-toggle {
        background: none;
        border: none;
        font-size: 20px;
        cursor: pointer;
        color: var(--text-primary);
        padding: 8px;
        border-radius: 50%;
        transition: all 0.3s ease;
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        z-index: 1003;
    }

    .menu-toggle:hover {
        background: var(--background-light);
        transform: scale(1.1);
    }

    .menu-toggle i {
        font-size: 20px;
    }

    .logo {
        display: flex;
        align-items: center;
        gap: 8px;
        text-decoration: none;
        color: var(--text-primary);
    }

    .logo-img {
        height: 32px;
        width: auto;
    }

    .logo-text {
        font-size: 18px;
        font-weight: 700;
        white-space: nowrap;
    }

    .search-container {
        width: 100%;
        position: relative;
    }

    .search-box {
        display: flex;
        align-items: center;
        background: var(--background-light);
        border: 1px solid var(--border-color);
        border-radius: 8px;
        overflow: hidden;
        transition: all 0.3s ease;
    }

    .search-box:focus-within {
        background: white;
        border-color: var(--accent-color);
        box-shadow: 0 0 0 3px rgba(255,107,53,0.1);
    }

    .search-icon {
        padding: 0 12px;
        color: var(--text-secondary);
    }

    .search-box input {
        flex: 1;
        padding: 10px 12px;
        border: none;
        outline: none;
        font-size: 14px;
        background: transparent;
    }

    .clear-button {
        padding: 8px;
        background: none;
        border: none;
        cursor: pointer;
        color: var(--text-secondary);
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .clear-button:hover {
        color: var(--text-primary);
    }

    .filter-button {
        padding: 8px 12px;
        background: none;
        border: none;
        border-left: 1px solid var(--border-color);
        cursor: pointer;
        color: var(--text-secondary);
        transition: all 0.3s ease;
    }

    .filter-button:hover {
        background: var(--background-light);
        color: var(--accent-color);
    }

    .header-button {
        background: none;
        border: none;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--text-primary);
        cursor: pointer;
        transition: all 0.3s ease;
    }

    .header-button:hover {
        background: var(--background-light);
        transform: scale(1.1);
    }

    .header-button i {
        font-size: 16px;
    }

    /* Menu Styles */
    .side-menu {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        height: auto;
        max-height: 85vh;
        background: var(--secondary-color);
        z-index: 1001;
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        transform: translateY(-100%);
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        padding: 72px 16px 16px;
        overflow-y: auto;
        border-radius: 0 0 20px 20px;
        display: flex;
        flex-direction: column;
    }

    .side-menu.active {
        transform: translateY(0);
    }

    .side-menu::-webkit-scrollbar {
        width: 8px;
    }

    .side-menu::-webkit-scrollbar-track {
        background: var(--background-light);
        border-radius: 4px;
    }

    .side-menu::-webkit-scrollbar-thumb {
        background: var(--border-color);
        border-radius: 4px;
    }

    .side-menu::-webkit-scrollbar-thumb:hover {
        background: var(--text-secondary);
    }

    .menu-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        z-index: 1000;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        backdrop-filter: blur(4px);
        -webkit-backdrop-filter: blur(4px);
    }

    .menu-overlay.active {
        opacity: 1;
        visibility: visible;
    }

    .menu-section {
        margin-bottom: 24px;
    }

    .menu-section-title {
        font-size: 13px;
        font-weight: 600;
        color: var(--text-secondary);
        margin: 0 0 8px;
        display: flex;
        align-items: center;
        gap: 6px;
    }

    .menu-section-title::before {
        content: '';
        width: 3px;
        height: 14px;
        background: var(--accent-color);
        border-radius: 2px;
        display: block;
    }

    .menu-divider {
        height: 4px;
        background: var(--background-light);
        margin: 12px -20px;
        border: none;
    }

    .menu-item {
        display: flex;
        align-items: center;
        padding: 8px 12px;
        color: var(--text-primary);
        text-decoration: none;
        border-radius: 8px;
        margin-bottom: 4px;
        transition: all 0.3s ease;
        background: white;
        border: 1px solid var(--border-color);
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
    }

    .menu-item:hover {
        background: var(--background-light);
        transform: translateY(-1px);
        box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    }

    .menu-item:active {
        transform: translateY(0);
    }

    .menu-item i {
        margin-right: 8px;
        width: 20px;
        height: 20px;
        text-align: center;
        color: var(--accent-color);
        font-size: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--background-light);
        border-radius: 6px;
        padding: 3px;
        transition: all 0.3s ease;
    }

    .menu-item:hover i {
        background: var(--accent-color);
        color: white;
    }

    /* Stats Styles */
    .menu-stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: 12px;
        padding: 16px;
        background: white;
        border-radius: 12px;
        border: 1px solid var(--border-color);
        margin-bottom: 16px;
    }

    .stat-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        text-align: center;
        padding: 12px;
        background: var(--background-light);
        border-radius: 8px;
        transition: all 0.3s ease;
    }

    .stat-item:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    }

    .stat-item i {
        font-size: 24px;
        color: var(--accent-color);
    }

    .stat-item span {
        font-size: 13px;
        color: var(--text-secondary);
    }

    .stat-item strong {
        color: var(--text-primary);
        font-size: 16px;
    }

    /* Search Results Styles */
    .search-results {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: white;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        margin-top: 8px;
        max-height: 400px;
        overflow-y: auto;
        opacity: 0;
        visibility: hidden;
        transform: translateY(-10px);
        transition: all 0.3s ease;
        z-index: 9999;
        border: 1px solid var(--border-color);
    }

    .search-results.active {
        opacity: 1;
        visibility: visible;
        transform: translateY(0);
    }

    .search-item {
        padding: 12px 16px;
        cursor: pointer;
        transition: all 0.2s ease;
        border-bottom: 1px solid var(--border-color);
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .search-item:last-child {
        border-bottom: none;
    }

    .search-item:hover {
        background: var(--background-light);
    }

    .search-item .name {
        font-weight: 500;
        color: var(--text-primary);
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .search-item .name i {
        color: var(--accent-color);
        font-size: 16px;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--background-light);
        border-radius: 6px;
    }

    .search-item .info {
        font-size: 13px;
        color: var(--text-secondary);
        margin-left: 32px;
    }

    .search-results::-webkit-scrollbar {
        width: 8px;
    }

    .search-results::-webkit-scrollbar-track {
        background: var(--background-light);
        border-radius: 4px;
    }

    .search-results::-webkit-scrollbar-thumb {
        background: var(--border-color);
        border-radius: 4px;
    }

    .search-results::-webkit-scrollbar-thumb:hover {
        background: var(--text-secondary);
    }

</style>

<!-- Header -->
<header class="header">
    <div class="header-left">
        <button class="menu-toggle" onclick="toggleMenu()">
            <i class="fas fa-bars"></i>
        </button>
        <div class="logo">
            <img src="logo.png" alt="V-ELECTRIC" class="logo-img">
            <span class="logo-text">V ELECTRIC</span>
        </div>
    </div>
    <div class="header-center">
        <div class="search-container">
            <div class="search-box">
                <i class="fas fa-search search-icon"></i>
                <input type="text" id="searchInput" placeholder="Tìm kiếm địa điểm..." oninput="handleSearch(this.value)">
                <button class="clear-button" onclick="clearSearch()" style="display: none;">
                    <i class="fas fa-times"></i>
                </button>
                <button class="filter-button" onclick="toggleFilter()">
                    <i class="fas fa-filter"></i>
                </button>
            </div>
            <div id="searchResults" class="search-results"></div>
        </div>
    </div>
    <div class="header-right">
        <button class="header-button" onclick="showFavoritesModal()" title="Trạm yêu thích">
            <i class="fas fa-heart"></i>
        </button>
    </div>
</header>

<!-- Menu Overlay -->
<div class="menu-overlay" onclick="toggleMenu()"></div>

<!-- Side Menu -->
<div class="side-menu">
    <div class="menu-divider"></div>

    <div class="menu-section-title">Tùy chọn</div>
    <a class="menu-item" onclick="toggleFilter(); toggleMenu();">
        <i class="fas fa-filter"></i>
        Lọc trạm sạc
    </a>
    <a class="menu-item" onclick="showFavoritesModal(); toggleMenu();">
        <i class="fas fa-heart"></i>
        Trạm yêu thích
    </a>

    <div class="menu-divider"></div>

    <div class="menu-section-title">Thông tin</div>
    <a class="menu-item" href="https://www.facebook.com/wannhunt" target="_blank">
        <i class="fab fa-facebook"></i>
        Liên hệ Facebook
    </a>
    <a class="menu-item" href="#" onclick="showGuide()">
        <i class="fas fa-question-circle"></i>
        Hướng dẫn sử dụng
    </a>
    <a class="menu-item" href="#" onclick="showAbout()">
        <i class="fas fa-info-circle"></i>
        Giới thiệu
    </a>

    <div class="menu-divider"></div>

    <div class="menu-section-title">Tài khoản</div>
    <a class="menu-item" id="googleSignInBtn" onclick="signInWithGoogle()">
        <i class="fab fa-google"></i>
        Đăng nhập bằng Google
    </a>
    <a class="menu-item" id="signOutBtn" onclick="signOut()" style="display: none;">
        <i class="fas fa-sign-out-alt"></i>
        Đăng xuất
    </a>
</div>

<!-- Firebase App -->
<script src="https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.6.1/firebase-auth-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.6.1/firebase-analytics-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore-compat.js"></script>

<script>
// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBxMQTfpPcWk9zIjJ8QWJHDuw8_VaNlxwc",
    authDomain: "v-electric-map-976bb.firebaseapp.com",
    projectId: "v-electric-map-976bb",
    storageBucket: "v-electric-map-976bb.firebasestorage.app",
    messagingSenderId: "679628779080",
    appId: "1:679628779080:web:ed3702e7ac1de8ba91327d",
    measurementId: "G-FSN2G7V08X"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Analytics
firebase.analytics();

// Auth state observer
firebase.auth().onAuthStateChanged((user) => {
    const googleSignInBtn = document.getElementById('googleSignInBtn');
    const signOutBtn = document.getElementById('signOutBtn');
    
    if (user) {
        // User is signed in
        console.log('User is signed in:', user.displayName);
        googleSignInBtn.style.display = 'none';
        signOutBtn.style.display = 'flex';
        
        // Hiển thị thông tin người dùng
        const userInfo = document.createElement('div');
        userInfo.className = 'user-info';
        userInfo.innerHTML = `
            <div class="user-avatar">
                <img src="${user.photoURL}" alt="${user.displayName}">
            </div>
            <div class="user-details">
                <div class="user-name">${user.displayName}</div>
                <div class="user-email">${user.email}</div>
            </div>
        `;
        
        // Chèn userInfo vào trước nút đăng xuất
        signOutBtn.parentNode.insertBefore(userInfo, signOutBtn);

        // Cập nhật biến global và tải danh sách yêu thích
        currentUser = user;
        loadFavorites();
    } else {
        // User is signed out
        console.log('User is signed out');
        googleSignInBtn.style.display = 'flex';
        signOutBtn.style.display = 'none';
        
        // Xóa thông tin người dùng nếu có
        const userInfo = document.querySelector('.user-info');
        if (userInfo) {
            userInfo.remove();
        }

        // Reset biến global và xóa danh sách yêu thích
        currentUser = null;
        favoriteKeys.clear();
    }
});

// Sign in with Google
function signInWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider)
        .then((result) => {
            console.log('Google sign in success');
            toggleMenu(); // Đóng menu sau khi đăng nhập
        })
        .catch((error) => {
            console.error('Google sign in error:', error);
            showError('Đăng nhập thất bại. Vui lòng thử lại.');
        });
}

// Sign out
function signOut() {
    firebase.auth().signOut()
        .then(() => {
            console.log('Sign out success');
            toggleMenu(); // Đóng menu sau khi đăng xuất
        })
        .catch((error) => {
            console.error('Sign out error:', error);
            showError('Đăng xuất thất bại. Vui lòng thử lại.');
        });
}
</script>

<style>
/* User Info Styles */
.user-info {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px;
    background: white;
    border-radius: 8px;
    margin-bottom: 4px;
    border: 1px solid var(--border-color);
}

.user-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    overflow: hidden;
    border: 2px solid var(--accent-color);
}

.user-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.user-details {
    flex: 1;
    min-width: 0;
}

.user-name {
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 2px;
    font-size: 14px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.user-email {
    font-size: 12px;
    color: var(--text-secondary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
</style>
