/* eslint-disable no-useless-computed-key */
/* eslint-disable no-underscore-dangle */
import React from 'react';
import classNames from 'classnames';
import './styles.css';

export default class FadeAnimator extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      animating: false,
      opacity: props.opacity,
      animatePrepare: false,
    };

    this.startAnimation = this.startAnimation.bind(this);
    this.postPrepareAnimation = this.postPrepareAnimation.bind(this);
    this.onTransitionEnd = this.onTransitionEnd.bind(this);
  }

  componentDidMount() {
    this.startAnimation(this.props.opacity, this.props.opacity);
    if (this.node) {
      this.node.addEventListener('transitionend', this.onTransitionEnd);
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.opacity !== prevProps.opacity) {
      this.startAnimation(this.props.opacity, prevProps.opacity, this.props.animationCallback);
    }
  }

  componentWillUnmount() {
    if (this.node) {
      this.node.removeEventListener('transitionend', this.onTransitionEnd);
    }
  }

  onTransitionEnd(e) {
    if (e.propertyName !== 'opacity') return;

    const callback = this._animationCallback;
    delete this._animationCallback;

    if (callback) setTimeout(callback, 0);
    else this.setState({ animating: false });
  }

  startAnimation(opacity, prevOpacity, animationCallback) {
    this._animationCallback = animationCallback;
    if (prevOpacity === opacity) {
      this.setState({
        opacity,
        animatePrepare: false,
      });
      return;
    }

    this._animationCallback = this.postPrepareAnimation;
    this._postPrepareTimeout = setTimeout(this.postPrepareAnimation, 500);

    this.setState({
      animating: true,
      animatePrepare: true,
      opacity,
    });
  }

  postPrepareAnimation() {
    clearTimeout(this._postPrepareTimeout);
    this._animationCallback = null;

    this.setState(
      { animatePrepare: false },
      () => { this._animationCallback = this.props.animationCallback; },
    );
  }

  render() {
    return (
      <div
        ref={(node) => { this.node = node; }}
        className={classNames('fadeable', {
          ['opaque']: this.state.opacity === 1,
          ['transparent']: this.state.opacity === 0,
          ['prepare']: this.state.animatePrepare,
        })}
        data-qa-loading={Boolean(
          this.props['data-qa-loading'] || this.state.animating,
        )}
      >
        <div className={this.props.className}>{this.props.children}</div>
      </div>
    );
  }
}

FadeAnimator.OPAQUE = 1;
FadeAnimator.OPAQUE_NOANIMATE = 1;
FadeAnimator.TRANSPARENT = 0;
FadeAnimator.TRANSPARENT_NOANIMATE = 0;
