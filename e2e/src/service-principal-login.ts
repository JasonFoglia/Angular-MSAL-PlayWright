import { ConfidentialClientApplication, Configuration } from '@azure/msal-node';
import { writeFileSync } from 'fs';
import { sessionPath } from './constants';
import path from 'path';
import { SecretClient } from "@azure/keyvault-secrets";
import { InteractiveBrowserCredential, InteractiveBrowserCredentialNodeOptions } from "@azure/identity";
import { tryGetEnviromentVariable } from './utils';

// Helper function to get secrets, now takes SecretClient as a parameter
async function getSecret(secretClient: SecretClient, secretName: string): Promise<string | undefined> {
  try {
    const latestSecret = await secretClient.getSecret(secretName);
    // Fallback to environment variable if Key Vault secret value is empty
    // Assuming environment variable names match secret names with '-' replaced by '_' and uppercased
    const envVarName = secretName.replace(/-/g, '_').toUpperCase();
    return latestSecret.value || tryGetEnviromentVariable(envVarName);
  } catch (error) {
    console.error(`Error retrieving secret ${secretName} from Key Vault:`, error);
    // Fallback to environment variable on error
    const envVarName = secretName.replace(/-/g, '_').toUpperCase();
    const envVarValue = tryGetEnviromentVariable(envVarName);
    if (envVarValue) {
      console.warn(`Retrieved ${secretName} from environment variable after Key Vault access failed.`);
      return envVarValue;
    }
    return undefined;
  }
}

// Moved initialization logic into this internal function
async function initializeMsalConfig(): Promise<Configuration> {
  const keyVaultUri = tryGetEnviromentVariable('KEY_VAULT_URI');
  if (!keyVaultUri) {
    const errorMessage = 'KEY_VAULT_URI is not set. Please ensure it is defined in your e2e/.env file or environment variables.';
    console.error(errorMessage);
    throw new Error(errorMessage);
  }

  // Configuration for InteractiveBrowserCredential (to access Key Vault)
  const credentialClientId = tryGetEnviromentVariable('MSAL_CLIENT_ID');
  const credentialTenantId = tryGetEnviromentVariable('MSAL_TENANT_ID');
  const credentialRedirectUri = tryGetEnviromentVariable('REDIRECT_URI') || "http://localhost:4200";

  if (!credentialClientId) {
    throw new Error('MSAL_CLIENT_ID for Key Vault credential is not set.');
  }
  if (!credentialTenantId) {
    throw new Error('MSAL_TENANT_ID for Key Vault credential is not set.');
  }

  const interactiveBrowserCredentialOptions: InteractiveBrowserCredentialNodeOptions = {
    clientId: credentialClientId,
    tenantId: credentialTenantId,
    redirectUri: credentialRedirectUri,
  };

  const credential = new InteractiveBrowserCredential(interactiveBrowserCredentialOptions);
  const secretClient = new SecretClient(keyVaultUri, credential, {
    disableChallengeResourceVerification: true, // From original code
  });

  // Fetch application's MSAL configuration from Key Vault or environment variables
  const appClientId = await getSecret(secretClient, 'MSAL-CLIENT-ID');
  const appAuthority = await getSecret(secretClient, 'MSAL-AUTHORITY');
  const appClientSecret = await getSecret(secretClient, 'MSAL-SECRET');

  if (!appClientId || !appAuthority || !appClientSecret) {
    throw new Error('Failed to retrieve complete MSAL application configuration (clientId, authority, secret) from Azure Key Vault or environment variables.');
  }

  return {
    auth: {
      clientId: appClientId,
      clientSecret: appClientSecret,
      authority: appAuthority,
    },
  };
}

export async function authenticateWithServicePrincipal() {
  let msalNodeConfig: Configuration;
  try {
    msalNodeConfig = await initializeMsalConfig();
  } catch (error) {
    console.error('Failed to initialize MSAL config for ConfidentialClientApplication:', error);
    // Depending on desired behavior, you might want to re-throw or exit
    return;
  }

  const cca = new ConfidentialClientApplication(msalNodeConfig);

  const tokenRequest = {
    scopes: [
      'https://graph.microsoft.com/.default', // Or specific application scopes
    ],
  };

  try {
    const response = await cca.acquireTokenByClientCredential(tokenRequest);
    if (!response) {
      console.error('Token acquisition failed, response is null.');
      return;
    }
    // console.log('Access Token:', response.accessToken); // Be cautious logging tokens

    const sessionStorageState = JSON.stringify({
      // Ensure you are storing the correct tokens expected by your application
      // MSAL Browser typically uses idToken for user info and accessToken for resource access
      'msal.idtoken': response.idToken, // Check if idToken is present and needed
      'msal.accesstoken': response.accessToken, // This is likely the primary token needed
      // You might need to store other MSAL-specific keys that your app expects in sessionStorage
      // e.g., account info, authority, etc. Consult MSAL Browser docs for sessionStorage structure.
    });

    const currentPath = process.cwd();
    // Ensure sessionPath is correctly defined in './constants'
    // For example: export const sessionPath = '.state/session-storage.json';
    const fullSessionPath = path.join(currentPath, sessionPath);
    console.log('Saving MSAL session state to:', fullSessionPath);

    writeFileSync(fullSessionPath, sessionStorageState);
    console.log('MSAL sessionStorage state saved.');

  } catch (error) {
    console.error('Error acquiring token or saving session state:', error);
  }
}
