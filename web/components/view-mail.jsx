import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
// eslint-disable-next-line import/no-unresolved
import { useIdentityContext } from 'react-netlify-identity-auth';
import { ArrowLeft } from './icons';
import {
  Button,
  TextInput,
  TextAreaInput,
  Select,
} from './forms/form-components';

const mailDataStore = () => {
  const [mails, setMails] = useState([]);
  const [friends, setFriends] = useState([]);
  const getMails = () => mails;

  const getFriends = () => friends;

  const refreshMails = (fetchAgent) => fetchAgent('/functions/mail-list', {
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
      setMails(x.mailBlock.data);
    }
  });

  const createMail = (fetchAgent, to, from, subject, content) => fetchAgent('/functions/mail-send', {
    method: 'POST',
    body: JSON.stringify({
      to,
      from,
      subject,
      content,
    }),
  })
    .then((resp) => {
      if (resp.status > 399) {
        throw new Error('Failed to Contact Server');
      }
      return resp.json();
    });

  const deleteMail = (fetchAgent, mailId) => fetchAgent('/functions/mail-remove', {
    method: 'POST',
    body: JSON.stringify({
      mailId,
    }),
  }).then((resp) => {
    if (resp.status > 399) {
      throw new Error('Failed to Contact Server');
    }
    return resp.json();
  }).then((x) => { setMails(x.mailBlock.data); });

  const refreshFriends = (fetchAgent) => fetchAgent('/functions/friends-get', {
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
      if (x.friends === undefined) {
        throw new Error('Failed to contact server');
      } else {
        setFriends(x.friends);
      }
    });

  return {
    refreshMails,
    getMails,
    createMail,
    deleteMail,
    getFriends,
    refreshFriends,
  };
};

