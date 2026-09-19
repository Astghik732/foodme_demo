-- Additional menu item for Italiano Margarino (chef 32).
INSERT INTO foodme.dish (id, name_en, name_am, name_ru, description_en, price, url,
    portion_en, portion_am, portion_ru, status, minimum_order_count, priority_index, chef_id, dish_tag_id) VALUES
(9001, 'Quattro Formaggi', NULL, 'Четыре сыра', 'Four-cheese pizza.', 3200,
    'http://localhost:9000/foodme-images/chefs/32/dishes/9001/av.jpg',
    '520 grams', '520 գրամ', '520 грамм', 'ACTIVE', 1, 2, 32, 18);
