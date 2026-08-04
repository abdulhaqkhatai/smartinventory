// Comprehensive mock data for the Smart Inventory & Store Management System

export const mockUsers = [
  { id: 1, name: 'Rajesh Kumar', email: 'admin@smartinv.com', role: 'Admin', department: 'IT', avatar: null, status: 'active' },
  { id: 2, name: 'Priya Sharma', email: 'store@smartinv.com', role: 'Store Manager', department: 'Store', avatar: null, status: 'active' },
  { id: 3, name: 'Amit Patel', email: 'purchase@smartinv.com', role: 'Purchase Manager', department: 'Purchase', avatar: null, status: 'active' },
  { id: 4, name: 'Sneha Reddy', email: 'employee@smartinv.com', role: 'Employee', department: 'Engineering', avatar: null, status: 'active' },
  { id: 5, name: 'Vikram Singh', email: 'vikram@smartinv.com', role: 'Employee', department: 'Operations', avatar: null, status: 'active' },
];

export const mockCategories = [
  { id: 1, name: 'Office Supplies', code: 'OS' },
  { id: 2, name: 'IT Equipment', code: 'IT' },
  { id: 3, name: 'Furniture', code: 'FN' },
  { id: 4, name: 'Electrical', code: 'EL' },
  { id: 5, name: 'Stationery', code: 'ST' },
  { id: 6, name: 'Cleaning Supplies', code: 'CL' },
  { id: 7, name: 'Safety Equipment', code: 'SE' },
  { id: 8, name: 'Packaging Material', code: 'PM' },
];

export const mockUnits = [
  { id: 1, name: 'Pieces', code: 'PCS' },
  { id: 2, name: 'Kilograms', code: 'KG' },
  { id: 3, name: 'Liters', code: 'LTR' },
  { id: 4, name: 'Meters', code: 'MTR' },
  { id: 5, name: 'Box', code: 'BOX' },
  { id: 6, name: 'Dozen', code: 'DZN' },
  { id: 7, name: 'Set', code: 'SET' },
  { id: 8, name: 'Ream', code: 'REM' },
];

export const mockItems = [
  { id: 1, code: 'ITM-001', name: 'A4 Copier Paper (500 Sheets)', category: 'Stationery', brand: 'JK Paper', unit: 'REM', hsn: '4802', gstRate: 12, reorderLevel: 50, minStock: 20, maxStock: 500, currentStock: 120, unitPrice: 285, image: null },
  { id: 2, code: 'ITM-002', name: 'HP LaserJet Toner 12A', category: 'IT Equipment', brand: 'HP', unit: 'PCS', hsn: '8443', gstRate: 18, reorderLevel: 10, minStock: 5, maxStock: 50, currentStock: 8, unitPrice: 2450, image: null },
  { id: 3, code: 'ITM-003', name: 'Whiteboard Marker (Set of 10)', category: 'Stationery', brand: 'Luxor', unit: 'SET', hsn: '9608', gstRate: 18, reorderLevel: 30, minStock: 10, maxStock: 200, currentStock: 45, unitPrice: 350, image: null },
  { id: 4, code: 'ITM-004', name: 'Ergonomic Office Chair', category: 'Furniture', brand: 'Featherlite', unit: 'PCS', hsn: '9401', gstRate: 18, reorderLevel: 5, minStock: 2, maxStock: 30, currentStock: 3, unitPrice: 12500, image: null },
  { id: 5, code: 'ITM-005', name: 'Cat6 Ethernet Cable (5m)', category: 'IT Equipment', brand: 'D-Link', unit: 'PCS', hsn: '8544', gstRate: 18, reorderLevel: 25, minStock: 10, maxStock: 100, currentStock: 60, unitPrice: 180, image: null },
  { id: 6, code: 'ITM-006', name: 'LED Desk Lamp', category: 'Electrical', brand: 'Philips', unit: 'PCS', hsn: '9405', gstRate: 18, reorderLevel: 15, minStock: 5, maxStock: 50, currentStock: 12, unitPrice: 1200, image: null },
  { id: 7, code: 'ITM-007', name: 'Hand Sanitizer 500ml', category: 'Cleaning Supplies', brand: 'Dettol', unit: 'PCS', hsn: '3808', gstRate: 18, reorderLevel: 20, minStock: 10, maxStock: 100, currentStock: 35, unitPrice: 199, image: null },
  { id: 8, code: 'ITM-008', name: 'Wireless Mouse', category: 'IT Equipment', brand: 'Logitech', unit: 'PCS', hsn: '8471', gstRate: 18, reorderLevel: 20, minStock: 10, maxStock: 80, currentStock: 15, unitPrice: 750, image: null },
  { id: 9, code: 'ITM-009', name: 'Safety Helmet', category: 'Safety Equipment', brand: 'Karam', unit: 'PCS', hsn: '6506', gstRate: 18, reorderLevel: 15, minStock: 5, maxStock: 60, currentStock: 22, unitPrice: 450, image: null },
  { id: 10, code: 'ITM-010', name: 'Bubble Wrap Roll (100m)', category: 'Packaging Material', brand: 'Superpack', unit: 'PCS', hsn: '3920', gstRate: 18, reorderLevel: 10, minStock: 5, maxStock: 40, currentStock: 6, unitPrice: 850, image: null },
  { id: 11, code: 'ITM-011', name: 'USB-C Hub (7-in-1)', category: 'IT Equipment', brand: 'Anker', unit: 'PCS', hsn: '8471', gstRate: 18, reorderLevel: 10, minStock: 5, maxStock: 30, currentStock: 18, unitPrice: 2200, image: null },
  { id: 12, code: 'ITM-012', name: 'Sticky Notes (Pack of 12)', category: 'Stationery', brand: '3M', unit: 'PCS', hsn: '4820', gstRate: 12, reorderLevel: 40, minStock: 15, maxStock: 200, currentStock: 90, unitPrice: 320, image: null },
];

