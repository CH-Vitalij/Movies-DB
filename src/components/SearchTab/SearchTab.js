import { List, Typography, Layout, Image, Tooltip, Rate } from 'antd';
import { format } from 'date-fns';

import './SearchTab.css';
import { GenresConsumer } from '../GenresContext';

const SearchTab = ({
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
}) => {
  const { Paragraph, Title } = Typography;

  const getGenres = (genres, genreId) => {
    const genre = genres.find((el) => el.id === genreId);
    return genre ? genre.name : 'Genre not specified';
  };

  return (
    <GenresConsumer>
      {({ genres }) => {
        return (
          <List
            className="movies-list"
            itemLayout="horizontal"
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
              const truncatedText = movie.overview ? onTruncateText(movie.overview, 100) : '-';
              const isTruncated = truncated[i];
              const releaseDate = movie.release_date
                ? format(new Date(movie.release_date), 'MMMM d, yyyy')
                : 'No release date given';
              const pic = movie.poster_path
                ? `https://image.tmdb.org/t/p/w500/${movie.poster_path}`
                : 'https://avatars.mds.yandex.net/i?id=7750321ef5bc659110709a1f84465a7b1a208bb6-10143023-images-thumbs&n=13g';

              return (
                <List.Item key={movie.id} className="movies-list__frame frame">
                  <Image className="img" width={183} height={281} alt={movie.title} src={pic} />
                  <Layout style={{ width: '228px', backgroundColor: '#ffffff' }}>
                    <div className="title">
                      <Title level={5} className="frame__title">
                        {movie.title}
                      </Title>
                      <div className="rating" style={{ borderColor: `${onGetColor(+movie.vote_average.toFixed(1))}` }}>
                        <span className="rating__text">{movie.vote_average.toFixed(1)}</span>
                      </div>
                    </div>
                    <div style={{ marginBottom: '7px', color: '#827E7E' }}>{releaseDate}</div>
                    <List
                      className="genres-list"
                      itemLayout="horizontal"
                      dataSource={movie.genre_ids.length > 0 ? movie.genre_ids : ['no-genre']}
                      renderItem={(genreId) => (
                        <List.Item key={movie.genre_ids} className="genres-list__item">
                          {getGenres(genres, genreId)}
                        </List.Item>
                      )}
                    />
                    <Tooltip title={isTruncated ? movie.overview : null}>
                      <Paragraph className="frame__overview">{truncatedText}</Paragraph>
                    </Tooltip>
                    <Rate
                      allowHalf="true"
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
        );
      }}
    </GenresConsumer>
  );
};

export default SearchTab;
