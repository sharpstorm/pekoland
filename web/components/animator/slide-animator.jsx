/* https://medium.com/onfido-tech/animations-with-react-router-8e97222e25e1 */

import React from 'react';
import classNames from 'classnames';
import './styles.css';

export default class SlideAnimator extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      animating: false,
      position: SlideAnimator.CENTER,
      animatePrepare: false
    };

    this.startAnimation = this.startAnimation.bind(this);
    this.postPrepareAnimation = this.postPrepareAnimation.bind(this);
    this.onTransitionEnd = this.onTransitionEnd.bind(this);
  }

  componentDidMount() {
    this.startAnimation(this.props.position);
    if (this.node) {
      this.node.addEventListener('transitionend', this.onTransitionEnd);
    }
  }

  componentWillUnmount() {
    if (this.node) {
      this.node.removeEventListener('transitionend', this.onTransitionEnd);
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.position !== prevProps.position) {
      this.startAnimation(this.props.position, this.props.animationCallback);
    }
  }

  startAnimation(position, animationCallback) {
    const noAnimate = position === SlideAnimator.CENTER;
    const animatingOut = [SlideAnimator.TO_LEFT, SlideAnimator.TO_RIGHT, SlideAnimator.TO_TOP, SlideAnimator.TO_BOTTOM].includes(position);
    const currentlyIn = [
      SlideAnimator.CENTER,
      SlideAnimator.FROM_LEFT,
      SlideAnimator.FROM_RIGHT,
      SlideAnimator.FROM_TOP,
      SlideAnimator.FROM_BOTTOM
    ].includes(this.state.position);
    if (noAnimate || (currentlyIn && animatingOut)) {
      // in these cases we don't need to prepare our animation at all, we can just
      // run straight into it
      this._animationCallback = animationCallback;
      return this.setState({
        animatePrepare: false,
        position
      });
    }

    this._animationCallback = this.postPrepareAnimation;
    // in case the transition fails, we also post-prepare after some ms (whichever
    // runs first should cancel the other)
    this._postPrepareTimeout = setTimeout(this.postPrepareAnimation, 500);

    this.setState({
      animating: true,
      animatePrepare: true,
      position
    });
  }

  postPrepareAnimation() {
    clearTimeout(this._postPrepareTimeout);
    this._animationCallback = null;

    this.setState(
      { animatePrepare: false },
      () => (this._animationCallback = this.props.animationCallback)
    );
  }

  onTransitionEnd(e) {
    // the animator transitions the `transform` property. Any other transitions
    // that occur on the element we can just ignore.
    if (e.propertyName !== 'transform') return;

    const callback = this._animationCallback;
    delete this._animationCallback;

    // an animation callback is another animation, so we only set `animating` to
    // `false` when we finish the follow-up animation
    if (callback) setTimeout(callback, 0);
    else this.setState({ animating: false });
  }

  render() {
    return (
      <div
        ref={node => (this.node = node)}
        className={classNames('animatable', {
          ['to']: [SlideAnimator.TO_LEFT, SlideAnimator.TO_RIGHT, SlideAnimator.TO_BOTTOM, SlideAnimator.TO_TOP].includes(
            this.state.position
          ),
          ['from']: [SlideAnimator.FROM_LEFT, SlideAnimator.FROM_RIGHT, SlideAnimator.FROM_BOTTOM, SlideAnimator.FROM_TOP].includes(
            this.state.position
          ),
          ['right']: [SlideAnimator.TO_RIGHT, SlideAnimator.FROM_RIGHT].includes(
            this.state.position
          ),
          ['left']: [SlideAnimator.TO_LEFT, SlideAnimator.FROM_LEFT].includes(
            this.state.position
          ),
          ['top']: [SlideAnimator.TO_TOP, SlideAnimator.FROM_TOP].includes(
            this.state.position
          ),
          ['bottom']: [SlideAnimator.TO_BOTTOM, SlideAnimator.FROM_BOTTOM].includes(
            this.state.position
          ),
          ['prepare']: this.state.animatePrepare
        })}
        data-qa-loading={Boolean(
          this.props['data-qa-loading'] || this.state.animating
        )}
      >
        <div className={this.props.className}>{this.props.children}</div>
      </div>
    );
  }
}

SlideAnimator.CENTER = 'CENTER';
SlideAnimator.TO_LEFT = 'TO_LEFT';
SlideAnimator.TO_RIGHT = 'TO_RIGHT';
SlideAnimator.TO_TOP = 'TO_TOP';
SlideAnimator.TO_BOTTOM = 'TO_BOTTOM';
SlideAnimator.FROM_LEFT = 'FROM_LEFT';
SlideAnimator.FROM_RIGHT = 'FROM_RIGHT';
SlideAnimator.FROM_TOP = 'FROM_TOP';
SlideAnimator.FROM_BOTTOM = 'FROM_BOTTOM';