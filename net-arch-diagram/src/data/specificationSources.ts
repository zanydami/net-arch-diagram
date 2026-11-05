export interface SpecificationSource {
  number: string;
  title: string;
  url: string;
}

const spec = (number: string, title: string): SpecificationSource => {
  const series = number.slice(0, 2);
  return {
    number: `TS ${number}`,
    title,
    url: `https://www.3gpp.org/ftp/Specs/archive/${series}_series/${number}/`,
  };
};

const ts = {
  gsmArchitecture: spec('23.002', 'Network architecture'),
  gprsArchitecture: spec('23.060', 'GPRS; Service description; Stage 2'),
  utranArchitecture: spec('25.401', 'UTRAN overall description'),
  utranIu: spec('25.410', 'UTRAN Iu interface: General aspects and principles'),
  utranIub: spec('25.430', 'UTRAN Iub interface: General aspects and principles'),
  utranRrc: spec('25.331', 'UTRAN; Radio Resource Control (RRC); Protocol specification'),
  ranap: spec('25.413', 'UTRAN Iu interface: RANAP signalling'),
  gsmRrc: spec('44.018', 'GSM radio interface: Radio Resource Control protocol'),
  bssMsc: spec('48.008', 'BSS-MSC interface: Layer 3 specification'),
  bssBsc: spec('48.058', 'BSS-BSC interface: Layer 3 specification'),
  bssgp: spec('48.018', 'BSS GPRS Protocol (BSSGP)'),
  map: spec('29.002', 'Mobile Application Part (MAP) specification'),
  gtpGnGp: spec('29.060', 'GPRS Tunnelling Protocol across Gn and Gp interfaces'),
  epcArchitecture: spec('23.401', 'General Packet Radio Service (GPRS) enhancements for E-UTRAN access'),
  lteRadio: spec('36.300', 'E-UTRA and E-UTRAN; Overall description; Stage 2'),
  lteRrc: spec('36.331', 'E-UTRA; Radio Resource Control (RRC); Protocol specification'),
  s1ap: spec('36.413', 'E-UTRAN; S1 Application Protocol (S1AP)'),
  x2ap: spec('36.423', 'E-UTRAN; X2 Application Protocol (X2AP)'),
  gtpUser: spec('29.281', 'GTPv1-U; User Plane protocol'),
  gtpControl: spec('29.274', 'Evolved GPRS Tunnelling Protocol for EPS (GTPv2-C)'),
  diameter: spec('29.272', 'EPS; MME and SGSN related interfaces based on Diameter'),
  pccGx: spec('29.212', 'Policy and Charging Control over Gx reference point'),
  pccRx: spec('29.214', 'Policy and Charging Control over Rx reference point'),
  multiConnectivity: spec('37.340', 'E-UTRA and NR Multi-connectivity; Overall description; Stage 2'),
  fiveGArchitecture: spec('23.501', 'System architecture for the 5G System (5GS)'),
  fiveGProcedures: spec('23.502', 'Procedures for the 5G System (5GS)'),
  ngRanArchitecture: spec('38.401', 'NG-RAN; Architecture description'),
  nrOverall: spec('38.300', 'NR and NG-RAN; Overall description; Stage 2'),
  nrRrc: spec('38.331', 'NR; Radio Resource Control (RRC); Protocol specification'),
  ngap: spec('38.413', 'NG-RAN; NG Application Protocol (NGAP)'),
  xnAp: spec('38.423', 'NG-RAN; Xn Application Protocol (XnAP)'),
  fiveGNas: spec('24.501', '5GS; Non-Access-Stratum (NAS) protocol'),
  pfcp: spec('29.244', 'Interface between the Control Plane and User Plane nodes'),
  smPolicy: spec('29.512', '5GS; Session Management Policy Control Service'),
  udm: spec('29.503', '5GS; Unified Data Management Services'),
  amf: spec('29.518', '5GS; Access and Mobility Management Services'),
  smf: spec('29.502', '5GS; Session Management Services'),
  ausf: spec('29.509', '5GS; Authentication Server Services'),
  amPolicy: spec('29.507', '5GS; Access and Mobility Policy Control Service'),
};

export const architectureSourcesByTechnology: Record<string, SpecificationSource[]> = {
  '2g': [ts.gsmArchitecture, ts.gprsArchitecture],
  '3g': [ts.gsmArchitecture, ts.utranArchitecture, ts.gprsArchitecture],
  '4g': [ts.epcArchitecture, ts.lteRadio],
  '5g-nsa': [ts.multiConnectivity, ts.epcArchitecture, ts.lteRadio],
  '5g-sa': [ts.fiveGArchitecture, ts.fiveGProcedures, ts.ngRanArchitecture],
};

export const interfaceSourcesByTechnology: Record<string, Record<string, SpecificationSource[]>> = {
  '2g': {
    Um: [ts.gsmRrc],
    Abis: [ts.bssBsc],
    A: [ts.bssMsc],
    Gb: [ts.bssgp],
    C: [ts.map],
    D: [ts.map],
    Gr: [ts.map],
    Gn: [ts.gtpGnGp],
  },
  '3g': {
    Uu: [ts.utranArchitecture, ts.utranRrc],
    Iub: [ts.utranIub],
    'Iu-CS': [ts.utranIu, ts.ranap],
    'Iu-PS': [ts.utranIu, ts.ranap],
    C: [ts.map],
    D: [ts.map],
    Gr: [ts.map],
    Gn: [ts.gtpGnGp],
  },
  '4g': {
    'LTE-Uu': [ts.lteRrc],
    'S1-MME': [ts.s1ap],
    'S1-U': [ts.gtpUser],
    S11: [ts.gtpControl],
    S6a: [ts.diameter],
    'S5/S8': [ts.gtpControl],
    X2: [ts.x2ap],
    Gx: [ts.pccGx],
    Rx: [ts.pccRx],
  },
  '5g-nsa': {
    'LTE-Uu': [ts.lteRrc],
    'NR-Uu': [ts.nrOverall, ts.nrRrc],
    X2: [ts.x2ap, ts.multiConnectivity],
    'S1-MME': [ts.s1ap],
    'S1-U': [ts.gtpUser],
    S11: [ts.gtpControl],
    S6a: [ts.diameter],
    'S5/S8': [ts.gtpControl],
  },
  '5g-sa': {
    Uu: [ts.nrOverall, ts.nrRrc],
    N1: [ts.fiveGNas],
    N2: [ts.ngap],
    N3: [ts.gtpUser],
    N4: [ts.pfcp],
    N7: [ts.smPolicy],
    N8: [ts.udm],
    N10: [ts.udm],
    N11: [ts.amf, ts.smf],
    N13: [ts.ausf, ts.udm],
    N15: [ts.amPolicy],
    Xn: [ts.xnAp],
  },
};