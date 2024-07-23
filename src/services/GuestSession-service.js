export default class GuestSessionService {
  _apiBase = 'https://api.themoviedb.org';

  async fetchResource(url, method = 'GET', body = null) {
    const options = {
      method,
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${process.env.REACT_APP_API_TOKEN}`,
      },
    };

    switch (method) {
      case 'POST':
        options.headers['Content-Type'] = 'application/json;charset=utf-8';
        options.body = JSON.stringify(body);
        break;
      case 'DELETE':
        options.headers['Content-Type'] = 'application/json;charset=utf-8';
    }

    const response = await fetch(`${this._apiBase}${url}`, options);

    if (!response.ok) {
      throw new Error(`Could not fetch ${this._apiBase}${url}, received ${response.status}`);
    }

    return await response.json();
  }

  async createGuestSession() {
    const res = await this.fetchResource('/3/authentication/guest_session/new');
    return this.transformDataNewSession(res);
  }

  async setRatingMovie(guestSessionId, movieId, rating) {
    const res = await this.fetchResource(`/3/movie/${movieId}/rating?guest_session_id=${guestSessionId}`, 'POST', {
      value: rating,
    });
    return this.transformDataGrade(res);
  }

  async resetRatingMovie(guestSessionId, movieId) {
    const res = await this.fetchResource(`/3/movie/${movieId}/rating?guest_session_id=${guestSessionId}`, 'DELETE');
    return this.transformDataGrade(res);
  }

  async getRatedMovies(guestSessionId, pageNum) {
    const res = await this.fetchResource(
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
