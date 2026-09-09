# FoodMe API contract (authoritative)

Base URL in dev: `http://localhost:8081`. Every app MUST conform to this file.
Paths and JSON field names are inherited from bychef.am and are **frozen** — do
not rename fields, even where they look odd (`nameHy`, `exploreChefResponseDtoList`).

Translation arrays use the shape `[{ "lang": "en" | "hy" | "ru", "value": "..." }]`.
Languages present: `en`, `hy`, `ru`. UI renders `en`.

## Public API — `/api/**` (no auth)

### `GET /api/chef/active?page=0&size=12`
```json
{
  "exploreChefResponseDtoList": [ ExploreChefResponseDto ],
  "count": 7
}
```
Only `status = "ACTIVE"` chefs. Sorted by `priorityIndex` asc, then `id` asc.

### `GET /api/chef/{id}` → `ExploreChefResponseDto` (includes `dishes`)
### `GET /api/chef?username=marta-k` → `ExploreChefResponseDto`

`ExploreChefResponseDto`:
```json
{
  "id": 1,
  "username": "marta-k",
  "avatarUrl": "/img/chef/1-avatar.jpg",
  "bannerUrl": "/img/chef/1-banner.jpg",
  "name":        [{"lang":"en","value":"Marta's Kitchen"}, ...],
  "description": [{"lang":"en","value":"..."}, ...],
  "kitchen":     [{"lang":"en","value":"Armenian"}, ...],
  "rating": 4.7,
  "status": "ACTIVE",
  "phoneNumber": "+37493000001",
  "deliveryPrice": 700.0,
  "freeDeliveryFrom": 8000.0,
  "deliveryMethods": ["DELIVERY", "TAKEAWAY"],
  "dishes": [ DishDto ]
}
```
`dishes` is present only on the single-chef endpoints; on `/active` it is `null`.

### `GET /api/dish/{chefId}/active?page=0&size=50`
```json
{ "dishDtoList": [ DishDto ], "count": 12 }
```
(`DishPaginationCountDto`)

### `GET /api/dish/{id}` → `DishDto`
### `GET /api/dish/search?query=lav&page=0&size=20` → `DishPaginationCountDto`

`DishDto`:
```json
{
  "id": 10,
  "nameEn": "Lavash Wrap", "nameHy": "...", "nameRu": "...",
  "descriptionEn": "...",
  "price": 2200.0,
  "url": "/img/dish/10.jpg",
  "portionEn": "350 g", "portionHy": "...", "portionRu": "...",
  "status": "ACTIVE",
  "minimumOrderCount": 1,
  "priorityIndex": 3,
  "chefId": 1,
  "dishTagDto": { "id": 22, "nameEn": "Beef & Pork Dishes", "nameHy": "...", "nameRu": "..." }
}
```

### `GET /api/dish/tags?chefId=1`
```json
[ { "priorityIndex": 0, "dishTagDto": { "id": 1, "nameEn": "Starters", ... } } ]
```
(`ChefTagOrderWithDishTagDto`)

### `POST /api/order/delivery-price`
Request: `{ "chefId": 1, "subtotal": 5400.0, "deliveryMethod": "DELIVERY" }`
Response: `{ "deliveryPrice": 700.0, "freeDeliveryFrom": 8000.0 }`
`TAKEAWAY` always returns `0.0`.

### `POST /api/order`
Request (`OrderDto`):
```json
{
  "chefId": 1,
  "receiverName": "Ann",
  "receiverPhoneNumber": "+37491234567",
  "receiverEmail": "ann@example.com",
  "paymentType": "CASH",
  "deliveryMethod": "DELIVERY",
  "note": "ring twice",
  "addressDto": { "city": "Yerevan", "street": "Abovyan", "building": "12", "apartment": "4", "note": "" },
  "createOrderDishes": [ { "dishId": 10, "quantity": 2 } ]
}
```
Response (`OrderCreateResponseDto`): `{ "number": "FM-100001", "status": "NEW", "totalPrice": 5100.0 }`

Rules:
- `paymentType` other than `"CASH"` → **400** `{"message":"Only CASH payment is supported"}`
- `deliveryMethod: "TAKEAWAY"` → `addressDto` may be null, delivery price 0
- prices are recomputed server-side from the DB, never trusted from the client

### `GET /api/order/number/{number}` → `OrderDto`
Full order incl. `orderDishList`, `status`, `createdAt`, `chefName`.

## Admin API — `/admin/**` (Bearer JWT)

- `POST /admin/auth/login` — `{username, password}` → `{ "token": "...", "username": "admin", "role": "ADMIN" }`
- `GET  /admin/chef?page=&size=&q=` → `{ "list": [...], "count": n }`
- `GET  /admin/chef/{id}` · `PUT /admin/chef/{id}`
- `GET  /admin/dish?page=&size=&chefId=&q=` → `{ "list": [...], "count": n }`
- `GET  /admin/dish/{id}` · `PUT /admin/dish/{id}`
- `GET  /admin/order?page=&size=&status=` → `{ "list": [...], "count": n }`
- `GET  /admin/order/{id}` → full `OrderDto`
- `PATCH /admin/order/{id}/status` — `{ "status": "ACCEPTED", "rejectReason": null }`

Status machine: `NEW → ACCEPTED → DELIVERED`; `NEW|ACCEPTED → REJECTED`.

## Errors

```json
{ "timestamp": "...", "status": 404, "error": "Not Found", "message": "Chef 999 not found", "path": "/api/chef/999" }
```

## Ops endpoints
`/actuator/health`, `/actuator/info`, `/actuator/prometheus` — open, no auth.
`/swagger-ui.html` + `/v3/api-docs` — open.