export default function MailView() {
  const identity = useIdentityContext();
  const history = useHistory();
  const [formState, setFormState] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [currentTo, setCurrentTo] = useState('');
  const [currentContent, setCurrentContent] = useState('');
  const [currentSubject, setCurrentSubject] = useState('');
  const [currentMailId, setCurrentMailId] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const mailDataStoreInstance = mailDataStore();

  useEffect(() => {
    if (identity.ready && !identity.user) {
      history.replace('/login');
    } else if (identity.ready) {
      mailDataStoreInstance.refreshMails(identity.authorizedFetch);
      mailDataStoreInstance.refreshFriends(identity.authorizedFetch);
    }
  }, [identity.ready]);

  function deleteMail(authorizedFetch, id) {
    // eslint-disable-next-line no-restricted-globals
    if (confirm('Are you sure you want to delete this mail?')) {
      setFormState(3);
      mailDataStoreInstance.deleteMail(authorizedFetch, id)
        .then(() => setFormState(0));
      setCurrentPage(0);
    }
  }

  function viewMessage(to, subject, content, id) {
    setCurrentMailId(id);
    setCurrentPage(1);
    setCurrentTo(to);
    setCurrentSubject(subject);
    setCurrentContent(content);
  }

  function viewReply() {
    if (!currentSubject.includes('[Reply]')) {
      setCurrentSubject(`${currentSubject} [Reply]`);
    }
    setCurrentPage(2);
  }

  function pullMail() {
    return mailDataStoreInstance.getMails();
  }

  function renderMailRow(from, subject, button, button2, key) {
    return (
      <div className="flexbox" style={{ padding: '16px 0', borderTop: '1px solid #CCC' }} key={key}>
        <div className="flexbox flex-col flex-center flex-equal">{from}</div>
        <div className="flexbox flex-col flex-center flex-equal">{subject}</div>
        <div className="flexbox flex-col flex-center flex-equal">
          {button}
        </div>
        <div style={{ marginLeft: '9px' }} className="flexbox flex-col flex-center flex-equal">
          {button2}
        </div>
      </div>
    );
  }

  function getIgn(email) {
    if (mailDataStoreInstance.getFriends().length !== 0) {
      if (mailDataStoreInstance.getFriends().filter((x) => (x.email === email))[0] !== undefined) {
        return mailDataStoreInstance.getFriends().filter((x) => (x.email === email))[0].ign;
      }
    }
    return '';
  }

  const sendMail = (aFetch, to, from, subject, content) => {
    try {
      mailDataStoreInstance.createMail(aFetch, to, from, subject, content)
        .then(() => alert('Mail Sent'))
        .finally(() => setCurrentPage(0));
    } catch {
      alert('Send Mail failed');
    }
  };

  const ViewManageMail = () => (
    <>
      <div className="flexbox flex-col" style={{ textAlign: 'left', margin: '8px' }}>
        <div className="flexbox flex-row">
          <div className="flexbox flex-col flex-center flex-equal">
            {pullMail().length !== 0 ? 'From' : ''}
          </div>
          <div className="flexbox flex-col flex-center flex-equal">
            {pullMail().length !== 0 ? 'Subject' : ''}
          </div>
          <div className="flexbox flex-col flex-center flex-equal">  </div>
          <div className="flexbox flex-col flex-center flex-equal">  </div>
        </div>
        {pullMail().map((x) => renderMailRow(getIgn(x[0].toLowerCase()), x[2],
          <Button
            onClick={() => { viewMessage(x[0], x[2], x[3], x[4]['@ref'].id); }}
            className={`btn-accent${formState === 3 ? ' loading' : ''}`}
          >
            View
          </Button>,
          <Button
            onClick={() => { deleteMail(identity.authorizedFetch, x[4]['@ref'].id); }}
            className={`btn-accent${formState === 3 ? ' loading' : ''}`}
          >
            Delete
          </Button>, x[4]['@ref'].id))}
      </div>
      {pullMail().length === 0 ? <div style={{ color: 'white', padding: '70px 0' }}> Your Mail Box is Empty! </div> : ''}
    </>
  );

  const ViewMailMessage = () => (
    <>
      <div style={{ textAlign: 'left' }}>
        From:
        {' '}
        {getIgn(currentTo.toLowerCase())}
      </div>
      <div style={{ textAlign: 'left', marginTop: '25px' }}>
        Subject:
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
          <Button onClick={() => { deleteMail(identity.authorizedFetch, currentMailId); }} className="btn-accent">Delete</Button>
        </div>
      </div>
    </>
  );

  const ViewReplyMessage = () => {
    let content;
    return (
      <>
        <div style={{ textAlign: 'left' }}>
          Replying to:
          {' '}
          {getIgn(currentTo.toLowerCase())}
        </div>
        <div style={{ textAlign: 'left', marginTop: '25px' }}>
          Subject:
          {' '}
          {currentSubject}
        </div>
        <TextAreaInput
          maxLength="600"
          onChange={(evt) => { content = evt.target.value; }}
          placeholder="Your Message"
          style={{
            height: '200px',
            resize: 'none',
            backgroundColor: 'white',
            color: 'black',
            marginTop: '25px',
          }}
        />
        <div className="flexbox flex-row" style={{ textAlign: 'left', margin: '8px' }}>
          <div style={{ marginLeft: '45px' }} className="flexbox flex-col flex-center flex-equal">
            <Button onClick={() => sendMail(identity.authorizedFetch, currentTo, identity.user.email, currentSubject, content)} className="btn-accent">Send</Button>
          </div>
          <div style={{ marginLeft: '9px', marginRight: '40px' }} className="flexbox flex-col flex-center flex-equal">
            <Button onClick={() => setCurrentPage(1)} className="btn-accent">Back</Button>
          </div>
        </div>
      </>
    );
  };

  const SendMessage = () => {
    let subject;
    let content;
    const OptionsArr = ['Select Friends'];
    mailDataStoreInstance.getFriends().map((x) => OptionsArr.push(x.ign));
    return (
      <>
        <div style={{ textAlign: 'left' }}>
          To:
          {' '}
          <Select
            selectedIndex={selectedIndex}
            style={{ flex: '1 1 0' }}
            options={OptionsArr}
            onChange={(evt) => {
              setSelectedIndex(evt.target.selectedIndex);
              if (evt.target.selectedIndex !== 0) {
                setCurrentTo(mailDataStoreInstance
                  .getFriends()[evt.target.selectedIndex - 1].email.toLowerCase());
              }
            }}
          />
        </div>
        <div style={{ textAlign: 'left', marginTop: '25px' }}>
          Subject:
          <TextInput onChange={(evt) => { subject = evt.target.value; }} style={{ marginLeft: '2%' }} value={subject} />
        </div>
        <TextAreaInput
          maxLength="600"
          onChange={(evt) => { content = evt.target.value; }}
          placeholder="Your Message"
          style={{
            height: '200px',
            resize: 'none',
            backgroundColor: 'white',
            color: 'black',
            marginTop: '25px',
          }}
        />
        <div className="flexbox flex-row" style={{ textAlign: 'left', margin: '8px' }}>
          <div style={{ marginLeft: '45px' }} className="flexbox flex-col flex-center flex-equal">
            <Button disabled={selectedIndex === 0 ? true : false} onClick={() => sendMail(identity.authorizedFetch, currentTo, identity.user.email.toLowerCase(), subject, content)} className="btn-accent">Send</Button>
          </div>
          <div style={{ marginLeft: '9px', marginRight: '40px' }} className="flexbox flex-col flex-center flex-equal">
            <Button onClick={() => setCurrentPage(0)} className="btn-accent">Back</Button>
          </div>
        </div>
      </>
    );
  };

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
  } else if (currentPage === 2) {
    view = <ViewReplyMessage> </ViewReplyMessage>;
  } else {
    view = <SendMessage> </SendMessage>;
  }

  return (
    <>
      <div className="panel panel-dark flexbox flex-col" style={{ textAlign: 'center', paddingBottom: '16px' }}>
        <div style={{ marginTop: '8px', marginLeft: '8px' }}>
          <button type="button" className="btn-invisible" style={{ float: 'left' }} onClick={back}>
            <ArrowLeft color="#FFF" size="2rem" />
          </button>
          <Button type="button" className="btn-accent" style={{ float: 'right', width: '150px', display: currentPage === 0 ? 'block' : 'none' }} onClick={() => setCurrentPage(3)}>
            Compose Mail
          </Button>
        </div>
        {view}
      </div>
    </>
  );
}
