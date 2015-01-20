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

module Lint {
    // TODO: rename this class
    export class SyntaxWalker {
        public visitBinaryExpression(node: ts.BinaryExpression) {
            //
        }

        public visitClassDeclaration(node: ts.ClassDeclaration) {
            //
        }

        public visitInterfaceDeclaration(node: ts.InterfaceDeclaration) {
            //
        }

        public visitNode(node: ts.Node) {
            //
        }

        public walk(node: ts.Node) {
            this.visitNode(node);

            switch (node.kind) {
                case ts.SyntaxKind.ClassDeclaration:
                    this.visitClassDeclaration(<ts.ClassDeclaration> node);
                    break;

                case ts.SyntaxKind.InterfaceDeclaration:
                    this.visitInterfaceDeclaration(<ts.InterfaceDeclaration> node);
                    break;

                case ts.SyntaxKind.BinaryExpression:
                    this.visitBinaryExpression(<ts.BinaryExpression> node);
                    break;
            }

            ts.forEachChild(node, (child) => this.walk(child));
        }
    }
}