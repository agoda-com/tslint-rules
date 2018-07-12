import { isCallExpression, isIdentifier, isPropertyAccessExpression } from "tsutils";
import * as ts from "typescript";
import * as Lint from "tslint";

interface FunctionDoNotUse {
    name: string;
    message?: string;
}
interface MethodDoNotUse extends FunctionDoNotUse {
    object: string[];
}

interface Options {
    functions: FunctionDoNotUse[];
    methods: MethodDoNotUse[];
}

interface OptionsInput {
    name: string | string[];
    message?: string;
}

export class Rule extends Lint.Rules.AbstractRule {
    /* tslint:disable:object-literal-sort-keys */
    public static metadata: Lint.IRuleMetadata = {
        ruleName: "do-not-use",
        description: "Prints out a warning that this function / method should not be used",
        optionsDescription: "Please check https://palantir.github.io/tslint/rules/ban/",
        options: {
            type: "list",
            listType: {
                anyOf: [
                    {
                        type: "string",
                    },
                    {
                        type: "array",
                        items: {type: "string"},
                        minLength: 1,
                        maxLength: 3,
                    },
                    {
                        type: "object",
                        properties: {
                            name: {
                                anyOf: [
                                    {type: "string"},
                                    {type: "array", items: {type: "string"}, minLength: 1},
                                ],
                            },
                            message: {type: "string"},
                        },
                        required: ["name"],
                    },
                ],
            },
        },
        optionExamples: [
            [
                true,
                "eval",
                {name: "$", message: "please don't"},
                ["describe", "only"],
                {name: ["it", "only"], message: "don't focus tests"},
                {name: ["chai", "assert", "equal"], message: "Use 'strictEqual' instead."},
                {name: ["*", "forEach"], message: "Use a regular for loop instead."},
            ],
        ],
        type: "functionality",
        typescriptOnly: false,
    };
    /* tslint:enable:object-literal-sort-keys */

    public static FAILURE_STRING_FACTORY(expression: string, messageAddition?: string) {
        return `Usage of '${expression}' is strongly discouraged.${messageAddition !== undefined ? ` ${messageAddition}` : ""}`;
    }

    public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
        return this.applyWithWalker(new DoNotUseFunctionWalker(sourceFile, this.ruleName, parseOptions(this.ruleArguments)));
    }
}

function parseOptions(args: Array<string | string[] | OptionsInput>): Options {
    const functions: FunctionDoNotUse[] = [];
    const methods: MethodDoNotUse[] = [];
    for (const arg of args) {
        if (typeof arg === "string") {
            functions.push({name: arg});
        } else if (Array.isArray(arg)) {
            switch (arg.length) {
                case 0:
                    break;
                case 1:
                    functions.push({name: arg[0]});
                    break;
                default:
                    methods.push({object: [arg[0]], name: arg[1], message: arg[2]});
            }
        } else if (!Array.isArray(arg.name)) {
            functions.push(arg as FunctionDoNotUse);
        } else {
            switch (arg.name.length) {
                case 0:
                    break;
                case 1:
                    functions.push({name: arg.name[0], message: arg.message});
                    break;
                default:
                    methods.push({name: arg.name[arg.name.length - 1], object: arg.name.slice(0, -1), message: arg.message});
            }
        }
    }
    return { functions, methods };
}

class DoNotUseFunctionWalker extends Lint.AbstractWalker<Options> {
    public walk(sourceFile: ts.SourceFile) {
        const cb = (node: ts.Node): void => {
            if (isCallExpression(node)) {
                if (isIdentifier(node.expression)) {
                    this.checkFunctionDoNotUse(node.expression);
                } else if (isPropertyAccessExpression(node.expression)) {
                    this.checkForObjectMethodDoNotUse(node.expression);
                }
            }
            return ts.forEachChild(node, cb);
        };
        return ts.forEachChild(sourceFile, cb);
    }

    private checkForObjectMethodDoNotUse(expression: ts.PropertyAccessExpression) {
        for (const ban of this.options.methods) {
            if (expression.name.text !== ban.name) { continue; }
            let current = expression.expression;
            for (let i = ban.object.length - 1; i > 0; --i) {
                if (!isPropertyAccessExpression(current) || current.name.text !== ban.object[i]) { continue; }
                current = current.expression;
            }
            if (ban.object[0] === "*" ||
                isIdentifier(current) && current.text === ban.object[0]) {
                this.addFailureAtNode(expression, Rule.FAILURE_STRING_FACTORY(`${ban.object.join(".")}.${ban.name}`, ban.message));
                break;
            }
        }
    }

    private checkFunctionDoNotUse(name: ts.Identifier) {
        const {text} = name;
        for (const ban of this.options.functions) {
            if (ban.name === text) {
                this.addFailureAtNode(name, Rule.FAILURE_STRING_FACTORY(text, ban.message));
                break;
            }
        }
    }
}
