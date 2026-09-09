import Dexie, { type EntityTable } from "dexie";
import type { ICartItem } from "@/types";

const db = new Dexie("FoodMeCart") as Dexie & {
  products: EntityTable<ICartItem, "uid">;
};

db.version(1).stores({
  products: "uid, chefId",
});

export type { ICartItem };
export { db };
