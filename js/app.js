/* ============================================
   FilmLab - 个人胶片冲洗工作台
   核心应用逻辑
   ============================================ */

// ============================================
// 常量与预设数据
// ============================================
const STORAGE_KEYS = {
    records: 'filmlab_records',
    inventory: 'filmlab_inventory',
    customProcesses: 'filmlab_custom_processes',
    notifications: 'filmlab_notifications',
    settings: 'filmlab_settings',
    filterTemplates: 'filmlab_filter_templates',
    images: 'filmlab_images',
    recipes: 'filmlab_recipes',
    profile: 'filmlab_profile',
    timers: 'filmlab_timers',
};

const PRESET_PROCESSES = [
    {
        id: 'bw-manual',
        name: '黑白胶片手工冲洗',
        desc: '最常用的黑白胶片冲洗方式，手工控制每一步骤',
        icon: 'bw',
        tags: ['黑白', '手工', '显影罐', '最常用'],
        steps: [
            { name: '清水预浸', defaultTemp: 20, defaultDuration: 60 },
            { name: '显影', defaultTemp: 20, defaultDuration: 480 },
            { name: '停影', defaultTemp: 18, defaultDuration: 60 },
            { name: '定影', defaultTemp: 20, defaultDuration: 300 },
            { name: '清水漂洗', defaultTemp: 20, defaultDuration: 600 },
            { name: '润湿剂', defaultTemp: 20, defaultDuration: 30 },
            { name: '烘干', defaultTemp: 0, defaultDuration: 7200 },
        ],
    },
    {
        id: 'bw-auto',
        name: '黑白胶片设备自动冲洗',
        desc: '使用自动冲洗设备，参数预设后自动执行',
        icon: 'auto',
        tags: ['黑白', '自动化', '设备'],
        steps: [
            { name: '设备预热', defaultTemp: 38, defaultDuration: 300 },
            { name: '自动显影', defaultTemp: 38, defaultDuration: 225 },
            { name: '自动定影', defaultTemp: 38, defaultDuration: 300 },
            { name: '水洗', defaultTemp: 38, defaultDuration: 180 },
            { name: '稳定干燥', defaultTemp: 45, defaultDuration: 1800 },
        ],
    },
    {
        id: 'c41',
        name: '彩色负片 C41 冲洗',
        desc: '标准C41工艺，严格温控彩色负片冲洗流程',
        icon: 'c41',
        tags: ['彩色', '负片', 'C41', '严格温控'],
        steps: [
            { name: '彩色显影', defaultTemp: 38, defaultDuration: 195 },
            { name: '漂白', defaultTemp: 38, defaultDuration: 330 },
            { name: '水洗', defaultTemp: 38, defaultDuration: 60 },
            { name: '定影', defaultTemp: 38, defaultDuration: 240 },
            { name: '水洗', defaultTemp: 38, defaultDuration: 180 },
            { name: '稳定', defaultTemp: 38, defaultDuration: 60 },
            { name: '干燥', defaultTemp: 0, defaultDuration: 3600 },
        ],
    },
    {
        id: 'e6',
        name: '彩色反转片 E6 冲洗',
        desc: 'E6工艺冲洗正片/反转片，多层药水严格分步',
        icon: 'e6',
        tags: ['彩色', '反转片', 'E6', '正片'],
        steps: [
            { name: '首次显影', defaultTemp: 38, defaultDuration: 360 },
            { name: '水洗', defaultTemp: 38, defaultDuration: 120 },
            { name: '反转浴', defaultTemp: 38, defaultDuration: 120 },
            { name: '彩色显影', defaultTemp: 38, defaultDuration: 360 },
            { name: '预漂白', defaultTemp: 38, defaultDuration: 120 },
            { name: '漂白', defaultTemp: 38, defaultDuration: 360 },
            { name: '定影', defaultTemp: 38, defaultDuration: 240 },
            { name: '水洗', defaultTemp: 38, defaultDuration: 240 },
            { name: '稳定', defaultTemp: 38, defaultDuration: 60 },
            { name: '干燥', defaultTemp: 0, defaultDuration: 3600 },
        ],
    },
];

const PROCESS_ICONS = {
    'bw-manual': '<svg viewBox="0 0 24 24" fill="none" width="24" height="24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    'bw-auto': '<svg viewBox="0 0 24 24" fill="none" width="24" height="24"><rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" stroke-width="2"/><path d="M9 9h6v6H9z" stroke="currentColor" stroke-width="2"/><path d="M9 1v3M15 1v3M9 20v3M15 20v3M1 9h3M1 15h3M20 9h3M20 15h3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    'c41': '<svg viewBox="0 0 24 24" fill="none" width="24" height="24"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/><path d="M12 2a10 10 0 010 20M2 12h20" stroke="currentColor" stroke-width="2"/></svg>',
    'e6': '<svg viewBox="0 0 24 24" fill="none" width="24" height="24"><path d="M3 3h18v18H3zM3 9h18M3 15h18M9 3v18M15 3v18" stroke="currentColor" stroke-width="2"/></svg>',
    'custom': '<svg viewBox="0 0 24 24" fill="none" width="24" height="24"><path d="M12 2v20M2 12h20M5 5l14 14M19 5L5 19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
};

const EQUIPMENT_TYPES = ['显影罐', '片芯', '温度计', '计时器', '震荡器', '烘干机', '扫描仪', '放大机', '裁切刀', '其他'];

const CHEMICAL_TYPES_BW = ['显影液', '停影液', '定影液', '润湿剂', '水洗促进剂'];
const CHEMICAL_TYPES_COLOR = ['彩色显影液', '漂白液', '定影液', '稳定液', '预漂白液', '反转液'];

// 预设药水配方
const PRESET_RECIPES = [
    {
        id: 'preset-d76',
        name: 'D-76 显影液 (1:1稀释)',
        type: '显影液',
        desc: '柯达D-76经典配方，适合大部分黑白胶卷，颗粒细腻',
        isPreset: true,
        materials: [
            { name: 'D-76原液', ratio: '500ml' },
            { name: '清水(20°C)', ratio: '500ml' },
            { name: '总量', ratio: '1000ml' },
        ],
        usage: '显影温度20°C，1:1稀释显影时间约10-12分钟',
    },
    {
        id: 'preset-rodinal',
        name: 'Rodinal 显影液 (1:25)',
        type: '显影液',
        desc: '爱克发Rodinal，高锐度高颗粒感，适合迫冲',
        isPreset: true,
        materials: [
            { name: 'Rodinal浓缩液', ratio: '40ml' },
            { name: '清水(20°C)', ratio: '960ml' },
            { name: '总量', ratio: '1000ml' },
        ],
        usage: '显影温度20°C，1:25稀释，标准显影约7-8分钟',
    },
    {
        id: 'preset-hc110',
        name: 'HC-110 显影液 (稀释B)',
        type: '显影液',
        desc: '柯达HC-110稀释B，通用性强，保存性好',
        isPreset: true,
        materials: [
            { name: 'HC-110浓缩液', ratio: '31ml' },
            { name: '清水(20°C)', ratio: '969ml' },
            { name: '总量', ratio: '1000ml' },
        ],
        usage: '显影温度20°C，稀释B(1:31)，显影时间约6-7分钟',
    },
    {
        id: 'preset-fix',
        name: '快速定影液 (1:4)',
        type: '定影液',
        desc: '通用快速定影液，定影时间3-5分钟',
        isPreset: true,
        materials: [
            { name: '定影液原液', ratio: '200ml' },
            { name: '清水(20°C)', ratio: '800ml' },
            { name: '总量', ratio: '1000ml' },
        ],
        usage: '定影温度18-22°C，1:4稀释，定影3-5分钟',
    },
    {
        id: 'preset-c41-dev',
        name: 'C41 彩色显影液',
        type: '彩色显影液',
        desc: 'C41工艺彩色显影液，严格温控38°C',
        isPreset: true,
        materials: [
            { name: 'C41显影液A', ratio: '250ml' },
            { name: 'C41显影液B', ratio: '250ml' },
            { name: 'C41显影液C', ratio: '250ml' },
            { name: '清水(38°C)', ratio: '250ml' },
            { name: '总量', ratio: '1000ml' },
        ],
        usage: '显影温度38°C±0.5°C，显影时间3分15秒',
    },
];

// ============================================
// 状态管理
// ============================================
let appState = {
    currentTab: 'process-select',
    selectedProcess: null,
    editingRecordId: null,
    originalRecordImages: [],
    selectedRecords: new Set(),
    currentInvTab: 'film',
    currentNotifFilter: 'all',
    uploadedImages: [],
    charts: {},
    chartFreqMode: 'month',
    workspaceSelection: null,
};

// ============================================
// IndexedDB 图片存储 - 解决 localStorage 5-10MB 容量限制
// IndexedDB 可存储数百MB，图片压缩后存入此处
// localStorage 仅保存图片 ID 引用
// ============================================
const DB_NAME = 'filmlab_db';
const DB_VERSION = 1;
const IMG_STORE = 'images';
let _db = null;

function openDB() {
    return new Promise((resolve, reject) => {
        if (_db) { resolve(_db); return; }
        const req = indexedDB.open(DB_NAME, DB_VERSION);
        req.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains(IMG_STORE)) {
                db.createObjectStore(IMG_STORE, { keyPath: 'id' });
            }
        };
        req.onsuccess = (e) => { _db = e.target.result; resolve(_db); };
        req.onerror = (e) => { console.error('IndexedDB open error:', e.target.error); reject(e.target.error); };
    });
}

async function dbPut(store, value) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(store, 'readwrite');
        tx.objectStore(store).put(value);
        tx.oncomplete = () => resolve(value.id);
        tx.onerror = () => reject(tx.error);
    });
}

async function dbGet(store, key) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(store, 'readonly');
        const req = tx.objectStore(store).get(key);
        req.onsuccess = () => resolve(req.result ? req.result.data : null);
        req.onerror = () => reject(req.error);
    });
}

async function dbDelete(store, key) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(store, 'readwrite');
        tx.objectStore(store).delete(key);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
}

async function dbGetAllKeys(store) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(store, 'readonly');
        const req = tx.objectStore(store).getAllKeys();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
    });
}

// canvas 图片压缩 — 缩放 + JPEG 质量压缩
function compressImage(dataUrl, maxWidth = 1200, quality = 0.75) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            let w = img.naturalWidth, h = img.naturalHeight;
            if (w > maxWidth) {
                h = Math.round(h * maxWidth / w);
                w = maxWidth;
            }
            const canvas = document.createElement('canvas');
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d');
            // 白底，防止 PNG 透明区域变黑
            ctx.fillStyle = '#fff';
            ctx.fillRect(0, 0, w, h);
            ctx.drawImage(img, 0, 0, w, h);
            resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = () => resolve(dataUrl);
        img.src = dataUrl;
    });
}

function genImgId() {
    return 'img_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
}

// 压缩图片 → 存入 IndexedDB → 返回 ID（localStorage 只存 ID）
async function storeImage(dataUrl) {
    const compressed = await compressImage(dataUrl, 1200, 0.75);
    const id = genImgId();
    await dbPut(IMG_STORE, { id, data: compressed });
    return id;
}

// 批量加载图片到 DOM 中所有 [data-img-id] 元素
async function loadImagesIntoDOM(container) {
    if (!container) container = document;
    const imgs = container.querySelectorAll('img[data-img-id]');
    for (const img of imgs) {
        const id = img.getAttribute('data-img-id');
        if (!id) continue;
        // 兼容旧数据：如果 id 本身是 base64 data URL，直接使用
        if (id.startsWith('data:')) {
            img.src = id;
            continue;
        }
        try {
            const data = await dbGet(IMG_STORE, id);
            if (data) img.src = data;
        } catch (e) {
            console.error('Failed to load image:', id, e);
        }
    }
}

// 迁移旧数据：将 records/profile 中的 base64 图片转移到 IndexedDB
async function migrateBase64Images() {
    const records = getAllRecords();
    let migrated = false;

    for (const r of records) {
        if (r.result && r.result.images && r.result.images.length > 0) {
            const newIds = [];
            for (const img of r.result.images) {
                if (img && img.startsWith('data:')) {
                    // 是 base64，需要迁移
                    try {
                        const id = await storeImage(img);
                        newIds.push(id);
                        migrated = true;
                    } catch (e) {
                        console.error('Migration failed for image in record:', r.id, e);
                        newIds.push(img); // 保留原数据
                    }
                } else {
                    newIds.push(img); // 已经是 ID，跳过
                }
            }
            r.result.images = newIds;
        }
    }

    if (migrated) {
        // 用原始 saveData 保存迁移后的数据（不含大 base64，体积小了很多）
        try {
            localStorage.setItem(STORAGE_KEYS.records, JSON.stringify(records));
            console.log('[FilmLab] 图片迁移完成，已将 base64 图片转移到 IndexedDB');
        } catch (e) {
            console.error('[FilmLab] 迁移后保存失败:', e);
        }
    }

    // 迁移头像图片
    const profile = getProfile();
    if (profile.avatarImage && profile.avatarImage.startsWith('data:')) {
        try {
            const compressed = await compressImage(profile.avatarImage, 200, 0.8);
            profile.avatarImage = compressed;
            saveProfile(profile);
            console.log('[FilmLab] 头像图片已压缩');
        } catch (e) {
            console.error('Avatar compression failed:', e);
        }
    }

    return migrated;
}

// 获取存储使用情况
function getStorageUsage() {
    let total = 0;
    const details = {};
    for (const [name, key] of Object.entries(STORAGE_KEYS)) {
        const data = localStorage.getItem(key);
        const size = data ? new Blob([data]).size : 0;
        details[name] = size;
        total += size;
    }
    return { total, details, totalKB: Math.round(total / 1024), totalMB: (total / 1048576).toFixed(2) };
}

// ============================================
// 数据存储工具
// ============================================
function loadData(key) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    } catch (e) {
        console.error('Load data error:', e);
        return null;
    }
}

function saveData(key, data) {
    try {
        const json = JSON.stringify(data);
        localStorage.setItem(key, json);
        return true;
    } catch (e) {
        console.error('Save data error:', e);
        if (e.name === 'QuotaExceededError') {
            const usage = getStorageUsage();
            toast(`存储空间不足（当前 ${usage.totalMB}MB），请导出备份后清理旧数据`, 'error', 5000);
            // 尝试清理过期通知释放空间
            cleanupOldNotifications();
            // 重试一次
            try {
                localStorage.setItem(key, json);
                toast('已自动清理旧通知，保存成功', 'success');
                return true;
            } catch (e2) {
                console.error('Retry save failed:', e2);
                toast('存储空间仍然不足，请导出数据后清理', 'error', 5000);
            }
        } else {
            toast('数据保存失败：' + e.message, 'error');
        }
        return false;
    }
}

function cleanupOldNotifications() {
    const notifs = getNotifications();
    const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000; // 30天前
    const filtered = notifs.filter(n => {
        const t = new Date(n.createdAt || n.time || Date.now()).getTime();
        return t > cutoff || !n.read;
    });
    if (filtered.length < notifs.length) {
        try { localStorage.setItem(STORAGE_KEYS.notifications, JSON.stringify(filtered)); } catch(e) {}
        console.log(`[FilmLab] 清理了 ${notifs.length - filtered.length} 条旧通知`);
    }
}

// 显示存储使用情况到设置页面
async function showStorageUsage() {
    const el = document.getElementById('storageUsageDesc');
    if (!el) return;
    const usage = getStorageUsage();
    // 获取 IndexedDB 图片数量
    let imgCount = 0;
    try { imgCount = (await dbGetAllKeys(IMG_STORE)).length; } catch(e) {}
    let text = `localStorage: ${usage.totalKB}KB`;
    if (usage.totalKB > 4096) text += ' ⚠ 接近上限';
    text += ` | IndexedDB 图片: ${imgCount} 张`;
    el.textContent = text;
    el.style.color = usage.totalKB > 4096 ? 'var(--warn)' : '';
}

function getAllRecords() { return loadData(STORAGE_KEYS.records) || []; }
function getAllInventory() { return loadData(STORAGE_KEYS.inventory) || { film: [], chemical: [], equipment: [] }; }
function getCustomProcesses() { return loadData(STORAGE_KEYS.customProcesses) || []; }
function getNotifications() { return loadData(STORAGE_KEYS.notifications) || []; }
function getSettings() { return loadData(STORAGE_KEYS.settings) || {}; }

// ============================================
// 工具函数
// ============================================
function generateId() {
    return 'FL' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 4).toUpperCase();
}

function formatDate(dateStr) {
    if (!dateStr) return '--';
    const d = new Date(dateStr);
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

function formatDuration(seconds) {
    if (!seconds || seconds === 0) return '--';
    if (seconds < 60) return `${seconds}秒`;
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return sec > 0 ? `${min}分${sec}秒` : `${min}分钟`;
}

function formatTimeAgo(dateStr) {
    if (!dateStr) return '';
    const diff = Date.now() - new Date(dateStr).getTime();
    const min = Math.floor(diff / 60000);
    const hour = Math.floor(diff / 3600000);
    const day = Math.floor(diff / 86400000);
    if (day > 0) return `${day}天前`;
    if (hour > 0) return `${hour}小时前`;
    if (min > 0) return `${min}分钟前`;
    return '刚刚';
}

function getProcessName(processId) {
    const preset = PRESET_PROCESSES.find(p => p.id === processId);
    if (preset) return preset.name;
    const custom = getCustomProcesses().find(p => p.id === processId);
    return custom ? custom.name : processId;
}

function getProcessSteps(processId) {
    const preset = PRESET_PROCESSES.find(p => p.id === processId);
    if (preset) return preset.steps;
    const custom = getCustomProcesses().find(p => p.id === processId);
    return custom ? custom.steps : [];
}

function getAllProcesses() {
    return [...PRESET_PROCESSES, ...getCustomProcesses()];
}

function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, char => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
    })[char]);
}

function getChemicalTypes(processId) {
    if (processId === 'c41' || processId === 'e6') return CHEMICAL_TYPES_COLOR;
    return CHEMICAL_TYPES_BW;
}

// ============================================
// Toast 提示
// ============================================
function toast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    const icons = {
        success: '<svg viewBox="0 0 24 24" fill="none" width="16" height="16"><path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        error: '<svg viewBox="0 0 24 24" fill="none" width="16" height="16"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/><path d="M15 9l-6 6M9 9l6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
        info: '<svg viewBox="0 0 24 24" fill="none" width="16" height="16"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/><path d="M12 16v-4M12 8h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    };
    t.innerHTML = `${icons[type] || ''}<span>${message}</span>`;
    container.appendChild(t);
    setTimeout(() => {
        t.style.opacity = '0';
        t.style.transform = 'translateX(20px)';
        t.style.transition = 'all 0.3s ease';
        setTimeout(() => t.remove(), 300);
    }, 3000);
}

// ============================================
// 弹窗系统
// ============================================
function openModal(content) {
    document.getElementById('modalContainer').innerHTML = content;
    document.getElementById('modalOverlay').classList.add('active');
}

function closeModal() {
    document.getElementById('modalOverlay').classList.remove('active');
    document.getElementById('modalContainer').innerHTML = '';
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('modalOverlay').addEventListener('click', (e) => {
        if (e.target.id === 'modalOverlay') closeModal();
    });
});

// ============================================
// 标签页导航
// ============================================
function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.querySelectorAll('.quick-btn').forEach(n => n.classList.remove('active'));

    const tab = document.getElementById('tab-' + tabName);
    if (tab) tab.classList.add('active');

    const navItem = document.querySelector(`.nav-item[data-tab="${tabName}"]`);
    if (navItem) navItem.classList.add('active');

    const quickBtn = document.querySelector(`.quick-btn[data-tab="${tabName}"]`);
    if (quickBtn) quickBtn.classList.add('active');
    const moreBtn = document.querySelector('.quick-more-btn');
    if (moreBtn && !quickBtn && window.matchMedia('(max-width: 768px)').matches) {
        moreBtn.classList.add('active');
    }

    appState.currentTab = tabName;

    // 刷新侧边栏统计
    renderSidebarStats();

    // 关闭移动端侧边栏
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('mobileOverlay').style.display = 'none';

    // 关闭计时器面板
    document.getElementById('timerPanel').classList.remove('open');
    document.querySelector('.quick-btn[onclick*="toggleTimerPanel"]')?.classList.remove('active');

    // 关闭移动端"更多"菜单
    closeMobileMenu();

    // 滚动到顶部
    window.scrollTo(0, 0);

    // 标签页特定初始化
    if (tabName === 'charts') {
        setTimeout(renderAllCharts, 100);
    }
    if (tabName === 'notifications') {
        renderNotifications();
    }
    if (tabName === 'record-list') {
        renderRecordList();
    }
    if (tabName === 'inventory') {
        renderInventory();
    }
    if (tabName === 'process-select') {
        renderWorkspace();
        renderProcessGrid();
        renderCustomProcessList();
    }
    if (tabName === 'gallery') {
        renderGallery();
    }
    if (tabName === 'recipes') {
        renderRecipes();
    }
    if (tabName === 'settings') {
        showStorageUsage();
    }
}

// ============================================
// 侧边栏统计卡片
// ============================================
function renderSidebarStats() {
    const records = getAllRecords();
    const inventory = getAllInventory();
    const notifs = getNotifications();
    const unreadNotifs = notifs.filter(n => !n.read).length;

    // 计算统计数据
    const totalRecords = records.length;
    const reviewedCount = records.filter(r => r.reviewed).length;
    const pendingReview = totalRecords - reviewedCount;

    // 库存预警
    let lowStock = 0;
    if (inventory.film) {
        lowStock += inventory.film.filter(f => (f.quantity || 0) <= 1).length;
    }

    // 过期预警
    const now = new Date();
    const expireDays = parseInt(getSettings().chemExpireDays) || 15;
    let expiringItems = 0;
    if (inventory.chemical) {
        expiringItems += inventory.chemical.filter(c => {
            if (!c.expiry) return false;
            const expiry = new Date(c.expiry);
            if (Number.isNaN(expiry.getTime())) return false;
            const days = (expiry - now) / 86400000;
            return days <= expireDays;
        }).length;
    }

    const stats = [
        { label: '冲洗记录', value: totalRecords, dot: 'blue', trend: '', trendDir: '' },
        { label: '待复盘', value: pendingReview, dot: 'amber', trend: pendingReview > 0 ? '待处理' : '已清零', trendDir: pendingReview > 0 ? 'down' : 'up' },
        { label: '库存预警', value: lowStock + expiringItems, dot: 'red', trend: lowStock + expiringItems > 0 ? '需关注' : '正常', trendDir: lowStock + expiringItems > 0 ? 'down' : 'up' },
        { label: '未读消息', value: unreadNotifs, dot: 'green', trend: unreadNotifs > 0 ? '新消息' : '无消息', trendDir: unreadNotifs > 0 ? 'down' : 'up' },
    ];

    const container = document.getElementById('sidebarStats');
    if (!container) return;

    container.innerHTML = stats.map(s => `
        <div class="stat-mini" onclick="switchTab('${s.label === '冲洗记录' || s.label === '待复盘' ? 'record-list' : s.label === '库存预警' ? 'inventory' : 'notifications'}')">
            <div class="stat-mini-dot ${s.dot}"></div>
            <div class="stat-mini-body">
                <div class="stat-mini-label">${s.label}</div>
                <div class="stat-mini-value">${s.value}</div>
            </div>
            <div class="stat-mini-trend ${s.trendDir}">${s.trend}</div>
        </div>
    `).join('');

    // 更新通知红点
    const topbarDot = document.getElementById('topbarNotifDot');
    const bottomNavDot = document.getElementById('bottomNavNotifDot');
    const navBadge = document.getElementById('navNotifBadge');

    if (topbarDot) topbarDot.style.display = unreadNotifs > 0 ? 'block' : 'none';
    if (bottomNavDot) bottomNavDot.style.display = unreadNotifs > 0 ? 'block' : 'none';
    if (navBadge) {
        navBadge.style.display = unreadNotifs > 0 ? 'inline-block' : 'none';
        navBadge.textContent = unreadNotifs;
    }
}

