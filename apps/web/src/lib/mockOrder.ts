import type { CreateOrderInput, CreateOrderItemInput } from '../types/order';

type MockOrderTemplate = Omit<CreateOrderInput, 'items'> & { items: CreateOrderItemInput[] };

const mockOrders: MockOrderTemplate[] = [
  {
    whyOrdered: 'New interns need full workstation kits',
    orderProcess: 'Quarterly onboarding procurement',
    whichOffice: 'Ulaanbaatar HQ',
    whenToArrive: '2026-03-22T10:30',
    items: [
      { itemName: '27" Monitor', category: 'Hardware', quantity: 4, unitCost: 210, fromWhere: 'Dell Partner' },
      { itemName: 'USB-C Dock', category: 'Accessories', quantity: 4, unitCost: 85, fromWhere: 'Anker Store' },
    ],
  },
  {
    whyOrdered: 'Customer support team headset refresh',
    orderProcess: 'Urgent replacement batch',
    whichOffice: 'Choijin Branch',
    whenToArrive: '2026-03-18T16:00',
    items: [
      { itemName: 'Noise-cancel headset', category: 'Audio', quantity: 7, unitCost: 129.9, fromWhere: 'Jabra Vendor' },
    ],
  },
  {
    whyOrdered: 'Conference room productivity upgrade',
    orderProcess: 'Capex-approved purchase order',
    whichOffice: 'Engineering Hub',
    whenToArrive: '2026-03-28T09:00',
    items: [
      { itemName: 'Wireless Keyboard', category: 'Peripherals', quantity: 12, unitCost: 54.5, fromWhere: 'Logitech' },
      { itemName: 'Webcam 4K', category: 'Video', quantity: 3, unitCost: 189, fromWhere: 'Best Buy Business' },
    ],
  },
];

const cloneItems = (items: CreateOrderItemInput[]): CreateOrderItemInput[] =>
  items.map((item) => ({ ...item, additionalNotes: item.additionalNotes || '', eta: item.eta || '' }));

export function pickRandomMockOrder(): CreateOrderInput {
  const randomIndex = Math.floor(Math.random() * mockOrders.length);
  const template = mockOrders[randomIndex];
  return {
    ...template,
    items: cloneItems(template.items),
  };
}
