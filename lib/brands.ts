export interface CompanyBrand {
  name: string
  domain: string
  logoUrl: string
  industry: string
}

export const KNOWN_BRAND_MAP: Record<string, { domain: string; industry: string }> = {
  // Global BPO, Tech & Enterprise Leaders
  ibex: { domain: 'ibex.co', industry: 'Technology & IT' },
  'ibex global': { domain: 'ibex.co', industry: 'Technology & IT' },
  'ibex digital': { domain: 'ibex.co', industry: 'Technology & IT' },
  afiniti: { domain: 'afiniti.com', industry: 'Technology & IT' },
  trg: { domain: 'trgworld.com', industry: 'Technology & IT' },
  's&p global': { domain: 'spglobal.com', industry: 'Finance & Banking' },
  spglobal: { domain: 'spglobal.com', industry: 'Finance & Banking' },
  teradata: { domain: 'teradata.com', industry: 'Technology & IT' },
  sybrid: { domain: 'sybrid.com', industry: 'Technology & IT' },
  abacus: { domain: 'abacus-global.com', industry: 'Technology & IT' },
  'abacus consulting': { domain: 'abacus-global.com', industry: 'Technology & IT' },

  // Global Big 4 & Management Consulting
  ey: { domain: 'ey.com', industry: 'Finance & Banking' },
  'ernst & young': { domain: 'ey.com', industry: 'Finance & Banking' },
  pwc: { domain: 'pwc.com', industry: 'Finance & Banking' },
  pricewaterhousecoopers: { domain: 'pwc.com', industry: 'Finance & Banking' },
  kpmg: { domain: 'kpmg.com', industry: 'Finance & Banking' },
  deloitte: { domain: 'deloitte.com', industry: 'Finance & Banking' },
  mckinsey: { domain: 'mckinsey.com', industry: 'Finance & Banking' },
  bcg: { domain: 'bcg.com', industry: 'Finance & Banking' },

  // Banking & Financial Multinationals & Major Banks
  hbl: { domain: 'hbl.com', industry: 'Finance & Banking' },
  'habib bank': { domain: 'hbl.com', industry: 'Finance & Banking' },
  meezan: { domain: 'meezanbank.com', industry: 'Finance & Banking' },
  ubl: { domain: 'ubldigital.com', industry: 'Finance & Banking' },
  mcb: { domain: 'mcb.com.pk', industry: 'Finance & Banking' },
  'bank alfalah': { domain: 'bankalfalah.com', industry: 'Finance & Banking' },
  'faysal bank': { domain: 'faysalbank.com', industry: 'Finance & Banking' },
  'allied bank': { domain: 'abl.com', industry: 'Finance & Banking' },
  abl: { domain: 'abl.com', industry: 'Finance & Banking' },
  'standard chartered': { domain: 'sc.com', industry: 'Finance & Banking' },

  // Pharmaceuticals & Healthcare Multinationals
  'martin dow': { domain: 'martindow.com', industry: 'Healthcare' },
  getz: { domain: 'getzpharma.com', industry: 'Healthcare' },
  'getz pharma': { domain: 'getzpharma.com', industry: 'Healthcare' },
  abbott: { domain: 'abbott.com', industry: 'Healthcare' },
  gsk: { domain: 'gsk.com', industry: 'Healthcare' },
  glaxosmithkline: { domain: 'gsk.com', industry: 'Healthcare' },
  pfizer: { domain: 'pfizer.com', industry: 'Healthcare' },
  bayer: { domain: 'bayer.com', industry: 'Healthcare' },
  roche: { domain: 'roche.com', industry: 'Healthcare' },
  novartis: { domain: 'novartis.com', industry: 'Healthcare' },
  sanofi: { domain: 'sanofi.com', industry: 'Healthcare' },
  searle: { domain: 'searlecompany.com', industry: 'Healthcare' },

  // FMCG & Consumer Goods Multinationals
  unilever: { domain: 'unilever.com', industry: 'Marketing & Sales' },
  nestle: { domain: 'nestle.com', industry: 'Marketing & Sales' },
  pepsi: { domain: 'pepsico.com', industry: 'Marketing & Sales' },
  pepsico: { domain: 'pepsico.com', industry: 'Marketing & Sales' },
  'coca cola': { domain: 'coca-cola.com', industry: 'Marketing & Sales' },
  'coca-cola': { domain: 'coca-cola.com', industry: 'Marketing & Sales' },
  'p&g': { domain: 'pg.com', industry: 'Marketing & Sales' },
  'procter & gamble': { domain: 'pg.com', industry: 'Marketing & Sales' },
  reckitt: { domain: 'reckitt.com', industry: 'Healthcare' },
  'loreal': { domain: 'loreal.com', industry: 'Marketing & Sales' },
  "l'oreal": { domain: 'loreal.com', industry: 'Marketing & Sales' },
  'johnson & johnson': { domain: 'jnj.com', industry: 'Healthcare' },

  // IT, Telecom & Mobility Giants
  systems: { domain: 'systemsltd.com', industry: 'Technology & IT' },
  'systems limited': { domain: 'systemsltd.com', industry: 'Technology & IT' },
  netsol: { domain: 'netsoltech.com', industry: 'Technology & IT' },
  devsinc: { domain: 'devsinc.com', industry: 'Technology & IT' },
  '10pearls': { domain: '10pearls.com', industry: 'Technology & IT' },
  venturedive: { domain: 'venturedive.com', industry: 'Technology & IT' },
  arbisoft: { domain: 'arbisoft.com', industry: 'Technology & IT' },
  qualix: { domain: 'qualix.com', industry: 'Technology & IT' },
  jazz: { domain: 'jazz.com.pk', industry: 'Telecom & Media' },
  telenor: { domain: 'telenor.com.pk', industry: 'Telecom & Media' },
  zong: { domain: 'zong.com.pk', industry: 'Telecom & Media' },
  ufone: { domain: 'ufone.com', industry: 'Telecom & Media' },
  ptcl: { domain: 'ptcl.com.pk', industry: 'Telecom & Media' },
  daraz: { domain: 'daraz.pk', industry: 'Marketing & Sales' },
  foodpanda: { domain: 'foodpanda.pk', industry: 'Marketing & Sales' },
  careem: { domain: 'careem.com', industry: 'Technology & IT' },
  indrive: { domain: 'indrive.com', industry: 'Technology & IT' },
  bykea: { domain: 'bykea.com', industry: 'Technology & IT' },
  google: { domain: 'google.com', industry: 'Technology & IT' },
  microsoft: { domain: 'microsoft.com', industry: 'Technology & IT' },
  amazon: { domain: 'amazon.com', industry: 'Technology & IT' },
  meta: { domain: 'meta.com', industry: 'Technology & IT' },
  apple: { domain: 'apple.com', industry: 'Technology & IT' },
  ibm: { domain: 'ibm.com', industry: 'Technology & IT' },
  oracle: { domain: 'oracle.com', industry: 'Technology & IT' },
  sap: { domain: 'sap.com', industry: 'Technology & IT' },
  siemens: { domain: 'siemens.com', industry: 'Engineering' },
  shell: { domain: 'shell.com', industry: 'Engineering' },
}