// ============================================
// 移动端侧边栏
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('menuToggle')?.addEventListener('click', () => {
        document.getElementById('sidebar').classList.add('open');
        document.getElementById('mobileOverlay').style.display = 'block';
    });

    document.getElementById('sidebarClose')?.addEventListener('click', () => {
        document.getElementById('sidebar').classList.remove('open');
        document.getElementById('mobileOverlay').style.display = 'none';
    });

    document.getElementById('mobileOverlay')?.addEventListener('click', () => {
        document.getElementById('sidebar').classList.remove('open');
        document.getElementById('mobileOverlay').style.display = 'none';
    });

    // 全局搜索
    document.getElementById('globalSearch')?.addEventListener('input', (e) => {
        switchTab('record-list');
        document.getElementById('filterKeyword').value = e.target.value;
        renderRecordList();
        e.target.value = '';
    });
});

// ============================================
// 标签页1：冲洗方案选择
// ============================================
function renderProcessGrid() {
    const grid = document.getElementById('processGrid');
    grid.innerHTML = PRESET_PROCESSES.map(p => `
        <div class="process-card ${appState.selectedProcess === p.id ? 'selected' : ''}"
             onclick="selectProcess('${p.id}')">
            <div class="process-card-icon">${PROCESS_ICONS[p.icon] || PROCESS_ICONS.custom}</div>
            <div class="process-card-title">${p.name}</div>
            <div class="process-card-desc">${p.desc}</div>
            <div class="process-card-tags">
                ${p.tags.map(t => `<span class="process-card-tag">${t}</span>`).join('')}
            </div>
        </div>
    `).join('');
}

function renderCustomProcessList() {
    const list = document.getElementById('customProcessList');
    const customs = getCustomProcesses();
    if (customs.length === 0) {
        list.innerHTML = '<div class="empty-state">暂无自定义流程，点击右上角「新增专属流程」创建</div>';
        return;
    }
    list.innerHTML = customs.map(p => `
        <div class="custom-process-item">
            <div class="custom-process-info">
                <div class="custom-process-name">${p.name}</div>
                <div class="custom-process-meta">${p.steps.length} 个步骤 · 创建于 ${formatDate(p.createdAt)}</div>
            </div>
            <div style="display:flex;gap:6px;">
                <button class="btn btn-sm btn-outline" onclick="selectProcess('${p.id}')">选择</button>
                <button class="btn btn-sm btn-ghost" onclick="editCustomProcess('${p.id}')">编辑</button>
                <button class="btn btn-sm btn-danger-outline" onclick="deleteCustomProcess('${p.id}')">删除</button>
            </div>
        </div>
    `).join('');
}

