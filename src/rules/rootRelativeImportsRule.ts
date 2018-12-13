import * as Lint from "tslint";
import * as ts from "typescript";

export class Rule extends Lint.Rules.AbstractRule {
    public static FAILURE_STRING = "Use root relative imports";

    public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
        return this.applyWithWalker(new ImportWalker(sourceFile, this.getOptions()));
    }
}

class ImportWalker extends Lint.RuleWalker {
    public visitImportDeclaration(node: ts.ImportDeclaration) {
        if (!ts.isStringLiteral(node.moduleSpecifier)) {
            return;
        }

        const source = node.moduleSpecifier.text;
        if (source.indexOf("../") !== -1) {
            this.addFailure(this.createFailure(node.getStart(), node.getWidth(), Rule.FAILURE_STRING));
        }

        super.visitImportDeclaration(node);
    }
}
