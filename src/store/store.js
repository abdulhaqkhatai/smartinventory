import { configureStore } from '@reduxjs/toolkit';
import authSlice from '../features/auth/authSlice';
import itemsSlice from '../features/items/itemsSlice';
import vendorsSlice from '../features/vendors/vendorsSlice';
import indentsSlice from '../features/indents/indentsSlice';
import purchaseOrdersSlice from '../features/purchase-orders/purchaseOrdersSlice';
import grnSlice from '../features/grn/grnSlice';
import inventorySlice from '../features/inventory/inventorySlice';
import issueReturnSlice from '../features/issue-return/issueReturnSlice';
import assetsSlice from '../features/assets/assetsSlice';

const store = configureStore({
  reducer: {
    auth: authSlice,
    items: itemsSlice,
    vendors: vendorsSlice,
    indents: indentsSlice,
    purchaseOrders: purchaseOrdersSlice,
    grn: grnSlice,
    inventory: inventorySlice,
    issueReturn: issueReturnSlice,
    assets: assetsSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
