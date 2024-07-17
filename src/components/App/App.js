import { Flex } from 'antd';
import { Component } from 'react';

import MoviesService from '../../services/Movies-service';
import Frames from '../Frames';
import { GenresProvider } from '../GenresContext';

export default class App extends Component {
  movie = new MoviesService();

  state = {
    genres: [],
  };

  componentDidMount() {
    this.movie.getGenres().then((genres) => this.setState({ genres }));
  }

  render() {
    return (
      <Flex justify="center">
        <GenresProvider value={this.state.genres}>
          <Frames />
        </GenresProvider>
      </Flex>
    );
  }
}
