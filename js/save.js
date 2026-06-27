/**
 * ============================================================
 * 存档/读档系统 (save.js)
 * ============================================================
 * 职责：
 *  1. 管理 6 个存档位
 *  2. 将游戏状态序列化到 localStorage
 *  3. 从 localStorage 恢复游戏状态
 *  4. 提供 UI 交互（显示存档槽、删除存档）
 *
 *  不依赖引擎内部，只依赖 Game.gameState 和 VNEngine 的公开 API
 * ============================================================ */

const GameSaveSystem = (function () {

    const SAVE_KEY = 'departures_save_data';
    const TOTAL_SLOTS = 6;

    // --- 存档数据结构 ---
    /**
     * 构造一个存档数据对象
     * @param {string} day - 当前天描述（如 "第一天"）
     * @param {string} dayKey - 天数 key（如 "day1"）
     * @param {string} phase - 当前阶段（reception / minigame / evening）
     * @param {number} dayIndex - 当前场景脚本中的索引位置
     * @param {number} money - 当前金钱
     * @param {string} sky - 天空颜色类名
     * @param {Array} ownedFurniture - 已购买的家具列表
     * @param {Array} history - 对话历史（最后100条）
     * @param {string} displayedText - 当前屏幕上显示的对话文本
     * @param {string} displayedSpeaker - 当前屏幕上显示的说话人
     * @param {number} dayNumber - 天数数字（1-7）
     */
    function createSaveData(day, dayKey, phase, dayIndex, nextIndex, money, sky, ownedFurniture, history, displayedText, displayedSpeaker, dayNumber) {
        return {
            version: 2,
            timestamp: new Date().toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }).replace(/\//g, '/'),
            day: day,
            dayKey: dayKey,
            phase: phase,
            dayIndex: dayIndex,
            nextIndex: nextIndex,
            money: money,
            sky: sky,
            ownedFurniture: ownedFurniture || [],
            history: history || [],
            displayedText: displayedText || '',
            displayedSpeaker: displayedSpeaker || '',
            dayNumber: dayNumber || 1,
        };
    }

    // --- 保存游戏 ---
    /**
     * 保存游戏到指定槽位
     * @param {number} slot - 存档槽位编号 (1-6)
     * @param {Object} options - 包含 dayKey, dayNumber, dayCommands, phase
     * @returns {boolean} 是否保存成功
     */
    function save(slot, options) {
        if (slot < 1 || slot > TOTAL_SLOTS) return false;

        try {
            options = options || {};
            var engineSnapshot = {};
            if (typeof VNEngine !== 'undefined' && VNEngine.getSaveSnapshot) {
                engineSnapshot = VNEngine.getSaveSnapshot() || {};
            }

            // 使用从游戏传过来的 currentText，或从引擎读取
            var displayedText = options.currentText || engineSnapshot.displayedText || '';
            if (!displayedText && typeof VNEngine !== 'undefined' && VNEngine.getCurrentText) {
                displayedText = VNEngine.getCurrentText() || '';
            }
            var displayedSpeaker = options.currentSpeaker || engineSnapshot.displayedSpeaker || '';
            if (typeof VNEngine !== 'undefined' && VNEngine.getCurrentSpeaker) {
                displayedSpeaker = displayedSpeaker || VNEngine.getCurrentSpeaker() || '';
            }

            var dayIndex = Number.isInteger(options.dayIndex) ? options.dayIndex : engineSnapshot.dayIndex;
            if (!Number.isInteger(dayIndex)) dayIndex = Game.gameState.dayIndex || 0;
            var nextIndex = Number.isInteger(options.nextIndex) ? options.nextIndex : engineSnapshot.nextIndex;
            if (!Number.isInteger(nextIndex)) nextIndex = dayIndex + 1;

            var allSaves = loadAllSaves();
            allSaves[slot - 1] = createSaveData(
                Game.gameState.day,
                options.dayKey || Game.currentDayKey,
                options.phase || Game.gameState.phase,
                dayIndex,
                nextIndex,
                Game.gameState.money,
                Game.gameState.sky,
                Game.gameState.ownedFurniture,
                Game.gameState.history ? Game.gameState.history.slice(-100) : [],
                displayedText,
                displayedSpeaker,
                options.dayNumber || Game.gameState.dayNumber || 1
            );
            localStorage.setItem(SAVE_KEY, JSON.stringify(allSaves));
            GameUI.notify('保存成功');
            return true;
        } catch (e) {
            console.error('Save failed:', e);
            GameUI.notify('保存失败');
            return false;
        }
    }

    // --- 读取所有存档 ---
    function loadAllSaves() {
        try {
            var data = localStorage.getItem(SAVE_KEY);
            if (!data) return new Array(TOTAL_SLOTS).fill(null);
            var parsed = JSON.parse(data);
            if (!Array.isArray(parsed)) return new Array(TOTAL_SLOTS).fill(null);
            while (parsed.length < TOTAL_SLOTS) parsed.push(null);
            return parsed.slice(0, TOTAL_SLOTS);
        } catch (e) {
            return new Array(TOTAL_SLOTS).fill(null);
        }
    }

    // --- 读取指定槽位的存档 ---
    function load(slot) {
        if (slot < 1 || slot > TOTAL_SLOTS) return null;
        var allSaves = loadAllSaves();
        return allSaves[slot - 1];
    }

    // --- 删除指定槽位的存档 ---
    function deleteSave(slot) {
        if (slot < 1 || slot > TOTAL_SLOTS) return false;
        try {
            var allSaves = loadAllSaves();
            allSaves[slot - 1] = null;
            localStorage.setItem(SAVE_KEY, JSON.stringify(allSaves));
            return true;
        } catch (e) {
            return false;
        }
    }

    // --- 是否有存档 ---
    function hasSave(slot) {
        return load(slot) !== null;
    }

    // --- 获取存档槽位信息（用于 UI 渲染）---
    function getSlotInfo(slot) {
        var save = load(slot);
        if (!save) {
            return {
                slot: slot,
                empty: true,
                day: '',
                text: '',
                detail: save ? save.timestamp : '',
            };
        }
        return {
            slot: slot,
            empty: false,
            day: save.day,
            text: save.displayedText,
            speaker: save.displayedSpeaker,
            timestamp: save.timestamp,
            phase: save.phase || 'reception',
            saveData: save,
        };
    }

    // --- 渲染存档/读档 UI ---
    /**
     * 打开存档/读档面板
     * @param {string} mode - 'save' 或 'load'
     * @param {Function} onLoadCallback - 读档完成回调（传入槽位号）
     * @param {Object} saveOptions - 存档时传入的选项
     */
    function openPanel(mode, onLoadCallback, saveOptions) {
        var panel = document.getElementById('save-load-ui');
        var title = document.getElementById('sl-title');
        var slots = document.getElementById('sl-slots');

        title.textContent = mode === 'save' ? '存档' : '读档';
        slots.innerHTML = '';

        for (let i = 1; i <= TOTAL_SLOTS; i++) {
            let info = getSlotInfo(i);
            let slotDiv = document.createElement('div');
            slotDiv.className = 'sl-slot';

            var content = '<span class="sl-slot-number">存档 ' + i + '</span>';
            content += '<div class="sl-slot-info">';

            if (info.empty) {
                content += '<div class="sl-slot-empty">空</div>';
            } else {
                content += '<div class="sl-slot-day">' + info.day + '</div>';
                var preview = info.text || (info.phase === 'minigame' ? '入俭中' : info.phase === 'evening' ? '晚间休息' : '');
                content += '<div class="sl-slot-detail">' + (info.speaker ? info.speaker + '：' : '旁白：') + preview.substring(0, 40) + (preview.length > 40 ? '...' : '') + '</div>';
                content += '<div class="sl-slot-detail" style="margin-top:4px;color:#555;">' + info.timestamp + '</div>';
            }

            content += '</div>';

            if (mode === 'save' && !info.empty) {
                content += '<button class="sl-slot-delete" data-slot="' + i + '">删除</button>';
            }

            slotDiv.innerHTML = content;

            slotDiv.addEventListener('click', function (e) {
                if (e.target.classList.contains('sl-slot-delete')) return;
                if (mode === 'save') {
                    if (!info.empty && !confirm('确定要覆盖存档 ' + i + ' 吗？')) return;
                    GameSaveSystem.save(i, saveOptions || {});
                    GameSaveSystem.closePanel();
                } else if (!info.empty) {
                    var confirmText = info.text || info.phase || '';
                    if (!confirm('读取存档 ' + i + '？\n' + info.day + '\n' + confirmText.substring(0, 30) + '...')) return;
                    onLoadCallback(i, info.saveData);
                }
            });

            var deleteBtn = slotDiv.querySelector('.sl-slot-delete');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', function (e) {
                    e.stopPropagation();
                    if (confirm('确定要删除这个存档吗？')) {
                        GameSaveSystem.deleteSave(i);
                        GameSaveSystem.openPanel(mode, onLoadCallback, saveOptions);
                    }
                });
            }

            slots.appendChild(slotDiv);
        }

        panel.classList.remove('hidden');
    }

    // --- 关闭存档/读档面板 ---
    function closePanel() {
        document.getElementById('save-load-ui').classList.add('hidden');
    }

    // --- 公开 API ---
    return {
        save: save,
        load: load,
        deleteSave: deleteSave,
        hasSave: hasSave,
        getSlotInfo: getSlotInfo,
        loadAllSaves: loadAllSaves,
        openPanel: openPanel,
        closePanel: closePanel,
        TOTAL_SLOTS: TOTAL_SLOTS,
    };

})();
