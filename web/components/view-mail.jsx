import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
// eslint-disable-next-line import/no-unresolved
import { useIdentityContext } from 'react-netlify-identity-auth';
import { ArrowLeft } from './icons';
import { Button, TextInput } from './forms/form-components';

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
  }).then((x) => { console.log(x.mailBlock); setMails(x.mailBlock.data); console.log(mails); });

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
        console.log('friendsss', x.friends);
      }
    });

  return {
    refreshMails,
    searchMail,
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
  const [currentFrom, setCurrentFrom] = useState('');
  const [currentTo, setCurrentTo] = useState('');
  const [currentContent, setCurrentContent] = useState('');
  const [currentSubject, setCurrentSubject] = useState('');
  const [currentMailId, setCurrentMailId] = useState('');
  const mailDataStoreInstance = mailDataStore();

  function deleteMail(authorizedFetch, id) {
    // eslint-disable-next-line no-restricted-globals
    if (confirm('Are you sure you want to delete this mail?')) {
      setFormState(3);
      mailDataStoreInstance.deleteMail(authorizedFetch, id)
        .then(mailDataStoreInstance.refreshMails(identity.authorizedFetch))
        .finally(() => setFormState(0));
      setCurrentPage(0);
    }
  }

  useEffect(() => {
    if (identity.ready && !identity.user) {
      history.replace('/login');
    } else if (identity.ready) {
      console.log(identity.user.id);
      mailDataStoreInstance.refreshMails(identity.authorizedFetch);
      mailDataStoreInstance.refreshFriends(identity.authorizedFetch);
    }
  }, [identity.ready]);

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

  function pullMail() {
    return mailDataStoreInstance.getMails();
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
      mailDataStoreInstance.createMail(aFetch, to, from, subject, content);
      alert('Mail Sent');
      setCurrentPage(0);
    } catch {
      alert('Send Mail failed');
    }
  };

  // eslint-disable-next-line arrow-body-style
  const ViewManageMail = () => {
    // console.log(searchMail);
    // console.log(pullMail());
    console.log('in view manage', mailDataStoreInstance.getFriends());
    return (
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
  };

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

  // TO FIX MULTI LINE MESSAGE BOX
  const ViewReplyMessage = () => {
    let content;
    return (
      <>
        <div style={{ textAlign: 'left' }}>
          Replying to:
          {' '}
          {getIgn(currentTo.toLowerCase())}
        </div>
        <div style={{ textAlign: 'left', marginTop: '25px'}}>
          Subject:
          {' '}
          {currentSubject}
        </div>
        <textarea maxLength="600" onChange={(evt) => { content = evt.target.value; }} placeholder="Your Message" style={{ height: '200px', resize: 'none', marginTop: '25px' }} />
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
    let to;
    let content;
    const aa = [{ a: 1, b: 11 }, { a: 2, b: 22 }];
    console.log(mailDataStoreInstance.getFriends());
    //  {mailDataStoreInstance.getFriends.map((x) => renderFriendRow(x.ign))}
    return (
      <>
        <div style={{ textAlign: 'left' }}>
          To:
          {' '}
          <select defaultValue="DEFAULT" onChange={(x) => { to = x.target.value; }}>
            <option value="DEFAULT" disabled hidden>Select friend</option>
            {mailDataStoreInstance.getFriends()
              .map((x) => <option value={x.email} key={x.email}> {x.ign} </option>) }
          </select>
        </div>
        <div style={{ textAlign: 'left' }}>
          Subject:
          <TextInput onChange={(evt) => { subject = evt.target.value; }} style={{ marginLeft: '2%' }} value={subject} />
        </div>
        <textarea maxLength="600" onChange={(evt) => { content = evt.target.value; }} placeholder="Your Message" style={{ height: '200px', resize: 'none' }} />
        <div className="flexbox flex-row" style={{ textAlign: 'left', margin: '8px' }}>
          <div style={{ marginLeft: '45px' }} className="flexbox flex-col flex-center flex-equal">
            <Button onClick={() => sendMail(identity.authorizedFetch, 'E0544325@u.nus.edu', identity.user.email, subject, content)} className="btn-accent">Send</Button>
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
    // mailDataStoreInstance.refreshMails(identity.authorizedFetch);
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
