/**
 * ============================================================
 * 入俭小游戏模块 (minigame.js)
 * ============================================================
 * 职责：
 *  1. 渲染入俭小游戏界面
 *  2. 处理四种小游戏类型的交互：
 *     - dressing: 多步骤穿衣/戴饰品（点击完成步骤）
 *     - hold: 长按持续（打粉/擦拭）
 *     - wipe: 拖拽清洁（鼠标/触摸擦除）
 *     - review: 滑动回顾（第七天用）
 *  3. 小游戏完成后回调到 GameController
 *
 *  与其他模块解耦：通过 GameController.onMinigameComplete 回调
 * ============================================================ */

const GameMinigame = (function () {

    // --- 内部状态 ---
    let currentData = null;       // 当前小游戏的配置数据
    let currentType = '';         // 小游戏类型
    let holdTimer = null;         // 长按定时器
    let holdProgress = 0;         // 长按进度
    let wipeCleared = 0;          // 擦拭清除的像素数
    let wipeTotal = 0;            // 擦拭区域总像素数
    let reviewIndex = 0;          // 回顾模式当前索引
    let completedSteps = 0;       // 已完成步骤数

    // --- DOM 引用 ---
    let dom = {};

    /**
     * 初始化小游戏模块，绑定 DOM 引用
     */
    function init() {
        dom = {
            ui: document.getElementById('minigame-ui'),
            area: document.getElementById('minigame-area'),
            status: document.getElementById('minigame-status'),
            title: document.getElementById('minigame-title'),
            skipBtn: document.getElementById('btn-minigame-skip'),
        };

        // 跳过按钮
        dom.skipBtn.addEventListener('click', skipMinigame);
    }

    /**
     * 开始一个入俭小游戏
     * @param {Object} data - 小游戏配置数据
     */
    function start(data) {
        currentData = data;
        currentType = data.type;
        completedSteps = 0;
        wipeCleared = 0;
        wipeTotal = 0;
        reviewIndex = 0;

        // 显示小游戏界面
        dom.ui.classList.remove('hidden');
        dom.area.className = 'mini-type-' + currentType;
        dom.area.innerHTML = ''; // 清空上次内容
        dom.status.textContent = '';

        // 根据类型渲染不同的小游戏
        switch (currentType) {
            case 'dressing':
                renderDressing(data);
                break;
            case 'hold':
                renderHold(data);
                break;
            case 'wipe':
                renderWipe(data);
                break;
            case 'review':
                renderReview(data);
                break;
            default:
                console.warn('Unknown minigame type:', currentType);
                minigameComplete();
        }
    }

    // ================================================================
    // 小游戏类型 1: 多步骤穿衣
    // ================================================================
    /**
     * 渲染多步骤小游戏（穿衣/戴饰品）
     * 玩家依次点击每个步骤，完成全部步骤后小游戏结束
     */
    function renderDressing(data) {
        dom.title.textContent = data.name + ' — 入俭中…';

        dom.area.appendChild(renderTaskCard(data));

        const list = document.createElement('div');
        list.className = 'mini-step-list';

        data.steps.forEach(function (step, index) {
            const item = document.createElement('div');
            item.className = index === 0 ? 'mini-step-item active' : 'mini-step-item';
            item.innerHTML = '<span class="mini-step-icon">' + step.icon + '</span>'
                + '<span class="mini-step-text">' + step.text + '</span>'
                + '<span class="mini-step-check">✓</span>';

            item.addEventListener('click', function () {
                // 只有当前步骤可以完成
                if (index === completedSteps) {
                    item.classList.add('completed');
                    item.classList.remove('active');
                    completedSteps++;
                    dom.status.textContent = '完成 ' + completedSteps + '/' + data.steps.length;
                    const next = list.querySelectorAll('.mini-step-item')[completedSteps];
                    if (next) next.classList.add('active');

                    if (completedSteps >= data.steps.length) {
                        minigameComplete();
                    }
                }
            });

            list.appendChild(item);
        });

        dom.area.appendChild(list);
        dom.status.textContent = '点击每个步骤完成任务';
    }

    // ================================================================
    // 小游戏类型 2: 长按持续
    // ================================================================
    /**
     * 渲染长按小游戏（打粉/擦拭）
     * 玩家需要按住按钮持续指定时间
     */
    function renderHold(data) {
        dom.title.textContent = data.name + ' — 入俭中…';

        dom.area.appendChild(renderTaskCard(data));

        const btn = document.createElement('div');
        btn.className = 'mini-hold-btn';
        btn.innerHTML = '<span>按住</span><strong>保持动作</strong>';

        const progressBar = document.createElement('div');
        progressBar.className = 'mini-hold-progress';
        const bar = document.createElement('div');
        bar.className = 'mini-hold-progress-bar';
        progressBar.appendChild(bar);

        dom.area.appendChild(btn);
        dom.area.appendChild(progressBar);

        let holdStart = 0;
        let isHolding = false;

        function startHold(e) {
            e.preventDefault();
            isHolding = true;
            holdStart = Date.now();
            btn.classList.add('holding');
            btn.innerHTML = '<span>进行中</span><strong>请保持</strong>';
            animateHold();
        }

        function endHold(e) {
            e.preventDefault();
            if (!isHolding) return;
            isHolding = false;
            btn.classList.remove('holding');
            btn.innerHTML = '<span>按住</span><strong>保持动作</strong>';
            bar.style.width = '0%';
        }

        // 鼠标事件
        btn.addEventListener('mousedown', startHold);
        btn.addEventListener('mouseup', endHold);
        btn.addEventListener('mouseleave', endHold);

        // 触摸事件
        btn.addEventListener('touchstart', startHold, { passive: false });
        btn.addEventListener('touchend', endHold);

        function animateHold() {
            if (!isHolding) return;
            const elapsed = Date.now() - holdStart;
            const progress = Math.min(100, (elapsed / data.duration) * 100);
            bar.style.width = progress + '%';

            if (elapsed >= data.duration) {
                isHolding = false;
                btn.classList.remove('holding');
                btn.innerHTML = '<span>完成</span><strong>已经整理好</strong>';
                btn.style.background = 'rgba(100, 200, 100, 0.15)';
                setTimeout(minigameComplete, 500);
                return;
            }

            requestAnimationFrame(animateHold);
        }
    }

    // ================================================================
    // 小游戏类型 3: 拖拽擦拭
    // ================================================================
    /**
     * 渲染拖拽擦拭小游戏
     * 玩家用鼠标/触摸在区域上拖拽，擦除覆盖层
     */
    function renderWipe(data) {
        dom.title.textContent = data.name + ' — 入俭中…';

        dom.area.appendChild(renderTaskCard(data));

        const area = document.createElement('div');
        area.className = 'mini-wipe-area';
        area.innerHTML = '<div class="mini-wipe-surface"></div>';

        const overlay = document.createElement('div');
        overlay.className = 'mini-wipe-overlay';
        overlay.style.opacity = '1';

        const hint = document.createElement('div');
        hint.className = 'mini-wipe-hint';
        hint.textContent = '拖拽擦拭清洁…';

        area.appendChild(overlay);
        area.appendChild(hint);
        dom.area.appendChild(area);

        let isErasing = false;

        function startErase(e) {
            e.preventDefault();
            isErasing = true;
            hint.style.display = 'none';
            eraseAt(e);
        }

        function moveErase(e) {
            if (!isErasing) return;
            e.preventDefault();
            eraseAt(e);
        }

        function endErase(e) {
            if (e) e.preventDefault();
            isErasing = false;
        }

        // 鼠标事件
        area.addEventListener('mousedown', startErase);
        document.addEventListener('mousemove', moveErase);
        document.addEventListener('mouseup', endErase);

        // 触摸事件
        area.addEventListener('touchstart', startErase, { passive: false });
        document.addEventListener('touchmove', moveErase, { passive: false });
        document.addEventListener('touchend', endErase);

        function eraseAt(e) {
            const rect = area.getBoundingClientRect();

            // 通过降低覆盖层透明度来模拟擦拭
            overlay.style.opacity = Math.max(0, parseFloat(overlay.style.opacity || '1') - 0.02);

            wipeCleared += 3;
            if (wipeTotal === 0) wipeTotal = data.cleanRatio * 100;
            dom.status.textContent = '清洁进度 ' + Math.min(100, Math.round((wipeCleared / wipeTotal) * 100)) + '%';

            if (wipeCleared >= wipeTotal) {
                overlay.style.opacity = '0';
                hint.textContent = '清洁完成';
                hint.style.display = 'flex';
                setTimeout(minigameComplete, 500);
            }
        }
    }

    // ================================================================
    // 小游戏类型 4: 回顾（第七天用）
    // ================================================================
    /**
     * 渲染回顾小游戏
     * 滑动浏览七天里送别的每一个人和他们的物品
     */
    function renderReview(data) {
        dom.title.textContent = data.name + ' — 最后的入俭';
        dom.area.appendChild(renderTaskCard(data));

        // 第七天的回顾数据
        const reviewItems = [
            { day: '第一天', name: '林建国', desc: '穿着深蓝色旧夹克，针脚密密麻麻——那是孙女缝的。' },
            { day: '第二天', name: '赵德明', desc: '深灰色西装，领带整理得整整齐齐。抽屉里有一本记录着所有支出的小本子。' },
            { day: '第三天', name: '周明远', desc: '黑色西装，眉头终于舒展开了。桌上放着改到第八版的报告。' },
            { day: '第四天', name: '白羽', desc: '蓝裙子，枕边放着一包咖啡豆。小本子上的字是"我在。我一直都在。"' },
            { day: '第五天', name: '吴静宜', desc: '素色衣服，头发上别着那个旧发卡——小时候妹妹送给她的。' },
            { day: '第六天', name: '秦桂英', desc: '红色毛衣，像一团安静的火。旁边放着一盏小灯。' },
        ];

        reviewIndex = 0;

        const container = document.createElement('div');
        container.className = 'mini-review-container';
        dom.area.appendChild(container);
        renderReviewItem(reviewItems[0], reviewItems.length);

        function renderReviewItem(item, total) {
            container.innerHTML = '';

            const card = document.createElement('div');
            card.className = 'mini-review-item';
            card.innerHTML = '<div class="mini-review-day">' + item.day + '</div>'
                + '<div class="mini-review-name">' + item.name + '</div>'
                + '<div class="mini-review-item-desc">' + item.desc + '</div>';

            const nav = document.createElement('div');
            nav.className = 'mini-review-nav';

            const prevBtn = document.createElement('button');
            prevBtn.textContent = '← 上一条';
            prevBtn.disabled = reviewIndex === 0;
            prevBtn.addEventListener('click', function () {
                if (reviewIndex > 0) {
                    reviewIndex--;
                    renderReviewItem(reviewItems[reviewIndex], reviewItems.length);
                }
            });

            const nextBtn = document.createElement('button');
            nextBtn.textContent = '下一条 →';
            nextBtn.addEventListener('click', function () {
                if (reviewIndex < total - 1) {
                    reviewIndex++;
                    renderReviewItem(reviewItems[reviewIndex], reviewItems.length);
                } else {
                    // 最后一页，点击后完成
                    minigameComplete();
                }
            });
            if (reviewIndex === total - 1) nextBtn.textContent = '完成';

            nav.appendChild(prevBtn);
            nav.appendChild(nextBtn);

            container.appendChild(card);
            container.appendChild(nav);
        }
    }

    function renderTaskCard(data) {
        const card = document.createElement('div');
        card.className = 'mini-task-card';
        card.innerHTML = '<div class="mini-task-label">今日委托</div>'
            + '<div class="mini-task-name">' + data.name + '</div>'
            + '<div class="mini-task-desc">' + (data.desc || '认真完成最后的整理。') + '</div>';
        return card;
    }

    // ================================================================
    // 小游戏完成
    // ================================================================
    /**
     * 小游戏完成，回调到 GameController
     */
    function minigameComplete() {
        stopHoldTimer();
        if (typeof GameController !== 'undefined' && GameController.onMinigameComplete) {
            GameController.onMinigameComplete();
        }
    }

    /**
     * 跳过小游戏
     */
    function skipMinigame() {
        stopHoldTimer();
        if (typeof GameController !== 'undefined' && GameController.onMinigameComplete) {
            GameController.onMinigameComplete();
        }
    }

    /**
     * 停止长按定时器
     */
    function stopHoldTimer() {
        if (holdTimer) {
            clearTimeout(holdTimer);
            holdTimer = null;
        }
    }

    /**
     * 隐藏小游戏界面
     */
    function hide() {
        dom.ui.classList.add('hidden');
    }

    // ================================================================
    // 公开 API
    // ================================================================
    return {
        init: init,
        start: start,
        hide: hide,
        minigameComplete: minigameComplete,
    };

})();
