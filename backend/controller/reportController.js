import * as reportService from '../services/reportService.js';

export const getDashboardReportController = async (req, res) => {
  try {
    const report = await reportService.getDashboardReport();
    res.status(200).json(report);
  } catch (error) {
    console.error('Error fetching dashboard report:', error);
    res.status(500).json({ message: 'Error fetching dashboard report', error: error.message });
  }
};

export const getAssetStatusReportController = async (req, res) => {
  try {
    // TODO: Implement asset status report (outside current scope)
    res.status(200).json({ message: 'Asset status report - not implemented' });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching asset status report', error: error.message });
  }
};

export const getIssueReportController = async (req, res) => {
  try {
    // TODO: Implement issue report (outside current scope)
    res.status(200).json({ message: 'Issue report - not implemented' });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching issue report', error: error.message });
  }
};

export const getReturnReportController = async (req, res) => {
  try {
    // TODO: Implement return report (outside current scope)
    res.status(200).json({ message: 'Return report - not implemented' });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching return report', error: error.message });
  }
};

export const getDamagedAssetReportController = async (req, res) => {
  try {
    // TODO: Implement damaged asset report (outside current scope)
    res.status(200).json({ message: 'Damaged asset report - not implemented' });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching damaged asset report', error: error.message });
  }
};
