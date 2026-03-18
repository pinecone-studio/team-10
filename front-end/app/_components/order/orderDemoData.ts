"use client";

import {
  createCatalogCategory,
  createCatalogProduct,
  loadCatalogSnapshot,
} from "../../_lib/catalog-store";
import type { OrderItem } from "../../_lib/order-types";

export async function buildDemoDraftItems() {
  const initialCatalogSnapshot = await loadCatalogSnapshot();
  const itCategory =
    initialCatalogSnapshot.categories.find((category) => category.name === "IT Equipment") ??
    (await createCatalogCategory("IT Equipment")).category;
  const sportsCategory =
    initialCatalogSnapshot.categories.find(
      (category) => category.name === "Sports Equipment",
    ) ?? (await createCatalogCategory("Sports Equipment")).category;
  const latestProductsByCode = new Map(
    (await loadCatalogSnapshot()).products.map((product) => [product.code, product]),
  );
  const logitechProduct =
    latestProductsByCode.get("LMXK001") ??
    (await createCatalogProduct({
      name: "Logitech MX Keys",
      code: "LMXK001",
      categoryId: itCategory.id,
      itemTypeName: "Keyboard",
      currencyCode: "USD",
      defaultPrice: 123000,
      description: "Demo catalog product for order creation.",
      imageUrl: null,
      status: "active",
      attributes: [],
    }));
  const basketballProduct =
    latestProductsByCode.get("BASK001") ??
    (await createCatalogProduct({
      name: "Basketball",
      code: "BASK001",
      categoryId: sportsCategory.id,
      itemTypeName: "Ball",
      currencyCode: "USD",
      defaultPrice: 24324,
      description: "Demo catalog product for order creation.",
      imageUrl: null,
      status: "active",
      attributes: [],
    }));

  return [
    createDemoItem(logitechProduct.id, logitechProduct.name, logitechProduct.code, logitechProduct.unit, 2, logitechProduct.defaultPrice, logitechProduct.currencyCode),
    createDemoItem(basketballProduct.id, basketballProduct.name, basketballProduct.code, basketballProduct.unit, 1, basketballProduct.defaultPrice, basketballProduct.currencyCode),
  ] satisfies OrderItem[];
}

function createDemoItem(
  catalogId: string,
  name: string,
  code: string,
  unit: string,
  quantity: number,
  unitPrice: number,
  currencyCode: OrderItem["currencyCode"],
) {
  return {
    catalogId,
    name,
    code,
    unit,
    quantity,
    unitPrice,
    totalPrice: quantity * unitPrice,
    currencyCode,
  };
}
