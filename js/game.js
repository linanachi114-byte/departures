/**
 * ============================================================
 * 主游戏控制器 (game.js)
 * ============================================================
 * 职责：
 *  1. 作为全局入口，串联引擎、存档、设置、小游戏、晚间系统
 *  2. 管理全局游戏状态（当前天数、阶段、金钱等）
 *  3. 处理场景之间的转换（对话→小游戏→晚间→睡觉）
 *  4. 管理主菜单、存档界面、历史记录等 UI 的打开/关闭
 *
 *  不依赖任何外部库，纯 Vanilla JS
 * ============================================================ */

// --- 全局游戏状态（通过 window 暴露给其他脚本访问）---
window.Game = {
    gameState: {
        day: '第一天',           // 当前天数字符串
        dayIndex: 0,             // 当前场景脚本的索引位置
        phase: 'reception',      // 当前阶段：reception | minigame | evening
        money: 0,                // 当前金钱
        sky: 'bg-gray',          // 当前天空颜色类名
        ownedFurniture: [],      // 已购买的家具 ID 列表
        history: [],             // 对话历史（用于历史日志）
        dayNumber: 1,            // 当前天数数字（1-7）
        currentDayCommands: [],  // 当前天完整脚本
    },

    currentDayKey: 'day1',       // 当前加载的天数 key
};

// --- 全局 UI 辅助对象（供其他模块调用通知）---
window.GameUI = {
    /**
     * 显示通知提示
     * @param {string} message - 提示文本
     */
    notify: function (message) {
        const notif = document.getElementById('notification');
        notif.textContent = message;
        notif.classList.remove('hidden');
        // 2秒后自动隐藏
        setTimeout(function () {
            notif.classList.add('hidden');
        }, 2000);
    },

    /**
     * 显示主菜单
     */
    showMenu: function () {
        document.getElementById('menu-ui').classList.remove('hidden');
        document.getElementById('vn-ui').classList.add('hidden');
        document.getElementById('minigame-ui').classList.add('hidden');
        document.getElementById('evening-ui').classList.add('hidden');

        // 检查是否有存档
        const hasSave = GameSaveSystem.hasSave(1);
        document.getElementById('btn-continue').disabled = !hasSave;
    },
};

