// Utility functions for the application

import dayjs from 'dayjs';

// Date formatting
export const formatDate = (date) => dayjs(date).format('DD MMM YYYY');
export const formatDateTime = (date) => dayjs(date).format('DD MMM YYYY, hh:mm A');
export const formatDateShort = (date) => dayjs(date).format('DD/MM/YY');

// Currency formatting (INR)
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(amount);
};

export const formatNumber = (num) => {
  return new Intl.NumberFormat('en-IN').format(num);
};

// Status colors
export const getStatusColor = (status) => {
  const statusMap = {
    draft: 'default',
    submitted: 'info',
    approved: 'success',
    rejected: 'error',
    pending: 'warning',
    active: 'success',
    inactive: 'default',
    blacklisted: 'error',
    completed: 'success',
    cancelled: 'error',
    partial: 'warning',
    issued: 'info',
    returned: 'success',
    damaged: 'error',
    'in-use': 'info',
    'in-maintenance': 'warning',
    available: 'success',
    retired: 'default',
  };
  return statusMap[status?.toLowerCase()] || 'default';
};

// Generate unique ID
export const generateId = (prefix = 'ID') => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

// GST calculation
export const calculateGST = (amount, gstRate) => {
  const gstAmount = (amount * gstRate) / 100;
  return {
    cgst: gstAmount / 2,
    sgst: gstAmount / 2,
    igst: gstAmount,
    totalWithGST: amount + gstAmount,
  };
};

// Truncate text
export const truncateText = (text, maxLength = 50) => {
  if (!text) return '';
  return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
};

// Debounce function
export const debounce = (func, delay = 300) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => func(...args), delay);
  };
};

// Validate GST number
export const isValidGST = (gst) => {
  const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return gstRegex.test(gst);
};

// Validate PAN
export const isValidPAN = (pan) => {
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  return panRegex.test(pan);
};

// Get initials from name
export const getInitials = (name) => {
  if (!name) return '';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};
