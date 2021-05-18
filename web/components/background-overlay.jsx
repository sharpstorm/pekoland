import React from 'react';

export default class BackgroundOverlay extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return <div className='bg-overlay'>
        <div></div>
        <img src={require('../assets/bg-1.svg')} style={{bottom: '40%'}}/>
        <img src={require('../assets/bg-2.png')} style={{top: '40%'}}/>
      </div>
  }
}