/**
 * ============================================================
 * 设置系统 (settings.js)
 * ============================================================
 * 职责：
 *  1. 管理设置值（打字机速度、自动播放速度、音量）
 *  2. 持久化设置到 localStorage
 *  3. 提供设置 UI 的交互
 * ============================================================ */

const GameSettings = (function () {

    const SETTINGS_KEY = 'departures_settings';

    // --- 默认设置 ---
    const DEFAULT_SETTINGS = {
        typewriterSpeed: 5,     // 打字速度 1-10
        autoPlaySpeed: 5,       // 自动播放速度 1-10
        volume: 80,             // 音量 0-100
    };

    let currentSettings = {};

    // --- 加载设置（延迟调用，确保 DOM 已就绪）---
    let _loadCalled = false;
    function load() {
        if (_loadCalled) return; // 防止重复加载
        _loadCalled = true;
        try {
            const saved = localStorage.getItem(SETTINGS_KEY);
            if (saved) {
                currentSettings = Object.assign({}, DEFAULT_SETTINGS, JSON.parse(saved));
            } else {
                currentSettings = Object.assign({}, DEFAULT_SETTINGS);
            }
        } catch (e) {
            currentSettings = Object.assign({}, DEFAULT_SETTINGS);
        }
        syncUI();
    }

    // --- 同步 UI 控件到设置值 ---
    function syncUI() {
        const speedInput = document.getElementById('setting-speed');
        const speedValue = document.getElementById('speed-value');
        const autoSpeedInput = document.getElementById('setting-auto-speed');
        const autoSpeedValue = document.getElementById('auto-speed-value');
        const volumeInput = document.getElementById('setting-volume');
        const volumeValue = document.getElementById('volume-value');

        if (speedInput) speedInput.value = currentSettings.typewriterSpeed;
        if (speedValue) speedValue.textContent = currentSettings.typewriterSpeed;
        if (autoSpeedInput) autoSpeedInput.value = currentSettings.autoPlaySpeed;
        if (autoSpeedValue) autoSpeedValue.textContent = currentSettings.autoPlaySpeed;
        if (volumeInput) volumeInput.value = currentSettings.volume;
        if (volumeValue) volumeValue.textContent = currentSettings.volume + '%';
    }

    // --- 保存设置到 localStorage ---
    function persist() {
        try {
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(currentSettings));
        } catch (e) {
            console.warn('Failed to persist settings:', e);
        }
    }

    // --- 获取打字机速度 ---
    /**
     * @returns {number} 1-10
     */
    function getTypewriterSpeed() {
        return currentSettings.typewriterSpeed;
    }

    // --- 获取自动播放速度 ---
    /**
     * @returns {number} 1-10
     */
    function getAutoSpeed() {
        return currentSettings.autoPlaySpeed;
    }

    // --- 获取音量 ---
    /**
     * @returns {number} 0-100
     */
    function getVolume() {
        return currentSettings.volume;
    }

    // --- 设置打字机速度 ---
    function setTypewriterSpeed(val) {
        currentSettings.typewriterSpeed = Math.max(1, Math.min(10, parseInt(val) || 5));
        persist();
        const speedValue = document.getElementById('speed-value');
        if (speedValue) speedValue.textContent = currentSettings.typewriterSpeed;
    }

    // --- 设置自动播放速度 ---
    function setAutoSpeed(val) {
        currentSettings.autoPlaySpeed = Math.max(1, Math.min(10, parseInt(val) || 5));
        persist();
        const autoSpeedValue = document.getElementById('auto-speed-value');
        if (autoSpeedValue) autoSpeedValue.textContent = currentSettings.autoPlaySpeed;
    }

    // --- 设置音量 ---
    function setVolume(val) {
        currentSettings.volume = Math.max(0, Math.min(100, parseInt(val) || 80));
        persist();
        const volumeValue = document.getElementById('volume-value');
        if (volumeValue) volumeValue.textContent = currentSettings.volume + '%';
    }

    // --- 打开设置面板 ---
    function openPanel() {
        document.getElementById('settings-ui').classList.remove('hidden');
    }

    // --- 关闭设置面板 ---
    function closePanel() {
        document.getElementById('settings-ui').classList.add('hidden');
    }

    // --- 公开 API ---
    return {
        load: load,
        // 获取
        getTypewriterSpeed: getTypewriterSpeed,
        getAutoSpeed: getAutoSpeed,
        getVolume: getVolume,
        // 设置
        setTypewriterSpeed: setTypewriterSpeed,
        setAutoSpeed: setAutoSpeed,
        setVolume: setVolume,
        // UI
        openPanel: openPanel,
        closePanel: closePanel,
    };

})();
