// Accès au jeu : comptes déclarés dans src/data/accounts.js, session mémorisée sur
// l'appareil et progression rangée par compte. La vérification se fait dans le
// navigateur : c'est un écran d'accès, pas une protection contre un visiteur averti.
(function (root) {
  const OPP = (root.OPP = root.OPP || {});
  // Préfixe « ppk. » : le jeu One Piece est servi depuis le même domaine et ne doit pas
  // partager ses sauvegardes avec celui-ci.
  const SESSION_KEY = 'ppk.session';

  function normalize(username) {
    return String(username || '').trim().toLowerCase();
  }

  function findAccount(username) {
    return OPP.accounts.find((account) => account.username === normalize(username)) || null;
  }

  async function hashPassword(username, password) {
    const data = new TextEncoder().encode(`opp:${normalize(username)}:${password}`);
    const digest = await root.crypto.subtle.digest('SHA-256', data);
    return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
  }

  // Renvoie l'identifiant du compte si le mot de passe est bon, sinon null.
  async function check(username, password) {
    const account = findAccount(username);
    if (!account || !password) return null;
    return (await hashPassword(account.username, password)) === account.passwordHash ? account.username : null;
  }

  function loadSession(storage) {
    try {
      const account = findAccount(storage.getItem(SESSION_KEY));
      return account ? account.username : null;
    } catch (error) {
      return null;
    }
  }

  function saveSession(storage, username) {
    try {
      storage.setItem(SESSION_KEY, username);
    } catch (error) {
      // Sans stockage, il faudra se reconnecter à la prochaine visite.
    }
  }

  function clearSession(storage) {
    try {
      storage.removeItem(SESSION_KEY);
    } catch (error) {
      // Rien à effacer.
    }
  }

  // Stockage de la progression d'un compte : mêmes clés, préfixées par l'identifiant.
  function playerStorage(storage, username) {
    const prefix = `ppk.player.${normalize(username)}.`;
    return {
      getItem: (key) => storage.getItem(prefix + key),
      setItem: (key, value) => storage.setItem(prefix + key, value),
      removeItem: (key) => storage.removeItem(prefix + key),
    };
  }

  OPP.Auth = { check, hashPassword, loadSession, saveSession, clearSession, playerStorage };
})(globalThis);