// --- 主游戏控制器 ---
const GameController = (function () {

    /**
     * 初始化游戏（页面加载时调用）
     */
    function init() {
        // 初始化设置
        GameSettings.load();

        // 初始化引擎
        VNEngine.init({});

        // 初始化小游戏模块
        GameMinigame.init();

        // 初始化晚间系统
        GameEvening.init();

        // 绑定菜单按钮
        setupMenuButtons();

        // 绑定顶部按钮（设置、存档、读档、历史、自动、跳过）
        setupTopButtons();

        // 绑定设置面板按钮
        setupSettingsButtons();

        // 绑定存档/读档面板关闭按钮
        setupSLCloseButtons();

        // 绑定历史记录关闭按钮
        setupHistoryCloseButton();

        // 显示主菜单
        GameUI.showMenu();
    }

    /**
     * 设置菜单按钮事件
     */
    function setupMenuButtons() {
        document.getElementById('btn-new-game').addEventListener('click', function () {
            startNewGame();
        });

        document.getElementById('btn-continue').addEventListener('click', function () {
            // 读取第一个存档
            GameSaveSystem.openPanel('load', function (slot, saveData) {
                GameSaveSystem.closePanel();
                loadGame(slot, saveData);
            });
        });

        document.getElementById('btn-settings-menu').addEventListener('click', function () {
            GameSettings.openPanel();
        });
    }

    /**
     * 设置顶部按钮事件
     */
    function setupTopButtons() {
        // 设置
        document.getElementById('btn-settings').addEventListener('click', function () {
            GameSettings.openPanel();
        });

        // 存档
        document.getElementById('btn-save').addEventListener('click', function () {
            openSavePanel();
        });

        // 读档
        document.getElementById('btn-load').addEventListener('click', function () {
            openLoadPanel();
        });

        // 历史
        document.getElementById('btn-history').addEventListener('click', function () {
            openHistory();
        });

        // 自动播放
        document.getElementById('btn-auto').addEventListener('click', function () {
            const playing = VNEngine.toggleAutoPlay();
            if (playing) GameUI.notify('自动播放：开');
            else GameUI.notify('自动播放：关');
        });

        // 快进
        document.getElementById('btn-skip').addEventListener('click', function () {
            const skipping = VNEngine.toggleSkip();
            if (skipping) GameUI.notify('快进：开');
            else GameUI.notify('快进：关');
        });
    }

    /**
     * 设置设置面板按钮事件
     */
    function setupSettingsButtons() {
        // 打字机速度
        document.getElementById('setting-speed').addEventListener('input', function () {
            GameSettings.setTypewriterSpeed(this.value);
        });

        // 自动播放速度
        document.getElementById('setting-auto-speed').addEventListener('input', function () {
            GameSettings.setAutoSpeed(this.value);
        });

        // 音量
        document.getElementById('setting-volume').addEventListener('input', function () {
            GameSettings.setVolume(this.value);
        });

        // 关闭
        document.getElementById('btn-settings-close').addEventListener('click', function () {
            GameSettings.closePanel();
        });

        // 点击遮罩关闭
        document.getElementById('settings-overlay').addEventListener('click', function () {
            GameSettings.closePanel();
        });
    }

    /**
     * 设置存档/读档面板关闭按钮
     */
    function setupSLCloseButtons() {
        document.getElementById('btn-sl-close').addEventListener('click', function () {
            GameSaveSystem.closePanel();
        });
        document.getElementById('sl-overlay').addEventListener('click', function () {
            GameSaveSystem.closePanel();
        });
    }

    /**
     * 设置历史记录关闭按钮
     */
    function setupHistoryCloseButton() {
        document.getElementById('btn-history-close').addEventListener('click', function () {
            document.getElementById('history-ui').classList.add('hidden');
        });
        document.getElementById('history-overlay').addEventListener('click', function () {
            document.getElementById('history-ui').classList.add('hidden');
        });
    }

    /**
     * 打开历史记录面板
     */
    function openHistory() {
        const log = document.getElementById('history-log');
        log.innerHTML = '';

        const history = Game.gameState.history || [];
        if (history.length === 0) {
            log.innerHTML = '<p style="text-align:center;color:#555;padding:40px;">还没有对话记录。</p>';
        } else {
            history.forEach(function (entry) {
                const div = document.createElement('div');
                div.className = 'hl-entry';
                if (entry.speaker) {
                    div.innerHTML = '<span class="hl-speaker">' + entry.speaker + '</span>: <span class="hl-text">' + entry.text + '</span>';
                } else {
                    div.innerHTML = '<span class="hl-speaker narrator">旁白</span>: <span class="hl-text">' + entry.text + '</span>';
                }
                log.appendChild(div);
            });
        }

        document.getElementById('history-ui').classList.remove('hidden');
    }

    function openSavePanel() {
        var snapshot = {};
        if (typeof VNEngine !== 'undefined' && VNEngine.getSaveSnapshot) {
            snapshot = VNEngine.getSaveSnapshot() || {};
        }
        var saveOptions = {
            dayKey: Game.currentDayKey,
            dayNumber: Game.gameState.dayNumber,
            phase: Game.gameState.phase,
            dayIndex: snapshot.dayIndex,
            nextIndex: snapshot.nextIndex,
            currentText: snapshot.displayedText,
            currentSpeaker: snapshot.displayedSpeaker,
        };
        GameSaveSystem.openPanel('save', null, saveOptions);
    }

    function openLoadPanel() {
        GameSaveSystem.openPanel('load', function (slot, saveData) {
            GameSaveSystem.closePanel();
            loadGame(slot, saveData);
        });
    }

    // ================================================================
    // 游戏流程控制
    // ================================================================

    /**
     * 开始新游戏
     */
    function startNewGame() {
        // 重置游戏状态
        Game.gameState = {
            day: '第一天',
            dayIndex: 0,
            phase: 'reception',
            money: 0,
            sky: 'bg-gray',
            ownedFurniture: [],
            history: [],
            dayNumber: 1,
            currentDayCommands: [],
        };
        Game.currentDayKey = 'day1';

        // 隐藏菜单
        document.getElementById('menu-ui').classList.add('hidden');

        // 加载第一天
        loadDay('day1', 1);
    }

    /**
     * 加载存档
     * @param {number} slot - 存档槽位
     * @param {Object} saveData - 存档数据
     */
    function loadGame(slot, saveData) {
        var dayKey = saveData.dayKey || ('day' + (saveData.dayNumber || 1));
        var dayData = DAYS_DATA[dayKey];
        if (!dayData) {
            GameUI.notify('读档失败：找不到当天数据');
            return;
        }

        // 恢复游戏状态
        Game.gameState.day = saveData.day;
        Game.gameState.dayIndex = saveData.dayIndex || 0;
        Game.gameState.phase = saveData.phase;
        Game.gameState.money = saveData.money;
        Game.gameState.sky = saveData.sky;
        Game.gameState.ownedFurniture = saveData.ownedFurniture || [];
        Game.gameState.history = saveData.history || [];
        Game.gameState.dayNumber = saveData.dayNumber || 1;
        Game.gameState.currentDayCommands = dayData.commands;

        // 确定当前天的 key
        Game.currentDayKey = dayKey;

        // 隐藏菜单
        document.getElementById('menu-ui').classList.add('hidden');

        // 根据阶段决定从哪里开始
        if (saveData.phase === 'reception') {
            // 从对话阶段开始：获取完整命令数组，从存档索引加载
            VNEngine.loadFromIndex(
                dayData.commands,
                saveData.dayIndex || 0,
                saveData.displayedText || '',
                saveData.sky || '',
                function (phase, data) {
                    onPhaseChange(phase, data);
                }
            );
        } else if (saveData.phase === 'minigame') {
            // 直接跳到小游戏（跳过对话）
            Game.gameState.phase = 'minigame';
            startMinigamePhaseFromSave(saveData);
        } else if (saveData.phase === 'evening') {
            // 跳到晚间阶段
            Game.gameState.phase = 'evening';
            startEveningPhaseFromSave(saveData);
        } else {
            loadDay(Game.currentDayKey, Game.gameState.dayNumber);
        }
    }

    /**
     * 加载某一天（从命令数组精确恢复）
     * @param {string} dayKey - 天数 key
     * @param {number} dayNum - 天数数字
     * @param {Array} commands - 当天完整命令数组
     * @param {number} startIndex - 从命令数组中的哪个索引开始
     */
    function loadDayWithCommands(dayKey, dayNum, commands, startIndex) {
        const dayData = DAYS_DATA[dayKey];
        if (!dayData) {
            console.error('Day data not found:', dayKey);
            return;
        }

        Game.currentDayKey = dayKey;
        Game.gameState.dayNumber = dayNum;
        Game.gameState.day = dayData.day;
        Game.gameState.dayIndex = startIndex;
        Game.gameState.currentDayCommands = commands; // 保存命令数组供存档使用

        // 创建从 startIndex 开始的命令子数组
        var remainingCommands = commands.slice(startIndex);

        // 将引擎的脚本替换为剩余命令
        if (remainingCommands.length > 0) {
            VNEngine.loadScene(remainingCommands, function (phase, data) {
                onPhaseChange(phase, data);
            });
        }

        // 恢复当前显示的对话文本（如果有）
        if (startIndex < commands.length) {
            var currentCmd = commands[startIndex];
            if (currentCmd) {
                // 立即显示当前命令的文本（不打字机效果）
                if (currentCmd.type === 'dialogue') {
                    showImmediateDialogue(currentCmd.speaker, currentCmd.text, currentCmd.color);
                } else if (currentCmd.type === 'narration') {
                    showImmediateNarration(currentCmd.text, currentCmd.bg);
                }
            }
        }

        // 触发引擎执行下一条
        if (remainingCommands.length > 0) {
            VNEngine.handleDialogueClick();
        }
    }

    /**
     * 立即显示对话（无打字机效果）
     */
    function showImmediateDialogue(speaker, text, color) {
        VNEngine.stopTypewriter();
        var speakerEl = document.getElementById('speaker-name');
        var textEl = document.getElementById('dialogue-text');
        if (speakerEl) {
            if (speaker) {
                speakerEl.textContent = speaker;
                speakerEl.classList.remove('narrator');
                speakerEl.style.color = color || '';
            } else {
                speakerEl.textContent = '旁白';
                speakerEl.classList.add('narrator');
                speakerEl.style.color = '';
            }
        }
        if (textEl) textEl.textContent = text;
    }

    /**
     * 立即显示旁白
     */
    function showImmediateNarration(text, bg) {
        VNEngine.stopTypewriter();
        var speakerEl = document.getElementById('speaker-name');
        var textEl = document.getElementById('dialogue-text');
        if (speakerEl) {
            speakerEl.textContent = '旁白';
            speakerEl.classList.add('narrator');
            speakerEl.style.color = '';
        }
        if (textEl) textEl.textContent = text;
        if (bg) {
            var bgLayer = document.getElementById('background-layer');
            if (bgLayer) {
                bgLayer.className = '';
                bgLayer.classList.add('bg-' + bg);
            }
        }
    }

    /**
     * 从存档小游戏阶段恢复
     */
    function startMinigamePhaseFromSave(saveData) {
        var dayData = DAYS_DATA[saveData.dayKey || Game.currentDayKey];
        if (dayData) {
            for (var i = 0; i < dayData.commands.length; i++) {
                if (dayData.commands[i].type === 'minigame') {
                    VNEngine.restoreProgress(dayData.commands, saveData.nextIndex || i + 1);
                    GameMinigame.start(dayData.commands[i].data);
                    return;
                }
            }
        }
    }

    /**
     * 从存档晚间阶段恢复
     */
    function startEveningPhaseFromSave(saveData) {
        var dayData = DAYS_DATA[saveData.dayKey || Game.currentDayKey];
        if (dayData) {
            for (var i = 0; i < dayData.commands.length; i++) {
                if (dayData.commands[i].type === 'evening') {
                    var eveningData = Object.assign({}, dayData.commands[i].data, {
                        money: Game.gameState.money,
                        news: NEWS_DATA['day' + Game.gameState.dayNumber] || [],
                    });
                    VNEngine.restoreProgress(dayData.commands, saveData.nextIndex || i + 1);
                    GameEvening.start(eveningData);
                    return;
                }
            }
        }
    }

    /**
     * 加载某一天（正常流程，非存档）
     * @param {string} dayKey - 天数 key（如 'day1'）
     * @param {number} dayNum - 天数数字
     * @param {number} [skipToIndex] - 可选：从脚本中的哪个索引开始（读档用）
     */
    function loadDay(dayKey, dayNum, skipToIndex) {
        var dayData = DAYS_DATA[dayKey];
        if (!dayData) {
            console.error('Day data not found:', dayKey);
            return;
        }

        var dayCommands = dayData.commands;

        Game.currentDayKey = dayKey;
        Game.gameState.dayNumber = dayNum;
        Game.gameState.day = dayData.day;
        Game.gameState.dayIndex = skipToIndex || 0;
        Game.gameState.currentDayCommands = dayCommands;

        // 加载场景
        VNEngine.loadScene(dayCommands, function (phase, data) {
            onPhaseChange(phase, data);
        });
    }

    /**
     * 阶段转换回调（由引擎调用）
     * 当引擎遇到 minigame/evening/sleep/menu 指令时触发
     * @param {string} phase - 阶段：minigame | evening | sleep | menu
     * @param {Object} data - 阶段数据
     */
    function onPhaseChange(phase, data) {
        switch (phase) {
            case 'minigame':
                Game.gameState.phase = 'minigame';
                startMinigamePhase();
                break;
            case 'evening':
                Game.gameState.phase = 'evening';
                startEveningPhase();
                break;
            case 'sleep':
                Game.gameState.phase = 'sleep';
                startSleepPhase(data);
                break;
            case 'menu':
                // 游戏结束，返回主菜单
                GameUI.showMenu();
                break;
        }
    }

    /**
     * 开始入俭小游戏阶段
     */
    function startMinigamePhase() {
        // 使用当前天的命令数组查找 minigame
        var commands = Game.gameState.currentDayCommands || [];
        for (var i = 0; i < commands.length; i++) {
            if (commands[i].type === 'minigame') {
                GameMinigame.start(commands[i].data);
                return;
            }
        }
        // 如果没找到，尝试从 DAYS_DATA 中查找
        var dayData = DAYS_DATA[Game.currentDayKey];
        if (dayData) {
            for (var j = 0; j < dayData.commands.length; j++) {
                if (dayData.commands[j].type === 'minigame') {
                    GameMinigame.start(dayData.commands[j].data);
                    return;
                }
            }
        }
    }

    /**
     * 小游戏完成回调
     */
    function onMinigameComplete() {
        GameMinigame.hide();
        // 小游戏完成后，继续执行引擎（下一句指令应该是 evening 或 sleep）
        VNEngine.handleDialogueClick();
    }

    /**
     * 开始晚间休息阶段
     */
    function startEveningPhase() {
        // 使用当前天的命令数组查找 evening
        var commands = Game.gameState.currentDayCommands || [];
        let eveningData = null;
        for (var i = 0; i < commands.length; i++) {
            if (commands[i].type === 'evening') {
                eveningData = commands[i].data;
                break;
            }
        }

        // 如果没找到，尝试从 DAYS_DATA 中查找
        if (!eveningData) {
            var dayData = DAYS_DATA[Game.currentDayKey];
            if (dayData) {
                for (var j = 0; j < dayData.commands.length; j++) {
                    if (dayData.commands[j].type === 'evening') {
                        eveningData = dayData.commands[j].data;
                        break;
                    }
                }
            }
        }

        if (eveningData) {
            var reward = eveningData.money || 0;
            Game.gameState.money += reward;
            var eveningState = Object.assign({}, eveningData, {
                money: Game.gameState.money,
                news: NEWS_DATA['day' + Game.gameState.dayNumber] || [],
            });
            GameEvening.start(eveningState);
        }
    }

    /**
     * 晚间完成回调
     */
    function onEveningComplete() {
        GameEvening.hide();
        // 晚间完成后，继续执行引擎（下一句指令应该是 sleep）
        VNEngine.handleDialogueClick();
    }

    /**
     * 开始睡觉阶段（进入下一天）
     * @param {Object} data - 睡觉指令的数据
     */
    function startSleepPhase(data) {
        const nextDayKey = data && data.nextDay;
        if (nextDayKey) {
            // 加载下一天
            const nextDayNum = parseInt(nextDayKey.replace(/\D/g, ''));
            loadDay(nextDayKey, nextDayNum);
        }
    }

    // ================================================================
    // 公开 API（供其他模块回调调用）
    // ================================================================
    return {
        init: init,
        openMenu: GameUI.showMenu,
        openSavePanel: openSavePanel,
        openLoadPanel: openLoadPanel,
        openHistory: openHistory,
        onMinigameComplete: onMinigameComplete,
        onEveningComplete: onEveningComplete,
        onPhaseChange: onPhaseChange,
    };

})();

// --- 页面加载完成后初始化游戏 ---
function startGame() {
    console.log('Departures: Starting game initialization...');
    try {
        GameController.init();
        console.log('Departures: Game initialized successfully');
    } catch (e) {
        console.error('Departures: Failed to initialize:', e);
        var errorDiv = document.getElementById('loading-error');
        var errorMsg = document.getElementById('error-message');
        if (errorDiv) {
            errorDiv.style.display = 'block';
            errorMsg.textContent = e.message || String(e);
        }
    }
}

// 尝试 DOMContentLoaded，如果已触发则立即执行
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startGame);
} else {
    // DOM 已经就绪（可能在页面加载完成后脚本才执行）
    startGame();
}
