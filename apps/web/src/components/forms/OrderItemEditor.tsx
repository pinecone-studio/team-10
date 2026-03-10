import type { CreateOrderItemInput } from '../../types/order';

type OrderItemEditorProps = {
  item: CreateOrderItemInput;
  index: number;
  canRemove: boolean;
  onChange: (index: number, nextItem: CreateOrderItemInput) => void;
  onRemove: (index: number) => void;
};

export function OrderItemEditor({
  item,
  index,
  canRemove,
  onChange,
  onRemove,
}: OrderItemEditorProps) {
  const updateField = <K extends keyof CreateOrderItemInput>(key: K, value: CreateOrderItemInput[K]) => {
    onChange(index, { ...item, [key]: value });
  };

  return (
    <fieldset className="item-editor">
      <legend>Item #{index + 1}</legend>
      <label>
        Item Name
        <input value={item.itemName} onChange={(e) => updateField('itemName', e.target.value)} required />
      </label>
      <label>
        Quantity
        <input
          type="number"
          min={1}
          value={item.quantity}
          onChange={(e) => updateField('quantity', Number(e.target.value))}
          required
        />
      </label>
      <label>
        Unit Cost
        <input
          type="number"
          min={0}
          step="0.01"
          value={item.unitCost}
          onChange={(e) => updateField('unitCost', Number(e.target.value))}
          required
        />
      </label>
      <label>
        Source
        <input value={item.fromWhere} onChange={(e) => updateField('fromWhere', e.target.value)} required />
      </label>
      <label>
        Category
        <input value={item.category ?? ''} onChange={(e) => updateField('category', e.target.value)} />
      </label>
      <label>
        ETA
        <input type="datetime-local" value={item.eta ?? ''} onChange={(e) => updateField('eta', e.target.value)} />
      </label>
      <label className="full-width">
        Additional Notes
        <input
          value={item.additionalNotes ?? ''}
          onChange={(e) => updateField('additionalNotes', e.target.value)}
        />
      </label>
      <button type="button" className="danger" onClick={() => onRemove(index)} disabled={!canRemove}>
        Remove Item
      </button>
    </fieldset>
  );
}
