// 枪械数据，使用对象存储，键为枪械名称
const GUN_DATA = {
    // 冲锋枪 (SMG)
    'R99': { '子弹类型': '轻型子弹', '枪械类型': '冲锋枪', 'imageFile': 'R99.png' },
    '转换者': { '子弹类型': '轻型子弹', '枪械类型': '冲锋枪', 'imageFile': '转换者.png' },
    '电能冲锋枪': { '子弹类型': '能量子弹', '枪械类型': '冲锋枪', 'imageFile': '电能冲锋枪.png' },

    // 突击步枪 (AR)
    'R301': { '子弹类型': '轻型子弹', '枪械类型': '突击步枪', 'imageFile': 'R301.png' },
    '平行步枪': { '子弹类型': '重型子弹', '枪械类型': '突击步枪', 'imageFile': '平行步枪.png' },
    '猎兽': { '子弹类型': '重型子弹', '枪械类型': '突击步枪', 'imageFile': '猎兽.png' },

    // 轻机枪 (LMG)
    '喷火枪': { '子弹类型': '轻型子弹', '枪械类型': '轻机枪', 'imageFile': '喷火枪.png' },
    // 更多枪械...
};

// 获取 DOM 元素
const gunInput = document.getElementById('gunInput');
const infoDisplay = document.getElementById('infoDisplay');
const gunImage = document.getElementById('gunImage');

// 绑定回车键事件
gunInput.addEventListener('keypress', function (event) {
    if (event.key === 'Enter') {
        lookupGun();
    }
});

function lookupGun() {
    // 1. 获取输入并处理
    // trim() 去除空格，toUpperCase() 统一转大写进行查找 (仅适用于英文/数字名称)
    let inputName = gunInput.value.trim().toUpperCase();
    let gunInfo = GUN_DATA[inputName] || GUN_DATA[inputName.toLowerCase()];

    // 尝试支持中文名称直接查找 (如果键是中文)
    if (!gunInfo) {
        // 检查原始输入 (用于中文名)
        gunInfo = GUN_DATA[gunInput.value.trim()];
    }

    // 2. 查找并显示信息
    if (gunInfo) {
        // 构建要显示的文本
        const infoText =
            `枪械名称: ${inputName}\n` +
            `子弹类型: ${gunInfo['子弹类型']}\n` +
            `枪械类型: ${gunInfo['枪械类型']}`;

        infoDisplay.textContent = infoText;

        // 3. 显示图片
        // 假设图片文件和 HTML 文件在同一个目录，或在 'images/' 目录下
        const imagePath = `images/${gunInfo.imageFile}`;

        // 检查图片文件是否存在 (在实际Web服务器上才准确，这里只是设置路径)
        gunImage.src = imagePath;
        gunImage.alt = `${inputName} 的图片`;
        gunImage.classList.remove('hidden'); // 显示图片

    } else {
        // 找不到枪械
        infoDisplay.textContent = `抱歉，找不到枪械 "${gunInput.value.trim()}" 的信息。`;
        gunImage.classList.add('hidden'); // 隐藏图片
    }
}