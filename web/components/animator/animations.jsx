import React from 'react';
import SlideAnimator from './slide-animator';

class AnimSlideOut extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      childPosition: SlideAnimator.CENTER,
      curChild: props.children,
      curUniqId: props.uniqId,
      prevChild: null,
      prevUniqId: null,
      animationCallback: null
    };
  }

  componentDidUpdate(prevProps, prevState) {
    const prevUniqId = prevProps.uniqKey || prevProps.children.type;
    const uniqId = this.props.uniqKey || this.props.children.type;

    if (prevUniqId !== uniqId) {
      this.setState({
        childPosition: SlideAnimator.TO_LEFT,
        curChild: this.props.children,
        curUniqId: uniqId,
        prevChild: prevProps.children,
        prevUniqId,
        animationCallback: this.swapChildren
      });
    }
  }

  swapChildren = () => {
    this.setState({
      childPosition: SlideAnimator.FROM_RIGHT,
      prevChild: null,
      prevUniqId: null,
      animationCallback: null
    });
  };

  render() {
    return (
      <SlideAnimator
        position={this.state.childPosition}
        animationCallback={this.state.animationCallback}
      >
        {this.state.prevChild || this.state.curChild}
      </SlideAnimator>
    );
  }
}

class AnimSlideUp extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      childPosition: SlideAnimator.CENTER,
      curChild: props.children,
      curUniqId: props.uniqId,
      prevChild: null,
      prevUniqId: null,
      animationCallback: null
    };
  }

  componentDidUpdate(prevProps, prevState) {
    const prevUniqId = prevProps.uniqKey || prevProps.children.type;
    const uniqId = this.props.uniqKey || this.props.children.type;

    if (prevUniqId !== uniqId) {
      this.setState({
        childPosition: SlideAnimator.TO_BOTTOM,
        curChild: this.props.children,
        curUniqId: uniqId,
        prevChild: prevProps.children,
        prevUniqId,
        animationCallback: this.swapChildren
      });
    }
  }

  swapChildren = () => {
    this.setState({
      childPosition: SlideAnimator.FROM_TOP,
      prevChild: null,
      prevUniqId: null,
      animationCallback: null
    });
  };

  render() {
    return (
      <SlideAnimator
        position={this.state.childPosition}
        animationCallback={this.state.animationCallback}
      >
        {this.state.prevChild || this.state.curChild}
      </SlideAnimator>
    );
  }
}

export { AnimSlideOut, AnimSlideUp }