import chalk from 'chalk';

// This blog post saved my sanity:
// https://www.bennadel.com/blog/3295-using-chalk-2-0s-tagged-template-literals-for-nested-and-complex-styling.htm
export const chalky = (parts, ...substitutions) => {
  const rawResults = [];
  const cookedResults = [];

  const partsLength = parts.length;
  const substitutionsLength = substitutions.length;

  for (let i = 0; i < partsLength; i++) {
    rawResults.push(parts.raw[i]);
    cookedResults.push(parts[i]);

    if (i < substitutionsLength) {
      rawResults.push(substitutions[i]);
      cookedResults.push(substitutions[i]);
    }
  }

  const chalkParts = [cookedResults.join('')];
  // @ts-ignore
  chalkParts.raw = [rawResults.join('')];

  // @ts-ignore
  return chalk(chalkParts);
};
