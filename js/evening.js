/**
 * ============================================================
 * 晚间休息系统模块 (evening.js)
 * ============================================================
 * 职责：
 *  1. 手机新闻：浏览和阅读当天推送的新闻
 *  2. 房间布置：用金钱购买家具，放置在房间里
 *  3. 结算：点击"睡一觉吧"进入下一天
 *
 *  与其他模块解耦：通过 GameController.onEveningComplete 回调
 * ============================================================ */

const GameEvening = (function () {

    // --- 内部状态 ---
    let currentDayNews = [];    // 当前天的新闻数据
    let ownedFurniture = [];    // 已购买的家具列表
    let currentMoney = 0;       // 当前金钱
    let currentShopItems = [];  // 当前可购买的家具列表

    // --- DOM 引用 ---
    let dom = {};

    /**
     * 初始化晚间系统模块
     */
    function init() {
        dom = {
            ui: document.getElementById('evening-ui'),
            tabs: document.getElementById('evening-tabs'),
            content: document.getElementById('evening-content'),
            money: document.getElementById('evening-money'),
            sleepBtn: document.getElementById('btn-sleep'),
        };

        // 标签切换
        dom.tabs.addEventListener('click', function (e) {
            const tab = e.target.closest('.evening-tab');
            if (!tab) return;
            switchTab(tab.dataset.tab);
        });

        // 睡觉按钮
        dom.sleepBtn.addEventListener('click', eveningComplete);
    }

    /**
     * 开始晚间休息
     * @param {Object} data - 晚间数据（新闻、金钱、商店物品）
     */
    function start(data) {
        currentDayNews = data.news || [];
        currentMoney = data.money || 0;
        currentShopItems = data.shopItems || [];
        // 从全局状态恢复已拥有的家具
        ownedFurniture = Game.gameState.ownedFurniture || [];

        // 显示晚间界面
        dom.ui.classList.remove('hidden');

        // 默认切换到手机标签
        switchTab('phone');

        updateMoneyDisplay();
    }

    /**
     * 切换标签（手机/房间）
     * @param {string} tab - 'phone' 或 'room'
     */
    function switchTab(tab) {
        // 更新标签样式
        const tabs = dom.tabs.querySelectorAll('.evening-tab');
        tabs.forEach(function (t) {
            t.classList.toggle('active', t.dataset.tab === tab);
        });

        // 渲染对应内容
        dom.content.innerHTML = '';

        if (tab === 'phone') {
            renderPhone();
        } else if (tab === 'room') {
            renderRoom();
        }
    }

    // ================================================================
    // 手机新闻模块
    // ================================================================
    /**
     * 渲染手机新闻列表
     */
    function renderPhone() {
        if (currentDayNews.length === 0) {
            dom.content.innerHTML = '<p style="text-align:center;color:#555;padding:40px;">今天没有新消息。</p>';
            return;
        }

        // 每条新闻的卡片
        currentDayNews.forEach(function (news, index) {
            const card = document.createElement('div');
            card.className = 'news-card';
            card.innerHTML = '<div class="news-card-title">' + news.title + '</div>'
                + '<div class="news-card-summary">' + news.summary + '</div>';

            card.addEventListener('click', function () {
                showNewsDetail(news);
            });

            dom.content.appendChild(card);
        });
    }

    /**
     * 显示新闻详情（全屏覆盖）
     * @param {Object} news - 新闻数据
     */
    function showNewsDetail(news) {
        // 创建详情覆盖层
        const detail = document.createElement('div');
        detail.className = 'news-detail';

        let html = '<button class="news-detail-close">返回</button>';
        html += '<h3>' + news.title + '</h3>';
        html += '<p>' + news.content.replace(/\n/g, '</p><p>') + '</p>';

        detail.innerHTML = html;
        dom.content.appendChild(detail);

        // 关闭按钮
        detail.querySelector('.news-detail-close').addEventListener('click', function () {
            dom.content.removeChild(detail);
        });
    }

    // ================================================================
    // 房间布置模块
    // ================================================================
    /**
     * 渲染房间界面
     */
    function renderRoom() {
        const view = document.createElement('div');
        view.id = 'room-view';

        // 房间展示区
        const display = document.createElement('div');
        display.id = 'room-display';
        display.innerHTML = '<div class="room-wall"></div><div class="room-floor"></div>';

        // 渲染已购买的家具
        renderFurnitureInRoom(display);

        // 商店区域
        const shop = document.createElement('div');
        shop.id = 'room-shop';

        if (currentShopItems.length === 0) {
            shop.innerHTML = '<h3>房间</h3><p style="color:#555;font-size:13px;">今天没有新的家具可以购买。</p>';
        } else {
            shop.innerHTML = '<h3>家具商店</h3>';

            currentShopItems.forEach(function (item) {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'shop-item';

                const isOwned = ownedFurniture.indexOf(item.id) !== -1;
                if (isOwned) itemDiv.classList.add('owned');

                itemDiv.innerHTML = '<span class="shop-item-icon">' + item.icon + '</span>'
                    + '<div class="shop-item-info">'
                    + '<div class="shop-item-name">' + item.name + '</div>'
                    + '<div class="shop-item-price">' + (isOwned ? '已拥有' : item.price + ' 金') + '</div>'
                    + '</div>';

                if (!isOwned) {
                    itemDiv.addEventListener('click', function () {
                        buyFurniture(item);
                    });
                }

                shop.appendChild(itemDiv);
            });
        }

        view.appendChild(display);
        view.appendChild(shop);
        dom.content.appendChild(view);
    }

    /**
     * 在房间中渲染已购买的家具
     * @param {HTMLElement} container - 房间容器
     */
    function renderFurnitureInRoom(container) {
        ownedFurniture.forEach(function (furnId) {
            // 从商店物品中找到对应的家具配置
            const furnData = currentShopItems.find(function (i) { return i.id === furnId; });
            // 也检查全局（跨天购买的家具）
            if (!furnData) return;

            const furnDiv = document.createElement('div');
            furnDiv.className = 'room-furniture ' + furnData.className;
            container.appendChild(furnDiv);
        });
    }

    /**
     * 购买家具
     * @param {Object} item - 家具数据
     */
    function buyFurniture(item) {
        // 检查是否已拥有
        if (ownedFurniture.indexOf(item.id) !== -1) return;

        // 检查金钱是否足够
        if (currentMoney < item.price) {
            if (typeof GameUI !== 'undefined') GameUI.notify('金钱不足！');
            return;
        }

        // 购买
        currentMoney -= item.price;
        ownedFurniture.push(item.id);
        updateMoneyDisplay();

        // 刷新房间显示
        renderRoom();

        GameUI.notify('购买了 ' + item.name);
    }

    /**
     * 更新金钱显示
     */
    function updateMoneyDisplay() {
        dom.money.textContent = '金钱：' + currentMoney;
    }

    // ================================================================
    // 晚间完成
    // ================================================================
    /**
     * 晚间休息完成，回调到 GameController
     */
    function eveningComplete() {
        // 保存家具状态到全局
        if (typeof Game !== 'undefined') {
            Game.gameState.ownedFurniture = ownedFurniture;
            Game.gameState.money = currentMoney;
        }

        if (typeof GameController !== 'undefined' && GameController.onEveningComplete) {
            GameController.onEveningComplete();
        }
    }

    /**
     * 隐藏晚间界面
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
    };

})();
