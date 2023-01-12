import axios, { AxiosInstance, AxiosResponse } from 'axios';
// import { findByAccessToken, update } from '../models/userModel';

const {
  CALENDLY_AUTH_BASE_URL,
  CALENDLY_API_BASE_URL,
  CLIENT_SECRET,
  CLIENT_ID,
} = process.env;

class CalendlyService {
  accessToken: any;
   
  refreshToken: any;
   
  request: AxiosInstance;

  // requestInterceptor: any;
  constructor(accessToken: any, refreshToken: any) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.request = axios.create({
      baseURL: CALENDLY_API_BASE_URL,
    });
  }

  static async getAccessToken(authorizationToken: string): Promise<any> {

    var options = {
      method: 'POST',
      url: 'https://auth.calendly.com/oauth/token',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        // Authorization: 'Basic LXJzZEE4cVVRbEZGUlVCZnplaWFnT3Ffa1IyQlNvMm1sNDhuSzRTSVpoazo='
      },
      data: {
        "grant_type": "authorization_code",
        "code": authorizationToken,
        "redirect_uri": "https://localhost:3000/free/sample-video-page"
      },
      auth: {
        username: '-rsdA8qUQlFFRUBfzeiagOq_kR2BSo2ml48nK4SIZhk',
        password: '8PvZTtiVmE2XpoSqd49d8h5C6w2qaSiGL6px9zd9u9Y'
      }
    };
    
    let response: AxiosResponse<any, any>;
    try { 
      response = await axios.request(options);
    }catch(error) {
      console.error(error);
    };

    console.log(response?.data);

    const { access_token, refresh_token } = response.data;
    return { access_token, refresh_token };
  }

  static async getAccessTokenNative(authorizationToken: string): Promise<any> {

    var options = {
      method: 'POST',
      url: 'https://auth.calendly.com/oauth/token',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        // Authorization: 'Basic LXJzZEE4cVVRbEZGUlVCZnplaWFnT3Ffa1IyQlNvMm1sNDhuSzRTSVpoazo='
      },
      data: {
        "client_id": "-rsdA8qUQlFFRUBfzeiagOq_kR2BSo2ml48nK4SIZhk",
        "client_secret": "8PvZTtiVmE2XpoSqd49d8h5C6w2qaSiGL6px9zd9u9Y",
        "grant_type": "authorization_code",
        "code": authorizationToken,
        "redirect_uri": "https://localhost:3000/free/sample-video-page",
        "code_verifier": "CODE_CHALLENGE"
      }
    };
    
    let response: AxiosResponse<any, any>;
    try { 
      response = await axios.request(options);
    }catch(error) {
      console.error(error);
    };

    console.log(response?.data);

    const { access_token, refresh_token } = response.data;
    return { access_token, refresh_token };
  }


  // _onCalendlyError(arg0: (res: any) => any, _onCalendlyError: any): any {
  //   throw new Error('Method not implemented.');
  // }

  requestConfiguration() {
    return {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    };
  }

  getUserInfo = async () => {
    const options = {
      method: 'GET',
      url: 'https://api.calendly.com/users/me',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.accessToken}`
      }
    };

    let response: AxiosResponse<any, any>;
    try { 
      response = await axios.request(options);
    }catch(error) {
      console.error(error);
    };
    console.log('Current token: ', this.accessToken);

    const data = response.data.resource
    console.log("UserInfo: ", data);

    return data;
  };

  getCurrentUserId = async () => {

    const { uri } = await this.getUserInfo();
     
    //https://api.calendly.com/users/63848181-e703-486c-89c7-a1714bb6ad1b
    const result = String(uri).split('/users/')[1];
    return result;
  }

  // Get first in collection from event types in current profile
  getCurrentProfileOwnerUri = async (userUri: string) => {
    const { data: { collection } } = await this.getUserEventTypes(userUri);
    const { uri } = collection[0];
    return String(uri);
  }

  getUserEventTypes = async (userUri: string) => {

    var options = {
      method: 'GET',
      url: 'https://api.calendly.com/event_types',
      params: {
        active: 'true',
        user: `https://api.calendly.com/users/${userUri}`
      },
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.accessToken}`
      }
    };

    let response: AxiosResponse<any, any>;
    try { 
      response = await axios.request(options);
    }catch(error) {
      console.error(error);
    };
    console.log('Current token: ', this.accessToken);

    console.log("event_types: ", response);

    return response;
  };

  async createSingleUseSchedulingLink(ownerUri: string) {
    const options = {
      method: 'POST',
      url: 'https://api.calendly.com/scheduling_links',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.accessToken}`
      },
      data: {
        max_event_count: 1,
        owner: ownerUri,
        owner_type: 'EventType'
      }
    };

    let response: AxiosResponse<any, any>;
    try { 
      response = await axios.request(options);
    }catch(error) {
      console.error(error);
    };

    const { booking_url } = response.data.resource
    console.log("booking url: ", booking_url);
    return String(booking_url);
  }

  getUserEventType = async (uuid: any) => {
    const { data } = await this.request.get(
      `/event_types/${uuid}`,
      this.requestConfiguration()
    );

    return data;
  };

  getUserScheduledEvents = async (
    userUri: any,
    count: any,
    pageToken: any,
    status: any,
    maxStartTime: any,
    minStartTime: any
  ) => {
    let queryParams = [
      `user=${userUri}`,
      `count=${count || 10}`,
      `sort=start_time:asc`,
    ].join('&');

    if (pageToken) queryParams += `&page_token=${pageToken}`;
    if (status) queryParams += `&status=${status}`;
    if (maxStartTime) queryParams += `&max_start_time=${maxStartTime}`;
    if (minStartTime) queryParams += `&min_start_time=${minStartTime}`;

    const url = `/scheduled_events?${queryParams}`;

    const { data } = await this.request.get(url, this.requestConfiguration());

    return data;
  };

  getUserScheduledEvent = async (uuid: any) => {
    const { data } = await this.request.get(
      `/scheduled_events/${uuid}`,
      this.requestConfiguration()
    );

    return data;
  };

  getUserScheduledEventInvitees = async (uuid: any, count: any, pageToken: any) => {
    let queryParams = [`count=${count || 10}`].join('&');

    if (pageToken) queryParams += `&page_token=${pageToken}`;

    const url = `/scheduled_events/${uuid}/invitees?${queryParams}`;

    const { data } = await this.request.get(url, this.requestConfiguration());

    return data;
  };

  getUserEventTypeAvailTimes = async (eventUri: any, startTime: any, endTime: any) => {
    let queryParams = [
      `start_time=${startTime}`,
      `end_time=${endTime}`,
      `event_type=${eventUri}`,
    ].join('&');

    const url = `/event_type_available_times?${queryParams}`;

    const { data } = await this.request.get(url, this.requestConfiguration());
    
    return data;
  };

  markAsNoShow = async (uri: any) => {
    const { data } = await this.request.post(
      '/invitee_no_shows',
      {
        invitee: uri,
      },
      this.requestConfiguration()
    );

    return data;
  };

  undoNoShow = async (inviteeUuid: any) => {
    await this.request.delete(
      `/invitee_no_shows/${inviteeUuid}`,
      this.requestConfiguration()
    );
  };

  cancelEvent = async (uuid: any, reason: any) => {
    const { data } = await this.request.post(
      `/scheduled_events/${uuid}/cancellation`,
      {
        reason: reason,
      },
      this.requestConfiguration()
    );

    return data;
  };

  requestNewAccessToken = () => {
    return axios.post(`${CALENDLY_AUTH_BASE_URL}/oauth/token`, {
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: 'refresh_token',
      refresh_token: this.refreshToken,
    });
  };

  // _onCalendlyError = async (error) => {
  //   if (error.response.status !== 401) return Promise.reject(error);

  //   this.request.interceptors.response.eject(this.requestInterceptor);

  //   try {
  //     const response = await this.requestNewAccessToken();
  //     const { access_token, refresh_token } = response.data;

  //     const user = await findByAccessToken(this.accessToken);

  //     await update(user.id, {
  //       accessToken: access_token,
  //       refreshToken: refresh_token,
  //     });

  //     this.accessToken = access_token;
  //     this.refreshToken = refresh_token;

  //     error.response.config.headers.Authorization = `Bearer ${access_token}`;

  //     // retry original request with new access token
  //     return this.request(error.response.config);
  //   } catch (e) {
  //     return Promise.reject(e);
  //   }
  // };
}

export default CalendlyService;
