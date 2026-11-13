const getMemoUrl = 'https://example.fr/memo/get' // GET
const updateMemoUrl = 'https://example.fr/memo/update' // POST
// ^ memo will be sent in "memo"

// Passwords : mdp API. Use the trailing slash (a redirect would turn the POST into a GET).
const passwordLoginUrl = 'https://example.fr/api/login/' // POST {login, password} -> {token}. No credentials here anymore
const passwordLogoutUrl = 'https://example.fr/api/logout/' // POST, revokes the token
const getPasswordsUrl = 'https://example.fr/api/show/'
// ^ Will be sent (GET, with "Authorization: Bearer <token>") :
// 'https://example.fr/api/show/' // To pull all main folders
// 'https://example.fr/api/show/?folder=1' // To pull infos, content & breadcrumbs from folder 1
// 'https://example.fr/api/show/?file=1' // To pull file & parent folder & parent folder data
