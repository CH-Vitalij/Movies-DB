import { Form, Input } from 'antd';
import { Component } from 'react';
import { debounce } from 'lodash';

import './SearchBar.css';

export default class SearchBar extends Component {
  render() {
    return (
      <Form
        name="search-movies"
        variant="outlined"
        autoComplete="off"
        onValuesChange={debounce(this.props.onValuesChange, 1000)}
      >
        <Form.Item
          name="movie"
          rules={[
            {
              required: true,
              message: 'Please enter the name of the movie',
            },
          ]}
        >
          <Input className="search" placeholder="Type to search..." autoFocus />
        </Form.Item>
      </Form>
    );
  }
}
