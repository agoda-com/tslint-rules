import { getFixedResult, helper } from '../helpers/lintRunner';
import { Rule, OPTION_NO_UNDEFINED_CHECK } from './noTripleEqualsNullRule';

const rule = 'no-triple-equals-null';
const undefinedCheckRule = {
  name: rule,
  options: [OPTION_NO_UNDEFINED_CHECK],
};

describe(rule, () => {
  it('disallow === null', () => {
    const src = 'const x = "" === null;';
    const failure = helper({ src, rule }).failures[0];

    expect(failure.getFailure()).toBe(Rule.EQ_FAILURE_STRING);
  });

  it('disallow !== null', () => {
    const src = 'const x = "" !== null;';
    const failure = helper({ src, rule }).failures[0];

    expect(failure.getFailure()).toBe(Rule.NEQ_FAILURE_STRING);
  });

  it('allow === undefined when no-undefined-check is disabled', () => {
    const src = 'const x = "" === undefined;';

    const result = helper({ src, rule });
    expect(result.errorCount).toBe(0);
  });

  it('disallow === undefined', () => {
    const src = 'const x = "" === undefined;';
    const failure = helper({ src, rule: undefinedCheckRule }).failures[0];

    expect(failure.getFailure()).toBe(Rule.EQ_FAILURE_STRING);
  });

  it('disallow !== undefined', () => {
    const src = 'const x = "" !== undefined;';
    const failure = helper({ src, rule: undefinedCheckRule }).failures[0];

    expect(failure.getFailure()).toBe(Rule.NEQ_FAILURE_STRING);
  });

  it.only('disallow == undefined', () => {
    const src = 'const x = "" == undefined;';
    const failure = helper({ src, rule: undefinedCheckRule }).failures[0];

    expect(failure.getFailure()).toBe(Rule.EQ_FAILURE_STRING);
  });

  it('disallow != undefined', () => {
    const src = 'const x = "" != undefined;';
    const failure = helper({ src, rule: undefinedCheckRule }).failures[0];

    expect(failure.getFailure()).toBe(Rule.NEQ_FAILURE_STRING);
  });

  it('fix "=== null" to "== null"', () => {
    const src = 'const x = "" === null;';
    const output = 'const x = "" == null;';

    const result = helper({ src, rule });
    expect(result.errorCount).toBe(1);
    expect(getFixedResult({ src, rule })).toEqual(output);
  });

  it('fix "!== null" to "!= null"', () => {
    const src = 'const x = "" !== null;';
    const output = 'const x = "" != null;';

    const result = helper({ src, rule });
    expect(result.errorCount).toBe(1);
    expect(getFixedResult({ src, rule })).toEqual(output);
  });

  it('fix "=== undefined" to "== null"', () => {
    const src = 'const x = "" === undefined;';
    const output = 'const x = "" == null;';

    const result = helper({ src, rule: undefinedCheckRule });
    expect(result.errorCount).toBe(1);
    expect(getFixedResult({ src, rule: undefinedCheckRule })).toEqual(output);
  });

  it('fix "!== undefined" to "!= null"', () => {
    const src = 'const x = "" !== undefined;';
    const output = 'const x = "" != null;';

    const result = helper({ src, rule: undefinedCheckRule });
    expect(result.errorCount).toBe(1);
    expect(getFixedResult({ src, rule: undefinedCheckRule })).toEqual(output);
  });
});
