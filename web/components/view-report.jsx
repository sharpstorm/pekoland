import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
// eslint-disable-next-line import/no-unresolved
import { useIdentityContext } from 'react-netlify-identity-auth';
import { ArrowLeft } from './icons';
import { Button, Select, TextAreaInput } from './forms/form-components';
import './view-report-styles.css';

const REPORT_TYPES = ['Report User', 'Report Bug', 'Report Problem', 'Help Request'];
const REPORT_STATUS = ['Open', 'Acknowledged', 'Resolved', 'Closed Without Resolution'];

const makeReportCache = () => {
  const [reports, setReports] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(0);

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

  const createReport = (fetchAgent, reportType, reportText) => fetchAgent('/functions/report-list', {
    method: 'POST',
    body: JSON.stringify({
      issue_type: reportType,
      issue_description: reportText,
    }),
  })
    .then((resp) => {
      if (resp.status > 399) {
        throw new Error('Failed to Contact Server');
      }
      return resp.json();
    })
    .then((x) => {
      const reportClone = reports;
      reportClone.push(x);
      setReports(reportClone);
      setLastUpdate(Date.now());
    });

  const deleteReport = (fetchAgent, reportId) => fetchAgent('/functions/report-remove', {
    method: 'POST',
    body: JSON.stringify({
      report_id: reportId,
    }),
  })
    .then((resp) => {
      if (resp.status > 399) {
        throw new Error('Failed to Contact Server');
      }
      return resp.json();
    })
    .then((x) => {
      const reportClone = reports;
      reportClone.push(x);
      setReports(reportClone);
      setLastUpdate(Date.now());
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

  return {
    getReports,
    lastUpdate,
    refreshReports,
    createReport,
    deleteReport,
    getDetailedReport,
  };
};

export default function ReportView() {
  const identity = useIdentityContext();
  const history = useHistory();
  const [currentView, setCurrentView] = useState(0);
  const [currentReport, setCurrentReport] = useState(undefined);
  const [isLoading, setIsLoading] = useState(false);

  const reportCache = makeReportCache();

  useEffect(() => {
    if (identity.ready && !identity.user) {
      history.replace('/login');
    } else if (identity.ready) {
      reportCache.refreshReports(identity.authorizedFetch);
    }
  }, [identity.ready]);

  const ListReportsView = () => {
    const reportListElement = (reportCache.getReports() === undefined)
      ? (<h1>Loading Reports</h1>)
      : (
        <ul id="report-list">
          <li key="header">
            <div style={{ fontSize: '1.2em', fontWeight: '600', letterSpacing: '1px' }}>Report ID</div>
            <div style={{ fontSize: '1.2em', fontWeight: '600', letterSpacing: '1px' }}>Submitted At</div>
            <div style={{ fontSize: '1.2em', fontWeight: '600', letterSpacing: '1px' }}>Report Type</div>
            <div style={{ fontSize: '1.2em', fontWeight: '600', letterSpacing: '1px' }}>Summary</div>
            <div>
              <Button
                className="btn-accent"
                onClick={() => setCurrentView(2)}
              >
                Create New Report
              </Button>
            </div>
          </li>
          {reportCache.getReports().map((report) => (
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
                  onClick={() => {
                    setCurrentView(1);
                    reportCache.getDetailedReport(identity.authorizedFetch, report.id)
                      .then((x) => setCurrentReport(x))
                      .catch(() => {
                        alert('Failed to get report details');
                        setCurrentView(0);
                      });
                  }}
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
        <h1>My Reports</h1>
        {reportListElement}
      </>
    );
  };

  const DetailReportView = () => (
    <>
      <h1>View Report</h1>
      {currentReport !== undefined ? (
        <>
          <table id="report-table" cellSpacing="0">
            <tbody>
              <tr>
                <td className="header">Report ID:</td>
                <td>{currentReport.id}</td>
              </tr>
              <tr>
                <td className="header">Submitted At:</td>
                <td>
                  {new Date(currentReport.timestamp).toLocaleString('en-US', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: 'numeric',
                  })}
                </td>
              </tr>
              <tr>
                <td className="header">Report Type:</td>
                <td>{(currentReport.type > 0 && currentReport.type < 5) ? REPORT_TYPES[currentReport.type] : ''}</td>
              </tr>
              <tr>
                <td className="header">Status:</td>
                <td>{(currentReport.status >= 0 && currentReport.status < 5) ? REPORT_STATUS[currentReport.status] : ''}</td>
              </tr>
              <tr>
                <td colSpan="2" style={{ textAlign: 'center' }} className="header">Problem:</td>
              </tr>
              <tr>
                <td colSpan="2">
                  <TextAreaInput
                    style={{ width: '100%', maxHeight: '10vh' }}
                    value={currentReport.description}
                    readOnly
                    rows="40"
                  />
                </td>
              </tr>
              <tr>
                <td colSpan="2" style={{ textAlign: 'center' }} className="header">Admin Comments:</td>
              </tr>
              <tr>
                <td colSpan="2">
                  <TextAreaInput
                    style={{ width: '100%', maxHeight: '10vh' }}
                    value={currentReport.action}
                    readOnly
                    rows="40"
                  />
                </td>
              </tr>
            </tbody>
          </table>
          <div className="flexbox" style={{ margin: '16px auto', maxWidth: '800px' }}>
            <Button
              className={`btn-danger${isLoading ? ' loading' : ''}`}
              disabled={isLoading}
              style={{ marginLeft: '8px' }}
              onClick={() => {
                // eslint-disable-next-line no-restricted-globals
                if (confirm(`Confirm delete report ${currentReport.id}`)) {
                  setIsLoading(true);
                  reportCache.deleteReport(identity.authorizedFetch, currentReport.id)
                    .then(() => {
                      setIsLoading(false);
                      setCurrentReport(undefined);
                      setCurrentView(0);
                    })
                    .catch(() => {
                      alert('Failed to delete report');
                      setIsLoading(false);
                    });
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
    </>
  );

  const SubmitReportView = () => {
    const [problemText, setProblemText] = useState('');
    const [problemType, setProblemType] = useState(0);

    const isFormValid = () => problemText !== '';
    const submitForm = () => {
      identity.authorizedFetch('report-submit', {
        method: 'POST',
        body: JSON.stringify({
          issue_type: problemType,
          issue_description: problemText,
        }),
      })
        .then((resp) => {
          if (resp.status > 399) {
            alert('Failed to submit report');
            return;
          }
          alert('Successfully submitted report');
        })
        .catch(() => {
          alert('Failed to submit report');
        });
    };

    return (
      <>
        <h2>Submit New Report</h2>
        <table
          id="report-submit-table"
          cellSpacing="0"
        >
          <tbody>
            <tr>
              <td className="header">Problem Type</td>
              <td>
                <Select
                  selectedIndex={problemType}
                  style={{ flex: '1 1 0' }}
                  options={REPORT_TYPES}
                  onChange={(evt) => setProblemType(evt.target.selectedIndex)}
                />
              </td>
            </tr>
            <tr>
              <td colSpan="2" className="header" style={{ textAlign: 'center' }}>Describe Your Problem</td>
            </tr>
            <tr>
              <td colSpan="2">
                <TextAreaInput
                  value={problemText}
                  rows="20"
                  style={{ width: '100%', maxHeight: '25vh' }}
                  onChange={(evt) => setProblemText(evt.target.value)}
                />
              </td>
            </tr>
          </tbody>
        </table>
        <Button
          disabled={!isFormValid()}
          className="btn-accent"
          style={{ maxWidth: '500px', margin: '8px auto' }}
          onClick={() => submitForm()}
        >
          Submit
        </Button>
      </>
    );
  };

  let view;
  if (currentView === 0) {
    view = <ListReportsView />;
  } else if (currentView === 1) {
    view = <DetailReportView />;
  } else if (currentView === 2) {
    view = <SubmitReportView />;
  }

  const back = () => {
    if (currentView > 0) {
      setCurrentView(0);
    } else {
      history.replace('/home');
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
