import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  IconButton,
  CircularProgress,
} from '@mui/material';

import { DataGrid } from '@mui/x-data-grid';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';

import {
  formatDate,
  getStatusColor,
} from '../../utils/helpers';

import { fetchIndents } from './indentsSlice';

const IndentListPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    indents,
    loading,
  } = useSelector((state) => state.indents);

  const [filter, setFilter] = useState('All');

  useEffect(() => {
    dispatch(fetchIndents());
  }, [dispatch]);

  const statuses = [
    'All',
    'Draft',
    'Submitted',
    'Approved',
    'Rejected',
  ];

  const getCount = (status) => {
    if (status === 'All') {
      return indents.length;
    }

    return indents.filter(
      (item) => item.status === status
    ).length;
  };

  const filteredIndents =
    filter === 'All'
      ? indents
      : indents.filter(
          (item) => item.status === filter
        );

  const columns = [
    {
      field: 'indentCode',
      headerName: 'Indent Code',
      flex: 1,
    },

    {
      field: 'requestedBy',
      headerName: 'Requested By',
      flex: 1,
    },

    {
      field: 'department',
      headerName: 'Department',
      flex: 1,
    },

    {
      field: 'date',
      headerName: 'Date',
      flex: 1,

      valueGetter: (value, row) => {
        return row?.date
          ? formatDate(row.date)
          : '';
      },
    },

    {
      field: 'items',
      headerName: 'Items Count',
      flex: 1,

      valueGetter: (value, row) => {
        return Array.isArray(row?.items)
          ? row.items.length
          : 0;
      },
    },

    {
      field: 'status',
      headerName: 'Status',
      flex: 1,

      renderCell: (params) => (
        <Chip
          label={params.value || ''}
          color={getStatusColor(params.value)}
          size="small"
        />
      ),
    },

    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      sortable: false,
      filterable: false,

      renderCell: (params) => (
        <Box>
          <IconButton
            onClick={() =>
              navigate(`/indents/${params.row.id}`)
            }
            size="small"
            color="primary"
          >
            <VisibilityIcon />
          </IconButton>

          {params.row.status === 'Draft' && (
            <IconButton
              onClick={() =>
                navigate(
                  `/indents/${params.row.id}/edit`
                )
              }
              size="small"
              color="secondary"
            >
              <EditIcon />
            </IconButton>
          )}
        </Box>
      ),
    },
  ];

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      sx={{ p: 3 }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography
          variant="h4"
          sx={{ fontWeight: 'bold' }}
        >
          Purchase Indents ({indents.length})
        </Typography>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() =>
            navigate('/indents/new')
          }
          sx={{ borderRadius: 2 }}
        >
          Create Indent
        </Button>
      </Box>

      {/* Status Filters */}
      <Box
        sx={{
          display: 'flex',
          gap: 1,
          mb: 3,
          flexWrap: 'wrap',
        }}
      >
        {statuses.map((status) => (
          <Chip
            key={status}
            label={`${status} (${getCount(status)})`}
            clickable
            color={
              filter === status
                ? 'primary'
                : 'default'
            }
            onClick={() => setFilter(status)}
            variant={
              filter === status
                ? 'filled'
                : 'outlined'
            }
          />
        ))}
      </Box>

      {/* Data Grid */}
      <Box
        sx={{
          height: 600,
          width: '100%',
          background:
            'rgba(255, 255, 255, 0.05)',
          backdropFilter: 'blur(10px)',
          borderRadius: 2,
          p: 1,
        }}
      >
        <DataGrid
          rows={filteredIndents}
          columns={columns}
          pageSizeOptions={[10, 25, 50]}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 10,
              },
            },
          }}
          disableRowSelectionOnClick
          sx={{
            border: 'none',

            '& .MuiDataGrid-cell': {
              borderBottom:
                '1px solid rgba(255,255,255,0.1)',
            },

            '& .MuiDataGrid-columnHeaders': {
              borderBottom:
                '1px solid rgba(255,255,255,0.2)',
            },
          }}
        />
      </Box>
    </Box>
  );
};

export default IndentListPage;