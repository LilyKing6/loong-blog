// Lightweight Markdown -> HTML renderer (regex-based, no dependencies)
// Supports: headings h1-h4, bold, italic, strikethrough, inline code,
// code blocks, images, links, tables, task lists, ordered/unordered lists,
// nested lists, blockquotes, horizontal rules.

function escapeHtml(text) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function renderInline(text) {
  return text
    // Images
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.+?)__/g, '<strong>$1</strong>')
    // Strikethrough
    .replace(/~~(.+?)~~/g, '<del>$1</del>')
    // Italic
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/_(.+?)_/g, '<em>$1</em>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>');
}

function renderMarkdown(md) {
  if (!md) return '';

  // Escape HTML first
  let text = escapeHtml(md);

  // Extract code blocks before processing (protect from other transformations)
  const codeBlocks = [];
  text = text.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
    const idx = codeBlocks.length;
    codeBlocks.push('<pre><code>' + code.replace(/\n$/, '') + '</code></pre>');
    return '\x00CODEBLOCK' + idx + '\x00';
  });

  // Split into lines for block-level processing
  const lines = text.split('\n');
  const blocks = [];
  let i = 0;

  while (i < lines.length) {
    let line = lines[i];

    // Code block placeholder
    const codeMatch = line.match(/^\x00CODEBLOCK(\d+)\x00$/);
    if (codeMatch) {
      blocks.push(codeBlocks[parseInt(codeMatch[1])]);
      i++;
      continue;
    }

    // Empty line
    if (line.trim() === '') { i++; continue; }

    // Headings (h1-h4)
    let m;
    if (m = line.match(/^#### (.+)$/)) { blocks.push('<h4>' + renderInline(m[1]) + '</h4>'); i++; continue; }
    if (m = line.match(/^### (.+)$/)) { blocks.push('<h3>' + renderInline(m[1]) + '</h3>'); i++; continue; }
    if (m = line.match(/^## (.+)$/)) { blocks.push('<h2>' + renderInline(m[1]) + '</h2>'); i++; continue; }
    if (m = line.match(/^# (.+)$/)) { blocks.push('<h1>' + renderInline(m[1]) + '</h1>'); i++; continue; }

    // Horizontal rule
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(line.trim())) { blocks.push('<hr>'); i++; continue; }

    // Table: detect header row + separator row
    if (line.includes('|') && i + 1 < lines.length && /^\s*\|?[\s\-:|]+\|?\s*$/.test(lines[i + 1]) && lines[i + 1].includes('-')) {
      const headerCells = line.split('|').map(c => c.trim()).filter((c, idx, arr) => {
        // Keep empty cells that are between pipes
        if (c === '' && (idx === 0 || idx === arr.length - 1)) return false;
        return true;
      });
      // Parse alignment from separator
      const sepCells = lines[i + 1].split('|').map(c => c.trim());
      const aligns = sepCells.map(s => {
        if (/^:.*:$/.test(s)) return 'center';
        if (/:$/.test(s)) return 'right';
        return 'left';
      });
      i += 2;
      const bodyRows = [];
      while (i < lines.length && lines[i].includes('|') && lines[i].trim() !== '') {
        const cells = lines[i].split('|').map(c => c.trim());
        // Remove leading/trailing empty from pipe edges
        if (cells[0] === '') cells.shift();
        if (cells[cells.length - 1] === '') cells.pop();
        bodyRows.push(cells);
        i++;
      }
      let table = '<table><thead><tr>';
      headerCells.forEach((cell, idx) => {
        const align = aligns[idx] || 'left';
        table += '<th style="text-align:' + align + '">' + renderInline(cell) + '</th>';
      });
      table += '</tr></thead><tbody>';
      bodyRows.forEach(row => {
        table += '<tr>';
        headerCells.forEach((_, idx) => {
          const align = aligns[idx] || 'left';
          table += '<td style="text-align:' + align + '">' + renderInline(row[idx] || '') + '</td>';
        });
        table += '</tr>';
      });
      table += '</tbody></table>';
      blocks.push(table);
      continue;
    }

    // Blockquote (multi-line)
    if (line.match(/^&gt;\s?/)) {
      const quoteLines = [];
      while (i < lines.length && lines[i].match(/^&gt;\s?/)) {
        quoteLines.push(lines[i].replace(/^&gt;\s?/, ''));
        i++;
      }
      blocks.push('<blockquote>' + renderInline(quoteLines.join(' ')) + '</blockquote>');
      continue;
    }

    // Task list items (- [ ] or - [x])
    if (line.match(/^-\s+\[[ xX]\]\s+/)) {
      const items = [];
      while (i < lines.length && lines[i].match(/^-\s+\[[ xX]\]\s+/)) {
        const checked = /\[[xX]\]/.test(lines[i]);
        const content = lines[i].replace(/^-\s+\[[ xX]\]\s+/, '');
        items.push('<li class="task-list-item"><input type="checkbox" disabled' + (checked ? ' checked' : '') + '> ' + renderInline(content) + '</li>');
        i++;
      }
      blocks.push('<ul class="task-list">' + items.join('') + '</ul>');
      continue;
    }

    // Unordered list (with nesting via indentation)
    if (line.match(/^(\s*)-\s+/)) {
      const listHtml = parseList(lines, i, 'ul');
      blocks.push(listHtml.html);
      i = listHtml.nextIndex;
      continue;
    }

    // Ordered list
    if (line.match(/^(\s*)\d+\.\s+/)) {
      const listHtml = parseList(lines, i, 'ol');
      blocks.push(listHtml.html);
      i = listHtml.nextIndex;
      continue;
    }

    // Code block placeholder (inline with other text)
    if (line.match(/\x00CODEBLOCK\d+\x00/)) {
      blocks.push(line.replace(/\x00CODEBLOCK(\d+)\x00/g, (_, idx) => codeBlocks[parseInt(idx)]));
      i++;
      continue;
    }

    // Paragraph: collect consecutive non-empty, non-block lines
    const paraLines = [];
    while (i < lines.length && lines[i].trim() !== '' &&
      !lines[i].match(/^#{1,4}\s/) &&
      !lines[i].match(/^(-{3,}|\*{3,}|_{3,})$/) &&
      !lines[i].match(/^(\s*)-\s+/) &&
      !lines[i].match(/^(\s*)\d+\.\s+/) &&
      !lines[i].match(/^&gt;\s?/) &&
      !lines[i].match(/^-\s+\[[ xX]\]\s+/) &&
      !(lines[i].includes('|') && i + 1 < lines.length && /^\s*\|?[\s\-:|]+\|?\s*$/.test(lines[i + 1]) && lines[i + 1].includes('-')) &&
      !lines[i].match(/^\x00CODEBLOCK\d+\x00$/)
    ) {
      paraLines.push(lines[i]);
      i++;
    }
    if (paraLines.length > 0) {
      blocks.push('<p>' + renderInline(paraLines.join(' ')) + '</p>');
    }
  }

  // Restore code blocks
  let html = blocks.join('\n');
  html = html.replace(/\x00CODEBLOCK(\d+)\x00/g, (_, idx) => codeBlocks[parseInt(idx)]);

  return html;
}

// Parse nested list (handles indentation levels)
function parseList(lines, startIdx, listType) {
  const items = [];
  let i = startIdx;
  const baseIndent = (lines[startIdx].match(/^(\s*)/) || ['', ''])[1].length;

  while (i < lines.length) {
    const line = lines[i];
    if (line.trim() === '') { i++; continue; }

    const indent = (line.match(/^(\s*)/) || ['', ''])[1].length;
    if (indent < baseIndent) break;

    // Check if this line is still a list item
    const ulMatch = line.match(/^(\s*)-\s+(.+)$/);
    const olMatch = line.match(/^(\s*)\d+\.\s+(.+)$/);

    if (indent === baseIndent) {
      if (ulMatch && listType === 'ul') {
        items.push('<li>' + renderInline(ulMatch[2]) + '</li>');
        i++;
      } else if (olMatch && listType === 'ol') {
        items.push('<li>' + renderInline(olMatch[2]) + '</li>');
        i++;
      } else {
        break;
      }
    } else if (indent > baseIndent) {
      // Nested list — recursively parse
      const nested = parseList(lines, i, ulMatch ? 'ul' : 'ol');
      if (items.length > 0) {
        // Append nested list to last item
        items[items.length - 1] = items[items.length - 1].replace(/<\/li>$/, '') + nested.html + '</li>';
      }
      i = nested.nextIndex;
    } else {
      break;
    }
  }

  return { html: '<' + listType + '>' + items.join('') + '</' + listType + '>', nextIndex: i };
}

// Extract TOC entries from markdown headings
function extractTOC(md) {
  if (!md) return [];
  const headings = [];
  const lines = md.split('\n');
  for (const line of lines) {
    const h4 = line.match(/^#### (.+)$/);
    const h3 = line.match(/^### (.+)$/);
    const h2 = line.match(/^## (.+)$/);
    const h1 = line.match(/^# (.+)$/);
    if (h1) headings.push({ level: 1, text: h1[1] });
    else if (h2) headings.push({ level: 2, text: h2[1] });
    else if (h3) headings.push({ level: 3, text: h3[1] });
    else if (h4) headings.push({ level: 4, text: h4[1] });
  }
  return headings;
}

module.exports = { renderMarkdown, extractTOC };