export const mockVendors = [
  { id: 1, code: 'VND-001', name: 'TechWorld Solutions Pvt. Ltd.', gst: '27AABCT1234F1ZN', pan: 'AABCT1234F', contactPerson: 'Suresh Menon', phone: '9876543210', email: 'suresh@techworld.co.in', address: '42, Electronic City, Phase 2, Bangalore - 560100', bankName: 'HDFC Bank', accountNo: '50200012345678', ifsc: 'HDFC0001234', status: 'active', rating: 4.5, totalOrders: 45 },
  { id: 2, code: 'VND-002', name: 'Bharat Office Supplies', gst: '29AABCB5678G1Z5', pan: 'AABCB5678G', contactPerson: 'Kavitha Nair', phone: '9988776655', email: 'kavitha@bharatoffice.com', address: '15, MG Road, Ernakulam, Kochi - 682016', bankName: 'SBI', accountNo: '38912345678', ifsc: 'SBIN0001234', status: 'active', rating: 4.2, totalOrders: 32 },
  { id: 3, code: 'VND-003', name: 'SafeGuard Industrial Supplies', gst: '33AABCS9012H1Z8', pan: 'AABCS9012H', contactPerson: 'Manoj Kumar', phone: '9123456789', email: 'manoj@safeguard.in', address: '78, SIDCO Industrial Estate, Guindy, Chennai - 600032', bankName: 'ICICI Bank', accountNo: '123409876543', ifsc: 'ICIC0001234', status: 'active', rating: 3.8, totalOrders: 18 },
  { id: 4, code: 'VND-004', name: 'PrintPro Technologies', gst: '07AABCP3456I1Z2', pan: 'AABCP3456I', contactPerson: 'Deepak Verma', phone: '9876123450', email: 'deepak@printpro.in', address: '23, Nehru Place, New Delhi - 110019', bankName: 'Axis Bank', accountNo: '920010012345', ifsc: 'UTIB0001234', status: 'inactive', rating: 3.5, totalOrders: 8 },
  { id: 5, code: 'VND-005', name: 'Green Clean Industries', gst: '06AABCG7890J1Z6', pan: 'AABCG7890J', contactPerson: 'Anita Desai', phone: '9654321098', email: 'anita@greenclean.co.in', address: '56, Udyog Vihar, Phase 4, Gurgaon - 122015', bankName: 'Kotak Mahindra Bank', accountNo: '1611123456', ifsc: 'KKBK0001234', status: 'active', rating: 4.0, totalOrders: 22 },
  { id: 6, code: 'VND-006', name: 'Raj Furniture Works', gst: '24AABCR1234K1Z9', pan: 'AABCR1234K', contactPerson: 'Rajendra Patel', phone: '9898765432', email: 'raj@rajfurniture.com', address: '12, GIDC Industrial Area, Ahmedabad - 382445', bankName: 'Bank of Baroda', accountNo: '26420123456', ifsc: 'BARB0001234', status: 'active', rating: 4.3, totalOrders: 15 },
];

