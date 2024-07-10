import { Component } from 'react';
import { List, Typography, Layout, Image, Tooltip, Spin, Alert, Button, Popover, Modal, Empty } from 'antd';
import { format } from 'date-fns';

import SearchBar from '../SearchBar/SearchBar';
import NetworkState from '../NetworkState';
import MoviesService from '../../services/Movies-service';
import './Frames.css';

export default class Frames extends Component {
  movie = new MoviesService();

  state = {
    items: [],
    page: 1,
    totalItems: 0,
    empty: false,
    messageInfo: '',
    loading: false,
    error: false,
    errorDetail: '',
    truncated: [],
    name: '',
  };

  isTextTruncated = (text, maxLength) => {
    return text.length >= maxLength;
  };

  truncateText = (text, maxLength) => {
    const arr = text.split(' ');
    let acc = '';
    let len = 0;
    if (this.isTextTruncated(text, maxLength)) {
      for (let word of arr) {
        len += word.length;
        if (len <= maxLength) {
          acc += ' ' + word;
          len += 1;
        } else {
          return (acc + ' ...').trim();
        }
      }
    } else {
      return text;
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
        const { page, items, totalItems } = result;
        const truncated = items.map((item) => this.isTextTruncated(item.overview, 175));

        this.setState({ items, page, totalItems, truncated, name, loading: false });

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

  render() {
    const { items, page, totalItems, loading, error, errorDetail, truncated, messageInfo, empty, name } = this.state;
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
        page={page}
        totalItems={totalItems}
        truncated={truncated}
        name={name}
        onTruncateText={this.truncateText}
        onDataRequest={this.DataRequest}
        onLoaded={this.handleLoaded}
      />
    ) : null;

    return (
      <Layout className="box">
        <NetworkState>
          {errorMessage}
          {searchBar}
          {empty ? <Empty description={messageInfo} /> : null}
          {spinner}
          {frames}
        </NetworkState>
      </Layout>
    );
  }
}

const FramesView = ({ items, page, totalItems, truncated, name, onTruncateText, onDataRequest, onLoaded }) => {
  const { Paragraph, Title } = Typography;

  return (
    <List
      className="movies-list"
      itemLayout="horizontal"
      pagination={{
        onChange: (pageNum) => {
          onLoaded();
          onDataRequest(name, pageNum, false);
        },
        defaultCurrent: '1',
        current: `${page}`,
        pageSize: 20,
        align: 'center',
        total: totalItems,
        hideOnSinglePage: true,
      }}
      dataSource={items}
      renderItem={(item, i) => {
        const truncatedText = item.overview ? onTruncateText(item.overview, 175) : '-';
        const isTruncated = truncated[i];
        const releaseDate = item.release_date ? format(new Date(item.release_date), 'MMMM d, yyyy') : '-';
        const pic = item.poster_path
          ? `https://image.tmdb.org/t/p/w500/${item.poster_path}`
          : 'https://avatars.mds.yandex.net/i?id=7750321ef5bc659110709a1f84465a7b1a208bb6-10143023-images-thumbs&n=13g';

        return (
          <List.Item key={item.id} className="movies-list__frame frame">
            <Image
              width={183}
              height={281}
              alt={item.title}
              src={pic}
              style={{
                backgroundColor: 'grey',
              }}
            />
            <Layout style={{ width: '228px', backgroundColor: '#ffffff' }}>
              <Title level={5} className="frame__title">
                {item.title}
              </Title>
              <div style={{ paddingBottom: '7px', color: '#827E7E' }}>{releaseDate}</div>
              <List
                className="genres-list"
                itemLayout="horizontal"
                dataSource={['Action', 'Drama']}
                renderItem={(item) => <List.Item className="genres-list__item">{item}</List.Item>}
              />
              <Tooltip title={isTruncated ? item.overview : null}>
                <Paragraph className="frame__overview">{truncatedText}</Paragraph>
              </Tooltip>
            </Layout>
          </List.Item>
        );
      }}
    />
  );
};
