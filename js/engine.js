/**
 * ============================================================
 * 视觉小说引擎核心 (engine.js)
 * ============================================================
 * 职责：
 *  1. 解析场景脚本数据（对话、场景切换、阶段转换）
 *  2. 渲染对话文本（打字机效果）
 *  3. 管理当前播放状态（指针、自动播放、跳过）
 *  4. 触发阶段转换事件（到小游戏、到晚间、到睡觉）
 *
 *  与其他模块解耦：不直接依赖 save.js / settings.js / minigame.js
 *  通过回调函数和事件机制与其他模块通信
 * ============================================================ */

const VNEngine = (function () {

    // --- 内部状态 ---
    let script = [];            // 当前场景的脚本数据（数组，每项是一个"指令"）
    let currentIndex = 0;       // 当前执行到的脚本索引
    let isTyping = false;       // 是否正在打字机输出中
    let typewriterTimer = null; // 打字机定时器
    let autoPlayTimer = null;   // 自动播放定时器
    let skipTimer = null;       // 长按/快进定时器
    let isAutoPlay = false;     // 自动播放是否开启
    let isSkip = false;         // 跳过模式是否开启
    let onCompleteCallback = null; // 场景完成时的回调
    let currentRightCharacter = ''; // 当前右侧委托人立绘

    // --- DOM 引用（延迟获取，避免空引用）---
    let dom = {};

    const CHARACTER_SPRITES = {
        '你': 'images/characters/入殓师.png',
        '入殓师': 'images/characters/入殓师.png',
        '林柚': 'images/characters/林柚.png',
        '林建国': 'images/characters/林建国.png',
        '赵国强': 'images/characters/赵国强.png',
        '赵德明': 'images/characters/赵德明.png',
        '苏晚': 'images/characters/苏晚.png',
        '周明远': 'images/characters/周明远.png',
        '陈念': 'images/characters/陈念.png',
        '白羽': 'images/characters/白羽.png',
        '吴敏': 'images/characters/吴敏.png',
        '吴静宜': 'images/characters/吴静宜.png',
        '秦守业': 'images/characters/秦守业.png',
        '桂英': 'images/characters/桂英.png',
        '秦桂英': 'images/characters/桂英.png',
        '镜像委托人': 'images/characters/镜像委托人.png',
    };

    // --- 初始化引擎 ---
    /**
     * 初始化引擎，绑定 DOM 引用
     * @param {Object} elements - DOM 元素集合
     */
    function init(elements) {
        dom = {
            container: document.getElementById('game-container'),
            bgLayer: document.getElementById('background-layer'),
            vnUi: document.getElementById('vn-ui'),
            speakerName: document.getElementById('speaker-name'),
            dialogueText: document.getElementById('dialogue-text'),
            dialogueHint: document.getElementById('dialogue-hint'),
            dayIndicator: document.getElementById('day-indicator'),
            dialogueBox: document.getElementById('dialogue-box'),
            spriteLeft: document.getElementById('sprite-left'),
            spriteRight: document.getElementById('sprite-right'),
        };

        // 安全处理：确保 DOM 元素存在
        if (!dom.dialogueBox) {
            console.warn('VNEngine: dialogueBox not found, click handler skipped');
            return;
        }

        // 点击对话框推进下一步
        dom.dialogueBox.addEventListener('click', handleDialogueClick);

        // 键盘快捷键
        document.addEventListener('keydown', handleKeyboard);
        document.addEventListener('keyup', handleKeyup);

        initCharacterSprites();
    }

    // --- 加载场景脚本 ---
    /**
     * 加载并播放一个场景
     * @param {Array} sceneScript - 场景脚本数组
     * @param {Function} onPhaseChange - 阶段转换回调
     */
    function loadScene(sceneScript, onPhaseChange) {
        // 从索引 0 开始正常加载
        _loadScene(sceneScript, 0, onPhaseChange, '');
    }

    /**
     * 内部加载方法：从指定索引开始加载
     * @param {Array} sceneScript - 场景脚本
     * @param {number} startFrom - 从脚本中的哪个索引开始
     * @param {Function} onPhaseChange - 阶段转换回调
     * @param {string} initialText - 立即显示的初始文本（读档用）
     */
    function _loadScene(sceneScript, startFrom, onPhaseChange, initialText) {
        script = sceneScript;
        currentIndex = startFrom;
        isTyping = false;
        stopAutoPlay();
        setSkipMode(false);
        onCompleteCallback = null;
        currentRightCharacter = '';
        updateCharacterSprites('');

        // 隐藏其他界面，显示 VN 界面
        hideAllUI();
        dom.vnUi.classList.remove('hidden');

        if (initialText) {
            // 读档模式：立即显示存档时的文本，不执行打字机
            var cmd = script[startFrom];
            if (cmd && (cmd.type === 'dialogue' || cmd.type === 'narration')) {
                showImmediateDialogue(cmd.speaker || '', initialText, cmd.bg, cmd.color);
            }
            return;
        }

        // 正常模式：开始执行脚本
        executeNext();
    }

    /**
     * 立即显示对话（无打字机效果，读档用）
     * @param {string} speaker - 说话人
     * @param {string} text - 文本
     * @param {string} bg - 背景类名（可选）
     * @param {string} color - 文字颜色（可选）
     */
    function showImmediateDialogue(speaker, text, bg, color) {
        stopTypewriter();

        // 设置说话人
        if (speaker) {
            dom.speakerName.textContent = speaker;
            dom.speakerName.classList.remove('narrator');
            dom.speakerName.style.color = color || '';
        } else {
            dom.speakerName.textContent = '旁白';
            dom.speakerName.classList.add('narrator');
            dom.speakerName.style.color = '';
        }

        updateCharacterSprites(speaker);

        // 设置背景
        if (bg) {
            setScene(bg);
        }

        // 显示文本
        dom.dialogueText.textContent = text;
    }

    /**
     * 获取当前正在显示的文本（用于存档）
     * @returns {string} 当前显示的文本
     */
    function getCurrentText() {
        if (currentIndex > 0 && currentIndex <= script.length) {
            var cmd = script[currentIndex - 1];
            if (cmd && cmd.text) return cmd.text;
        }
        return '';
    }

    /**
     * 获取当前说话人（用于存档）
     * @returns {string} 当前说话人
     */
    function getCurrentSpeaker() {
        if (currentIndex > 0 && currentIndex <= script.length) {
            var cmd = script[currentIndex - 1];
            if (cmd && cmd.speaker !== undefined) return cmd.speaker;
        }
        return '';
    }

    /**
     * 获取当前可存档的引擎进度。
     */
    function getSaveSnapshot() {
        var displayedIndex = Math.max(0, currentIndex - 1);
        return {
            dayIndex: displayedIndex,
            nextIndex: currentIndex,
            displayedText: getCurrentText(),
            displayedSpeaker: getCurrentSpeaker(),
        };
    }

    function syncGameProgress(commandIndex) {
        if (typeof Game !== 'undefined' && Game.gameState) {
            Game.gameState.dayIndex = commandIndex;
        }
    }

    function stopAutoPlay(revealText) {
        if (autoPlayTimer) {
            clearTimeout(autoPlayTimer);
            autoPlayTimer = null;
        }
        if (revealText && isTyping) {
            revealCurrentText();
        }
        isAutoPlay = false;
        const btn = document.getElementById('btn-auto');
        if (btn) btn.classList.remove('active');
    }

    function toggleAutoPlay() {
        if (isAutoPlay) {
            stopAutoPlay(true);
            return false;
        }

        isAutoPlay = true;
        setSkipMode(false);
        const btn = document.getElementById('btn-auto');
        if (btn) btn.classList.add('active');

        if (isTyping) revealCurrentText();
        scheduleAutoAdvance();
        return true;
    }

    // --- 执行下一条指令 ---
    function executeNext() {
        if (currentIndex >= script.length) {
            // 场景执行完毕
            onSceneComplete();
            return;
        }

        const command = script[currentIndex];
        currentIndex++;
        syncGameProgress(currentIndex - 1);

        switch (command.type) {
            case 'dialogue':
                // 记录对话到历史
                recordHistory(command.speaker, command.text);
                if (command.bg) setScene(command.bg);
                if (isSkip) {
                    showImmediateDialogue(command.speaker, command.text, command.bg, command.color);
                    scheduleSkipStep();
                } else {
                    showDialogue(command.speaker, command.text, command.color);
                }
                break;
            case 'narration':
                // 旁白也记录到历史
                recordHistory('', command.text);
                if (isSkip) {
                    showImmediateDialogue('', command.text, command.bg, command.color);
                    scheduleSkipStep();
                } else {
                    showNarration(command.text, command.bg);
                }
                break;
            case 'scene':
                setScene(command.bg);
                // 场景切换后立即执行下一条
                executeNext();
                return;
            case 'set-sky':
                setSky(command.color);
                // 继续执行下一条
                executeNext();
                return;
            case 'set-day':
                dom.dayIndicator.textContent = command.text;
                // 继续执行下一条
                executeNext();
                return;
            case 'minigame':
                // 触发小游戏阶段
                triggerPhase('minigame', command.data);
                return;
            case 'evening':
                // 触发晚间阶段
                triggerPhase('evening', command.data);
                return;
            case 'sleep':
                // 触发睡觉（进入下一天）
                triggerPhase('sleep', command.data);
                return;
            case 'menu':
                // 返回主菜单
                triggerPhase('menu', null);
                return;
            default:
                console.warn('Unknown command type:', command.type);
                executeNext();
                return;
        }
    }

    // --- 显示对话 ---
    /**
     * 在对话框中显示一段对话（打字机效果）
     * @param {string} speaker - 说话人名字（空字符串表示旁白）
     * @param {string} text - 对话文本
     * @param {string} [color] - 说话人颜色（可选）
     */
    function showDialogue(speaker, text, color) {
        stopTypewriter(); // 先停止任何正在进行的打字机
        updateCharacterSprites(speaker);

        // 设置说话人名字
        if (speaker) {
            dom.speakerName.textContent = speaker;
            dom.speakerName.classList.remove('narrator');
            if (color) {
                dom.speakerName.style.color = color;
            } else {
                dom.speakerName.style.color = '';
            }
        } else {
            dom.speakerName.textContent = '旁白';
            dom.speakerName.classList.add('narrator');
            dom.speakerName.style.color = '';
        }

        // 自动播放模式：打字机效果，完成后自动推进
        if (isAutoPlay && !isSkip) {
            typewriterEffect(text, function () {
                if (isAutoPlay && !isSkip) scheduleAutoAdvance();
            });
            return;
        }

        // 非自动播放模式：打字机输出
        typewriterEffect(text, function () {
            // 打字完成后，如果在自动播放模式则继续
            // （上面的 if 分支已处理，这里是兜底）
        });
    }

    /**
     * 在对话框中显示旁白。
     * @param {string} text - 旁白文本
     * @param {string} [bg] - 背景类名
     */
    function showNarration(text, bg) {
        if (bg) setScene(bg);
        showDialogue('', text);
    }

    function initCharacterSprites() {
        if (!dom.spriteLeft || !dom.spriteRight) return;
        dom.spriteLeft.src = CHARACTER_SPRITES['你'];
        dom.spriteLeft.classList.remove('hidden');
        dom.spriteRight.classList.add('hidden');
        updateCharacterSprites('');
    }

    function updateCharacterSprites(speaker) {
        if (!dom.spriteLeft || !dom.spriteRight) return;

        dom.spriteLeft.src = CHARACTER_SPRITES['你'];
        dom.spriteLeft.classList.remove('hidden', 'speaking');
        dom.spriteRight.classList.remove('speaking');

        if (speaker && speaker !== '你') {
            var rightSrc = CHARACTER_SPRITES[speaker];
            if (rightSrc) {
                currentRightCharacter = speaker;
                dom.spriteRight.src = rightSrc;
                dom.spriteRight.alt = speaker + '立绘';
                dom.spriteRight.classList.remove('hidden');
            }
        } else if (currentRightCharacter && CHARACTER_SPRITES[currentRightCharacter]) {
            dom.spriteRight.src = CHARACTER_SPRITES[currentRightCharacter];
            dom.spriteRight.alt = currentRightCharacter + '立绘';
            dom.spriteRight.classList.remove('hidden');
        } else {
            dom.spriteRight.classList.add('hidden');
        }

        if (speaker === '你') {
            dom.spriteLeft.classList.add('speaking');
        } else if (speaker && speaker !== '你' && !dom.spriteRight.classList.contains('hidden')) {
            dom.spriteRight.classList.add('speaking');
        }
    }

    function restoreRightCharacterFromScript(commands, startIndex) {
        currentRightCharacter = '';
        for (var i = Math.min(startIndex, commands.length - 1); i >= 0; i--) {
            var cmd = commands[i];
            if (cmd && cmd.speaker && cmd.speaker !== '你' && CHARACTER_SPRITES[cmd.speaker]) {
                currentRightCharacter = cmd.speaker;
                return;
            }
        }
    }

    // --- 打字机效果 ---
    /**
     * 逐字显示文本
     * @param {string} text - 要显示的文本
     * @param {Function} onComplete - 完成回调
     */
    function typewriterEffect(text, onComplete) {
        stopTypewriter();

        dom.dialogueText.textContent = '';
        isTyping = true;

        const speed = typeof GameSettings !== 'undefined' ? GameSettings.getTypewriterSpeed() : 5;
        const charInterval = Math.max(20, 120 - speed * 11); // 速度1=120ms, 速度10=20ms

        let charIndex = 0;

        typewriterTimer = setInterval(() => {
            if (charIndex < text.length) {
                dom.dialogueText.textContent += text[charIndex];
                charIndex++;
            } else {
                stopTypewriter();
                if (onComplete) onComplete();
            }
        }, charInterval);
    }

    // --- 停止打字机 ---
    function stopTypewriter() {
        if (typewriterTimer) {
            clearInterval(typewriterTimer);
            typewriterTimer = null;
        }
        isTyping = false;
    }

    function revealCurrentText() {
        stopTypewriter();
        const command = script[currentIndex - 1];
        if (command && command.text) {
            dom.dialogueText.textContent = command.text;
        }
    }

    function scheduleAutoAdvance() {
        if (!isAutoPlay || isSkip || dom.vnUi.classList.contains('hidden')) return;
        if (autoPlayTimer) clearTimeout(autoPlayTimer);
        const autoSpeed = typeof GameSettings !== 'undefined' ? GameSettings.getAutoSpeed() : 5;
        const delay = Math.max(220, 1200 - autoSpeed * 90);
        autoPlayTimer = setTimeout(function () {
            autoPlayTimer = null;
            if (isAutoPlay && !isSkip && !dom.vnUi.classList.contains('hidden')) {
                executeNext();
            }
        }, delay);
    }

    // --- 处理对话框点击 ---
    function handleDialogueClick() {
        if (isAutoPlay) {
            // 自动播放模式：点击立即推进到下一条（不等待打字机或定时器）
            stopTypewriter();
            if (autoPlayTimer) {
                clearTimeout(autoPlayTimer);
                autoPlayTimer = null;
            }
            executeNext();
            return;
        }

        if (isTyping) {
            // 打字机未结束：瞬间显示全部文本
            revealCurrentText();
            return;
        }

        if (isSkip) {
            executeNext();
            return;
        }

        // 正常模式：推进到下一条
        executeNext();
    }

    // --- 处理键盘事件 ---
    function handleKeyboard(e) {
        // 如果界面被隐藏，不处理
        if (dom.vnUi.classList.contains('hidden')) return;

        if (e.key === 'Escape' && closeTopPanel()) {
            e.preventDefault();
            return;
        }

        if (isPanelOpen()) return;

        switch (e.key) {
            case ' ':
            case 'Enter':
            case 'ArrowDown':
                e.preventDefault();
                handleDialogueClick();
                break;
            case 'Escape':
                e.preventDefault();
                if (isTyping) revealCurrentText();
                else GameSettings.openPanel();
                break;
            case 'Control':
                e.preventDefault();
                setSkipMode(true);
                break;
            case 'a':
            case 'A':
                e.preventDefault();
                toggleAutoPlay();
                break;
            case 's':
            case 'S':
                e.preventDefault();
                if (!isTyping && typeof GameController !== 'undefined') GameController.openSavePanel();
                break;
            case 'l':
            case 'L':
                e.preventDefault();
                if (!isTyping && typeof GameController !== 'undefined') GameController.openLoadPanel();
                break;
            case 'h':
            case 'H':
                e.preventDefault();
                if (!isTyping && typeof GameController !== 'undefined') GameController.openHistory();
                break;
        }
    }

    function handleKeyup(e) {
        if (e.key === 'Control') {
            setSkipMode(false);
        }
    }

    function isPanelOpen() {
        return ['settings-ui', 'save-load-ui', 'history-ui'].some(function (id) {
            var el = document.getElementById(id);
            return el && !el.classList.contains('hidden');
        });
    }

    function closeTopPanel() {
        var settings = document.getElementById('settings-ui');
        if (settings && !settings.classList.contains('hidden')) {
            GameSettings.closePanel();
            return true;
        }
        var saveLoad = document.getElementById('save-load-ui');
        if (saveLoad && !saveLoad.classList.contains('hidden')) {
            GameSaveSystem.closePanel();
            return true;
        }
        var history = document.getElementById('history-ui');
        if (history && !history.classList.contains('hidden')) {
            history.classList.add('hidden');
            return true;
        }
        return false;
    }

    // --- 切换场景背景 ---
    function setScene(bgClass) {
        if (!bgClass) return;
        var normalizedClass = bgClass.indexOf('bg-') === 0 ? bgClass : 'bg-' + bgClass;
        dom.bgLayer.className = '';
        dom.bgLayer.classList.add(normalizedClass);
        // 同步更新全局状态
        if (typeof Game !== 'undefined' && Game.gameState) {
            Game.gameState.sky = normalizedClass;
        }
    }

    // --- 设置天空颜色 ---
    function setSky(colorClass) {
        setScene(colorClass);
    }

    // --- 隐藏所有 UI，只显示 VN 界面 ---
    function hideAllUI() {
        dom.vnUi.classList.add('hidden');
        document.getElementById('minigame-ui').classList.add('hidden');
        document.getElementById('evening-ui').classList.add('hidden');
    }

    // --- 触发阶段转换 ---
    function triggerPhase(phase, data) {
        // 停止打字机
        stopTypewriter();
        setSkipMode(false);

        // 隐藏 VN 界面
        dom.vnUi.classList.add('hidden');

        // 通知外部模块（通过全局 GameController）
        if (typeof GameController !== 'undefined' && GameController.onPhaseChange) {
            GameController.onPhaseChange(phase, data);
        }
    }

    // --- 场景完成 ---
    function onSceneComplete() {
        if (onCompleteCallback) {
            onCompleteCallback();
        }
    }

    /**
     * 从指定索引加载场景（读档用）
     * 会跳过从 0 到 index 的所有指令，直接显示 index 位置的对话
     * @param {Array} commands - 完整的命令数组
     * @param {number} startIndex - 从脚本中的哪个索引开始
     * @param {string} displayedText - 当前屏幕上显示的文本
     * @param {string} skyColor - 存档时的天空/背景颜色类名（如 'bg-pink'）
     * @param {Function} onPhaseChange - 阶段转换回调
     */
    function loadFromIndex(commands, startIndex, displayedText, skyColor, onPhaseChange) {
        script = commands;
        currentIndex = Math.min(commands.length, Math.max(0, startIndex + 1));
        isTyping = false;
        stopAutoPlay();
        setSkipMode(false);
        onCompleteCallback = null;
        syncGameProgress(startIndex);
        restoreRightCharacterFromScript(commands, startIndex);

        // 隐藏其他界面，显示 VN 界面
        hideAllUI();
        dom.vnUi.classList.remove('hidden');
        updateCharacterSprites('');

        if (startIndex < commands.length && displayedText) {
            // 直接显示存档时的文本和背景
            var cmd = commands[startIndex];
            if (cmd) {
                // 使用存档的背景颜色（优先级高于命令自身的背景）
                var bgToUse = skyColor || cmd.bg || '';
                showImmediateDialogue(cmd.speaker || '', displayedText, bgToUse, cmd.color);
            }
        }
    }

    function restoreProgress(commands, nextIndex) {
        script = commands;
        currentIndex = Math.min(commands.length, Math.max(0, nextIndex || 0));
        stopTypewriter();
        stopAutoPlay();
        setSkipMode(false);
        onCompleteCallback = null;
        syncGameProgress(Math.max(0, currentIndex - 1));
        restoreRightCharacterFromScript(commands, Math.max(0, currentIndex - 1));
        updateCharacterSprites('');
    }

    function scheduleSkipStep() {
        if (!isSkip || dom.vnUi.classList.contains('hidden')) return;
        if (skipTimer) clearTimeout(skipTimer);
        skipTimer = setTimeout(function () {
            skipTimer = null;
            if (isSkip && !dom.vnUi.classList.contains('hidden')) {
                handleDialogueClick();
            }
        }, 70);
    }

    function setSkipMode(enabled) {
        isSkip = enabled;
        if (!isSkip && skipTimer) {
            clearTimeout(skipTimer);
            skipTimer = null;
        }
        const btn = document.getElementById('btn-skip');
        if (btn) btn.classList.toggle('active', isSkip);
        if (isSkip) {
            if (isTyping) revealCurrentText();
            else stopTypewriter();
            if (autoPlayTimer) {
                clearTimeout(autoPlayTimer);
                autoPlayTimer = null;
            }
            scheduleSkipStep();
        }
    }

    // --- 记录对话历史 ---
    function recordHistory(speaker, text) {
        // 通过全局 Game 对象记录历史
        if (typeof Game !== 'undefined' && Game.gameState) {
            Game.gameState.history.push({ speaker: speaker, text: text });
            // 限制历史长度，避免占用过多内存
            if (Game.gameState.history.length > 500) {
                Game.gameState.history = Game.gameState.history.slice(-500);
            }
        }
    }

    // --- 公开 API ---
    return {
        init: init,
        loadScene: loadScene,
        // 供外部调用
        handleDialogueClick: handleDialogueClick,
        stopTypewriter: stopTypewriter,
        // 读档专用：从指定索引加载
        loadFromIndex: loadFromIndex,
        restoreProgress: restoreProgress,
        // 读取当前显示的对话（存档用）
        getCurrentText: getCurrentText,
        getCurrentSpeaker: getCurrentSpeaker,
        getSaveSnapshot: getSaveSnapshot,
        // 自动播放控制
        toggleAutoPlay: function () {
            return toggleAutoPlay();
        },
        isAutoPlaying: function () { return isAutoPlay; },
        // 跳过控制
        toggleSkip: function () {
            setSkipMode(!isSkip);
            return isSkip;
        },
        setSkipMode: setSkipMode,
        isSkipping: function () { return isSkip; },
    };

})();
