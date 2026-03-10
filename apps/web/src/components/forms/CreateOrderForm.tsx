import { type FormEvent, useState } from 'react';
import { pickRandomMockOrder } from '../../lib/mockOrder';
import { normalizeAndValidateOrder } from '../../lib/orderValidation';
import type { CreateOrderInput, CreateOrderItemInput } from '../../types/order';
import { OrderItemEditor } from './OrderItemEditor';

type CreateOrderFormProps = {
  isSubmitting: boolean;
  onSubmit: (input: CreateOrderInput) => Promise<void>;
};

const emptyItem = (): CreateOrderItemInput => ({
  itemName: '',
  category: '',
  quantity: 1,
  unitCost: 0,
  fromWhere: '',
  additionalNotes: '',
  eta: '',
});

export function CreateOrderForm({ isSubmitting, onSubmit }: CreateOrderFormProps) {
  const [base, setBase] = useState<Omit<CreateOrderInput, 'items'>>({
    whyOrdered: '',
    orderProcess: '',
    whichOffice: '',
    whenToArrive: '',
  });
  const [items, setItems] = useState<CreateOrderItemInput[]>([emptyItem()]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const applyDemoData = () => {
    const randomData = pickRandomMockOrder();
    setValidationErrors([]);
    setBase({
      whyOrdered: randomData.whyOrdered,
      orderProcess: randomData.orderProcess,
      whichOffice: randomData.whichOffice,
      whenToArrive: randomData.whenToArrive || '',
    });
    setItems(
      randomData.items.map((item) => ({
        ...item,
        category: item.category || '',
        additionalNotes: item.additionalNotes || '',
        eta: item.eta || '',
      })),
    );
  };

  const updateItem = (index: number, nextItem: CreateOrderItemInput) => {
    setItems((prev) => prev.map((item, itemIndex) => (itemIndex === index ? nextItem : item)));
  };

  const removeItem = (index: number) => {
    setItems((prev) => (prev.length > 1 ? prev.filter((_, itemIndex) => itemIndex !== index) : prev));
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const { payload, errors } = normalizeAndValidateOrder(base, items);
    if (!payload) {
      setValidationErrors(errors);
      return;
    }
    setValidationErrors([]);
    await onSubmit(payload);
    setBase({ whyOrdered: '', orderProcess: '', whichOffice: '', whenToArrive: '' });
    setItems([emptyItem()]);
  };

  return (
    <form className="panel form-panel" onSubmit={submit}>
      <h2>Create Order</h2>
      {validationErrors.length > 0 ? (
        <p className="inline-error">Please review: {validationErrors[0]}</p>
      ) : null}
      <label>
        Why Ordered
        <input required value={base.whyOrdered} onChange={(e) => setBase({ ...base, whyOrdered: e.target.value })} />
      </label>
      <label>
        Order Process
        <input
          required
          value={base.orderProcess}
          onChange={(e) => setBase({ ...base, orderProcess: e.target.value })}
        />
      </label>
      <label>
        Office
        <input required value={base.whichOffice} onChange={(e) => setBase({ ...base, whichOffice: e.target.value })} />
      </label>
      <label>
        Arrival Target
        <input
          type="datetime-local"
          value={base.whenToArrive || ''}
          onChange={(e) => setBase({ ...base, whenToArrive: e.target.value })}
        />
      </label>

      {items.map((item, index) => (
        <OrderItemEditor
          key={`item-${index}`}
          item={item}
          index={index}
          canRemove={items.length > 1}
          onChange={updateItem}
          onRemove={removeItem}
        />
      ))}

      <div className="form-actions">
        <button type="button" onClick={() => setItems((prev) => [...prev, emptyItem()])}>
          Add Item
        </button>
        <button type="button" className="button-muted" onClick={applyDemoData}>
          Demo
        </button>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Create Order'}
        </button>
      </div>
    </form>
  );
}
