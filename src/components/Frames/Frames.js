import { Component } from 'react';
import { Layout, Spin, Alert, Button, Popover, Modal, Empty, Tabs, Flex } from 'antd';

import SearchTab from '../SearchTab';
import RatedTab from '../RatedTab';
import SearchBar from '../SearchBar/SearchBar';
import NetworkState from '../NetworkState';
import MoviesService from '../../services/Movies-service';
import GuestSessionService from '../../services/GuestSession-service';
import './Frames.css';

export default class Frames extends Component {
  movie = new MoviesService();
  guestSession = new GuestSessionService();

  state = {
    movies: [],
    pageSearch: null,
    pageRated: null,
    totalMoviesSearch: null,
    totalMoviesRated: null,
    totalPagesRated: null,
    totalPagesSearch: null,
    empty: false,
    messageInfo: '',
    loading: false,
    error: false,
    errorDetail: '',
    truncated: [],
    searchQuery: '',
    ratedMovies: [],
    savedMovies: [],
  };

  // componentDidMount() {
  //   this.guestSessionId = 'eef154bf5bee061ead6c0be83c1a8554';
  // }

  componentDidMount() {
    this.guestSession
      .createGuestSession()
      .then((result) => {
        const { guestSessionId } = result;
        console.log(guestSessionId);
        this.guestSessionId = guestSessionId;
      })
      .catch(this.onError);
  }

  isTextTruncated = (text, maxLength) => {
    return text.length > maxLength;
  };

  truncateText = (text, maxLength) => {
    if (!this.isTextTruncated(text, maxLength)) {
      return text;
    }

    const words = text.split(' ');
    let res = '';
    let currentLength = 0;

    for (let word of words) {
      currentLength += word.length;
      if (currentLength <= maxLength) {
        res += ' ' + word;
        currentLength += 1;
      } else {
        return (res + ' ...').trim();
      }
    }
  };

  onError = (err) => {
    this.setState({
      loading: false,
      error: true,
      errorDetail: err,
    });
  };

  DataRequest = (searchQuery, pageNum, emptyText) => {
    this.handleLoaded();

    this.movie.getMovies(searchQuery, pageNum).then((result) => {
      const { pageSearch, movies, totalMoviesSearch, totalPagesSearch } = result;
      const truncated = movies.map((movie) => this.isTextTruncated(movie.overview, 100));
      const searchResults = {
        pageSearch,
        totalMoviesSearch,
        totalPagesSearch,
        truncated,
        searchQuery,
        empty: movies.length === 0 && !emptyText,
        messageInfo: movies.length === 0 && !emptyText ? `No movie with the title "${searchQuery}" was found.` : '',
        loading: false,
      };

      const { savedMovies } = this.state;

      if (savedMovies.length !== 0) {
        console.log(true);
        console.log(savedMovies);
        const moviesWithRating = movies.map((movie) => {
          const ratedMovie = savedMovies.find((rm) => rm.id === movie.id);
          return ratedMovie ? { ...movie, rating: ratedMovie.rating } : movie;
        });

        this.setState({
          ...searchResults,
          movies: moviesWithRating,
        });
      } else {
        this.setState({
          ...searchResults,
          movies,
        });
      }
    });
  };

  handleDataRequest = (searchQuery) => {
    if (searchQuery.movie !== '') {
      this.DataRequest(searchQuery.movie, 1, false);
    } else {
      this.DataRequest(searchQuery.movie, 1, true);
    }
  };

  handleLoaded = () => {
    this.setState({ loading: true, empty: false });
  };

  handleSetRating = (value, id) => {
    console.log(value);
    this.setState(({ movies, savedMovies }) => {
      const updatedMovies = movies.map((movie) => (movie.id === id ? { ...movie, rating: value } : movie));

      const savedMovieIndex = savedMovies.findIndex((movie) => movie.id === id);
      let updatedSavedMovies;

      if (savedMovieIndex !== -1) {
        updatedSavedMovies = savedMovies.map((movie) => (movie.id === id ? { ...movie, rating: value } : movie));
      } else {
        const movieToSave = updatedMovies.find((movie) => movie.id === id);
        updatedSavedMovies = [...savedMovies, { ...movieToSave, rating: value }];
      }

      return {
        movies: updatedMovies,
        savedMovies: updatedSavedMovies,
      };
    });

    this.guestSession
      .rateMovie(this.guestSessionId, id, value)
      .then((result) => {
        console.log(result);
      })
      .catch(this.onError);
  };

