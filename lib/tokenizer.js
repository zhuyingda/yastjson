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
const Token = require('./token').Token;
const TokenType = require('./token').TokenType;
const SINGLE_CHAR_TOKEN_LIST = [
    '[',
    ']',
    '{',
    '}',
    ':',
    ','
];
const INVISIBLE_CHAR_CODE_TOKEN_LIST = [
    10,
    13,
    32
];

const STATE_INIT = 'init';
const STATE_KW_NULL = 'null';
const STATE_KW_TRUE = 'boolean_true';
const STATE_KW_FALSE = 'boolean_false';
const STATE_NUMBER = 'number';
const STATE_STRING = 'string';

class Tokenizer {
    constructor() {
        this.state = STATE_INIT;
        this.pos = 0;
        this.sourceCode = '';
        this.tokens = [];
        this.curToken = '';
    }

    tokenize(src) {
        this.sourceCode = src;

        while (this.shouldContinue()) {
            let ch = this.read();
            let state = this.state;
            switch (state) {
                case STATE_INIT:
                    this.initToken(ch)
                    break;
                case STATE_KW_NULL:
                    this.handleTokenNull(ch);
                    break;
                case STATE_KW_TRUE:
                    this.handleTokenTrue(ch);
                    break;
                case STATE_KW_FALSE:
                    this.handleTokenFalse(ch);
                    break;
                case STATE_NUMBER:
                    this.handleTokenNumber(ch);
                    break;
                case STATE_STRING:
                    this.handleTokenString(ch);
                    break;
                default:
                    throw new Error(`finite state machine get an unexpected state: ${this.state}`);
            }
        }
        return this.tokens;
    }

    shouldContinue() {
        return this.pos < this.sourceCode.length;
    }

    read() {
        const ch = this.sourceCode[this.pos];
        this.pos++;
        return ch;
    }

    peek() {
        return this.sourceCode[this.pos];
    }

    errMsg(info) {
        let frag = '';
        for (let pos = this.pos - 50; pos <= this.pos; pos++) {
            if (pos === this.pos) {
                frag += '<' + this.sourceCode[pos] + '>';
            }
            else {
                frag += this.sourceCode[pos];
            }
        }
        return info + ` char position: [${this.pos + 1}], around fragment: [${frag}]`;
    }

    initToken(ch) {
        if (SINGLE_CHAR_TOKEN_LIST.includes(ch)) {
            let token;
            switch (ch) {
                case '[':
                    token = new Token(ch, TokenType.LeftBracket);
                    break;
                case ']':
                    token = new Token(ch, TokenType.RightBracket);
                    break;
                case '{':
                    token = new Token(ch, TokenType.LeftBrace);
                    break;
                case '}':
                    token = new Token(ch, TokenType.RightBrace);
                    break;
                case ':':
                    token = new Token(ch, TokenType.Colon);
                    break;
                case ',':
                    token = new Token(ch, TokenType.Comma);
                    break;
            }
            this.tokens.push(token);
        }
        else if (!INVISIBLE_CHAR_CODE_TOKEN_LIST.includes(ch.charCodeAt(0))) {
            let err = `state INIT, unexpected token ${ch},`;
            err = this.errMsg(err);
            throw new Error(err);
        }
        let nextCh = this.peek();
        if (nextCh === undefined) {
            return;
        }
        switch (nextCh) {
            case '[':
            case ']':
            case '{':
            case '}':
            case ':':
            case ',':
                this.state = STATE_INIT;
                break;
            case 'n':
                this.state = STATE_KW_NULL;
                break;
            case 't':
                this.state = STATE_KW_TRUE;
                break;
            case 'f':
                this.state = STATE_KW_FALSE;
                break;
            case '0':
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
            case '8':
            case '9':
            case '-':
                this.state = STATE_NUMBER;
                break;
            case '\"':
                this.state = STATE_STRING;
                break;
            default:
                if (!INVISIBLE_CHAR_CODE_TOKEN_LIST.includes(nextCh.charCodeAt(0))) {
                    let err = `state INIT, unexpected token ${nextCh},`;
                    err = this.errMsg(err);
                    throw new Error(err);
                }
                break;
        }
    }

    handleTokenNull(ch) {
        switch (ch) {
            case 'n':
                if (this.curToken !== '') {
                    let err = `state NULL, unexpected token ${ch},`;
                    err = this.errMsg(err);
                    throw new Error(err);
                }
                this.curToken = ch;
                this.state = STATE_KW_NULL;
                break;
            case 'u':
                if (this.curToken !== 'n') {
                    let err = `state NULL, unexpected token ${ch},`;
                    err = this.errMsg(err);
                    throw new Error(err);
                }
                this.curToken += ch;
                this.state = STATE_KW_NULL;
                break;
            case 'l':
                this.curToken += ch;
                if (this.curToken === 'null') {
                    let token = new Token(this.curToken, TokenType.Null);
                    this.tokens.push(token);
                    this.curToken = '';
                    this.state = STATE_INIT;
                }
                else if (this.curToken === 'nul') {
                    this.state = STATE_KW_NULL;
                }
                else {
                    let err = `state NULL, unexpected token ${ch},`;
                    err = this.errMsg(err);
                    throw new Error(err);
                }
                break;
            default:
                let err = `state NULL, unexpected token ${ch},`;
                err = this.errMsg(err);
                throw new Error(err);
        }
    }

