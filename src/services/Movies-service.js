export default class MoviesService {
  _apiBase = 'https://api.themoviedb.org';

  async getResource(url, title) {
    const options = {
      method: 'GET',
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${process.env.REACT_APP_API_TOKEN}`,
      },
    };

    const response = await fetch(
      `${this._apiBase}${url}?query=${title}&include_adult=false&language=en-US&page=1`,
      options,
    );

    if (!response.ok) {
      throw new Error(`Could not fetch, received ${response.status}`);
    }

    return await response.json();
  }

  async getMovies(title) {
    const res = await this.getResource('/3/search/movie', title);
    // console.log(res);
    return res.results.slice(0, 6);
  }
}