export const mockIndents = [
  { id: 1, code: 'IND-2024-001', requestedBy: 'Sneha Reddy', department: 'Engineering', date: '2024-12-15', status: 'approved', items: [{ itemId: 2, itemName: 'HP LaserJet Toner 12A', quantity: 5, unit: 'PCS', remarks: 'Urgent requirement' }, { itemId: 8, itemName: 'Wireless Mouse', quantity: 10, unit: 'PCS', remarks: '' }], remarks: 'Required for new employee setup', approvedBy: 'Priya Sharma', approvedDate: '2024-12-16' },
  { id: 2, code: 'IND-2024-002', requestedBy: 'Vikram Singh', department: 'Operations', date: '2024-12-18', status: 'submitted', items: [{ itemId: 9, itemName: 'Safety Helmet', quantity: 20, unit: 'PCS', remarks: 'For factory floor' }], remarks: 'Annual replacement', approvedBy: null, approvedDate: null },
  { id: 3, code: 'IND-2024-003', requestedBy: 'Sneha Reddy', department: 'Engineering', date: '2024-12-20', status: 'draft', items: [{ itemId: 4, itemName: 'Ergonomic Office Chair', quantity: 5, unit: 'PCS', remarks: '' }, { itemId: 6, itemName: 'LED Desk Lamp', quantity: 5, unit: 'PCS', remarks: '' }], remarks: 'Office expansion', approvedBy: null, approvedDate: null },
  { id: 4, code: 'IND-2024-004', requestedBy: 'Amit Patel', department: 'Purchase', date: '2024-12-22', status: 'rejected', items: [{ itemId: 1, itemName: 'A4 Copier Paper (500 Sheets)', quantity: 200, unit: 'REM', remarks: '' }], remarks: 'Bulk purchase request', approvedBy: 'Rajesh Kumar', approvedDate: '2024-12-23', rejectionReason: 'Quantity exceeds budget allocation' },
  { id: 5, code: 'IND-2025-001', requestedBy: 'Vikram Singh', department: 'Operations', date: '2025-01-05', status: 'approved', items: [{ itemId: 7, itemName: 'Hand Sanitizer 500ml', quantity: 50, unit: 'PCS', remarks: 'Monthly replenishment' }, { itemId: 10, itemName: 'Bubble Wrap Roll (100m)', quantity: 15, unit: 'PCS', remarks: '' }], remarks: 'Monthly supplies', approvedBy: 'Priya Sharma', approvedDate: '2025-01-06' },
];

