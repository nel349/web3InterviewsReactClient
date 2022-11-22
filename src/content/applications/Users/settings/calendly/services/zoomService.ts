import axios, { AxiosInstance, AxiosResponse } from 'axios';

const ZOOM_CLIENT_ID ='6Tq6y9QNS6KFrak48ktmdg'
const ZOOM_REDIRECT_URL = 'https://localhost:3000/free/sample-video-page'
const ZOOM_BASE_URL = 'https://zoom.us/oauth/authorize'

export const ZOOM_AUTHENTICATION_URL = `${ZOOM_BASE_URL}?response_type=code&client_id=${ZOOM_CLIENT_ID}&redirect_uri=${ZOOM_REDIRECT_URL}`;

class ZoomService {
  accessToken: any;
   
  refreshToken: any;
  
  constructor(accessToken: any, refreshToken: any) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }

  static async getAccessToken(authorizationToken: string): Promise<any> {

    var options = {
      method: 'GET',
      url: `http://localhost:8081/authorization/${authorizationToken}`
    };
    
    let response: AxiosResponse<any, any>;
    try { 
      response = await axios.request(options);
    }catch(error) {
      console.error(error);
    };

    console.log(response);
    return response?.data;
  }
}

export default ZoomService;
