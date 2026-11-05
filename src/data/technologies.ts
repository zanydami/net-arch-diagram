import type { Layer, LayerId, NetNode, Technology } from '../types';

export const VIEWBOX_WIDTH = 1600;
export const VIEWBOX_HEIGHT = 760;
export const NODE_WIDTH = 170;
export const NODE_HEIGHT = 62;
export const NODE_SPACING = 260;

export const LAYERS: Layer[] = [
  { id: 'ue', label: 'UE', color: '#7c8aa5', textColor: '#475569' },
  { id: 'ran', label: 'RAN', color: '#8aa9d6', textColor: '#355ea8' },
  { id: 'transport', label: 'Transport', color: '#a78bfa', textColor: '#6d4ad9' },
  { id: 'core', label: 'Core', color: '#69c6a4', textColor: '#0f766e' },
  { id: 'external', label: 'External', color: '#f0b56f', textColor: '#b05b1a' },
];

export const LAYER_BANDS: Record<LayerId, { y: number; height: number }> = {
  ue: { y: 0, height: VIEWBOX_HEIGHT },
  ran: { y: 0, height: VIEWBOX_HEIGHT },
  transport: { y: 0, height: VIEWBOX_HEIGHT },
  core: { y: 0, height: VIEWBOX_HEIGHT },
  external: { y: 0, height: VIEWBOX_HEIGHT },
};

export const LAYER_X_POSITIONS: Record<LayerId, number> = {
  ue: 180,
  ran: 520,
  transport: 860,
  core: 1180,
  external: 1470,
};

export function getNodePosition(node: NetNode, allNodes: NetNode[]) {
  const layerNodes = allNodes.filter((n) => n.layer === node.layer);
  const idx = layerNodes.findIndex((n) => n.id === node.id);
  const count = layerNodes.length;

  const x = LAYER_X_POSITIONS[node.layer];
  const yStep = 120;
  const y = VIEWBOX_HEIGHT / 2 + (idx - (count - 1) / 2) * yStep;

  return { x, y };
}

