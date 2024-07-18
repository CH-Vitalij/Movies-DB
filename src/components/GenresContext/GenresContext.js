import React from 'react';

import MoviesService from '../../services/Movies-service';

const GenresContext = React.createContext();

export class GenresProvider extends React.Component {
  state = {
    genres: [],
  };

  componentDidMount() {
    const movie = new MoviesService();
    movie.getGenres().then((genres) => this.setState({ genres }));
  }

  render() {
    return <GenresContext.Provider value={this.state.genres}>{this.props.children}</GenresContext.Provider>;
  }
}

export const GenresConsumer = GenresContext.Consumer;
