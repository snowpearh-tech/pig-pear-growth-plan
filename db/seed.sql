INSERT OR IGNORE INTO settings (
  id,
  app_name,
  subtitle,
  pig_name,
  pear_name,
  hero_title,
  hero_description,
  welcome_title,
  welcome_description,
  timezone,
  updated_at
) VALUES (
  1,
  '猪梨成长计划 ❤️',
  '每一点努力，都值得被认真记录。',
  '猪猪',
  '梨梨',
  '把认真生活的每一刻，都变成看得见的成长',
  '做饭、陪伴、克制熬夜、准备惊喜，每一点温柔努力都值得被认真记下来。',
  '今天也在一起长大',
  '这里只有猪猪和梨梨的日常宇宙。积分会流动，成长值会积累，奖励会慢慢解锁。',
  'Asia/Shanghai',
  CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO categories (id, name, slug, description, accent_color, icon, sort_order, is_active, created_at, updated_at) VALUES
  (1, '家务', 'home-care', '认真照顾小家的一切。', '#f6b2bf', '🍳', 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (2, '陪伴', 'companionship', '温柔陪伴和一起生活的时刻。', '#f3cf8f', '🌷', 2, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (3, '习惯', 'habit', '让生活慢慢变好的小习惯。', '#a6d1bc', '🫧', 3, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (4, '惊喜', 'surprise', '让人心动的小小加分项。', '#ffbfce', '🎀', 4, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT OR IGNORE INTO rules (id, kind, title, emoji, category_id, delta, description, sort_order, is_active, created_at, updated_at) VALUES
  (1, 'positive', '做饭', '🍳', 1, 8, '下厨照顾今天的胃，也照顾今天的心情。', 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (2, 'positive', '洗碗', '🧹', 1, 5, '收尾也很重要，认真到底值得被表扬。', 2, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (3, 'positive', '陪梨梨散步', '🚶', 2, 10, '一起散散步，让今天慢一点、甜一点。', 3, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (4, 'positive', '准备小惊喜', '🎁', 4, 20, '爱意被用心准备的时候，会特别闪闪发光。', 4, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (5, 'negative', '熬夜', '🌙', 3, -5, '身体要先被照顾好，早点睡是长期主义。', 5, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (6, 'negative', '忘记倒垃圾', '🗑️', 1, -3, '小家要一起维护，记得顺手完成收尾。', 6, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (7, 'negative', '打游戏太久', '🎮', 3, -8, '休闲可以有，但也别把时间都交出去。', 7, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (8, 'negative', '态度敷衍', '😠', 2, -10, '好好说话，比赢一时更重要。', 8, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT OR IGNORE INTO rewards (id, title, emoji, cost, description, accent_color, sort_order, is_active, created_at, updated_at) VALUES
  (1, '一个亲亲', '❤️', 30, '被认真记录之后，也值得认真奖励。', '#ff9db4', 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (2, '奶茶约会', '🧋', 60, '挑一家想去的小店，认真约会一次。', '#f2c889', 2, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (3, '火锅', '🍲', 120, '热乎乎的一餐，适合庆祝所有努力。', '#ffb58c', 3, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (4, '电影之夜', '🎬', 150, '把客厅变成你们自己的小影院。', '#cdb6ff', 4, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (5, '一日游戏自由', '🎮', 200, '认真努力换来完全放心的放松一天。', '#97d6bf', 5, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT OR IGNORE INTO levels (id, name, threshold, badge_emoji, accent_color, sort_order, created_at, updated_at) VALUES
  (1, '小猪仔', 0, '🐷', '#f3a5b6', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (2, '乖乖猪', 100, '🌸', '#f4c77c', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (3, '暖心猪', 300, '☁️', '#9bc9b1', 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (4, '超级猪猪', 600, '👑', '#ffb28a', 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (5, '梨梨专属猪猪', 1000, '💖', '#ff8ea9', 5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT OR IGNORE INTO quotes (id, content, sort_order, is_active, created_at, updated_at) VALUES
  (1, '梨梨一直都有看到猪猪的努力 ❤️', 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (2, '今天也辛苦啦，认真生活的猪猪最会发光。', 2, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (3, '保持可爱，也保持努力，慢慢变成更闪亮的自己。', 3, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  (4, '被认真记录的每一点进步，都会在未来开花。', 4, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
