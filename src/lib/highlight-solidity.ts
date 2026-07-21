function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

const KEYWORDS =
  "contract|is|function|constructor|modifier|struct|event|mapping|returns|return|public|external|internal|private|view|pure|payable|memory|calldata|storage|import|pragma|require|emit|if|else|new|indexed|immutable|constant|nonpayable";

const TYPES = "address|bool|string|bytes32|bytes|uint256|uint8|int256";

const TOKEN_REGEX = new RegExp(
  `(\\/\\/[^\\n]*)|("(?:[^"\\\\]|\\\\.)*")|\\b(${KEYWORDS})\\b|\\b(${TYPES})\\b|\\b(\\d+)\\b`,
  "g"
);

/** Returns HTML with span-wrapped tokens; caller is responsible for a <pre><code> wrapper. */
export function highlightSolidity(code: string): string {
  let result = "";
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  TOKEN_REGEX.lastIndex = 0;

  while ((match = TOKEN_REGEX.exec(code))) {
    result += escapeHtml(code.slice(lastIndex, match.index));
    const [full, comment, str, keyword, typeKw, num] = match;
    if (comment) result += `<span class="sol-comment">${escapeHtml(comment)}</span>`;
    else if (str) result += `<span class="sol-string">${escapeHtml(str)}</span>`;
    else if (keyword) result += `<span class="sol-keyword">${escapeHtml(keyword)}</span>`;
    else if (typeKw) result += `<span class="sol-type">${escapeHtml(typeKw)}</span>`;
    else if (num) result += `<span class="sol-number">${escapeHtml(num)}</span>`;
    lastIndex = match.index + full.length;
  }
  result += escapeHtml(code.slice(lastIndex));
  return result;
}
