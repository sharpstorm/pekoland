import React from 'react';

export default class TextInput extends React.Component {
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
                  onChange={this.handleChange} 
                  placeholder={this.props.placeholder}
                  style={this.props.style} />
  }
}