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
    let likedTargets = {};      // 当晚手机点赞状态

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
        const phone = document.createElement('div');
        phone.id = 'phone-view';
        phone.innerHTML = '<div class="phone-shell">'
            + '<div class="phone-speaker"></div>'
            + '<div class="phone-screen">'
            + '<div class="phone-brand">真理之眼</div>'
            + '<div class="phone-feed"></div>'
            + '<div class="phone-nav"><span>↶</span><span>⌂</span></div>'
            + '</div>'
            + '</div>';
        const feed = phone.querySelector('.phone-feed');

        if (currentDayNews.length === 0) {
            feed.innerHTML = '<p class="phone-empty">今天没有新消息。</p>';
            dom.content.appendChild(phone);
            return;
        }

        renderNewsList(feed);
        dom.content.appendChild(phone);
    }

    function renderNewsList(feed) {
        feed.innerHTML = '';
        currentDayNews.forEach(function (news, index) {
            const comments = getNewsComments(news, index);
            const card = document.createElement('div');
            card.className = 'news-card';
            card.innerHTML = '<div class="news-card-index">Lana Smithee 报道 / 0' + (index + 1) + '</div>'
                + '<div class="news-card-title">' + news.title + '</div>'
                + '<div class="news-card-summary">' + news.summary + '</div>'
                + '<div class="news-card-meta">'
                + '<span>' + comments.length + ' 回复</span>'
                + '<button class="news-like-btn" data-like="post-' + index + '">♡ ' + getLikeCount('post-' + index, 8 + index * 3) + '</button>'
                + '</div>';

            card.addEventListener('click', function () {
                showNewsDetail(feed, news, index);
            });
            card.querySelector('.news-like-btn').addEventListener('click', function (e) {
                e.stopPropagation();
                toggleLike(e.currentTarget.dataset.like);
                renderNewsList(feed);
            });

            feed.appendChild(card);
        });
    }

    /**
     * 显示新闻详情（全屏覆盖）
     * @param {Object} news - 新闻数据
     */
    function showNewsDetail(feed, news, index) {
        const comments = getNewsComments(news, index);
        feed.innerHTML = '<div class="news-thread">'
            + '<button class="news-thread-back">← 返回列表</button>'
            + '<div class="news-thread-index">Lana Smithee 报道 / 0' + (index + 1) + '</div>'
            + '<h3>' + news.title + '</h3>'
            + '<div class="news-thread-body"><p>' + news.content.replace(/\n/g, '</p><p>') + '</p></div>'
            + '<button class="news-thread-like" data-like="post-' + index + '">♡ 点赞 ' + getLikeCount('post-' + index, 8 + index * 3) + '</button>'
            + '<div class="news-comments"></div>'
            + '</div>';

        const commentsEl = feed.querySelector('.news-comments');
        comments.forEach(function (comment, commentIndex) {
            const likeKey = 'post-' + index + '-comment-' + commentIndex;
            const row = document.createElement('div');
            row.className = 'news-comment';
            row.innerHTML = '<div class="news-comment-user">' + comment.user + '</div>'
                + '<div class="news-comment-text">' + comment.text + '</div>'
                + '<button class="news-comment-like" data-like="' + likeKey + '">♡ ' + getLikeCount(likeKey, comment.likes) + '</button>';
            row.querySelector('button').addEventListener('click', function (e) {
                toggleLike(e.currentTarget.dataset.like);
                showNewsDetail(feed, news, index);
            });
            commentsEl.appendChild(row);
        });

        feed.querySelector('.news-thread-back').addEventListener('click', function () {
            renderNewsList(feed);
        });
        feed.querySelector('.news-thread-like').addEventListener('click', function (e) {
            toggleLike(e.currentTarget.dataset.like);
            showNewsDetail(feed, news, index);
        });
    }

    function toggleLike(key) {
        likedTargets[key] = !likedTargets[key];
    }

    function getLikeCount(key, base) {
        return base + (likedTargets[key] ? 1 : 0);
    }

    function getNewsComments(news, index) {
        if (news.comments && news.comments.length > 0) return news.comments;

        const banks = [
            [
                { user: '雨停前', text: '我排了三个小时队，前面的人一直在给家里打电话。没人抱怨。', likes: 12 },
                { user: '旧城区小卖部', text: '店里还有水和电池，老人优先。我会开到天黑。', likes: 21 },
                { user: '匿名用户', text: '新闻说有序撤离，可我只想回家吃顿饭。', likes: 9 },
            ],
            [
                { user: '天台观测者', text: '昨晚的天空不是折射。我拍到了，但上传失败了。', likes: 16 },
                { user: '不想睡', text: '他们越说不要恐慌，我越觉得应该给妈妈打电话。', likes: 18 },
                { user: '三号线末班', text: '车厢里很安静，大家都在看同一条推送。', likes: 7 },
            ],
            [
                { user: '南区护士', text: '医院走廊今天多了很多花。有人说花比安慰有用。', likes: 19 },
                { user: '路过', text: '如果还有几天，至少别把话留到最后一天。', likes: 24 },
                { user: '灰色雨衣', text: '我给我爸发了“晚饭吃什么”，他回了“都行”。真好。', likes: 13 },
            ],
        ];
        return banks[index % banks.length];
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
        ownedFurniture.forEach(function (furnId) {
            display.classList.add('room-has-' + furnId);
        });
        display.innerHTML = '<div class="room-window"><span></span></div>'
            + '<div class="room-ac"></div>'
            + '<div class="room-poster">BEST<br>BOSS</div>'
            + '<div class="room-shelves"></div>'
            + '<div class="room-desk"><span></span></div>'
            + '<div class="room-character"></div>'
            + '<div class="room-crates"></div>'
            + '<div class="room-floor"></div>';

        // 渲染已购买的家具
        renderFurnitureInRoom(display);

        // 商店区域
        const shop = document.createElement('div');
        shop.id = 'room-shop';

        if (currentShopItems.length === 0) {
            shop.innerHTML = '<h3>商店</h3><p class="shop-empty">今天没有新的家具可以购买。</p>';
        } else {
            shop.innerHTML = '<h3>商店</h3>';

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
            const furnData = findFurnitureData(furnId);
            if (!furnData) return;

            const furnDiv = document.createElement('div');
            furnDiv.className = 'room-furniture ' + furnData.className;
            container.appendChild(furnDiv);
        });
    }

    function findFurnitureData(furnId) {
        const todayItem = currentShopItems.find(function (item) { return item.id === furnId; });
        if (todayItem) return todayItem;

        if (typeof DAYS_DATA === 'undefined') return null;
        const dayKeys = Object.keys(DAYS_DATA);
        for (var i = 0; i < dayKeys.length; i++) {
            const commands = DAYS_DATA[dayKeys[i]].commands || [];
            for (var j = 0; j < commands.length; j++) {
                if (commands[j].type !== 'evening' || !commands[j].data || !commands[j].data.shopItems) continue;
                const found = commands[j].data.shopItems.find(function (item) {
                    return item.id === furnId;
                });
                if (found) return found;
            }
        }
        return null;
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
        dom.content.innerHTML = '';
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
