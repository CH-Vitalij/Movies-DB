export default class MoviesService {
  _apiBase = 'https://api.themoviedb.org';

  async getResource(url) {
    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${process.env.REACT_APP_API_TOKEN}`,
      },
    };

    const response = await fetch(`${this._apiBase}${url}`, options);

    if (!response.ok) {
      throw new Error(`Could not fetch ${this._apiBase}${url}, received ${response.status}`);
    }

    return await response.json();
  }

  async getMovies(title, pageNum = 1) {
    const res = await this.getResource(
      `/3/search/movie?query=${title}&include_adult=false&language=en-US&page=${pageNum}`,
    );
    return this.transformData(res);
  }

  async getGenres() {
    const res = await this.getResource('/3/genre/movie/list?language=en');
    return res;
  }

  transformData = (data) => {
    return {
      pageSearch: data.page,
      movies: data.results.map((movie) => ({ ...movie, rating: null })),
      totalMoviesSearch: data.total_results,
      totalPagesSearch: data.total_pages,
    };
  };
}
