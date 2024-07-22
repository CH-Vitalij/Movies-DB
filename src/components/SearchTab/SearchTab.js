import React, { Component } from 'react';
import { List, Typography, Layout, Image, Tooltip, Rate } from 'antd';
import { format } from 'date-fns';

import { GenresConsumer } from '../GenresContext';

export default class SearchTab extends Component {
  state = {
    windowWidth: false,
  };

  componentDidMount() {
    this.mediaQuery = window.matchMedia('(max-width: 992px)');
    this.mediaQuery.addEventListener('change', this.handleResize);
  }

  componentWillUnmount() {
    this.mediaQuery.removeEventListener('change', this.handleResize);
  }

  handleResize = () => {
    if (this.mediaQuery.matches) {
      this.setState({ windowWidth: true });
    } else {
      this.setState({ windowWidth: false });
    }
  };

  render() {
    const { Paragraph, Title } = Typography;
    const {
      movies,
      page,
      totalMovies,
      truncated,
      searchQuery,
      onSetRating,
      onTruncateText,
      onDataRequest,
      onLoaded,
      onGetColor,
      onGetGenres,
    } = this.props;

    return (
      <GenresConsumer>
        {({ genres }) => (
          <List
            className="movies-list"
            itemLayout="horizontal"
            locale={{ emptyText: ' ' }}
            pagination={{
              onChange: (pageNum) => {
                onLoaded();
                onDataRequest(searchQuery, pageNum, false);
              },
              defaultCurrent: '1',
              current: page,
              pageSize: 20,
              align: 'center',
              total: totalMovies,
              hideOnSinglePage: true,
              showSizeChanger: false,
            }}
            dataSource={movies}
            renderItem={(movie, i) => {
              const truncatedText = movie.overview ? onTruncateText(movie.overview, 150) : '-';
              const isTruncated = truncated[i];
              const releaseDate = movie.release_date
                ? format(new Date(movie.release_date), 'MMMM d, yyyy')
                : 'No release date given';
              const pic = movie.poster_path
                ? `https://image.tmdb.org/t/p/w500/${movie.poster_path}`
                : 'https://avatars.mds.yandex.net/i?id=7750321ef5bc659110709a1f84465a7b1a208bb6-10143023-images-thumbs&n=13';

              return (
                <List.Item key={movie.id} className="movies-list__frame frame">
                  {!this.state.windowWidth ? (
                    <Image className="img" width={183} height={281} alt={movie.title} src={pic} />
                  ) : null}
                  <Layout className="content__frame">
                    <div className="header">
                      {this.state.windowWidth ? (
                        <Image className="img" width={60} height={91} alt={movie.title} src={pic} />
                      ) : null}
                      <div className="header__collapse">
                        <Tooltip title={movie.title} destroyTooltipOnHide={true}>
                          <Title level={5} className="frame__header">
                            {movie.title}
                          </Title>
                        </Tooltip>
                        <div className="frame__release-date">{releaseDate}</div>
                        <List
                          className="frame__genres-list"
                          itemLayout="horizontal"
                          dataSource={movie.genre_ids.length > 0 ? movie.genre_ids : ['no-genre']}
                          renderItem={(genreId) => (
                            <List.Item key={genreId} className="frame__genres-list-item">
                              {onGetGenres(genres, genreId)}
                            </List.Item>
                          )}
                        />
                      </div>
                      <div className="rating" style={{ borderColor: `${onGetColor(+movie.vote_average.toFixed(1))}` }}>
                        <span className="rating__text">{movie.vote_average.toFixed(1)}</span>
                      </div>
                    </div>
                    <Tooltip title={isTruncated ? movie.overview : null}>
                      <Paragraph className="frame__overview">{truncatedText}</Paragraph>
                    </Tooltip>
                    <Rate
                      allowHalf={true}
                      count={10}
                      className="rate"
                      value={movie.rating}
                      onChange={(value) => onSetRating(value, movie.id)}
                    />
                  </Layout>
                </List.Item>
              );
            }}
          />
        )}
      </GenresConsumer>
    );
  }
}
