import type { CreateOrderInput, CreateOrderItemInput } from '../types/order';

type DraftBase = Omit<CreateOrderInput, 'items'>;

const trimRequired = (value: string, label: string, errors: string[]): string => {
  const trimmed = value.trim();
  if (!trimmed) {
    errors.push(`${label} is required.`);
  }
  return trimmed;
};

const normalizeItem = (item: CreateOrderItemInput, index: number, errors: string[]): CreateOrderItemInput => {
  const label = `Item #${index + 1}`;
  const quantity = Number(item.quantity);
  const unitCost = Number(item.unitCost);
  if (!Number.isInteger(quantity) || quantity <= 0) {
    errors.push(`${label}: quantity must be a positive whole number.`);
  }
  if (!Number.isFinite(unitCost) || unitCost < 0) {
    errors.push(`${label}: unit cost must be zero or greater.`);
  }

  return {
    itemName: trimRequired(item.itemName, `${label} name`, errors),
    category: item.category?.trim() || undefined,
    quantity,
    unitCost,
    fromWhere: trimRequired(item.fromWhere, `${label} source`, errors),
    additionalNotes: item.additionalNotes?.trim() || undefined,
    eta: item.eta?.trim() || undefined,
  };
};

export function normalizeAndValidateOrder(
  base: DraftBase,
  items: CreateOrderItemInput[],
): { payload?: CreateOrderInput; errors: string[] } {
  const errors: string[] = [];
  if (items.length === 0) {
    errors.push('At least one item is required.');
  }

  const payload: CreateOrderInput = {
    whyOrdered: trimRequired(base.whyOrdered, 'Why Ordered', errors),
    orderProcess: trimRequired(base.orderProcess, 'Order Process', errors),
    whichOffice: trimRequired(base.whichOffice, 'Office', errors),
    whenToArrive: base.whenToArrive?.trim() || undefined,
    items: items.map((item, index) => normalizeItem(item, index, errors)),
  };

  return errors.length ? { errors } : { payload, errors: [] };
}