export const technologies: Technology[] = [
  {
    id: '2g',
    label: '2G',
    summary:
      'GSM: голос в CS-домене, данные через GPRS в PS-домене. Отдельные ядра для коммутации каналов и пакетов.',
    nodes: [
      { id: 'ms', layer: 'ue', label: 'MS', fullName: 'Mobile Station', role: 'Терминал абонента с SIM-картой. Доступ к голосу и GPRS.', interfaces: ['Um'] },
      { id: 'bts', layer: 'ran', label: 'BTS', fullName: 'Base Transceiver Station', role: 'Базовая станция, обслуживает радиосвязь в соте.', interfaces: ['Um', 'Abis'] },
      { id: 'bsc', layer: 'ran', label: 'BSC', fullName: 'Base Station Controller', role: 'Управляет группой BTS: ресурсы, handover, связь к ядру.', interfaces: ['Abis', 'A', 'Gb'] },
      { id: 'backhaul', layer: 'transport', label: 'Backhaul', fullName: 'Transport Network', role: 'Транспортная сеть между RAN и ядром. TDM или IP/MPLS.', interfaces: [] },
      { id: 'msc', layer: 'core', label: 'MSC/VLR', fullName: 'Mobile Switching Center / VLR', role: 'CS-домен: голос, SMS, управление вызовами.', interfaces: ['A', 'C', 'D'] },
      { id: 'sgsn', layer: 'core', label: 'SGSN', fullName: 'Serving GPRS Support Node', role: 'PS-домен: маршрутизация пакетов, управление сессиями.', interfaces: ['Gb', 'Gn', 'Gr'] },
      { id: 'ggsn', layer: 'core', label: 'GGSN', fullName: 'Gateway GPRS Support Node', role: 'Шлюз в PDN. Выделяет IP-адреса абонентам.', interfaces: ['Gn', 'Gi'] },
      { id: 'hlr', layer: 'core', label: 'HLR/AuC', fullName: 'Home Location Register / AuC', role: 'Реестр абонентов и центр аутентификации.', interfaces: ['C', 'D', 'Gr'] },
      { id: 'pstn', layer: 'external', label: 'PSTN', fullName: 'Public Switched Telephone Network', role: 'Традиционная телефонная сеть.', interfaces: [] },
      { id: 'pdn', layer: 'external', label: 'Internet/PDN', fullName: 'Packet Data Network', role: 'Внешние сети передачи данных.', interfaces: ['Gi'] },
    ],
    links: [
      { id: 'l1', from: 'ms', to: 'bts', label: 'Um' },
      { id: 'l2', from: 'bts', to: 'bsc', label: 'Abis' },
      { id: 'l3', from: 'bsc', to: 'backhaul' },
      { id: 'l4', from: 'backhaul', to: 'msc', label: 'A' },
      { id: 'l5', from: 'backhaul', to: 'sgsn', label: 'Gb' },
      { id: 'l6', from: 'msc', to: 'hlr', label: 'C' },
      { id: 'l7', from: 'sgsn', to: 'hlr', label: 'Gr' },
      { id: 'l8', from: 'sgsn', to: 'ggsn', label: 'Gn' },
      { id: 'l9', from: 'ggsn', to: 'pdn', label: 'Gi' },
      { id: 'l10', from: 'msc', to: 'pstn' },
    ],
  },
  {
    id: '3g',
    label: '3G',
    summary: 'UMTS: общий транспорт для CS и PS, выделенный RNC. Пакетные данные становятся основным сценарием.',
    nodes: [
      { id: 'ue', layer: 'ue', label: 'UE', fullName: 'User Equipment', role: 'Терминал абонента UMTS (WCDMA/HSPA).', interfaces: ['Uu'] },
      { id: 'nodeb', layer: 'ran', label: 'NodeB', fullName: 'NodeB', role: 'Базовая станция 3G.', interfaces: ['Uu', 'Iub'] },
      { id: 'rnc', layer: 'ran', label: 'RNC', fullName: 'Radio Network Controller', role: 'Управление радиоресурсами, handover, связь к ядру.', interfaces: ['Iub', 'Iu-CS', 'Iu-PS'] },
      { id: 'backhaul', layer: 'transport', label: 'Backhaul', fullName: 'Transport Network', role: 'Транспорт между RAN и ядром (IP или ATM).', interfaces: [] },
      { id: 'msc', layer: 'core', label: 'MSC/VLR', fullName: 'Mobile Switching Center / VLR', role: 'CS-домен: голос, видеозвонки.', interfaces: ['Iu-CS', 'C', 'D'] },
      { id: 'sgsn', layer: 'core', label: 'SGSN', fullName: 'Serving GPRS Support Node', role: 'PS-домен: маршрутизация данных, mobility.', interfaces: ['Iu-PS', 'Gn', 'Gr'] },
      { id: 'ggsn', layer: 'core', label: 'GGSN', fullName: 'Gateway GPRS Support Node', role: 'Шлюз в PDN.', interfaces: ['Gn', 'Gi'] },
      { id: 'hss', layer: 'core', label: 'HLR/HSS', fullName: 'Home Subscriber Server', role: 'Единый реестр абонентов для CS и PS.', interfaces: ['C', 'D', 'Gr'] },
      { id: 'pstn', layer: 'external', label: 'PSTN', fullName: 'Public Switched Telephone Network', role: 'Телефонная сеть.', interfaces: [] },
      { id: 'pdn', layer: 'external', label: 'Internet/PDN', fullName: 'Packet Data Network', role: 'Внешние сети данных.', interfaces: ['Gi'] },
    ],
    links: [
      { id: 'l1', from: 'ue', to: 'nodeb', label: 'Uu' },
      { id: 'l2', from: 'nodeb', to: 'rnc', label: 'Iub' },
      { id: 'l3', from: 'rnc', to: 'backhaul' },
      { id: 'l4', from: 'backhaul', to: 'msc', label: 'Iu-CS' },
      { id: 'l5', from: 'backhaul', to: 'sgsn', label: 'Iu-PS' },
      { id: 'l6', from: 'msc', to: 'hss' },
      { id: 'l7', from: 'sgsn', to: 'hss' },
      { id: 'l8', from: 'sgsn', to: 'ggsn', label: 'Gn' },
      { id: 'l9', from: 'ggsn', to: 'pdn', label: 'Gi' },
      { id: 'l10', from: 'msc', to: 'pstn' },
    ],
  },
  {
    id: '4g',
    label: '4G',
    summary: 'LTE: полностью пакетное ядро (EPC), нет CS-домена. Плоская архитектура, голос через VoLTE поверх IMS.',
    nodes: [
      { id: 'ue', layer: 'ue', label: 'UE', fullName: 'User Equipment', role: 'Терминал LTE. VoLTE и высокоскоростные данные.', interfaces: ['LTE-Uu'] },
      { id: 'enb', layer: 'ran', label: 'eNB', fullName: 'Evolved NodeB', role: 'Базовая станция LTE. Плоская архитектура: напрямую к EPC через S1.', interfaces: ['LTE-Uu', 'S1-MME', 'S1-U', 'X2'] },
      { id: 'backhaul', layer: 'transport', label: 'Backhaul', fullName: 'Transport (S1)', role: 'IP-транспорт между eNB и EPC.', interfaces: [] },
      { id: 'hss', layer: 'core', label: 'HSS', fullName: 'Home Subscriber Server', role: 'Реестр абонентов: профили, аутентификация, местоположение.', interfaces: ['S6a'] },
      { id: 'mme', layer: 'core', label: 'MME', fullName: 'Mobility Management Entity', role: 'Control plane: аутентификация, сессии, paging, mobility.', interfaces: ['S1-MME', 'S11', 'S6a'] },
      { id: 'sgw', layer: 'core', label: 'S-GW', fullName: 'Serving Gateway', role: 'Якорь user plane при хэндоверах.', interfaces: ['S1-U', 'S5/S8', 'S11'] },
      { id: 'pgw', layer: 'core', label: 'P-GW', fullName: 'Packet Data Network Gateway', role: 'Шлюз в PDN. Выделяет IP, QoS, тарификация.', interfaces: ['S5/S8', 'SGi', 'Gx'] },
      { id: 'pcrf', layer: 'core', label: 'PCRF', fullName: 'Policy and Charging Rules Function', role: 'Политики QoS и тарификации в реальном времени.', interfaces: ['Gx', 'Rx'] },
      { id: 'internet', layer: 'external', label: 'Internet/IMS', fullName: 'Packet Data Network', role: 'Интернет и IMS (для VoLTE).', interfaces: ['SGi'] },
    ],
    links: [
      { id: 'l1', from: 'ue', to: 'enb', label: 'LTE-Uu' },
      { id: 'l2', from: 'enb', to: 'backhaul' },
      { id: 'l3', from: 'backhaul', to: 'mme', label: 'S1-MME' },
      { id: 'l4', from: 'backhaul', to: 'sgw', label: 'S1-U' },
      { id: 'l5', from: 'mme', to: 'sgw', label: 'S11' },
      { id: 'l6', from: 'mme', to: 'hss', label: 'S6a' },
      { id: 'l7', from: 'sgw', to: 'pgw', label: 'S5/S8' },
      { id: 'l8', from: 'pgw', to: 'pcrf', label: 'Gx' },
      { id: 'l9', from: 'pgw', to: 'internet', label: 'SGi' },
    ],
  },
  {
    id: '5g-nsa',
    label: '5G NSA',
    summary: '5G Non-Standalone: NR для данных, LTE-якорь для сигнализации. Работает на существующем ядре EPC.',
    nodes: [
      { id: 'ue', layer: 'ue', label: 'UE', fullName: 'User Equipment', role: 'Терминал с поддержкой EN-DC (LTE + NR).', interfaces: ['LTE-Uu', 'NR-Uu'] },
      { id: 'enb', layer: 'ran', label: 'eNB', fullName: 'LTE Anchor (Master Node)', badge: 'anchor', role: 'LTE-якорь. Обеспечивает control plane и user plane по LTE.', interfaces: ['LTE-Uu', 'S1-MME', 'S1-U', 'X2'] },
      { id: 'gnb', layer: 'ran', label: 'gNB', fullName: 'NR Secondary Node', badge: 'NR', role: 'Базовая станция 5G NR. Добавляет пропускную способность в user plane.', interfaces: ['NR-Uu', 'X2'] },
      { id: 'backhaul', layer: 'transport', label: 'Backhaul', fullName: 'Transport (S1)', role: 'IP-транспорт между RAN и EPC.', interfaces: [] },
      { id: 'hss', layer: 'core', label: 'HSS', fullName: 'Home Subscriber Server', badge: 'EPC', role: 'Реестр абонентов.', interfaces: ['S6a'] },
      { id: 'mme', layer: 'core', label: 'MME', fullName: 'Mobility Management Entity', badge: 'EPC', role: 'Управление сигнализацией в EPC.', interfaces: ['S1-MME', 'S11', 'S6a'] },
      { id: 'sgw', layer: 'core', label: 'S-GW', fullName: 'Serving Gateway', badge: 'EPC', role: 'Якорь user plane. Агрегирует трафик LTE и NR.', interfaces: ['S1-U', 'S5/S8'] },
      { id: 'pgw', layer: 'core', label: 'P-GW', fullName: 'Packet Data Network Gateway', badge: 'EPC', role: 'Шлюз в PDN.', interfaces: ['S5/S8', 'SGi'] },
      { id: 'internet', layer: 'external', label: 'Internet', fullName: 'Packet Data Network', role: 'Внешние IP-сети.', interfaces: ['SGi'] },
    ],
    links: [
      { id: 'l1', from: 'ue', to: 'enb', label: 'LTE-Uu' },
      { id: 'l2', from: 'ue', to: 'gnb', label: 'NR-Uu' },
      { id: 'l3', from: 'enb', to: 'gnb', label: 'X2' },
      { id: 'l4', from: 'enb', to: 'backhaul' },
      { id: 'l5', from: 'gnb', to: 'backhaul' },
      { id: 'l6', from: 'backhaul', to: 'mme', label: 'S1-MME' },
      { id: 'l7', from: 'backhaul', to: 'sgw', label: 'S1-U' },
      { id: 'l8', from: 'mme', to: 'sgw', label: 'S11' },
      { id: 'l9', from: 'mme', to: 'hss', label: 'S6a' },
      { id: 'l10', from: 'sgw', to: 'pgw', label: 'S5/S8' },
      { id: 'l11', from: 'pgw', to: 'internet', label: 'SGi' },
    ],
  },
  {
    id: '5g-sa',
    label: '5G SA',
    summary: '5G Standalone: полностью 5G ядро на сервисной архитектуре (SBA). Каждая сетевая функция — независимый сервис.',
    nodes: [
      { id: 'ue', layer: 'ue', label: 'UE', fullName: 'User Equipment', role: 'Терминал 5G NR. eMBB, URLLC, mMTC.', interfaces: ['Uu', 'N1'] },
      { id: 'gnb', layer: 'ran', label: 'gNB', fullName: 'Next Generation NodeB', role: 'Базовая станция 5G NR. Может быть разделена на CU и DU.', interfaces: ['Uu', 'N2', 'N3', 'Xn'] },
      { id: 'backhaul', layer: 'transport', label: 'Backhaul', fullName: 'Transport (N2/N3)', role: 'IP-транспорт с поддержкой network slicing и QoS.', interfaces: [] },
      { id: 'udm', layer: 'core', label: 'UDM', fullName: 'Unified Data Management', role: 'Реестр абонентов. Заменил HSS из EPC.', interfaces: ['N8', 'N10', 'N13'] },
      { id: 'amf', layer: 'core', label: 'AMF', fullName: 'Access and Mobility Management Function', role: 'Точка входа UE в ядро. Регистрация, аутентификация, mobility.', interfaces: ['N1', 'N2', 'N8', 'N11'] },
      { id: 'smf', layer: 'core', label: 'SMF', fullName: 'Session Management Function', role: 'Управление PDU-сессиями, выбор UPF, распределение IP.', interfaces: ['N4', 'N7', 'N10', 'N11'] },
      { id: 'upf', layer: 'core', label: 'UPF', fullName: 'User Plane Function', role: 'Маршрутизация пакетов, QoS, точка подключения к DN и MEC.', interfaces: ['N3', 'N4', 'N6', 'N9'] },
      { id: 'pcf', layer: 'core', label: 'PCF', fullName: 'Policy Control Function', role: 'Политики QoS и тарификации.', interfaces: ['N7', 'N15'] },
      { id: 'dn', layer: 'external', label: 'DN', fullName: 'Data Network', role: 'Internet, MEC, корпоративные сети.', interfaces: ['N6'] },
    ],
    links: [
      { id: 'l1', from: 'ue', to: 'gnb', label: 'Uu' },
      { id: 'l2', from: 'gnb', to: 'backhaul' },
      { id: 'l3', from: 'backhaul', to: 'amf', label: 'N2' },
      { id: 'l4', from: 'backhaul', to: 'upf', label: 'N3' },
      { id: 'l5', from: 'amf', to: 'smf', label: 'N11' },
      { id: 'l6', from: 'amf', to: 'udm', label: 'N8' },
      { id: 'l7', from: 'smf', to: 'upf', label: 'N4' },
      { id: 'l8', from: 'smf', to: 'pcf', label: 'N7' },
      { id: 'l9', from: 'upf', to: 'dn', label: 'N6' },
    ],
  },
];