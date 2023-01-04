import {
  Box,
  CardMedia,
  Typography,
  Card,
  CardHeader,
  Divider,
  Avatar,
  IconButton,
  Button,
  CardActions,
  Link
} from '@mui/material';
import { styled } from '@mui/material/styles';

import MoreHorizTwoToneIcon from '@mui/icons-material/MoreHorizTwoTone';
import ThumbUpAltTwoToneIcon from '@mui/icons-material/ThumbUpAltTwoTone';
import CommentTwoToneIcon from '@mui/icons-material/CommentTwoTone';
import ShareTwoToneIcon from '@mui/icons-material/ShareTwoTone';
import Text from 'src/components/Text';
import AnchorClient from './solana/anchorClient';
import { useSearchParams } from "react-router-dom";
import CalendlyService from './calendly/services/calendlyService';
import { useState } from 'react';
import ZoomService from './calendly/services/zoomService';
import { ZOOM_AUTHENTICATION_URL } from './calendly/services/zoomService';



const CardActionsWrapper = styled(CardActions)(
  ({ theme }) => `
     background: ${theme.colors.alpha.black[5]};
     padding: ${theme.spacing(3)};
`
);



function ActivityTab() {


  // const [searchParams,] = useSearchParams();
  // const client = new AnchorClient();
  // let calendlyService: CalendlyService;
  // let zoomService: ZoomService;
  // const [url, setUrl] = useState(BASE_URL);
  // const [zoomAuthUrl, setZoomAuthUrl] = useState(ZOOM_AUTHENTICATION_URL);


// const setupInterviewPrice = async () => {
  
//   await client.initialize();
//   await client.initializeSafePaymentBy();
// }

// const isAuthorizedToSlot = async () => {
//   await client.isAuthorizedToSlot();
// }

// const completeGrant = async () => {

//   await client.completeGrant();
// }

// const pullBackGrant = async () => {
//   await client.pullBackFunds();
// }

// const getAccessToken = async () => {
  
//   const authorizationCode = searchParams.get("code");
//   const {access_token, refresh_token} = await CalendlyService.getAccessToken(authorizationCode);
  
//   console.log("authorizationCode: ", authorizationCode);

//   console.log("accessToken: ", access_token);
//   console.log("refresh_token: ", refresh_token);

//   calendlyService = new CalendlyService(access_token, refresh_token);
// }

// const getUserInfo = async () => {

//   const userInfo = await calendlyService.getUserInfo();

//   console.log("userInfo: ", userInfo);
// }

// const getChallengeFromVerifier = async () => {

//   const codeChallenge = await pkceChallengeFromVerifier("CODE_CHALLENGE");
//   // BASE_URL = `https://auth.calendly.com/oauth/authorize?client_id=-rsdA8qUQlFFRUBfzeiagOq_kR2BSo2ml48nK4SIZhk&response_type=code&redirect_uri=https://localhost:3000/free/sample-video-page&code_challenge_method=S256&code_challenge=${codeChallenge}`;

//   const urlWithChallenge = `${url}${codeChallenge}`;
//   setUrl(urlWithChallenge);
//   console.log("challenge: ", codeChallenge);
//   console.log("BASE_URL: ", urlWithChallenge);
// }

// const getAccessTokenNative = async () => {
//   const authorizationCode = searchParams.get("code");
//   const {access_token, refresh_token} = await CalendlyService.getAccessTokenNative(authorizationCode);
  
//   console.log("authorizationCode: ", authorizationCode);

//   console.log("accessToken: ", access_token);
//   console.log("refresh_token: ", refresh_token);

//   calendlyService = new CalendlyService(access_token, refresh_token);
// }

// const getUserEventTypes = async () => {

//   // user URI: "https://api.calendly.com/users/a0a67082-f8d4-46f9-b837-9e484c722871"

//   // organization URI: "https://api.calendly.com/organizations/3097f4c0-3519-4dde-8191-ddeabb0dacc2"
//   const eventTypes = await calendlyService.getUserEventTypes("a0a67082-f8d4-46f9-b837-9e484c722871");

//   console.log("getUserEventTypes: ", eventTypes)
// }

// const createSingleUseSchedulingLink = async () => {
//   const createSingleUseSchedulingLink = await calendlyService.createSingleUseSchedulingLink();

//   console.log("createSingleUseSchedulingLink: ", createSingleUseSchedulingLink)
// }

// const getZoomAccessToken = async () => {
//   const authorizationCode = searchParams.get("code");
//   console.log("authorizationCode: ", authorizationCode);
//   const {access_token, refresh_token} = await ZoomService.getAccessToken(authorizationCode);
//   console.log('accesstoken and refresh token: ', access_token, refresh_token)
// }

  return (
    <Card>
      <Box>
          

        </Box>
    </Card>
  );
}

export default ActivityTab;
