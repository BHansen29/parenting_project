import * as XLSX from 'xlsx';
import { useEffect, useState } from 'react';
import { buildApiUrl } from '../lib/apiClient';
import { auth } from '../lib/firebase';
import './UserData.css';

const fields = [
  { key: 'zipCode', label: 'ZIP code' },
  { key: 'collaborationMode', label: 'Parenting plan approach' },
  { key: 'gender', label: 'Gender' },
  { key: 'background', label: 'Background' },
  { key: 'race', label: 'Race / ethnicity' },
  { key: 'income', label: 'Household income' },
  { key: 'household', label: 'Household size' },
  { key: 'language', label: 'Language' },
  { key: 'education', label: 'Education' }
];

const choiceLabels = {
  collaborationMode: {
    'locked-individual': 'Locked-individual',
    collaborative: 'Collaborative',
    individual: "Individual"
  },
  gender: {
    'female/feminine': 'Female/Feminine',
    'male/masculine': 'Male/Masculine',
    other: 'Other',
    prefer_not_to_answer: 'Prefer not to answer'
  },
  background: {
    'hispanic/latino': 'Hispanic/Latino',
    mena: 'MENA',
    other: 'Not Hispanic/Latino, not MENA',
    prefer_not_to_answer: 'Prefer not to answer/Unknown ethnicity'
  },
  race: {
    african: 'African',
    black: 'Black or African American',
    american_indian: 'American Indian or Alaska Native',
    asian: 'Asian or Asian American',
    middle_eastern: 'Middle Eastern or North African',
    pacific_islander: 'Pacific Islander or Native Hawaiian',
    white: 'White or European American',
    'bi-racial': 'Bi-racial',
    multi_racial: 'Multiple races/Multi-racial',
    other: 'Race not listed/Other',
    prefer_not_to_answer: 'Prefer not to answer'
  },
  income: {
    under_5k: 'Below $4,999',
    under_10k: '$5,000-$9,999',
    under_20k: '$10,000-$19,999',
    under_40k: '$20,000-$39,999',
    under_60k: '$40,000-$59,999',
    under_80k: '$60,000-$79,999',
    under_90k: '$80,000-$89,999',
    under_100k: '$90,000-$99,999',
    over_100k: 'Over $100,000',
    prefer_not_to_answer: 'Prefer not to answer'
  },
  household: {
    '1': '1 person',
    '2': '2 person',
    '3': '3 person',
    '4': '4 person',
    '5': '5 person',
    '6': '6 person',
    '7': '7 person',
    '8': '8 person',
    '9': '9 person',
    over_10: '10+ person',
    prefer_not_to_answer: 'Prefer not to answer'
  },
  language: {
    amharic: 'Amharic',
    arabic: 'Arabic',
    asian: 'Asian and Pacific Islander languages',
    english: 'English',
    french: 'French',
    haitian: 'Haitian Creole',
    nepali: 'Nepali',
    somali: 'Somali',
    spanish: 'Spanish',
    pashto: 'Pashto',
    other: 'Other languages',
    prefer_not_to_answer: 'Prefer not to answer'
  },
  education: {
    none: 'No degree or diploma earned/Less than high school diploma',
    high_school: 'High school or General Education Development (GED)',
    trade: 'Trade/Vocational/Technical Certification/Child Development Associate (CDA)',
    some_college: 'Some college, no degree',
    associate: "Associate's degree",
    bachelor: "Bachelor's degree",
    master: "Master's degree",
    phd: 'Doctorate or Professional degree',
    prefer_not_to_answer: 'Prefer not to answer'
  }
};

function formatChoiceLabel(fieldKey, value) {
  return choiceLabels[fieldKey]?.[value] ?? value;
}

function formatExportValue(value, fieldKey) {
  if (Array.isArray(value)) {
    return value
      .map((item) => item === null || item === undefined
        ? ''
        : formatChoiceLabel(fieldKey, String(item)))
      .join(', ');
  }
  if (fieldKey && value !== null && value !== undefined) {
    return formatChoiceLabel(fieldKey, String(value));
  }
  return value ?? '';
}

export function summarizeUsers(users) {
  const ages = users
    .map((user) => user.parentAge === null || user.parentAge === undefined || user.parentAge === ''
      ? Number.NaN
      : Number(user.parentAge))
    .filter((age) => Number.isFinite(age));

  const distributions = Object.fromEntries(fields.map(({ key }) => {
    const counts = new Map();
    let respondents = 0;

    users.forEach((user) => {
      const answer = user[key];
      const values = (Array.isArray(answer) ? answer : [answer])
        .map((value) => typeof value === 'string' ? value.trim() : value)
        .filter((value) => value !== null && value !== undefined && value !== '')
        .map(String);
      const uniqueValues = [...new Set(values)];

      if (uniqueValues.length === 0) return;
      respondents += 1;
      uniqueValues.forEach((value) => {
        counts.set(value, (counts.get(value) ?? 0) + 1);
      });
    });

    const choices = Object.fromEntries(
      [...counts.entries()]
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([value, count]) => [
          value,
          {
            count,
            percentage: Math.round((count / respondents) * 1000) / 10
          }
        ])
    );

    return [key, { respondents, choices }];
  }));

  return {
    planRecords: users.length,
    averageParentAge: ages.length
      ? Math.round((ages.reduce((total, age) => total + age, 0) / ages.length) * 10) / 10
      : null,
    parentAgeRespondents: ages.length,
    distributions
  };
}

