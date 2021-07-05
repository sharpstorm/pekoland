import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
// eslint-disable-next-line import/no-unresolved
import { useIdentityContext } from 'react-netlify-identity-auth';
import { ArrowLeft } from '../components/icons';
import { Button, TextAreaInput, Select } from '../components/forms/form-components';

import './admin.css';

const REPORT_TYPES = ['', 'Report User', 'Report Bug', 'Report Problem', 'Help Request'];
const REPORT_STATUS = ['Open', 'Acknowledged', 'Resolved', 'Closed Without Resolution'];

const ReportListStore = () => {
  const [reports, setReports] = useState(undefined);
  const [lastUpdate, setLastUpdate] = useState(-1);

  const getReports = () => reports;

  const refreshReports = (fetchAgent) => fetchAgent('/functions/report-list', {
    method: 'POST',
    body: '{}',
  })
    .then((resp) => {
      if (resp.status > 399) {
        throw new Error('Failed to Contact Server');
      }
      return resp.json();
    })
    .then((x) => {
      if (x.reports === undefined) {
        throw new Error('Failed to contact server');
      } else {
        setReports(x.reports);
        setLastUpdate(Date.now());
      }
    });

  const getDetailedReport = (fetchAgent, reportId) => fetchAgent('/functions/report-get', {
    method: 'POST',
    body: JSON.stringify({ report_id: reportId }),
  })
    .then((resp) => {
      if (resp.status > 399) {
        throw new Error('Failed to Contact Server');
      }
      return resp.json();
    })
    .then((x) => {
      if (x.report === undefined) {
        throw new Error('Failed to contact server');
      } else {
        setLastUpdate(Date.now());
        return x.report;
      }
    });

  const deleteReport = (fetchAgent, reportId) => fetchAgent('/functions/report-list', {
    method: 'POST',
    body: JSON.stringify({ report_id: reportId }),
  })
    .then((resp) => {
      if (resp.status > 399) {
        throw new Error('Failed to Contact Server');
      }
      return resp.json();
    })
    .then(() => {
      setReports(reports.filter((x) => x.id !== reportId));
      setLastUpdate(Date.now());
    });

  const updateReport = (fetchAgent, reportId, status, action) => fetchAgent('/functions/report-list', {
    method: 'POST',
    body: JSON.stringify({ report_id: reportId, status, action }),
  })
    .then((resp) => {
      if (resp.status > 399) {
        throw new Error('Failed to Contact Server');
      }
      return resp.json();
    })
    .then(() => {
      const updated = reports.map((x) => {
        if (x.id !== reportId) {
          return x;
        }
        const newReport = x;
        newReport.status = status;
        newReport.action = action;
        return newReport;
      });
      setReports(updated);
      setLastUpdate(Date.now());
    });

  return {
    lastUpdate,
    refreshReports,
    getReports,
    getDetailedReport,
    deleteReport,
    updateReport,
  };
};

