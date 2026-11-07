import { APP_SWITCH_TIMEOUT_MS, WhatsappOrderSender } from './whatsapp-order.sender';

function setHidden(hidden: boolean) {
  Object.defineProperty(document, 'hidden', { configurable: true, get: () => hidden });
}

describe('WhatsappOrderSender', () => {
  const sender = new WhatsappOrderSender();

  beforeEach(() => {
    vi.useFakeTimers();
    setHidden(false);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('escritorio: window.open devuelve una pestaña → enviado', async () => {
    vi.spyOn(window, 'open').mockReturnValue({ opener: window } as unknown as Window);
    const result = await sender.send('hola');
    expect(result.opened).toBe(true);
    expect(result.url).toContain('https://wa.me/');
    expect(result.url).toContain('text=hola');
  });

  it('celular: window.open devuelve null pero se abre la app (página oculta) → enviado', async () => {
    vi.spyOn(window, 'open').mockReturnValue(null);
    const pending = sender.send('hola');

    setHidden(true);
    document.dispatchEvent(new Event('visibilitychange'));

    expect((await pending).opened).toBe(true);
  });

  it('bloqueo real: null y la página nunca se oculta → muestra el respaldo', async () => {
    vi.spyOn(window, 'open').mockReturnValue(null);
    const pending = sender.send('hola');

    await vi.advanceTimersByTimeAsync(APP_SWITCH_TIMEOUT_MS);

    expect((await pending).opened).toBe(false);
  });
});
