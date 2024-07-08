import { Form, Input } from 'antd';
import { Component } from 'react';

import './SearchBar.css';

export default class SearchBar extends Component {
  debounce = (fn, debounceTime) => {
    let timerId;

    return function wrapper() {
      if (timerId) {
        clearTimeout(timerId);
      }

      console.log('debounce');

      timerId = setTimeout(() => fn.apply(this, arguments), debounceTime);
    };
  };

  render() {
    return (
      <Form
        name="search-movies"
        variant="outlined"
        style={{
          width: 938,
        }}
        autoComplete="off"
        onValuesChange={this.debounce(this.props.onValuesChange, 500)}
      >
        <Form.Item
          name="movie"
          rules={[
            {
              required: true,
              message: 'Please enter the name of the movie!',
            },
          ]}
        >
          <Input className="search" placeholder="Type to search..." autoFocus />
        </Form.Item>
      </Form>
    );
  }
}
