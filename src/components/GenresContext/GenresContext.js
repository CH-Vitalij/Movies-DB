import { createContext, Component } from 'react';

import MoviesService from '../../services/Movies-service';
import ErrorMessage from '../ErrorMessage';

const GenresContext = createContext();

export class GenresProvider extends Component {
  state = {
    genres: [],
    loading: false,
    error: false,
    errorDetail: '',
  };

  componentDidMount() {
    const movie = new MoviesService();
    this.setState({ loading: true });
    movie
      .getGenres()
      .then((genres) => this.setState({ genres, loading: false }))
      .catch((err) => {
        this.onError(err);
      });
  }

  onError = (err) => {
    this.setState({
      loading: false,
      error: true,
      errorDetail: err,
    });
  };

  render() {
    const { genres, error, loading, errorDetail } = this.state;
    const { children } = this.props;

    const errorMessage = error ? <ErrorMessage errorDetail={errorDetail} /> : null;
    const hasData = !(loading || error);

    return (
      <>
        {errorMessage}
        {hasData ? <GenresContext.Provider value={genres}>{children}</GenresContext.Provider> : null}
      </>
    );
  }
}

export const GenresConsumer = GenresContext.Consumer;