export const mockPurchaseOrders = [
  { id: 1, code: 'PO-2024-001', vendorId: 1, vendorName: 'TechWorld Solutions Pvt. Ltd.', indentRef: 'IND-2024-001', date: '2024-12-17', deliveryDate: '2024-12-25', status: 'completed', items: [{ itemId: 2, itemName: 'HP LaserJet Toner 12A', quantity: 5, rate: 2450, gstRate: 18, amount: 12250 }, { itemId: 8, itemName: 'Wireless Mouse', quantity: 10, rate: 750, gstRate: 18, amount: 7500 }], subtotal: 19750, gstAmount: 3555, totalAmount: 23305, terms: 'Delivery within 7 days', paymentTerms: 'Net 30' },
  { id: 2, code: 'PO-2025-001', vendorId: 5, vendorName: 'Green Clean Industries', indentRef: 'IND-2025-001', date: '2025-01-07', deliveryDate: '2025-01-15', status: 'pending', items: [{ itemId: 7, itemName: 'Hand Sanitizer 500ml', quantity: 50, rate: 199, gstRate: 18, amount: 9950 }, { itemId: 10, itemName: 'Bubble Wrap Roll (100m)', quantity: 15, rate: 850, gstRate: 18, amount: 12750 }], subtotal: 22700, gstAmount: 4086, totalAmount: 26786, terms: 'Quality check on delivery', paymentTerms: 'Net 15' },
  { id: 3, code: 'PO-2025-002', vendorId: 6, vendorName: 'Raj Furniture Works', indentRef: null, date: '2025-01-10', deliveryDate: '2025-02-10', status: 'pending', items: [{ itemId: 4, itemName: 'Ergonomic Office Chair', quantity: 10, rate: 12500, gstRate: 18, amount: 125000 }], subtotal: 125000, gstAmount: 22500, totalAmount: 147500, terms: 'Assembly included', paymentTerms: 'Net 45' },
];

export const mockGRNs = [
  { id: 1, code: 'GRN-2024-001', poRef: 'PO-2024-001', vendorName: 'TechWorld Solutions Pvt. Ltd.', date: '2024-12-24', receivedBy: 'Priya Sharma', status: 'completed', items: [{ itemId: 2, itemName: 'HP LaserJet Toner 12A', orderedQty: 5, receivedQty: 5, damagedQty: 0, acceptedQty: 5 }, { itemId: 8, itemName: 'Wireless Mouse', orderedQty: 10, receivedQty: 10, damagedQty: 1, acceptedQty: 9 }], remarks: 'One mouse was physically damaged' },
  { id: 2, code: 'GRN-2025-001', poRef: 'PO-2025-001', vendorName: 'Green Clean Industries', date: '2025-01-14', receivedBy: 'Priya Sharma', status: 'partial', items: [{ itemId: 7, itemName: 'Hand Sanitizer 500ml', orderedQty: 50, receivedQty: 30, damagedQty: 0, acceptedQty: 30 }, { itemId: 10, itemName: 'Bubble Wrap Roll (100m)', orderedQty: 15, receivedQty: 15, damagedQty: 2, acceptedQty: 13 }], remarks: 'Partial delivery for sanitizers, 2 bubble wrap rolls damaged' },
];

export const mockStockMovements = [
  { id: 1, date: '2024-12-24', type: 'Stock In', itemName: 'HP LaserJet Toner 12A', quantity: 5, reference: 'GRN-2024-001', warehouse: 'Main Store', performedBy: 'Priya Sharma' },
  { id: 2, date: '2024-12-24', type: 'Stock In', itemName: 'Wireless Mouse', quantity: 9, reference: 'GRN-2024-001', warehouse: 'Main Store', performedBy: 'Priya Sharma' },
  { id: 3, date: '2024-12-26', type: 'Issue', itemName: 'Wireless Mouse', quantity: 5, reference: 'ISS-2024-001', warehouse: 'Main Store', performedBy: 'Priya Sharma' },
  { id: 4, date: '2025-01-02', type: 'Return', itemName: 'Wireless Mouse', quantity: 1, reference: 'RTN-2025-001', warehouse: 'Main Store', performedBy: 'Priya Sharma' },
  { id: 5, date: '2025-01-14', type: 'Stock In', itemName: 'Hand Sanitizer 500ml', quantity: 30, reference: 'GRN-2025-001', warehouse: 'Main Store', performedBy: 'Priya Sharma' },
  { id: 6, date: '2025-01-14', type: 'Stock In', itemName: 'Bubble Wrap Roll (100m)', quantity: 13, reference: 'GRN-2025-001', warehouse: 'Main Store', performedBy: 'Priya Sharma' },
  { id: 7, date: '2025-01-15', type: 'Transfer', itemName: 'Hand Sanitizer 500ml', quantity: 10, reference: 'TRF-2025-001', warehouse: 'Branch Store', performedBy: 'Vikram Singh' },
  { id: 8, date: '2025-01-18', type: 'Adjustment', itemName: 'A4 Copier Paper (500 Sheets)', quantity: -5, reference: 'ADJ-2025-001', warehouse: 'Main Store', performedBy: 'Priya Sharma' },
];

