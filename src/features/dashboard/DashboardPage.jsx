import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Inventory2,
  Warning,
  Description,
  LocalShipping,
  Devices,
  People,
  ShoppingCart,
  TrendingUp,
  ArrowForward,
  Add,
} from '@mui/icons-material';
import { alpha } from '@mui/material/styles';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
  Area,
  AreaChart,
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import {
  mockChartData,
  mockRecentTransactions,
  mockDashboardStats,
} from '../../services/mockData';
import { formatCurrency, formatDate, getStatusColor } from '../../utils/helpers';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

// Animated counter component
const AnimatedCounter = ({ value, prefix = '', suffix = '' }) => {
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    const duration = 1200;
    const start = 0;
    const end = value;
    const startTime = Date.now();

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(start + (end - start) * easeOut));

      if (progress >= 1) clearInterval(timer);
    }, 16);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <span>
      {prefix}
      {count.toLocaleString('en-IN')}
      {suffix}
    </span>
  );
};

const quickActions = [
  { label: 'New Indent', icon: <Add />, path: '/indents/new', color: '#00BFA6' },
  { label: 'Create PO', icon: <ShoppingCart />, path: '/purchase-orders/new', color: '#7C4DFF' },
  { label: 'Record GRN', icon: <LocalShipping />, path: '/grn/new', color: '#29B6F6' },
  { label: 'Issue Items', icon: <TrendingUp />, path: '/issue-return', color: '#FFB74D' },
];

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [dashboardStats, setDashboardStats] = useState({
    totalItems: 0,
    lowStockItems: 0,
    pendingIndents: 0,
    pendingGRNs: 0,
    assetsIssued: 0,
    totalVendors: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await api.get('/reports/dashboard');
        const stats = response?.data || response;
        if (stats) {
          setDashboardStats(prev => ({
            ...prev,
            totalItems: Number(stats.totalItems ?? prev.totalItems),
            lowStockItems: Number(stats.lowStockItems ?? prev.lowStockItems),
            pendingIndents: Number(stats.pendingIndents ?? prev.pendingIndents),
            pendingGRNs: Number(stats.pendingGRNs ?? prev.pendingGRNs),
            assetsIssued: Number(stats.assetsIssued ?? prev.assetsIssued),
            totalVendors: Number(stats.totalVendors ?? prev.totalVendors),
            monthlyPurchaseValue: stats.monthlyPurchaseValue ?? prev.monthlyPurchaseValue,
          }));
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Keep the default values if API fails
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const kpiData = [
    { title: 'Total Items', value: dashboardStats.totalItems, icon: <Inventory2 />, color: '#00BFA6', gradient: 'linear-gradient(135deg, #00BFA6 0%, #00897B 100%)' },
    { title: 'Low Stock', value: dashboardStats.lowStockItems, icon: <Warning />, color: '#FFB74D', gradient: 'linear-gradient(135deg, #FFB74D 0%, #F57C00 100%)' },
    { title: 'Pending Indents', value: dashboardStats.pendingIndents, icon: <Description />, color: '#29B6F6', gradient: 'linear-gradient(135deg, #29B6F6 0%, #0288D1 100%)' },
    { title: 'Pending GRNs', value: dashboardStats.pendingGRNs, icon: <LocalShipping />, color: '#7C4DFF', gradient: 'linear-gradient(135deg, #7C4DFF 0%, #651FFF 100%)' },
    { title: 'Assets Issued', value: dashboardStats.assetsIssued, icon: <Devices />, color: '#66BB6A', gradient: 'linear-gradient(135deg, #66BB6A 0%, #43A047 100%)' },
    { title: 'Active Vendors', value: dashboardStats.totalVendors, icon: <People />, color: '#FF80AB', gradient: 'linear-gradient(135deg, #FF80AB 0%, #F50057 100%)' },
  ];

  const getTransactionTypeColor = (type) => {
    const map = {
      'Issue': 'warning',
      'Return': 'success',
      'GRN': 'info',
      'Transfer': 'secondary',
      'Adjustment': 'default',
      'PO Created': 'primary',
      'Indent': 'info',
    };
    return map[type] || 'default';
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Welcome */}
      <motion.div variants={itemVariants}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h3" fontWeight={700}>
            Welcome back, {user?.name?.split(' ')[0]} 👋
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
            Here&apos;s what&apos;s happening with your inventory today.
          </Typography>
        </Box>
      </motion.div>

      {/* KPI Cards */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {kpiData.map((kpi, index) => (
          <Grid size={{ xs: 6, sm: 4, md: 2 }} key={kpi.title}>
            <motion.div variants={itemVariants}>
              <Card
                sx={{
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    '& .kpi-icon': {
                      transform: 'scale(1.1) rotate(5deg)',
                    },
                  },
                  transition: 'transform 0.3s ease',
                }}
              >
                <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                  <Box
                    className="kpi-icon"
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: 2,
                      background: kpi.gradient,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 1.5,
                      transition: 'transform 0.3s ease',
                      boxShadow: `0 4px 14px ${alpha(kpi.color, 0.4)}`,
                    }}
                  >
                    {React.cloneElement(kpi.icon, { sx: { fontSize: 22, color: '#fff' } })}
                  </Box>
                  <Typography
                    variant="h4"
                    fontWeight={700}
                    sx={{ color: kpi.color, mb: 0.25 }}
                  >
                    <AnimatedCounter value={kpi.value} />
                  </Typography>
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>
                    {kpi.title}
                  </Typography>
                </CardContent>
                {/* Subtle gradient overlay */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    width: '50%',
                    height: '100%',
                    background: `radial-gradient(circle at top right, ${alpha(kpi.color, 0.06)} 0%, transparent 70%)`,
                    pointerEvents: 'none',
                  }}
                />
              </Card>
            </motion.div>
          </Grid>
        ))}
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {/* Monthly Purchases Bar Chart */}
        <Grid size={{ xs: 12, md: 5 }}>
          <motion.div variants={itemVariants}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Monthly Purchase Trends
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" mb={2}>
                  Last 7 months purchase value
                </Typography>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={mockChartData.monthlyPurchases}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94A3B8" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#94A3B8" tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: '#132F4C',
                        border: '1px solid rgba(93, 242, 214, 0.1)',
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                      formatter={(value) => [`₹${value.toLocaleString('en-IN')}`, 'Value']}
                    />
                    <Bar dataKey="value" fill="#00BFA6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Stock by Category Donut */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <motion.div variants={itemVariants}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Stock by Category
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                  Current distribution
                </Typography>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={mockChartData.stockByCategory}
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {mockChartData.stockByCategory.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: '#132F4C',
                        border: '1px solid rgba(93, 242, 214, 0.1)',
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                  {mockChartData.stockByCategory.slice(0, 4).map((item) => (
                    <Chip
                      key={item.name}
                      label={`${item.name}: ${item.value}`}
                      size="small"
                      sx={{
                        fontSize: '0.65rem',
                        height: 22,
                        backgroundColor: alpha(item.color, 0.1),
                        color: item.color,
                        borderColor: alpha(item.color, 0.3),
                        border: '1px solid',
                      }}
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Stock Movement Trend */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <motion.div variants={itemVariants}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Stock Movement
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" mb={2}>
                  In vs Out trend
                </Typography>
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={mockChartData.stockMovementTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94A3B8" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#94A3B8" />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: '#132F4C',
                        border: '1px solid rgba(93, 242, 214, 0.1)',
                        borderRadius: 8,
                        fontSize: 12,
                      }}
                    />
                    <Area type="monotone" dataKey="stockIn" stroke="#00BFA6" fill={alpha('#00BFA6', 0.15)} strokeWidth={2} name="Stock In" />
                    <Area type="monotone" dataKey="stockOut" stroke="#FF5252" fill={alpha('#FF5252', 0.1)} strokeWidth={2} name="Stock Out" />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* Bottom Row: Recent Transactions + Quick Actions */}
      <Grid container spacing={2.5}>
        {/* Recent Transactions */}
        <Grid size={{ xs: 12, md: 8 }}>
          <motion.div variants={itemVariants}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" fontWeight={600}>
                    Recent Transactions
                  </Typography>
                  <Button size="small" endIcon={<ArrowForward />} sx={{ fontSize: '0.8rem' }}>
                    View All
                  </Button>
                </Box>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, fontSize: '0.78rem' }}>Date</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: '0.78rem' }}>Type</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: '0.78rem' }}>Description</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: '0.78rem' }}>Reference</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: '0.78rem' }}>User</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {mockRecentTransactions.map((txn) => (
                        <TableRow
                          key={txn.id}
                          hover
                          sx={{
                            '&:last-child td': { borderBottom: 0 },
                            cursor: 'pointer',
                          }}
                        >
                          <TableCell sx={{ fontSize: '0.8rem' }}>
                            {formatDate(txn.date)}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={txn.type}
                              size="small"
                              color={getTransactionTypeColor(txn.type)}
                              sx={{ fontSize: '0.7rem', height: 22 }}
                            />
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.8rem', maxWidth: 250 }}>
                            {txn.description}
                          </TableCell>
                          <TableCell>
                            <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'primary.main' }}>
                              {txn.reference}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ fontSize: '0.8rem' }}>{txn.user}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>

        {/* Quick Actions */}
        <Grid size={{ xs: 12, md: 4 }}>
          <motion.div variants={itemVariants}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" fontWeight={600} gutterBottom>
                  Quick Actions
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" mb={2}>
                  Frequently used operations
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {quickActions.map((action) => (
                    <Button
                      key={action.label}
                      variant="outlined"
                      startIcon={action.icon}
                      onClick={() => navigate(action.path)}
                      fullWidth
                      sx={{
                        justifyContent: 'flex-start',
                        py: 1.5,
                        px: 2,
                        borderColor: alpha(action.color, 0.3),
                        color: action.color,
                        '&:hover': {
                          borderColor: action.color,
                          backgroundColor: alpha(action.color, 0.08),
                        },
                      }}
                    >
                      {action.label}
                    </Button>
                  ))}
                </Box>

                {/* Monthly Value Card */}
                <Box
                  sx={{
                    mt: 3,
                    p: 2,
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, rgba(0, 191, 166, 0.1) 0%, rgba(124, 77, 255, 0.1) 100%)',
                    border: (theme) => `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
                  }}
                >
                  <Typography variant="caption" color="text.secondary" fontWeight={500}>
                    Monthly Purchase Value
                  </Typography>
                  <Typography variant="h5" fontWeight={700} color="primary.main" sx={{ mt: 0.5 }}>
                    {formatCurrency(dashboardStats.monthlyPurchaseValue ?? mockDashboardStats?.monthlyPurchaseValue ?? 0)}
                  </Typography>
                  <Chip
                    label="+12.5% vs last month"
                    size="small"
                    sx={{
                      mt: 1,
                      fontSize: '0.65rem',
                      height: 22,
                      backgroundColor: alpha('#66BB6A', 0.1),
                      color: '#66BB6A',
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>
    </motion.div>
  );
};

export default DashboardPage;