  handleTabClick = (key) => {
    if (key === 'rated') {
      if (this.state.savedMovies.length !== 0) {
        this.handleRatedMoviesRequest(1);
      } else {
        this.setState({ messageInfo: 'No Data', empty: true });
      }
    } else if (key === 'search') {
      this.setState({ messageInfo: '', empty: false });
    }
  };

  handleRatedMoviesRequest = (pageNum) => {
    this.handleLoaded();
    this.guestSession
      .getRatedMovies(this.guestSessionId, pageNum)
      .then((result) => {
        const { pageRated, ratedMovies, totalMoviesRated, totalPagesRated } = result;
        this.setState({ ratedMovies, pageRated, totalMoviesRated, totalPagesRated, loading: false });
      })
      .catch(this.onError);
  };

  handleColor = (voteAverage) => {
    const average = +voteAverage.toFixed(1);
    if (average <= 3) return '#E90000';
    if (average <= 5) return '#E97E00';
    if (average <= 7) return '#E9D100';
    return '#66E900';
  };

  handleGenres = (genres, genreId) => {
    const genre = genres.find((el) => el.id === genreId);
    return genre ? genre.name : 'Genre not specified';
  };

  render() {
    const {
      movies,
      pageSearch,
      pageRated,
      totalMoviesSearch,
      totalMoviesRated,
      loading,
      error,
      errorDetail,
      truncated,
      messageInfo,
      empty,
      searchQuery,
      ratedMovies,
    } = this.state;
    const hasData = !(loading || error);

    const errorMessage = error ? (
      <Modal closable={false} footer={null} open={error}>
        <Alert
          message="Woops... Something went wrong, try again later"
          showIcon
          type="error"
          action={
            <Popover content={errorDetail.toString()}>
              <Button size="small" danger>
                Detail
              </Button>
            </Popover>
          }
        />
      </Modal>
    ) : null;

    const spinner = loading ? <Spin size="large" /> : null;

    const searchBar = <SearchBar onValuesChange={this.handleDataRequest} />;

    const frames = hasData ? (
      <SearchTab
        movies={movies}
        page={pageSearch}
        totalMovies={totalMoviesSearch}
        truncated={truncated}
        searchQuery={searchQuery}
        onSetRating={this.handleSetRating}
        onTruncateText={this.truncateText}
        onDataRequest={this.DataRequest}
        onLoaded={this.handleLoaded}
        onGetColor={this.handleColor}
        onGetGenres={this.handleGenres}
      />
    ) : null;

    const ratedFrames = hasData ? (
      <RatedTab
        movies={ratedMovies}
        page={pageRated}
        totalMovies={totalMoviesRated}
        truncated={truncated}
        onTruncateText={this.truncateText}
        onRatedMoviesRequest={this.handleRatedMoviesRequest}
        onLoaded={this.handleLoaded}
        onGetColor={this.handleColor}
        onGetGenres={this.handleGenres}
      />
    ) : null;

    const elements = [
      {
        key: 'search',
        label: 'Search',
        children: (
          <Flex vertical="true" align="center">
            {errorMessage}
            {searchBar}
            {empty ? <Empty description={messageInfo} /> : null}
            {spinner}
            {frames}
          </Flex>
        ),
      },
      {
        key: 'rated',
        label: 'Rated',
        children: (
          <Flex vertical="true" align="center">
            {errorMessage}
            {empty ? <Empty description={messageInfo} /> : null}
            {ratedFrames}
            {spinner}
          </Flex>
        ),
      },
    ];

    return (
      <Layout className="box">
        <NetworkState>
          <Tabs items={elements} centered onTabClick={(key) => this.handleTabClick(key)} />
        </NetworkState>
      </Layout>
    );
  }
}
