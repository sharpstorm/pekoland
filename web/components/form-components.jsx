import React from 'react';

class TextInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = {value: ''};

    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    this.setState({value: event.target.value});
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

export default TextInput;