import React from 'react';

export default function Logo(props) {
  return (
    <div className="center" style={props.style}>
      <img style={{ width: '100%', maxWidth: '300px', margin: 'auto' }} src={require('../assets/logo.png')} alt="" />
    </div>
  );
}
