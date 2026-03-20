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
    const latestProductsByCode = new Map(
      (await loadCatalogSnapshot()).products.map((product) => [product.code, product]),
    );
    const dellLaptopProduct =
      latestProductsByCode.get("DLL5440") ??
      (await createCatalogProduct({
        name: "Dell Latitude 5440 Laptop",
        code: "DLL5440",
        categoryId: itCategory.id,
        itemTypeName: "Laptop",
        currencyCode: "USD",
        defaultPrice: 1450,
        description: "Business laptop for demo inventory ordering.",
        imageUrl: null,
        status: "active",
        attributes: [],
      }));
    const lenovoLaptopProduct =
      latestProductsByCode.get("LNVE14") ??
      (await createCatalogProduct({
        name: "Lenovo ThinkPad E14 Laptop",
        code: "LNVE14",
        categoryId: itCategory.id,
        itemTypeName: "Laptop",
        currencyCode: "USD",
        defaultPrice: 1320,
        description: "Office laptop for demo inventory ordering.",
        imageUrl: null,
        status: "active",
        attributes: [],
      }));

    return [
      createDemoItem(
        dellLaptopProduct.id,
        dellLaptopProduct.name,
        dellLaptopProduct.code,
        dellLaptopProduct.unit,
        1,
        dellLaptopProduct.defaultPrice,
        dellLaptopProduct.currencyCode,
      ),
      createDemoItem(
        lenovoLaptopProduct.id,
        lenovoLaptopProduct.name,
        lenovoLaptopProduct.code,
        lenovoLaptopProduct.unit,
        1,
        lenovoLaptopProduct.defaultPrice,
        lenovoLaptopProduct.currencyCode,
      ),
    ] satisfies OrderItem[];
  } catch (error) {
    console.warn("Falling back to local demo order items.", error);

    return [
      createDemoItem(
        "demo-dell-latitude-5440",
        "Dell Latitude 5440 Laptop",
        "DLL5440",
        "pcs",
        1,
        1450,
        "USD",
      ),
      createDemoItem(
        "demo-lenovo-thinkpad-e14",
        "Lenovo ThinkPad E14 Laptop",
        "LNVE14",
        "pcs",
        1,
        1320,
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
