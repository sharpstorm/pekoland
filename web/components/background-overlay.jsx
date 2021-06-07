import React from 'react';

export default class BackgroundOverlay extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isVisible: true,
    };

    this.onTransitionEnd = this.onTransitionEnd.bind(this);
  }

  componentDidMount() {
    if (this.node) {
      this.node.addEventListener('transitionend', this.onTransitionEnd);
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.isVisible !== prevProps.isVisible) {
      this.setState({ isVisible: this.props.isVisible });
    }
  }

  componentWillUnmount() {
    if (this.node) {
      this.node.removeEventListener('transitionend', this.onTransitionEnd);
    }
  }

  onTransitionEnd() {
    if (this.props.onChange !== undefined) {
      this.props.onChange();
    }
  }

  render() {
    return (
      <div ref={(node) => { this.node = node; }} className={`bg-overlay${this.state.isVisible ? '' : ' disappear'}`}>
        <div />
        <img src={require('../assets/bg-1.svg')} style={{ bottom: '40%', transition: 'transform 0.9s ease-in' }} alt="" />
        <img src={require('../assets/bg-2.png')} style={{ top: '40%' }} alt="" />
      </div>
    );
  }
}
