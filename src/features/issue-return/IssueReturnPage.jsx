import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Button,
  Grid,
  Card,
  CardContent,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import {
  Add as AddIcon,
  KeyboardReturn as ReturnIcon,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import IssueFormDialog from "./IssueFormDialog";
import ReturnFormDialog from "./ReturnFormDialog";
import { setIssues, setReturns } from "./issueReturnSlice";
import api from "../../services/api";
import { formatDate } from "../../utils/helpers";


// ---------------------------------------------------------
// Helper: Convert objects/arrays into safe React text
// ---------------------------------------------------------
const getText = (value, fallback = "") => {
  if (value === null || value === undefined) {
    return fallback;
  }

  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => getText(item))
      .filter(Boolean)
      .join(", ");
  }

  if (typeof value === "object") {
    return (
      value.name ||
      value.code ||
      value.asset_name ||
      value.employee_name ||
      value.department_name ||
      value.title ||
      value.email ||
      value.id ||
      fallback
    );
  }

  return fallback;
};


// ---------------------------------------------------------
// Extract value from notes
// ---------------------------------------------------------
const extractFromNotes = (notes, label, fallback) => {
  if (!notes) return fallback;

  const text = String(notes);

  const regex = new RegExp(
    `${label}\\s*:\\s*([^\\n,]+)`,
    "i"
  );

  const match = text.match(regex);

  return match?.[1]?.trim() || fallback;
};


