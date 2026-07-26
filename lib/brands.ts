export interface CompanyBrand {
  name: string
  domain: string
  logoUrl: string
  industry: string
}

export const RENOWNED_BRANDS: CompanyBrand[] = [
  // Top Pakistani Tech & IT Companies
  { name: 'Systems Limited', domain: 'systemsltd.com', logoUrl: 'https://logo.clearbit.com/systemsltd.com', industry: 'Technology & IT' },
  { name: 'NetSol Technologies', domain: 'netsoltech.com', logoUrl: 'https://logo.clearbit.com/netsoltech.com', industry: 'Technology & IT' },
  { name: 'DevSinc', domain: 'devsinc.com', logoUrl: 'https://logo.clearbit.com/devsinc.com', industry: 'Technology & IT' },
  { name: '10Pearls', domain: '10pearls.com', logoUrl: 'https://logo.clearbit.com/10pearls.com', industry: 'Technology & IT' },
  { name: 'VentureDive', domain: 'venturedive.com', logoUrl: 'https://logo.clearbit.com/venturedive.com', industry: 'Technology & IT' },
  { name: 'Arbisoft', domain: 'arbisoft.com', logoUrl: 'https://logo.clearbit.com/arbisoft.com', industry: 'Technology & IT' },
  { name: 'Contour Software', domain: 'contour-software.com', logoUrl: 'https://logo.clearbit.com/contour-software.com', industry: 'Technology & IT' },
  { name: 'Folio3', domain: 'folio3.com', logoUrl: 'https://logo.clearbit.com/folio3.com', industry: 'Technology & IT' },
  { name: 'Motive (KeepTruckin)', domain: 'gomotive.com', logoUrl: 'https://logo.clearbit.com/gomotive.com', industry: 'Technology & IT' },
  { name: 'Kured', domain: 'kured.co', logoUrl: 'https://logo.clearbit.com/kured.co', industry: 'Technology & IT' },
  { name: 'Confiz', domain: 'confiz.com', logoUrl: 'https://logo.clearbit.com/confiz.com', industry: 'Technology & IT' },
  { name: 'Sfeir', domain: 'sfeir.com', logoUrl: 'https://logo.clearbit.com/sfeir.com', industry: 'Technology & IT' },
  { name: 'Rolustech', domain: 'rolustech.com', logoUrl: 'https://logo.clearbit.com/rolustech.com', industry: 'Technology & IT' },
  { name: 'Xavor Corporation', domain: 'xavor.com', logoUrl: 'https://logo.clearbit.com/xavor.com', industry: 'Technology & IT' },
  { name: 'Netsol Cloud', domain: 'netsol.com', logoUrl: 'https://logo.clearbit.com/netsol.com', industry: 'Technology & IT' },

  // Telecom & Fintech
  { name: 'Jazz (PMCL)', domain: 'jazz.com.pk', logoUrl: 'https://logo.clearbit.com/jazz.com.pk', industry: 'Telecom & Media' },
  { name: 'Telenor Pakistan', domain: 'telenor.com.pk', logoUrl: 'https://logo.clearbit.com/telenor.com.pk', industry: 'Telecom & Media' },
  { name: 'Zong 4G (CMPak)', domain: 'zong.com.pk', logoUrl: 'https://logo.clearbit.com/zong.com.pk', industry: 'Telecom & Media' },
  { name: 'Ufone 4G', domain: 'ufone.com', logoUrl: 'https://logo.clearbit.com/ufone.com', industry: 'Telecom & Media' },
  { name: 'PTCL Group', domain: 'ptcl.com.pk', logoUrl: 'https://logo.clearbit.com/ptcl.com.pk', industry: 'Telecom & Media' },
  { name: 'Easypaisa', domain: 'easypaisa.com.pk', logoUrl: 'https://logo.clearbit.com/easypaisa.com.pk', industry: 'Finance & Banking' },
  { name: 'JazzCash', domain: 'jazzcash.com.pk', logoUrl: 'https://logo.clearbit.com/jazzcash.com.pk', industry: 'Finance & Banking' },
  { name: 'NayaPay', domain: 'nayapay.com', logoUrl: 'https://logo.clearbit.com/nayapay.com', industry: 'Finance & Banking' },
  { name: 'SadaPay', domain: 'sadapay.pk', logoUrl: 'https://logo.clearbit.com/sadapay.pk', industry: 'Finance & Banking' },

  // Banking & Financial Institutions
  { name: 'HBL (Habib Bank Limited)', domain: 'hbl.com', logoUrl: 'https://logo.clearbit.com/hbl.com', industry: 'Finance & Banking' },
  { name: 'Meezan Bank', domain: 'meezanbank.com', logoUrl: 'https://logo.clearbit.com/meezanbank.com', industry: 'Finance & Banking' },
  { name: 'UBL (United Bank Limited)', domain: 'ubldigital.com', logoUrl: 'https://logo.clearbit.com/ubldigital.com', industry: 'Finance & Banking' },
  { name: 'MCB Bank', domain: 'mcb.com.pk', logoUrl: 'https://logo.clearbit.com/mcb.com.pk', industry: 'Finance & Banking' },
  { name: 'Bank Alfalah', domain: 'bankalfalah.com', logoUrl: 'https://logo.clearbit.com/bankalfalah.com', industry: 'Finance & Banking' },
  { name: 'Faysal Bank', domain: 'faysalbank.com', logoUrl: 'https://logo.clearbit.com/faysalbank.com', industry: 'Finance & Banking' },
  { name: 'Allied Bank Limited (ABL)', domain: 'abl.com', logoUrl: 'https://logo.clearbit.com/abl.com', industry: 'Finance & Banking' },
  { name: 'Standard Chartered Pakistan', domain: 'sc.com/pk', logoUrl: 'https://logo.clearbit.com/sc.com', industry: 'Finance & Banking' },
  { name: 'BankIslami', domain: 'bankislami.com.pk', logoUrl: 'https://logo.clearbit.com/bankislami.com.pk', industry: 'Finance & Banking' },

  // E-Commerce & Mobility
  { name: 'Daraz Pakistan', domain: 'daraz.pk', logoUrl: 'https://logo.clearbit.com/daraz.pk', industry: 'Marketing & Sales' },
  { name: 'Foodpanda Pakistan', domain: 'foodpanda.pk', logoUrl: 'https://logo.clearbit.com/foodpanda.pk', industry: 'Marketing & Sales' },
  { name: 'Careem Pakistan', domain: 'careem.com', logoUrl: 'https://logo.clearbit.com/careem.com', industry: 'Technology & IT' },
  { name: 'InDrive Pakistan', domain: 'indrive.com', logoUrl: 'https://logo.clearbit.com/indrive.com', industry: 'Technology & IT' },
  { name: 'Bykea', domain: 'bykea.com', logoUrl: 'https://logo.clearbit.com/bykea.com', industry: 'Technology & IT' },
  { name: 'Krave Mart', domain: 'kravemart.com', logoUrl: 'https://logo.clearbit.com/kravemart.com', industry: 'Marketing & Sales' },
  { name: 'Cheetay', domain: 'cheetay.pk', logoUrl: 'https://logo.clearbit.com/cheetay.pk', industry: 'Marketing & Sales' },
  { name: 'PakWheels', domain: 'pakwheels.com', logoUrl: 'https://logo.clearbit.com/pakwheels.com', industry: 'Marketing & Sales' },
  { name: 'Zameen.com', domain: 'zameen.com', logoUrl: 'https://logo.clearbit.com/zameen.com', industry: 'Marketing & Sales' },

  // Conglomerates & FMCG
  { name: 'Engro Corporation', domain: 'engro.com', logoUrl: 'https://logo.clearbit.com/engro.com', industry: 'Engineering' },
  { name: 'Fauji Fertilizer Company (FFC)', domain: 'ffc.com.pk', logoUrl: 'https://logo.clearbit.com/ffc.com.pk', industry: 'Engineering' },
  { name: 'Unilever Pakistan', domain: 'unilever.pk', logoUrl: 'https://logo.clearbit.com/unilever.pk', industry: 'Marketing & Sales' },
  { name: 'Nestlé Pakistan', domain: 'nestle.pk', logoUrl: 'https://logo.clearbit.com/nestle.pk', industry: 'Marketing & Sales' },
  { name: 'PepsiCo Pakistan', domain: 'pepsico.com', logoUrl: 'https://logo.clearbit.com/pepsico.com', industry: 'Marketing & Sales' },
  { name: 'Coca-Cola Pakistan', domain: 'coca-cola.pk', logoUrl: 'https://logo.clearbit.com/coca-cola.com', industry: 'Marketing & Sales' },
  { name: 'Procter & Gamble (P&G)', domain: 'pg.com', logoUrl: 'https://logo.clearbit.com/pg.com', industry: 'Marketing & Sales' },
  { name: 'Reckitt Benckiser', domain: 'reckitt.com', logoUrl: 'https://logo.clearbit.com/reckitt.com', industry: 'Healthcare' },
  { name: 'Indus Motor Company (Toyota)', domain: 'toyota-indus.com', logoUrl: 'https://logo.clearbit.com/toyota-indus.com', industry: 'Engineering' },
  { name: 'Pak Suzuki Motor', domain: 'paksuzuki.com.pk', logoUrl: 'https://logo.clearbit.com/paksuzuki.com.pk', industry: 'Engineering' },
  { name: 'K-Electric', domain: 'ke.com.pk', logoUrl: 'https://logo.clearbit.com/ke.com.pk', industry: 'Engineering' },
  { name: 'Shell Pakistan', domain: 'shell.com.pk', logoUrl: 'https://logo.clearbit.com/shell.com', industry: 'Engineering' },
  { name: 'PSO (Pakistan State Oil)', domain: 'psopk.com', logoUrl: 'https://logo.clearbit.com/psopk.com', industry: 'Engineering' },

  // Global Tech Giants
  { name: 'Google', domain: 'google.com', logoUrl: 'https://logo.clearbit.com/google.com', industry: 'Technology & IT' },
  { name: 'Microsoft', domain: 'microsoft.com', logoUrl: 'https://logo.clearbit.com/microsoft.com', industry: 'Technology & IT' },
  { name: 'Amazon', domain: 'amazon.com', logoUrl: 'https://logo.clearbit.com/amazon.com', industry: 'Technology & IT' },
  { name: 'Meta', domain: 'meta.com', logoUrl: 'https://logo.clearbit.com/meta.com', industry: 'Technology & IT' },
  { name: 'Apple', domain: 'apple.com', logoUrl: 'https://logo.clearbit.com/apple.com', industry: 'Technology & IT' },
  { name: 'IBM', domain: 'ibm.com', logoUrl: 'https://logo.clearbit.com/ibm.com', industry: 'Technology & IT' },
  { name: 'Oracle', domain: 'oracle.com', logoUrl: 'https://logo.clearbit.com/oracle.com', industry: 'Technology & IT' },
  { name: 'SAP', domain: 'sap.com', logoUrl: 'https://logo.clearbit.com/sap.com', industry: 'Technology & IT' },
  { name: 'Salesforce', domain: 'salesforce.com', logoUrl: 'https://logo.clearbit.com/salesforce.com', industry: 'Technology & IT' },
  { name: 'Adobe', domain: 'adobe.com', logoUrl: 'https://logo.clearbit.com/adobe.com', industry: 'Technology & IT' },
  { name: 'Siemens', domain: 'siemens.com', logoUrl: 'https://logo.clearbit.com/siemens.com', industry: 'Engineering' },
]

export function searchBrands(query: string): CompanyBrand[] {
  if (!query.trim()) return RENOWNED_BRANDS.slice(0, 10)
  const q = query.toLowerCase().trim()
  return RENOWNED_BRANDS.filter(
    (b) => b.name.toLowerCase().includes(q) || b.domain.toLowerCase().includes(q)
  ).slice(0, 10)
}

export function getCompanyLogoUrl(name: string, customDomain?: string): string {
  if (!name || !name.trim()) return ''
  const trimmed = name.trim()

  // Match existing known brand
  const match = RENOWNED_BRANDS.find(
    (b) => b.name.toLowerCase() === trimmed.toLowerCase()
  )
  if (match) return match.logoUrl

  // Derive domain from name if customDomain not given
  let domain = customDomain || ''
  if (!domain) {
    const cleanName = trimmed.toLowerCase().replace(/[^\w]/g, '')
    domain = `${cleanName}.com`
  }

  return `https://logo.clearbit.com/${domain}`
}
