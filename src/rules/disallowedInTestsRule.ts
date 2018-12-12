import * as Lint from "tslint";
import * as ts from "typescript";

interface ICustomOption {
    name: string;
    message: string;
}

export class Rule extends Lint.Rules.AbstractRule {
    public static DEFAULT_FAILURE_STRING = "This method invocation is not allowed to be used on test files";

    public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
        return this.applyWithWalker(new DisallowedInTestsWalker(sourceFile, this.getOptions()));
    }
}

class DisallowedInTestsWalker extends Lint.RuleWalker {
    public visitCallExpression(node: ts.CallExpression) {
        const fileName: string = node && node.getSourceFile().fileName || "";
        const isTestFile: boolean = new RegExp("\\b" + ".test" + "\\b").test(fileName);
        const functionName: string = node && node.expression && node.expression.getText() || "";
        const verifiedCustomOptions: ICustomOption[] = this.verifyAndGetCustomOptions(functionName);

        if (isTestFile && verifiedCustomOptions.length > 0) {
            this.addFailure(
                this.createFailure(node.getStart(),
                node.getWidth(),
                verifiedCustomOptions[0].message || Rule.DEFAULT_FAILURE_STRING));
        }
        super.visitCallExpression(node);
    }

    private verifyAndGetCustomOptions(functionName: string): ICustomOption[] {
        const customOptionSetInTslintJson: ICustomOption[] = this.getOptions();
        const verifiedCustomOptions: ICustomOption[] = customOptionSetInTslintJson.filter((option) => option && option.name === functionName);
        return verifiedCustomOptions;
    }
}
