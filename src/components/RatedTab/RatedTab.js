import { List, Typography, Layout, Image, Tooltip, Rate } from 'antd';
import { format } from 'date-fns';

import './RatedTab.css';

const RatedTab = ({
  items,
  page,
  totalItems,
  truncated,
  onSetRating,
  onTruncateText,
  onRatedMoviesRequest,
  onLoaded,
}) => {
  const { Paragraph, Title } = Typography;

  const getColor = (voteAverage) => {
    const average = +voteAverage.toFixed(1);
    if (average <= 3) return '#E90000';
    if (average <= 5) return '#E97E00';
    if (average <= 7) return '#E9D100';
    return '#66E900';
  };

  return (
    <List
      className="movies-list"
      itemLayout="horizontal"
      pagination={{
        onChange: (pageNum) => {
          onLoaded();
          onRatedMoviesRequest(pageNum);
        },
        defaultCurrent: '1',
        current: page,
        pageSize: 20,
        align: 'center',
        total: totalItems,
        hideOnSinglePage: true,
        showSizeChanger: false,
      }}
      dataSource={items}
      renderItem={(item, i) => {
        const truncatedText = item.overview ? onTruncateText(item.overview, 100) : '-';
        const isTruncated = truncated[i];
        const releaseDate = item.release_date ? format(new Date(item.release_date), 'MMMM d, yyyy') : '-';
        const pic = item.poster_path
          ? `https://image.tmdb.org/t/p/w500/${item.poster_path}`
          : 'https://avatars.mds.yandex.net/i?id=7750321ef5bc659110709a1f84465a7b1a208bb6-10143023-images-thumbs&n=13g';

        return (
          <List.Item key={item.id} className="movies-list__frame frame">
            <Image className="img" width={183} height={281} alt={item.title} src={pic} />
            <Layout style={{ width: '228px', backgroundColor: '#ffffff' }}>
              <div className="title">
                <Title level={5} className="frame__title">
                  {item.title}
                </Title>
                <div className="rating" style={{ borderColor: `${getColor(+item.vote_average.toFixed(1))}` }}>
                  <span className="rating__text">{item.vote_average.toFixed(1)}</span>
                </div>
              </div>
              <div style={{ marginBottom: '7px', color: '#827E7E' }}>{releaseDate}</div>
              <List
                className="genres-list"
                itemLayout="horizontal"
                dataSource={['Action', 'Drama']}
                renderItem={(item) => <List.Item className="genres-list__item">{item}</List.Item>}
              />
              <Tooltip title={isTruncated ? item.overview : null}>
                <Paragraph className="frame__overview">{truncatedText}</Paragraph>
              </Tooltip>
              <Rate
                allowHalf="true"
                count={10}
                className="rate"
                value={item.rating}
                onChange={(value) => onSetRating(value, item.id)}
              />
            </Layout>
          </List.Item>
        );
      }}
    />
  );
};

export default RatedTab;
