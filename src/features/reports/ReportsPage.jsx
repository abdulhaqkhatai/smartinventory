import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
} from '@mui/material';
import {
  ShoppingCart,
  Inventory2,
  People,
  LocalShipping,
  SwapHoriz,
  Devices,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const reportsList = [
  {
    type: 'purchase',
    title: 'Purchase Report',
    description: 'Detailed logs of purchase orders, vendor breakdowns, GST totals, and order statuses',
    icon: <ShoppingCart sx={{ fontSize: 36, color: '#00BFA6' }} />,
    color: '#00BFA6',
  },
  {
    type: 'stock',
    title: 'Stock & Inventory Report',
    description: 'Current stock levels, unit valuation, reorder status, and stock category distribution',
    icon: <Inventory2 sx={{ fontSize: 36, color: '#7C4DFF' }} />,
    color: '#7C4DFF',
  },
  {
    type: 'vendor',
    title: 'Vendor Analysis Report',
    description: 'Vendor master records, GST/PAN compliance, total order history, and ratings',
    icon: <People sx={{ fontSize: 36, color: '#FFB74D' }} />,
    color: '#FFB74D',
  },
  {
    type: 'grn',
    title: 'Goods Receipt (GRN) Report',
    description: 'Received quantities, damages log, acceptance status, and warehouse receiving details',
    icon: <LocalShipping sx={{ fontSize: 36, color: '#29B6F6' }} />,
    color: '#29B6F6',
  },
  {
    type: 'issue-return',
    title: 'Issue & Return Report',
    description: 'Departmental item consumption, employee issue logs, and returned stock condition summary',
    icon: <SwapHoriz sx={{ fontSize: 36, color: '#66BB6A' }} />,
    color: '#66BB6A',
  },
  {
    type: 'asset',
    title: 'Asset Inventory Report',
    description: 'Corporate hardware/furniture inventory, serial tags, warranty expirations, and assignments',
    icon: <Devices sx={{ fontSize: 36, color: '#FF80AB' }} />,
    color: '#FF80AB',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const ReportsPage = () => {
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);
  
  const userRole = (user?.role || '').toLowerCase().trim();
  
  const filteredReports = reportsList.filter(report => {
    if (userRole === 'admin') return true;
    if (userRole === 'store_manager' || userRole === 'store manager') return true; 
    if (userRole === 'purchase_manager' || userRole === 'purchase manager') return true; 
    
    // For employee or any unrecognized role, show limited reports just in case
    return ['asset', 'issue-return'].includes(report.type);
  });

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700}>
          Reports & Analytics Hub
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Generate comprehensive business intelligence reports and export directly to Excel (.xlsx) or PDF
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {filteredReports.map((report) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={report.type}>
            <motion.div variants={itemVariants}>
              <Card
                onClick={() => navigate(`/reports/${report.type}`)}
                sx={{
                  cursor: 'pointer',
                  height: '100%',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-6px)',
                    borderColor: report.color,
                    boxShadow: `0 12px 24px ${report.color}25`,
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: 3,
                      backgroundColor: `${report.color}15`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 2,
                    }}
                  >
                    {report.icon}
                  </Box>
                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    {report.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {report.description}
                  </Typography>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>
    </motion.div>
  );
};

export default ReportsPage;