export default function AdminReportsView() {
  const reportListStore = ReportListStore();
  const identity = useIdentityContext();
  const history = useHistory();
  const [currentReport, setCurrentReport] = useState(undefined);

  useEffect(() => {
    if (identity.ready && !identity.user) {
      window.location = '/';
    } else if (identity.ready) {
      reportListStore.refreshReports(identity.authorizedFetch);
    }
  }, [identity.ready]);

  const ReportListView = () => {
    const reportListElement = (reportListStore.getReports() === undefined)
      ? (<h2>Loading Reports</h2>)
      : (
        <ul id="admin-user-list">
          <li key="header">
            <div style={{ fontSize: '1.2em', fontWeight: '600', letterSpacing: '1px' }}>Report ID</div>
            <div style={{ fontSize: '1.2em', fontWeight: '600', letterSpacing: '1px' }}>Submitted At</div>
            <div style={{ fontSize: '1.2em', fontWeight: '600', letterSpacing: '1px' }}>Report Type</div>
            <div style={{ fontSize: '1.2em', fontWeight: '600', letterSpacing: '1px' }}>Summary</div>
            <div />
          </li>
          {reportListStore.getReports().map((report) => (
            <li key={report.id}>
              <div>{report.id}</div>
              <div>
                {
                new Date(report.timestamp).toLocaleString('en-US', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: 'numeric',
                  minute: 'numeric',
                })
                }
              </div>
              <div>{(report.type > 0 && report.type < 5) ? REPORT_TYPES[report.type] : ''}</div>
              <div>{(report.description.length > 37) ? `${report.description.substring(0, 40)}...` : report.description}</div>
              <div style={{ display: 'flex' }}>
                <Button
                  className="btn-accent"
                  onClick={() => { setCurrentReport(report.id); }}
                >
                  Details
                </Button>
              </div>
            </li>
          ))}
        </ul>
      );
    return (
      <>
        <h1>Manage Reports</h1>
        {reportListElement}
      </>
    );
  };

  const [reportDetail, setReportDetail] = useState(undefined);
  const [actionState, setActionState] = useState(0);
  const [newState, setNewState] = useState();

  useEffect(() => {
    if (currentReport !== undefined) {
      reportListStore.getDetailedReport(identity.authorizedFetch, currentReport)
        .then((x) => setReportDetail(x));
    }
  }, [currentReport]);

  const DetailReportView = () => {
    const status = (reportDetail !== undefined && reportDetail.status >= 0 && reportDetail.status < 5) ? REPORT_STATUS[reportDetail.status] : '';
    return (
      <div id="admin-report-view">
        <h1>View Report</h1>
        {reportDetail !== undefined ? (
          <>
            <table id="admin-report-table" cellSpacing="0">
              <tbody>
                <tr>
                  <td className="header">Report ID:</td>
                  <td>{reportDetail.id}</td>
                </tr>
                <tr>
                  <td className="header">Submitted At:</td>
                  <td>
                    {new Date(reportDetail.timestamp).toLocaleString('en-US', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: 'numeric',
                      minute: 'numeric',
                    })}
                  </td>
                </tr>
                <tr>
                  <td className="header">Submitted By:</td>
                  <td>{reportDetail.submitted_by}</td>
                </tr>
                <tr>
                  <td className="header">Report Type:</td>
                  <td>{(reportDetail.type > 0 && reportDetail.type < 5) ? REPORT_TYPES[reportDetail.type] : ''}</td>
                </tr>
                <tr>
                  <td className="header">Status:</td>
                  <td>
                    {(actionState === 0) ? status : (
                      <Select
                        options={REPORT_STATUS}
                        selectedIndex={newState.status}
                        onChange={
                          (evt) => {
                            const updated = newState;
                            updated.status = evt.target.selectedIndex;
                            setNewState(updated);
                          }
                        }
                      />
                    )}
                  </td>
                </tr>
                <tr>
                  <td colSpan="2" style={{ textAlign: 'center' }} className="header">Problem:</td>
                </tr>
                <tr>
                  <td colSpan="2">
                    <textarea value={reportDetail.description} readOnly rows="40" />
                  </td>
                </tr>
                <tr>
                  <td colSpan="2" style={{ textAlign: 'center' }} className="header">Admin Comments:</td>
                </tr>
                <tr>
                  <td colSpan="2">
                    <TextAreaInput
                      value={actionState === 0 ? reportDetail.action : newState.action}
                      readOnly={actionState === 0}
                      onChange={actionState === 0 ? undefined : (evt) => {
                        const updated = newState;
                        updated.action = evt.target.value;
                        setNewState(updated);
                      }}
                      rows="40"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
            <div className="flexbox" style={{ margin: '16px auto', maxWidth: '800px' }}>
              <Button
                className="btn-accent"
                onClick={() => {
                  setNewState({
                    action: reportDetail.action,
                    status: reportDetail.status,
                  });
                  setActionState(1);
                }}
                style={{ display: (actionState === 0) ? 'block' : 'none' }}
              >
                Update
              </Button>
              <Button
                className="btn-primary"
                onClick={() => {
                  reportListStore.updateReport(identity.authorizedFetch,
                    reportDetail.id, newState.status, newState.action)
                    .then(() => {
                      const newReport = reportDetail;
                      newReport.status = newState.status;
                      newReport.action = newState.action;
                      setReportDetail(newReport);
                    })
                    .then(() => setActionState(0));
                }}
                style={{ display: (actionState === 1) ? 'block' : 'none' }}
              >
                Save
              </Button>
              <Button
                className="btn-danger"
                style={{ marginLeft: '8px' }}
                onClick={() => {
                  // eslint-disable-next-line no-restricted-globals
                  if (confirm(`Confirm delete report ${reportDetail.id}`)) {
                    reportListStore.deleteReport(identity.authorizedFetch, reportDetail.id);
                    setCurrentReport(undefined);
                  }
                }}
              >
                Delete
              </Button>
            </div>
          </>
        ) : (
          <h2>Loading Report</h2>
        )}
      </div>
    );
  };

  let view;
  if (currentReport === undefined) {
    view = <ReportListView />;
  } else {
    view = <DetailReportView />;
  }

  const back = () => {
    if (currentReport === undefined) {
      history.replace('/admin/home');
    } else {
      setCurrentReport(undefined);
    }
  };

  return (
    <>
      <div className="panel panel-dark flexbox flex-col" style={{ textAlign: 'center', paddingBottom: '16px' }}>
        <div style={{ marginTop: '8px', marginLeft: '8px' }}>
          <button type="button" className="btn-invisible" style={{ float: 'left' }} onClick={back}>
            <ArrowLeft color="#FFF" size="2rem" />
          </button>
        </div>
        {view}
      </div>
    </>
  );
}
