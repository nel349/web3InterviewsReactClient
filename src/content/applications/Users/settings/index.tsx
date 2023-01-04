import { useState, ChangeEvent } from 'react';
import { Helmet } from 'react-helmet-async';
import { Container, Tabs, Tab, Grid, Button, Divider } from '@mui/material';
import { styled } from '@mui/material/styles';
import CalendlyService from './calendly/services/calendlyService';
import ZoomService, { ZOOM_AUTHENTICATION_URL } from './calendly/services/zoomService';
import { useSearchParams } from 'react-router-dom';
import AnchorClient from './solana/anchorClient';
import CountProvider from './CountProvider';
import { ComponentCount } from './ComponentCount';
import { AnotherComponentCount } from './AnotherComponentCount';

let BASE_URL = "https://auth.calendly.com/oauth/authorize?client_id=-rsdA8qUQlFFRUBfzeiagOq_kR2BSo2ml48nK4SIZhk&response_type=code&redirect_uri=https://localhost:3000/free/sample-video-page&code_challenge_method=S256&code_challenge=";

function ManagementUserSettings() {

  // Base64-urlencodes the input string
  function base64urlencode(str) {
    // Convert the ArrayBuffer to string using Uint8 array to conver to what btoa accepts.
    // btoa accepts chars only within ascii 0-255 and base64 encodes them.
    // Then convert the base64 encoded to base64url encoded
    //   (replace + with -, replace / with _, trim trailing =)
    return btoa(String.fromCharCode.apply(null, new Uint8Array(str)))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }


  // Calculate the SHA256 hash of the input text. 
  // Returns a promise that resolves to an ArrayBuffer
  function sha256(plain) {
    const encoder = new TextEncoder();
    const data = encoder.encode(plain);
    return window.crypto.subtle.digest('SHA-256', data);
  }

  // Return the base64-urlencoded sha256 hash for the PKCE challenge
  async function pkceChallengeFromVerifier(v) {
    const hashed = await sha256(v);
    return base64urlencode(hashed);
  }

  const [currentTab, setCurrentTab] = useState<string>('activity');

  const tabs = [
    { value: 'activity', label: 'Activity' },
    { value: 'edit_profile', label: 'Edit Profile' },
    { value: 'notifications', label: 'Notifications' },
    { value: 'security', label: 'Passwords/Security' }
  ];

  const handleTabsChange = (event: ChangeEvent<{}>, value: string): void => {
    setCurrentTab(value);
  };

  const [searchParams,] = useSearchParams();
  const client = new AnchorClient();
  let calendlyService: CalendlyService;
  let zoomService: ZoomService;
  const [url, setUrl] = useState(BASE_URL);
  const [zoomAuthUrl, setZoomAuthUrl] = useState(ZOOM_AUTHENTICATION_URL);


  const setupInterviewPrice = async () => {

    await client.initialize();
    await client.initializeSafePaymentBy();
  }

  const isAuthorizedToSlot = async () => {
    await client.isAuthorizedToSlot();
  }

  const completeGrant = async () => {

    await client.completeGrant();
  }

  const pullBackGrant = async () => {
    await client.pullBackFunds();
  }

  const getAccessToken = async () => {

    const authorizationCode = searchParams.get("code");
    const { access_token, refresh_token } = await CalendlyService.getAccessToken(authorizationCode);

    console.log("authorizationCode: ", authorizationCode);

    console.log("accessToken: ", access_token);
    console.log("refresh_token: ", refresh_token);

    calendlyService = new CalendlyService(access_token, refresh_token);
  }

  const getUserInfo = async () => {

    const userInfo = await calendlyService.getUserInfo();

    console.log("userInfo: ", userInfo);
  }

  const getChallengeFromVerifier = async () => {

    const codeChallenge = await pkceChallengeFromVerifier("CODE_CHALLENGE");
    // BASE_URL = `https://auth.calendly.com/oauth/authorize?client_id=-rsdA8qUQlFFRUBfzeiagOq_kR2BSo2ml48nK4SIZhk&response_type=code&redirect_uri=https://localhost:3000/free/sample-video-page&code_challenge_method=S256&code_challenge=${codeChallenge}`;

    const urlWithChallenge = `${url}${codeChallenge}`;
    setUrl(urlWithChallenge);
    console.log("challenge: ", codeChallenge);
    console.log("BASE_URL: ", urlWithChallenge);
  }

  const getAccessTokenNative = async () => {
    const authorizationCode = searchParams.get("code");
    const { access_token, refresh_token } = await CalendlyService.getAccessTokenNative(authorizationCode);

    console.log("authorizationCode: ", authorizationCode);

    console.log("accessToken: ", access_token);
    console.log("refresh_token: ", refresh_token);

    calendlyService = new CalendlyService(access_token, refresh_token);
  }

  const getUserEventTypes = async () => {

    // user URI: "https://api.calendly.com/users/a0a67082-f8d4-46f9-b837-9e484c722871"

    // organization URI: "https://api.calendly.com/organizations/3097f4c0-3519-4dde-8191-ddeabb0dacc2"
    const eventTypes = await calendlyService.getUserEventTypes("a0a67082-f8d4-46f9-b837-9e484c722871");

    console.log("getUserEventTypes: ", eventTypes)
  }

  const createSingleUseSchedulingLink = async () => {
    const createSingleUseSchedulingLink = await calendlyService.createSingleUseSchedulingLink();

    console.log("createSingleUseSchedulingLink: ", createSingleUseSchedulingLink)
  }

  const getZoomAccessToken = async () => {
    const authorizationCode = searchParams.get("code");
    console.log("authorizationCode: ", authorizationCode);
    const { access_token, refresh_token } = await ZoomService.getAccessToken(authorizationCode);
    console.log('accesstoken and refresh token: ', access_token, refresh_token)
  }

  return (
    <>
      <CountProvider>
        <Helmet>
          <title>User Settings - Applications</title>
        </Helmet>

        <Button variant="contained" onClick={setupInterviewPrice} >
          Initialize
        </Button>

        <Button variant="contained" onClick={isAuthorizedToSlot} >
          isAuthorizedToSlot?
        </Button>
        <Button variant="contained" onClick={completeGrant} >
          CompleteGrant
        </Button>
        <Button variant="contained" onClick={pullBackGrant} >
          PullBackGrant
        </Button>

        <Divider sx={{ pb: 1 }} />

        <Button variant="contained" onClick={getAccessToken} >
          GetAccessToken
        </Button>

        <Button variant="contained" onClick={getUserInfo} >
          getUserInfo
        </Button>

        <Button variant="contained" onClick={getChallengeFromVerifier} >
          generate code verifier
        </Button>

        <Button variant="contained" onClick={getAccessTokenNative} >
          getAccessTokenNative
        </Button>

        <Button variant="contained" onClick={getUserEventTypes} >
          getUserEventTypes
        </Button>

        <Button variant="contained" onClick={createSingleUseSchedulingLink} >
          createSingleUseSchedulingLink
        </Button>

        <Button href={url} > New Authorized Page </Button>

        <Divider sx={{ pb: 1 }} />
        <Button href={zoomAuthUrl} > New ZOOM Authorization Page </Button>

        <Button variant="contained" onClick={getZoomAccessToken} >
          Zoom access token
        </Button>


        <ComponentCount></ComponentCount>
        <AnotherComponentCount></AnotherComponentCount>
      </CountProvider>,

    </>
  );
}

export default ManagementUserSettings;
