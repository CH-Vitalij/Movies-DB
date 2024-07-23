import { List, Typography, Layout, Image, Tooltip, Rate } from 'antd';
import { format } from 'date-fns';
import { Component } from 'react';

import { GenresConsumer } from '../GenresContext';
import ErrorMessage from '../ErrorMessage';

import './RatedTab.css';

export default class RatedTab extends Component {
  state = {
    hasError: false,
    errorDetail: '',
  };

  componentDidCatch(err) {
    this.setState({ hasError: true, errorDetail: err });
  }

  render() {
    const { Paragraph, Title } = Typography;
    const {
      movies,
      page,
      totalMovies,
      truncated,
      windowWidth,
      onTruncateText,
      onSetRating,
      onRatedMoviesRequest,
      onLoaded,
      onGetColor,
      onGetGenres,
    } = this.props;
    const { hasError, errorDetail } = this.state;

    if (hasError) {
      return <ErrorMessage errorDetail={errorDetail} />;
    }

    return (
      <List
        className="rated-tab__movies-list"
        itemLayout="horizontal"
        locale={{ emptyText: 'No Data' }}
        pagination={{
          onChange: (pageNum) => {
            onLoaded();
            onRatedMoviesRequest(pageNum);
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
          const truncatedText = movie.overview ? onTruncateText(movie.overview, 100) : '-';
          const isTruncated = truncated[i];
          const releaseDate = movie.release_date ? format(new Date(movie.release_date), 'MMMM d, yyyy') : '-';
          const pic = movie.poster_path
            ? `https://image.tmdb.org/t/p/w500/${movie.poster_path}`
            : 'https://avatars.mds.yandex.net/i?id=7750321ef5bc659110709a1f84465a7b1a208bb6-10143023-images-thumbs&n=13g';

          return (
            <GenresConsumer>
              {({ genres }) => {
                return (
                  <List.Item key={movie.id} className="rated-tab__frame frame">
                    {!windowWidth ? (
                      <Image className="frame__img" width={183} height={281} alt={movie.title} src={pic} />
                    ) : null}
                    <Layout className="frame__body">
                      <div className="frame__header">
                        {windowWidth ? (
                          <Image className="frame__img" width={60} height={91} alt={movie.title} src={pic} />
                        ) : null}
                        <div className="frame__header-collapse">
                          <Tooltip title={movie.title} destroyTooltipOnHide={true}>
                            <Title level={5} className="frame__title">
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
                        <div
                          className="frame__rating"
                          style={{ borderColor: `${onGetColor(+movie.vote_average.toFixed(1))}` }}
                        >
                          <span className="frame__rating-text">{movie.vote_average.toFixed(1)}</span>
                        </div>
                      </div>
                      <Tooltip title={isTruncated ? movie.overview : null}>
                        <Paragraph className="frame__overview">{truncatedText}</Paragraph>
                      </Tooltip>
                      <Rate
                        allowHalf={true}
                        count={10}
                        className="frame__rate"
                        value={movie.rating}
                        onChange={(value) => onSetRating(value, movie.id)}
                      />
                    </Layout>
                  </List.Item>
                );
              }}
            </GenresConsumer>
          );
        }}
      />
    );
  }
}
