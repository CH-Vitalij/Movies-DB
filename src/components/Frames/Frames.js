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
    wasRated: false,
    isActiveRatedTab: true,
    windowWidth: false,
  };

  // componentDidMount() {
  //   this.guestSessionId = 'c66ef3445dc80ddf71be55682ae2a50e';
  //   // this.DataRequest('The Chronicles of Narnia');
  // }

  componentDidMount() {
    this.guestSession
      .createGuestSession()
      .then((result) => {
        const { guestSessionId } = result;
        console.log(guestSessionId);
        this.guestSessionId = guestSessionId;
        this.mediaQuery = window.matchMedia('(max-width: 992px)');
        this.mediaQuery.addEventListener('change', this.handleResize);
        this.handleResize(this.mediaQuery);
      })
      .catch(this.onError);
  }

  handleResize = () => {
    if (this.mediaQuery.matches) {
      this.setState({ windowWidth: true });
    } else {
      this.setState({ windowWidth: false });
    }
  };

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
      const truncated = movies.map((movie) => this.isTextTruncated(movie.overview, 150));
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

      const { ratedMovies } = this.state;

      if (ratedMovies.length !== 0) {
        const moviesWithRating = movies.map((movie) => {
          const ratedMovie = ratedMovies.find((rm) => rm.id === movie.id);
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

  handleLoaded = (isActiveRatedTab = true) => {
    this.setState({ loading: true, empty: false, isActiveRatedTab });
  };

  handleSetRating = (rating, id) => {
    this.updateRatingMovies(rating, id);

    if (rating > 0) {
      this.handleLoaded(false);
      this.guestSession
        .setRatingMovie(this.guestSessionId, id, rating)
        .then((result) => {
          if (result.success) {
            this.setState({ wasRated: true, loading: false, isActiveRatedTab: true });
          }
        })
        .catch(this.onError);
    } else {
      this.handleLoaded(false);
      this.guestSession
        .resetRatingMovie(this.guestSessionId, id)
        .then((result) => {
          if (result.success) {
            this.setState({ loading: false, isActiveRatedTab: true }, () => {
              if (this.state.ratedMovies.length === 19) {
                this.handleRatedMoviesRequest(1);
              }
            });
          }
        })
        .catch(this.onError);
    }
  };

  updateRatingMovies = (rating, id) => {
    this.setState(({ movies, ratedMovies }) => {
      const updatedMovies = movies.map((movie) => (movie.id === id ? { ...movie, rating } : movie));

      const ratedMovieIndex = ratedMovies.findIndex((movie) => movie.id === id);
      let updatedRatedMovies;

      if (ratedMovieIndex !== -1) {
        updatedRatedMovies = ratedMovies
          .map((movie) => (movie.id === id ? { ...movie, rating } : movie))
          .filter((movie) => movie.rating > 0);
      } else {
        const movieToSave = updatedMovies.find((movie) => movie.id === id);
        updatedRatedMovies = [...ratedMovies, { ...movieToSave, rating }];
      }

      return {
        movies: updatedMovies,
        ratedMovies: updatedRatedMovies,
      };
    });
  };

  handleTabClick = (key) => {
    if (key === 'rated') {
      if (this.state.ratedMovies.length !== 0 && this.state.wasRated) {
        this.handleRatedMoviesRequest(1);
      }
    }
  };

  handleRatedMoviesRequest = (pageNum) => {
    this.handleLoaded();
    this.guestSession
      .getRatedMovies(this.guestSessionId, pageNum)
      .then((result) => {
        const { pageRated, ratedMovies, totalMoviesRated, totalPagesRated } = result;
        this.setState({ ratedMovies, pageRated, totalMoviesRated, totalPagesRated, loading: false, wasRated: false });
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
      isActiveRatedTab,
      windowWidth,
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
        windowWidth={windowWidth}
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
        windowWidth={windowWidth}
        onTruncateText={this.truncateText}
        onSetRating={this.handleSetRating}
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
        disabled: isActiveRatedTab ? false : true,
        children: (
          <Flex vertical="true" align="center">
            {errorMessage}
            {empty ? <Empty description={messageInfo} /> : null}
            {spinner}
            {ratedFrames}
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
