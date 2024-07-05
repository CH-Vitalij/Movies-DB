import { Component } from 'react';
import { List, Typography, Layout, Image, Tooltip, Spin, Alert, Button, Popover, Modal } from 'antd';
import { format } from 'date-fns';

import NetworkState from '../NetworkState';
import MoviesService from '../../services/Movies-service';
import './Frames.css';

export default class Frames extends Component {
  state = {
    items: [],
    loading: true,
    error: false,
    errorDetail: '',
    truncated: [],
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

  componentDidMount() {
    const movie = new MoviesService();

    movie
      .getMovies('the way back')
      .then((result) => {
        const truncated = result.map((item) => this.isTextTruncated(item.overview, 175));
        this.setState({ loading: false, items: result, truncated });
      })
      .catch(this.onError);
  }

  render() {
    const { items, loading, error, errorDetail, truncated } = this.state;
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
    const spinner = loading ? <Spin size="large" fullscreen /> : null;
    const content = hasData ? (
      <FramesView items={items} truncated={truncated} onTruncateText={this.truncateText} />
    ) : null;

    return (
      <Layout className="box">
        <NetworkState>
          {errorMessage}
          {spinner}
          {content}
        </NetworkState>
      </Layout>
    );
  }
}

const FramesView = ({ items, truncated, onTruncateText }) => {
  const { Paragraph, Title } = Typography;

  return (
    <List
      className="movies-list"
      itemLayout="horizontal"
      dataSource={items}
      renderItem={(item, i) => {
        const truncatedText = onTruncateText(item.overview, 175);
        const isTruncated = truncated[i];
        const releaseDate = item.release_date ? format(new Date(item.release_date), 'MMMM d, yyyy') : '-';
        const pic = item.poster_path
          ? `https://image.tmdb.org/t/p/w500/${item.poster_path}`
          : 'https://avatars.mds.yandex.net/i?id=7750321ef5bc659110709a1f84465a7b1a208bb6-10143023-images-thumbs&n=13g';

        return (
          <List.Item key={item.id} className="movies-list__frame frame">
            <Image width={183} height={281} alt={item.title} src={pic} />
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
