import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import TicketStatusActions from './TicketStatusActions';

const base = { ticketId: 1, creatorId: 10, assignedTo: 20, currentUserId: 20, currentUserRole: 'TECHNICIAN' as const, onUpdated: vi.fn() };

describe('dejanja pri zahtevku', () => {
  it('dodeljenemu tehniku omogoči začetek obravnave', () => {
    expect(renderToStaticMarkup(<TicketStatusActions {...base} status="OPEN" />)).toContain('Začni obravnavo');
  });
  it('drugemu tehniku ne omogoči začetka', () => {
    expect(renderToStaticMarkup(<TicketStatusActions {...base} currentUserId={21} status="OPEN" />)).toBe('');
  });
  it('dodeljenemu tehniku omogoči vnos rešitve', () => {
    expect(renderToStaticMarkup(<TicketStatusActions {...base} status="IN_PROGRESS" />)).toContain('Označi kot rešeno');
  });
  it('prijavitelju omogoči zaključek rešenega zahtevka', () => {
    expect(renderToStaticMarkup(<TicketStatusActions {...base} currentUserRole="EMPLOYEE" currentUserId={10} status="RESOLVED" />)).toContain('Zaključi zahtevek');
  });
  it('drugemu zaposlenemu ne omogoči zaključka', () => {
    expect(renderToStaticMarkup(<TicketStatusActions {...base} currentUserRole="EMPLOYEE" currentUserId={11} status="RESOLVED" />)).toBe('');
  });
  it('za zaključen zahtevek ne ponudi dejanj', () => {
    expect(renderToStaticMarkup(<TicketStatusActions {...base} status="CLOSED" />)).toBe('');
  });
});
