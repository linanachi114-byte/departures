/**
 * ============================================================
 * 七天场景脚本数据 (days.js)
 * ============================================================
 * 数据结构说明：
 *  每个场景是一个指令对象，包含 type 字段表示指令类型：
 *
 *  { type: 'set-day', text: '第一天' }       - 设置天数显示
 *  { type: 'set-sky', color: 'bg-gray' }     - 设置天空/背景颜色
 *  { type: 'narration', text: '...' }        - 旁白（无说话人）
 *  { type: 'dialogue', speaker: '...', text: '...' }  - 对话
 *  { type: 'minigame', data: {...} }         - 进入入俭小游戏
 *  { type: 'evening', data: {...} }          - 进入晚间休息
 *  { type: 'sleep', data: {...} }            - 睡觉，进入下一天
 *  { type: 'menu' }                          - 返回主菜单
 *
 *  对话的 speaker 为空字符串表示旁白
 *  旁白的 text 可以是纯文本，也可以包含换行
 * ============================================================ */

const DAYS_DATA = {
    // ============================================================
    // 第一天：林柚 & 林建国（孙女 & 祖父）
    // ============================================================
    day1: {
        day: '第一天',
        sky: 'bg-gray',
        bg: 'interior',
        commands: [
            { type: 'set-day', text: '第一天' },
            { type: 'set-sky', color: 'bg-gray' },
            {
                type: 'narration',
                text: '窗外是灰蒙蒙的天，远处隐约传来断续的防空警报声——已经很久没有停过了。\n\n你推开事务所的门，习惯性地给绿萝浇了些水。'
            },
            {
                type: 'narration',
                text: '手机震动。今天的推送写着：距"终点"还有六天。',
                bg: 'bg-interior'
            },

            // 林柚来访
            { type: 'dialogue', speaker: '', text: '上午十点，门铃响了。' },
            { type: 'scene', bg: 'bg-gray' },
            { type: 'set-sky', color: 'bg-gray' },
            { type: 'dialogue', speaker: '', text: '你打开门，门外站着一个二十出头的年轻女孩。米色毛衣，眼睛红肿，但神情出乎意料地平静。' },

            { type: 'dialogue', speaker: '你', text: '您好，请问有什么可以帮您？' },
            { type: 'dialogue', speaker: '林柚', text: '……您好。我是来委托入俭的。' },
            { type: 'dialogue', speaker: '你', text: '请进。请先坐下，喝杯水？' },
            { type: 'dialogue', speaker: '林柚', text: '不用了，谢谢。' },
            { type: 'dialogue', speaker: '你', text: '好的。您贵姓？' },
            { type: 'dialogue', speaker: '林柚', text: '我叫林柚。林子的林，柚子的柚。去世的是我爷爷，林建国。' },
            { type: 'dialogue', speaker: '你', text: '林建国先生……三天前登记的，对吗？' },
            { type: 'dialogue', speaker: '林柚', text: '嗯。' },
            { type: 'dialogue', speaker: '你', text: '林先生是因为——' },
            { type: 'dialogue', speaker: '林柚', text: '（打断）心脏衰竭。医生说是自然死亡。' },
            { type: 'dialogue', speaker: '你', text: '抱歉，触及您的伤心事了。' },
            { type: 'dialogue', speaker: '林柚', text: '没有。我说这些已经说了很多遍了，不疼了。' },

            { type: 'dialogue', speaker: '', text: '林柚低头摆弄着帆布袋的带子。' },
            { type: 'dialogue', speaker: '林柚', text: '我爷爷走得很安静。那天早上我给他端粥过去，他已经……睡着了。再也没有醒过来。' },
            { type: 'dialogue', speaker: '你', text: '林小姐，您和爷爷感情一定很深。' },
            { type: 'dialogue', speaker: '林柚', text: '他是个老头子。固执得很。明明年纪大了，还每天去公园打太极。明明腿脚不好，还非要自己种那片小菜园子。' },
            { type: 'dialogue', speaker: '你', text: '听起来他是个很热爱生活的人。' },
            { type: 'dialogue', speaker: '林柚', text: '是。他什么都能种。黄瓜、西红柿、辣椒，还有一排月季。他说，人活着总得养点活的，不然屋子里太安静了。' },
            { type: 'dialogue', speaker: '你', text: '他种的花一定很漂亮。' },
            { type: 'dialogue', speaker: '林柚', text: '嗯。他种的月季开得比谁都好。' },

            // 特殊需求
            { type: 'dialogue', speaker: '', text: '林柚从帆布袋里翻出一件东西。一件深蓝色的旧夹克。' },
            { type: 'dialogue', speaker: '林柚', text: '我想让爷爷穿上这件夹克。这是他年轻时穿的工作服。后来他舍不得扔，改成了夹克。' },
            { type: 'dialogue', speaker: '你', text: '缝得很仔细。' },
            { type: 'dialogue', speaker: '林柚', text: '是我缝的。大学放暑假回家，发现袖口破了，我就缝上了。后来越破越多，我也缝了越来越多。' },
            { type: 'dialogue', speaker: '你', text: '这是一件很珍贵的夹克。' },
            { type: 'dialogue', speaker: '林柚', text: '爷爷说过，衣服穿久了是有魂的。人走了，衣服上的魂还在。所以我想……让他穿着它走。' },
            { type: 'dialogue', speaker: '你', text: '好。我会帮您安排好的。' },

            { type: 'dialogue', speaker: '林柚', text: '还有，能不能在棺材里放一朵月季？一朵就够了。' },
            { type: 'dialogue', speaker: '你', text: '没问题。我会选开得最好的一朵。' },

            // 入俭慢一点
            { type: 'dialogue', speaker: '林柚', text: '入俭的时候……能不能慢一点？' },
            { type: 'dialogue', speaker: '你', text: '慢一点？' },
            { type: 'dialogue', speaker: '林柚', text: '我爷爷说，入俭不是处理，是送别。每一步都要认真对待，因为那是死者在这个世界上收到的最后一份礼物。' },
            { type: 'dialogue', speaker: '你', text: '您爷爷说得对。' },
            { type: 'dialogue', speaker: '林柚', text: '我能看着他吗？我在外面看着，可以吗？' },
            { type: 'dialogue', speaker: '你', text: '可以。我让人给您开观察窗。' },
            { type: 'dialogue', speaker: '林柚', text: '（深深吸了一口气）谢谢您。' },

            { type: 'dialogue', speaker: '', text: '她站起身，把那件旧夹克双手放在桌上。手指在布料上停留了一瞬。' },

            // 林柚的最后一句话
            { type: 'dialogue', speaker: '林柚', text: '你们这里每天来的委托人多吗？' },
            { type: 'dialogue', speaker: '你', text: '每天都有。每一位都需要有人好好送他们最后一程。' },
            { type: 'dialogue', speaker: '林柚', text: '那就好。有人在，他们就不会害怕。' },

            { type: 'dialogue', speaker: '', text: '她推门走了。走廊的光从她身后照进来。你看到桌上留下了那件旧夹克。' },

            // 入俭小游戏
            { type: 'minigame', data: {
                type: 'dressing',
                name: '林建国',
                desc: '给林建国先生穿上那件深蓝色的旧夹克。针脚密密麻麻，每一针都很认真。',
                steps: [
                    { icon: '👔', text: '展开夹克，抚平褶皱' },
                    { icon: '🤲', text: '小心地穿上夹克' },
                    { icon: '🪡', text: '整理针脚，扣好扣子' },
                    { icon: '🌹', text: '在棺材中放一朵月季' },
                ]
            }},

            // 晚间休息
            { type: 'evening', data: {
                money: 500,
                shopItems: [
                    { id: 'plant', name: '绿萝', price: 200, icon: '🪴', className: 'furniture-plant' },
                    { id: 'desk', name: '书桌', price: 350, icon: '⎔', className: 'furniture-desk' },
                ]
            }},

            // 睡觉
            { type: 'sleep', data: { nextDay: 'day2' } },
        ]
    },

    // ============================================================
    // 第二天：赵国强 & 赵德明（儿子 & 父亲）
    // ============================================================
    day2: {
        day: '第二天',
        sky: 'bg-gray',
        bg: 'interior',
        commands: [
            { type: 'set-day', text: '第二天' },
            { type: 'set-sky', color: 'bg-gray' },
            {
                type: 'narration',
                text: '天色比昨天更暗了一些。云层压得很低，像是随时会塌下来。'
            },
            {
                type: 'narration',
                text: '手机推送："距终点还有五天。请检查应急物资储备，确保至少满足七天的基本需求。"\n\n你泡了杯茶，翻开今天的档案。赵德明，六十八岁。登记人：赵国强，死者之子。'
            },

            // 赵国强来访
            { type: 'dialogue', speaker: '', text: '上午十一点，门铃响了。' },
            { type: 'dialogue', speaker: '', text: '你打开门，一个四十多岁的男人。廉价西装，领带歪着，头发梳得很亮。他看了一眼走廊，像是觉得这里的装修不够体面。' },

            { type: 'dialogue', speaker: '赵国强', text: '赵国强。我委托入俭。' },
            { type: 'dialogue', speaker: '你', text: '请进。您父亲的情况——' },
            { type: 'dialogue', speaker: '赵国强', text: '情况我知道。他走了，我过来办手续。' },
            { type: 'dialogue', speaker: '你', text: '您父亲……是因为什么？' },
            { type: 'dialogue', speaker: '赵国强', text: '心脏病。老年人都这样。' },
            { type: 'dialogue', speaker: '你', text: '能跟我讲讲他吗？' },
            { type: 'dialogue', speaker: '赵国强', text: '我时间不多，能不能直接说需求？' },

            // 需求清单
            { type: 'dialogue', speaker: '你', text: '当然。' },
            { type: 'dialogue', speaker: '赵国强', text: '第一，西装要深灰色的，不要黑色的。第二，棺材要最好的款。第三，告别仪式要请乐队。' },
            { type: 'dialogue', speaker: '你', text: '这些都是很细致的要求。' },
            { type: 'dialogue', speaker: '赵国强', text: '我父亲是个讲究的人。他一辈子讲究，走也不能随便。' },

            // 父子关系
            { type: 'dialogue', speaker: '你', text: '您平时和父亲住在一起吗？' },
            { type: 'dialogue', speaker: '赵国强', text: '不住。他住在老城区那套房子，我住在东区。各过各的。' },
            { type: 'dialogue', speaker: '你', text: '……' },
            { type: 'dialogue', speaker: '赵国强', text: '我的意思是，老人家有自己的生活方式，我们做子女的也有自己的日子。互不打扰，挺好的。' },

            { type: 'dialogue', speaker: '你', text: '您父亲是什么时候去世的？' },
            { type: 'dialogue', speaker: '赵国强', text: '前天晚上。我第二天早上才过去发现的。' },

            { type: 'dialogue', speaker: '', text: '赵国强的语气忽然变了。' },
            { type: 'dialogue', speaker: '赵国强', text: '你看你这是什么表情？我不是不孝子！我每个月都给家里打钱！' },
            { type: 'dialogue', speaker: '你', text: '我没有那个意思。' },
            { type: 'dialogue', speaker: '赵国强', text: '总之，费用从他的遗产里扣。你按清单办就好。' },

            // 赵国强的最后一句话
            { type: 'dialogue', speaker: '你', text: '赵先生，您真的没有想对您父亲说的是什么话吗？' },
            { type: 'dialogue', speaker: '赵国强', text: '（沉默了两秒）……我跟他说的话，这辈子已经说够了。有些话，再说不如不说。' },

            { type: 'dialogue', speaker: '', text: '他推门离开，皮鞋踩在楼梯上的声音又急又重。' },

            // 入俭小游戏：打粉（长按）
            { type: 'minigame', data: {
                type: 'hold',
                name: '赵德明',
                desc: '给赵德明先生清洁、打粉、整理西装。他的领带歪了，你伸手帮他整理好。',
                duration: 3000 // 需要按住3秒
            }},

            // 晚间休息
            { type: 'evening', data: {
                money: 600,
                shopItems: [
                    { id: 'lamp', name: '台灯', price: 300, icon: '💡', className: 'furniture-lamp' },
                    { id: 'bed', name: '床', price: 500, icon: '🛏', className: 'furniture-bed' },
                ]
            }},

            { type: 'sleep', data: { nextDay: 'day3' } },
        ]
    },

    // ============================================================
    // 第三天：苏晚 & 周明远（同事 & 上司）
    // ============================================================
    day3: {
        day: '第三天',
        sky: 'bg-pink',
        bg: 'interior',
        commands: [
            { type: 'set-day', text: '第三天' },
            { type: 'set-sky', color: 'bg-pink' },
            {
                type: 'narration',
                text: '今天天空是粉色的——一种不自然的、带着荧光感的粉色。新闻里说这是"大气折射现象"。'
            },
            {
                type: 'narration',
                text: '你翻开今天的档案：周明远，五十二岁，过劳。登记人：苏晚，同部门同事。'
            },

            // 苏晚来访
            { type: 'dialogue', speaker: '', text: '上午九点半，门铃就响了。' },
            { type: 'dialogue', speaker: '', text: '一个不到三十的女人。黑色职业装，妆容完整，高马尾。她看起来像是要去开会。' },

            { type: 'dialogue', speaker: '苏晚', text: '苏晚。周明远是我部门的同事，我负责这次入俭委托。' },
            { type: 'dialogue', speaker: '你', text: '周先生是因为——' },
            { type: 'dialogue', speaker: '苏晚', text: '过劳。连续加班三周，突发心梗。' },

            { type: 'dialogue', speaker: '你', text: '周先生在公司是什么样的角色？' },
            { type: 'dialogue', speaker: '苏晚', text: '他是我们部门的主管。从底层爬上来的——父亲是工人，母亲是保洁。' },

            { type: 'dialogue', speaker: '', text: '苏晚打开笔记本电脑，切换到一份PPT。' },
            { type: 'dialogue', speaker: '苏晚', text: '他第一次穿西装去见客户的时候，西装是租的。裤子长了两寸，他蹲下来的时候露了脚踝，客户笑了。' },

            { type: 'dialogue', speaker: '苏晚', text: '从那天起，他发誓要让每一个跟他一起工作的人，都不需要因为贫穷而感到自卑。' },

            { type: 'dialogue', speaker: '', text: '苏晚的妆容依旧完美，但眼眶开始发红。' },
            { type: 'dialogue', speaker: '苏晚', text: '他走的那晚，他让我先回去，他自己留下来做最后的检查。我走的时候他还好端端的，在办公室泡茶。' },
            { type: 'dialogue', speaker: '苏晚', text: '第二天早上，他趴在桌上。电脑屏幕还亮着，上面是一份改到第八版的报告。' },

            { type: 'dialogue', speaker: '你', text: '……' },
            { type: 'dialogue', speaker: '苏晚', text: '报告的最后一段，他写了一句话。' },
            { type: 'dialogue', speaker: '苏晚', text: '"如果这个项目能成，大家的努力就没有白费。"' },

            // 需求
            { type: 'dialogue', speaker: '苏晚', text: '西装要黑色的。棺材不用最好的。告别仪式放一首《平凡之路》。' },
            { type: 'dialogue', speaker: '你', text: '苏小姐，您还有什么想对他说的吗？' },
            { type: 'dialogue', speaker: '苏晚', text: '（沉默了很久）……麻烦您了。' },

            // 入俭小游戏：清洁（擦拭）
            { type: 'minigame', data: {
                type: 'wipe',
                name: '周明远',
                desc: '给周明远先生做最后的清洁。他走得太匆忙，脸上还留着疲惫的痕迹。你要帮他整理好。',
                cleanRatio: 0.7 // 需要擦拭70%的面积
            }},

            // 晚间休息
            { type: 'evening', data: {
                money: 700,
                shopItems: [
                    { id: 'shelf', name: '书架', price: 400, icon: '📚', className: 'furniture-shelf' },
                    { id: 'painting', name: '挂画', price: 350, icon: '🖼', className: 'furniture-painting' },
                ]
            }},

            { type: 'sleep', data: { nextDay: 'day4' } },
        ]
    },

    // ============================================================
    // 第四天：陈念 & 白羽（恋人 & 恋人）
    // ============================================================
    day4: {
        day: '第四天',
        sky: 'bg-pink',
        bg: 'interior',
        commands: [
            { type: 'set-day', text: '第四天' },
            { type: 'set-sky', color: 'bg-pink' },
            {
                type: 'narration',
                text: '今天天空依然是粉色的。新闻里说"大气光学现象仍在持续中，请居民们保持镇定。"\n\n你翻开今天的档案：白羽，二十六岁，死因不明。登记人：陈念，恋人。'
            },

            // 陈念来访
            { type: 'dialogue', speaker: '', text: '上午十点，门铃响了。' },
            { type: 'dialogue', speaker: '', text: '一个年轻人。白色T恤，头发有些长，遮住了眼睛。脸很瘦，但强撑着精神。' },

            { type: 'dialogue', speaker: '陈念', text: '陈念。我委托入俭。' },
            { type: 'dialogue', speaker: '你', text: '白羽是……你们共同的朋友？' },
            { type: 'dialogue', speaker: '陈念', text: '不是朋友。是恋人。' },

            { type: 'dialogue', speaker: '你', text: '你们在一起多久了？' },
            { type: 'dialogue', speaker: '陈念', text: '一年零四个月。' },
            { type: 'dialogue', speaker: '你', text: '你们是怎么认识的？' },

            { type: 'dialogue', speaker: '陈念', text: '咖啡馆。她在街角那家咖啡店，每天下午三点来，点一杯拿铁，坐在靠窗的位置看书。' },
            { type: 'dialogue', speaker: '陈念', text: '她喜欢什么书？什么都看。有一天她迷上了天文图册——她说她喜欢星星，因为星星很远，远到不用担心它们会熄灭。' },

            { type: 'dialogue', speaker: '', text: '陈念的笑容淡了下去。' },
            { type: 'dialogue', speaker: '陈念', text: '她知道自己的身体有问题。她一直在吃药，不想告诉我。我整理衣柜的时候看到了药瓶。' },

            { type: 'dialogue', speaker: '陈念', text: '她走的前一晚，她说——"陈念，如果有一天我不在了，你不要难过。"' },
            { type: 'dialogue', speaker: '陈念', text: '我骂了她。我说你说这种话是什么意思。她哭了……然后第二天早上，她就不在了。' },

            // 需求
            { type: 'dialogue', speaker: '陈念', text: '让她穿那条蓝色的裙子。在棺材里放一包咖啡豆——我的咖啡店的豆子。' },
            { type: 'dialogue', speaker: '陈念', text: '还有一个……能不能在她的棺材旁边放一个小本子和一支笔？' },
            { type: 'dialogue', speaker: '你', text: '……' },
            { type: 'dialogue', speaker: '陈念', text: '我在她走之前，回了一句话——"别说这种话。你在，比什么都重要。"但她没有听到。求你了，让她看到。' },

            // 入俭小游戏：整理发型（拖拽）
            { type: 'minigame', data: {
                type: 'dressing',
                name: '白羽',
                desc: '给白羽穿上蓝裙子，整理她的头发，把那包咖啡豆轻轻放在枕边。',
                steps: [
                    { icon: '👗', text: '展开蓝裙子' },
                    { icon: '🤲', text: '帮她穿上' },
                    { icon: '💇', text: '整理头发' },
                    { icon: '☕', text: '放一包咖啡豆在枕边' },
                ]
            }},

            // 晚间休息
            { type: 'evening', data: {
                money: 550,
                shopItems: [
                    { id: 'flowers', name: '花瓶', price: 250, icon: '🌸', className: 'furniture-flowers' },
                ]
            }},

            { type: 'sleep', data: { nextDay: 'day5' } },
        ]
    },

    // ============================================================
    // 第五天：吴敏 & 吴静宜（妹妹 & 姐姐）
    // ============================================================
    day5: {
        day: '第五天',
        sky: 'bg-purple',
        bg: 'interior',
        commands: [
            { type: 'set-day', text: '第五天' },
            { type: 'set-sky', color: 'bg-purple' },
            {
                type: 'narration',
                text: '今天天空是紫色的。完全的、彻底的紫色。\n\n你翻开今天的档案：吴静宜，四十五岁，器官衰竭。登记人：吴敏，妹妹。'
            },

            // 吴敏来访
            { type: 'dialogue', speaker: '', text: '上午十点，门铃响了。' },
            { type: 'dialogue', speaker: '', text: '一个四十岁左右的女人。短发，朴素的外套，手很粗糙。' },

            { type: 'dialogue', speaker: '吴敏', text: '吴敏。我姐姐吴静宜。' },
            { type: 'dialogue', speaker: '你', text: '您姐姐是因为——' },
            { type: 'dialogue', speaker: '吴敏', text: '器官衰竭。医生说是什么天生的病，年纪大了撑不住了。' },

            { type: 'dialogue', speaker: '你', text: '您和姐姐感情怎么样？' },
            { type: 'dialogue', speaker: '吴敏', text: '（冷笑）感情？' },
            { type: 'dialogue', speaker: '吴敏', text: '从小到大，她都是那个"别人家的孩子"。成绩好，工作稳。所有人都说——"你看你姐姐，多厉害。"' },
            { type: 'dialogue', speaker: '吴敏', text: '我是那个"差生"。我妈有时候会说——"你看你姐姐，再看看你。"' },

            { type: 'dialogue', speaker: '吴敏', text: '但我姐姐从来不跟我比。她总是在所有人面前说——"我妹妹很聪明，她只是不想考第一。"' },

            // 姐姐的电话
            { type: 'dialogue', speaker: '吴敏', text: '她走的前一周，给我打了一个电话。' },
            { type: 'dialogue', speaker: '吴敏', text: '她说——"阿敏，我要走了。"' },
            { type: 'dialogue', speaker: '吴敏', text: '我问了一句——"疼不疼？"' },
            { type: 'dialogue', speaker: '吴敏', text: '她说——"不疼了。阿敏，不疼了。"' },

            // 需求
            { type: 'dialogue', speaker: '吴敏', text: '素色衣服。简单告别。不要花。' },
            { type: 'dialogue', speaker: '吴敏', text: '还有……我想亲手给她穿衣服。' },

            // 入俭小游戏：穿衣服+戴发卡（多步骤）
            { type: 'minigame', data: {
                type: 'dressing',
                name: '吴静宜',
                desc: '吴敏亲手给姐姐穿衣服。她把那个旧发卡别在姐姐的头发上——那是小时候吴敏送给她的。',
                steps: [
                    { icon: '👚', text: '穿上素色衣服' },
                    { icon: '💇', text: '整理头发' },
                    { icon: '📎', text: '别上旧发卡' },
                ]
            }},

            // 晚间休息
            { type: 'evening', data: {
                money: 650,
                shopItems: []
            }},

            { type: 'sleep', data: { nextDay: 'day6' } },
        ]
    },

    // ============================================================
    // 第六天：秦守业 & 秦桂英（老伴 & 老伴）
    // ============================================================
    day6: {
        day: '第六天',
        sky: 'bg-red',
        bg: 'interior',
        commands: [
            { type: 'set-day', text: '第六天' },
            { type: 'set-sky', color: 'bg-red' },
            {
                type: 'narration',
                text: '今天天空是暗红色的。风很大，风里带着一股奇怪的味道。\n\n手机推送："最后的解决方案将在明天公布。所有居民请注意，这是最后的通知。"\n\n你翻开今天的档案：秦桂英，七十一岁，自然死亡。登记人：秦守业，丈夫。'
            },

            // 秦守业来访
            { type: 'dialogue', speaker: '', text: '上午九点，门铃就响了。' },
            { type: 'dialogue', speaker: '', text: '一个老头。七十岁上下，穿着中山装，扣子扣得整整齐齐。背有些驼，但站得很直。' },

            { type: 'dialogue', speaker: '秦守业', text: '秦守业。我老伴桂英。我委托入俭。' },
            { type: 'dialogue', speaker: '你', text: '您老伴是——' },
            { type: 'dialogue', speaker: '秦守业', text: '自然死亡。昨晚走的。很安详。' },

            { type: 'dialogue', speaker: '秦守业', text: '我们结婚五十年。她走的那天早上，还给我煮了粥。小米粥，放了两颗枣。' },
            { type: 'dialogue', speaker: '秦守业', text: '吃完粥，她说——"老秦，今天的粥有点咸了。"' },
            { type: 'dialogue', speaker: '', text: '他停顿了一下。' },
            { type: 'dialogue', speaker: '秦守业', text: '她走后我尝了一口那锅粥。一点都不咸。' },

            // 需求
            { type: 'dialogue', speaker: '秦守业', text: '让她穿那件红色的毛衣。她六十岁生日那天我送她的。她说太红了，不好意思穿。' },
            { type: 'dialogue', speaker: '秦守业', text: '入俭的时候……我能在旁边看着吗？' },

            // 入俭小游戏：穿红色毛衣
            { type: 'minigame', data: {
                type: 'hold',
                name: '秦桂英',
                desc: '给秦桂英穿上那件红色毛衣。红得很亮，像一团安静的火。',
                duration: 4000
            }},

            // 晚间休息
            { type: 'evening', data: {
                money: 800,
                shopItems: []
            }},

            { type: 'sleep', data: { nextDay: 'day7' } },
        ]
    },

    // ============================================================
    // 第七天：林柚 & 世界（最终委托）
    // ============================================================
    day7: {
        day: '第七天',
        sky: 'bg-black',
        bg: 'interior',
        commands: [
            { type: 'set-day', text: '第七天' },
            { type: 'set-sky', color: 'bg-black' },
            {
                type: 'narration',
                text: '今天天空是黑色的。不是晚上的黑——是一种没有光的黑。\n\n没有太阳。没有云。什么都没有。只有黑色。'
            },
            {
                type: 'narration',
                text: '你坐在桌前，看着空荡荡的花盆。今天是最后一天。'
            },

            // 林柚来访——但这次不一样
            { type: 'dialogue', speaker: '', text: '门铃响了。你打开门。' },
            { type: 'dialogue', speaker: '', text: '门外站着林柚。但她的眼神不一样了——清澈、平静，像是知道一切。' },

            { type: 'dialogue', speaker: '林柚', text: '你好。' },
            { type: 'dialogue', speaker: '你', text: '……你也是来委托入俭的吗？' },
            { type: 'dialogue', speaker: '林柚', text: '嗯。但不是入俭一个人。' },

            { type: 'dialogue', speaker: '林柚', text: '我想请你帮我送这个世界最后一程。' },

            { type: 'dialogue', speaker: '你', text: '……' },
            { type: 'dialogue', speaker: '林柚', text: '你知道的，对吧？从第一天开始——每天的推送、每天的天空变化。' },
            { type: 'dialogue', speaker: '林柚', text: '陨石已经在路上了。科学家说了，我们挡不住。' },

            { type: 'dialogue', speaker: '你', text: '那你为什么……' },
            { type: 'dialogue', speaker: '林柚', text: '因为爷爷说过，入俭不是处理，是送别。这个世界陪了我们这么久……至少应该有人好好送它一程。' },

            { type: 'dialogue', speaker: '你', text: '好。' },

            // 入俭小游戏：回顾七天
            { type: 'minigame', data: {
                type: 'review',
                name: '这个世界',
                desc: '回顾七天里送别的每一个人。每一件物品，都是他们活过的证明。'
            }},

            // 最终独白
            { type: 'narration', text: '你站在告别室里。面前没有棺材，只有一面墙。墙上贴着这七天里每一个逝者的照片。', bg: 'bg-black' },
            { type: 'narration', text: '你想起林建国穿着蓝色夹克的样子。赵德明皱着的眉头。周明远改到第八版的报告。白羽的蓝裙子。吴静宜别着卡通发卡的侧脸。秦桂英的红色毛衣。', bg: 'bg-black' },

            { type: 'dialogue', speaker: '你', text: '这世界要结束了。\n\n但在这七天里，我看到了最好的东西。', bg: 'bg-black' },
            { type: 'dialogue', speaker: '你', text: '这些人——他们活过。他们爱过。这就够了。', bg: 'bg-black' },

            { type: 'narration', text: '你闭上眼睛。黑色的天空开始发光。\n\n不是温暖的光，也不是寒冷的光。\n\n是——白色的光。' },
            { type: 'narration', text: '纯白色的光。\n\n像新雪。\n\n像一张白纸。\n\n像一切开始的地方。' },

            // 尾声
            { type: 'narration', text: '光消散了。\n\n然后，你听到一些声音——', bg: 'bg-white' },

            { type: 'dialogue', speaker: '林柚', text: '爷爷，今天的月季开得真好。', bg: 'bg-white' },
            { type: 'dialogue', speaker: '赵国强', text: '爸，那件西装……其实挺合身的。', bg: 'bg-white' },
            { type: 'dialogue', speaker: '苏晚', text: '周明，第八版报告我改好了。', bg: 'bg-white' },
            { type: 'dialogue', speaker: '陈念', text: '白羽，我的咖啡店还在。拿铁还是你喜欢的味道。', bg: 'bg-white' },
            { type: 'dialogue', speaker: '吴敏', text: '姐，我今天升职了。', bg: 'bg-white' },
            { type: 'dialogue', speaker: '秦守业', text: '桂英，灯我一直留着呢。', bg: 'bg-white' },

            { type: 'narration', text: '然后连这些声音也安静下来。\n\n只剩下一个声音——', bg: 'bg-white' },

            { type: 'dialogue', speaker: '你', text: '再见。', bg: 'bg-white' },

            { type: 'narration', text: '—— Departures ——', bg: 'bg-white' },
            { type: 'narration', text: '—— 终 ——', bg: 'bg-white' },

            // 回到主菜单
            { type: 'menu' },
        ]
    },
};
