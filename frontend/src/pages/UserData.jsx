import { useEffect, useState } from 'react';
import { buildApiUrl } from '../lib/apiClient';
import './UserData.css';

const fields = [
  'zipCode',
  'collaborationMode',
  'gender',
  'background',
  'race',
  'income',
  'household',
  'language',
  'education'
];

function summarizeUsers(users) {
  const ages = users
    .map((user) => user.parentAge === null || user.parentAge === undefined || user.parentAge === ''
      ? Number.NaN
      : Number(user.parentAge))
    .filter((age) => Number.isFinite(age));

  const distributions = Object.fromEntries(fields.map((field) => {
    const counts = new Map();
    let respondents = 0;

    users.forEach((user) => {
      const answer = user[field];
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

    return [field, { respondents, choices }];
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

export default function UserData() {
  const [users, setUsers] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    fetch(buildApiUrl('api/aggregate-data'))
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to load aggregate user data');
        }

        return response.json();
      })
      .then((data) => {
        if (!Array.isArray(data)) {
          throw new Error('Aggregate user data response must be a list');
        }

        if (isMounted) setUsers(data);
      })
      .catch((fetchError) => {
        if (isMounted) setError(fetchError.message);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (error) return <pre>{error}</pre>;
  if (users === null) return <pre>Loading...</pre>;

  return <pre>{JSON.stringify(summarizeUsers(users), null, 2)}</pre>;
}