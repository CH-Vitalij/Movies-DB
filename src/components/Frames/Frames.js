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
    totalItemsSearch: null,
    totalItemsRated: null,
    empty: false,
    messageInfo: '',
    loading: false,
    error: false,
    errorDetail: '',
    truncated: [],
    searchQuery: '',
    ratedMovies: [],
  };

  componentDidMount() {
    this.guestSessionId = '3c3ea2268d38f9a1053e6c1d7bc9c5d2';
  }

  // componentDidMount() {
  //   this.guestSession
  //     .createGuestSession()
  //     .then((result) => {
  //       const { guestSessionId } = result;
  //       console.log(guestSessionId);
  //       this.guestSessionId = guestSessionId;
  //     })
  //     .catch(this.onError);
  // }

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
    this.movie
      .getMovies(searchQuery, pageNum)
      .then((result) => {
        const { pageSearch, movies, totalItemsSearch } = result;
        const truncated = movies.map((movie) => this.isTextTruncated(movie.overview, 100));

        this.setState({ movies, pageSearch, totalItemsSearch, truncated, searchQuery, loading: false });

        if (movies.length === 0 && !emptyText) {
          this.setState({ empty: true, messageInfo: `No movie with the title "${searchQuery}" was found.` });
        }
      })
      .catch(this.onError);
  };

  handleDataRequest = (searchQuery) => {
    this.handleLoaded();

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
    this.setState(({ movies }) => ({
      movies: movies.map((movie) => (movie.id === id ? { ...movie, rating: value } : movie)),
    }));

    this.guestSession
      .rateMovie(this.guestSessionId, id, value)
      .then((result) => {
        console.log(result);
      })
      .catch(this.onError);
  };

  handleTabClick = (key) => {
    if (key === 'rated') {
      this.handleLoaded();

      this.handleRatedMoviesRequest(1);
    }
  };

  handleRatedMoviesRequest = (pageNum) => {
    this.guestSession
      .getRatedMovies(this.guestSessionId, pageNum)
      .then((result) => {
        console.log(result);
        const { pageRated, ratedMovies, totalItemsRated } = result;
        this.setState({ ratedMovies, pageRated, totalItemsRated, loading: false });
      })
      .catch(this.onError);
  };

  render() {
    const {
      movies,
      pageSearch,
      pageRated,
      totalItemsSearch,
      totalItemsRated,
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
        totalItems={totalItemsSearch}
        truncated={truncated}
        searchQuery={searchQuery}
        onSetRating={this.handleSetRating}
        onTruncateText={this.truncateText}
        onDataRequest={this.DataRequest}
        onLoaded={this.handleLoaded}
      />
    ) : null;

    const ratedFrames = hasData ? (
      <RatedTab
        items={ratedMovies}
        page={pageRated}
        totalItems={totalItemsRated}
        truncated={truncated}
        onTruncateText={this.truncateText}
        onRatedMoviesRequest={this.handleRatedMoviesRequest}
        onLoaded={this.handleLoaded}
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
