document.addEventListener('DOMContentLoaded', function() {
    const searchBox = document.getElementById('searchBox');
    const websiteCards = document.querySelectorAll('#websiteCollection .card');
    const themeToggle = document.getElementById('themeToggle');

    // 监听搜索框输入事件
    searchBox.addEventListener('input', function(e) {
        const searchText = e.target.value.toLowerCase().trim();
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

    // 检查系统主题并设置初始图标
    const systemDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    updateThemeIcon(systemDarkMode);

    // 主题切换功能
    themeToggle.addEventListener('click', function() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        if (currentTheme === 'light') {
            // 如果当前是亮色，移除 data-theme 属性以恢复跟随系统
            document.documentElement.removeAttribute('data-theme');
            updateThemeIcon(systemDarkMode);
        } else {
            // 如果当前是暗色或跟随系统，切换到亮色
            document.documentElement.setAttribute('data-theme', 'light');
            updateThemeIcon(false);
        }
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
        container.innerHTML = websiteData.map(site => `
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
        `).join('');
    }

    // 初始渲染
    renderWebsites();
});
