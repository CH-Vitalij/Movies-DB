import { Flex } from 'antd';
import { Component } from 'react';

import MoviesService from '../../services/Movies-service';
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
