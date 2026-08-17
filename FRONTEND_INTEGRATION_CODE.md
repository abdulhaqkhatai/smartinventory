# Frontend-Backend Integration Code Samples

This file contains code samples for integrating your forms with the API.

## 1. IndentFormPage.jsx - Form Submission

Replace your onSubmit handler with this:

```jsx
import { useDispatch } from 'react-redux';
import { createNewIndent, updateIndentData } from './indentsSlice';
import { useSnackbar } from 'notistack';

// Inside IndentFormPage component:
const dispatch = useDispatch();
const { enqueueSnackbar } = useSnackbar();
const { loading, error, success } = useSelector(state => state.indents);

// Modify onSubmit to handle API
const onSubmit = async (data) => {
  try {
    const payload = {
      requestedBy: currentUser?.name || 'Employee', // Get from auth context
      department: data.department,
      items: data.items.map(i => ({
        itemId: i.item.id,
        itemName: i.item.name,
        quantity: i.quantity,
        unit: i.item.unit,
        remarks: i.remarks
      })),
      remarks: data.remarks,
    };

    if (isEdit) {
      await dispatch(updateIndentData({ id: existingIndent.id, data: payload })).unwrap();
      enqueueSnackbar('Indent updated successfully', { variant: 'success' });
    } else {
      await dispatch(createNewIndent(payload)).unwrap();
      enqueueSnackbar('Indent created successfully', { variant: 'success' });
    }
    navigate('/indents');
  } catch (error) {
    enqueueSnackbar(`Error: ${error}`, { variant: 'error' });
  }
};

// Add loading state to button
<Button 
  type="submit" 
  variant="contained" 
  disabled={loading}
  startIcon={loading && <CircularProgress size={20} />}
>
  {loading ? 'Saving...' : 'Save Indent'}
</Button>
```

## 2. IndentDetailPage.jsx - Approval/Rejection

Replace your approval handler:

```jsx
import { updateIndentStatusAPI } from './indentsSlice';

const handleApprove = async () => {
  try {
    await dispatch(updateIndentStatusAPI({
      id,
      status: 'approved',
      approvedBy: currentUser?.name || 'Manager'
    })).unwrap();
    enqueueSnackbar('Indent approved successfully', { variant: 'success' });
    navigate('/indents');
  } catch (error) {
    enqueueSnackbar(`Error: ${error}`, { variant: 'error' });
  }
};

const handleReject = async () => {
  if (!rejectReason.trim()) {
    enqueueSnackbar('Please provide a reason', { variant: 'error' });
    return;
  }
  try {
    await dispatch(updateIndentStatusAPI({
      id,
      status: 'rejected',
      approvedBy: currentUser?.name || 'Manager',
      rejectionReason: rejectReason
    })).unwrap();
    enqueueSnackbar('Indent rejected', { variant: 'warning' });
    navigate('/indents');
  } catch (error) {
    enqueueSnackbar(`Error: ${error}`, { variant: 'error' });
  }
};
```

## 3. POFormPage.jsx - Create Purchase Order

```jsx
import { createNewPO } from './purchaseOrdersSlice';

const onSubmit = async (data) => {
  try {
    const payload = {
      vendorId: data.vendor.id,
      vendorName: data.vendor.name,
      indentRef: data.indentRef || null,
      items: data.items.map(i => ({
        itemId: i.item.id,
        itemName: i.item.name,
        quantity: i.quantity,
        rate: i.rate,
        gstRate: i.gstRate || 18,
        amount: i.quantity * i.rate
      })),
      deliveryDate: data.deliveryDate,
      terms: data.terms,
      paymentTerms: data.paymentTerms,
    };

    await dispatch(createNewPO(payload)).unwrap();
    enqueueSnackbar('Purchase Order created successfully', { variant: 'success' });
    navigate('/purchase-orders');
  } catch (error) {
    enqueueSnackbar(`Error: ${error}`, { variant: 'error' });
  }
};
```

## 4. GRNFormPage.jsx - Record Goods Receipt