export const mockIssueTransactions = [
  { id: 1, code: 'ISS-2024-001', date: '2024-12-26', issuedTo: 'Sneha Reddy', department: 'Engineering', items: [{ itemName: 'Wireless Mouse', quantity: 5 }], issuedBy: 'Priya Sharma', status: 'issued', remarks: 'For new developer workstations' },
  { id: 2, code: 'ISS-2025-001', date: '2025-01-10', issuedTo: 'Vikram Singh', department: 'Operations', items: [{ itemName: 'Safety Helmet', quantity: 8 }, { itemName: 'Hand Sanitizer 500ml', quantity: 10 }], issuedBy: 'Priya Sharma', status: 'issued', remarks: 'Monthly safety supplies' },
  { id: 3, code: 'ISS-2025-002', date: '2025-01-20', issuedTo: 'Amit Patel', department: 'Purchase', items: [{ itemName: 'A4 Copier Paper (500 Sheets)', quantity: 10 }], issuedBy: 'Priya Sharma', status: 'issued', remarks: '' },
];

export const mockReturnTransactions = [
  { id: 1, code: 'RTN-2025-001', date: '2025-01-02', returnedBy: 'Sneha Reddy', department: 'Engineering', items: [{ itemName: 'Wireless Mouse', quantity: 1, condition: 'Good' }], receivedBy: 'Priya Sharma', issueRef: 'ISS-2024-001', remarks: 'Employee transferred' },
];

export const mockAssets = [
  { id: 1, code: 'AST-001', name: 'Dell Latitude 5520', type: 'Laptop', serialNo: 'DL5520-2024-001', purchaseDate: '2024-03-15', warrantyExpiry: '2027-03-14', cost: 72000, status: 'in-use', assignedTo: 'Sneha Reddy', department: 'Engineering', location: 'Building A, Floor 2', vendor: 'TechWorld Solutions Pvt. Ltd.', condition: 'Good' },
  { id: 2, code: 'AST-002', name: 'HP ProDesk 400 G7', type: 'Desktop', serialNo: 'HP400-2024-001', purchaseDate: '2024-01-10', warrantyExpiry: '2027-01-09', cost: 45000, status: 'in-use', assignedTo: 'Amit Patel', department: 'Purchase', location: 'Building A, Floor 1', vendor: 'TechWorld Solutions Pvt. Ltd.', condition: 'Good' },
  { id: 3, code: 'AST-003', name: 'HP LaserJet Pro M404dn', type: 'Printer', serialNo: 'HPLJ-2023-005', purchaseDate: '2023-06-20', warrantyExpiry: '2025-06-19', cost: 28000, status: 'in-maintenance', assignedTo: null, department: 'Admin', location: 'Building A, Floor 1', vendor: 'PrintPro Technologies', condition: 'Needs Repair' },
  { id: 4, code: 'AST-004', name: 'Executive Office Desk', type: 'Furniture', serialNo: 'FRN-2024-008', purchaseDate: '2024-05-01', warrantyExpiry: '2029-04-30', cost: 35000, status: 'in-use', assignedTo: 'Rajesh Kumar', department: 'IT', location: 'Building A, Floor 3', vendor: 'Raj Furniture Works', condition: 'Good' },
  { id: 5, code: 'AST-005', name: 'Dell UltraSharp U2722D Monitor', type: 'Monitor', serialNo: 'DLU27-2024-003', purchaseDate: '2024-03-15', warrantyExpiry: '2027-03-14', cost: 32000, status: 'in-use', assignedTo: 'Sneha Reddy', department: 'Engineering', location: 'Building A, Floor 2', vendor: 'TechWorld Solutions Pvt. Ltd.', condition: 'Good' },
  { id: 6, code: 'AST-006', name: 'Lenovo ThinkPad X1 Carbon', type: 'Laptop', serialNo: 'LNV-2023-012', purchaseDate: '2023-09-01', warrantyExpiry: '2026-08-31', cost: 125000, status: 'available', assignedTo: null, department: null, location: 'IT Store Room', vendor: 'TechWorld Solutions Pvt. Ltd.', condition: 'Good' },
  { id: 7, code: 'AST-007', name: 'Conference Table (12-seater)', type: 'Furniture', serialNo: 'FRN-2023-002', purchaseDate: '2023-02-15', warrantyExpiry: '2028-02-14', cost: 85000, status: 'in-use', assignedTo: null, department: 'Admin', location: 'Building A, Conference Room 1', vendor: 'Raj Furniture Works', condition: 'Good' },
  { id: 8, code: 'AST-008', name: 'Epson L3250 Printer', type: 'Printer', serialNo: 'EPSL-2024-001', purchaseDate: '2024-07-10', warrantyExpiry: '2026-07-09', cost: 15000, status: 'retired', assignedTo: null, department: null, location: 'Warehouse', vendor: 'PrintPro Technologies', condition: 'Non-functional' },
];

