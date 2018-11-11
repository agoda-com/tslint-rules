import * as ts from "typescript";
import * as Lint from "tslint";

export class Rule extends Lint.Rules.AbstractRule {
    public static FAILURE_STRING = "Should not have mount and snapshot in the same test case";

    public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
        // only run the rule on test files
        if (!new RegExp("\\b" + ".test" + "\\b").test(sourceFile.fileName)) {
            return;
        }

        return this.applyWithWalker(new NoMountAndSnapshotWalker(sourceFile, this.getOptions()));
    }
}

class NoMountAndSnapshotWalker extends Lint.RuleWalker {
    public visitCallExpression(node: ts.CallExpression) {
        const functionName: string = node && node.expression && node.expression.getText() || "";

        if (functionName === "it" && this.verify(["mount", "toMatchSnapshot"], node.getText())) {
            this.addFailure(this.createFailure(node.getStart(), node.getWidth(), Rule.FAILURE_STRING));
        }
        super.visitCallExpression(node);
    }
    private verify(bannedList: string[], str: string): boolean {
        const result = bannedList.map((bannedItem) => {
            if (new RegExp("\\b" + bannedItem + "\\b").test(str)) {
                return bannedItem;
            }
            return null;
        })
        .filter((value, index, accumulator) => value && accumulator.indexOf(value) === index);
        return result.length === 2;
    }
}