export function exportAggregateData(users, summary) {
  const summaryRows = [
    ['Field', 'Choice', 'Count', 'Percentage'],
    ['Overview', 'Plans represented', summary.planRecords, ''],
    ['Overview', 'Average parent age', summary.averageParentAge ?? '', ''],
    ['Overview', 'Parent age responses', summary.parentAgeRespondents, '']
  ];

  fields.forEach((field) => {
    Object.entries(summary.distributions[field.key].choices).forEach(([value, choice]) => {
      summaryRows.push([
        field.label,
        formatChoiceLabel(field.key, value),
        choice.count,
        `${choice.percentage}%`
      ]);
    });
  });

  const responseRows = users.map((user) => Object.fromEntries([
    ['Parent age', formatExportValue(user.parentAge)],
    ...fields.map((field) => [
      field.label,
      formatExportValue(user[field.key], field.key)
    ])
  ]));

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(summaryRows), 'Summary');
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(responseRows), 'Responses');

  const workbookData = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const downloadUrl = URL.createObjectURL(new Blob([workbookData], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  }));
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = `aggregate-data-${new Date().toISOString().slice(0, 10)}.xlsx`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(downloadUrl);
}

function DistributionCard({ field, distribution }) {
  const choices = Object.entries(distribution.choices);
  const totalSelections = choices.reduce((total, [, choice]) => total + choice.count, 0);
  let offset = 0;
  const slices = choices.map(([value, choice], index) => {
    const start = offset;
    offset += (choice.count / totalSelections) * 100;
    return `${chartColors[index % chartColors.length]} ${start}% ${offset}%`;
  });
  const chartStyle = {
    background: choices.length
      ? `conic-gradient(${slices.join(', ')})`
      : 'conic-gradient(#e5e7eb 0% 100%)'
  };

  return (
    <article className="user-data__distribution-card">
      <div className="user-data__distribution-heading">
        <h2>{field.label}</h2>
        <span>{distribution.respondents} responses</span>
      </div>
      {choices.length === 0 ? (
        <p className="user-data__empty">No responses yet</p>
      ) : (
        <div className="user-data__chart-content">
          <div
            className="user-data__donut"
            role="img"
            aria-label={`${field.label} distribution across ${totalSelections} selections`}
            style={chartStyle}
          >
            <span className="user-data__donut-center">
              <strong>{totalSelections}</strong>
              <span>selections</span>
            </span>
          </div>
          <ul className="user-data__legend">
            {choices.map(([value, choice], index) => (
              <li key={value}>
                <span
                  className="user-data__legend-swatch"
                  style={{ backgroundColor: chartColors[index % chartColors.length] }}
                  aria-hidden="true"
                />
                <span
                  className="user-data__legend-label"
                  title={formatChoiceLabel(field.key, value)}
                >
                  {formatChoiceLabel(field.key, value)}
                </span>
                <span className="user-data__legend-count">
                  {choice.count}
                  <span className="user-data__legend-percent">{choice.percentage}%</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </article>
  );
}

const chartColors = [
  '#2563eb',
  '#7c3aed',
  '#db2777',
  '#ea580c',
  '#16a34a',
  '#0891b2',
  '#ca8a04',
  '#4f46e5'
];

export default function UserData({ onDataLoaded }) {
  const [users, setUsers] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadAggregateData = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          throw new Error('Sign in with an administrator account to view aggregate data');
        }

        const idToken = await currentUser.getIdToken();
        const response = await fetch(buildApiUrl('api/aggregate-data'), {
          headers: { Authorization: `Bearer ${idToken}` }
        });
        if (!response.ok) {
          throw new Error(response.status === 403
            ? 'Administrator access required'
            : 'Failed to load aggregate user data');
        }

        const data = await response.json();
        if (!Array.isArray(data)) {
          throw new Error('Aggregate user data response must be a list');
        }

        if (isMounted) {
          setUsers(data);
          onDataLoaded?.(data, summarizeUsers(data));
        }
      } catch (fetchError) {
        if (isMounted) setError(fetchError.message);
      }
    };

    loadAggregateData();

    return () => {
      isMounted = false;
    };
  }, []);

  if (error) {
    return (
      <main className="user-data">
        <p className="user-data__error" role="alert">{error}</p>
      </main>
    );
  }
  if (users === null) {
    return <main className="user-data" aria-busy="true"><p>Loading aggregate data...</p></main>;
  }

  const summary = summarizeUsers(users);

  return (
    <main className="user-data">
      <header className="user-data__header">
        <div>
          <p className="user-data__eyebrow">Community overview</p>
          <h1>Aggregate data dashboard</h1>
          <p>Explore the demographics and preferences represented in parenting plans.</p>
        </div>
      </header>

      <section className="user-data__metrics" aria-label="Summary statistics">
        <article className="user-data__metric-card">
          <span className="user-data__metric-label">Plans represented</span>
          <strong>{summary.planRecords.toLocaleString()}</strong>
          <span className="user-data__metric-note">Aggregate plan records</span>
        </article>
        <article className="user-data__metric-card">
          <span className="user-data__metric-label">Average parent age</span>
          <strong>{summary.averageParentAge === null ? '—' : summary.averageParentAge}</strong>
          <span className="user-data__metric-note">
            {summary.parentAgeRespondents.toLocaleString()} age responses
          </span>
        </article>
      </section>

      <section className="user-data__distributions" aria-labelledby="user-data-distributions-title">
        <div className="user-data__section-heading">
          <div>
            <h2 id="user-data-distributions-title">Response distributions</h2>
            <p>Counts show how many plans selected each response. Percentages are of respondents.</p>
          </div>
          <p className="user-data__data-note">
            A plan may include multiple selections, so percentages can add up to more than 100%.
            The total reflects plans, not unique users.
          </p>
        </div>
        <div className="user-data__distribution-grid">
          {fields.map((field) => (
            <DistributionCard
              key={field.key}
              field={field}
              distribution={summary.distributions[field.key]}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
