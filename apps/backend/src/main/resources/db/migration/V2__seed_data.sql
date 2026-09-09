INSERT INTO foodme.dish_tag (id, name_en, name_am, name_ru) VALUES
(1,  'Soups', 'Ապուրներ', 'Супы'),
(3,  'Wrap', 'Ռեփ', 'Ролл'),
(6,  'Salad', 'Աղցան', 'Салат'),
(7,  'Bowls', 'Բոուլ', 'Боул'),
(14, 'Rice Dishes', 'Բրնձից պատրաստված ուտեստներ', 'Блюда из риса'),
(16, 'Flatbread', 'Հացաբլիթ', 'Лепешка'),
(18, 'Baked Goods & Pastries', 'Թխվածքներ և խմորեղեն', 'Выпечка и кондитерские изделия'),
(19, 'Desserts', 'Աղանդեր', 'Десерты'),
(20, 'Seafood Dishes', 'Ծովամթերքից պատրաստված ուտեստներ', 'Блюда из морепродуктов'),
(21, 'Chicken Dishes', 'Հավի ուտեստներ', 'Блюда из курицы'),
(22, 'Beef & Pork Dishes', 'Տավարի և խոզի մսով ուտեստներ', 'Блюда из говядины и свинины'),
(23, 'Vegetarian & Vegan Dishes', 'Բուսական և վեգան ուտեստներ', 'Вегетарианские и веганские блюда');

INSERT INTO foodme.admin (id, username, password_hash, role) VALUES
(1, 'admin', '$2y$10$oMkXATQDgiPBCh29e2u7ROJkWXECjE2kmHPwCpJGAvkf3TuFbnZCi', 'ADMIN');

SELECT setval('foodme.chef_id_seq', 9, false);
SELECT setval('foodme.dish_tag_id_seq', 24, false);
SELECT setval('foodme.dish_id_seq', 41, false);
SELECT setval('foodme.chef_tag_order_id_seq', 26, false);
SELECT setval('foodme.address_id_seq', 2, false);
SELECT setval('foodme.order_id_seq', 2, false);
SELECT setval('foodme.order_dish_id_seq', 3, false);
SELECT setval('foodme.admin_id_seq', 2, false);
SELECT setval('foodme.order_number_seq', 2, false);
