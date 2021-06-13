import React from 'react';

export default class Logo extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return <div className='center' style={this.props.style}>
      <img style={{width: '100%', maxWidth: '300px', margin: 'auto'}} src={require('../assets/logo.png')}/>
    </div>
  }
}