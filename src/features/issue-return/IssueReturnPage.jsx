import React, { useState } from 'react';
import { Box, Typography, Tabs, Tab, Paper, Button, Grid, Card, CardContent } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Add as AddIcon, KeyboardReturn as ReturnIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import IssueFormDialog from './IssueFormDialog';
import ReturnFormDialog from './ReturnFormDialog';
import { formatDate } from '../../utils/helpers';

const IssueReturnPage = () => {
  const [tabValue, setTabValue] = useState(0);
  const { issues, returns } = useSelector(state => state.issueReturn);
  
  const [issueDialogOpen, setIssueDialogOpen] = useState(false);
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);

  const issueColumns = [
    { field: 'code', headerName: 'Issue Ref', flex: 1 },
    { field: 'date', headerName: 'Date', flex: 1, valueFormatter: (params) => formatDate(params.value) },
    { field: 'issuedTo', headerName: 'Issued To', flex: 1.5 },
    { field: 'department', headerName: 'Department', flex: 1 },
    { 
      field: 'itemsCount', 
      headerName: 'Total Items', 
      flex: 1,
      valueGetter: (params, row) => row.items?.length || 0 
    },
    { field: 'issuedBy', headerName: 'Issued By', flex: 1 },
  ];

  const returnColumns = [
    { field: 'code', headerName: 'Return Ref', flex: 1 },
    { field: 'issueRef', headerName: 'Issue Ref', flex: 1 },
    { field: 'date', headerName: 'Date', flex: 1, valueFormatter: (params) => formatDate(params.value) },
    { field: 'returnedBy', headerName: 'Returned By', flex: 1.5 },
    { field: 'department', headerName: 'Department', flex: 1 },
    { field: 'receivedBy', headerName: 'Received By', flex: 1 },
  ];

  // Mock aggregate data for chart
  const deptSummary = [
    { name: 'Engineering', issues: 15, returns: 2 },
    { name: 'Operations', issues: 8, returns: 1 },
    { name: 'Purchase', issues: 4, returns: 0 },
    { name: 'IT', issues: 12, returns: 3 },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3 }}>Issue & Return</Typography>
        
        <Paper sx={{ mb: 3 }}>
          <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tab label="Issues" />
            <Tab label="Returns" />
            <Tab label="Summary" />
          </Tabs>
        </Paper>

        {tabValue === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
              <Button variant="contained" startIcon={<AddIcon />} onClick={() => setIssueDialogOpen(true)}>
                Issue Items
              </Button>
            </Box>
            <Paper sx={{ height: 600, width: '100%' }}>
              <DataGrid rows={issues} columns={issueColumns} />
            </Paper>
          </motion.div>
        )}

        {tabValue === 1 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
              <Button variant="contained" color="secondary" startIcon={<ReturnIcon />} onClick={() => setReturnDialogOpen(true)}>
                Record Return
              </Button>
            </Box>
            <Paper sx={{ height: 600, width: '100%' }}>
              <DataGrid rows={returns} columns={returnColumns} />
            </Paper>
          </motion.div>
        )}

        {tabValue === 2 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6}>
                <Card sx={{ bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                  <CardContent>
                    <Typography variant="h6">Total Issues (YTD)</Typography>
                    <Typography variant="h3" sx={{ fontWeight: 'bold' }}>{issues.length}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Card sx={{ bgcolor: 'secondary.light', color: 'secondary.contrastText' }}>
                  <CardContent>
                    <Typography variant="h6">Total Returns (YTD)</Typography>
                    <Typography variant="h3" sx={{ fontWeight: 'bold' }}>{returns.length}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Paper sx={{ p: 3, height: 400 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Department-wise Issues & Returns</Typography>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deptSummary}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="issues" fill="#3f51b5" name="Issues" />
                  <Bar dataKey="returns" fill="#f50057" name="Returns" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </motion.div>
        )}

        <IssueFormDialog open={issueDialogOpen} onClose={() => setIssueDialogOpen(false)} />
        <ReturnFormDialog open={returnDialogOpen} onClose={() => setReturnDialogOpen(false)} />
      </Box>
    </motion.div>
  );
};

export default IssueReturnPage;
