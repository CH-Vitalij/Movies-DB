import { Component } from 'react';
import { Layout, Spin, Alert, Button, Popover, Modal, Empty, Tabs, Flex } from 'antd';

import FramesView from '../FramesView';
import SearchBar from '../SearchBar/SearchBar';
import NetworkState from '../NetworkState';
import MoviesService from '../../services/Movies-service';
import GuestSessionService from '../../services/GuestSession-service';
import './Frames.css';

export default class Frames extends Component {
  movie = new MoviesService();
  guestSession = new GuestSessionService();

  state = {
    items: [],
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
    name: '',
    ratedMovies: [],
  };

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

  DataRequest = (name, pageNum, emptyText) => {
    this.movie
      .getMovies(name, pageNum)
      .then((result) => {
        const { pageSearch, items, totalItemsSearch } = result;
        const truncated = items.map((item) => this.isTextTruncated(item.overview, 100));

        this.setState({ items, pageSearch, totalItemsSearch, truncated, name, loading: false });

        if (items.length === 0 && !emptyText) {
          this.setState({ empty: true, messageInfo: `No movie with the title "${name}" was found.` });
        }
      })
      .catch(this.onError);
  };

  handleDataRequest = (name) => {
    this.handleLoaded();

    if (name.movie !== '') {
      this.DataRequest(name.movie, 1, false);
    } else {
      this.DataRequest(name.movie, 1, true);
    }
  };

  handleLoaded = () => {
    this.setState({ loading: true, empty: false });
  };

  handleSetRating = (value, id) => {
    this.setState(({ items }) => ({
      items: items.map((el) => (el.id === id ? { ...el, rating: value } : el)),
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
      console.log(key, 'Click TabRated');
      this.handleLoaded();

      this.guestSession
        .getRatedMovies(this.guestSessionId)
        .then((result) => {
          console.log(result);
          const { pageRated, ratedMovies, totalItemsRated } = result;
          this.setState({ ratedMovies, pageRated, totalItemsRated, loading: false });
        })
        .catch(this.onError);
    }
  };

  render() {
    const {
      items,
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
      name,
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
      <FramesView
        items={items}
        page={pageSearch}
        totalItems={totalItemsSearch}
        truncated={truncated}
        name={name}
        onSetRating={this.handleSetRating}
        onTruncateText={this.truncateText}
        onDataRequest={this.DataRequest}
        onLoaded={this.handleLoaded}
      />
    ) : null;

    const ratedFrames = hasData ? (
      <FramesView
        items={ratedMovies}
        page={pageRated}
        totalItems={totalItemsRated}
        truncated={truncated}
        name={name}
        onTruncateText={this.truncateText}
        onDataRequest={this.DataRequest}
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