// ---------------------------------------------------------
// Main Component
// ---------------------------------------------------------
const IssueReturnPage = () => {
  const [tabValue, setTabValue] = useState(0);

  const [issueDialogOpen, setIssueDialogOpen] = useState(false);
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);

  const dispatch = useDispatch();

  const {
    issues = [],
    returns = [],
  } = useSelector((state) => state.issueReturn || {});

  const { user } = useSelector((state) => state.auth);

  const userRole = (user?.role || '').toLowerCase();
  const isAdmin = userRole === 'admin';
  const isStoreManager = userRole === 'store_manager' || userRole === 'store manager';
  const isEmployee = userRole === 'employee';
  
  // Only Admin and Store Manager get the main Issue/Return buttons
  const canIssueReturn = isAdmin || isStoreManager;

  const filteredIssues = useMemo(() => {
    if (isEmployee) {
      // Lenient filtering for employee
      return issues.filter(i => {
        const issued = (i.issuedTo || i.issued_to || i.employee || i.employee_name || i.user || '').toLowerCase();
        return issued.includes((user?.name || '').toLowerCase()) || issued.includes((user?.username || '').toLowerCase());
      });
    }
    return issues;
  }, [issues, isEmployee, user]);

  const filteredReturns = useMemo(() => {
    if (isEmployee) {
      // Lenient filtering for employee
      return returns.filter(r => {
        const returned = (r.returnedBy || r.returned_by || r.employee || '').toLowerCase();
        return returned.includes((user?.name || '').toLowerCase()) || returned.includes((user?.username || '').toLowerCase());
      });
    }
    return returns;
  }, [returns, isEmployee, user]);


  // -------------------------------------------------------
  // Handle Status Update
  // -------------------------------------------------------
  const handleStatusUpdate = async (type, id, newStatus) => {
    try {
      if (type === 'issue') {
        await api.patch(`/issues/${id}/status`, { status: newStatus });
      } else {
        await api.patch(`/returns/${id}/status`, { status: newStatus });
      }
      // Reload page for simplicity to fetch fresh data
      window.location.reload();
    } catch (error) {
      console.error("Failed to update status", error);
      alert("Failed to update status");
    }
  };

  // -------------------------------------------------------
  // Load Issues & Returns
  // -------------------------------------------------------
  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const [issuesResponse, returnsResponse] = await Promise.all([
          api.get("/issues"),
          api.get("/returns"),
        ]);

        console.log("ISSUES API RESPONSE:", issuesResponse.data);
        console.log("RETURNS API RESPONSE:", returnsResponse.data);


        // ---------------------------------------------------
        // ISSUE DATA
        // ---------------------------------------------------
        const rawIssues = Array.isArray(issuesResponse.data)
          ? issuesResponse.data
          : issuesResponse.data?.data || [];


        const issueRows = rawIssues.map((issue) => {
          const notes = getText(issue.notes, "");

          const issuedTo =
            getText(
              issue.issuedTo ||
              issue.issued_to ||
              issue.employee ||
              issue.employee_name ||
              issue.user,
              ""
            ) ||
            extractFromNotes(
              notes,
              "Issued To",
              "Unknown"
            );


          const department =
            getText(
              issue.department ||
              issue.department_name,
              ""
            ) ||
            extractFromNotes(
              notes,
              "Department",
              "General"
            );


          const assetName = getText(
            issue.asset_name ||
            issue.asset ||
            issue.asset_details ||
            issue.item,
            "Asset"
          );


          // NOTE: `code` can come back from the API as an object
          // (e.g. the asset { id, name, code }) instead of a string,
          // so it MUST be run through getText() here as well as in
          // the column's renderCell (defense in depth).
          const code = getText(
            issue.code || issue.issue_code,
            `ISS-${issue.id}`
          );


          return {
            id: issue.id,

            asset_id: getText(
              issue.asset_id ||
              issue.asset?.id ||
              issue.asset_details?.id
            ),

            code,

            date:
              issue.issue_date ||
              issue.created_at ||
              issue.date ||
              "",

            issuedTo,

            department,

            issuedBy:
              getText(
                issue.issuedBy ||
                issue.issued_by ||
                issue.created_by ||
                issue.user,
                ""
              ) || "Rajesh Kumar",

            status:
              getText(issue.status, "issued"),

            remarks: notes,

            assetName,

            items: [
              {
                itemName: assetName,
                quantity: 1,
              },
            ],
          };
        });


        // ---------------------------------------------------
        // RETURN DATA
        // ---------------------------------------------------
        const rawReturns = Array.isArray(returnsResponse.data)
          ? returnsResponse.data
          : returnsResponse.data?.data || [];


        const returnRows = rawReturns.map((ret) => {
          const notes = getText(ret.notes, "");


          const returnedBy =
            getText(
              ret.returnedBy ||
              ret.returned_by ||
              ret.employee ||
              ret.employee_name ||
              ret.user,
              ""
            ) ||
            extractFromNotes(
              notes,
              "Returned By",
              "Employee"
            );


          const department =
            getText(
              ret.department ||
              ret.department_name,
              ""
            ) ||
            extractFromNotes(
              notes,
              "Department",
              "General"
            );


          const receivedBy =
            getText(
              ret.receivedBy ||
              ret.received_by ||
              ret.received_user ||
              ret.user,
              ""
            ) || "Rajesh Kumar";


          const assetId = getText(
            ret.asset_id ||
            ret.asset?.id ||
            ret.asset_details?.id
          );


          // Same object-vs-string guard as issues.code above.
          const code = getText(
            ret.code || ret.return_code,
            `RTN-${ret.id}`
          );

          const issueRef = getText(
            ret.issue_ref || ret.issue_code,
            assetId ? `ISS-${assetId}` : "-"
          );


          return {
            id: ret.id,

            code,

            date:
              ret.return_date ||
              ret.created_at ||
              ret.date ||
              "",

            returnedBy,

            department,

            receivedBy,

            issueRef,

            remarks: notes,

            asset_id: assetId,
          };
        });


        console.log("FINAL ISSUE ROWS:", issueRows);
        console.log("FINAL RETURN ROWS:", returnRows);


        dispatch(setIssues(issueRows));
        dispatch(setReturns(returnRows));

      } catch (error) {
        console.error(
          "Failed to load transactions:",
          error
        );
      }
    };


    loadTransactions();
  }, [dispatch]);


  // -------------------------------------------------------
  // Issue Columns
  // -------------------------------------------------------
  const issueColumns = useMemo(
    () => [
      {
        field: "code",
        headerName: "Issue Ref",
        flex: 1,
        minWidth: 120,

        // FIX: value can be an object from the API in some
        // responses — never render params.value directly.
        renderCell: (params) => (
          <span>
            {getText(params.value, `ISS-${params.row.id}`)}
          </span>
        ),
      },

      {
        field: "date",
        headerName: "Date",
        flex: 1,
        minWidth: 120,

        renderCell: (params) => (
          <span>
            {params.value
              ? formatDate(params.value)
              : "-"}
          </span>
        ),
      },

      {
        field: "issuedTo",
        headerName: "Issued To",
        flex: 1.5,
        minWidth: 150,

        renderCell: (params) => (
          <span>
            {getText(params.value, "Unknown")}
          </span>
        ),
      },

      {
        field: "department",
        headerName: "Department",
        flex: 1,
        minWidth: 130,

        renderCell: (params) => (
          <span>
            {getText(params.value, "General")}
          </span>
        ),
      },

      {
        field: "itemsCount",
        headerName: "Total Items",
        flex: 1,
        minWidth: 110,

        valueGetter: (value, row) => {
          return row?.items?.length || 0;
        },
      },

      {
        field: "issuedBy",
        headerName: "Issued By",
        flex: 1,
        minWidth: 130,

        renderCell: (params) => (
          <span>
            {getText(params.value, "Unknown")}
          </span>
        ),
      },
      {
        field: "status",
        headerName: "Status",
        flex: 1,
        minWidth: 120,
        renderCell: (params) => (
          <span style={{
            color: params.value === 'Pending' ? 'orange' : params.value === 'Rejected' ? 'red' : 'green',
            fontWeight: 'bold'
          }}>
            {params.value}
          </span>
        ),
      },
      {
        field: "actions",
        headerName: "Actions",
        flex: 1.5,
        minWidth: 180,
        renderCell: (params) => {
          if (params.row.status === 'Pending' && (isAdmin || isStoreManager)) {
            return (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button size="small" variant="contained" color="success" onClick={() => handleStatusUpdate('issue', params.row.id, 'Approved')}>Approve</Button>
                <Button size="small" variant="contained" color="error" onClick={() => handleStatusUpdate('issue', params.row.id, 'Rejected')}>Reject</Button>
              </Box>
            );
          }
          return null;
        },
      }
    ],
    [isAdmin, isStoreManager]
  );


  // -------------------------------------------------------
  // Return Columns
  // -------------------------------------------------------
  const returnColumns = useMemo(
    () => [
      {
        field: "code",
        headerName: "Return Ref",
        flex: 1,
        minWidth: 120,

        // FIX: same object-vs-string guard as Issues.code
        renderCell: (params) => (
          <span>
            {getText(params.value, `RTN-${params.row.id}`)}
          </span>
        ),
      },

      {
        field: "issueRef",
        headerName: "Issue Ref",
        flex: 1,
        minWidth: 120,

        // FIX: same object-vs-string guard
        renderCell: (params) => (
          <span>
            {getText(params.value, "-")}
          </span>
        ),
      },

      {
        field: "date",
        headerName: "Date",
        flex: 1,
        minWidth: 120,

        renderCell: (params) => (
          <span>
            {params.value
              ? formatDate(params.value)
              : "-"}
          </span>
        ),
      },

      {
        field: "returnedBy",
        headerName: "Returned By",
        flex: 1.5,
        minWidth: 150,

        renderCell: (params) => (
          <span>
            {getText(params.value, "Employee")}
          </span>
        ),
      },

      {
        field: "department",
        headerName: "Department",
        flex: 1,
        minWidth: 130,

        renderCell: (params) => (
          <span>
            {getText(params.value, "General")}
          </span>
        ),
      },

      {
        field: "receivedBy",
        headerName: "Received By",
        flex: 1,
        minWidth: 130,

        renderCell: (params) => (
          <span>
            {getText(params.value, "Unknown")}
          </span>
        ),
      },
      {
        field: "status",
        headerName: "Status",
        flex: 1,
        minWidth: 120,
        renderCell: (params) => (
          <span style={{
            color: params.value === 'Pending' ? 'orange' : params.value === 'Rejected' ? 'red' : 'green',
            fontWeight: 'bold'
          }}>
            {params.value}
          </span>
        ),
      },
      {
        field: "actions",
        headerName: "Actions",
        flex: 1.5,
        minWidth: 180,
        renderCell: (params) => {
          if (params.row.status === 'Pending' && (isAdmin || isStoreManager)) {
            return (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button size="small" variant="contained" color="success" onClick={() => handleStatusUpdate('return', params.row.id, 'Approved')}>Approve</Button>
                <Button size="small" variant="contained" color="error" onClick={() => handleStatusUpdate('return', params.row.id, 'Rejected')}>Reject</Button>
              </Box>
            );
          }
          return null;
        },
      }
    ],
    [isAdmin, isStoreManager]
  );


  // -------------------------------------------------------
  // REAL Department Summary
  // -------------------------------------------------------
  const deptSummary = useMemo(() => {
    const departments = {};


    filteredIssues.forEach((issue) => {
      const department = getText(
        issue.department,
        "General"
      );


      if (!departments[department]) {
        departments[department] = {
          name: department,
          issues: 0,
          returns: 0,
        };
      }


      departments[department].issues += 1;
    });


    filteredReturns.forEach((ret) => {
      const department = getText(
        ret.department,
        "General"
      );


      if (!departments[department]) {
        departments[department] = {
          name: department,
          issues: 0,
          returns: 0,
        };
      }


      departments[department].returns += 1;
    });


    return Object.values(departments);
  }, [filteredIssues, filteredReturns]);


  // -------------------------------------------------------
  // UI
  // -------------------------------------------------------
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Box sx={{ p: 3 }}>

        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            mb: 3,
            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Issue & Return
        </Typography>


        {/* Tabs */}
        <Paper sx={{ mb: 3, borderRadius: 3, boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)' }}>
          <Tabs
            value={tabValue}
            onChange={(e, value) =>
              setTabValue(value)
            }
            sx={{
              borderBottom: 1,
              borderColor: "divider",
              '& .MuiTab-root': { fontWeight: 600, textTransform: 'none', minWidth: 120 },
            }}
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab label="Issues" />
            <Tab label="Returns" />
            <Tab label="Summary" />
          </Tabs>
        </Paper>


        {/* =================================================
            ISSUES TAB
        ================================================= */}
        {tabValue === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >

            {canIssueReturn && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  mb: 2,
                }}
              >
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() =>
                    setIssueDialogOpen(true)
                  }
                  sx={{
                    borderRadius: 2,
                    fontWeight: 600,
                    textTransform: 'none',
                    background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                    boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
                  }}
                >
                  Issue Items
                </Button>
              </Box>
            )}


            <Paper
              sx={{
                height: 600,
                width: "100%",
                borderRadius: 3,
                boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
                overflow: 'hidden'
              }}
            >
              <DataGrid
                rows={filteredIssues}
                columns={issueColumns}
                pageSizeOptions={[10, 25, 50]}
                initialState={{
                  pagination: {
                    paginationModel: {
                      pageSize: 10,
                      page: 0,
                    },
                  },
                }}
                disableRowSelectionOnClick
                sx={{
                  border: 'none',
                  '& .MuiDataGrid-columnHeaders': {
                    backgroundColor: 'background.default',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                  },
                  '& .MuiDataGrid-cell': {
                    borderBottom: '1px dashed',
                    borderColor: 'divider',
                  }
                }}
              />
            </Paper>

          </motion.div>
        )}


        {/* =================================================
            RETURNS TAB
        ================================================= */}
        {tabValue === 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >

            {canIssueReturn && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  mb: 2,
                }}
              >
                <Button
                  variant="contained"
                  color="secondary"
                  startIcon={<ReturnIcon />}
                  onClick={() =>
                    setReturnDialogOpen(true)
                  }
                  sx={{
                    borderRadius: 2,
                    fontWeight: 600,
                    textTransform: 'none',
                    background: 'linear-gradient(45deg, #f50057 30%, #ff4081 90%)',
                    boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
                  }}
                >
                  Record Return
                </Button>
              </Box>
            )}


            <Paper
              sx={{
                height: 600,
                width: "100%",
                borderRadius: 3,
                boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
                overflow: 'hidden'
              }}
            >
              <DataGrid
                rows={filteredReturns}
                columns={returnColumns}
                pageSizeOptions={[10, 25, 50]}
                initialState={{
                  pagination: {
                    paginationModel: {
                      pageSize: 10,
                      page: 0,
                    },
                  },
                }}
                disableRowSelectionOnClick
                sx={{
                  border: 'none',
                  '& .MuiDataGrid-columnHeaders': {
                    backgroundColor: 'background.default',
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                  },
                  '& .MuiDataGrid-cell': {
                    borderBottom: '1px dashed',
                    borderColor: 'divider',
                  }
                }}
              />
            </Paper>

          </motion.div>
        )}


        {/* =================================================
            SUMMARY TAB
        ================================================= */}
        {tabValue === 2 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >

            <Grid
              container
              spacing={3}
              sx={{ mb: 4 }}
            >

              {/* TOTAL ISSUES */}
              <Grid item xs={12} sm={6}>
                <Card
                  sx={{
                    bgcolor: "primary.light",
                    color: "primary.contrastText",
                  }}
                >
                  <CardContent>

                    <Typography variant="h6">
                      Total Issues
                    </Typography>

                    <Typography
                      variant="h3"
                      sx={{
                        fontWeight: "bold",
                      }}
                    >
                      {filteredIssues.length}
                    </Typography>

                  </CardContent>
                </Card>
              </Grid>


              {/* TOTAL RETURNS */}
              <Grid item xs={12} sm={6}>
                <Card
                  sx={{
                    bgcolor: "secondary.light",
                    color: "secondary.contrastText",
                  }}
                >
                  <CardContent>

                    <Typography variant="h6">
                      Total Returns
                    </Typography>

                    <Typography
                      variant="h3"
                      sx={{
                        fontWeight: "bold",
                      }}
                    >
                      {filteredReturns.length}
                    </Typography>

                  </CardContent>
                </Card>
              </Grid>

            </Grid>


            {/* CHART */}
            <Paper
              sx={{
                p: 3,
                height: 400,
              }}
            >

              <Typography
                variant="h6"
                sx={{ mb: 2 }}
              >
                Department-wise Issues & Returns
              </Typography>


              {deptSummary.length === 0 ? (

                <Box
                  sx={{
                    height: "90%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Typography color="text.secondary">
                    No issue or return data available.
                  </Typography>
                </Box>

              ) : (

                <ResponsiveContainer
                  width="100%"
                  height="90%"
                >
                  <BarChart data={deptSummary}>

                    <CartesianGrid
                      strokeDasharray="3 3"
                    />

                    <XAxis
                      dataKey="name"
                    />

                    <YAxis />

                    <Tooltip />

                    <Bar
                      dataKey="issues"
                      fill="#3f51b5"
                      name="Issues"
                    />

                    <Bar
                      dataKey="returns"
                      fill="#f50057"
                      name="Returns"
                    />

                  </BarChart>
                </ResponsiveContainer>

              )}

            </Paper>

          </motion.div>
        )}


        {/* =================================================
            DIALOGS
        ================================================= */}

        <IssueFormDialog
          open={issueDialogOpen}
          onClose={() =>
            setIssueDialogOpen(false)
          }
        />


        <ReturnFormDialog
          open={returnDialogOpen}
          onClose={() =>
            setReturnDialogOpen(false)
          }
        />

      </Box>
    </motion.div>
  );
};


export default IssueReturnPage;