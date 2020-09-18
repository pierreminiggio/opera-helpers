const getMemoUrl = 'https://example.fr/memo/get' // GET
const updateMemoUrl = 'https://example.fr/memo/update' // POST
// ^ memo will be sent in "memo"

// Also GET requests
const passwordLoginUrl = 'https://example.fr/passwords/login?creds=someloginkey' // Complete login url w/ infos
const getPasswordsUrl = 'https://example.fr/passwords/get'
// ^ Will be sent :
// 'https://example.fr/passwords/get' // To pull all main folders
// 'https://example.fr/passwords/get?folder=1' // To pull infos, content & breadcrumbs from folder 1
// 'https://example.fr/passwords/get?file=1' // To pull file & parent folder & parent folder data ^