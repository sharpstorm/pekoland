import React from 'react';
import './style.css';

class TextInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = { value: props.value === undefined ? '' : props.value };

    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    this.setState({ value: event.target.value });
    if (this.props.onChange !== undefined) {
      this.props.onChange(event);
    }
  }

  render() {
    return (
      <input
        className="form-control"
        type={this.props.type}
        value={this.state.value}
        disabled={this.props.disabled}
        onChange={this.handleChange}
        placeholder={this.props.placeholder}
        style={this.props.style}
      />
    );
  }
}

class TextAreaInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = { value: props.value === undefined ? '' : props.value };

    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    this.setState({ value: event.target.value });
    if (this.props.onChange !== undefined) {
      this.props.onChange(event);
    }
  }

  render() {
    return (
      <textarea
        value={this.state.value}
        disabled={this.props.disabled}
        readOnly={this.props.readOnly}
        rows={this.props.rows}
        onChange={this.handleChange}
        style={this.props.style}
        className="form-control"
      />
    );
  }
}

class Select extends React.Component {
  constructor(props) {
    super(props);
    this.state = { selectedIndex: props.selectedIndex === undefined ? 0 : props.selectedIndex };
    this.options = this.props.options.map((x, idx) => ({
      value: idx,
      label: x,
    }));

    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    this.setState({ selectedIndex: event.target.selectedIndex });
    if (this.props.onChange !== undefined) {
      this.props.onChange(event);
    }
  }

  render() {
    return (
      <select
        value={this.state.selectedIndex}
        onChange={this.handleChange}
        style={this.props.style}
        className="form-control"
      >
        {this.options.map((x) => (
          <option value={x.value} key={x.value}>{x.label}</option>
        ))}
      </select>
    );
  }
}

const Button = (props) => (
  // eslint-disable-next-line react/jsx-props-no-spreading
  <button type="button" {...props} className={`btn ${props.className}`}>
    <span>
      {props.children}
    </span>
  </button>
);

export {
  TextInput,
  TextAreaInput,
  Select,
  Button,
};