function formatCountdown(seconds) {
    const safeSeconds = Math.max(0, Number(seconds) || 0);
    const hours = Math.floor(safeSeconds / 3600);
    const mins = Math.floor((safeSeconds % 3600) / 60);
    const secs = safeSeconds % 60;
    if (hours > 0) {
        return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

function getWorkspaceItems() {
    const activeTimers = timers.filter(timer => !timer.done);
    if (activeTimers.length > 0) {
        return activeTimers.slice(0, 5).map(timer => ({
            type: 'timer',
            id: timer.id,
            title: timer.name,
            subtitle: timer.done ? '计时完成' : timer.running ? '正在计时' : '已暂停',
            meta: '独立计时器',
            value: formatCountdown(timer.remaining),
            state: timer.done ? 'done' : timer.running ? 'running' : 'paused',
        }));
    }

    return getAllRecords().slice(0, 5).map(record => ({
        type: 'record',
        id: record.id,
        title: record.name,
        subtitle: [record.film?.brand, record.film?.model].filter(Boolean).join(' ') || '未填写胶卷',
        meta: getProcessName(record.processType),
        value: formatDate(record.date),
        state: record.reviewed ? 'done' : 'paused',
    }));
}

function selectWorkspaceItem(type, id) {
    appState.workspaceSelection = { type, id };
    renderWorkspace();
}

function renderWorkspace() {
    const stack = document.getElementById('workspaceStack');
    const inspector = document.getElementById('workspaceInspector');
    const countEl = document.getElementById('workspaceBatchCount');
    if (!stack || !inspector) return;

    const items = getWorkspaceItems();
    if (items.length === 0) {
        if (countEl) countEl.textContent = '当前没有进行中的计时器';
        stack.innerHTML = `
            <button class="workspace-empty-card" type="button">
                <span class="workspace-empty-icon">＋</span>
                <strong>准备第一卷</strong>
                <small>选择工艺，记录胶卷、药水批次与实际步骤</small>
            </button>`;
        stack.querySelector('.workspace-empty-card')?.addEventListener('click', startNewRecord);
        inspector.innerHTML = `
            <div class="workspace-inspector-empty">
                <span>当前批次详情</span>
                <small>开始冲洗后，这里会显示温度、步骤与计时进度</small>
            </div>`;
        return;
    }

    const selection = items.find(item =>
        appState.workspaceSelection?.type === item.type &&
        appState.workspaceSelection?.id === item.id
    ) || items[0];
    appState.workspaceSelection = { type: selection.type, id: selection.id };

    const activeTimers = timers.filter(timer => !timer.done);
    const runningTimers = activeTimers.filter(timer => timer.running).length;
    if (countEl) {
        countEl.textContent = activeTimers.length > 0
            ? `${runningTimers} 个计时中 · 共 ${activeTimers.length} 个计时器`
            : `最近 ${items.length} 个冲洗批次`;
    }

    stack.innerHTML = items.map((item, index) => {
        const active = item.type === selection.type && item.id === selection.id;
        const timeAttr = item.type === 'timer'
            ? ` data-workspace-timer-id="${escapeHtml(item.id)}"`
            : '';
        return `
            <button class="workspace-card ${active ? 'active' : ''} ${item.state}"
                    type="button"
                    data-workspace-type="${item.type}"
                    data-workspace-id="${escapeHtml(item.id)}"
                    ${timeAttr}
                    style="--stack-x:${index * 28}px;--stack-y:${index * 19}px;--stack-rotate:${(index - 1) * -2.2}deg;--stack-scale:${1 - index * 0.028};--stack-opacity:${1 - index * 0.13};--stack-z:${10 - index}">
                <span class="workspace-card-top">
                    <span>${escapeHtml(item.meta)}</span>
                    <i></i>
                </span>
                <span class="workspace-card-title">${escapeHtml(item.title)}</span>
                <span class="workspace-card-subtitle">${escapeHtml(item.subtitle)}</span>
                <span class="workspace-card-value" ${item.type === 'timer' ? 'data-workspace-live-time' : ''}>${escapeHtml(item.value)}</span>
                <span class="workspace-card-state">${escapeHtml(item.subtitle)}</span>
            </button>`;
    }).join('');

    stack.querySelectorAll('.workspace-card').forEach(card => {
        card.addEventListener('click', () => selectWorkspaceItem(card.dataset.workspaceType, card.dataset.workspaceId));
    });
    renderWorkspaceInspector(selection);
    updateWorkspaceLiveDisplays();
}

function renderWorkspaceInspector(selection) {
    const inspector = document.getElementById('workspaceInspector');
    if (!inspector) return;

    if (selection.type === 'timer') {
        const timer = timers.find(item => item.id === selection.id);
        if (!timer) return;
        const progress = timer.totalSeconds > 0
            ? Math.min(100, Math.max(0, ((timer.totalSeconds - timer.remaining) / timer.totalSeconds) * 100))
            : 0;
        inspector.innerHTML = `
            <div class="workspace-inspector-head">
                <div>
                    <span class="workspace-eyebrow">CURRENT TIMER</span>
                    <h2>${escapeHtml(timer.name)}</h2>
                </div>
                <span class="workspace-status ${timer.done ? 'done' : timer.running ? 'running' : 'paused'}">
                    ${timer.done ? '已完成' : timer.running ? '进行中' : '已暂停'}
                </span>
            </div>
            <div class="workspace-timer-readout" data-workspace-timer-id="${escapeHtml(timer.id)}">
                <strong data-workspace-live-time>${formatCountdown(timer.remaining)}</strong>
                <span>剩余时间</span>
            </div>
            <div class="workspace-progress"><i data-workspace-progress style="width:${progress}%"></i></div>
            <div class="workspace-detail-grid">
                <div><span>设定时长</span><strong>${formatCountdown(timer.totalSeconds)}</strong></div>
                <div><span>已完成</span><strong>${Math.round(progress)}%</strong></div>
            </div>
            <div class="workspace-meta-note">完成显影、定影等步骤时，可用独立计时器同步控制多个阶段。</div>
            <div class="workspace-actions">
                ${!timer.done ? `<button class="btn btn-primary" data-workspace-action="toggle" data-workspace-id="${escapeHtml(timer.id)}">${timer.running ? '暂停计时' : '继续计时'}</button>` : ''}
                <button class="btn btn-outline" data-workspace-action="reset" data-workspace-id="${escapeHtml(timer.id)}">重置</button>
            </div>`;
        inspector.querySelector('[data-workspace-action="toggle"]')?.addEventListener('click', event => {
            startTimer(event.currentTarget.dataset.workspaceId);
        });
        inspector.querySelector('[data-workspace-action="reset"]')?.addEventListener('click', event => {
            resetTimer(event.currentTarget.dataset.workspaceId);
        });
        return;
    }

    const record = getAllRecords().find(item => item.id === selection.id);
    if (!record) return;
    const steps = record.steps || [];
    const totalDuration = steps.reduce((sum, step) => sum + (Number(step.duration) || 0), 0);
    const filmName = [record.film?.brand, record.film?.model].filter(Boolean).join(' ') || '未填写胶卷';
    const devStep = steps.find(step => (step.name || '').includes('显影')) || steps[0];
    inspector.innerHTML = `
        <div class="workspace-inspector-head">
            <div>
                <span class="workspace-eyebrow">RECENT BATCH</span>
                <h2>${escapeHtml(record.name)}</h2>
            </div>
            <span class="workspace-status ${record.reviewed ? 'done' : 'paused'}">${record.reviewed ? '已复盘' : '待复盘'}</span>
        </div>
        <div class="workspace-detail-grid workspace-record-summary">
            <div><span>胶卷</span><strong>${escapeHtml(filmName)}</strong></div>
            <div><span>工艺</span><strong>${escapeHtml(getProcessName(record.processType))}</strong></div>
            <div><span>冲洗日期</span><strong>${formatDate(record.date)}</strong></div>
            <div><span>显影温度</span><strong>${devStep?.temp ? devStep.temp + '°C' : '--'}</strong></div>
        </div>
        <div class="workspace-timeline">
            <div class="workspace-timeline-head">
                <span>步骤时间轴</span>
                <strong>${formatDuration(totalDuration)}</strong>
            </div>
            ${steps.slice(0, 6).map((step, index) => {
                const width = totalDuration > 0 ? Math.max(5, (Number(step.duration) || 0) / totalDuration * 100) : 0;
                return `<div class="workspace-step-row">
                    <span class="workspace-step-index">${String(index + 1).padStart(2, '0')}</span>
                    <span class="workspace-step-name">${escapeHtml(step.name || '未命名步骤')}</span>
                    <span class="workspace-step-bar"><i style="width:${width}%"></i></span>
                    <span class="workspace-step-time">${formatDuration(step.duration)}</span>
                </div>`;
            }).join('') || '<div class="workspace-meta-note">这条记录没有步骤数据。</div>'}
        </div>
        <div class="workspace-actions">
            <button class="btn btn-primary" data-workspace-action="view" data-workspace-id="${escapeHtml(record.id)}">查看记录</button>
            <button class="btn btn-outline" data-workspace-action="edit" data-workspace-id="${escapeHtml(record.id)}">继续复盘</button>
        </div>`;
    inspector.querySelector('[data-workspace-action="view"]')?.addEventListener('click', event => {
        viewRecord(event.currentTarget.dataset.workspaceId);
    });
    inspector.querySelector('[data-workspace-action="edit"]')?.addEventListener('click', event => {
        editRecord(event.currentTarget.dataset.workspaceId);
    });
}

function updateWorkspaceLiveDisplays() {
    document.querySelectorAll('[data-workspace-timer-id]').forEach(element => {
        const timer = timers.find(item => item.id === element.dataset.workspaceTimerId);
        if (!timer) return;
        const display = element.querySelector('[data-workspace-live-time]');
        if (display) display.textContent = formatCountdown(timer.remaining);
        const progress = element.querySelector('[data-workspace-progress]');
        if (progress) {
            const percent = timer.totalSeconds > 0
                ? Math.min(100, Math.max(0, ((timer.totalSeconds - timer.remaining) / timer.totalSeconds) * 100))
                : 0;
            progress.style.width = `${percent}%`;
        }
    });
}

function createSampleImage(title, subtitle, palette) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 600">
        <defs>
            <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stop-color="${palette[0]}"/>
                <stop offset="0.55" stop-color="${palette[1]}"/>
                <stop offset="1" stop-color="${palette[2]}"/>
            </linearGradient>
            <radialGradient id="glow" cx="30%" cy="18%" r="75%">
                <stop offset="0" stop-color="#ffffff" stop-opacity=".34"/>
                <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
            </radialGradient>
        </defs>
        <rect width="900" height="600" fill="url(#bg)"/>
        <rect width="900" height="600" fill="url(#glow)"/>
        <circle cx="710" cy="145" r="76" fill="#ffffff" opacity=".13"/>
        <path d="M0 430 C165 330 290 470 420 375 S700 300 900 390 V600 H0Z" fill="#07101d" opacity=".6"/>
        <path d="M0 500 C190 390 320 520 500 430 S760 390 900 455 V600 H0Z" fill="#03070d" opacity=".72"/>
        <g fill="#ffffff" opacity=".12">
            <rect x="34" y="0" width="20" height="34" rx="4"/><rect x="34" y="82" width="20" height="34" rx="4"/>
            <rect x="34" y="164" width="20" height="34" rx="4"/><rect x="34" y="246" width="20" height="34" rx="4"/>
            <rect x="34" y="328" width="20" height="34" rx="4"/><rect x="34" y="410" width="20" height="34" rx="4"/>
            <rect x="34" y="492" width="20" height="34" rx="4"/><rect x="846" y="0" width="20" height="34" rx="4"/>
            <rect x="846" y="82" width="20" height="34" rx="4"/><rect x="846" y="164" width="20" height="34" rx="4"/>
            <rect x="846" y="246" width="20" height="34" rx="4"/><rect x="846" y="328" width="20" height="34" rx="4"/>
            <rect x="846" y="410" width="20" height="34" rx="4"/><rect x="846" y="492" width="20" height="34" rx="4"/>
        </g>
        <rect x="82" y="66" width="736" height="468" rx="20" fill="none" stroke="#ffffff" stroke-opacity=".25"/>
        <text x="104" y="112" fill="#ffffff" fill-opacity=".72" font-family="Segoe UI, sans-serif" font-size="16" letter-spacing="3">FILMLAB · SAMPLE FRAME</text>
        <text x="104" y="468" fill="#ffffff" font-family="Segoe UI, sans-serif" font-size="42" font-weight="700">${escapeHtml(title)}</text>
        <text x="106" y="503" fill="#ffffff" fill-opacity=".72" font-family="Segoe UI, sans-serif" font-size="18">${escapeHtml(subtitle)}</text>
    </svg>`;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function buildSampleRecords() {
    const sampleSteps = processId => getProcessSteps(processId).map(step => ({
        name: step.name,
        duration: step.defaultDuration,
        temp: step.defaultTemp,
        agitation: step.name.includes('显影') ? '每30秒震荡5秒' : '静置',
        startTime: '',
        endTime: '',
        note: '',
        precaution: step.name.includes('显影') ? '严格控制温度并按时震荡' : '',
    }));
    const baseResult = {
        contrast: '适中',
        sharpness: '锐利',
        grain: '适中',
        saturation: '适中',
        exposure: '准确',
        issues: [],
        scanDevice: '示例扫描仪',
        scanResolution: '2400dpi',
        scanColorMode: '24位彩色',
    };

    return [
        {
            id: 'sample-bw-night',
            name: '示例 · HP5+ 城市夜拍',
            processType: 'bw-manual',
            date: '2026-10-18',
            startTime: '20:10',
            endTime: '20:42',
            shootDate: '2026-10-12',
            scene: '夜景',
            roomTemp: 22,
            waterTemp: 20,
            humidity: 55,
            notes: '示例记录：适合查看批次卡片、步骤时间轴和成片档案。',
            shooting: { camera: 'Nikon FM2', lens: '50mm f/1.4', aperture: 'f/2', shutter: '1/30', metering: '中央重点', expComp: '+1 EV', location: '城市街区', weather: '夜景' },
            film: { brand: '伊尔福 Ilford', model: 'HP5 Plus', type: '黑白负片', iso: 'ISO 400', batch: 'HP5-EX-01', expiry: '2028-06-01', shots: 36, remaining: 0, storageDuration: '2个月', storageEnv: '阴凉柜' },
            equipment: [{ type: '显影罐', model: 'Paterson Universal', status: '正常' }],
            equipmentIssue: '无',
            chemicals: [{ type: '显影液', brand: 'Kodak D-76', batch: 'D76-EX-01', ratio: '1+1', volume: '500', usage: '全新', prepDate: '2026-10-18', expiry: '2026-11-10', useCount: 0 }],
            steps: sampleSteps('bw-manual'),
            cleaningChecklist: [{ name: '清洗显影罐及片芯', done: true }],
            result: {
                ...baseResult,
                rating: 4,
                grain: '明显',
                images: [createSampleImage('HP5+ 城市夜拍', '黑白 · ISO 400 · 20°C', ['#aeb8c6', '#536171', '#10151d'])],
                summary: '高光保留良好，暗部细节比预期更丰富。',
                nextAdjust: '下次延长显影 15 秒，并降低一次震荡频率。',
            },
            reviewed: true,
            createdAt: '2026-10-18T12:42:00.000Z',
            modifiedAt: '2026-10-18T12:42:00.000Z',
            inventoryUsageTracked: false,
        },
        {
            id: 'sample-c41-sunset',
            name: '示例 · Pro 400H 日落',
            processType: 'c41',
            date: '2026-10-25',
            startTime: '16:20',
            endTime: '16:42',
            shootDate: '2026-10-21',
            scene: '风光',
            roomTemp: 24,
            waterTemp: 38,
            humidity: 48,
            notes: '示例记录：彩色负片批次与药水信息。',
            shooting: { camera: 'Contax T2', lens: '38mm f/2.8', aperture: 'f/8', shutter: '1/250', metering: '平均测光', expComp: '0 EV', location: '江边', weather: '晴天' },
            film: { brand: '富士 Fujifilm', model: 'Pro 400H', type: '彩色负片', iso: 'ISO 400', batch: '400H-EX-02', expiry: '2027-12-01', shots: 36, remaining: 0, storageDuration: '3个月', storageEnv: '冰箱冷藏' },
            equipment: [{ type: '显影罐', model: 'Jobo 1520', status: '正常' }],
            equipmentIssue: '无',
            chemicals: [{ type: '彩色显影液', brand: 'C41 Kit', batch: 'C41-EX-02', ratio: '标准工作液', volume: '1000', usage: '复用', prepDate: '2026-10-25', expiry: '2026-11-08', useCount: 2 }],
            steps: sampleSteps('c41'),
            cleaningChecklist: [{ name: '清洗显影罐及片芯', done: true }],
            result: {
                ...baseResult,
                rating: 5,
                images: [createSampleImage('Pro 400H 日落', '彩色负片 · C41 · 38°C', ['#f2ad69', '#cb6f78', '#1d2438'])],
                summary: '色彩过渡自然，青绿色与晚霞分离清楚。',
                nextAdjust: '沿用本次温控节奏，下次减少 5 秒漂白时间。',
            },
            reviewed: true,
            createdAt: '2026-10-25T08:42:00.000Z',
            modifiedAt: '2026-10-25T08:42:00.000Z',
            inventoryUsageTracked: false,
        },
        {
            id: 'sample-e6-mountain',
            name: '示例 · E100 山野清晨',
            processType: 'e6',
            date: '2026-11-01',
            startTime: '09:05',
            endTime: '09:46',
            shootDate: '2026-10-28',
            scene: '风光',
            roomTemp: 21,
            waterTemp: 38,
            humidity: 46,
            notes: '示例记录：反转片流程与复查状态。',
            shooting: { camera: 'Pentax 67', lens: '105mm f/2.4', aperture: 'f/11', shutter: '1/125', metering: '点测光', expComp: '-0.3 EV', location: '山地', weather: '多云' },
            film: { brand: '柯达 Kodak', model: 'Ektachrome E100', type: '彩色反转片', iso: 'ISO 100', batch: 'E100-EX-03', expiry: '2027-08-01', shots: 120, remaining: 0, storageDuration: '1周', storageEnv: '常温避光' },
            equipment: [{ type: '恒温水浴', model: 'Sous Vide', status: '正常' }],
            equipmentIssue: '无',
            chemicals: [{ type: '反转液', brand: 'E6 Kit', batch: 'E6-EX-03', ratio: '标准工作液', volume: '1000', usage: '全新', prepDate: '2026-11-01', expiry: '2026-11-20', useCount: 0 }],
            steps: sampleSteps('e6'),
            cleaningChecklist: [{ name: '清洗显影罐及片芯', done: false }],
            result: {
                ...baseResult,
                rating: 0,
                saturation: '浓郁',
                images: [createSampleImage('E100 山野清晨', '彩色反转片 · E6 · 38°C', ['#7ec7cf', '#577bb0', '#172338'])],
                summary: '',
                nextAdjust: '',
            },
            reviewed: false,
            createdAt: '2026-11-01T01:46:00.000Z',
            modifiedAt: '2026-11-01T01:46:00.000Z',
            inventoryUsageTracked: false,
        },
    ];
}

function getSampleRecordCount() {
    return getAllRecords().filter(record => record.id.startsWith('sample-')).length;
}

function openSampleDataModal() {
    const count = getSampleRecordCount();
    openModal(`
        <div class="modal-header">
            <span class="modal-title">示例批次</span>
            <button class="modal-close" onclick="closeModal()">
                <svg viewBox="0 0 24 24" fill="none" width="20" height="20"><path d="M6 6L18 18M6 18L18 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            </button>
        </div>
        <div class="modal-body">
            <p style="font-size:13px;color:var(--text-secondary);line-height:1.8;">
                载入 3 条示例记录，包含黑白、C41 和 E6 工艺以及示例成片。
                示例只追加到现有记录中，不会覆盖你的真实数据。
            </p>
            ${count > 0 ? `<p style="font-size:12px;color:var(--warn);margin-top:10px;">当前已有 ${count} 条示例记录。</p>` : ''}
        </div>
        <div class="modal-footer">
            <button class="btn btn-ghost" onclick="closeModal()">取消</button>
            ${count > 0 ? `<button class="btn btn-danger-outline" onclick="removeSampleData()">移除示例</button>` : ''}
            <button class="btn btn-primary" onclick="loadSampleData()">${count > 0 ? '重新载入示例' : '载入示例'}</button>
        </div>
    `);
}

function loadSampleData() {
    const samples = buildSampleRecords();
    const sampleIds = new Set(samples.map(record => record.id));
    const records = getAllRecords().filter(record => !sampleIds.has(record.id));
    const nextRecords = [...samples, ...records];
    if (!saveData(STORAGE_KEYS.records, nextRecords)) {
        toast('示例载入失败，请检查浏览器存储空间', 'error');
        return;
    }
    appState.workspaceSelection = { type: 'record', id: samples[0].id };
    closeModal();
    renderWorkspace();
    renderSidebarStats();
    if (appState.currentTab === 'record-list') renderRecordList();
    if (appState.currentTab === 'gallery') renderGallery();
    toast('示例批次和成片已载入', 'success');
}

function removeSampleData() {
    const records = getAllRecords().filter(record => !record.id.startsWith('sample-'));
    if (!saveData(STORAGE_KEYS.records, records)) {
        toast('移除失败，请稍后重试', 'error');
        return;
    }
    appState.workspaceSelection = null;
    appState.selectedRecords.clear();
    closeModal();
    renderWorkspace();
    renderSidebarStats();
    if (appState.currentTab === 'record-list') renderRecordList();
    if (appState.currentTab === 'gallery') renderGallery();
    toast('示例数据已移除', 'success');
}

function selectProcess(processId) {
    showContaminationWarning(function() {
        appState.selectedProcess = processId;
        renderProcessGrid();

        // 更新表单中的流程选择
        updateProcessSelectOptions();
        document.getElementById('recProcessType').value = processId;
        document.getElementById('currentProcessName').textContent = getProcessName(processId);

        // 生成流程对应步骤
        regenerateSteps(processId);

        toast(`已选择流程：${getProcessName(processId)}`, 'success');

        // 自动跳转到新建记录
        setTimeout(() => switchTab('new-record'), 400);
    });
}

// 从顶栏"新建冲洗记录"按钮进入 — 同样需要污染警告
function startNewRecord() {
    showContaminationWarning(function() {
        switchTab('new-record');
    });
}

function updateProcessSelectOptions() {
    const select = document.getElementById('recProcessType');
    const allProcs = getAllProcesses();
    select.innerHTML = '<option value="">请先选择冲洗方案</option>' +
        allProcs.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
}

function openCustomProcessModal(processId) {
    const editing = processId ? getCustomProcesses().find(p => p.id === processId) : null;
    const name = editing ? editing.name : '';
    const steps = editing ? editing.steps : [{ name: '', defaultTemp: 20, defaultDuration: 300 }];

    openModal(`
        <div class="modal-header">
            <span class="modal-title">${editing ? '编辑自定义流程' : '新增自定义流程'}</span>
            <button class="modal-close" onclick="closeModal()">
                <svg viewBox="0 0 24 24" fill="none" width="20" height="20"><path d="M6 6L18 18M6 18L18 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            </button>
        </div>
        <div class="modal-body">
            <div class="form-field" style="margin-bottom:16px;">
                <label>流程名称 <span class="required">*</span></label>
                <input type="text" id="cpName" value="${name}" placeholder="如：极简一次性冲洗">
            </div>
            <label style="font-size:13px;font-weight:600;margin-bottom:10px;display:block;">冲洗步骤</label>
            <div id="cpSteps" style="display:flex;flex-direction:column;gap:8px;">
                ${steps.map((s, i) => renderCpStepRow(s, i)).join('')}
            </div>
            <button class="btn btn-sm btn-outline" style="margin-top:10px;" onclick="addCpStep()">+ 添加步骤</button>
        </div>
        <div class="modal-footer">
            <button class="btn btn-ghost" onclick="closeModal()">取消</button>
            <button class="btn btn-primary" onclick="saveCustomProcess('${processId || ''}')">保存</button>
        </div>
    `);
}

function renderCpStepRow(step, index) {
    return `
        <div class="dynamic-row" style="grid-template-columns:2fr 1fr 1fr auto;align-items:end;">
            <div class="form-field">
                <label>步骤名称</label>
                <input type="text" value="${step.name || ''}" placeholder="如：显影" data-cp-step="name" data-idx="${index}">
            </div>
            <div class="form-field">
                <label>温度(°C)</label>
                <input type="number" value="${step.defaultTemp || 20}" data-cp-step="temp" data-idx="${index}">
            </div>
            <div class="form-field">
                <label>时长(秒)</label>
                <input type="number" value="${step.defaultDuration || 300}" data-cp-step="duration" data-idx="${index}">
            </div>
            <button class="row-remove" onclick="this.parentElement.remove()">×</button>
        </div>
    `;
}

function addCpStep() {
    const container = document.getElementById('cpSteps');
    const idx = container.children.length;
    container.insertAdjacentHTML('beforeend', renderCpStepRow({ name: '', defaultTemp: 20, defaultDuration: 300 }, idx));
}

function saveCustomProcess(existingId) {
    const name = document.getElementById('cpName').value.trim();
    if (!name) { toast('请输入流程名称', 'error'); return; }

    const stepRows = document.querySelectorAll('#cpSteps .dynamic-row');
    const steps = [];
    stepRows.forEach(row => {
        const nameInput = row.querySelector('[data-cp-step="name"]');
        const tempInput = row.querySelector('[data-cp-step="temp"]');
        const durInput = row.querySelector('[data-cp-step="duration"]');
        if (nameInput && nameInput.value.trim()) {
            steps.push({
                name: nameInput.value.trim(),
                defaultTemp: parseFloat(tempInput.value) || 20,
                defaultDuration: parseInt(durInput.value) || 300,
            });
        }
    });

    if (steps.length === 0) { toast('请至少添加一个步骤', 'error'); return; }

    const customs = getCustomProcesses();
    if (existingId) {
        const idx = customs.findIndex(p => p.id === existingId);
        if (idx >= 0) {
            customs[idx].name = name;
            customs[idx].steps = steps;
        }
    } else {
        customs.push({
            id: 'custom-' + Date.now().toString(36),
            name,
            desc: '用户自定义流程',
            icon: 'custom',
            tags: ['自定义'],
            steps,
            createdAt: new Date().toISOString(),
        });
    }

    saveData(STORAGE_KEYS.customProcesses, customs);
    closeModal();
    renderCustomProcessList();
    updateProcessSelectOptions();
    toast(existingId ? '流程已更新' : '自定义流程已创建', 'success');
}

function editCustomProcess(id) {
    openCustomProcessModal(id);
}

function deleteCustomProcess(id) {
    openModal(`
        <div class="modal-header">
            <span class="modal-title">确认删除</span>
            <button class="modal-close" onclick="closeModal()">
                <svg viewBox="0 0 24 24" fill="none" width="20" height="20"><path d="M6 6L18 18M6 18L18 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            </button>
        </div>
        <div class="modal-body">
            <p style="font-size:14px;">确定要删除此自定义流程吗？此操作不可恢复。</p>
        </div>
        <div class="modal-footer">
            <button class="btn btn-ghost" onclick="closeModal()">取消</button>
            <button class="btn btn-danger-outline" onclick="confirmDeleteProcess('${id}')">确认删除</button>
        </div>
    `);
}

function confirmDeleteProcess(id) {
    let customs = getCustomProcesses();
    customs = customs.filter(p => p.id !== id);
    saveData(STORAGE_KEYS.customProcesses, customs);
    closeModal();
    renderCustomProcessList();
    updateProcessSelectOptions();
    toast('流程已删除', 'success');
}

// ============================================
// 标签页2：新建冲洗记录 - 动态表单
// ============================================
function addEquipmentRow(data = {}) {
    const list = document.getElementById('equipmentList');
    const idx = list.children.length;
    const row = document.createElement('div');
    row.className = 'dynamic-row';
    row.style.gridTemplateColumns = '1fr 1fr 1fr auto';
    row.style.alignItems = 'end';
    const isCustom = data.type && !EQUIPMENT_TYPES.includes(data.type);
    row.innerHTML = `
        <div class="form-field">
            <label>设备类型</label>
            <select data-eq="type" onchange="if(this.value==='__custom__'){this.nextElementSibling.style.display='block';this.nextElementSibling.focus();}else{this.nextElementSibling.style.display='none';this.nextElementSibling.value='';}">
                <option value="">请选择</option>
                ${EQUIPMENT_TYPES.map(t => `<option value="${t}" ${data.type === t ? 'selected' : ''}>${t}</option>`).join('')}
                <option value="__custom__" ${isCustom ? 'selected' : ''}>自定义...</option>
            </select>
            <input type="text" value="${isCustom ? data.type : ''}" placeholder="输入自定义设备类型" data-eq="customType" style="margin-top:4px; ${isCustom ? '' : 'display:none;'}">
        </div>
        <div class="form-field">
            <label>设备型号</label>
            <input type="text" value="${data.model || ''}" placeholder="如：Paterson Universal" data-eq="model">
        </div>
        <div class="form-field">
            <label>设备状态</label>
            <select data-eq="status">
                <option value="正常" ${data.status === '正常' ? 'selected' : ''}>正常</option>
                <option value="轻微损耗" ${data.status === '轻微损耗' ? 'selected' : ''}>轻微损耗</option>
                <option value="需检修" ${data.status === '需检修' ? 'selected' : ''}>需检修</option>
            </select>
        </div>
        <button type="button" class="row-remove" onclick="this.parentElement.remove()">×</button>
    `;
    list.appendChild(row);
}

function addChemicalRow(data = {}) {
    const list = document.getElementById('chemicalList');
    const processId = document.getElementById('recProcessType').value;
    const chemTypes = getChemicalTypes(processId);
    const row = document.createElement('div');
    row.className = 'dynamic-row';
    const isCustom = data.type && !chemTypes.includes(data.type);
    row.innerHTML = `
        <div class="dynamic-row-header">
            <span class="dynamic-row-title">药水 #${list.children.length + 1}</span>
            <button type="button" class="row-remove" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;">
            <div class="form-field">
                <label>药水类型</label>
                <select data-chem="type" onchange="if(this.value==='__custom__'){this.parentElement.querySelector('[data-chem=&quot;customType&quot;]').style.display='block';this.parentElement.querySelector('[data-chem=&quot;customType&quot;]').focus();}else{this.parentElement.querySelector('[data-chem=&quot;customType&quot;]').style.display='none';this.parentElement.querySelector('[data-chem=&quot;customType&quot;]').value='';}">
                    <option value="">请选择</option>
                    ${chemTypes.map(t => `<option value="${t}" ${data.type === t ? 'selected' : ''}>${t}</option>`).join('')}
                    <option value="__custom__" ${isCustom ? 'selected' : ''}>自定义...</option>
                </select>
                <input type="text" value="${isCustom ? data.type : ''}" placeholder="自定义药水类型" data-chem="customType" style="margin-top:4px; ${isCustom ? '' : 'display:none;'}">
            </div>
            <div class="form-field">
                <label>品牌型号</label>
                <input type="text" value="${data.brand || ''}" placeholder="如：Kodak D-76" data-chem="brand">
            </div>
            <div class="form-field">
                <label>批次号</label>
                <input type="text" value="${data.batch || ''}" data-chem="batch">
            </div>
            <div class="form-field">
                <label>配比比例</label>
                <input type="text" value="${data.ratio || ''}" placeholder="如：1+1" data-chem="ratio">
            </div>
            <div class="form-field">
                <label>配制容量(ml)</label>
                <input type="number" value="${data.volume || ''}" data-chem="volume">
            </div>
            <div class="form-field">
                <label>使用状态</label>
                <select data-chem="usage">
                    <option value="全新" ${data.usage === '全新' ? 'selected' : ''}>全新</option>
                    <option value="复用" ${data.usage === '复用' ? 'selected' : ''}>复用</option>
                    <option value="临近过期" ${data.usage === '临近过期' ? 'selected' : ''}>临近过期</option>
                </select>
            </div>
            <div class="form-field">
                <label>配制日期</label>
                <input type="date" value="${data.prepDate || ''}" data-chem="prepDate">
            </div>
            <div class="form-field">
                <label>有效期</label>
                <input type="date" value="${data.expiry || ''}" data-chem="expiry">
            </div>
            <div class="form-field">
                <label>已用次数</label>
                <input type="number" value="${data.useCount || 0}" data-chem="useCount">
            </div>
        </div>
    `;
    list.appendChild(row);
}

function addStepRow(data = {}) {
    const list = document.getElementById('stepList');
    const idx = list.children.length;
    const row = document.createElement('div');
    row.className = 'dynamic-row';
    row.innerHTML = `
        <div class="dynamic-row-header">
            <span class="dynamic-row-title">步骤 ${idx + 1}${data.name ? ': ' + data.name : ''}</span>
            <button type="button" class="row-remove" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;">
            <div class="form-field">
                <label>步骤名称</label>
                <input type="text" value="${data.name || ''}" placeholder="如：显影" data-step="name">
            </div>
            <div class="form-field">
                <label>时长(秒)</label>
                <input type="number" value="${data.duration || ''}" placeholder="如：480" data-step="duration">
            </div>
            <div class="form-field">
                <label>温度(°C)</label>
                <input type="number" step="0.1" value="${data.temp || ''}" placeholder="如：20" data-step="temp">
            </div>
            <div class="form-field">
                <label>震荡方式</label>
                <select data-step="agitation">
                    <option value="">请选择</option>
                    <option value="连续震荡" ${data.agitation === '连续震荡' ? 'selected' : ''}>连续震荡</option>
                    <option value="间歇震荡" ${data.agitation === '间歇震荡' ? 'selected' : ''}>间歇震荡</option>
                    <option value="每30秒震荡5秒" ${data.agitation === '每30秒震荡5秒' ? 'selected' : ''}>每30秒震荡5秒</option>
                    <option value="每分钟震荡10秒" ${data.agitation === '每分钟震荡10秒' ? 'selected' : ''}>每分钟震荡10秒</option>
                    <option value="静置" ${data.agitation === '静置' ? 'selected' : ''}>静置</option>
                </select>
            </div>
            <div class="form-field">
                <label>开始时间</label>
                <input type="time" value="${data.startTime || ''}" data-step="startTime">
            </div>
            <div class="form-field">
                <label>结束时间</label>
                <input type="time" value="${data.endTime || ''}" data-step="endTime">
            </div>
            <div class="form-field" style="grid-column:span 2;">
                <label>备注</label>
                <input type="text" value="${data.note || ''}" placeholder="步骤备注" data-step="note">
            </div>
        </div>
        <div class="step-notes">
            <svg viewBox="0 0 24 24" fill="none" width="14" height="14"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            <input type="text" value="${data.precaution || ''}" placeholder="注意事项：如温度严格控制、避免交叉污染..." data-step="precaution">
        </div>
    `;
    list.appendChild(row);
}

function regenerateSteps(processId) {
    const list = document.getElementById('stepList');
    list.innerHTML = '';

    const steps = getProcessSteps(processId);
    const hint = document.getElementById('stepsHint');

    if (processId === 'bw-manual' || processId === 'bw-auto') {
        hint.textContent = '黑白冲洗专属步骤';
    } else if (processId === 'c41') {
        hint.textContent = 'C41 彩色冲洗专属步骤';
    } else if (processId === 'e6') {
        hint.textContent = 'E6 彩色反转片专属步骤';
    } else {
        hint.textContent = '自定义流程步骤';
    }

    if (steps.length > 0) {
        steps.forEach(s => addStepRow({
            name: s.name,
            duration: s.defaultDuration,
            temp: s.defaultTemp,
        }));
    } else {
        addStepRow();
    }

    // 根据流程类型自动生成清洗清单
    const defaultEquipment = getDefaultEquipmentForProcess(processId);
    renderCleaningChecklist(null, defaultEquipment);
}

// 根据流程类型返回默认使用的设备列表（用于自动生成清洗清单）
function getDefaultEquipmentForProcess(processId) {
    const common = [
        { type: '显影罐', model: '' },
        { type: '温度计', model: '' },
        { type: '量杯', model: '' },
    ];
    if (processId === 'c41' || processId === 'e6') {
        common.push({ type: '恒温水浴', model: '' });
    }
    return common;
}

// 流程类型变化时重新生成步骤
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('recProcessType')?.addEventListener('change', (e) => {
        const processId = e.target.value;
        appState.selectedProcess = processId;
        document.getElementById('currentProcessName').textContent = processId ? getProcessName(processId) : '未选择';
        regenerateSteps(processId);

        // 重新生成药水行
        const chemList = document.getElementById('chemicalList');
        chemList.innerHTML = '';
    });
});

// 评分星星
document.addEventListener('DOMContentLoaded', () => {
    const stars = document.querySelectorAll('.rating-stars .star');
    stars.forEach(star => {
        star.addEventListener('click', () => {
            const val = parseInt(star.dataset.val);
            document.getElementById('recRating').value = val;
            stars.forEach(s => {
                s.classList.toggle('active', parseInt(s.dataset.val) <= val);
            });
        });
    });
});

// 图片上传 — 压缩后存入 IndexedDB，localStorage 只保存 ID
async function handleImageUpload(event) {
    const files = event.target.files;
    for (const file of Array.from(files)) {
        try {
            const dataUrl = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (e) => resolve(e.target.result);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
            const imgId = await storeImage(dataUrl);
            appState.uploadedImages.push(imgId);
        } catch (e) {
            console.error('Image upload failed:', e);
            toast('图片上传失败：' + e.message, 'error');
        }
    }
    renderImagePreviews();
}

function renderImagePreviews() {
    const grid = document.getElementById('imagePreviewGrid');
    grid.innerHTML = appState.uploadedImages.map((imgId, i) => `
        <div class="image-preview-item">
            <img data-img-id="${imgId}" alt="样张${i + 1}" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Crect fill='%23121828' width='120' height='120'/%3E%3Ctext x='60' y='65' text-anchor='middle' fill='%23558' font-size='14'%3E加载中...%3C/text%3E%3C/svg%3E">
            <button class="remove-img" onclick="removeImage(${i})">×</button>
        </div>
    `).join('');
    loadImagesIntoDOM(grid);
}

function removeImage(index) {
    const imgId = appState.uploadedImages[index];
    const isSavedImage = (appState.originalRecordImages || []).includes(imgId);
    // 已保存图片要等记录保存成功后再删除；新上传但未保存的图片可以立即清理。
    if (imgId && !isSavedImage && !imgId.startsWith('data:')) {
        dbDelete(IMG_STORE, imgId).catch(e => console.error('Failed to delete image:', imgId));
    }
    appState.uploadedImages.splice(index, 1);
    renderImagePreviews();
}

// 保存记录
function saveRecord(event) {
    if (event) event.preventDefault();

    const processType = document.getElementById('recProcessType').value;
    if (!processType) { toast('请先选择冲洗流程', 'error'); return; }
    const name = document.getElementById('recName').value.trim();
    if (!name) { toast('请输入记录名称', 'error'); return; }
    const date = document.getElementById('recDate').value;
    if (!date) { toast('请选择冲洗日期', 'error'); return; }

    // 收集设备数据
    const equipment = [];
    document.querySelectorAll('#equipmentList .dynamic-row').forEach(row => {
        const selectVal = row.querySelector('[data-eq="type"]').value;
        const customVal = row.querySelector('[data-eq="customType"]')?.value.trim() || '';
        equipment.push({
            type: selectVal === '__custom__' ? customVal : selectVal,
            model: row.querySelector('[data-eq="model"]').value,
            status: row.querySelector('[data-eq="status"]').value,
        });
    });

    // 收集药水数据
    const chemicals = [];
    document.querySelectorAll('#chemicalList .dynamic-row').forEach(row => {
        const selectVal = row.querySelector('[data-chem="type"]').value;
        const customVal = row.querySelector('[data-chem="customType"]')?.value.trim() || '';
        chemicals.push({
            type: selectVal === '__custom__' ? customVal : selectVal,
            brand: row.querySelector('[data-chem="brand"]').value,
            batch: row.querySelector('[data-chem="batch"]').value,
            ratio: row.querySelector('[data-chem="ratio"]').value,
            volume: row.querySelector('[data-chem="volume"]').value,
            usage: row.querySelector('[data-chem="usage"]').value,
            prepDate: row.querySelector('[data-chem="prepDate"]').value,
            expiry: row.querySelector('[data-chem="expiry"]').value,
            useCount: parseInt(row.querySelector('[data-chem="useCount"]').value) || 0,
        });
    });

    // 收集步骤数据
    const steps = [];
    document.querySelectorAll('#stepList .dynamic-row').forEach(row => {
        steps.push({
            name: row.querySelector('[data-step="name"]').value,
            duration: parseInt(row.querySelector('[data-step="duration"]').value) || 0,
            temp: parseFloat(row.querySelector('[data-step="temp"]').value) || 0,
            agitation: row.querySelector('[data-step="agitation"]').value,
            startTime: row.querySelector('[data-step="startTime"]').value,
            endTime: row.querySelector('[data-step="endTime"]').value,
            note: row.querySelector('[data-step="note"]').value,
            precaution: row.querySelector('[data-step="precaution"]')?.value || '',
        });
    });

    // 收集清洗清单
    const cleaningChecklist = [];
    document.querySelectorAll('#cleaningItems .cleaning-item').forEach(item => {
        cleaningChecklist.push({
            name: item.querySelector('.cleaning-label').textContent,
            done: item.classList.contains('done'),
        });
    });

    // 收集问题
    const issues = [];
    document.querySelectorAll('#issueGroup input:checked').forEach(cb => issues.push(cb.value));

    const record = {
        id: appState.editingRecordId || generateId(),
        name,
        processType,
        date,
        startTime: document.getElementById('recStartTime').value,
        endTime: document.getElementById('recEndTime').value,
        shootDate: document.getElementById('recShootDate').value,
        scene: document.getElementById('recScene').value,
        roomTemp: parseFloat(document.getElementById('recRoomTemp').value) || null,
        waterTemp: parseFloat(document.getElementById('recWaterTemp').value) || null,
        humidity: parseInt(document.getElementById('recHumidity').value) || null,
        notes: document.getElementById('recNotes').value,
        shooting: {
            camera: document.getElementById('shootCamera')?.value || '',
            lens: document.getElementById('shootLens')?.value || '',
            aperture: document.getElementById('shootAperture')?.value || '',
            shutter: document.getElementById('shootShutter')?.value || '',
            metering: document.getElementById('shootMetering')?.value || '',
            expComp: document.getElementById('shootExpComp')?.value || '',
            location: document.getElementById('shootLocation')?.value || '',
            weather: document.getElementById('shootWeather')?.value || '',
        },
        film: {
            brand: document.getElementById('filmBrand').value,
            model: document.getElementById('filmModel').value,
            type: document.getElementById('filmType').value,
            iso: document.getElementById('filmIso').value,
            batch: document.getElementById('filmBatch').value,
            expiry: document.getElementById('filmExpiry').value,
            shots: parseInt(document.getElementById('filmShots').value) || null,
            remaining: parseInt(document.getElementById('filmRemaining').value) || null,
            storageDuration: document.getElementById('filmStorageDuration').value,
            storageEnv: document.getElementById('filmStorageEnv').value,
        },
        equipment,
        equipmentIssue: document.getElementById('equipmentIssue').value,
        chemicals,
        steps,
        cleaningChecklist,
        result: {
            rating: parseInt(document.getElementById('recRating').value) || 0,
            contrast: document.getElementById('resContrast').value,
            sharpness: document.getElementById('resSharpness').value,
            grain: document.getElementById('resGrain').value,
            saturation: document.getElementById('resSaturation').value,
            exposure: document.getElementById('resExposure').value,
            issues,
            scanDevice: document.getElementById('scanDevice').value,
            scanResolution: document.getElementById('scanResolution').value,
            scanColorMode: document.getElementById('scanColorMode').value,
            images: [...appState.uploadedImages],
            summary: document.getElementById('recSummary').value,
            nextAdjust: document.getElementById('recNextAdjust').value,
        },
        reviewed: !!(document.getElementById('recSummary').value.trim() || document.getElementById('recRating').value > 0),
        createdAt: appState.editingRecordId ? (getAllRecords().find(r => r.id === appState.editingRecordId)?.createdAt || new Date().toISOString()) : new Date().toISOString(),
        modifiedAt: new Date().toISOString(),
        inventoryUsageTracked: true,
    };

    const records = getAllRecords();
    let previousRecord = null;
    if (appState.editingRecordId) {
        const idx = records.findIndex(r => r.id === appState.editingRecordId);
        if (idx >= 0) {
            previousRecord = records[idx];
            records[idx] = record;
        }
    } else {
        records.unshift(record);
    }

    const inventory = getAllInventory();
    const previousInventory = JSON.parse(JSON.stringify(inventory));
    applyChemicalUsageDiff(inventory, previousRecord, record);

    // 先写库存再写记录；记录写入失败时恢复库存，避免出现半保存状态。
    if (!saveData(STORAGE_KEYS.inventory, inventory)) {
        toast('保存失败，请检查存储空间后重试', 'error');
        return;
    }
    if (!saveData(STORAGE_KEYS.records, records)) {
        saveData(STORAGE_KEYS.inventory, previousInventory);
        toast('保存失败，表单内容仍保留，请检查存储空间后重试', 'error');
        return;
    }

    // 添加复盘提醒通知
    if (!record.reviewed) {
        addNotification('review', '冲洗复盘提醒', `记录「${record.name}」尚未完成复盘总结，请及时补充效果评价`, record.id);
    }

    // 忘记清洗提醒 — 清单中有未完成项时推送通知
    const pendingCleaning = (record.cleaningChecklist || []).filter(c => !c.done);
    if (pendingCleaning.length > 0) {
        const names = pendingCleaning.map(c => c.name).join('、');
        addNotification('cleaning', '⚠ 设备清洗提醒', `记录「${record.name}」有 ${pendingCleaning.length} 项设备尚未清洗：${names}`, record.id);
    }

    // 原图中的删除只在记录保存成功后提交。
    const originalImages = appState.originalRecordImages || [];
    originalImages
        .filter(imgId => imgId && !appState.uploadedImages.includes(imgId) && !imgId.startsWith('data:'))
        .forEach(imgId => dbDelete(IMG_STORE, imgId).catch(e => console.error('Failed to delete image:', imgId)));

    const wasEditing = !!appState.editingRecordId;
    resetForm({ cleanupDraftImages: false });
    toast(wasEditing ? '记录已更新' : '记录已保存', 'success');
    appState.editingRecordId = null;
    switchTab('record-list');
}

function findInventoryChemical(chemicals, recordChemical) {
    if (!recordChemical) return null;
    if (recordChemical.batch) {
        const byBatch = chemicals.find(c =>
            c.batch === recordChemical.batch &&
            (c.type === recordChemical.type || c.brand === recordChemical.brand)
        );
        if (byBatch) return byBatch;
    }
    return chemicals.find(c =>
        c.type === recordChemical.type &&
        c.brand === recordChemical.brand
    );
}

function countRecordChemicals(record) {
    const counts = [];
    (record?.chemicals || []).forEach(chem => {
        const key = [chem.type || '', chem.brand || '', chem.batch || ''].join('\u0000');
        const item = counts.find(c => c.key === key);
        if (item) item.count++;
        else counts.push({ key, chem, count: 1 });
    });
    return counts;
}

function applyChemicalUsageDiff(inventory, previousRecord, nextRecord) {
    inventory.chemical = inventory.chemical || [];
    const previous = countRecordChemicals(previousRecord);
    const next = countRecordChemicals(nextRecord);
    const keys = new Set([...previous.map(c => c.key), ...next.map(c => c.key)]);

    keys.forEach(key => {
        const oldItem = previous.find(c => c.key === key);
        const newItem = next.find(c => c.key === key);
        const recordChemical = newItem?.chem || oldItem?.chem;
        const invItem = findInventoryChemical(inventory.chemical, recordChemical);
        if (!invItem) return;

        let delta = (newItem?.count || 0) - (oldItem?.count || 0);
        // 旧版本记录没有使用追踪标记，无法安全判断历史负差是否已入账。
        if (previousRecord && !previousRecord.inventoryUsageTracked) delta = Math.max(0, delta);
        if (delta !== 0) {
            invItem.useCount = Math.max(0, (Number(invItem.useCount) || 0) + delta);
        }
    });
}

function resetForm({ cleanupDraftImages = true } = {}) {
    if (cleanupDraftImages) {
        const originalImages = new Set(appState.originalRecordImages || []);
        appState.uploadedImages
            .filter(imgId => imgId && !originalImages.has(imgId) && !imgId.startsWith('data:'))
            .forEach(imgId => dbDelete(IMG_STORE, imgId).catch(e => console.error('Failed to delete draft image:', imgId)));
    }
    document.getElementById('recordForm').reset();
    document.getElementById('recordId').value = '';
    document.getElementById('recRating').value = '0';
    document.querySelectorAll('.rating-stars .star').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('#issueGroup input').forEach(cb => cb.checked = false);
    document.getElementById('equipmentList').innerHTML = '';
    document.getElementById('chemicalList').innerHTML = '';
    document.getElementById('stepList').innerHTML = '';
    document.getElementById('imagePreviewGrid').innerHTML = '';
    appState.uploadedImages = [];
    appState.originalRecordImages = [];
    appState.editingRecordId = null;
    appState.selectedProcess = null;
    document.getElementById('currentProcessName').textContent = '未选择';
    document.getElementById('formTitle').textContent = '开始冲洗';
    document.getElementById('formSubtitle').textContent = '记录胶卷、药水批次与实际步骤';
}

// 编辑记录
function editRecord(id) {
    const record = getAllRecords().find(r => r.id === id);
    if (!record) return;

    appState.editingRecordId = id;
    appState.selectedProcess = record.processType;
    appState.uploadedImages = record.result.images ? [...record.result.images] : [];
    appState.originalRecordImages = [...appState.uploadedImages];

    switchTab('new-record');

    // 更新表单标题
    document.getElementById('formTitle').textContent = '编辑冲洗记录';
    document.getElementById('formSubtitle').textContent = '修改记录数据，修改时间将自动记录';

    setTimeout(() => {
        updateProcessSelectOptions();
        document.getElementById('recProcessType').value = record.processType;
        document.getElementById('currentProcessName').textContent = getProcessName(record.processType);
        document.getElementById('recordId').value = record.id;
        document.getElementById('recName').value = record.name;
        document.getElementById('recDate').value = record.date;
        document.getElementById('recStartTime').value = record.startTime || '';
        document.getElementById('recEndTime').value = record.endTime || '';
        document.getElementById('recShootDate').value = record.shootDate || '';
        document.getElementById('recScene').value = record.scene || '';
        document.getElementById('recRoomTemp').value = record.roomTemp || '';
        document.getElementById('recWaterTemp').value = record.waterTemp || '';
        document.getElementById('recHumidity').value = record.humidity || '';
        document.getElementById('recNotes').value = record.notes || '';

        // 拍摄信息
        if (record.shooting) {
            const s = record.shooting;
            if (document.getElementById('shootCamera')) document.getElementById('shootCamera').value = s.camera || '';
            if (document.getElementById('shootLens')) document.getElementById('shootLens').value = s.lens || '';
            if (document.getElementById('shootAperture')) document.getElementById('shootAperture').value = s.aperture || '';
            if (document.getElementById('shootShutter')) document.getElementById('shootShutter').value = s.shutter || '';
            if (document.getElementById('shootMetering')) document.getElementById('shootMetering').value = s.metering || '';
            if (document.getElementById('shootExpComp')) document.getElementById('shootExpComp').value = s.expComp || '';
            if (document.getElementById('shootLocation')) document.getElementById('shootLocation').value = s.location || '';
            if (document.getElementById('shootWeather')) document.getElementById('shootWeather').value = s.weather || '';
        }

        // 胶卷信息
        document.getElementById('filmBrand').value = record.film.brand || '';
        document.getElementById('filmModel').value = record.film.model || '';
        document.getElementById('filmType').value = record.film.type || '';
        document.getElementById('filmIso').value = record.film.iso || '';
        document.getElementById('filmBatch').value = record.film.batch || '';
        document.getElementById('filmExpiry').value = record.film.expiry || '';
        document.getElementById('filmShots').value = record.film.shots || '';
        document.getElementById('filmRemaining').value = record.film.remaining || '';
        document.getElementById('filmStorageDuration').value = record.film.storageDuration || '';
        document.getElementById('filmStorageEnv').value = record.film.storageEnv || '';

        // 设备信息
        document.getElementById('equipmentIssue').value = record.equipmentIssue || '无';
        document.getElementById('equipmentList').innerHTML = '';
        if (record.equipment && record.equipment.length > 0) {
            record.equipment.forEach(eq => addEquipmentRow(eq));
        }

        // 药水信息
        document.getElementById('chemicalList').innerHTML = '';
        if (record.chemicals && record.chemicals.length > 0) {
            record.chemicals.forEach(chem => addChemicalRow(chem));
        }

        // 步骤
        document.getElementById('stepList').innerHTML = '';
        if (record.steps && record.steps.length > 0) {
            record.steps.forEach(s => addStepRow(s));
        } else {
            regenerateSteps(record.processType);
        }

        // 清洗清单
        renderCleaningChecklist(record.cleaningChecklist, record.equipment);

        // 成片效果
        const rating = record.result.rating || 0;
        document.getElementById('recRating').value = rating;
        document.querySelectorAll('.rating-stars .star').forEach(s => {
            s.classList.toggle('active', parseInt(s.dataset.val) <= rating);
        });
        document.getElementById('resContrast').value = record.result.contrast || '';
        document.getElementById('resSharpness').value = record.result.sharpness || '';
        document.getElementById('resGrain').value = record.result.grain || '';
        document.getElementById('resSaturation').value = record.result.saturation || '';
        document.getElementById('resExposure').value = record.result.exposure || '';

        // 问题
        document.querySelectorAll('#issueGroup input').forEach(cb => {
            cb.checked = (record.result.issues || []).includes(cb.value);
        });

        document.getElementById('scanDevice').value = record.result.scanDevice || '';
        document.getElementById('scanResolution').value = record.result.scanResolution || '';
        document.getElementById('scanColorMode').value = record.result.scanColorMode || '';
        document.getElementById('recSummary').value = record.result.summary || '';
        document.getElementById('recNextAdjust').value = record.result.nextAdjust || '';

        renderImagePreviews();
    }, 100);
}

// ============================================
// 标签页3：记录列表
// ============================================
function renderRecordList() {
    let records = getAllRecords();

    // 应用筛选
    const filterProcess = document.getElementById('filterProcess').value;
    const filterBrand = document.getElementById('filterBrand').value;
    const filterRating = document.getElementById('filterRating').value;
    const filterReview = document.getElementById('filterReview').value;
    const filterDateStart = document.getElementById('filterDateStart').value;
    const filterDateEnd = document.getElementById('filterDateEnd').value;
    const filterKeyword = document.getElementById('filterKeyword').value.toLowerCase();
    const sortBy = document.getElementById('sortBy').value;

    if (filterProcess) records = records.filter(r => r.processType === filterProcess);
    if (filterBrand) records = records.filter(r => r.film.brand === filterBrand);
    if (filterRating !== '') {
        const minRating = parseInt(filterRating);
        if (minRating === 0) {
            records = records.filter(r => (r.result.rating || 0) === 0);
        } else {
            records = records.filter(r => (r.result.rating || 0) >= minRating);
        }
    }
    if (filterReview === 'reviewed') records = records.filter(r => r.reviewed);
    if (filterReview === 'unreviewed') records = records.filter(r => !r.reviewed);
    if (filterDateStart) records = records.filter(r => r.date >= filterDateStart);
    if (filterDateEnd) records = records.filter(r => r.date <= filterDateEnd);
    if (filterKeyword) {
        records = records.filter(r =>
            (r.name || '').toLowerCase().includes(filterKeyword) ||
            (r.film.batch || '').toLowerCase().includes(filterKeyword) ||
            (r.notes || '').toLowerCase().includes(filterKeyword) ||
            (r.film.model || '').toLowerCase().includes(filterKeyword)
        );
    }

    // 排序
    switch (sortBy) {
        case 'date-desc': records.sort((a, b) => (b.date || '').localeCompare(a.date || '')); break;
        case 'date-asc': records.sort((a, b) => (a.date || '').localeCompare(b.date || '')); break;
        case 'rating-desc': records.sort((a, b) => (b.result.rating || 0) - (a.result.rating || 0)); break;
        case 'rating-asc': records.sort((a, b) => (a.result.rating || 0) - (b.result.rating || 0)); break;
        case 'name-asc': records.sort((a, b) => (a.name || '').localeCompare(b.name || '')); break;
    }

    // 更新流程筛选选项
    updateFilterProcessOptions();

    // 渲染列表
    const list = document.getElementById('recordList');
    document.getElementById('listInfo').textContent = `共 ${records.length} 条记录`;

    if (records.length === 0) {
        list.innerHTML = `
            <div class="empty-state" style="padding:60px 20px;">
                <svg viewBox="0 0 24 24" fill="none" width="48" height="48" style="opacity:0.3;margin-bottom:12px;"><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="1.5"/><path d="M3 9h18M9 3v18" stroke="currentColor" stroke-width="1.5"/></svg>
                <div>暂无冲洗记录，点击「新建记录」开始记录你的冲洗之旅</div>
            </div>`;
        return;
    }

    list.innerHTML = records.map(r => {
        const rating = r.result.rating || 0;
        const ratingStars = '★'.repeat(rating) + '<span class="empty">' + '★'.repeat(5 - rating) + '</span>';
        const isSelected = appState.selectedRecords.has(r.id);

        return `
            <div class="record-card ${isSelected ? 'selected' : ''}" onclick="viewRecord('${r.id}')">
                <div class="record-card-top">
                    <div class="record-card-info">
                        <div class="record-card-title">
                            <input type="checkbox" onclick="event.stopPropagation(); toggleSelectRecord('${r.id}')" ${isSelected ? 'checked' : ''} style="accent-color:var(--ice-blue);">
                            ${r.name}
                            <span class="record-card-process">${getProcessName(r.processType)}</span>
                        </div>
                        <div class="record-card-meta">
                            <span>📅 ${formatDate(r.date)}</span>
                            <span>🎬 ${r.film.brand || '未知'} ${r.film.model || ''}</span>
                            <span>🌡️ ${r.waterTemp ? r.waterTemp + '°C' : '--'}</span>
                            ${r.scene ? `<span>📍 ${r.scene}</span>` : ''}
                        </div>
                    </div>
                    <div class="record-card-rating">${ratingStars}</div>
                </div>
                <div class="record-card-bottom">
                    <div class="record-card-tags">
                        ${r.film.iso ? `<span class="record-card-tag">${r.film.iso}</span>` : ''}
                        ${r.film.type ? `<span class="record-card-tag">${r.film.type}</span>` : ''}
                        ${r.result.issues && r.result.issues.length > 0 ? `<span class="record-card-tag" style="color:var(--warn);">⚠ ${r.result.issues.length}个问题</span>` : ''}
                        ${r.result.images && r.result.images.length > 0 ? `<span class="record-card-tag">📷 ${r.result.images.length}张样张</span>` : ''}
                        <span class="review-badge ${r.reviewed ? 'done' : 'pending'}">${r.reviewed ? '已复盘' : '待复盘'}</span>
                    </div>
                    <div class="record-card-actions" onclick="event.stopPropagation();">
                        <button onclick="editRecord('${r.id}')" title="编辑">
                            <svg viewBox="0 0 24 24" fill="none" width="16" height="16"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                        </button>
                        <button onclick="printRecord('${r.id}')" title="打印">
                            <svg viewBox="0 0 24 24" fill="none" width="16" height="16"><path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v8H6z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                        </button>
                        <button onclick="exportSingleRecord('${r.id}')" title="导出">
                            <svg viewBox="0 0 24 24" fill="none" width="16" height="16"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                        </button>
                        <button class="btn-del" onclick="deleteRecord('${r.id}')" title="删除">
                            <svg viewBox="0 0 24 24" fill="none" width="16" height="16"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    // 更新批量操作栏
    updateBatchBar();
}

function updateFilterProcessOptions() {
    const select = document.getElementById('filterProcess');
    const currentVal = select.value;
    const allProcs = getAllProcesses();
    select.innerHTML = '<option value="">全部</option>' +
        allProcs.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
    select.value = currentVal;
}

function toggleSelectRecord(id) {
    if (appState.selectedRecords.has(id)) {
        appState.selectedRecords.delete(id);
    } else {
        appState.selectedRecords.add(id);
    }
    renderRecordList();
}

function updateBatchBar() {
    const bar = document.getElementById('batchBar');
    const count = appState.selectedRecords.size;
    if (count > 0) {
        bar.style.display = 'flex';
        document.getElementById('batchCount').textContent = `已选择 ${count} 条`;
    } else {
        bar.style.display = 'none';
    }
}

function clearSelection() {
    appState.selectedRecords.clear();
    renderRecordList();
}

function resetFilters() {
    document.getElementById('filterProcess').value = '';
    document.getElementById('filterBrand').value = '';
    document.getElementById('filterRating').value = '';
    document.getElementById('filterReview').value = '';
    document.getElementById('filterDateStart').value = '';
    document.getElementById('filterDateEnd').value = '';
    document.getElementById('filterKeyword').value = '';
    document.getElementById('sortBy').value = 'date-desc';
    renderRecordList();
}

function saveFilterTemplate() {
    const template = {
        process: document.getElementById('filterProcess').value,
        brand: document.getElementById('filterBrand').value,
        rating: document.getElementById('filterRating').value,
        review: document.getElementById('filterReview').value,
        dateStart: document.getElementById('filterDateStart').value,
        dateEnd: document.getElementById('filterDateEnd').value,
        keyword: document.getElementById('filterKeyword').value,
    };
    const templates = loadData(STORAGE_KEYS.filterTemplates) || [];
    templates.push({ ...template, id: generateId(), savedAt: new Date().toISOString() });
    saveData(STORAGE_KEYS.filterTemplates, templates);
    toast('筛选模板已保存', 'success');
}

// 查看记录详情
function viewRecord(id) {
    const r = getAllRecords().find(rec => rec.id === id);
    if (!r) return;

    const rating = r.result.rating || 0;
    const ratingStars = '★'.repeat(rating) + '☆'.repeat(5 - rating);

    openModal(`
        <div class="modal-header">
            <span class="modal-title">${r.name}</span>
            <button class="modal-close" onclick="closeModal()">
                <svg viewBox="0 0 24 24" fill="none" width="20" height="20"><path d="M6 6L18 18M6 18L18 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            </button>
        </div>
        <div class="modal-body" style="font-size:13px;line-height:1.8;">
            <div style="display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap;">
                <span class="record-card-process">${getProcessName(r.processType)}</span>
                <span class="record-card-tag">${formatDate(r.date)}</span>
                <span class="review-badge ${r.reviewed ? 'done' : 'pending'}">${r.reviewed ? '已复盘' : '待复盘'}</span>
                <span style="color:#ffd700;font-size:16px;">${ratingStars}</span>
            </div>

            <div style="margin-bottom:16px;">
                <strong style="color:var(--ice-blue-light);">基础信息</strong>
                <div style="color:var(--text-secondary);margin-top:4px;">
                    拍摄时间：${formatDate(r.shootDate)} | 场景：${r.scene || '--'}<br>
                    室温：${r.roomTemp || '--'}°C | 水温：${r.waterTemp || '--'}°C | 湿度：${r.humidity || '--'}%
                </div>
            </div>

            <div style="margin-bottom:16px;">
                <strong style="color:var(--ice-blue-light);">胶卷信息</strong>
                <div style="color:var(--text-secondary);margin-top:4px;">
                    ${r.film.brand || '--'} ${r.film.model || ''} | ${r.film.type || '--'} | ${r.film.iso || '--'}<br>
                    批次：${r.film.batch || '--'} | 有效期：${formatDate(r.film.expiry)} | 张数：${r.film.shots || '--'}
                </div>
            </div>

            ${r.equipment && r.equipment.length > 0 ? `
            <div style="margin-bottom:16px;">
                <strong style="color:var(--ice-blue-light);">使用设备</strong>
                <div style="color:var(--text-secondary);margin-top:4px;">
                    ${r.equipment.map(e => `${e.type}: ${e.model || '--'} (${e.status})`).join('<br>')}
                </div>
            </div>` : ''}

            ${r.chemicals && r.chemicals.length > 0 ? `
            <div style="margin-bottom:16px;">
                <strong style="color:var(--ice-blue-light);">药水信息</strong>
                <div style="color:var(--text-secondary);margin-top:4px;">
                    ${r.chemicals.map(c => `${c.type}: ${c.brand || '--'} ${c.ratio ? '(' + c.ratio + ')' : ''} ${c.usage}`).join('<br>')}
                </div>
            </div>` : ''}

            ${r.steps && r.steps.length > 0 ? `
            <div style="margin-bottom:16px;">
                <strong style="color:var(--ice-blue-light);">冲洗步骤</strong>
                <table style="width:100%;margin-top:4px;font-size:12px;color:var(--text-secondary);">
                    <thead><tr style="text-align:left;color:var(--text-tertiary);"><th>步骤</th><th>时长</th><th>温度</th><th>震荡</th></tr></thead>
                    <tbody>
                        ${r.steps.map(s => `<tr><td>${s.name || '--'}</td><td>${formatDuration(s.duration)}</td><td>${s.temp ? s.temp + '°C' : '--'}</td><td>${s.agitation || '--'}</td></tr>`).join('')}
                    </tbody>
                </table>
            </div>` : ''}

            <div style="margin-bottom:16px;">
                <strong style="color:var(--ice-blue-light);">成片效果</strong>
                <div style="color:var(--text-secondary);margin-top:4px;">
                    对比度：${r.result.contrast || '--'} | 锐度：${r.result.sharpness || '--'} | 颗粒：${r.result.grain || '--'}<br>
                    色彩：${r.result.saturation || '--'} | 曝光：${r.result.exposure || '--'}
                    ${r.result.issues && r.result.issues.length > 0 ? `<br>问题：${r.result.issues.join('、')}` : ''}
                </div>
            </div>

            ${r.result.images && r.result.images.length > 0 ? `
            <div style="margin-bottom:16px;">
                <strong style="color:var(--ice-blue-light);">成片样张</strong>
                <div class="image-preview-grid" style="margin-top:8px;">
                    ${r.result.images.map(imgId => `<div class="image-preview-item"><img data-img-id="${imgId}" alt="样张"></div>`).join('')}
                </div>
            </div>` : ''}

            ${r.result.summary ? `
            <div style="margin-bottom:16px;">
                <strong style="color:var(--ice-blue-light);">优化总结</strong>
                <div style="color:var(--text-secondary);margin-top:4px;">${r.result.summary}</div>
            </div>` : ''}

            ${r.result.nextAdjust ? `
            <div style="margin-bottom:16px;">
                <strong style="color:var(--ice-blue-light);">下次调整方案</strong>
                <div style="color:var(--text-secondary);margin-top:4px;">${r.result.nextAdjust}</div>
            </div>` : ''}

            ${r.notes ? `
            <div style="margin-bottom:16px;">
                <strong style="color:var(--ice-blue-light);">备注</strong>
                <div style="color:var(--text-secondary);margin-top:4px;">${r.notes}</div>
            </div>` : ''}
        </div>
        <div class="modal-footer">
            <button class="btn btn-outline" onclick="printRecord('${r.id}')">打印</button>
            <button class="btn btn-outline" onclick="exportSingleRecord('${r.id}')">导出</button>
            <button class="btn btn-primary" onclick="closeModal(); editRecord('${r.id}')">编辑</button>
        </div>
    `);
    // 异步加载 IndexedDB 中的图片
    loadImagesIntoDOM(document.getElementById('modalContainer'));
}

// 删除记录
function deleteRecord(id) {
    openModal(`
        <div class="modal-header">
            <span class="modal-title">确认删除</span>
            <button class="modal-close" onclick="closeModal()">
                <svg viewBox="0 0 24 24" fill="none" width="20" height="20"><path d="M6 6L18 18M6 18L18 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            </button>
        </div>
        <div class="modal-body">
            <p style="font-size:14px;">确定要删除此冲洗记录吗？删除后可在短期内恢复。</p>
        </div>
        <div class="modal-footer">
            <button class="btn btn-ghost" onclick="closeModal()">取消</button>
            <button class="btn btn-danger-outline" onclick="confirmDeleteRecord('${id}')">确认删除</button>
        </div>
    `);
}

function confirmDeleteRecord(id) {
    const record = getAllRecords().find(r => r.id === id);
    // 清理 IndexedDB 中的图片
    if (record && record.result && record.result.images) {
        record.result.images.forEach(imgId => {
            if (imgId && !imgId.startsWith('data:')) {
                dbDelete(IMG_STORE, imgId).catch(e => console.error('Failed to delete image:', imgId));
            }
        });
    }
    let records = getAllRecords();
    records = records.filter(r => r.id !== id);
    saveData(STORAGE_KEYS.records, records);
    appState.selectedRecords.delete(id);
    closeModal();
    renderRecordList();
    renderSidebarStats();
    toast('记录已删除', 'success');
}

function batchDelete() {
    if (appState.selectedRecords.size === 0) return;
    openModal(`
        <div class="modal-header">
            <span class="modal-title">批量删除</span>
            <button class="modal-close" onclick="closeModal()">
                <svg viewBox="0 0 24 24" fill="none" width="20" height="20"><path d="M6 6L18 18M6 18L18 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            </button>
        </div>
        <div class="modal-body">
            <p style="font-size:14px;">确定要删除选中的 ${appState.selectedRecords.size} 条记录吗？</p>
        </div>
        <div class="modal-footer">
            <button class="btn btn-ghost" onclick="closeModal()">取消</button>
            <button class="btn btn-danger-outline" onclick="confirmBatchDelete()">确认删除</button>
        </div>
    `);
}

function confirmBatchDelete() {
    // 清理被删除记录的图片
    const allRecords = getAllRecords();
    appState.selectedRecords.forEach(id => {
        const r = allRecords.find(rec => rec.id === id);
        if (r && r.result && r.result.images) {
            r.result.images.forEach(imgId => {
                if (imgId && !imgId.startsWith('data:')) {
                    dbDelete(IMG_STORE, imgId).catch(e => console.error('Failed to delete image:', imgId));
                }
            });
        }
    });
    let records = allRecords.filter(r => !appState.selectedRecords.has(r.id));
    saveData(STORAGE_KEYS.records, records);
    appState.selectedRecords.clear();
    closeModal();
    renderRecordList();
    toast('批量删除完成', 'success');
}

// ============================================
// 标签页4：物料库存管理
// ============================================
function switchInvTab(tab) {
    appState.currentInvTab = tab;
    document.querySelectorAll('.inv-tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`.inv-tab[data-inv="${tab}"]`).classList.add('active');
    document.querySelectorAll('.inv-content').forEach(c => c.classList.remove('active'));
    document.getElementById('inv-' + tab).classList.add('active');
}

function renderInventory() {
    const inv = getAllInventory();
    renderFilmInventory(inv.film || []);
    renderChemicalInventory(inv.chemical || []);
    renderEquipmentInventory(inv.equipment || []);
}

function renderFilmInventory(films) {
    const grid = document.getElementById('filmInventory');
    if (films.length === 0) {
        grid.innerHTML = '<div class="empty-state" style="grid-column:1/-1;">暂无胶卷库存，点击「添加胶卷」开始记录</div>';
        return;
    }
    grid.innerHTML = films.map(f => {
        const isExpired = f.expiry && new Date(f.expiry) < new Date();
        const isLowStock = (f.quantity || 0) <= 1;
        return `
            <div class="inv-card">
                <div class="inv-card-header">
                    <span class="inv-card-title">${f.brand || '未知'} ${f.model || ''}</span>
                    <span class="status-badge ${isExpired ? 'expired' : isLowStock ? 'warn' : 'ok'}">
                        ${isExpired ? '已过期' : isLowStock ? '库存低' : '正常'}
                    </span>
                </div>
                <div class="inv-card-body">
                    <div class="inv-card-row"><span class="label">类型</span><span class="value">${f.type || '--'}</span></div>
                    <div class="inv-card-row"><span class="label">感光度</span><span class="value">${f.iso || '--'}</span></div>
                    <div class="inv-card-row"><span class="label">库存数量</span><span class="value">${f.quantity || 0} 卷</span></div>
                    <div class="inv-card-row"><span class="label">有效期</span><span class="value">${formatDate(f.expiry)}</span></div>
                    <div class="inv-card-row"><span class="label">存放环境</span><span class="value">${f.storageEnv || '--'}</span></div>
                </div>
                <div class="inv-card-footer">
                    <button onclick="editInvItem('film', '${f.id}')">编辑</button>
                    <button class="del" onclick="deleteInvItem('film', '${f.id}')">删除</button>
                </div>
            </div>
        `;
    }).join('');
}

function renderChemicalInventory(chemicals) {
    const grid = document.getElementById('chemicalInventory');
    if (chemicals.length === 0) {
        grid.innerHTML = '<div class="empty-state" style="grid-column:1/-1;">暂无药水库存，点击「添加药水」开始记录</div>';
        return;
    }
    grid.innerHTML = chemicals.map(c => {
        const isExpired = c.expiry && new Date(c.expiry) < new Date();
        const isNearExpiry = c.expiry && new Date(c.expiry) - new Date() < 15 * 86400000 && !isExpired;
        return `
            <div class="inv-card">
                <div class="inv-card-header">
                    <span class="inv-card-title">${c.type || '未知'} ${c.brand || ''}</span>
                    <span class="status-badge ${isExpired ? 'expired' : isNearExpiry ? 'warn' : 'ok'}">
                        ${isExpired ? '已过期' : isNearExpiry ? '即将过期' : '正常'}
                    </span>
                </div>
                <div class="inv-card-body">
                    <div class="inv-card-row"><span class="label">批次号</span><span class="value">${c.batch || '--'}</span></div>
                    <div class="inv-card-row"><span class="label">配比</span><span class="value">${c.ratio || '--'}</span></div>
                    <div class="inv-card-row"><span class="label">已用次数</span><span class="value">${c.useCount || 0} 次</span></div>
                    <div class="inv-card-row"><span class="label">配制日期</span><span class="value">${formatDate(c.prepDate)}</span></div>
                    <div class="inv-card-row"><span class="label">有效期</span><span class="value">${formatDate(c.expiry)}</span></div>
                </div>
                <div class="inv-card-footer">
                    <button onclick="editInvItem('chemical', '${c.id}')">编辑</button>
                    <button class="del" onclick="deleteInvItem('chemical', '${c.id}')">删除</button>
                </div>
            </div>
        `;
    }).join('');
}

function renderEquipmentInventory(equipments) {
    const grid = document.getElementById('equipmentInventory');
    if (equipments.length === 0) {
        grid.innerHTML = '<div class="empty-state" style="grid-column:1/-1;">暂无设备记录，点击「添加设备」开始记录</div>';
        return;
    }
    grid.innerHTML = equipments.map(e => {
        const statusClass = e.status === '正常' ? 'ok' : e.status === '轻微损耗' ? 'warn' : 'danger';
        return `
            <div class="inv-card">
                <div class="inv-card-header">
                    <span class="inv-card-title">${e.type || '未知'} ${e.model || ''}</span>
                    <span class="status-badge ${statusClass}">${e.status || '正常'}</span>
                </div>
                <div class="inv-card-body">
                    <div class="inv-card-row"><span class="label">购入时间</span><span class="value">${formatDate(e.purchaseDate)}</span></div>
                    <div class="inv-card-row"><span class="label">最近保养</span><span class="value">${formatDate(e.lastMaintenance)}</span></div>
                    <div class="inv-card-row"><span class="label">保养周期</span><span class="value">${e.maintenanceCycle || '--'} 个月</span></div>
                    ${e.notes ? `<div class="inv-card-row"><span class="label">备注</span><span class="value">${e.notes}</span></div>` : ''}
                </div>
                <div class="inv-card-footer">
                    <button onclick="editInvItem('equipment', '${e.id}')">编辑</button>
                    <button class="del" onclick="deleteInvItem('equipment', '${e.id}')">删除</button>
                </div>
            </div>
        `;
    }).join('');
}

function openInvModal(type, id) {
    const inv = getAllInventory();
    const editing = id ? (inv[type] || []).find(i => i.id === id) : null;

    let fields = '';
    if (type === 'film') {
        fields = `
            <div class="form-field"><label>品牌</label><select id="invBrand"><option value="">请选择</option><option value="柯达 Kodak">柯达</option><option value="富士 Fujifilm">富士</option><option value="伊尔福 Ilford">伊尔福</option><option value="乐凯 Lucky">乐凯</option><option value="其他">其他</option></select></div>
            <div class="form-field"><label>型号</label><input type="text" id="invModel" placeholder="如：HP5"></div>
            <div class="form-field"><label>类型</label><select id="invType"><option value="">请选择</option><option value="黑白负片">黑白负片</option><option value="彩色负片">彩色负片</option><option value="彩色反转片">彩色反转片</option></select></div>
            <div class="form-field"><label>感光度</label><select id="invIso"><option value="">请选择</option><option value="ISO 100">ISO 100</option><option value="ISO 200">ISO 200</option><option value="ISO 400">ISO 400</option><option value="ISO 800">ISO 800</option><option value="其他">其他</option></select></div>
            <div class="form-field"><label>库存数量</label><input type="number" id="invQuantity" value="1"></div>
            <div class="form-field"><label>有效期</label><input type="date" id="invExpiry"></div>
            <div class="form-field"><label>批次号</label><input type="text" id="invBatch"></div>
            <div class="form-field"><label>存放环境</label><input type="text" id="invStorageEnv" placeholder="如：冰箱冷藏"></div>
        `;
    } else if (type === 'chemical') {
        fields = `
            <div class="form-field"><label>药水类型</label><select id="invType"><option value="">请选择</option><option value="显影液">显影液</option><option value="停影液">停影液</option><option value="定影液">定影液</option><option value="漂白液">漂白液</option><option value="稳定液">稳定液</option><option value="润湿剂">润湿剂</option><option value="彩色显影液">彩色显影液</option><option value="反转液">反转液</option></select></div>
            <div class="form-field"><label>品牌型号</label><input type="text" id="invBrand" placeholder="如：Kodak D-76"></div>
            <div class="form-field"><label>批次号</label><input type="text" id="invBatch"></div>
            <div class="form-field"><label>配比比例</label><input type="text" id="invRatio" placeholder="如：1+1"></div>
            <div class="form-field"><label>配制日期</label><input type="date" id="invPrepDate"></div>
            <div class="form-field"><label>有效期</label><input type="date" id="invExpiry"></div>
            <div class="form-field"><label>已用次数</label><input type="number" id="invUseCount" value="0"></div>
            <div class="form-field"><label>保存方式</label><input type="text" id="invStorageEnv" placeholder="如：避光阴凉处"></div>
        `;
    } else {
        fields = `
            <div class="form-field"><label>设备类型</label><select id="invType"><option value="">请选择</option>${EQUIPMENT_TYPES.map(t => `<option value="${t}">${t}</option>`).join('')}</select></div>
            <div class="form-field"><label>设备型号</label><input type="text" id="invModel" placeholder="如：Paterson Universal"></div>
            <div class="form-field"><label>设备状态</label><select id="invStatus"><option value="正常">正常</option><option value="轻微损耗">轻微损耗</option><option value="需检修">需检修</option></select></div>
            <div class="form-field"><label>购入时间</label><input type="date" id="invPurchaseDate"></div>
            <div class="form-field"><label>最近保养</label><input type="date" id="invLastMaintenance"></div>
            <div class="form-field"><label>保养周期(月)</label><input type="number" id="invMaintenanceCycle" value="6"></div>
            <div class="form-field"><label>备注</label><input type="text" id="invNotes"></div>
        `;
    }

    // 填充编辑值
    setTimeout(() => {
        if (editing) {
            Object.keys(editing).forEach(key => {
                const el = document.getElementById('inv' + key.charAt(0).toUpperCase() + key.slice(1));
                if (el) el.value = editing[key] || '';
            });
        }
    }, 50);

    openModal(`
        <div class="modal-header">
            <span class="modal-title">${editing ? '编辑' : '添加'}${type === 'film' ? '胶卷' : type === 'chemical' ? '药水' : '设备'}</span>
            <button class="modal-close" onclick="closeModal()">
                <svg viewBox="0 0 24 24" fill="none" width="20" height="20"><path d="M6 6L18 18M6 18L18 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            </button>
        </div>
        <div class="modal-body">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">${fields}</div>
        </div>
        <div class="modal-footer">
            <button class="btn btn-ghost" onclick="closeModal()">取消</button>
            <button class="btn btn-primary" onclick="saveInvItem('${type}', '${id || ''}')">保存</button>
        </div>
    `);
}

function saveInvItem(type, id) {
    const inv = getAllInventory();
    if (!inv[type]) inv[type] = [];

    const item = { id: id || generateId() };

    // 收集表单数据
    const fields = type === 'film'
        ? ['brand', 'model', 'type', 'iso', 'quantity', 'expiry', 'batch', 'storageEnv']
        : type === 'chemical'
        ? ['type', 'brand', 'batch', 'ratio', 'prepDate', 'expiry', 'useCount', 'storageEnv']
        : ['type', 'model', 'status', 'purchaseDate', 'lastMaintenance', 'maintenanceCycle', 'notes'];

    fields.forEach(f => {
        const el = document.getElementById('inv' + f.charAt(0).toUpperCase() + f.slice(1));
        if (el) {
            item[f] = el.value;
            if (['quantity', 'useCount', 'maintenanceCycle'].includes(f)) {
                item[f] = parseInt(el.value) || 0;
            }
        }
    });

    if (id) {
        const idx = inv[type].findIndex(i => i.id === id);
        if (idx >= 0) inv[type][idx] = item;
    } else {
        inv[type].push(item);
    }

    saveData(STORAGE_KEYS.inventory, inv);
    closeModal();
    renderInventory();
    toast(id ? '已更新' : '已添加', 'success');
}

function editInvItem(type, id) {
    openInvModal(type, id);
}

function deleteInvItem(type, id) {
    openModal(`
        <div class="modal-header">
            <span class="modal-title">确认删除</span>
            <button class="modal-close" onclick="closeModal()">
                <svg viewBox="0 0 24 24" fill="none" width="20" height="20"><path d="M6 6L18 18M6 18L18 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            </button>
        </div>
        <div class="modal-body"><p style="font-size:14px;">确定要删除此条目吗？</p></div>
        <div class="modal-footer">
            <button class="btn btn-ghost" onclick="closeModal()">取消</button>
            <button class="btn btn-danger-outline" onclick="confirmDeleteInv('${type}', '${id}')">确认删除</button>
        </div>
    `);
}

function confirmDeleteInv(type, id) {
    const inv = getAllInventory();
    inv[type] = (inv[type] || []).filter(i => i.id !== id);
    saveData(STORAGE_KEYS.inventory, inv);
    closeModal();
    renderInventory();
    toast('已删除', 'success');
}

// ============================================
// 通知系统
// ============================================
function addNotification(type, title, desc, refId) {
    const notifs = getNotifications();
    notifs.unshift({
        id: generateId(),
        type,
        title,
        desc,
        refId: refId || null,
        read: false,
        createdAt: new Date().toISOString(),
    });
    // 限制最多100条
    if (notifs.length > 100) notifs.length = 100;
    saveData(STORAGE_KEYS.notifications, notifs);
    updateNotifBadge();
}

function updateNotifBadge() {
    const unread = getNotifications().filter(n => !n.read).length;
    const badge = document.getElementById('navNotifBadge');
    const topbarDot = document.getElementById('topbarNotifDot');
    const bottomNavDot = document.getElementById('bottomNavNotifDot');
    if (unread > 0) {
        if (badge) { badge.style.display = 'inline-block'; badge.textContent = unread > 99 ? '99+' : unread; }
        if (topbarDot) topbarDot.style.display = 'block';
        if (bottomNavDot) bottomNavDot.style.display = 'block';
    } else {
        if (badge) badge.style.display = 'none';
        if (topbarDot) topbarDot.style.display = 'none';
        if (bottomNavDot) bottomNavDot.style.display = 'none';
    }
    renderSidebarStats();
}

function renderNotifications() {
    let notifs = getNotifications();
    const filter = appState.currentNotifFilter;

    if (filter === 'unread') notifs = notifs.filter(n => !n.read);
    else if (filter !== 'all') notifs = notifs.filter(n => n.type === filter);

    const list = document.getElementById('notifList');
    if (notifs.length === 0) {
        list.innerHTML = '<div class="empty-state" style="padding:60px 20px;">暂无消息通知</div>';
        return;
    }

    const icons = {
        chemical: '<svg viewBox="0 0 24 24" fill="none" width="18" height="18"><path d="M9 2v6L4 20a2 2 0 002 2h12a2 2 0 002-2L15 8V2M9 2h6M9 14h6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        equipment: '<svg viewBox="0 0 24 24" fill="none" width="18" height="18"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        review: '<svg viewBox="0 0 24 24" fill="none" width="18" height="18"><path d="M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        stock: '<svg viewBox="0 0 24 24" fill="none" width="18" height="18"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82zM7 7h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        cleaning: '<svg viewBox="0 0 24 24" fill="none" width="18" height="18"><path d="M3 21h18M5 21V11l4-4h6l4 4v10M9 21v-6h6v6M9 7V3h6v4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    };

    list.innerHTML = notifs.map(n => `
        <div class="notif-item ${n.read ? '' : 'unread'}" onclick="markNotifRead('${n.id}')">
            <div class="notif-icon ${n.type}">${icons[n.type] || ''}</div>
            <div class="notif-content">
                <div class="notif-title">${n.title}</div>
                <div class="notif-desc">${n.desc}</div>
                <div class="notif-time">${formatTimeAgo(n.createdAt)}</div>
            </div>
            <div class="notif-actions">
                ${n.refId ? `<button onclick="event.stopPropagation(); closeModal(); viewRecord('${n.refId}')" title="查看记录"><svg viewBox="0 0 24 24" fill="none" width="14" height="14"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/></svg></button>` : ''}
                <button onclick="event.stopPropagation(); deleteNotif('${n.id}')" title="删除"><svg viewBox="0 0 24 24" fill="none" width="14" height="14"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
            </div>
        </div>
    `).join('');
}

function filterNotifications(filter) {
    appState.currentNotifFilter = filter;
    document.querySelectorAll('.notif-tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`.notif-tab[data-filter="${filter}"]`).classList.add('active');
    renderNotifications();
}

function markNotifRead(id) {
    const notifs = getNotifications();
    const n = notifs.find(x => x.id === id);
    if (n) { n.read = true; saveData(STORAGE_KEYS.notifications, notifs); }
    renderNotifications();
    updateNotifBadge();
}

function markAllRead() {
    const notifs = getNotifications();
    notifs.forEach(n => n.read = true);
    saveData(STORAGE_KEYS.notifications, notifs);
    renderNotifications();
    updateNotifBadge();
    toast('已全部标记为已读', 'success');
}

function deleteNotif(id) {
    let notifs = getNotifications();
    notifs = notifs.filter(n => n.id !== id);
    saveData(STORAGE_KEYS.notifications, notifs);
    renderNotifications();
    updateNotifBadge();
}

function clearAllNotifications() {
    openModal(`
        <div class="modal-header">
            <span class="modal-title">清空消息</span>
            <button class="modal-close" onclick="closeModal()">
                <svg viewBox="0 0 24 24" fill="none" width="20" height="20"><path d="M6 6L18 18M6 18L18 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            </button>
        </div>
        <div class="modal-body"><p style="font-size:14px;">确定要清空所有消息通知吗？</p></div>
        <div class="modal-footer">
            <button class="btn btn-ghost" onclick="closeModal()">取消</button>
            <button class="btn btn-danger-outline" onclick="confirmClearNotifs()">确认清空</button>
        </div>
    `);
}

function confirmClearNotifs() {
    saveData(STORAGE_KEYS.notifications, []);
    closeModal();
    renderNotifications();
    updateNotifBadge();
    toast('消息已清空', 'success');
}

// 自动生成通知
function generateAutoNotifications() {
    const inv = getAllInventory();
    const settings = getSettings();
    const expireDays = parseInt(settings.chemExpireDays) || 15;
    const now = new Date();
    const notifs = getNotifications();

    // 药水过期提醒
    (inv.chemical || []).forEach(c => {
        if (c.expiry) {
            const days = Math.floor((new Date(c.expiry) - now) / 86400000);
            if (days <= expireDays && days >= 0) {
                const exists = notifs.some(n => n.type === 'chemical' && n.desc.includes(c.batch || c.brand));
                if (!exists) {
                    addNotification('chemical', '药水即将过期', `药水「${c.type} ${c.brand || ''}」将在${days}天后过期，批次：${c.batch || '--'}`);
                }
            } else if (days < 0) {
                const exists = notifs.some(n => n.type === 'chemical' && n.desc.includes(c.batch || c.brand) && n.desc.includes('已过期'));
                if (!exists) {
                    addNotification('chemical', '药水已过期', `药水「${c.type} ${c.brand || ''}」已过期${Math.abs(days)}天，建议更换，批次：${c.batch || '--'}`);
                }
            }
        }
    });

    // 库存预警
    (inv.film || []).forEach(f => {
        if ((f.quantity || 0) <= 1) {
            const exists = notifs.some(n => n.type === 'stock' && n.desc.includes(f.model || f.brand));
            if (!exists) {
                addNotification('stock', '胶卷库存预警', `胶卷「${f.brand || ''} ${f.model || ''}」库存仅剩${f.quantity || 0}卷，请及时补货`);
            }
        }
    });

    // 设备保养提醒
    (inv.equipment || []).forEach(e => {
        if (e.lastMaintenance && e.maintenanceCycle) {
            const lastDate = new Date(e.lastMaintenance);
            const nextDate = new Date(lastDate);
            nextDate.setMonth(nextDate.getMonth() + parseInt(e.maintenanceCycle));
            const daysToMaintenance = Math.floor((nextDate - now) / 86400000);
            if (daysToMaintenance <= 7 && daysToMaintenance >= 0) {
                const exists = notifs.some(n => n.type === 'equipment' && n.desc.includes(e.model || e.type));
                if (!exists) {
                    addNotification('equipment', '设备保养提醒', `设备「${e.type || ''} ${e.model || ''}」即将到达保养周期，请在${daysToMaintenance}天内进行保养`);
                }
            }
        }
    });
}

// ============================================
// 设置
// ============================================
function saveSettings() {
    const settings = getSettings();
    settings.chemExpireDays = document.getElementById('settingChemExpire')?.value || '15';
    // 保存个性化开关
    const animEl = document.getElementById('settingAnimations');
    if (animEl) settings.animations = animEl.checked;
    const soundEl = document.getElementById('settingTimerSound');
    if (soundEl) settings.timerSound = soundEl.checked;
    const warnEl = document.getElementById('settingContaminationWarning');
    if (warnEl) settings.contaminationWarning = warnEl.checked;
    // 保存其他开关（保留兼容性）
    document.querySelectorAll('.settings-card .toggle input').forEach((input, idx) => {
        settings['toggle_' + idx] = input.checked;
    });
    saveData(STORAGE_KEYS.settings, settings);
    toast('设置已保存', 'success');
}

async function exportBackup() {
    toast('正在准备备份数据...', 'info');
    const records = getAllRecords();
    const inventory = getAllInventory();
    const recipes = getCustomRecipes();
    const profile = getProfile();
    const settings = getSettings();
    const timers = loadData(STORAGE_KEYS.timers) || [];

    // 收集 IndexedDB 中的所有图片
    const imageKeys = await dbGetAllKeys(IMG_STORE);
    const images = {};
    for (const key of imageKeys) {
        try {
            const data = await dbGet(IMG_STORE, key);
            if (data) images[key] = data;
        } catch (e) { console.error('Failed to read image:', key); }
    }

    const backup = {
        records, inventory, recipes, profile, settings, timers,
        images,
        exportDate: new Date().toISOString(),
        version: 2, // v2 = IndexedDB 图片分离存储
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `filmlab-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast(`备份已导出（含 ${imageKeys.length} 张图片）`, 'success');
}

function importBackup() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async (ev) => {
            try {
                const backup = JSON.parse(ev.target.result);
                if (backup.records) saveData(STORAGE_KEYS.records, backup.records);
                if (backup.inventory) saveData(STORAGE_KEYS.inventory, backup.inventory);
                if (backup.customProcesses) saveData(STORAGE_KEYS.customProcesses, backup.customProcesses);
                if (backup.notifications) saveData(STORAGE_KEYS.notifications, backup.notifications);
                if (backup.settings) saveData(STORAGE_KEYS.settings, backup.settings);
                if (backup.recipes) saveData(STORAGE_KEYS.recipes, backup.recipes);
                if (backup.profile) saveData(STORAGE_KEYS.profile, backup.profile);
                if (backup.timers) saveData(STORAGE_KEYS.timers, backup.timers);
                // 恢复图片到 IndexedDB
                if (backup.images) {
                    let imgCount = 0;
                    for (const [id, data] of Object.entries(backup.images)) {
                        try { await dbPut(IMG_STORE, { id, data }); imgCount++; } catch(e) { console.error('Failed to restore image:', id); }
                    }
                    toast(`数据恢复成功（含 ${imgCount} 张图片）`, 'success');
                } else {
                    toast('数据恢复成功', 'success');
                }
                // 如果是 v1 备份（图片内嵌为 base64），执行迁移
                if (!backup.version || backup.version < 2) {
                    setTimeout(() => migrateBase64Images().then(migrated => {
                        if (migrated) toast('已自动迁移旧版图片到 IndexedDB', 'info');
                    }), 500);
                }
                location.reload();
            } catch (err) {
                console.error('Import error:', err);
                toast('文件格式错误，恢复失败: ' + err.message, 'error');
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

function clearAllData() {
    openModal(`
        <div class="modal-header">
            <span class="modal-title">⚠️ 危险操作</span>
            <button class="modal-close" onclick="closeModal()">
                <svg viewBox="0 0 24 24" fill="none" width="20" height="20"><path d="M6 6L18 18M6 18L18 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            </button>
        </div>
        <div class="modal-body">
            <p style="font-size:14px;color:var(--danger);font-weight:600;margin-bottom:8px;">此操作将永久删除所有数据，不可恢复！</p>
            <p style="font-size:13px;color:var(--text-secondary);">包括：所有冲洗记录、物料库存、自定义流程、通知消息、个人设置</p>
            <p style="font-size:13px;color:var(--warn);margin-top:12px;">建议先导出备份再执行此操作。</p>
        </div>
        <div class="modal-footer">
            <button class="btn btn-ghost" onclick="closeModal()">取消</button>
            <button class="btn btn-danger-outline" onclick="confirmClearAll()">确认清空全部数据</button>
        </div>
    `);
}

function confirmClearAll() {
    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
    // 同时清空 IndexedDB 图片存储
    openDB().then(db => {
        try {
            const tx = db.transaction(IMG_STORE, 'readwrite');
            tx.objectStore(IMG_STORE).clear();
            tx.oncomplete = () => console.log('[FilmLab] IndexedDB 图片已清空');
        } catch(e) { console.error('Clear IndexedDB failed:', e); }
    }).catch(e => console.error('DB open failed:', e));
    closeModal();
    toast('全部数据已清除', 'success');
    setTimeout(() => location.reload(), 1000);
}

// ============================================
// 导出与打印
// ============================================
function exportSingleRecord(id) {
    const record = getAllRecords().find(r => r.id === id);
    if (!record) return;
    exportRecordsToCSV([record]);
}

function exportAllRecords() {
    const records = getAllRecords();
    if (records.length === 0) { toast('暂无记录可导出', 'error'); return; }
    exportRecordsToCSV(records);
}

function batchExport() {
    const records = getAllRecords().filter(r => appState.selectedRecords.has(r.id));
    exportRecordsToCSV(records);
}

function exportRecordsToCSV(records) {
    const headers = ['记录ID', '记录名称', '冲洗流程', '冲洗日期', '开始时间', '结束时间', '拍摄时间', '拍摄场景',
        '室温', '水温', '湿度', '胶卷品牌', '胶卷型号', '胶卷类型', '感光度', '胶卷批次', '有效期', '拍摄张数',
        '设备异常', '评分', '对比度', '锐度', '颗粒感', '色彩饱和度', '曝光准确度', '问题记录',
        '扫描设备', '扫描分辨率', '扫描色彩模式', '优化总结', '下次调整', '备注', '是否复盘', '创建时间'];

    const rows = records.map(r => [
        r.id, r.name, getProcessName(r.processType), r.date, r.startTime, r.endTime, r.shootDate, r.scene,
        r.roomTemp, r.waterTemp, r.humidity, r.film.brand, r.film.model, r.film.type, r.film.iso,
        r.film.batch, r.film.expiry, r.film.shots,
        r.equipmentIssue, r.result.rating, r.result.contrast, r.result.sharpness, r.result.grain,
        r.result.saturation, r.result.exposure, (r.result.issues || []).join('/'),
        r.result.scanDevice, r.result.scanResolution, r.result.scanColorMode,
        r.result.summary, r.result.nextAdjust, r.notes, r.reviewed ? '是' : '否', r.createdAt
    ]);

    const csv = '\uFEFF' + [headers, ...rows].map(row =>
        row.map(cell => `"${String(cell || '').replace(/"/g, '""')}"`).join(',')
    ).join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `filmlab-records-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast(`已导出 ${records.length} 条记录`, 'success');
}

function printRecord(id) {
    const record = getAllRecords().find(r => r.id === id);
    if (!record) return;
    printRecords([record]);
}

function batchPrint() {
    const records = getAllRecords().filter(r => appState.selectedRecords.has(r.id));
    printRecords(records);
}

function printRecords(records) {
    const printWindow = window.open('', '_blank');
    printWindow.document.write('<html><head><meta charset="UTF-8"><title>加载中...</title></head><body style="font-family:sans-serif;padding:40px;color:#888;">正在加载打印数据...</body></html>');
    printWindow.document.close();
    // 异步加载图片后生成 HTML
    prepareRecordsForPrint(records).then(enrichedRecords => {
        const html = generatePrintHTML(enrichedRecords);
        printWindow.document.open();
        printWindow.document.write(html);
        printWindow.document.close();
        setTimeout(() => { printWindow.print(); }, 500);
    }).catch(e => {
        console.error('Print preparation failed:', e);
        printWindow.document.body.textContent = '打印失败: ' + e.message;
    });
}

// 将记录中的图片 ID 替换为实际 base64 数据（用于打印/导出）
async function prepareRecordsForPrint(records) {
    const enriched = [];
    for (const r of records) {
        const copy = JSON.parse(JSON.stringify(r));
        if (copy.result && copy.result.images && copy.result.images.length > 0) {
            const resolvedImages = [];
            for (const imgId of copy.result.images) {
                if (imgId && imgId.startsWith('data:')) {
                    resolvedImages.push(imgId); // 旧数据，直接使用
                } else if (imgId) {
                    try {
                        const data = await dbGet(IMG_STORE, imgId);
                        resolvedImages.push(data || '');
                    } catch (e) {
                        resolvedImages.push('');
                    }
                }
            }
            copy.result.images = resolvedImages;
        }
        enriched.push(copy);
    }
    return enriched;
}

function generatePrintHTML(records) {
    return `
        <!DOCTYPE html>
        <html><head><meta charset="UTF-8">
        <title>冲洗日志 - ${new Date().toLocaleDateString()}</title>
        <style>
            * { margin:0; padding:0; box-sizing:border-box; }
            body { font-family: "Microsoft YaHei", sans-serif; padding: 30px; color: #222; background:#fff; }
            h1 { font-size: 22px; text-align:center; margin-bottom: 6px; }
            .subtitle { text-align:center; color:#888; font-size:12px; margin-bottom:24px; }
            .record { border: 1.5px solid #333; border-radius: 8px; padding: 20px; margin-bottom: 20px; page-break-inside: avoid; }
            .record-header { display:flex; justify-content:space-between; align-items:center; border-bottom: 2px solid #207cff; padding-bottom: 10px; margin-bottom: 14px; }
            .record-header h2 { font-size: 16px; }
            .record-header .process { background: #207cff; color: #fff; padding: 3px 10px; border-radius: 4px; font-size: 11px; }
            .section { margin-bottom: 14px; }
            .section-title { font-size: 13px; font-weight: 700; color: #207cff; margin-bottom: 6px; border-left: 3px solid #207cff; padding-left: 8px; }
            .info-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; font-size: 12px; }
            .info-item { display: flex; gap: 4px; }
            .info-item .label { color: #888; min-width: 60px; }
            table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 4px; }
            th, td { border: 1px solid #ddd; padding: 5px 8px; text-align: left; }
            th { background: #f5f5f5; font-weight: 600; }
            .rating { color: #f0a000; font-size: 16px; }
            .images { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 8px; }
            .images img { width: 120px; height: 120px; object-fit: cover; border-radius: 4px; border: 1px solid #ddd; }
            .footer { text-align:center; color:#aaa; font-size:10px; margin-top:20px; border-top:1px solid #eee; padding-top:10px; }
        </style></head><body>
        <h1>FilmLab 冲洗日志</h1>
        <div class="subtitle">导出于 ${new Date().toLocaleString()} | 共 ${records.length} 条记录</div>
        ${records.map(r => {
            const rating = r.result.rating || 0;
            return `
            <div class="record">
                <div class="record-header">
                    <h2>${r.name}</h2>
                    <span class="process">${getProcessName(r.processType)}</span>
                </div>
                <div class="section">
                    <div class="section-title">基础信息</div>
                    <div class="info-grid">
                        <div class="info-item"><span class="label">冲洗日期:</span><span>${formatDate(r.date)}</span></div>
                        <div class="info-item"><span class="label">起止时间:</span><span>${r.startTime || '--'} ~ ${r.endTime || '--'}</span></div>
                        <div class="info-item"><span class="label">拍摄时间:</span><span>${formatDate(r.shootDate)}</span></div>
                        <div class="info-item"><span class="label">拍摄场景:</span><span>${r.scene || '--'}</span></div>
                        <div class="info-item"><span class="label">室温:</span><span>${r.roomTemp || '--'}°C</span></div>
                        <div class="info-item"><span class="label">水温:</span><span>${r.waterTemp || '--'}°C</span></div>
                        <div class="info-item"><span class="label">湿度:</span><span>${r.humidity || '--'}%</span></div>
                        <div class="info-item"><span class="label">评分:</span><span class="rating">${'★'.repeat(rating)}${'☆'.repeat(5-rating)}</span></div>
                    </div>
                </div>
                <div class="section">
                    <div class="section-title">胶卷信息</div>
                    <div class="info-grid">
                        <div class="info-item"><span class="label">品牌:</span><span>${r.film.brand || '--'}</span></div>
                        <div class="info-item"><span class="label">型号:</span><span>${r.film.model || '--'}</span></div>
                        <div class="info-item"><span class="label">类型:</span><span>${r.film.type || '--'}</span></div>
                        <div class="info-item"><span class="label">感光度:</span><span>${r.film.iso || '--'}</span></div>
                        <div class="info-item"><span class="label">批次:</span><span>${r.film.batch || '--'}</span></div>
                        <div class="info-item"><span class="label">有效期:</span><span>${formatDate(r.film.expiry)}</span></div>
                        <div class="info-item"><span class="label">张数:</span><span>${r.film.shots || '--'}</span></div>
                    </div>
                </div>
                ${r.equipment && r.equipment.length > 0 ? `
                <div class="section">
                    <div class="section-title">使用设备</div>
                    <table><thead><tr><th>设备类型</th><th>型号</th><th>状态</th></tr></thead><tbody>
                        ${r.equipment.map(e => `<tr><td>${e.type}</td><td>${e.model || '--'}</td><td>${e.status}</td></tr>`).join('')}
                    </tbody></table>
                </div>` : ''}
                ${r.chemicals && r.chemicals.length > 0 ? `
                <div class="section">
                    <div class="section-title">药水信息</div>
                    <table><thead><tr><th>类型</th><th>品牌型号</th><th>配比</th><th>使用状态</th></tr></thead><tbody>
                        ${r.chemicals.map(c => `<tr><td>${c.type}</td><td>${c.brand || '--'}</td><td>${c.ratio || '--'}</td><td>${c.usage}</td></tr>`).join('')}
                    </tbody></table>
                </div>` : ''}
                ${r.steps && r.steps.length > 0 ? `
                <div class="section">
                    <div class="section-title">冲洗步骤</div>
                    <table><thead><tr><th>步骤</th><th>时长</th><th>温度</th><th>震荡方式</th><th>备注</th></tr></thead><tbody>
                        ${r.steps.map(s => `<tr><td>${s.name || '--'}</td><td>${formatDuration(s.duration)}</td><td>${s.temp ? s.temp + '°C' : '--'}</td><td>${s.agitation || '--'}</td><td>${s.note || ''}</td></tr>`).join('')}
                    </tbody></table>
                </div>` : ''}
                <div class="section">
                    <div class="section-title">成片效果</div>
                    <div class="info-grid">
                        <div class="info-item"><span class="label">对比度:</span><span>${r.result.contrast || '--'}</span></div>
                        <div class="info-item"><span class="label">锐度:</span><span>${r.result.sharpness || '--'}</span></div>
                        <div class="info-item"><span class="label">颗粒感:</span><span>${r.result.grain || '--'}</span></div>
                        <div class="info-item"><span class="label">色彩:</span><span>${r.result.saturation || '--'}</span></div>
                        <div class="info-item"><span class="label">曝光:</span><span>${r.result.exposure || '--'}</span></div>
                        <div class="info-item"><span class="label">问题:</span><span>${(r.result.issues || []).join('、') || '无'}</span></div>
                        <div class="info-item"><span class="label">扫描设备:</span><span>${r.result.scanDevice || '--'}</span></div>
                        <div class="info-item"><span class="label">分辨率:</span><span>${r.result.scanResolution || '--'}</span></div>
                    </div>
                </div>
                ${r.result.images && r.result.images.length > 0 ? `
                <div class="section">
                    <div class="section-title">成片样张</div>
                    <div class="images">${r.result.images.map(img => `<img src="${img}">`).join('')}</div>
                </div>` : ''}
                ${r.result.summary ? `<div class="section"><div class="section-title">优化总结</div><p style="font-size:12px;">${r.result.summary}</p></div>` : ''}
                ${r.result.nextAdjust ? `<div class="section"><div class="section-title">下次调整方案</div><p style="font-size:12px;">${r.result.nextAdjust}</p></div>` : ''}
                ${r.notes ? `<div class="section"><div class="section-title">备注</div><p style="font-size:12px;">${r.notes}</p></div>` : ''}
            </div>`;
        }).join('')}
        <div class="footer">FilmLab 个人胶片冲洗工作台 | 仅个人存档使用</div>
        </body></html>
    `;
}

// ============================================
// 数据可视化统计
// ============================================
function switchChartMode(chartName, mode) {
    if (chartName === 'freq') {
        appState.chartFreqMode = mode;
        document.querySelectorAll('.chart-tab').forEach(t => {
            if (t.dataset.mode) t.classList.toggle('active', t.dataset.mode === mode);
        });
        renderFrequencyChart();
    }
}

function renderAllCharts() {
    renderStatsCards();
    renderFrequencyChart();
    renderFilmTypeChart();
    renderChemicalChart();
    renderRatingChart();
    renderIssuesChart();
    renderParamCorrelation();
}

function renderStatsCards() {
    const records = getAllRecords();
    const now = new Date();
    const thisMonth = records.filter(r => r.date && new Date(r.date).getMonth() === now.getMonth() && new Date(r.date).getFullYear() === now.getFullYear());
    const lastMonth = new Date(now);
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const lastMonthRecords = records.filter(r => r.date && new Date(r.date).getMonth() === lastMonth.getMonth() && new Date(r.date).getFullYear() === lastMonth.getFullYear());

    const reviewed = records.filter(r => r.reviewed);
    const avgRating = records.filter(r => r.result.rating > 0).reduce((sum, r) => sum + r.result.rating, 0) / (records.filter(r => r.result.rating > 0).length || 1);

    const trend = lastMonthRecords.length > 0 ? ((thisMonth.length - lastMonthRecords.length) / lastMonthRecords.length * 100).toFixed(0) : 0;

    const cards = [
        { label: '总冲洗记录', value: records.length, trend: '', trendDir: '' },
        { label: '本月冲洗', value: thisMonth.length, trend: `${trend}% 较上月`, trendDir: thisMonth.length >= lastMonthRecords.length ? 'up' : 'down' },
        { label: '已复盘记录', value: reviewed.length, trend: `占比 ${records.length > 0 ? Math.round(reviewed.length / records.length * 100) : 0}%`, trendDir: '' },
        { label: '平均评分', value: avgRating.toFixed(1), trend: '/ 5.0', trendDir: '' },
    ];

    document.getElementById('statsCards').innerHTML = cards.map(c => `
        <div class="stat-card">
            <div class="stat-card-label">${c.label}</div>
            <div class="stat-card-value">${c.value}</div>
            ${c.trend ? `<div class="stat-card-trend ${c.trendDir}">${c.trend}</div>` : ''}
        </div>
    `).join('');
}

function getChartColors() {
    return {
        blue: '#207cff',
        blueLight: '#4d94ff',
        blueSoft: 'rgba(32, 124, 255, 0.15)',
        text: '#9499A6',
        grid: 'rgba(255, 255, 255, 0.04)',
        colors: ['#207cff', '#4d94ff', '#6db5ff', '#4dffa6', '#ffb347', '#ff5b6e', '#9499A6', '#5A5F6B'],
    };
}

function renderFrequencyChart() {
    const ctx = document.getElementById('chartFrequency');
    if (!ctx) return;
    if (appState.charts.freq) appState.charts.freq.destroy();

    const records = getAllRecords();
    const colors = getChartColors();
    const mode = appState.chartFreqMode;

    let labels, data;
    if (mode === 'month') {
        const months = [];
        const now = new Date();
        for (let i = 11; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            months.push({ label: `${d.getMonth() + 1}月`, year: d.getFullYear(), month: d.getMonth() });
        }
        labels = months.map(m => m.label);
        data = months.map(m => records.filter(r => {
            if (!r.date) return false;
            const d = new Date(r.date);
            return d.getFullYear() === m.year && d.getMonth() === m.month;
        }).length);
    } else {
        const now = new Date();
        const years = [];
        for (let i = 4; i >= 0; i--) years.push(now.getFullYear() - i);
        labels = years.map(y => y + '年');
        data = years.map(y => records.filter(r => r.date && new Date(r.date).getFullYear() === y).length);
    }

    appState.charts.freq = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [{
                label: '冲洗次数',
                data,
                borderColor: colors.blue,
                backgroundColor: colors.blueSoft,
                borderWidth: 2,
                tension: 0.4,
                fill: true,
                pointBackgroundColor: colors.blue,
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6,
            }],
        },
        options: getChartOptions(),
    });
}

function renderFilmTypeChart() {
    const ctx = document.getElementById('chartFilmType');
    if (!ctx) return;
    if (appState.charts.filmType) appState.charts.filmType.destroy();

    const records = getAllRecords();
    const typeCount = {};
    records.forEach(r => {
        const type = r.film.type || '未分类';
        typeCount[type] = (typeCount[type] || 0) + 1;
    });

    const colors = getChartColors();
    const labels = Object.keys(typeCount);
    const data = Object.values(typeCount);

    appState.charts.filmType = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels,
            datasets: [{
                data,
                backgroundColor: colors.colors.slice(0, labels.length),
                borderColor: 'rgba(255,255,255,0.1)',
                borderWidth: 2,
            }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom', labels: { color: colors.text, font: { size: 11 }, padding: 10, usePointStyle: true } },
            },
        },
    });
}

function renderChemicalChart() {
    const ctx = document.getElementById('chartChemical');
    if (!ctx) return;
    if (appState.charts.chemical) appState.charts.chemical.destroy();

    const records = getAllRecords();
    const chemCount = {};
    records.forEach(r => {
        (r.chemicals || []).forEach(c => {
            const type = c.type || '未知';
            chemCount[type] = (chemCount[type] || 0) + 1;
        });
    });

    const colors = getChartColors();
    const labels = Object.keys(chemCount);
    const data = Object.values(chemCount);

    if (labels.length === 0) {
        ctx.parentElement.innerHTML = '<div class="empty-state">暂无药水使用数据</div>';
        return;
    }

    appState.charts.chemical = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: '使用次数',
                data,
                backgroundColor: colors.blue,
                borderRadius: 6,
                barThickness: 'flex',
            }],
        },
        options: getChartOptions(),
    });
}

function renderRatingChart() {
    const ctx = document.getElementById('chartRating');
    if (!ctx) return;
    if (appState.charts.rating) appState.charts.rating.destroy();

    const records = getAllRecords();
    const ratingCount = [0, 0, 0, 0, 0, 0]; // 0-5 stars
    records.forEach(r => {
        const rating = r.result.rating || 0;
        ratingCount[rating]++;
    });

    const colors = getChartColors();
    appState.charts.rating = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['未评分', '1星', '2星', '3星', '4星', '5星'],
            datasets: [{
                label: '记录数',
                data: ratingCount,
                backgroundColor: ['#5A5F6B', '#ff5b6e', '#ffb347', '#6db5ff', '#4d94ff', '#4dffa6'],
                borderRadius: 6,
            }],
        },
        options: getChartOptions(),
    });
}

function renderIssuesChart() {
    const ctx = document.getElementById('chartIssues');
    if (!ctx) return;
    if (appState.charts.issues) appState.charts.issues.destroy();

    const records = getAllRecords();
    const issueCount = {};
    records.forEach(r => {
        (r.result.issues || []).forEach(issue => {
            issueCount[issue] = (issueCount[issue] || 0) + 1;
        });
    });

    const labels = Object.keys(issueCount);
    const data = Object.values(issueCount);
    const colors = getChartColors();

    if (labels.length === 0) {
        ctx.parentElement.innerHTML = '<div class="empty-state">暂无问题记录</div>';
        return;
    }

    appState.charts.issues = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels,
            datasets: [{
                data,
                backgroundColor: colors.colors.slice(0, labels.length),
                borderColor: 'rgba(255,255,255,0.1)',
                borderWidth: 2,
            }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'bottom', labels: { color: colors.text, font: { size: 11 }, padding: 8, usePointStyle: true } },
            },
        },
    });
}

function renderParamCorrelation() {
    const ctx = document.getElementById('chartCorrelation');
    if (!ctx) return;
    if (appState.charts.correlation) appState.charts.correlation.destroy();

    const paramType = document.getElementById('paramCorrSelect')?.value || 'devTime';
    const records = getAllRecords();
    const colors = getChartColors();

    const points = [];
    records.forEach(r => {
        const rating = r.result.rating || 0;
        if (rating === 0) return;

        let paramValue = null;
        let paramLabel = '';
        if (paramType === 'devTime') {
            const devStep = (r.steps || []).find(s => s.name && s.name.includes('显影'));
            if (devStep && devStep.duration) {
                paramValue = devStep.duration / 60; // 转为分钟
                paramLabel = '显影时长(分钟)';
            }
        } else if (paramType === 'devTemp') {
            const devStep = (r.steps || []).find(s => s.name && s.name.includes('显影'));
            if (devStep && devStep.temp) {
                paramValue = devStep.temp;
                paramLabel = '显影温度(°C)';
            }
        } else if (paramType === 'waterTemp') {
            if (r.waterTemp) {
                paramValue = r.waterTemp;
                paramLabel = '水温(°C)';
            }
        }

        if (paramValue !== null) {
            points.push({ x: paramValue, y: rating, name: r.name });
        }
    });

    if (points.length === 0) {
        ctx.parentElement.innerHTML = '<div class="empty-state">暂无足够数据进行关联分析，请先添加含评分与参数的记录</div>';
        return;
    }

    appState.charts.correlation = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: '记录',
                data: points,
                backgroundColor: colors.blue,
                borderColor: colors.blueLight,
                pointRadius: 8,
                pointHoverRadius: 12,
            }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (ctx) => {
                            const p = ctx.raw;
                            return `${p.name}: ${paramType === 'devTime' ? '显影时长' : paramType === 'devTemp' ? '显影温度' : '水温'}=${p.x}, 评分=${p.y}星`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: { display: true, text: points[0] ? (paramType === 'devTime' ? '显影时长(分钟)' : paramType === 'devTemp' ? '显影温度(°C)' : '水温(°C)') : '', color: colors.text },
                    grid: { color: colors.grid },
                    ticks: { color: colors.text },
                },
                y: {
                    title: { display: true, text: '成片评分(星)', color: colors.text },
                    grid: { color: colors.grid },
                    ticks: { color: colors.text, stepSize: 1, max: 5, min: 0 },
                },
            },
        },
    });
}

function getChartOptions() {
    const colors = getChartColors();
    return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
        },
        scales: {
            x: { grid: { color: colors.grid }, ticks: { color: colors.text, font: { size: 11 } } },
            y: { grid: { color: colors.grid }, ticks: { color: colors.text, font: { size: 11 } }, beginAtZero: true },
        },
    };
}

// ============================================
// 初始化
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    // 初始化流程选择
    renderProcessGrid();
    renderCustomProcessList();
    updateProcessSelectOptions();

    // 初始化侧边栏统计
    renderSidebarStats();

    // 初始化通知badge
    updateNotifBadge();

    // 生成自动通知
    generateAutoNotifications();

    // 设置今日日期为默认冲洗日期
    const today = new Date().toISOString().slice(0, 10);
    const dateInput = document.getElementById('recDate');
    if (dateInput && !dateInput.value) dateInput.value = today;

    // 加载设置
    const settings = getSettings();
    if (settings.chemExpireDays) {
        const sel = document.getElementById('settingChemExpire');
        if (sel) sel.value = settings.chemExpireDays;
    }
    // 恢复开关状态
    if (settings.animations === false) {
        const el = document.getElementById('settingAnimations');
        if (el) { el.checked = false; toggleAnimations(false); }
    }
    if (settings.timerSound === false) {
        const el = document.getElementById('settingTimerSound');
        if (el) el.checked = false;
    }
    if (settings.contaminationWarning === false) {
        const el = document.getElementById('settingContaminationWarning');
        if (el) el.checked = false;
    }
    // 恢复其他开关（兼容性）
    document.querySelectorAll('.settings-card .toggle input').forEach((input, idx) => {
        if (settings['toggle_' + idx] !== undefined) input.checked = settings['toggle_' + idx];
    });

    // 初始化主题
    initTheme();

    // 初始化头像/名称
    initProfile();

    // 初始化颜色选择器
    initColorPickers();

    // 初始化计时器
    initTimers();
    renderWorkspace();

    // 启动实时时钟
    startClock();

    // 初始化按钮涟漪
    initRippleEffect();

    // 迁移旧版 base64 图片到 IndexedDB（异步，不阻塞页面）
    migrateBase64Images().catch(e => console.error('Image migration failed:', e));

    // 存储使用情况监控（开发调试用，可在控制台查看）
    setTimeout(() => {
        const usage = getStorageUsage();
        console.log(`[FilmLab] localStorage 使用: ${usage.totalKB}KB (${usage.totalMB}MB)`, usage.details);
        if (usage.total > 4 * 1024 * 1024) {
            console.warn('[FilmLab] localStorage 使用超过 4MB，建议导出备份');
        }
    }, 2000);

    // 首次使用提示
    if (getAllRecords().length === 0 && getAllInventory().film.length === 0) {
        setTimeout(() => {
            toast('欢迎使用 FilmLab！请先选择冲洗方案开始记录', 'info');
        }, 500);
    }
});

// ============================================
// ★ 主题系统
// ============================================
function initTheme() {
    const settings = getSettings();
    const theme = settings.theme || 'dark';
    setTheme(theme);
}

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const newTheme = current === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
}

// ============================================
// 移动端"更多"菜单
// ============================================
function toggleMobileMenu() {
    const sheet = document.getElementById('mobileMenuSheet');
    const overlay = document.getElementById('mobileMenuOverlay');
    if (!sheet || !overlay) return;
    if (sheet.classList.contains('active')) {
        closeMobileMenu();
    } else {
        sheet.classList.add('active');
        overlay.classList.add('active');
    }
}

function closeMobileMenu() {
    const sheet = document.getElementById('mobileMenuSheet');
    const overlay = document.getElementById('mobileMenuOverlay');
    if (!sheet || !overlay) return;
    sheet.classList.remove('active');
    overlay.classList.remove('active');
}

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const moon = document.getElementById('themeIconMoon');
    const sun = document.getElementById('themeIconSun');
    if (moon && sun) {
        moon.style.display = theme === 'dark' ? 'block' : 'none';
        sun.style.display = theme === 'dark' ? 'none' : 'block';
    }
    const sel = document.getElementById('settingTheme');
    if (sel) sel.value = theme;
    const settings = getSettings();
    settings.theme = theme;
    saveData(STORAGE_KEYS.settings, settings);
}

// ============================================
// ★ 背景色/强调色/玻璃透明度 自定义
// ============================================
const ACCENT_COLORS = [
    '#207cff', '#00b4d8', '#7209b7', '#e63946',
    '#06d6a0', '#ffd60a', '#f72585', '#3a86ff',
];

const BG_COLORS = [
    { name: '深炭黑', value: '#0A0C12' },
    { name: '深蓝黑', value: '#0A0E1A' },
    { name: '深紫黑', value: '#0F0A14' },
    { name: '深绿黑', value: '#0A1410' },
    { name: '纯黑', value: '#000000' },
    { name: '深灰', value: '#1A1D24' },
    { name: '午夜蓝', value: '#0C1424' },
    { name: '炭灰', value: '#15171F' },
];

function initColorPickers() {
    const settings = getSettings();

    // 强调色
    const accentPicker = document.getElementById('accentColorPicker');
    if (accentPicker) {
        accentPicker.innerHTML = ACCENT_COLORS.map(c => 
            `<div class="color-swatch ${settings.accentColor === c ? 'selected' : ''}" style="background:${c}" onclick="setAccentColor('${c}')"></div>`
        ).join('');
    }
    // 应用已保存的强调色
    if (settings.accentColor) {
        document.documentElement.style.setProperty('--ice-blue', settings.accentColor);
        document.documentElement.style.setProperty('--ice-blue-light', lightenColor(settings.accentColor, 20));
        document.documentElement.style.setProperty('--ice-blue-bright', lightenColor(settings.accentColor, 40));
        document.documentElement.style.setProperty('--ice-blue-glow', settings.accentColor + '59');
        document.documentElement.style.setProperty('--ice-blue-glow-strong', settings.accentColor + '80');
        document.documentElement.style.setProperty('--ice-blue-soft', settings.accentColor + '1A');
        document.documentElement.style.setProperty('--ice-blue-softer', settings.accentColor + '0D');
    }

    // 背景色
    const bgPicker = document.getElementById('bgColorPicker');
    if (bgPicker) {
        bgPicker.innerHTML = BG_COLORS.map(c => 
            `<div class="color-swatch ${(!settings.bgColor && c.value === '#0A0C12') || settings.bgColor === c.value ? 'selected' : ''}" style="background:${c.value}" title="${c.name}" onclick="setBgColor('${c.value}')"></div>`
        ).join('');
    }
    // 应用已保存的背景色
    if (settings.bgColor) {
        const layer = document.getElementById('bgCustomLayer');
        if (layer) layer.style.background = settings.bgColor;
    }

    // 玻璃透明度
    const slider = document.getElementById('glassOpacitySlider');
    if (slider) {
        if (settings.glassOpacity) slider.value = settings.glassOpacity;
        setGlassOpacity(slider.value);
    }
}

function setAccentColor(color) {
    document.documentElement.style.setProperty('--ice-blue', color);
    document.documentElement.style.setProperty('--ice-blue-light', lightenColor(color, 20));
    document.documentElement.style.setProperty('--ice-blue-bright', lightenColor(color, 40));
    document.documentElement.style.setProperty('--ice-blue-glow', color + '59');
    document.documentElement.style.setProperty('--ice-blue-glow-strong', color + '80');
    document.documentElement.style.setProperty('--ice-blue-soft', color + '1A');
    document.documentElement.style.setProperty('--ice-blue-softer', color + '0D');
    const settings = getSettings();
    settings.accentColor = color;
    saveData(STORAGE_KEYS.settings, settings);
    initColorPickers();
    toast('强调色已更新', 'success');
}

function setBgColor(color) {
    const layer = document.getElementById('bgCustomLayer');
    if (layer) layer.style.background = color;
    const settings = getSettings();
    settings.bgColor = color;
    saveData(STORAGE_KEYS.settings, settings);
    initColorPickers();
    toast('背景色已更新', 'success');
}

function setGlassOpacity(value) {
    const opacity = value / 100;
    document.documentElement.style.setProperty('--glass-heavy', `rgba(22, 28, 42, ${opacity})`);
    document.documentElement.style.setProperty('--glass-heavy-hover', `rgba(28, 36, 54, ${opacity + 0.1})`);
    const settings = getSettings();
    settings.glassOpacity = value;
    saveData(STORAGE_KEYS.settings, settings);
}

function toggleAnimations(enabled) {
    if (enabled) {
        document.documentElement.style.removeProperty('--transition');
    } else {
        document.documentElement.style.setProperty('--transition', 'none');
    }
    const settings = getSettings();
    settings.animations = enabled;
    saveData(STORAGE_KEYS.settings, settings);
}

function lightenColor(hex, percent) {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.min(255, ((num >> 16) & 0xFF) + Math.round(255 * percent / 100));
    const g = Math.min(255, ((num >> 8) & 0xFF) + Math.round(255 * percent / 100));
    const b = Math.min(255, (num & 0xFF) + Math.round(255 * percent / 100));
    return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
}

// ============================================
// ★ 头像/名称 自定义
// ============================================
const AVATAR_COLORS = [
    '#207cff', '#7209b7', '#e63946', '#06d6a0',
    '#ffd60a', '#f72585', '#00b4d8', '#fb5607',
    '#8338ec', '#3a86ff', '#ff006e', '#02c39a',
];

function getProfile() { return loadData(STORAGE_KEYS.profile) || {}; }
function saveProfile(profile) { saveData(STORAGE_KEYS.profile, profile); }

function initProfile() {
    const profile = getProfile();
    updateAvatarDisplay(profile);
    updateWorkstationName(profile);
    const nameInput = document.getElementById('settingWorkstationName');
    if (nameInput && profile.workstationName) nameInput.value = profile.workstationName;
}

function updateAvatarDisplay(profile) {
    const avatar = document.getElementById('topbarAvatar');
    if (!avatar) return;
    const text = profile.avatarText || 'FL';
    const color = profile.avatarColor || '#207cff';
    if (profile.avatarImage) {
        avatar.innerHTML = `<img src="${profile.avatarImage}" alt="avatar">`;
    } else {
        avatar.textContent = text;
        avatar.style.background = `linear-gradient(135deg, ${color} 0%, ${darkenColor(color, 30)} 100%)`;
    }
}

function updateWorkstationName(profile) {
    const brandText = document.querySelector('.topbar-brand .brand-text');
    const mobileTitle = document.querySelector('.mobile-title');
    if (profile.workstationName) {
        const name = profile.workstationName;
        const half = Math.ceil(name.length / 2);
        const html = `${name.slice(0, half)}<span>${name.slice(half)}</span>`;
        if (brandText) brandText.innerHTML = html;
        if (mobileTitle) mobileTitle.innerHTML = html;
    }
}

function saveWorkstationName() {
    const input = document.getElementById('settingWorkstationName');
    const name = input.value.trim();
    const profile = getProfile();
    profile.workstationName = name;
    saveProfile(profile);
    updateWorkstationName(profile);
    toast('工作台名称已更新', 'success');
}

function openAvatarModal() {
    const profile = getProfile();
    const text = profile.avatarText || 'FL';
    const color = profile.avatarColor || '#207cff';
    openModal(`
        <div class="modal-header">
            <span class="modal-title">头像设置</span>
            <button class="modal-close" onclick="closeModal()">
                <svg viewBox="0 0 24 24" fill="none" width="20" height="20"><path d="M6 6L18 18M6 18L18 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            </button>
        </div>
        <div class="modal-body avatar-custom-modal">
            <div class="avatar-preview" id="avatarPreview" style="background:linear-gradient(135deg, ${color} 0%, ${darkenColor(color, 30)} 100%);">${text}</div>
            <div class="form-field" style="margin-bottom:12px;">
                <label>头像文字（1-3个字符）</label>
                <input type="text" id="avatarTextInput" value="${text}" maxlength="3" oninput="updateAvatarPreview()" style="text-align:center;">
            </div>
            <label style="font-size:11px; font-weight:600; color:var(--text-tertiary);">选择配色</label>
            <div class="avatar-color-grid" id="avatarColorGrid">
                ${AVATAR_COLORS.map(c => `<div class="avatar-color-option ${c === color ? 'selected' : ''}" style="background:${c}" onclick="selectAvatarColor('${c}')"></div>`).join('')}
            </div>
            <div class="form-field" style="margin-top:12px;">
                <label>或上传头像图片</label>
                <input type="file" accept="image/*" onchange="uploadAvatarImage(event)" style="padding:6px;">
            </div>
        </div>
        <div class="modal-footer">
            <button class="btn btn-ghost" onclick="closeModal()">取消</button>
            <button class="btn btn-primary" onclick="saveAvatar()">保存头像</button>
        </div>
    `);
    appState._avatarColor = color;
    appState._avatarText = text;
}

function updateAvatarPreview() {
    const text = document.getElementById('avatarTextInput').value || 'FL';
    const preview = document.getElementById('avatarPreview');
    preview.textContent = text;
    appState._avatarText = text;
}

function selectAvatarColor(color) {
    appState._avatarColor = color;
    const preview = document.getElementById('avatarPreview');
    preview.style.background = `linear-gradient(135deg, ${color} 0%, ${darkenColor(color, 30)} 100%)`;
    document.querySelectorAll('.avatar-color-option').forEach(o => o.classList.remove('selected'));
    event.target.classList.add('selected');
}

async function uploadAvatarImage(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
        // 压缩头像到 200x200，质量 0.8
        const compressed = await compressImage(e.target.result, 200, 0.8);
        appState._avatarImage = compressed;
        const preview = document.getElementById('avatarPreview');
        preview.innerHTML = `<img src="${compressed}" alt="avatar">`;
    };
    reader.readAsDataURL(file);
}

function saveAvatar() {
    const profile = getProfile();
    profile.avatarText = appState._avatarText || 'FL';
    profile.avatarColor = appState._avatarColor || '#207cff';
    if (appState._avatarImage) profile.avatarImage = appState._avatarImage;
    else delete profile.avatarImage;
    saveProfile(profile);
    updateAvatarDisplay(profile);
    closeModal();
    appState._avatarImage = null;
    toast('头像已更新', 'success');
}

function darkenColor(hex, percent) {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.max(0, ((num >> 16) & 0xFF) - Math.round(255 * percent / 100));
    const g = Math.max(0, ((num >> 8) & 0xFF) - Math.round(255 * percent / 100));
    const b = Math.max(0, (num & 0xFF) - Math.round(255 * percent / 100));
    return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
}

// ============================================
// ★ 实时时钟 + 温湿度
// ============================================
function startClock() {
    updateClock();
    setInterval(updateClock, 1000);
    // 从设置中加载温湿度
    const settings = getSettings();
    const tempEl = document.getElementById('quickTemp');
    const humidityEl = document.getElementById('quickHumidity');
    if (settings.lastTemp && tempEl) tempEl.textContent = settings.lastTemp + '°';
    if (settings.lastHumidity && humidityEl) humidityEl.textContent = settings.lastHumidity + '%';
}

function updateClock() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const timeEl = document.getElementById('quickClockTime');
    const dateEl = document.getElementById('quickClockDate');
    if (timeEl) timeEl.textContent = `${h}:${m}`;
    if (dateEl) {
        const month = now.getMonth() + 1;
        const day = now.getDate();
        const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
        dateEl.textContent = `${month}/${day} 周${weekdays[now.getDay()]}`;
    }
}

// 点击温湿度可以快速编辑
function editQuickEnv() {
    openModal(`
        <div class="modal-header">
            <span class="modal-title">记录当前环境参数</span>
            <button class="modal-close" onclick="closeModal()">
                <svg viewBox="0 0 24 24" fill="none" width="20" height="20"><path d="M6 6L18 18M6 18L18 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            </button>
        </div>
        <div class="modal-body">
            <div class="form-grid" style="grid-template-columns:1fr 1fr;">
                <div class="form-field">
                    <label>室温 (°C)</label>
                    <input type="number" id="envTempInput" step="0.1" placeholder="20" value="${getSettings().lastTemp || ''}">
                </div>
                <div class="form-field">
                    <label>湿度 (%)</label>
                    <input type="number" id="envHumidityInput" step="1" placeholder="50" value="${getSettings().lastHumidity || ''}">
                </div>
            </div>
        </div>
        <div class="modal-footer">
            <button class="btn btn-ghost" onclick="closeModal()">取消</button>
            <button class="btn btn-primary" onclick="saveQuickEnv()">保存</button>
        </div>
    `);
}

function saveQuickEnv() {
    const temp = document.getElementById('envTempInput').value;
    const humidity = document.getElementById('envHumidityInput').value;
    const settings = getSettings();
    if (temp) {
        settings.lastTemp = parseFloat(temp);
        const tempEl = document.getElementById('quickTemp');
        if (tempEl) tempEl.textContent = temp + '°';
    }
    if (humidity) {
        settings.lastHumidity = parseInt(humidity);
        const humidityEl = document.getElementById('quickHumidity');
        if (humidityEl) humidityEl.textContent = humidity + '%';
    }
    saveData(STORAGE_KEYS.settings, settings);
    closeModal();
    toast('环境参数已记录', 'success');
}

let deferredInstallPrompt = null;

window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    deferredInstallPrompt = event;
});

window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    toast('FilmLab 已安装到设备', 'success');
});

async function installPwa() {
    const standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    if (standalone) {
        toast('FilmLab 已经安装', 'info');
        return;
    }

    if (deferredInstallPrompt) {
        deferredInstallPrompt.prompt();
        const choice = await deferredInstallPrompt.userChoice;
        if (choice.outcome === 'accepted') toast('正在安装 FilmLab', 'success');
        deferredInstallPrompt = null;
        return;
    }

    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    openModal(`
        <div class="modal-header">
            <span class="modal-title">安装到手机</span>
            <button class="modal-close" onclick="closeModal()">
                <svg viewBox="0 0 24 24" fill="none" width="20" height="20"><path d="M6 6L18 18M6 18L18 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            </button>
        </div>
        <div class="modal-body">
            <p style="font-size:13px;line-height:1.8;color:var(--text-secondary);">
                ${isIOS ? '打开 Safari 的分享菜单，然后选择“添加到主屏幕”。' : '打开浏览器菜单，选择“安装应用”或“添加到主屏幕”。'}
            </p>
            ${!window.isSecureContext ? '<p style="margin-top:12px;font-size:12px;color:var(--warn);">当前地址不是 HTTPS。安装功能需要部署到 HTTPS 网站后才能使用。</p>' : ''}
        </div>
        <div class="modal-footer"><button class="btn btn-primary" onclick="closeModal()">知道了</button></div>
    `);
}

if ('serviceWorker' in navigator && window.isSecureContext) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./service-worker.js').catch(error => {
            console.warn('Service worker registration failed:', error);
        });
    });
}

// ============================================
// ★ 多计时器系统
// ============================================
let timers = [];
let timerInterval = null;

function initTimers() {
    timers = loadData(STORAGE_KEYS.timers) || [];
    renderTimers();
    if (!timerInterval) {
        timerInterval = setInterval(updateTimers, 1000);
    }
}

function toggleTimerPanel() {
    const panel = document.getElementById('timerPanel');
    const opening = !panel.classList.contains('open');
    panel.classList.toggle('open', opening);
    document.querySelector('.quick-btn[onclick*="toggleTimerPanel"]')?.classList.toggle('active', opening);
    if (opening) {
        updateTimerDisplays();
    }
}

function toggleTimerForm() {
    const form = document.getElementById('timerNewForm');
    form.classList.toggle('open');
    if (form.classList.contains('open')) {
        document.getElementById('timerName').focus();
    }
}

function addTimer() {
    const name = document.getElementById('timerName').value.trim() || `计时器 ${timers.length + 1}`;
    const minutes = parseInt(document.getElementById('timerMinutes').value) || 0;
    const seconds = parseInt(document.getElementById('timerSeconds').value) || 0;
    const totalSeconds = minutes * 60 + seconds;

    if (totalSeconds === 0) { toast('请输入有效时间', 'error'); return; }

    const timer = {
        id: 'timer-' + Date.now(),
        name,
        totalSeconds,
        remaining: totalSeconds,
        running: false,
        done: false,
        endAt: null,
    };
    timers.push(timer);
    saveData(STORAGE_KEYS.timers, timers);
    renderTimers();
    if (appState.currentTab === 'process-select') renderWorkspace();

    // 清空表单
    document.getElementById('timerName').value = '';
    document.getElementById('timerMinutes').value = '';
    document.getElementById('timerSeconds').value = '';
    document.getElementById('timerNewForm').classList.remove('open');
    toast(`计时器「${name}」已添加`, 'success');
}

function startTimer(id) {
    const timer = timers.find(t => t.id === id);
    if (!timer || timer.done) return;
    if (timer.running) {
        timer.remaining = getTimerRemaining(timer);
        timer.running = false;
        timer.endAt = null;
    } else {
        if (!timer.remaining || timer.remaining <= 0) return;
        timer.running = true;
        timer.endAt = Date.now() + timer.remaining * 1000;
        if (timer.remaining === timer.totalSeconds) timer.startTime = Date.now();
    }
    saveData(STORAGE_KEYS.timers, timers);
    updateTimerDisplays();
    if (appState.currentTab === 'process-select') renderWorkspace();
}

function deleteTimer(id) {
    timers = timers.filter(t => t.id !== id);
    if (appState.workspaceSelection?.type === 'timer' && appState.workspaceSelection.id === id) {
        appState.workspaceSelection = null;
    }
    saveData(STORAGE_KEYS.timers, timers);
    renderTimers();
    if (appState.currentTab === 'process-select') renderWorkspace();
}

function resetTimer(id) {
    const timer = timers.find(t => t.id === id);
    if (!timer) return;
    timer.remaining = timer.totalSeconds;
    timer.running = false;
    timer.done = false;
    timer.endAt = null;
    saveData(STORAGE_KEYS.timers, timers);
    renderTimers();
    if (appState.currentTab === 'process-select') renderWorkspace();
}

function getTimerRemaining(timer, now = Date.now()) {
    if (timer.running && Number.isFinite(timer.endAt)) {
        return Math.max(0, Math.ceil((timer.endAt - now) / 1000));
    }
    return Math.max(0, Math.floor(Number(timer.remaining) || 0));
}

function updateTimers() {
    let changed = false;
    let completed = false;
    const now = Date.now();
    timers.forEach(timer => {
        if (timer.running && !timer.done) {
            if (!Number.isFinite(timer.endAt)) {
                timer.endAt = now + (Number(timer.remaining) || 0) * 1000;
            }
            const nextRemaining = getTimerRemaining(timer, now);
            changed = changed || nextRemaining !== timer.remaining;
            timer.remaining = nextRemaining;
            if (timer.remaining <= 0) {
                timer.remaining = 0;
                timer.running = false;
                timer.done = true;
                timer.endAt = null;
                completed = true;
                playTimerSound();
                toast(`⏰ 计时器「${timer.name}」时间到！`, 'info');
            }
        }
    });
    if (changed) {
        saveData(STORAGE_KEYS.timers, timers);
        updateTimerDisplays();
        if (completed && appState.currentTab === 'process-select') renderWorkspace();
    }
}

function playTimerSound() {
    const settings = getSettings();
    if (settings.timerSound === false) return;
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        for (let i = 0; i < 3; i++) {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.value = 880;
            osc.type = 'sine';
            gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.3);
            gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + i * 0.3 + 0.01);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.3 + 0.25);
            osc.start(ctx.currentTime + i * 0.3);
            osc.stop(ctx.currentTime + i * 0.3 + 0.25);
        }
    } catch (e) { console.warn('Audio not supported'); }
}

function renderTimers() {
    const list = document.getElementById('timerList');
    if (!list) return;
    if (timers.length === 0) {
        list.innerHTML = '<div class="timer-empty">暂无计时器，点击「新建计时器」添加</div>';
        return;
    }
    list.innerHTML = timers.map(t => {
        const display = formatCountdown(t.remaining);
        return `
            <div class="timer-item ${t.running ? 'running' : ''} ${t.done ? 'done' : ''}" data-timer-id="${t.id}">
                <div class="timer-item-label">
                    <div class="timer-item-name">${t.name}</div>
                    <div class="timer-item-step" data-timer-status>${t.done ? '✅ 已完成' : (t.running ? '⏳ 进行中' : '⏸ 已暂停')}</div>
                </div>
                <div class="timer-display" data-timer-display>${display}</div>
                <div class="timer-controls">
                    ${!t.done ? `<button class="timer-ctrl-btn start" data-timer-toggle data-state="${t.running ? 'running' : 'paused'}" onclick="startTimer('${t.id}')" title="${t.running ? '暂停' : '开始'}">
                        ${t.running ? '<svg viewBox="0 0 24 24" fill="none" width="14" height="14"><rect x="6" y="4" width="4" height="16" fill="currentColor"/><rect x="14" y="4" width="4" height="16" fill="currentColor"/></svg>' : '<svg viewBox="0 0 24 24" fill="none" width="14" height="14"><path d="M5 3l14 9-14 9V3z" fill="currentColor"/></svg>'}
                    </button>` : ''}
                    <button class="timer-ctrl-btn" onclick="resetTimer('${t.id}')" title="重置">
                        <svg viewBox="0 0 24 24" fill="none" width="14" height="14"><path d="M3 12a9 9 0 109-9M3 4v5h5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </button>
                    <button class="timer-ctrl-btn del" onclick="deleteTimer('${t.id}')" title="删除">
                        <svg viewBox="0 0 24 24" fill="none" width="14" height="14"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function updateTimerDisplays() {
    const list = document.getElementById('timerList');
    if (!list) return;
    list.querySelectorAll('.timer-item').forEach(item => {
        const timer = timers.find(t => t.id === item.dataset.timerId);
        if (!timer) {
            item.remove();
            return;
        }

        const display = formatCountdown(timer.remaining);
        item.classList.toggle('running', !!timer.running);
        item.classList.toggle('done', !!timer.done);

        const displayEl = item.querySelector('[data-timer-display]');
        const statusEl = item.querySelector('[data-timer-status]');
        if (displayEl && displayEl.textContent !== display) displayEl.textContent = display;
        if (statusEl) {
            const status = timer.done ? '✅ 已完成' : (timer.running ? '⏳ 进行中' : '⏸ 已暂停');
            if (statusEl.textContent !== status) statusEl.textContent = status;
        }

        const toggle = item.querySelector('[data-timer-toggle]');
        if (timer.done) {
            if (toggle) toggle.remove();
        } else if (toggle) {
            const state = timer.running ? 'running' : 'paused';
            toggle.title = timer.running ? '暂停' : '开始';
            if (toggle.dataset.state !== state) {
                toggle.dataset.state = state;
                toggle.innerHTML = timer.running
                    ? '<svg viewBox="0 0 24 24" fill="none" width="14" height="14"><rect x="6" y="4" width="4" height="16" fill="currentColor"/><rect x="14" y="4" width="4" height="16" fill="currentColor"/></svg>'
                    : '<svg viewBox="0 0 24 24" fill="none" width="14" height="14"><path d="M5 3l14 9-14 9V3z" fill="currentColor"/></svg>';
            }
        }
    });
    updateWorkspaceLiveDisplays();
}

// ============================================
// ★ 画廊模块 - 3D 中心抽屉
// ============================================
let galleryImages = [];
let galleryIndex = 0;

function renderGallery() {
    const records = getAllRecords();
    galleryImages = [];
    records.forEach(r => {
        if (r.result && r.result.images && r.result.images.length > 0) {
            r.result.images.forEach(img => {
                galleryImages.push({
                    src: img,
                    recordName: r.name,
                    processType: getProcessName(r.processType),
                    date: r.date,
                    film: r.film ? `${r.film.brand} ${r.film.model}` : '',
                    rating: r.result.rating || 0,
                });
            });
        }
    });

    const stage = document.getElementById('galleryStage');
    const nav = document.getElementById('galleryNav');
    const thumbs = document.getElementById('galleryThumbs');
    const empty = document.getElementById('galleryEmpty');

    if (galleryImages.length === 0) {
        stage.innerHTML = '';
        if (empty) {
            empty.style.display = '';
            stage.appendChild(empty);
        }
        nav.style.display = 'none';
        thumbs.style.display = 'none';
        return;
    }

    empty.style.display = 'none';
    nav.style.display = 'flex';
    thumbs.style.display = 'flex';
    galleryIndex = 0;

    // 渲染轮播
    const carousel = document.createElement('div');
    carousel.className = 'gallery-carousel';
    carousel.id = 'galleryCarousel';
    stage.innerHTML = '';
    stage.appendChild(carousel);

    galleryImages.forEach((img, i) => {
        const card = document.createElement('div');
        card.className = 'gallery-card';
        card.dataset.index = i;
        card.innerHTML = `
            <img data-img-id="${img.src}" alt="${img.recordName}" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23121828' width='400' height='300'/%3E%3C/svg%3E">
            <div class="gallery-card-info">
                <div class="gallery-card-title">${img.recordName}</div>
                <div class="gallery-card-meta">
                    <span>${img.processType}</span>
                    <span>${img.date}</span>
                    ${img.film ? `<span>${img.film}</span>` : ''}
                    ${img.rating ? `<span>${'★'.repeat(img.rating)}</span>` : ''}
                </div>
            </div>
        `;
        card.onclick = () => { galleryIndex = i; updateGalleryPositions(); };
        carousel.appendChild(card);
    });

    // 渲染缩略图
    thumbs.innerHTML = galleryImages.map((img, i) => 
        `<div class="gallery-thumb ${i === 0 ? 'active' : ''}" data-index="${i}" onclick="galleryGoTo(${i})"><img data-img-id="${img.src}" alt="" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Crect fill='%23121828' width='60' height='60'/%3E%3C/svg%3E"></div>`
    ).join('');

    // 异步加载图片
    loadImagesIntoDOM(stage);
    loadImagesIntoDOM(thumbs);

    updateGalleryPositions();
}

function updateGalleryPositions() {
    const cards = document.querySelectorAll('.gallery-card');
    const total = cards.length;
    cards.forEach((card, i) => {
        card.className = 'gallery-card';
        let pos = i - galleryIndex;
        // 环绕
        if (pos > total / 2) pos -= total;
        if (pos < -total / 2) pos += total;

        if (pos === 0) card.classList.add('center');
        else if (pos === -1) card.classList.add('left-1');
        else if (pos === 1) card.classList.add('right-1');
        else if (pos === -2) card.classList.add('left-2');
        else if (pos === 2) card.classList.add('right-2');
        else card.classList.add('hidden');
    });

    // 更新信息
    const info = document.getElementById('galleryInfo');
    if (info) info.textContent = `${galleryIndex + 1} / ${galleryImages.length}`;

    // 更新缩略图
    document.querySelectorAll('.gallery-thumb').forEach((t, i) => {
        t.classList.toggle('active', i === galleryIndex);
    });

    // 滚动缩略图到可视区
    const activeThumb = document.querySelector('.gallery-thumb.active');
    if (activeThumb) activeThumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
}

function galleryNext() {
    if (galleryImages.length === 0) return;
    galleryIndex = (galleryIndex + 1) % galleryImages.length;
    updateGalleryPositions();
}

function galleryPrev() {
    if (galleryImages.length === 0) return;
    galleryIndex = (galleryIndex - 1 + galleryImages.length) % galleryImages.length;
    updateGalleryPositions();
}

function galleryGoTo(index) {
    galleryIndex = index;
    updateGalleryPositions();
}

// 键盘左右切换
document.addEventListener('keydown', (e) => {
    if (appState.currentTab !== 'gallery') return;
    if (e.key === 'ArrowLeft') galleryPrev();
    if (e.key === 'ArrowRight') galleryNext();
});

// 触摸滑动
let touchStartX = 0;
document.addEventListener('touchstart', (e) => {
    if (appState.currentTab !== 'gallery') return;
    touchStartX = e.touches[0].clientX;
});
document.addEventListener('touchend', (e) => {
    if (appState.currentTab !== 'gallery') return;
    const diff = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(diff) > 50) {
        if (diff > 0) galleryPrev();
        else galleryNext();
    }
});

// ============================================
// ★ 药水配方模块
// ============================================
function getRecipes() {
    const customs = loadData(STORAGE_KEYS.recipes) || [];
    return [...PRESET_RECIPES, ...customs];
}

function getCustomRecipes() {
    return loadData(STORAGE_KEYS.recipes) || [];
}

function renderRecipes() {
    const grid = document.getElementById('recipeGrid');
    if (!grid) return;
    const recipes = getRecipes();
    if (recipes.length === 0) {
        grid.innerHTML = '<div class="empty-state">暂无药水配方，点击「新增配方」创建</div>';
        return;
    }
    grid.innerHTML = recipes.map(r => `
        <div class="recipe-card">
            <div class="recipe-card-header">
                <div>
                    <span class="recipe-card-name">${r.name}</span>
                    ${r.isPreset ? '<span class="preset-badge">预设</span>' : ''}
                </div>
                <span class="recipe-card-type">${r.type}</span>
            </div>
            <div class="recipe-card-desc">${r.desc || ''}</div>
            <div class="recipe-materials">
                ${r.materials.map(m => `
                    <div class="recipe-material">
                        <span class="recipe-material-name">${m.name}</span>
                        <span class="recipe-material-ratio">${m.ratio}</span>
                    </div>
                `).join('')}
            </div>
            ${r.usage ? `<div style="font-size:11px; color:var(--text-tertiary); margin-bottom:12px; padding:8px 10px; background:var(--glass-input); border-radius:var(--radius-sm);">📋 ${r.usage}</div>` : ''}
            <div class="recipe-card-actions">
                <button onclick="importRecipeToRecord('${r.id}')">导入到冲洗</button>
                <button onclick="importRecipeToInventory('${r.id}')">导入到库存</button>
                ${!r.isPreset ? `<button class="del" onclick="deleteRecipe('${r.id}')">删除</button>` : `<button onclick="editRecipe('${r.id}')">查看</button>`}
            </div>
        </div>
    `).join('');
}

function openRecipeModal(id) {
    const recipe = id ? getRecipes().find(r => r.id === id) : null;
    openModal(`
        <div class="modal-header">
            <span class="modal-title">${recipe ? '编辑配方' : '新增药水配方'}</span>
            <button class="modal-close" onclick="closeModal()">
                <svg viewBox="0 0 24 24" fill="none" width="20" height="20"><path d="M6 6L18 18M6 18L18 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            </button>
        </div>
        <div class="modal-body">
            <div class="form-field" style="margin-bottom:12px;">
                <label>配方名称 <span class="required">*</span></label>
                <input type="text" id="recipeName" value="${recipe?.name || ''}" placeholder="如：自定义显影液">
            </div>
            <div class="form-field" style="margin-bottom:12px;">
                <label>药水类型</label>
                <select id="recipeType">
                    <option value="显影液" ${recipe?.type === '显影液' ? 'selected' : ''}>显影液</option>
                    <option value="停影液" ${recipe?.type === '停影液' ? 'selected' : ''}>停影液</option>
                    <option value="定影液" ${recipe?.type === '定影液' ? 'selected' : ''}>定影液</option>
                    <option value="润湿剂" ${recipe?.type === '润湿剂' ? 'selected' : ''}>润湿剂</option>
                    <option value="彩色显影液" ${recipe?.type === '彩色显影液' ? 'selected' : ''}>彩色显影液</option>
                    <option value="漂白液" ${recipe?.type === '漂白液' ? 'selected' : ''}>漂白液</option>
                    <option value="稳定液" ${recipe?.type === '稳定液' ? 'selected' : ''}>稳定液</option>
                    <option value="其他" ${recipe?.type === '其他' ? 'selected' : ''}>其他</option>
                </select>
            </div>
            <div class="form-field" style="margin-bottom:12px;">
                <label>配方描述</label>
                <textarea id="recipeDesc" rows="2" placeholder="配方特点、适用场景...">${recipe?.desc || ''}</textarea>
            </div>
            <div class="form-field" style="margin-bottom:12px;">
                <label>原材料与配比</label>
                <div id="recipeMaterials" style="display:flex;flex-direction:column;gap:8px;">
                    ${(recipe?.materials || [{name:'',ratio:''}]).map((m, i) => `
                        <div style="display:flex;gap:8px;align-items:center;">
                            <input type="text" value="${m.name}" placeholder="原材料名称" data-mat="name" style="flex:1;">
                            <input type="text" value="${m.ratio}" placeholder="比例/用量" data-mat="ratio" style="width:120px;">
                            <button type="button" class="row-remove" onclick="this.parentElement.remove()">×</button>
                        </div>
                    `).join('')}
                </div>
                <button type="button" class="btn btn-sm btn-outline" style="margin-top:8px;" onclick="addRecipeMaterial()">+ 添加原材料</button>
            </div>
            <div class="form-field">
                <label>使用说明</label>
                <textarea id="recipeUsage" rows="2" placeholder="温度、时间、注意事项...">${recipe?.usage || ''}</textarea>
            </div>
        </div>
        <div class="modal-footer">
            <button class="btn btn-ghost" onclick="closeModal()">取消</button>
            <button class="btn btn-primary" onclick="saveRecipe('${id || ''}')">保存配方</button>
        </div>
    `);
}

function addRecipeMaterial() {
    const container = document.getElementById('recipeMaterials');
    const div = document.createElement('div');
    div.style.cssText = 'display:flex;gap:8px;align-items:center;';
    div.innerHTML = `
        <input type="text" placeholder="原材料名称" data-mat="name" style="flex:1;">
        <input type="text" placeholder="比例/用量" data-mat="ratio" style="width:120px;">
        <button type="button" class="row-remove" onclick="this.parentElement.remove()">×</button>
    `;
    container.appendChild(div);
}

function saveRecipe(existingId) {
    const name = document.getElementById('recipeName').value.trim();
    if (!name) { toast('请输入配方名称', 'error'); return; }
    const type = document.getElementById('recipeType').value;
    const desc = document.getElementById('recipeDesc').value.trim();
    const usage = document.getElementById('recipeUsage').value.trim();
    const materials = [];
    document.querySelectorAll('#recipeMaterials > div').forEach(div => {
        const nameInput = div.querySelector('[data-mat="name"]');
        const ratioInput = div.querySelector('[data-mat="ratio"]');
        if (nameInput && nameInput.value.trim()) {
            materials.push({ name: nameInput.value.trim(), ratio: ratioInput.value.trim() });
        }
    });

    const customs = getCustomRecipes();
    if (existingId) {
        const idx = customs.findIndex(r => r.id === existingId);
        if (idx >= 0) {
            customs[idx] = { ...customs[idx], name, type, desc, materials, usage };
        } else {
            // 预设配方无法直接修改，另存为自定义
            customs.push({
                id: 'recipe-' + Date.now().toString(36),
                name: name + ' (副本)',
                type, desc, materials, usage,
                isPreset: false,
                createdAt: new Date().toISOString(),
            });
            saveData(STORAGE_KEYS.recipes, customs);
            closeModal();
            renderRecipes();
            toast('预设配方已另存为自定义副本', 'success');
            return;
        }
    } else {
        customs.push({
            id: 'recipe-' + Date.now().toString(36),
            name, type, desc, materials, usage,
            isPreset: false,
            createdAt: new Date().toISOString(),
        });
    }
    saveData(STORAGE_KEYS.recipes, customs);
    closeModal();
    renderRecipes();
    toast(existingId ? '配方已更新' : '配方已创建', 'success');
}

function editRecipe(id) {
    openRecipeModal(id);
}

function deleteRecipe(id) {
    openModal(`
        <div class="modal-header">
            <span class="modal-title">确认删除</span>
            <button class="modal-close" onclick="closeModal()">
                <svg viewBox="0 0 24 24" fill="none" width="20" height="20"><path d="M6 6L18 18M6 18L18 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            </button>
        </div>
        <div class="modal-body">
            <p style="font-size:14px;">确定要删除此药水配方吗？</p>
        </div>
        <div class="modal-footer">
            <button class="btn btn-ghost" onclick="closeModal()">取消</button>
            <button class="btn btn-danger-outline" onclick="confirmDeleteRecipe('${id}')">确认删除</button>
        </div>
    `);
}

function confirmDeleteRecipe(id) {
    let customs = getCustomRecipes();
    customs = customs.filter(r => r.id !== id);
    saveData(STORAGE_KEYS.recipes, customs);
    closeModal();
    renderRecipes();
    toast('配方已删除', 'success');
}

function importRecipeToRecord(recipeId) {
    const recipe = getRecipes().find(r => r.id === recipeId);
    if (!recipe) return;
    // 添加药水行
    addChemicalRow({
        type: recipe.type,
        brand: recipe.name,
        ratio: recipe.materials.map(m => `${m.name}:${m.ratio}`).join(', '),
    });
    toast(`配方「${recipe.name}」已导入到冲洗记录`, 'success');
    switchTab('new-record');
}

function importRecipeToInventory(recipeId) {
    const recipe = getRecipes().find(r => r.id === recipeId);
    if (!recipe) return;
    const inventory = getAllInventory();
    inventory.chemical = inventory.chemical || [];
    inventory.chemical.push({
        id: generateId(),
        type: recipe.type,
        brand: recipe.name,
        batch: '',
        ratio: recipe.materials.map(m => `${m.name}:${m.ratio}`).join(', '),
        volume: '',
        prepDate: new Date().toISOString().slice(0, 10),
        expiry: '',
        useCount: 0,
        status: '全新',
    });
    saveData(STORAGE_KEYS.inventory, inventory);
    toast(`配方「${recipe.name}」已导入到药水库存`, 'success');
    switchTab('inventory');
    switchInvTab('chemical');
}

function openRecipeImportModal() {
    const recipes = getRecipes();
    if (recipes.length === 0) { toast('暂无可用配方，请先在药水配方模块中创建', 'info'); return; }
    openModal(`
        <div class="modal-header">
            <span class="modal-title">从配方导入药水</span>
            <button class="modal-close" onclick="closeModal()">
                <svg viewBox="0 0 24 24" fill="none" width="20" height="20"><path d="M6 6L18 18M6 18L18 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            </button>
        </div>
        <div class="modal-body">
            <div style="display:flex;flex-direction:column;gap:8px;">
                ${recipes.map(r => `
                    <div style="padding:12px;background:var(--glass-input);border:1px solid var(--border-glass);border-radius:var(--radius-md);cursor:pointer;transition:var(--transition);" onmouseover="this.style.borderColor='var(--border-blue)'" onmouseout="this.style.borderColor='var(--border-glass)'" onclick="importRecipeToRecord('${r.id}')">
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
                            <span style="font-size:13px;font-weight:700;color:var(--text-primary);">${r.name}</span>
                            <span style="font-size:10px;padding:2px 8px;border-radius:10px;background:var(--ice-blue-soft);color:var(--ice-blue-light);border:1px solid var(--border-blue);">${r.type}</span>
                        </div>
                        <div style="font-size:11px;color:var(--text-tertiary);">${r.desc || ''}</div>
                        <div style="font-size:10px;color:var(--text-dim);margin-top:4px;">${r.materials.map(m => `${m.name} ${m.ratio}`).join(' · ')}</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `);
}

// ============================================
// ★ 清洗待办清单
// ============================================
function renderCleaningChecklist(existingItems, equipment) {
    const container = document.getElementById('cleaningItems');
    if (!container) return;
    container.innerHTML = '';

    let items = existingItems;
    if (!items || items.length === 0) {
        // 根据设备自动生成
        items = [];
        if (equipment && equipment.length > 0) {
            equipment.forEach(eq => {
                if (eq.type && eq.type !== '扫描仪' && eq.type !== '放大机') {
                    items.push({ name: `清洗${eq.type}${eq.model ? ' (' + eq.model + ')' : ''}`, done: false });
                }
            });
        }
        // 添加通用清洗项
        items.push({ name: '清洗显影罐及片芯', done: false });
        items.push({ name: '清洗温度计', done: false });
        items.push({ name: '清洗量杯/容器', done: false });
        items.push({ name: '清理工作台面', done: false });
    }

    items.forEach((item, i) => {
        addCleaningItemDOM(item.name, item.done);
    });
    updateCleaningProgress();
}

function addCleaningItemDOM(name, done) {
    const container = document.getElementById('cleaningItems');
    const div = document.createElement('div');
    div.className = `cleaning-item ${done ? 'done' : ''}`;
    div.onclick = function() { toggleCleaningItem(this); };
    div.innerHTML = `
        <div class="cleaning-checkbox">
            <svg viewBox="0 0 24 24" fill="none" width="12" height="12"><path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>
        <span class="cleaning-label">${name}</span>
    `;
    container.appendChild(div);
}

function toggleCleaningItem(element) {
    element.classList.toggle('done');
    updateCleaningProgress();
}

function addCleaningItem() {
    const input = document.getElementById('cleaningAddInput');
    const name = input.value.trim();
    if (!name) return;
    addCleaningItemDOM(name, false);
    input.value = '';
    updateCleaningProgress();
}

function updateCleaningProgress() {
    const items = document.querySelectorAll('#cleaningItems .cleaning-item');
    const done = document.querySelectorAll('#cleaningItems .cleaning-item.done');
    const progress = document.getElementById('cleaningProgress');
    if (progress) progress.textContent = `${done.length}/${items.length}`;
}

// ============================================
// ★ 药水交叉污染警告
// ============================================
// 全局待执行回调（用于污染警告确认后执行）
let _pendingContaminationCallback = null;

function showContaminationWarning(callback) {
    const settings = getSettings();
    if (settings.contaminationWarning === false) {
        if (callback) callback();
        return;
    }
    _pendingContaminationCallback = callback || null;
    openModal(`
        <div class="modal-header">
            <span class="modal-title" style="color:var(--danger);">⚠ 安全提醒</span>
            <button class="modal-close" onclick="closeModal()">
                <svg viewBox="0 0 24 24" fill="none" width="20" height="20"><path d="M6 6L18 18M6 18L18 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            </button>
        </div>
        <div class="modal-body contamination-warning">
            <div class="contamination-warning-icon">
                <svg viewBox="0 0 24 24" fill="none" width="36" height="36"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </div>
            <div class="contamination-warning-title">关键禁忌：药水禁止交叉污染</div>
            <div class="contamination-warning-desc">
                <strong style="color:var(--danger);">任何药水不要互相串罐！</strong><br>
                交叉污染 = 整卷报废
            </div>
            <ul class="contamination-warning-rules">
                <li>每种药水使用独立容器，严禁混用</li>
                <li>显影液、停影液、定影液容器必须分开标注</li>
                <li>搅拌棒/温度计每次使用后必须彻底清洗</li>
                <li>药水倒回储存瓶前确认瓶内为同种药水</li>
                <li>C41/E6彩色冲洗各步骤药水绝对不可混用</li>
            </ul>
            <div class="contamination-warning-confirm">
                <input type="checkbox" id="contaminationAck" onchange="document.getElementById('contaminationStartBtn').disabled = !this.checked;">
                <span>我已阅读并理解安全规则</span>
            </div>
        </div>
        <div class="modal-footer">
            <button class="btn btn-ghost" onclick="closeModal()">取消</button>
            <button class="btn btn-primary" id="contaminationStartBtn" disabled onclick="confirmContaminationWarning()">开始冲洗</button>
        </div>
    `);
}

function confirmContaminationWarning() {
    closeModal();
    if (typeof _pendingContaminationCallback === 'function') {
        const cb = _pendingContaminationCallback;
        _pendingContaminationCallback = null;
        cb();
    }
}

// ============================================
// ★ 按钮涟漪效果
// ============================================
function initRippleEffect() {
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn, .new-record-btn, .quick-btn, .timer-add-btn, .timer-ctrl-btn, .topbar-btn, .theme-toggle');
        if (!btn) return;
        const rect = btn.getBoundingClientRect();
        const ripple = document.createElement('span');
        ripple.className = 'btn-ripple';
        const size = Math.max(rect.width, rect.height);
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
        ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
        btn.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
    });
}
