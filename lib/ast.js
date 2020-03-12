/**
 * Copyright (c) 2020 5u9ar (zhuyingda)
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
const TokenType = require('./token').TokenType;
const Token = require('./token').Token;
const ExprType = require('./expression').ExprType;

const util = {
    mapValue: function (obj) {
        let out = [];
        for (let key in obj) {
            out.push(obj[key]);
        }
        return out;
    },
    deepCopyTokens: function (tokens) {
        let cpTokens = [];
        for (let token of tokens) {
            let newToken = new Token(token.getText(), token.getType());
            cpTokens.push(newToken);
        }
        return cpTokens;
    },
    copySingleToken: function (token) {
        let newToken = new Token(token.getText(), token.getType());
        return newToken;
    }
};

class ASTNode {
    constructor(tokens, type, parentNode) {
        const terminalSignals = util.mapValue(TokenType);
        const nonTerminalSignals = util.mapValue(ExprType);
        if (terminalSignals.includes(type)) {
            this.type = type;
            this.isTerm = true;
            this.tokens = util.deepCopyTokens(tokens);
        }
        else if (nonTerminalSignals.includes(type)) {
            this.type = type;
            this.isTerm = false;
        }
        this.parentNode = parentNode;
        this.childNodeList = [];
    }

    addChild(node) {
        this.childNodeList.push(node);
    }
}

class AST {
    constructor(tokens) {
        this.tokens = tokens;
        this.buildTree();
    }

    buildTree() {
        let rootNode = this.handleExprJson(this.tokens, null);
        return rootNode;
    }

    handleExprJson(tokens, parent) {
        let node = new ASTNode(tokens, ExprType.Json, parent);
        let firstToken = tokens[0];

        if (firstToken.getType() === TokenType.LeftBracket) {
            let arrayExpr = this.handleExprArray(util.deepCopyTokens(tokens), node);
            node.addChild(arrayExpr);
        }
        else if (firstToken.getType() === TokenType.LeftBrace) {
            let objectExpr = this.handleExprObject(util.deepCopyTokens(tokens), node);
            node.addChild(objectExpr);
        }
        else {
            throw new Error(`[json expression error] unexpected token ${firstToken}`);
        }

        return node;
    }

    handleExprArray(tokens, parent) {
        let firstToken = tokens[0];
        let lastToken = tokens[tokens.length - 1];
        if (firstToken.getType() !== TokenType.LeftBracket
            || lastToken.getType() !== TokenType.RightBracket) {
            throw new Error(`[array expression error] wrong bracket token`);
        }

        // empty array
        if (tokens.length === 2
            && tokens[0].getType() === TokenType.LeftBracket
            && tokens[1].getType() === TokenType.RightBracket) {
            return new ASTNode(tokens, ExprType.Array, parent);
        }

        let node = new ASTNode(tokens, ExprType.Array, parent);
        let index = 1;
        let valueTokens = [];
        let vfStack = [];
        let expectComma = true;
        for (; index < tokens.length - 1; index++) {
            let token = tokens[index];
            if (token.getType() === TokenType.Comma
                && expectComma
                && isValueFinish(vfStack)) {
                let valueExpr = this.handleExprValue(util.deepCopyTokens(valueTokens), node);
                valueTokens = [];
                node.addChild(valueExpr);
            }
            else {
                if (token.getType() === TokenType.RightBrace
                    || token.getType() === TokenType.RightBracket) {
                    let flag = token.getType();
                    vfStack.push(flag);
                }
                else if (token.getType() === TokenType.LeftBrace
                    || token.getType() === TokenType.LeftBracket) {
                    let flag = token.getType();
                    vfStack.push(flag);
                    expectComma = false;
                }

                valueTokens.push(util.copySingleToken(token));

                if (isValueFinish(vfStack)) {
                    expectComma = true;
                    vfStack = [];
                }
            }
        }

        // last array value
        let valueExpr = this.handleExprValue(util.deepCopyTokens(valueTokens), node);
        node.addChild(valueExpr);

        return node;
    }

    handleExprObject(tokens, parent) {
        let firstToken = tokens[0];
        let lastToken = tokens[tokens.length - 1];
        if (firstToken.getType() !== TokenType.LeftBrace
            || lastToken.getType() !== TokenType.RightBrace) {
            throw new Error(`[object expression error] wrong brace token`);
        }

        // empty object
        if (tokens.length === 2
            && tokens[0].getType() === TokenType.LeftBrace
            && tokens[1].getType() === TokenType.RightBrace) {
            return new ASTNode(tokens, ExprType.Object, parent);
        }

        let node = new ASTNode(tokens, ExprType.Object, parent);
        let index = 1;
        let propExprNode;
        let propTokens = [];
        let valueTokens = [];
        let vfStack = [];
        let state = 'prop';
        for (; index < tokens.length - 1; index++) {
            let token = tokens[index];
            if (token.getType() === TokenType.Colon
                && state === 'prop') {
                propExprNode = this.handleExprProp(util.deepCopyTokens(propTokens), node);
                propTokens = [];
                state = 'value';
            }
            else if (token.getType() === TokenType.Comma
                && state === 'prop'
                && isValueFinish(vfStack)) {
                let valueExpr = this.handleExprValue(util.deepCopyTokens(valueTokens), node);
                valueTokens = [];
                propExprNode.addChild(valueExpr);
                node.addChild(propExprNode);
            }
            else {
                switch (state) {
                    case 'prop':
                        if (propTokens.length !== 0) {
                            throw new Error('[object expression error] prop state got unexpected token');
                        }
                        propTokens.push(util.copySingleToken(token));
                        break;
                    case 'value':
                        if (token.getType() === TokenType.RightBracket
                            || token.getType() === TokenType.RightBrace
                            || token.getType() === TokenType.LeftBracket
                            || token.getType() === TokenType.LeftBrace) {
                            let flag = token.getType();
                            vfStack.push(flag);
                        }

                        valueTokens.push(util.copySingleToken(token));

                        if (isValueFinish(vfStack)) {
                            state = 'prop';
                        }
                        break;
                    default:
                        throw new Error('[object expression error] unexpected state');
                }
            }
        }

        // last prop value
        let valueExpr = this.handleExprValue(util.deepCopyTokens(valueTokens), node);
        propExprNode.addChild(valueExpr);
        node.addChild(propExprNode);

        return node;
    }

    handleExprProp(tokens, parent) {
        if (tokens.length !== 1 || tokens[0].getType() !== TokenType.String) {
            throw new Error('[prop expression error] invalid tokens input');
        }

        let node = new ASTNode(tokens, ExprType.Prop, parent);
        let propName = tokens[0].getText();
        propName = propName.slice(1, propName.length - 1);
        node.propName = propName;

        return node;
    }

    handleExprValue(tokens, parent) {
        if (tokens.length === 0) {
            throw new Error('[value expression error] empty value expr');
        }
        if (tokens.length !== 1
            && tokens[0].getType() !== TokenType.LeftBracket
            && tokens[0].getType() !== TokenType.LeftBrace) {
            throw new Error('[value expression error] invalid tokens input');
        }

        let node = new ASTNode(util.deepCopyTokens(tokens), ExprType.Value, parent);

        if (tokens.length === 1) {
            let tokenType = tokens[0].getType();
            switch (tokenType) {
                case TokenType.Null:
                case TokenType.Boolean:
                case TokenType.Number:
                case TokenType.String:
                    node.value = new ASTNode(util.deepCopyTokens(tokens), tokenType, node);
                    break;
                default:
                    throw new Error('[value expression error] unknown single token type');
            }
        }
        else {
            node.value = this.handleExprJson(util.deepCopyTokens(tokens), ExprType.json, node);
        }

        return node;
    }
}

function isValueFinish(stack) {
    let braceCount = 0;
    let bracketCount = 0;
    for (let token of stack) {
        switch (token) {
            case TokenType.LeftBrace:
                braceCount++;
                break;
            case TokenType.LeftBracket:
                bracketCount++;
                break;
            case TokenType.RightBrace:
                braceCount--;
                break;
            case TokenType.RightBracket:
                bracketCount--;
                break;
            default:
                break;
        }
    }

    if (braceCount === 0 && bracketCount === 0) {
        return true;
    }
    else if (braceCount < 0) {
        throw new Error('[isValueFinish] got unexpected token brace \'}\'');
    }
    else if (bracketCount < 0) {
        throw new Error('[isValueFinish] got unexpected token bracket \']\'');
    }
    else {
        return false;
    }
}

module.exports = {
    ASTNode,
    AST
};