import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Stack,
  Chip,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { ArrowBack, Download, PictureAsPdf, TableChart } from '@mui/icons-material';
import { motion } from 'framer-motion';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import {
  mockPurchaseOrders,
  mockItems,
  mockVendors,
  mockGRNs,
  mockIssueTransactions,
  mockReturnTransactions,
  mockAssets,
} from '../../services/mockData';
import { formatCurrency, formatDate } from '../../utils/helpers';

const ReportViewPage = () => {
  const { reportType } = useParams();
  const navigate = useNavigate();

  const [startDate, setStartDate] = useState('2024-01-01');
  const [endDate, setEndDate] = useState('2025-12-31');

  // Determine report data and columns based on route parameter
  let reportTitle = '';
  let columns = [];
  let rows = [];

  switch (reportType) {
    case 'purchase':
      reportTitle = 'Purchase Order Summary Report';
      columns = [
        { field: 'code', headerName: 'PO Code', width: 130 },
        { field: 'vendorName', headerName: 'Vendor Name', flex: 1, minWidth: 200 },
        { field: 'indentRef', headerName: 'Indent Ref', width: 140 },
        { field: 'date', headerName: 'PO Date', width: 120, valueFormatter: (v) => formatDate(v) },
        { field: 'totalAmount', headerName: 'Total Amount (INR)', width: 160, valueFormatter: (v) => formatCurrency(v) },
        { field: 'status', headerName: 'Status', width: 120 },
      ];
      rows = mockPurchaseOrders;
      break;

    case 'stock':
      reportTitle = 'Stock & Inventory Valuation Report';
      columns = [
        { field: 'code', headerName: 'Item Code', width: 120 },
        { field: 'name', headerName: 'Item Name', flex: 1, minWidth: 200 },
        { field: 'category', headerName: 'Category', width: 140 },
        { field: 'unit', headerName: 'Unit', width: 90 },
        { field: 'currentStock', headerName: 'Current Stock', width: 130 },
        { field: 'unitPrice', headerName: 'Unit Price', width: 120, valueFormatter: (v) => formatCurrency(v) },
        {
          field: 'stockValue',
          headerName: 'Stock Value',
          width: 150,
          valueGetter: (v, row) => row.currentStock * row.unitPrice,
          renderCell: (params) => formatCurrency(params.row.currentStock * params.row.unitPrice),
        },
      ];
      rows = mockItems;
      break;

    case 'vendor':
      reportTitle = 'Vendor Master & Order Performance Report';
      columns = [
        { field: 'code', headerName: 'Vendor Code', width: 120 },
        { field: 'name', headerName: 'Vendor Name', flex: 1, minWidth: 220 },
        { field: 'contactPerson', headerName: 'Contact Person', width: 160 },
        { field: 'phone', headerName: 'Phone', width: 130 },
        { field: 'gst', headerName: 'GSTIN', width: 160 },
        { field: 'status', headerName: 'Status', width: 110 },
        { field: 'totalOrders', headerName: 'Total Orders', width: 120 },
      ];
      rows = mockVendors;
      break;

    case 'grn':
      reportTitle = 'Goods Receipt Note (GRN) Log Report';
      columns = [
        { field: 'code', headerName: 'GRN Code', width: 140 },
        { field: 'poRef', headerName: 'PO Ref', width: 140 },
        { field: 'vendorName', headerName: 'Vendor Name', flex: 1, minWidth: 200 },
        { field: 'date', headerName: 'Receipt Date', width: 130, valueFormatter: (v) => formatDate(v) },
        { field: 'receivedBy', headerName: 'Received By', width: 150 },
        { field: 'status', headerName: 'Status', width: 120 },
      ];
      rows = mockGRNs;
      break;

    case 'issue-return':
      reportTitle = 'Issue & Return Transaction Report';
      columns = [
        { field: 'code', headerName: 'Transaction Code', width: 150 },
        { field: 'type', headerName: 'Type', width: 110, valueGetter: (v, row) => (row.code.startsWith('ISS') ? 'Issue' : 'Return') },
        { field: 'date', headerName: 'Date', width: 130, valueFormatter: (v) => formatDate(v) },
        { field: 'person', headerName: 'Employee', width: 160, valueGetter: (v, row) => row.issuedTo || row.returnedBy },
        { field: 'department', headerName: 'Department', width: 140 },
      ];
      rows = [...mockIssueTransactions, ...mockReturnTransactions];
      break;

    case 'asset':
      reportTitle = 'Corporate Asset Inventory Report';
      columns = [
        { field: 'code', headerName: 'Asset Code', width: 120 },
        { field: 'name', headerName: 'Asset Name', flex: 1, minWidth: 200 },
        { field: 'type', headerName: 'Type', width: 120 },
        { field: 'serialNo', headerName: 'Serial Tag', width: 150 },
        { field: 'status', headerName: 'Status', width: 130 },
        { field: 'assignedTo', headerName: 'Assigned To', width: 150, valueFormatter: (v) => v || 'Unassigned' },
        { field: 'cost', headerName: 'Cost', width: 130, valueFormatter: (v) => formatCurrency(v) },
      ];
      rows = mockAssets;
      break;

    default:
      reportTitle = 'System Report';
  }

  // Export to Excel
  const handleExportExcel = () => {
    const exportData = rows.map((r) => {
      const cleanObj = {};
      columns.forEach((col) => {
        cleanObj[col.headerName] = r[col.field] !== undefined ? r[col.field] : '';
      });
      return cleanObj;
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
    XLSX.writeFile(workbook, `${reportType}_report_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Export to PDF
  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text(reportTitle, 14, 20);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()} | Smart Inventory System`, 14, 27);

    const pdfHeaders = columns.map((col) => col.headerName);
    const pdfRows = rows.map((r) =>
      columns.map((col) => {
        const val = r[col.field];
        if (val === undefined || val === null) return '';
        if (typeof val === 'object') return JSON.stringify(val);
        return String(val);
      })
    );

    doc.autoTable({
      head: [pdfHeaders],
      body: pdfRows,
      startY: 32,
      theme: 'grid',
      headStyles: { fillColor: [0, 191, 166] },
      styles: { fontSize: 8 },
    });

    doc.save(`${reportType}_report.pdf`);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
      <Button startIcon={<ArrowBack />} onClick={() => navigate('/reports')} sx={{ mb: 2 }}>
        Back to Reports
      </Button>

      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={700}>
            {reportTitle}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Filter criteria and export options
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.5}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<TableChart />}
            onClick={handleExportExcel}
          >
            Export to Excel
          </Button>
          <Button
            variant="contained"
            color="secondary"
            startIcon={<PictureAsPdf />}
            onClick={handleExportPDF}
          >
            Export to PDF
          </Button>
        </Stack>
      </Box>

      {/* Date Filter Card */}
      <Card sx={{ mb: 3, p: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
          <TextField
            type="date"
            label="Start Date"
            size="small"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            type="date"
            label="End Date"
            size="small"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <Chip label={`${rows.length} Records Found`} color="primary" variant="outlined" />
        </Stack>
      </Card>

      {/* Report DataGrid */}
      <Card sx={{ height: 540 }}>
        <DataGrid
          rows={rows}
          columns={columns}
          pageSizeOptions={[10, 25, 50]}
          initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
          disableRowSelectionOnClick
        />
      </Card>
    </motion.div>
  );
};

export default ReportViewPage;
