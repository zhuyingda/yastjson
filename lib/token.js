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
const TokenType = {
    LeftBrace: 'left brace',
    RightBrace: 'right brace',
    LeftBracket: 'left bracket',
    RightBracket: 'right bracket',
    Comma: 'comma',
    Colon: 'colon',
    Null: 'null',
    Boolean: 'true',
    Number: 'number',
    String: 'string'
};

class Token {

    constructor(text, type, line, column) {
        this.text = text;
        this.type = type;
        this.line = line;
        this.column = column;
    }

    getType() {
        return this.type;
    }

    getText() {
        return this.text;
    }

    getPosition() {
        return {
            line: this.line,
            column: this.column
        };
    }
}

module.exports = {
    TokenType,
    Token
};