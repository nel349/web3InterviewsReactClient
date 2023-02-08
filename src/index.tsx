import ReactDOM from 'react-dom';
import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter } from 'react-router-dom';

import 'nprogress/nprogress.css';
import App from 'src/App';
import { SidebarProvider } from 'src/contexts/SidebarContext';
import * as serviceWorker from 'src/serviceWorker';
import AuthenticationProvider from './content/applications/Users/settings/AuthenticationProvider';
import { CookiesProvider } from "react-cookie";
import MetaplexProvider from './content/applications/Users/settings/solana/metaplex/MetaplexProvider';

ReactDOM.render(
  <HelmetProvider>
    <SidebarProvider>
      <BrowserRouter>
        <AuthenticationProvider>
          <CookiesProvider>
          <MetaplexProvider>
            <App />
          </MetaplexProvider>
          </CookiesProvider>
        </AuthenticationProvider>
      </BrowserRouter>
    </SidebarProvider>
  </HelmetProvider>,
  document.getElementById('root')
);

serviceWorker.unregister();