    handleTokenTrue(ch) {
        switch (ch) {
            case 't':
                if (this.curToken !== '') {
                    let err = `state TRUE, unexpected token ${ch},`;
                    err = this.errMsg(err);
                    throw new Error(err);
                }
                this.curToken = ch;
                this.state = STATE_KW_TRUE;
                break;
            case 'r':
                if (this.curToken !== 't') {
                    let err = `state TRUE, unexpected token ${ch},`;
                    err = this.errMsg(err);
                    throw new Error(err);
                }
                this.curToken += ch;
                this.state = STATE_KW_TRUE;
                break;
            case 'u':
                if (this.curToken !== 'tr') {
                    let err = `state TRUE, unexpected token ${ch},`;
                    err = this.errMsg(err);
                    throw new Error(err);
                }
                this.curToken += ch;
                this.state = STATE_KW_TRUE;
                break;
            case 'e':
                if (this.curToken !== 'tru') {
                    let err = `state TRUE, unexpected token ${ch},`;
                    err = this.errMsg(err);
                    throw new Error(err);
                }
                this.curToken += ch;
                let token = new Token(this.curToken, TokenType.Boolean);
                this.tokens.push(token);
                this.curToken = '';
                this.state = STATE_INIT;
                break;
            default:
                let err = `state TRUE, unexpected token ${ch},`;
                err = this.errMsg(err);
                throw new Error(err);
        }
    }

    handleTokenFalse(ch) {
        switch (ch) {
            case 'f':
                if (this.curToken !== '') {
                    let err = `state FALSE, unexpected token ${ch},`;
                    err = this.errMsg(err);
                    throw new Error(err);
                }
                this.curToken = ch;
                this.state = STATE_KW_FALSE;
                break;
            case 'a':
                if (this.curToken !== 'f') {
                    let err = `state FALSE, unexpected token ${ch},`;
                    err = this.errMsg(err);
                    throw new Error(err);
                }
                this.curToken += ch;
                this.state = STATE_KW_FALSE;
                break;
            case 'l':
                if (this.curToken !== 'fa') {
                    let err = `state FALSE, unexpected token ${ch},`;
                    err = this.errMsg(err);
                    throw new Error(err);
                }
                this.curToken += ch;
                this.state = STATE_KW_FALSE;
                break;
            case 's':
                if (this.curToken !== 'fal') {
                    let err = `state FALSE, unexpected token ${ch},`;
                    err = this.errMsg(err);
                    throw new Error(err);
                }
                this.curToken += ch;
                this.state = STATE_KW_FALSE;
                break;
            case 'e':
                if (this.curToken !== 'fals') {
                    let err = `state FALSE, unexpected token ${ch},`;
                    err = this.errMsg(err);
                    throw new Error(err);
                }
                this.curToken += ch;
                let token = new Token(this.curToken, TokenType.Boolean);
                this.tokens.push(token);
                this.curToken = '';
                this.state = STATE_INIT;
                break;
            default:
                let err = `state FALSE, unexpected token ${ch},`;
                err = this.errMsg(err);
                throw new Error(err);
        }
    }

    handleTokenNumber(ch) {
        let nextCh;
        switch (ch) {
            case '0':
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
            case '8':
            case '9':
                this.curToken += ch;

                nextCh = this.peek();
                if (/[0-9]|\.|\-/.test(nextCh)) {
                    this.state = STATE_NUMBER;
                }
                else {
                    let token = new Token(this.curToken, TokenType.Number);
                    this.tokens.push(token);
                    this.curToken = '';
                    this.state = STATE_INIT;
                }
                break;
            case '-':
                if (!this.curToken === '') {
                    let err = `state NUMBER, unexpected token ${ch},`;
                    err = this.errMsg(err);
                    throw new Error(err);
                }
                this.curToken += ch;
                nextCh = this.peek();
                if (/[0-9]/.test(nextCh)) {
                    this.state = STATE_NUMBER;
                }
                else {
                    let err = `state NUMBER, unexpected token ${ch},`;
                    err = this.errMsg(err);
                    throw new Error(err);
                }
                break;
            case '.':
                if (this.curToken === '' || !/[0-9]/.test(this.curToken[this.curToken.length - 1])) {
                    let err = `state NUMBER, unexpected token ${ch},`;
                    err = this.errMsg(err);
                    throw new Error(err);
                }
                this.curToken += ch;
                nextCh = this.peek();
                if (/[0-9]/.test(nextCh)) {
                    this.state = STATE_NUMBER;
                }
                else {
                    let err = `state NUMBER, unexpected token ${ch},`;
                    err = this.errMsg(err);
                    throw new Error(err);
                }
                break;
            default:
                let err = `state NUMBER, unexpected token ${ch},`;
                err = this.errMsg(err);
                throw new Error(err);
        }
    }

    handleTokenString(ch) {
        switch (ch) {
            case '\"':
                if (this.curToken === '') {
                    this.curToken = ch;
                    this.state = STATE_STRING;
                }
                else {
                    this.curToken += ch;
                    if (this.curToken[this.curToken.length - 2] === '\\') {
                        let pos = this.curToken.length - 3;
                        let slashCount = 1;
                        while (this.curToken[pos] === '\\') {
                            slashCount++;
                            pos++;
                        }
                        if (slashCount % 2 === 1) {
                            this.state = STATE_STRING;
                            break;
                        }
                    }
                    let token = new Token(this.curToken, TokenType.String);
                    this.tokens.push(token);
                    this.curToken = '';
                    this.state = STATE_INIT;
                }
                break;
            default:
                try {
                    this.curToken += ch;
                    this.state = STATE_STRING;
                }
                catch (e) {
                    let err = `state STRING, unexpected token ${ch},`;
                    err = this.errMsg(err);
                    throw new Error(err);
                }
                break;
        }
    }
}

module.exports = Tokenizer;