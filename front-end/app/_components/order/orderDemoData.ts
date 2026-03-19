"use client";

import {
  createCatalogCategory,
  createCatalogProduct,
  loadCatalogSnapshot,
} from "../../_lib/catalog-store";
import type { OrderItem } from "../../_lib/order-types";

export async function buildDemoDraftItems() {
  try {
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
        defaultPrice: 399,
        description: "Wireless productivity keyboard for office demo ordering.",
        imageUrl: null,
        status: "active",
        attributes: [],
      }));
    const basketballProduct =
      latestProductsByCode.get("WLSN001") ??
      (await createCatalogProduct({
        name: "Wilson Evolution Basketball",
        code: "WLSN001",
        categoryId: sportsCategory.id,
        itemTypeName: "Ball",
        currencyCode: "USD",
        defaultPrice: 79,
        description: "Indoor game ball used as a realistic non-IT demo item.",
        imageUrl: null,
        status: "active",
        attributes: [],
      }));

    return [
      createDemoItem(
        logitechProduct.id,
        logitechProduct.name,
        logitechProduct.code,
        logitechProduct.unit,
        2,
        logitechProduct.defaultPrice,
        logitechProduct.currencyCode,
      ),
      createDemoItem(
        basketballProduct.id,
        basketballProduct.name,
        basketballProduct.code,
        basketballProduct.unit,
        1,
        basketballProduct.defaultPrice,
        basketballProduct.currencyCode,
      ),
    ] satisfies OrderItem[];
  } catch (error) {
    console.warn("Falling back to local demo order items.", error);

    return [
      createDemoItem(
        "demo-logitech-mx-keys",
        "Logitech MX Keys",
        "LMXK001",
        "pcs",
        2,
        399,
        "USD",
      ),
      createDemoItem(
        "demo-wilson-evolution-basketball",
        "Wilson Evolution Basketball",
        "WLSN001",
        "pcs",
        1,
        79,
        "USD",
      ),
    ] satisfies OrderItem[];
  }
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
