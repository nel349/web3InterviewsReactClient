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

let BASE_URL = "https://auth.calendly.com/oauth/authorize?client_id=-rsdA8qUQlFFRUBfzeiagOq_kR2BSo2ml48nK4SIZhk&response_type=code&redirect_uri=https://localhost:3000/free/sample-video-page&code_challenge_method=S256&code_challenge=";


const CardActionsWrapper = styled(CardActions)(
  ({ theme }) => `
     background: ${theme.colors.alpha.black[5]};
     padding: ${theme.spacing(3)};
`
);

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

function ActivityTab() {


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
  const {access_token, refresh_token} = await CalendlyService.getAccessToken(authorizationCode);
  
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
  const {access_token, refresh_token} = await CalendlyService.getAccessTokenNative(authorizationCode);
  
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
  const {access_token, refresh_token} = await ZoomService.getAccessToken(authorizationCode);
  console.log('accesstoken and refresh token: ', access_token, refresh_token)
}

  return (
    <Card>
      <CardHeader
        avatar={<Avatar src="/static/images/avatars/5.jpg" />}
        action={
          <IconButton color="primary">
            <MoreHorizTwoToneIcon fontSize="medium" />
          </IconButton>
        }
        titleTypographyProps={{ variant: 'h4' }}
        subheaderTypographyProps={{ variant: 'subtitle2' }}
        title="Allison Lipshutz"
        subheader={
          <>
            Managing Partner,{' '}
            <Link href="#" underline="hover">
              #software
            </Link>
            ,{' '}
            <Link href="#" underline="hover">
              #managers
            </Link>
            , Google Inc.
          </>
        }
      />
      <Box px={3} pb={2}>
        <Typography variant="h4" fontWeight="normal">
          Welcome to organizing your remote office for maximum productivity.
        </Typography>
      </Box>
      <CardMedia
        sx={{ minHeight: 280 }}
        image="/static/images/placeholders/covers/6.jpg"
        title="Card Cover"
      />
      <Box p={3}>
        <Typography variant="h2" sx={{ pb: 1 }}>
          Organizing Your Remote Office for Maximum Productivity
        </Typography>
        <Typography variant="subtitle2">
          <Link href="#" underline="hover">
            example.com
          </Link>{' '}
          • 4 mins read
        </Typography>
      </Box>
      <Divider />
      <CardActionsWrapper
        sx={{
          display: { xs: 'block', md: 'flex' },
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Box>
          <Button startIcon={<ThumbUpAltTwoToneIcon />} variant="contained">
            Like
          </Button>
          <Button
            startIcon={<CommentTwoToneIcon />}
            variant="outlined"
            sx={{ mx: 2 }}
          >
            Comment
          </Button>
          <Button startIcon={<ShareTwoToneIcon />} variant="outlined" sx={{ mx: 2 }}>
            Share
          </Button>
          <Button variant="contained" onClick= {setupInterviewPrice} >
            Initialize
          </Button>

          <Button variant="contained" onClick= {isAuthorizedToSlot} >
            isAuthorizedToSlot?
          </Button>
          <Button variant="contained" onClick= {completeGrant} >
          CompleteGrant
          </Button>
          <Button variant="contained" onClick= {pullBackGrant} >
          PullBackGrant
          </Button>

          <Divider sx={{ pb: 1 }} />

          <Button variant="contained" onClick= {getAccessToken} >
          GetAccessToken
          </Button>

          <Button variant="contained" onClick= {getUserInfo} >
          getUserInfo
          </Button>

          <Button variant="contained" onClick= { getChallengeFromVerifier } >
          generate code verifier
          </Button>

          <Button variant="contained" onClick= { getAccessTokenNative } >
          getAccessTokenNative
          </Button>

          <Button variant="contained" onClick= { getUserEventTypes } >
          getUserEventTypes
          </Button>

          <Button variant="contained" onClick= { createSingleUseSchedulingLink } >
          createSingleUseSchedulingLink
          </Button>

          <Button href= { url } > New Authorized Page </Button>

          <Divider sx={{ pb: 1 }}/>
          <Button href= { zoomAuthUrl } > New ZOOM Authorization Page </Button>

          <Button variant="contained" onClick= { getZoomAccessToken } >
          Zoom access token
          </Button>

        </Box>
        <Box sx={{ mt: { xs: 2, md: 0 } }}>
          <Typography variant="subtitle2" component="span">
            <Text color="black">
              <b>485</b>
            </Text>{' '}
            reactions •{' '}
            <Text color="black">
              <b>63</b>
            </Text>{' '}
            comments
          </Typography>
        </Box>
      </CardActionsWrapper>
    </Card>
  );
}

export default ActivityTab;
