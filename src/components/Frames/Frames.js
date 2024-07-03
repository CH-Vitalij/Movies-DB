import { Component } from 'react';
import { List, Typography, Layout, Image, DatePicker } from 'antd';
import { format } from 'date-fns';

import MoviesService from '../../services/Movies-service';
import './Frames.css';

export default class Frames extends Component {
  state = {
    items: [],
    isLoaded: false,
    truncated: false,
  };

  componentDidMount() {
    const movie = new MoviesService();

    movie
      .getMovies('the way back')
      .then((result) => this.setState({ isLoaded: true, items: result }))
      .catch((err) => this.setState(err));
  }

  render() {
    // console.log(this.state);
    const { Paragraph, Title } = Typography;

    return (
      <List
        className="movies-list"
        itemLayout="horizontal"
        dataSource={this.state.items}
        renderItem={(item) => (
          <List.Item className="movies-list__frame frame">
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
              <div style={{ paddingBottom: '7px' }}>{format(new Date(item.release_date), 'MMMM d, yyyy')}</div>
              <List
                className="genres-list"
                itemLayout="horizontal"
                dataSource={['Drama']}
                renderItem={(item) => <List.Item className="genres-list__item">{item}</List.Item>}
              />
              <Paragraph
                className="frame__overview"
                ellipsis={{
                  rows: 6,
                  expandable: true,
                  symbol: '',
                  tooltip: `${item.overview}`,
                }}
              >
                {item.overview}
              </Paragraph>
            </Layout>
          </List.Item>
        )}
      />
    );
  }
}
