import React from 'react';
import './style.css';

class TextInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = {value: props.value === undefined ? '' : props.value};

    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    this.setState({value: event.target.value});
    if (this.props.onChange !== undefined) {
      this.props.onChange(event);
    }
  }

  render() {
    return <input className='form-control' 
                  type={this.props.type} 
                  value={this.state.value}
                  disabled={this.props.disabled}
                  onChange={this.handleChange} 
                  placeholder={this.props.placeholder}
                  style={this.props.style} />
  }
}

const Button = (props) => {
  return (
    <button {...props} className={'btn ' + props.className}>
      <span>
        {props.children}
      </span>
    </button>
  );
}

export { TextInput, Button };