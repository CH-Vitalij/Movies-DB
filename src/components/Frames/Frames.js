import MoviesService from "../../services/Movies-service";
import { Component } from "react";
import { List, Typography } from "antd";
import "./Frames.css";

export default class Frames extends Component {
  state = {
    items: [],
    isLoaded: false,
    truncated: false,
  };

  componentDidMount() {
    const movie = new MoviesService();

    movie
      .getMovies("the way back")
      .then((result) => this.setState({ isLoaded: true, items: result }))
      .catch((err) => this.setState(err));
  }

  render() {
    // console.log(this.state);
    return (
      <List
        className="movie-list"
        itemLayout="horizontal"
        dataSource={this.state.items}
        renderItem={(item) => (
          <List.Item className="movie-item">
            <img
              width={183}
              height={281}
              alt={item.title}
              src={`https://image.tmdb.org/t/p/w500/${item.poster_path}`}
            />
            <Typography.Paragraph
              className="overview"
              ellipsis={{
                rows: 6,
                expandable: true,
                symbol: "",
                tooltip: `${item.overview}`,
              }}
            >
              {item.overview}
            </Typography.Paragraph>
          </List.Item>
        )}
      />
    );
  }
}
