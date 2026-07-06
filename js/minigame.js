/**
 * ============================================================
 * 入俭小游戏模块 (minigame.js)
 * ============================================================ */

const GameMinigame = (function () {

    let currentData = null;
    let currentType = '';
    let completedSteps = 0;
    let wipeCleared = 0;
    let wipeTotal = 0;
    let reviewIndex = 0;
    let isCompleting = false;

    let dom = {};

    const RITUAL_NOTES = {
        dressing: ['整理衣物', '确认随葬物', '复核委托'],
        hold: ['稳定动作', '维持力度', '等待完成'],
        wipe: ['清洁面部', '擦去痕迹', '恢复平静'],
        review: ['翻阅记录', '确认姓名', '送别世界'],
    };

    function init() {
        dom = {
            ui: document.getElementById('minigame-ui'),
            area: document.getElementById('minigame-area'),
            status: document.getElementById('minigame-status'),
            title: document.getElementById('minigame-title'),
            skipBtn: document.getElementById('btn-minigame-skip'),
        };

        dom.skipBtn.addEventListener('click', skipMinigame);
    }

    function start(data) {
        currentData = data;
        currentType = data.type;
        completedSteps = 0;
        wipeCleared = 0;
        wipeTotal = 0;
        reviewIndex = 0;
        isCompleting = false;

        dom.ui.classList.remove('hidden');
        dom.area.className = 'mini-workstation mini-type-' + currentType;
        dom.area.innerHTML = '';
        dom.status.textContent = '';
        dom.title.textContent = data.name + ' / 入俭记录';

        const shell = createWorkstation(data);
        dom.area.appendChild(shell.root);

        switch (currentType) {
            case 'dressing':
                renderDressing(data, shell);
                break;
            case 'hold':
                renderHold(data, shell);
                break;
            case 'wipe':
                renderWipe(data, shell);
                break;
            case 'review':
                renderReview(data, shell);
                break;
            default:
                console.warn('Unknown minigame type:', currentType);
                minigameComplete();
        }
    }

    function createWorkstation(data) {
        const root = document.createElement('div');
        root.className = 'mini-shell';

        const dossier = document.createElement('aside');
        dossier.className = 'mini-dossier';
        dossier.innerHTML = '<div class="mini-panel-title">委托档案</div>'
            + '<div class="mini-deceased-name">' + data.name + '</div>'
            + '<div class="mini-case-type">' + getTypeLabel(data.type) + '</div>'
            + '<p class="mini-case-desc">' + (data.desc || '认真完成最后的整理。') + '</p>'
            + '<div class="mini-checklist">'
            + (RITUAL_NOTES[data.type] || []).map(function (note, index) {
                return '<span class="mini-checkline" data-note="' + index + '">' + note + '</span>';
            }).join('')
            + '</div>';

        const stage = document.createElement('section');
        stage.className = 'mini-stage';
        stage.innerHTML = '<div class="mini-roomline"></div>'
            + '<div class="mini-body-table">'
            + '<div class="mini-pillow"></div>'
            + '<div class="mini-body-silhouette"><span></span></div>'
            + '<div class="mini-table-edge"></div>'
            + '</div>';

        const controls = document.createElement('aside');
        controls.className = 'mini-controls';
        controls.innerHTML = '<div class="mini-panel-title">工具盘</div>';

        const log = document.createElement('div');
        log.className = 'mini-log';
        log.innerHTML = '<div class="mini-log-line">系统：等待操作。</div>';

        root.appendChild(dossier);
        root.appendChild(stage);
        root.appendChild(controls);
        root.appendChild(log);

        return { root, dossier, stage, controls, log };
    }

    function getTypeLabel(type) {
        if (type === 'dressing') return '着装 / 随葬物';
        if (type === 'hold') return '持续整理';
        if (type === 'wipe') return '清洁';
        if (type === 'review') return '最终回顾';
        return '入俭';
    }

    function addLog(shell, text) {
        const line = document.createElement('div');
        line.className = 'mini-log-line';
        line.textContent = text;
        shell.log.appendChild(line);
        shell.log.scrollTop = shell.log.scrollHeight;
    }

    function markChecklist(shell, index) {
        const item = shell.dossier.querySelector('[data-note="' + index + '"]');
        if (item) item.classList.add('done');
    }

    function addStageToken(shell, label, icon) {
        const token = document.createElement('div');
        token.className = 'mini-stage-token';
        token.innerHTML = '<span>' + icon + '</span><small>' + label + '</small>';
        token.style.left = (18 + (completedSteps % 4) * 17) + '%';
        token.style.top = (58 + (completedSteps % 2) * 12) + '%';
        shell.stage.appendChild(token);
    }

    function updateProgress(percent, message) {
        const clamped = Math.max(0, Math.min(100, Math.round(percent)));
        dom.status.textContent = message + ' ' + clamped + '%';
        dom.area.style.setProperty('--mini-progress', clamped + '%');
        dom.ui.style.setProperty('--mini-progress', clamped + '%');
    }

    function renderDressing(data, shell) {
        const list = document.createElement('div');
        list.className = 'mini-tool-list';

        data.steps.forEach(function (step, index) {
            const item = document.createElement('button');
            item.type = 'button';
            item.className = index === 0 ? 'mini-tool-item active' : 'mini-tool-item';
            item.innerHTML = '<span class="mini-tool-icon">' + step.icon + '</span>'
                + '<span class="mini-tool-text">' + step.text + '</span>'
                + '<span class="mini-tool-state">待处理</span>';

            item.addEventListener('click', function () {
                if (index !== completedSteps || isCompleting) return;
                item.classList.add('completed');
                item.classList.remove('active');
                item.querySelector('.mini-tool-state').textContent = '完成';
                addLog(shell, '记录：' + step.text);
                addStageToken(shell, step.text, step.icon);
                completedSteps++;
                markChecklist(shell, Math.min(index, 2));
                updateProgress((completedSteps / data.steps.length) * 100, '仪式进度');

                const next = list.querySelectorAll('.mini-tool-item')[completedSteps];
                if (next) {
                    next.classList.add('active');
                    next.querySelector('.mini-tool-state').textContent = '当前';
                }

                if (completedSteps >= data.steps.length) finishWithDelay(shell, '复核完成。');
            });

            list.appendChild(item);
        });

        const first = list.querySelector('.mini-tool-state');
        if (first) first.textContent = '当前';
        shell.controls.appendChild(list);
        addLog(shell, '系统：按委托顺序完成每个步骤。');
        updateProgress(0, '仪式进度');
    }

    function renderHold(data, shell) {
        const hold = document.createElement('button');
        hold.type = 'button';
        hold.className = 'mini-hold-pad';
        hold.innerHTML = '<span>按住工具</span><strong>保持稳定</strong>';

        const gauge = document.createElement('div');
        gauge.className = 'mini-hold-gauge';
        gauge.innerHTML = '<div class="mini-hold-fill"></div>';
        const fill = gauge.querySelector('.mini-hold-fill');

        shell.controls.appendChild(hold);
        shell.controls.appendChild(gauge);

        let startTime = 0;
        let holding = false;

        function begin(e) {
            e.preventDefault();
            if (isCompleting) return;
            holding = true;
            startTime = Date.now();
            hold.classList.add('holding');
            shell.stage.classList.add('working');
            hold.innerHTML = '<span>正在处理</span><strong>不要松手</strong>';
            addLog(shell, '记录：动作开始。');
            animate();
        }

        function stop(e) {
            if (e) e.preventDefault();
            if (!holding) return;
            holding = false;
            fill.style.width = '0%';
            hold.classList.remove('holding');
            shell.stage.classList.remove('working');
            hold.innerHTML = '<span>按住工具</span><strong>保持稳定</strong>';
            addLog(shell, '提示：动作中断，重新校准。');
            updateProgress(0, '稳定度');
        }

        function animate() {
            if (!holding) return;
            const progress = Math.min(100, ((Date.now() - startTime) / (data.duration || 3000)) * 100);
            fill.style.width = progress + '%';
            updateProgress(progress, '稳定度');

            if (progress > 34) markChecklist(shell, 0);
            if (progress > 67) markChecklist(shell, 1);

            if (progress >= 100) {
                holding = false;
                hold.classList.remove('holding');
                hold.classList.add('completed');
                shell.stage.classList.remove('working');
                shell.stage.classList.add('settled');
                hold.innerHTML = '<span>完成</span><strong>动作平稳</strong>';
                markChecklist(shell, 2);
                finishWithDelay(shell, '整理完成。');
                return;
            }

            requestAnimationFrame(animate);
        }

        hold.addEventListener('mousedown', begin);
        hold.addEventListener('mouseup', stop);
        hold.addEventListener('mouseleave', stop);
        hold.addEventListener('touchstart', begin, { passive: false });
        hold.addEventListener('touchend', stop);

        addLog(shell, '系统：长按工具，保持动作稳定。');
        updateProgress(0, '稳定度');
    }

    function renderWipe(data, shell) {
        const wipePad = document.createElement('div');
        wipePad.className = 'mini-wipe-pad';
        wipePad.innerHTML = '<div class="mini-wipe-face"></div><div class="mini-wipe-mask"></div><span>拖拽清洁</span>';
        const mask = wipePad.querySelector('.mini-wipe-mask');
        const hint = wipePad.querySelector('span');

        shell.stage.appendChild(wipePad);

        let wiping = false;

        function begin(e) {
            e.preventDefault();
            wiping = true;
            hint.textContent = '';
            erase();
        }

        function move(e) {
            if (!wiping) return;
            e.preventDefault();
            erase();
        }

        function stop(e) {
            if (e) e.preventDefault();
            wiping = false;
        }

        function erase() {
            wipeCleared += 4;
            if (wipeTotal === 0) wipeTotal = (data.cleanRatio || 0.7) * 100;
            const progress = Math.min(100, (wipeCleared / wipeTotal) * 100);
            mask.style.opacity = String(Math.max(0, 1 - progress / 100));
            updateProgress(progress, '清洁进度');
            if (progress > 34) markChecklist(shell, 0);
            if (progress > 67) markChecklist(shell, 1);

            if (progress >= 100 && !isCompleting) {
                hint.textContent = '清洁完成';
                markChecklist(shell, 2);
                shell.stage.classList.add('settled');
                finishWithDelay(shell, '面容已整理。');
            }
        }

        wipePad.addEventListener('mousedown', begin);
        document.addEventListener('mousemove', move);
        document.addEventListener('mouseup', stop);
        wipePad.addEventListener('touchstart', begin, { passive: false });
        document.addEventListener('touchmove', move, { passive: false });
        document.addEventListener('touchend', stop);

        addLog(shell, '系统：在工作区拖拽，擦去覆盖层。');
        updateProgress(0, '清洁进度');
    }

    function renderReview(data, shell) {
        const reviewItems = [
            { day: '第一天', name: '林建国', desc: '深蓝色旧夹克，针脚密密麻麻。' },
            { day: '第二天', name: '赵德明', desc: '深灰色西装，领带整理得整整齐齐。' },
            { day: '第三天', name: '周明远', desc: '眉头终于舒展开，报告停在第八版。' },
            { day: '第四天', name: '白羽', desc: '蓝裙子，枕边放着一包咖啡豆。' },
            { day: '第五天', name: '吴静宜', desc: '素色衣服，头发上别着旧发卡。' },
            { day: '第六天', name: '秦桂英', desc: '红色毛衣，像一团安静的火。' },
        ];

        const viewer = document.createElement('div');
        viewer.className = 'mini-review-terminal';
        shell.controls.appendChild(viewer);

        function draw() {
            const item = reviewItems[reviewIndex];
            viewer.innerHTML = '<div class="mini-review-day">' + item.day + '</div>'
                + '<div class="mini-review-name">' + item.name + '</div>'
                + '<p>' + item.desc + '</p>'
                + '<div class="mini-review-actions">'
                + '<button class="mini-prev">上一条</button>'
                + '<button class="mini-next">' + (reviewIndex === reviewItems.length - 1 ? '完成' : '下一条') + '</button>'
                + '</div>';

            const prev = viewer.querySelector('.mini-prev');
            const next = viewer.querySelector('.mini-next');
            prev.disabled = reviewIndex === 0;
            prev.addEventListener('click', function () {
                if (reviewIndex > 0) {
                    reviewIndex--;
                    draw();
                }
            });
            next.addEventListener('click', function () {
                if (reviewIndex < reviewItems.length - 1) {
                    reviewIndex++;
                    markChecklist(shell, Math.min(2, Math.floor(reviewIndex / 2)));
                    addLog(shell, '记录：确认 ' + reviewItems[reviewIndex].name + '。');
                    updateProgress((reviewIndex / (reviewItems.length - 1)) * 100, '回顾进度');
                    draw();
                } else {
                    markChecklist(shell, 2);
                    finishWithDelay(shell, '回顾完成。');
                }
            });
        }

        draw();
        addLog(shell, '系统：逐条确认这七天的送别记录。');
        updateProgress(0, '回顾进度');
    }

    function finishWithDelay(shell, message) {
        if (isCompleting) return;
        isCompleting = true;
        addLog(shell, message);
        dom.area.classList.add('complete');
        dom.status.textContent = '完成';
        setTimeout(minigameComplete, 800);
    }

    function minigameComplete() {
        isCompleting = false;
        if (typeof GameController !== 'undefined' && GameController.onMinigameComplete) {
            GameController.onMinigameComplete();
        }
    }

    function skipMinigame() {
        minigameComplete();
    }

    function hide() {
        dom.ui.classList.add('hidden');
        dom.area.classList.remove('complete');
    }

    return {
        init: init,
        start: start,
        hide: hide,
        minigameComplete: minigameComplete,
    };

})();
