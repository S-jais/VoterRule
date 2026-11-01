import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ActionExecutor } from '../components/ai/ActionExecutor.js';

describe('ActionExecutor Controlled Navigation & Target Highlighting Tests', () => {
  let onNavigate: any;
  let executor: ActionExecutor;

  beforeEach(() => {
    vi.useFakeTimers();
    onNavigate = vi.fn();
    executor = new ActionExecutor({ onNavigate });

    // Mock document and window
    const targetElement = {
      classList: {
        add: vi.fn(),
        remove: vi.fn(),
        contains: vi.fn(),
      },
      setAttribute: vi.fn(),
      removeAttribute: vi.fn(),
      scrollIntoView: vi.fn(),
    };

    (global as any).document = {
      getElementById: vi.fn((id: string) => {
        if (id === 'existing-section') {
          return {
            scrollIntoView: vi.fn(),
          };
        }
        return null;
      }),
      querySelector: vi.fn((selector: string) => {
        if (selector === '[data-ai-target="home-check-btn"]') {
          return targetElement;
        }
        return null;
      }),
    };

    (global as any).window = {
      open: vi.fn(),
    };
  });

  afterEach(() => {
    vi.useRealTimers();
    delete (global as any).document;
    delete (global as any).window;
  });

  describe('navigate_to action', () => {
    it('navigates to allowlisted route IDs', () => {
      const res1 = executor.execute({
        type: 'navigate_to',
        payload: { routeId: 'check_voter_status' },
      });
      expect(res1.ok).toBe(true);
      expect(onNavigate).toHaveBeenCalledWith('/app/check');

      const res2 = executor.execute({
        type: 'navigate_to',
        payload: { routeId: 'missing_name_assistance' },
      });
      expect(res2.ok).toBe(true);
      expect(onNavigate).toHaveBeenCalledWith('/app/missing-name');

      const res3 = executor.execute({
        type: 'navigate_to',
        payload: { routeId: 'dashboard' },
      });
      expect(res3.ok).toBe(true);
      expect(onNavigate).toHaveBeenCalledWith('/app');
    });

    it('rejects unapproved or arbitrary route IDs', () => {
      const res = executor.execute({
        type: 'navigate_to',
        payload: { routeId: 'admin_backdoor_console' },
      });
      expect(res.ok).toBe(false);
      expect(res.reason).toContain('not an approved navigation target');
      expect(onNavigate).not.toHaveBeenCalled();
    });
  });

  describe('scroll_to_section action', () => {
    it('scrolls to existing DOM section ID', () => {
      const res = executor.execute({
        type: 'scroll_to_section',
        payload: { sectionId: 'existing-section' },
      });
      expect(res.ok).toBe(true);
      expect(document.getElementById).toHaveBeenCalledWith('existing-section');
    });

    it('returns error when section ID is not found in DOM', () => {
      const res = executor.execute({
        type: 'scroll_to_section',
        payload: { sectionId: 'non-existent-section' },
      });
      expect(res.ok).toBe(false);
      expect(res.reason).toContain('not found in DOM');
    });
  });

  describe('highlight_element action', () => {
    it('highlights element with data-ai-target and removes after duration', () => {
      const res = executor.execute({
        type: 'highlight_element',
        payload: { targetId: 'home-check-btn' },
      });
      expect(res.ok).toBe(true);

      const el = document.querySelector('[data-ai-target="home-check-btn"]') as any;
      expect(el.classList.add).toHaveBeenCalledWith('ai-target-highlighted');
      expect(el.setAttribute).toHaveBeenCalledWith('data-ai-highlighted', 'true');
      expect(el.scrollIntoView).toHaveBeenCalled();

      // Advance 4000ms timer
      vi.advanceTimersByTime(4000);
      expect(el.classList.remove).toHaveBeenCalledWith('ai-target-highlighted');
      expect(el.removeAttribute).toHaveBeenCalledWith('data-ai-highlighted');
    });

    it('returns error when target element is not found', () => {
      const res = executor.execute({
        type: 'highlight_element',
        payload: { targetId: 'ghost-target' },
      });
      expect(res.ok).toBe(false);
      expect(res.reason).toContain('not found');
    });
  });

  describe('open_official_source action', () => {
    it('allows opening official ECI and India Code domains in new tab', () => {
      const res1 = executor.execute({
        type: 'open_official_source',
        payload: { url: 'https://voters.eci.gov.in' },
      });
      expect(res1.ok).toBe(true);
      expect(window.open).toHaveBeenCalledWith('https://voters.eci.gov.in', '_blank', 'noopener,noreferrer');

      const res2 = executor.execute({
        type: 'open_official_source',
        payload: { url: 'https://www.indiacode.nic.in/handle/123456789/1362' },
      });
      expect(res2.ok).toBe(true);
      expect(window.open).toHaveBeenCalledWith('https://www.indiacode.nic.in/handle/123456789/1362', '_blank', 'noopener,noreferrer');
    });

    it('strictly rejects non-official or phishing URLs', () => {
      const res1 = executor.execute({
        type: 'open_official_source',
        payload: { url: 'https://fake-voter-portal.com/login' },
      });
      expect(res1.ok).toBe(false);
      expect(res1.reason).toContain('Only allowlisted official government domains');

      const res2 = executor.execute({
        type: 'open_official_source',
        payload: { url: 'javascript:alert(1)' },
      });
      expect(res2.ok).toBe(false);
      expect(res2.reason).toContain('Only allowlisted official government domains');
      expect(window.open).not.toHaveBeenCalled();
    });
  });

  describe('Invalid actions handling', () => {
    it('returns failure on missing or unsupported action type', () => {
      const res1 = executor.execute({} as any);
      expect(res1.ok).toBe(false);

      const res2 = executor.execute({ type: 'delete_entire_database', payload: {} });
      expect(res2.ok).toBe(false);
      expect(res2.reason).toContain('Unsupported action type');
    });
  });
});
