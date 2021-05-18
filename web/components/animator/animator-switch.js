import React from 'react';
import { Switch, Route } from 'react-router-dom';

export default class AnimatorSwitch extends React.Component {
  constructor(props) {
    super(props);

    this.animationComponent = props.animator;
    this.switch = (props.switch === undefined) ? Switch : props.switch;
  }

  render() {
    const AnimatorComponent = this.animationComponent;
    const CustomSwitch = this.switch;

    return (
      <Route
        render={({ location }) => (
          <AnimatorComponent uniqKey={location.pathname} updateStep={this.props.updateStep}>
            <CustomSwitch location={location}>{this.props.children}</CustomSwitch>
          </AnimatorComponent>
        )}
      />
    );
  }
}