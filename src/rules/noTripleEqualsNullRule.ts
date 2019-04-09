import * as Lint from 'tslint';
import * as ts from 'typescript';

export const OPTION_NO_UNDEFINED_CHECK = 'no-undefined-check';

export class Rule extends Lint.Rules.AbstractRule {
  public static EQ_FAILURE_STRING = 'Did you mean == null instead?';
  public static NEQ_FAILURE_STRING = 'Did you mean != null instead?';

  public static metadata: Lint.IRuleMetadata = {
    ruleName: 'no-undefined-or-null-comparison',
    description: 'Disallows comparisons to `undefined` or `null`.',
    optionsDescription: Lint.Utils.dedent `
        One argument may be optionally provided:

        * \`"no-undefined-check"\` set to true: disallows comparisons to \`undefined\`.`,
    options: {
      type: 'array',
      items: {
        type: 'string',
        enum: [OPTION_NO_UNDEFINED_CHECK],
      },
      minLength: 0,
      maxLength: 1,
    },
    optionExamples: [
      true,
        [true, 'allow-undefined-check'],
    ],
    type: 'functionality',
    typescriptOnly: false,
  };

  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    const noTripleEqualsNullWalker = new NoTripleEqualsNullWalker(
      sourceFile,
      this.getOptions(),
    );
    return this.applyWithWalker(noTripleEqualsNullWalker);
  }
}

class NoTripleEqualsNullWalker extends Lint.RuleWalker {
  public visitBinaryExpression(node: ts.BinaryExpression) {
    if (this.isExpressionAllowed(node)) {
      this.handleBinaryComparison(node);
    }

    super.visitBinaryExpression(node);
  }

  private handleBinaryComparison(node: ts.BinaryExpression) {
    const { left, right, operatorToken } = node;
    const {
      NullKeyword,
      UndefinedKeyword,
      EqualsEqualsEqualsToken,
      ExclamationEqualsEqualsToken,
      EqualsEqualsToken,
      ExclamationEqualsToken,
    } = ts.SyntaxKind;
    const checkUndefined = this.hasOption(OPTION_NO_UNDEFINED_CHECK);
    const isNotTripleEqual = operatorToken.kind !== EqualsEqualsEqualsToken;
    const isNotTripleExcEqual = operatorToken.kind !== ExclamationEqualsEqualsToken;
    const isNotDoubleEqual = operatorToken.kind !== EqualsEqualsToken;
    const isNotDoubleExcEqual = operatorToken.kind !== ExclamationEqualsToken;

    if ((isNotTripleEqual && isNotTripleExcEqual && !checkUndefined)
        || (checkUndefined && isNotTripleEqual && isNotTripleExcEqual && isNotDoubleEqual && isNotDoubleExcEqual)) {
      return;
    }

    const isLeft = left.kind === NullKeyword
      || (checkUndefined && (left.kind === UndefinedKeyword || left.getText() === 'undefined'));
    const failureText = !isNotTripleEqual || !isNotDoubleEqual ? Rule.EQ_FAILURE_STRING : Rule.NEQ_FAILURE_STRING;

    if (isLeft) {
      const position = left.getStart();
      const expressionWidth = left.getWidth() + node.getChildAt(1).getFullWidth();

      this.addFailure(
        this.createFailure(
          position,
          expressionWidth,
          failureText,
          this.fix(position, expressionWidth, isLeft ? 'left' : 'right', operatorToken.kind),
        ),
      );
    } else {
      const position = node.getChildAt(1).getStart();
      const expressionWidth = node.getChildAt(1).getFullWidth() + right.getWidth();

      this.addFailure(
        this.createFailure(
          position,
          expressionWidth,
          failureText,
          this.fix(position, expressionWidth, isLeft ? 'left' : 'right', operatorToken.kind),
        ),
      );
    }
  }

  private isExpressionAllowed(node: ts.BinaryExpression) {
    const { NullKeyword, UndefinedKeyword } = ts.SyntaxKind;
    const leftKind = node.left.kind;
    const rightKind = node.right.kind;
    const foundExpression = leftKind === NullKeyword || rightKind === NullKeyword;

    if (this.hasOption(OPTION_NO_UNDEFINED_CHECK)) {
      return foundExpression
        || leftKind === UndefinedKeyword
        || rightKind === UndefinedKeyword
        || node.left.getText() === 'undefined'
        || node.right.getText() === 'undefined';
    }

    return foundExpression;
  }

  private fix(
    position: number,
    expressionWidth: number,
    side: 'left' | 'right',
    operatorType: ts.BinaryOperator,
  ): Lint.Fix {
    const { EqualsEqualsEqualsToken } = ts.SyntaxKind;
    const operator = operatorType === EqualsEqualsEqualsToken ? '==' : '!=';

    if (side === 'left') {
      return new Lint.Replacement(position, expressionWidth, `null ${operator}`);
    }

    return new Lint.Replacement(position, expressionWidth, `${operator} null`);
  }
}
