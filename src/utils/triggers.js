import get from 'lodash/get'
import includes from 'lodash/includes'

// To update this list used this command on banking konnector:
// $ cat src/publish/manifests.json | jq '[.[].slug]'
const bankingSlug = [
  'maif-nestor',
  'americanexpress',
  'arkea',
  'axabanque102',
  'banquecasino',
  'banquepopulaire',
  'barclays136',
  'bforbank97',
  'bnpparibas82',
  'bolden',
  'boursorama83',
  'bred',
  'caissedepargne1',
  'carrefour159',
  'casden173',
  'cetelem',
  'cic63',
  'comptenickel168',
  'caatlantica3',
  'creditcooperatif148',
  'cdngroup88',
  'creditmaritime',
  'cic45',
  'fortuneo84',
  'hellobank145',
  'hsbc119',
  'ingdirect95',
  'labanquepostale44',
  'lcl-linxo',
  'monabanq96',
  'cdngroup109',
  'societegenerale',
  'bankingconnectortest',
  'revolut',
  'n26',
  'sofinco',
  'oney',
  'bcp',
  'courtois',
  'kolb',
  'laydernier',
  'rhonealpes',
  'tarneaud',
  'transatlantique',
  'gan',
  'groupama',
  'maafvie',
  'moneoresto',
  'paypal',
  'yomoni',
  'wesave'
]

export const isBankTrigger = trigger =>
  includes(bankingSlug, get(trigger, 'message.konnector'))
