import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import type { DishDto, ICartItem } from "@/types";

export function useCart(chefId?: number) {
  const items =
    useLiveQuery(async () => {
      if (chefId === undefined) return db.products.toArray();
      return db.products.where("chefId").equals(chefId).toArray();
    }, [chefId]) ?? [];

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return { items, subtotal, totalCount };
}

export async function getCartChefId(): Promise<number | undefined> {
  const first = await db.products.toArray();
  return first[0]?.chefId;
}

export async function clearCart(): Promise<void> {
  await db.products.clear();
}

export async function addDishToCart(dish: DishDto): Promise<void> {
  const additionIds = dish.additions?.map(a => a.id).sort().join(',') || '';
  const uid = `${dish.chefId}-${dish.id}-${additionIds}`;
  const existing = await db.products.get(uid);
  if (existing) {
    await db.products.update(uid, { quantity: existing.quantity + 1 });
    return;
  }
  
  const itemTotal = dish.price + (dish.additions?.reduce((sum, a) => sum + a.price, 0) || 0);

  const item: ICartItem = {
    id: dish.id,
    uid,
    chefId: dish.chefId,
    nameEn: dish.nameEn,
    price: itemTotal,
    url: dish.url,
    quantity: Math.max(dish.minimumOrderCount, 1),
    limitations: { minQuantity: 1 },
    additions: dish.additions
  };
  await db.products.add(item);
}

export async function incrementCartItem(uid: string): Promise<void> {
  const existing = await db.products.get(uid);
  if (!existing) return;
  await db.products.update(uid, { quantity: existing.quantity + 1 });
}

export async function decrementCartItem(uid: string): Promise<void> {
  const existing = await db.products.get(uid);
  if (!existing) return;
  await db.products.update(uid, { quantity: existing.quantity - 1 });
}

export async function removeCartItem(uid: string): Promise<void> {
  await db.products.delete(uid);
}
