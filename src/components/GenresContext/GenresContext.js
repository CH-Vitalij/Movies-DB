import { createContext, Component } from 'react';

import MoviesService from '../../services/Movies-service';

const GenresContext = createContext();

export class GenresProvider extends Component {
  state = {
    genres: [],
    loading: true,
  };

  componentDidMount() {
    const movie = new MoviesService();
    movie.getGenres().then((genres) => this.setState({ genres, loading: false }));
  }

  render() {
    const { genres } = this.state;
    const { children } = this.props;

    if (!this.state.loading) {
      return <GenresContext.Provider value={genres}>{children}</GenresContext.Provider>;
    }
  }
}

export const GenresConsumer = GenresContext.Consumer;