export const mockDashboardStats = {
  totalItems: 12,
  lowStockItems: 4,
  pendingIndents: 2,
  pendingGRNs: 1,
  assetsIssued: 5,
  totalVendors: 6,
  totalPOs: 3,
  monthlyPurchaseValue: 197591,
};

export const mockChartData = {
  monthlyPurchases: [
    { month: 'Jul', value: 45000 },
    { month: 'Aug', value: 62000 },
    { month: 'Sep', value: 38000 },
    { month: 'Oct', value: 78000 },
    { month: 'Nov', value: 55000 },
    { month: 'Dec', value: 92000 },
    { month: 'Jan', value: 67000 },
  ],
  stockByCategory: [
    { name: 'IT Equipment', value: 101, color: '#00BFA6' },
    { name: 'Stationery', value: 255, color: '#7C4DFF' },
    { name: 'Furniture', value: 3, color: '#FFB74D' },
    { name: 'Electrical', value: 12, color: '#29B6F6' },
    { name: 'Cleaning', value: 35, color: '#66BB6A' },
    { name: 'Safety', value: 22, color: '#FF5252' },
    { name: 'Packaging', value: 6, color: '#FF80AB' },
  ],
  stockMovementTrend: [
    { month: 'Jul', stockIn: 120, stockOut: 80 },
    { month: 'Aug', stockIn: 95, stockOut: 110 },
    { month: 'Sep', stockIn: 150, stockOut: 75 },
    { month: 'Oct', stockIn: 80, stockOut: 90 },
    { month: 'Nov', stockIn: 110, stockOut: 100 },
    { month: 'Dec', stockIn: 140, stockOut: 85 },
    { month: 'Jan', stockIn: 100, stockOut: 95 },
  ],
};

export const mockRecentTransactions = [
  { id: 1, date: '2025-01-20', type: 'Issue', description: 'A4 Paper issued to Purchase Dept', reference: 'ISS-2025-002', user: 'Priya Sharma' },
  { id: 2, date: '2025-01-18', type: 'Adjustment', description: 'Stock adjustment for A4 Paper', reference: 'ADJ-2025-001', user: 'Priya Sharma' },
  { id: 3, date: '2025-01-15', type: 'Transfer', description: 'Sanitizer transferred to Branch Store', reference: 'TRF-2025-001', user: 'Vikram Singh' },
  { id: 4, date: '2025-01-14', type: 'GRN', description: 'Goods received from Green Clean Industries', reference: 'GRN-2025-001', user: 'Priya Sharma' },
  { id: 5, date: '2025-01-10', type: 'Issue', description: 'Safety supplies issued to Operations', reference: 'ISS-2025-001', user: 'Priya Sharma' },
  { id: 6, date: '2025-01-07', type: 'PO Created', description: 'PO raised for Green Clean Industries', reference: 'PO-2025-001', user: 'Amit Patel' },
  { id: 7, date: '2025-01-05', type: 'Indent', description: 'Monthly supply request from Operations', reference: 'IND-2025-001', user: 'Vikram Singh' },
  { id: 8, date: '2025-01-02', type: 'Return', description: 'Mouse returned by Engineering', reference: 'RTN-2025-001', user: 'Sneha Reddy' },
];
