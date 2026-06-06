export const categories = [
  { id: '1', name: 'Alertas' },
  { id: '2', name: 'Fármacos' },
  { id: '3', name: 'Protocolos' },
  { id: '4', name: 'Farmacocinética' },
  { id: '5', name: 'Geral' },
]

export const categoryColors = {
  Alertas:         { bg: 'bg-red-100',    text: 'text-red-700' },
  Fármacos:        { bg: 'bg-blue-100',   text: 'text-blue-700' },
  Protocolos:      { bg: 'bg-green-100',  text: 'text-green-700' },
  Farmacocinética: { bg: 'bg-purple-100', text: 'text-purple-700' },
  Geral:           { bg: 'bg-gray-100',   text: 'text-gray-700' },
}

export const avatarColors = [
  'bg-teal-500',
  'bg-indigo-500',
  'bg-orange-500',
  'bg-pink-500',
  'bg-emerald-500',
]

export const notes = [
  {
    id: '1',
    title: 'Risco de prolongamento do QT com azitromicina',
    content:
      'Azitromicina pode prolongar o intervalo QT. Atenção especial em pacientes com histórico de arritmias, hipocalemia ou uso concomitante de outros QT-prolongadores. Avaliar ECG antes da prescrição em grupos de risco.',
    category: 'Alertas',
    tags: ['arritmia', 'azitromicina', 'ECG'],
    author: { name: 'Dra. Ana Lima', role: 'admin' },
    date: '2026-06-02',
  },
  {
    id: '2',
    title: 'Vancomicina: monitorização por AUC/MIC',
    content:
      'A diretriz ASHP/IDSA recomenda monitorização de vancomicina pelo índice AUC/MIC (alvo 400–600 mg·h/L) em substituição ao vale isolado, reduzindo nefrotoxicidade sem perda de eficácia.',
    category: 'Fármacos',
    tags: ['vancomicina', 'TDM', 'infecção'],
    author: { name: 'Carlos Souza', role: 'collaborator' },
    date: '2026-05-28',
  },
  {
    id: '3',
    title: 'Protocolo de reconciliação medicamentosa na admissão',
    content:
      'Realizar anamnese farmacológica completa nas primeiras 24 h. Comparar medicamentos de uso domiciliar com a prescrição hospitalar. Identificar omissões, duplicidades e interações. Documentar em prontuário.',
    category: 'Protocolos',
    tags: ['reconciliação', 'admissão', 'segurança'],
    author: { name: 'Dra. Ana Lima', role: 'admin' },
    date: '2026-05-20',
  },
  {
    id: '4',
    title: 'Ajuste de dose de meropeném na insuficiência renal',
    content:
      'Para ClCr 26–50 mL/min: 1 g a cada 12 h. Para ClCr 10–25 mL/min: 500 mg a cada 12 h. Para ClCr < 10 mL/min: 500 mg a cada 24 h. Hemodiálise: dose suplementar após sessão.',
    category: 'Farmacocinética',
    tags: ['meropeném', 'renal', 'dose'],
    author: { name: 'Beatriz Costa', role: 'collaborator' },
    date: '2026-05-15',
  },
  {
    id: '5',
    title: 'Boas práticas no preparo de NPT',
    content:
      'Manipulação em câmara de fluxo laminar vertical. Verificar compatibilidade entre aminoácidos, glicose e lipídios. Atenção ao pH final da mistura. Prazo de validade máximo de 24 h após preparo sob refrigeração.',
    category: 'Geral',
    tags: ['NPT', 'nutrição', 'manipulação'],
    author: { name: 'Carlos Souza', role: 'collaborator' },
    date: '2026-05-10',
  },
  {
    id: '6',
    title: 'Interação heparina e AINEs: risco hemorrágico',
    content:
      'O uso concomitante de heparina (não fracionada ou de baixo peso molecular) com AINEs aumenta o risco de sangramento. Preferir paracetamol como analgésico/antipirético nesses pacientes. Monitorar sinais de sangramento.',
    category: 'Alertas',
    tags: ['heparina', 'AINE', 'interação', 'sangramento'],
    author: { name: 'Dra. Ana Lima', role: 'admin' },
    date: '2026-05-05',
  },
]
