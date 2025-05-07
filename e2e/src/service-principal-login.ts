import { ConfidentialClientApplication } from '@azure/msal-node';
import { writeFileSync } from 'fs';
import { sessionPath } from './constants';
import path from 'path';
import { SecretClient } from "@azure/keyvault-secrets";
import { InteractiveBrowserCredential } from "@azure/identity";
import { tryGetEnviromentVariable } from './utils';

const keyVaultUri = tryGetEnviromentVariable('KEY_VAULT_URI') || "";

async function getSecret(secretName: string): Promise<string | undefined> {
  try {
    const latestSecret = await client.getSecret(secretName);
    return latestSecret.value || tryGetEnviromentVariable(secretName.replace('-', '_'));
  } catch (error) {
    console.error(`Error retrieving secret ${secretName} from Key Vault:`, error);
    return undefined;
  }
}

const msalConfig = {
  clientId: tryGetEnviromentVariable('MSAL_CLIENT_ID') || "",
  tenantId: tryGetEnviromentVariable('MSAL_TENANT_ID') || "",
  redirectUri: tryGetEnviromentVariable('REDIRECT_URI') || "http://localhost:4200"
};
// Configure the interactive browser credential with appropriate client ID and tenant ID
const credential = new InteractiveBrowserCredential(msalConfig);

const client = new SecretClient(keyVaultUri, credential, {
  disableChallengeResourceVerification: true
});

async function initializeMsalConfig() {
  const clientId = await getSecret('MSAL-CLIENT-ID');
  const authority = await getSecret('MSAL-AUTHORITY');
  const secret = await getSecret('MSAL-SECRET');

  if (!clientId || !authority || !secret) {
    throw new Error('Failed to retrieve MSAL configuration from Azure Key Vault.');
  }

  const config = {
    auth: {
      clientId: clientId,
      clientSecret: secret,
      authority: authority,
    },
  };
  return config;
}

export async function authenticateWithServicePrincipal() {
  let config;
  try {
    config = await initializeMsalConfig();
  } catch (error) {
    console.error('Failed to initialize MSAL config:', error);
    return;
  }

  const cca = new ConfidentialClientApplication(config);

  const tokenRequest = {
    scopes: [
      'https://graph.microsoft.com/.default',
    ],
  };

  try {
    const response = await cca.acquireTokenByClientCredential(tokenRequest);
    console.log('Access Token:', response?.accessToken);

    const sessionStorageState = JSON.stringify({
      'msal.idtoken': response?.idToken,
      'msal.accesstoken': response?.accessToken,
    });

    const currentPath = process.cwd();
    const fullSessionPath = path.join(currentPath, sessionPath);
    console.log('Full Session Path:', fullSessionPath);

    writeFileSync(fullSessionPath, sessionStorageState);
    console.log('MSAL sessionStorage state saved.');

  } catch (error) {
    console.error('Error acquiring token:', error);
  }
}
