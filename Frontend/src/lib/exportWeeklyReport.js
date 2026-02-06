const escapeCsvValue = (value) => {
  if (value === null || value === undefined) return '';
  const stringValue = String(value);
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
};

const formatDate = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const exportWeeklyReport = ({
  reportTitle = 'Executive Overview',
  visibilityScope = 'All Teams',
  summaryCards = [],
  focusAreas = [],
  tasks = [],
} = {}) => {
  const now = new Date();
  const fileStamp = formatDate(now);
  const fileName = `weekly-report-${fileStamp}.csv`;
  const rows = [];

  rows.push(['Report Title', reportTitle]);
  rows.push(['Generated At', now.toISOString()]);
  rows.push(['Visibility Scope', visibilityScope]);
  rows.push([]);
  rows.push(['Summary Snapshot']);
  rows.push(['Label', 'Value', 'Meta']);
  summaryCards.forEach((card) => rows.push([card.label, card.value, card.meta]));
  rows.push([]);
  rows.push(['Critical Focus Areas']);
  rows.push(['Workstream', 'Owner', 'Progress %']);
  focusAreas.forEach((focus) => rows.push([focus.title, focus.owner, focus.progress]));
  rows.push([]);
  rows.push(['Tasks']);
  rows.push(['Title', 'Status', 'Owner']);
  if (tasks.length === 0) {
    rows.push(['No tasks available', '', '']);
  } else {
    tasks.forEach((task) => rows.push([task.title, task.status, task.assignee || 'Unassigned']));
  }

  const csvContent = rows
    .map((row) => row.map(escapeCsvValue).join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return fileName;
};
