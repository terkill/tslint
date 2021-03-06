/*
 * Copyright 2013 Palantir Technologies, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

export class Rule extends Lint.Rules.AbstractRule {
    public static FAILURE_STRING = "missing type declaration";

    public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
        const typedefWalker = new TypedefWalker(sourceFile, this.getOptions());
        return this.applyWithWalker(typedefWalker);
    }
}

class TypedefWalker extends Lint.RuleWalker {
    public visitFunctionDeclaration(node: ts.FunctionDeclaration) {
        this.handleCallSignature(node);
        super.visitFunctionDeclaration(node);
    }

    public visitFunctionExpression(node: ts.FunctionExpression) {
        this.handleCallSignature(node);
        super.visitFunctionExpression(node);
    }

    public visitGetAccessor(node: ts.AccessorDeclaration) {
        this.handleCallSignature(node);
        super.visitGetAccessor(node);
    }

    public visitMethodDeclaration(node: ts.MethodDeclaration) {
        this.handleCallSignature(node);
        super.visitMethodDeclaration(node);
    }

    public visitMethodSignature(node: ts.SignatureDeclaration) {
        this.handleCallSignature(node);
        super.visitMethodSignature(node);
    }

    public visitObjectLiteralExpression(node: ts.ObjectLiteralExpression) {
        for (let property of node.properties) {
            switch (property.kind) {
                case ts.SyntaxKind.PropertyAssignment:
                    this.visitPropertyAssignment(<ts.PropertyAssignment> property);
                    break;
                case ts.SyntaxKind.MethodDeclaration:
                    this.visitMethodDeclaration(<ts.MethodDeclaration> property);
                    break;
                case ts.SyntaxKind.GetAccessor:
                    this.visitGetAccessor(<ts.AccessorDeclaration> property);
                    break;
                case ts.SyntaxKind.SetAccessor:
                    this.visitSetAccessor(<ts.AccessorDeclaration> property);
                    break;
            }
        }
    }

    public visitParameterDeclaration(node: ts.ParameterDeclaration) {
        // a parameter's "type" could be a specific string value, for example `fn(option: "someOption", anotherOption: number)`
        if (node.type == null || node.type.kind !== ts.SyntaxKind.StringLiteral) {
            this.checkTypeAnnotation("parameter", node.getEnd(), <ts.TypeNode> node.type, node.name);
        }
        super.visitParameterDeclaration(node);
    }

    public visitPropertyAssignment(node: ts.PropertyAssignment) {
        switch (node.initializer.kind) {
            case ts.SyntaxKind.ArrowFunction:
            case ts.SyntaxKind.FunctionExpression:
                this.handleCallSignature(<ts.FunctionExpression> node.initializer);
                break;
        }
        super.visitPropertyAssignment(node);
    }

    public visitPropertyDeclaration(node: ts.PropertyDeclaration) {
        const optionName = "member-variable-declaration";
        this.checkTypeAnnotation(optionName, node.name.getEnd(), node.type, node.name);
        super.visitPropertyDeclaration(node);
    }

    public visitPropertySignature(node: ts.PropertyDeclaration) {
        const optionName = "property-declaration";
        this.checkTypeAnnotation(optionName, node.name.getEnd(), node.type, node.name);
        super.visitPropertySignature(node);
    }

    public visitSetAccessor(node: ts.AccessorDeclaration) {
        this.handleCallSignature(node);
        super.visitSetAccessor(node);
    }

    public visitVariableDeclaration(node: ts.VariableDeclaration) {
        // first parent is the variableDeclarationList, grandparent would be the for-in statement
        if (node.parent.parent.kind !== ts.SyntaxKind.ForInStatement
                && node.parent.kind !== ts.SyntaxKind.CatchClause) {
            this.checkTypeAnnotation("variable-declaration", node.name.getEnd(), node.type, node.name);
        }
        super.visitVariableDeclaration(node);
    }

    private handleCallSignature(node: ts.SignatureDeclaration) {
        const location = (node.parameters != null) ? node.parameters.end : null;
        // set accessors can't have a return type.
        if (node.kind !== ts.SyntaxKind.SetAccessor) {
            this.checkTypeAnnotation("call-signature", location, node.type, node.name);
        }
    }

    private checkTypeAnnotation(option: string,
                                location: number,
                                typeAnnotation: ts.TypeNode,
                                name?: ts.Node) {
        if (this.hasOption(option) && typeAnnotation == null) {
            let ns = "";
            if (name != null && name.kind === ts.SyntaxKind.Identifier) {
                ns = `: '${(<ts.Identifier> name).text}'`;
            }
            let failure = this.createFailure(location, 1, "expected " + option + ns + " to have a typedef");
            this.addFailure(failure);
        }
    }
}
