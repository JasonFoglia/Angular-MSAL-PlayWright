import { ConfidentialClientApplication } from '@azure/msal-node';
import { tryGetEnviromentVariable } from './utils';
import { writeFileSync } from 'fs';
import { sessionPath } from './constants';
import path from 'path';


const clientId = tryGetEnviromentVariable('MSAL_CLIENT_ID');
const authority = tryGetEnviromentVariable('MSAL_AUTHORITY');
const secret = tryGetEnviromentVariable('MSAL_SECRET');

const config = {
    auth: {
        clientId: clientId, // Replace with the appId from the service principal
        clientSecret: secret, // Replace with the password from the service principal
        authority: authority, // Replace with the tenant ID
    },
};

const cca = new ConfidentialClientApplication(config);

export async function authenticateWithServicePrincipal() {
    const tokenRequest = {
        scopes: [
            'https://graph.microsoft.com/.default',
            '/resource'
        ], // Replace with the required scopes
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

        // Use the token for further API calls or save it for Playwright session storage
    } catch (error) {
        console.error('Error acquiring token:', error);
    }
}
