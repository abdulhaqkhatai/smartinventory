import test from 'node:test';
import assert from 'node:assert/strict';

import { getAllIndents, createIndent } from '../services/indentService.js';
import { getAllPurchaseOrders, createPurchaseOrder } from '../services/purchaseOrderService.js';
import { getAllGRNs, createGRN } from '../services/grnService.js';
import { getAllStockMovements, recordStockIn } from '../services/inventoryService.js';

test('indent service works without a configured database', async () => {
  const indents = await getAllIndents();
  assert.ok(Array.isArray(indents));

  const created = await createIndent({
    requestedBy: 'Abdul Haq',
    department: 'Engineering',
    items: [{ itemId: 101, itemName: 'Cable', quantity: 2 }],
    remarks: 'Test indent',
  });

  assert.ok(created);
  assert.match(created.code, /^IND-/);
});

test('purchase order service works without a configured database', async () => {
  const purchaseOrders = await getAllPurchaseOrders();
  assert.ok(Array.isArray(purchaseOrders));

  const created = await createPurchaseOrder({
    vendorId: 7,
    vendorName: 'Demo Vendor',
    indentRef: 'IND-TEST-1',
    items: [{ itemId: 101, itemName: 'Cable', quantity: 2, rate: 150, gstRate: 18 }],
    deliveryDate: '2026-08-25',
    terms: 'Terms apply',
    paymentTerms: 'Net 30',
  });

  assert.ok(created);
  assert.match(created.code, /^PO-/);
});

test('grn service works without a configured database', async () => {
  const grns = await getAllGRNs();
  assert.ok(Array.isArray(grns));

  const created = await createGRN({
    poRef: 'PO-TEST-1',
    vendorName: 'Demo Vendor',
    receivedBy: 'Abdul Haq',
    items: [{ itemId: 101, itemName: 'Cable', orderedQty: 2, receivedQty: 2, damagedQty: 0, acceptedQty: 2 }],
    remarks: 'Good quality',
  });

  assert.ok(created);
  assert.match(created.code, /^GRN-/);
});

test('inventory service works without a configured database', async () => {
  const movements = await getAllStockMovements();
  assert.ok(Array.isArray(movements));

  const created = await recordStockIn({
    itemId: 101,
    quantity: 3,
    reference: 'GRN-TEST-1',
    warehouse: 'Main Store',
    performedBy: 'Abdul Haq',
    remarks: 'Adjustment test',
  });

  assert.ok(created);
  assert.equal(created.type, 'Stock In');
});
