import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { AppProvider } from '../context/AppContext.js';
import { App } from '../App.js';

describe('Citizen Web Application (apps/web) Tests', () => {
  it('renders the application shell with header, main landmarks, and footer', () => {
    const html = renderToString(
      <AppProvider>
        <App />
      </AppProvider>
    );

    expect(html).toContain('VoterRule');
    expect(html).toContain('Every Eligible Voter. Every Right. Every Voice.');
    expect(html).toContain('id="main-content"');
    expect(html).toContain('class="tri"');
    expect(html.toLowerCase()).toContain('independent civic-assistance platform');
  });

  it('renders the 3-step verification path and services in the landing page', () => {
    const html = renderToString(
      <AppProvider>
        <App />
      </AppProvider>
    );

    expect(html).toContain('Check Registration');
    expect(html).toContain('Report Missing Name');
    expect(html).toContain('Check Possible Duplicate Registration');
    expect(html).toContain('The 3-Step Verification Path');
  });

  it('renders prominent Log In and Sign Up buttons in the header when unauthenticated', () => {
    const html = renderToString(
      <AppProvider>
        <App />
      </AppProvider>
    );

    expect(html).toContain('Log In');
    expect(html).toContain('Sign Up');
  });
});
