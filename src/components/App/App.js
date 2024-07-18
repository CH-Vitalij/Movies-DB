import { Flex } from 'antd';
import { Component } from 'react';

import Frames from '../Frames';
import { GenresProvider } from '../GenresContext';

export default class App extends Component {
  render() {
    return (
      <Flex justify="center">
        <GenresProvider>
          <Frames />
        </GenresProvider>
      </Flex>
    );
  }
}
