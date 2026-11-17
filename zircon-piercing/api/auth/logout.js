import { send, onlyMethods, handle } from '../_lib/http.js';
import { clearSession } from '../_lib/auth.js';

export default handle(async (req, res) => {
  if (!onlyMethods(req, res, ['POST'])) return;
  clearSession(res);
  send(res, 200, { ok: true });
});
