import { MouseEventHandler, useRef, useState } from 'react';

import { NavLink } from 'react-router-dom';

import {
  Avatar,
  Box,
  Button,
  Divider,
  Hidden,
  lighten,
  List,
  ListItem,
  ListItemText,
  Popover,
  Typography
} from '@mui/material';

import InboxTwoToneIcon from '@mui/icons-material/InboxTwoTone';
import { styled } from '@mui/material/styles';
import ExpandMoreTwoToneIcon from '@mui/icons-material/ExpandMoreTwoTone';
import AccountBoxTwoToneIcon from '@mui/icons-material/AccountBoxTwoTone';
import LockOpenTwoToneIcon from '@mui/icons-material/LockOpenTwoTone';
import AccountTreeTwoToneIcon from '@mui/icons-material/AccountTreeTwoTone';
import { Web3Auth } from "@web3auth/modal";
import { CHAIN_NAMESPACES } from '@web3auth/base';
import React from 'react';
import { SolanaWallet } from "@web3auth/solana-provider";
import { Connection, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { useAuthenticationContext } from "../../../../content/applications/Users/settings/AuthenticationProvider";
import { PhantomAdapter } from "@web3auth/phantom-adapter";
import { AnchorProvider } from '@project-serum/anchor';
import { useCookies } from 'react-cookie';
import { MySolanaProvider, MySolanaWallet } from 'src/content/applications/Users/settings/solana/anchorClient';

const UserBoxButton = styled(Button)(
  ({ theme }) => `
        padding-left: ${theme.spacing(1)};
        padding-right: ${theme.spacing(1)};
`
);

const MenuUserBox = styled(Box)(
  ({ theme }) => `
        background: ${theme.colors.alpha.black[5]};
        padding: ${theme.spacing(2)};
`
);

const UserBoxText = styled(Box)(
  ({ theme }) => `
        text-align: left;
        padding-left: ${theme.spacing(1)};
`
);

const UserBoxLabel = styled(Typography)(
  ({ theme }) => `
        font-weight: ${theme.typography.fontWeightBold};
        color: ${theme.palette.secondary.main};
        display: block;
`
);

const UserBoxDescription = styled(Typography)(
  ({ theme }) => `
        color: ${lighten(theme.palette.secondary.main, 0.5)}
`
);

function HeaderUserbox() {
  const user = {
    name: 'Catherine Pike',
    avatar: '/static/images/avatars/1.jpg',
    jobtitle: 'Project Manager'
  };

  const ref = useRef<any>(null);
  const [isOpen, setOpen] = useState<boolean>(false);
  // const [isConnected, setConnected] = useState<boolean>(false);

  const handleOpen = (): void => {
    setOpen(true);
  };

  const handleClose = (): void => {
    setOpen(false);
  };

  return (
    <>
      <UserBoxButton color="secondary" ref={ref} onClick={handleOpen}>
        <Avatar variant="rounded" alt={user.name} src={user.avatar} />
        <Hidden mdDown>
          <UserBoxText>
            <UserBoxLabel variant="body1">{user.name}</UserBoxLabel>
            <UserBoxDescription variant="body2">
              {user.jobtitle}
            </UserBoxDescription>
          </UserBoxText>
        </Hidden>
        <Hidden smDown>
          <ExpandMoreTwoToneIcon sx={{ ml: 1 }} />
        </Hidden>
      </UserBoxButton>
      <Popover
        anchorEl={ref.current}
        onClose={handleClose}
        open={isOpen}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
      >
        <MenuUserBox sx={{ minWidth: 210 }} display="flex">
          <Avatar variant="rounded" alt={user.name} src={user.avatar} />
          <UserBoxText>
            <UserBoxLabel variant="body1">{user.name}</UserBoxLabel>
            <UserBoxDescription variant="body2">
              {user.jobtitle}
            </UserBoxDescription>
          </UserBoxText>
        </MenuUserBox>
        <Divider sx={{ mb: 0 }} />
        <List sx={{ p: 1 }} component="nav">
          <ListItem button to="/management/profile/details" component={NavLink}>
            <AccountBoxTwoToneIcon fontSize="small" />
            <ListItemText primary="My Profile" />
          </ListItem>
          <ListItem button to="/dashboards/messenger" component={NavLink}>
            <InboxTwoToneIcon fontSize="small" />
            <ListItemText primary="Messenger" />
          </ListItem>
          <ListItem
            button
            to="/free/sample-video-page"
            component={NavLink}
          >
            <AccountTreeTwoToneIcon fontSize="small" />
            <ListItemText primary="Account Settings" />
          </ListItem>
        </List>
        <Divider />
        <Box sx={{ m: 1 }}>
          <LoginControl handleClose={handleClose} />
        </Box>
      </Popover>
    </>
  );
}

function LoginControl(props: any) {

  const { signedIn, setSigned, setSolanaProvider } = useAuthenticationContext();
  // const [solanaWallet, setSolanaWallet] = useState<MySolanaWallet>();

  let web3auth = new Web3Auth({
    clientId: 'BGHqoKmB5d9bctZPsyd5TTwq3vpheZBr2HsdwLW3DscvmmtJ4xDbloOiNXzPRzDpoMvwfbVwEX9OREdL2I4i_q8',
    chainConfig: {
      chainNamespace: CHAIN_NAMESPACES.SOLANA,
      chainId: '0x3',
      rpcTarget: "https://api.devnet.solana.com", // This is the mainnet RPC we have added, please pass on your own endpoint while creating an app
      displayName: "solana",
      ticker: "SOL",
      tickerName: "solana",
    },
    uiConfig: {
      theme: 'dark',
      loginMethodsOrder: ['facebook', 'google'],
      appLogo: 'https://web3auth.io/images/w3a-L-Favicon-1.svg' // Your App Logo Here
    }
  });

  const web3AuthConnect = async () => {
    
    //http://127.0.0.1:8899 localnet
    // https://api.devnet.solana.com devnet

    const phantomAdapter = new PhantomAdapter({
      clientId: "BGHqoKmB5d9bctZPsyd5TTwq3vpheZBr2HsdwLW3DscvmmtJ4xDbloOiNXzPRzDpoMvwfbVwEX9OREdL2I4i_q8",
      sessionTime: 3600, // 1 hour in seconds
      chainConfig: {
        chainNamespace: CHAIN_NAMESPACES.SOLANA,
        chainId: '0x3', // Please use 0x1 for Mainnet, 0x2 for Testnet, 0x3 for Devnet
        rpcTarget: "https://api.devnet.solana.com", // This is the mainnet RPC we have added, please pass on your own endpoint while creating an app
        displayName: "solana",
        ticker: "SOL",
        tickerName: "solana",
        blockExplorer: ""
      },
    });
    web3auth.configureAdapter(phantomAdapter);

    await web3auth.initModal();
    const safeEmitter = await web3auth.connect();

    if (safeEmitter != null) {
      const solanaWallet = new SolanaWallet(web3auth.provider);

      if (solanaWallet != null) {
// 
        // Get user's Solana public address
        const accounts = await solanaWallet.requestAccounts();
        const connectionConfig: any = await solanaWallet.request({
          method: "solana_provider_config",
          params: [],
        });

        const connection = new Connection(connectionConfig.rpcTarget);
        const account1 = accounts[0];

        if (account1 != null && account1.length > 0) {
          setSigned(true);

          const mySolanaWallet = new MySolanaWallet(solanaWallet, connection);

          setSolanaProvider(new MySolanaProvider(connection, mySolanaWallet));
          console.log("IS connected, ", signedIn);
        }

        // Fetch the balance for the specified public key
        const balance = await connection.getBalance(new PublicKey(account1));
        console.log(`account1 = ${account1}`)
        console.log("balance: , ", balance / LAMPORTS_PER_SOL)
      }
    }
  }


  // const solanaWallet = new SolanaWallet(this.web3auth.provider);


  async function handleLoginClick() {
    props.handleClose();
    await web3AuthConnect();
  }

  async function handleLogoutClick() {
    props.handleClose();

    console.log(`Cached adapter: `, web3auth.cachedAdapter);
    console.log(`Cached adapter name: `, web3auth.connectedAdapterName);
    web3auth.clearCache();

    setSigned(false);
    setSolanaProvider(null);
    // setSolanaWallet(null);
  }

  let button: {};
  if (signedIn) {
    button = <LogoutButton onClick={handleLogoutClick} />;
  } else {
    button = <LoginButton onClick={handleLoginClick} />;
  }
  return (
    <>
      <div>
        {button}
      </div>
    </>

  );
}

function LoginButton(props: { onClick: MouseEventHandler<HTMLButtonElement>; }) {
  return (
    <Button color="primary" fullWidth onClick={props.onClick}>
      <LockOpenTwoToneIcon sx={{ mr: 1 }} />
      Login HE
    </Button>
  );
}

function LogoutButton(props: { onClick: MouseEventHandler<HTMLButtonElement>; }) {
  return (
    <Button color="primary" fullWidth onClick={props.onClick}>
      <LockOpenTwoToneIcon sx={{ mr: 1 }} />
      Logout
    </Button>
  );
}
export default HeaderUserbox;
