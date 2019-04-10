import * as Lint from 'tslint';
import * as ts from 'typescript';

export class Rule extends Lint.Rules.AbstractRule {
  public static FAILURE_STRING =
    'Should not have mount and snapshot in the same test case';

  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    return this.applyWithWalker(
      new NoMountAndSnapshotWalker(sourceFile, this.getOptions()),
    );
  }
}

class NoMountAndSnapshotWalker extends Lint.RuleWalker {
  public visitCallExpression(node: ts.CallExpression) {
    const fileName: string = (node && node.getSourceFile().fileName) || '';
    const isTestFile: boolean = new RegExp('\\b' + '.test' + '\\b').test(
      fileName,
    );
    const functionName: string =
      (node && node.expression && node.expression.getText()) || '';

    if (
      isTestFile &&
      functionName === 'it' &&
      this.verify(['mount', 'toMatchSnapshot'], node.getText())
    ) {
      this.addFailure(
        this.createFailure(
          node.getStart(),
          node.getWidth(),
          Rule.FAILURE_STRING,
        ),
      );
    }
    super.visitCallExpression(node);
  }
  private verify(bannedList: string[], str: string): boolean {
    const result: Array<string | null> = bannedList
      .map((bannedItem) => {
        if (new RegExp(`\\b${bannedItem}\\b`).test(str)) {
          return bannedItem;
        }
        return null;
      })
      .filter(
        (value, index, accumulator) =>
          value && accumulator.indexOf(value) === index,
      );
    return result && result.length === 2;
  }
}
