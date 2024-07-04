import { Component } from 'react';
import { List, Typography, Layout, Image, Tooltip, Spin } from 'antd';
import { format } from 'date-fns';

import MoviesService from '../../services/Movies-service';
import './Frames.css';

export default class Frames extends Component {
  state = {
    items: [],
    loading: true,
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

  // truncateText = (text, maxLength) => {
  //   let len = text.split(' ')[0].length;
  //   if (this.isTextTruncated(text, maxLength)) {
  //     return (
  //       text.split(' ').reduce((acc, word) => {
  //         len += word.length;
  //         if (len <= maxLength) {
  //           acc = acc + ' ' + word;
  //           return acc;
  //         } else {
  //           return acc;
  //         }
  //       }) + ' ...'
  //     );
  //   } else {
  //     return text;
  //   }
  // };

  componentDidMount() {
    const movie = new MoviesService();

    movie
      .getMovies('the way back')
      .then((result) => {
        const truncated = result.map((item) => this.isTextTruncated(item.overview, 175));
        this.setState({ loading: false, items: result, truncated });
      })
      .catch((err) => this.setState(err));
  }

  render() {
    const { Paragraph, Title } = Typography;

    if (this.state.loading) {
      return <Spin />;
    }

    return (
      <List
        className="movies-list"
        itemLayout="horizontal"
        dataSource={this.state.items}
        renderItem={(item, i) => {
          const truncatedText = this.truncateText(item.overview, 175);
          const isTruncated = this.state.truncated[i];

          return (
            <List.Item key={item.id} className="movies-list__frame frame">
              <Image
                width={183}
                height={281}
                alt={item.title}
                src={`https://image.tmdb.org/t/p/w500/${item.poster_path}`}
              />
              <Layout style={{ width: '228px', backgroundColor: '#ffffff' }}>
                <Title level={5} className="frame__title">
                  {item.title}
                </Title>
                <div style={{ paddingBottom: '7px', color: '#827E7E' }}>
                  {format(new Date(item.release_date), 'MMMM d, yyyy')}
                </div>
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
  }
}
