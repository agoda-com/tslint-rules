import * as ts from "typescript";
import * as Lint from "tslint";

export class Rule extends Lint.Rules.AbstractRule {
    public static FAILURE_STRING = "Should not invoke setTimeout function in the test file";

    public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
        // only run the rule on test files
        if (!new RegExp("\\b" + ".test" + "\\b").test(sourceFile.fileName)) {
            return;
        }

        return this.applyWithWalker(new NoSetTimeoutInTestWalker(sourceFile, this.getOptions()));
    }
}

class NoSetTimeoutInTestWalker extends Lint.RuleWalker {
    public visitCallExpression(node: ts.CallExpression) {
        const functionName: string = node && node.expression && node.expression.getText() || "";

        if (functionName === "setTimeout") {
            this.addFailure(this.createFailure(node.getStart(), node.getWidth(), Rule.FAILURE_STRING));
        }
        super.visitCallExpression(node);
    }
}
