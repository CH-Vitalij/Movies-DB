export default class GuestSessionService {
  _apiBase = 'https://api.themoviedb.org';

  async getResource(url) {
    const options = {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${process.env.REACT_APP_API_TOKEN}`,
      },
    };

    const response = await fetch(`${this._apiBase}${url}`, options);

    if (!response.ok) {
      throw new Error(`Could not fetch ${this._apiBase}${url}, received ${response.status}`);
    }

    return await response.json();
  }

  async postResource(url, rating) {
    const options = {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json;charset=utf-8',
        Authorization: `Bearer ${process.env.REACT_APP_API_TOKEN}`,
      },
      body: JSON.stringify({ value: rating }),
    };

    const response = await fetch(`${this._apiBase}${url}`, options);

    if (!response.ok) {
      throw new Error(`Could not fetch ${this._apiBase}${url}, received ${response.status}`);
    }

    return await response.json();
  }

  async createGuestSession() {
    const res = await this.getResource('/3/authentication/guest_session/new');
    return this.transformDataNewSession(res);
  }

  async rateMovie(guestSessionId, movieId, rating) {
    const res = await this.postResource(`/3/movie/${movieId}/rating?guest_session_id=${guestSessionId}`, rating);
    return this.transformDataGrade(res);
  }

  async getRatedMovies(guestSessionId, pageNum) {
    const res = await this.getResource(
      `/3/guest_session/${guestSessionId}/rated/movies?language=en-US&page=${pageNum}&sort_by=created_at.asc`,
    );
    return this.transformData(res);
  }

  transformDataNewSession = (data) => {
    return {
      success: data.success,
      guestSessionId: data.guest_session_id,
      expiresAt: data.expires_at,
    };
  };

  transformDataGrade = (data) => {
    return {
      statusCode: data.status_code,
      statusMessage: data.status_message,
      success: data.success,
    };
  };

  transformData = (data) => {
    return {
      pageRated: data.page,
      ratedMovies: data.results,
      totalMoviesRated: data.total_results,
      totalPagesRated: data.total_pages,
    };
  };
}