```jsx
import { createNewGRN } from './grnSlice';

const onSubmit = async (data) => {
  try {
    const payload = {
      poRef: data.poRef,
      vendorName: data.vendorName,
      receivedBy: currentUser?.name || 'Store Manager',
      items: data.items.map(i => ({
        itemId: i.itemId,
        itemName: i.itemName,
        orderedQty: i.orderedQty,
        receivedQty: i.receivedQty,
        damagedQty: i.damagedQty || 0,
        acceptedQty: i.receivedQty - (i.damagedQty || 0)
      })),
      remarks: data.remarks,
    };

    const result = await dispatch(createNewGRN(payload)).unwrap();
    
    // Automatically update inventory
    await dispatch(recordStockInAPI({
      itemId: result.items[0].itemId,
      quantity: result.items[0].acceptedQty,
      reference: result.code,
      warehouse: 'Main Store',
      performedBy: currentUser?.name
    })).unwrap();

    enqueueSnackbar('Goods received successfully', { variant: 'success' });
    navigate('/grn');
  } catch (error) {
    enqueueSnackbar(`Error: ${error}`, { variant: 'error' });
  }
};
```

## 5. Update Redux Slice Import Statements

For each component using async thunks, add:

```jsx
import { 
  fetchIndents,
  createNewIndent,
  updateIndentData,
  updateIndentStatusAPI 
} from './indentsSlice';
```

## 6. Add Error Boundary Component

```jsx
// src/components/ErrorBoundary.jsx
import React from 'react';
import { Box, Typography, Button } from '@mui/material';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h5" color="error">
            Something went wrong
          </Typography>
          <Typography>{this.state.error?.message}</Typography>
          <Button 
            variant="contained" 
            onClick={() => this.setState({ hasError: false })}
            sx={{ mt: 2 }}
          >
            Try Again
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

## 7. API Response Format

Your backend returns responses in this format:

```javascript
// Success Response
{
  success: true,
  data: { /* entity object */ },
  message: "Operation successful"
}

// Error Response
{
  success: false,
  message: "Error description"
}

// Paginated Response
{
  success: true,
  data: [ /* array of entities */ ],
  pagination: {
    total: 100,
    limit: 20,
    offset: 0
  }
}
```

## 8. Loading States in Components

Add to all async operations:

```jsx
const { loading, error, success } = useSelector(state => state.indents);

// In JSX:
{loading && <CircularProgress />}
{error && <Alert severity="error">{error}</Alert>}
{success && <Alert severity="success">Action successful!</Alert>}

// For buttons:
<Button disabled={loading}>
  {loading ? 'Processing...' : 'Submit'}
</Button>
```

## 9. Sample Integration Patterns

### List Page Pattern
```jsx
useEffect(() => {
  dispatch(fetchIndents()); // Fetch on mount
}, [dispatch]);

// Use loading state
if (loading) return <Spinner />;

// Display data
<DataGrid rows={indents} columns={columns} />
```

### Form Page Pattern
```jsx
const handleSubmit = async (formData) => {
  try {
    await dispatch(createNewIndent(formData)).unwrap();
    navigate('/indents');
  } catch (error) {
    showError(error);
  }
};
```

### Detail Page Pattern
```jsx
useEffect(() => {
  dispatch(fetchIndentById(id)); // Get single record
}, [dispatch, id]);

// Display data
<Detail data={selectedIndent} />
```

## 10. Testing with Mock Data Fallback

If API fails, the system automatically falls back to mock data:

```jsx
export const fetchIndents = createAsyncThunk(
  'indents/fetchIndents',
  async (_, { rejectWithValue }) => {
    try {
      const response = await indentAPI.getAll();
      return response.data;
    } catch (error) {
      // Fallback to mock data
      return mockIndents;
    }
  }
);
```

---

## Quick Checklist for Form Integration

- [ ] Import async thunks in component
- [ ] Add useDispatch and useSelector
- [ ] Add useSnackbar for notifications
- [ ] Dispatch async thunk in onSubmit
- [ ] Use .unwrap() to handle errors
- [ ] Show loading state on button
- [ ] Show error/success messages
- [ ] Navigate on success
- [ ] Add useEffect for initial fetch

---

## Common Patterns

### Get Current User
```jsx
const auth = useSelector(state => state.auth);
const currentUser = auth?.user;
```

### Format Dates
```jsx
const date = dayjs(new Date()).format('YYYY-MM-DD');
```

### Calculate Totals
```jsx
const subtotal = items.reduce((sum, item) => sum + (item.qty * item.rate), 0);
const gstAmount = (subtotal * 18) / 100;
const total = subtotal + gstAmount;
```

---

This covers the integration pattern. Adapt as needed for your specific use case.
