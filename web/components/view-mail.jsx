import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import classNames from 'classnames';
// eslint-disable-next-line import/no-unresolved
import { useIdentityContext } from 'react-netlify-identity-auth';
import { CSSTransition, TransitionGroup } from 'react-transition-group';
import { ArrowLeft } from './icons';
import { Button } from './forms/form-components';
import styles from '../styles.css';

const mailDataStore = () => {
  const [mails, setMails] = useState([]);
  const getMails = () => mails;

  const searchMail = (fetchAgent) => fetchAgent('/functions/mail-search', {
    method: 'POST',
    body: {},
  }).then((resp) => {
    if (resp.status > 399) {
      throw new Error('Failed to Contact Server');
    }
    return resp.json();
  }).then((x) => {
    if (x.mailBlock === undefined) {
      throw new Error('Failed to contact server');
    } else {
      setMails(x.mailBlock);
    }
  });
  return {
    searchMail,
    getMails,
  };
};

export default function MailView() {
  const identity = useIdentityContext();
  const history = useHistory();
  const [currentPage, setCurrentPage] = useState(0);
  const [currentFrom, setCurrentFrom] = useState(0);
  const [currentContent, setCurrentContent] = useState(0);
  const [currentSubject, setCurrentSubject] = useState(0);
  const mailDataStoreInstance = mailDataStore();

  const [animate, setAnimate] = useState(false);
  const handleClick = () => {
    setAnimate(true);
    console.log(animate);
  };

  useEffect(() => {
    if (identity.ready && !identity.user) {
      history.replace('/login');
    } else if (identity.ready) {
      mailDataStoreInstance.searchMail(identity.authorizedFetch);
    }
  }, [identity.ready]);

  function viewMessage(from, subject, content) {
    handleClick();
    setCurrentPage(1);
    setCurrentFrom(from);
    setCurrentSubject(subject);
    setCurrentContent(content);
  }

  function viewReply() {
    setCurrentPage(2);
  }

  function renderMailRow(from, subject, button) {
    return (
      <div className="flexbox" style={{ padding: '16px 0', borderTop: '1px solid #CCC' }} key={subject}>
        <div className="flexbox flex-col flex-center flex-equal">{from}</div>
        <div className="flexbox flex-col flex-center flex-equal">{subject}</div>
        <div className="flexbox flex-col flex-center flex-equal">
          {button}
        </div>
        <div style={{ marginLeft: '9px' }} className="flexbox flex-col flex-center flex-equal">
          <Button className="btn-accent">Delete</Button>
        </div>
      </div>
    );
  }

  function pullMail() {
    return mailDataStoreInstance.getMails();
  }

  // eslint-disable-next-line arrow-body-style
  const ViewManageMail = () => {
    // console.log(searchMail);
    // console.log(pullMail());
    return (
      <>
        <div className="flexbox flex-col" style={{ textAlign: 'left', margin: '8px' }}>
          <div className="flexbox flex-row">
            <div className="flexbox flex-col flex-center flex-equal"> From </div>
            <div className="flexbox flex-col flex-center flex-equal"> Subject </div>
            <div className="flexbox flex-col flex-center flex-equal">  </div>
            <div className="flexbox flex-col flex-center flex-equal">  </div>
          </div>
          {pullMail().map((x) => renderMailRow(x.from, x.subject,
            <Button
              onClick={() => { viewMessage(x.from, x.subject, x.content); }}
              className={classNames(
                styles.animate,
                animate && styles.grow,
              )}>
                View</Button>))}
        </div>
      </>
    );
  };

  const ViewMailMessage = () => (
    <>
      <div style={{ textAlign: 'left' }}>
        From:
        {' '}
        {currentFrom}
      </div>
      <div style={{ textAlign: 'left', marginTop: '25px' }}>
        From:
        {' '}
        {currentSubject}
      </div>
      <div
        className="panel panel-light flexbox flex-col"
        style={{
          textAlign: 'left', paddingBottom: '16px', color: 'black', marginTop: '30px', marginBottom: '30px',
        }}
      >
        {currentContent}
      </div>
      <div className="flexbox flex-row" style={{ textAlign: 'left', margin: '8px' }}>
        <div style={{ marginLeft: '45px' }} className="flexbox flex-col flex-center flex-equal">
          <Button onClick={() => viewReply()} className="btn-accent">Reply</Button>
        </div>
        <div style={{ marginLeft: '9px', marginRight: '40px' }} className="flexbox flex-col flex-center flex-equal">
          <Button className="btn-accent">Delete</Button>
        </div>
      </div>
    </>
  );

  // TO FIX MULTI LINE MESSAGE BOX
  const ViewReplyMessage = () => (
    <>
      <div style={{ textAlign: 'left' }}>
        Replying to:
        {' '}
        {currentFrom}
      </div>
      <textarea placeholder="Your Message" style={{ height: '200px', resize: 'none' }} />
      <div className="flexbox flex-row" style={{ textAlign: 'left', margin: '8px' }}>
        <div style={{ marginLeft: '45px' }} className="flexbox flex-col flex-center flex-equal">
          <Button className="btn-accent">Send</Button>
        </div>
        <div style={{ marginLeft: '9px', marginRight: '40px' }} className="flexbox flex-col flex-center flex-equal">
          <Button onClick={() => setCurrentPage(1)} className="btn-accent">Back</Button>
        </div>
      </div>
    </>
  );

  const back = () => {
    if (currentPage === 0) {
      history.replace('/home');
    } else {
      setCurrentPage(0);
    }
  };
  let view;
  if (currentPage === 0) {
    view = <ViewManageMail> </ViewManageMail>;
  } else if (currentPage === 1) {
    view = <ViewMailMessage> </ViewMailMessage>;
  } else {
    view = <ViewReplyMessage> </ViewReplyMessage>;
  }

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