export function getDomainForCompany(companyName: string): string {
  if (!companyName) return ''
  const lower = companyName.toLowerCase().trim()

  // Match known dictionary
  for (const [key, value] of Object.entries(KNOWN_BRAND_MAP)) {
    if (lower.includes(key) || key.includes(lower)) {
      return value.domain
    }
  }

  // Fallback domain extraction
  const clean = lower
    .replace(/\b(pakistan|limited|ltd|inc|pvt|co|corp|corporation|group|llc|solutions|solution|tech|technologies|global|digital)\b/gi, '')
    .trim()
    .replace(/[^\w]/g, '')

  return clean ? `${clean}.com` : `${lower.replace(/[^\w]/g, '')}.com`
}

export function getCompanyLogoUrl(companyName: string, customDomain?: string): string {
  if (!companyName || !companyName.trim()) return ''
  const domain = customDomain || getDomainForCompany(companyName)
  // Use Google 256px high-res favicon API as primary high-reliability CDN
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=256`
}

export const RENOWNED_BRANDS: CompanyBrand[] = [
  { name: 'ibex Global', domain: 'ibex.co', logoUrl: 'https://www.google.com/s2/favicons?domain=ibex.co&sz=256', industry: 'Technology & IT' },
  { name: 'EY (Ernst & Young)', domain: 'ey.com', logoUrl: 'https://www.google.com/s2/favicons?domain=ey.com&sz=256', industry: 'Finance & Banking' },
  { name: 'HBL (Habib Bank Limited)', domain: 'hbl.com', logoUrl: 'https://www.google.com/s2/favicons?domain=hbl.com&sz=256', industry: 'Finance & Banking' },
  { name: 'Martin Dow', domain: 'martindow.com', logoUrl: 'https://www.google.com/s2/favicons?domain=martindow.com&sz=256', industry: 'Healthcare' },
  { name: 'S&P Global', domain: 'spglobal.com', logoUrl: 'https://www.google.com/s2/favicons?domain=spglobal.com&sz=256', industry: 'Finance & Banking' },
  { name: 'PwC', domain: 'pwc.com', logoUrl: 'https://www.google.com/s2/favicons?domain=pwc.com&sz=256', industry: 'Finance & Banking' },
  { name: 'KPMG', domain: 'kpmg.com', logoUrl: 'https://www.google.com/s2/favicons?domain=kpmg.com&sz=256', industry: 'Finance & Banking' },
  { name: 'Deloitte', domain: 'deloitte.com', logoUrl: 'https://www.google.com/s2/favicons?domain=deloitte.com&sz=256', industry: 'Finance & Banking' },
  { name: 'Getz Pharma', domain: 'getzpharma.com', logoUrl: 'https://www.google.com/s2/favicons?domain=getzpharma.com&sz=256', industry: 'Healthcare' },
  { name: 'Abbott Pakistan', domain: 'abbott.com', logoUrl: 'https://www.google.com/s2/favicons?domain=abbott.com&sz=256', industry: 'Healthcare' },
  { name: 'GSK (GlaxoSmithKline)', domain: 'gsk.com', logoUrl: 'https://www.google.com/s2/favicons?domain=gsk.com&sz=256', industry: 'Healthcare' },
  { name: 'Unilever', domain: 'unilever.com', logoUrl: 'https://www.google.com/s2/favicons?domain=unilever.com&sz=256', industry: 'Marketing & Sales' },
  { name: 'Nestlé', domain: 'nestle.com', logoUrl: 'https://www.google.com/s2/favicons?domain=nestle.com&sz=256', industry: 'Marketing & Sales' },
  { name: 'PepsiCo', domain: 'pepsico.com', logoUrl: 'https://www.google.com/s2/favicons?domain=pepsico.com&sz=256', industry: 'Marketing & Sales' },
  { name: 'Coca-Cola', domain: 'coca-cola.com', logoUrl: 'https://www.google.com/s2/favicons?domain=coca-cola.com&sz=256', industry: 'Marketing & Sales' },
  { name: 'Meezan Bank', domain: 'meezanbank.com', logoUrl: 'https://www.google.com/s2/favicons?domain=meezanbank.com&sz=256', industry: 'Finance & Banking' },
  { name: 'UBL', domain: 'ubldigital.com', logoUrl: 'https://www.google.com/s2/favicons?domain=ubldigital.com&sz=256', industry: 'Finance & Banking' },
  { name: 'MCB Bank', domain: 'mcb.com.pk', logoUrl: 'https://www.google.com/s2/favicons?domain=mcb.com.pk&sz=256', industry: 'Finance & Banking' },
  { name: 'Bank Alfalah', domain: 'bankalfalah.com', logoUrl: 'https://www.google.com/s2/favicons?domain=bankalfalah.com&sz=256', industry: 'Finance & Banking' },
  { name: 'Standard Chartered', domain: 'sc.com', logoUrl: 'https://www.google.com/s2/favicons?domain=sc.com&sz=256', industry: 'Finance & Banking' },
  { name: 'Systems Limited', domain: 'systemsltd.com', logoUrl: 'https://www.google.com/s2/favicons?domain=systemsltd.com&sz=256', industry: 'Technology & IT' },
  { name: 'NetSol Technologies', domain: 'netsoltech.com', logoUrl: 'https://www.google.com/s2/favicons?domain=netsoltech.com&sz=256', industry: 'Technology & IT' },
  { name: 'DevSinc', domain: 'devsinc.com', logoUrl: 'https://www.google.com/s2/favicons?domain=devsinc.com&sz=256', industry: 'Technology & IT' },
  { name: '10Pearls', domain: '10pearls.com', logoUrl: 'https://www.google.com/s2/favicons?domain=10pearls.com&sz=256', industry: 'Technology & IT' },
  { name: 'VentureDive', domain: 'venturedive.com', logoUrl: 'https://www.google.com/s2/favicons?domain=venturedive.com&sz=256', industry: 'Technology & IT' },
  { name: 'Arbisoft', domain: 'arbisoft.com', logoUrl: 'https://www.google.com/s2/favicons?domain=arbisoft.com&sz=256', industry: 'Technology & IT' },
  { name: 'Jazz 4G', domain: 'jazz.com.pk', logoUrl: 'https://www.google.com/s2/favicons?domain=jazz.com.pk&sz=256', industry: 'Telecom & Media' },
  { name: 'Telenor', domain: 'telenor.com.pk', logoUrl: 'https://www.google.com/s2/favicons?domain=telenor.com.pk&sz=256', industry: 'Telecom & Media' },
  { name: 'Zong 4G', domain: 'zong.com.pk', logoUrl: 'https://www.google.com/s2/favicons?domain=zong.com.pk&sz=256', industry: 'Telecom & Media' },
  { name: 'PTCL', domain: 'ptcl.com.pk', logoUrl: 'https://www.google.com/s2/favicons?domain=ptcl.com.pk&sz=256', industry: 'Telecom & Media' },
  { name: 'Daraz', domain: 'daraz.pk', logoUrl: 'https://www.google.com/s2/favicons?domain=daraz.pk&sz=256', industry: 'Marketing & Sales' },
  { name: 'Foodpanda', domain: 'foodpanda.pk', logoUrl: 'https://www.google.com/s2/favicons?domain=foodpanda.pk&sz=256', industry: 'Marketing & Sales' },
  { name: 'Careem', domain: 'careem.com', logoUrl: 'https://www.google.com/s2/favicons?domain=careem.com&sz=256', industry: 'Technology & IT' },
  { name: 'Google', domain: 'google.com', logoUrl: 'https://www.google.com/s2/favicons?domain=google.com&sz=256', industry: 'Technology & IT' },
  { name: 'Microsoft', domain: 'microsoft.com', logoUrl: 'https://www.google.com/s2/favicons?domain=microsoft.com&sz=256', industry: 'Technology & IT' },
  { name: 'Amazon', domain: 'amazon.com', logoUrl: 'https://www.google.com/s2/favicons?domain=amazon.com&sz=256', industry: 'Technology & IT' },
  { name: 'Siemens', domain: 'siemens.com', logoUrl: 'https://www.google.com/s2/favicons?domain=siemens.com&sz=256', industry: 'Engineering' },
  { name: 'Shell', domain: 'shell.com', logoUrl: 'https://www.google.com/s2/favicons?domain=shell.com&sz=256', industry: 'Engineering' },
]

export function searchBrands(query: string): CompanyBrand[] {
  if (!query.trim()) return RENOWNED_BRANDS.slice(0, 10)
  const q = query.toLowerCase().trim()
  return RENOWNED_BRANDS.filter(
    (b) => b.name.toLowerCase().includes(q) || b.domain.toLowerCase().includes(q)
  ).slice(0, 10)
}
