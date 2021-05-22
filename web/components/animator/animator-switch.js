import React from 'react';
import { Switch, Route } from 'react-router-dom';

class RouteAnimatorSwitch extends React.Component {
  constructor(props) {
    super(props);

    this.animationComponent = props.animator;
    this.switch = (props.switch === undefined) ? Switch : props.switch;
  }

  render() {
    const AnimatorComponent = this.animationComponent;
    const CustomSwitch = this.switch;

    return (
      <Route path={this.props.path}
        render={({location, match}) => (
            <AnimatorComponent uniqKey={location.pathname} matchRoute={match.url} updateStep={this.props.updateStep}>
              <CustomSwitch location={location}>{this.props.children}</CustomSwitch>
            </AnimatorComponent>
          )}
      />
    );
  }
}

export { RouteAnimatorSwitch };