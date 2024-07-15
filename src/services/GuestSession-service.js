export default class GuestSessionService {
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

  async createGuestSession() {
    const res = await this.getResource('/3/authentication/guest_session/new');
    return this.transformData(res);
  }

  transformData = (data) => {
    return {
      success: data.success,
      guestSessionId: data.guest_session_id,
      expiresAt: data.expires_at,
    };
  };
}
