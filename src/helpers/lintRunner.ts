import * as path from 'path';
import { Configuration, Linter, Replacement } from 'tslint';

export const helper = ({ src, rule }: any) => {
  const linter = new Linter({ fix: false });
  linter.lint(
    '',
    src,
    Configuration.parseConfigFile({
      rules: {
        [rule.name || rule]: [true, ...rule.options],
      },
      rulesDirectory: path.join(__dirname, '..', 'rules'),
    }),
  );
  return linter.getResult();
};

export const getFixedResult = ({ src, rule }: any) => {
  const result = helper({ src, rule });

  if (!result.failures.length) {
    return null;
  }
  const fixes = result.failures[0].getFix();

  if (fixes) {
    return Replacement.applyFixes(src, [fixes]);
  }

  return null;
};
