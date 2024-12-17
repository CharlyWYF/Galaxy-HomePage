document.addEventListener('DOMContentLoaded', function() {
    const searchBox = document.getElementById('searchBox');
    const themeToggle = document.getElementById('themeToggle');

    // 检查系统主题并设置初始主题
    const systemDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const currentTheme = localStorage.getItem('theme') || (systemDarkMode ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', currentTheme);
    updateThemeIcon(currentTheme === 'dark');

    // 监听搜索框输入事件
    searchBox.addEventListener('input', function(e) {
        const searchText = e.target.value.toLowerCase().trim();
        const websiteCards = document.querySelectorAll('#websiteCollection .card');
        websiteCards.forEach(card => {
            const title = card.querySelector('.card-title').textContent.toLowerCase();
            const description = card.querySelector('.card-text').textContent.toLowerCase();
            const cardContainer = card.closest('.col-md-4');
            if (title.includes(searchText) || description.includes(searchText)) {
                cardContainer.style.display = '';
            } else {
                cardContainer.style.display = 'none';
            }
        });
    });

    // 主题切换功能
    themeToggle.addEventListener('click', function() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme === 'dark');
    });

    // 更新主题图标
    function updateThemeIcon(isDark) {
        const moonIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
        const sunIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;
        themeToggle.innerHTML = isDark ? moonIcon : sunIcon;
    }

    // 在 DOMContentLoaded 事件处理函数开始处添加
    function renderWebsites() {
        const container = document.getElementById('websiteCollection');
        container.innerHTML = websiteData.map(site => {
            if (site.type === 'video') {
                return `
                    <div class="col-md-4">
                        <div class="card">
                            <div class="card-body">
                                <h5 class="card-title">${site.title}</h5>
                                <div class="video-container">
                                    ${site.embedCode}
                                </div>
                                <p class="card-text">${site.description}</p>
                            </div>
                        </div>
                    </div>
                `;
            }
            return `
                <div class="col-md-4">
                    <a href="${site.url}" class="card-link">
                        <div class="card">
                            <div class="card-body">
                                <h5 class="card-title">${site.title}</h5>
                                <p class="card-text">${site.description}</p>
                            </div>
                        </div>
                    </a>
                </div>
            `;
        }).join('');
    }

    // 初始渲染
    renderWebsites();

    // 密码验证功能
    const downloadBtn = document.getElementById('downloadBtn');
    const passwordModal = document.getElementById('passwordModal');
    const submitPassword = document.getElementById('submitPassword');
    const cancelPassword = document.getElementById('cancelPassword');
    const passwordInput = document.getElementById('passwordInput');

    // 使用配置文件中的密码
    const correctPassword = CONFIG.password;

    downloadBtn.addEventListener('click', (e) => {
        e.preventDefault();
        passwordModal.style.display = 'flex';
    });

    submitPassword.addEventListener('click', () => {
        if (passwordInput.value === correctPassword) {
            window.location.href = 'https://www.charlyw.top/downloads';
        } else {
            alert('密码错误！');
        }
        passwordInput.value = '';
        passwordModal.style.display = 'none';
    });

    cancelPassword.addEventListener('click', () => {
        passwordInput.value = '';
        passwordModal.style.display = 'none';
    });

    // 点击模态框外部关闭
    passwordModal.addEventListener('click', (e) => {
        if (e.target === passwordModal) {
            passwordInput.value = '';
            passwordModal.style.display = 'none';
        }
    });

    // 添加通知弹窗
    function showNotification() {
        const notification = document.createElement('div');
        notification.className = 'notification-modal';
        notification.innerHTML = `
            <div class="notification-content">
                <p>由于访问量激增，服务器压力较大，如遇加载缓慢或是无法访问，及时向站主反馈❗</p>
                <button id="notificationBtn" class="btn btn-primary">收到👌</button>
            </div>
        `;
        document.body.appendChild(notification);

        // 添加关闭按钮事件
        document.getElementById('notificationBtn').addEventListener('click', () => {
            notification.remove();
        });
    }

    // 显示通知
    showNotification();
});
