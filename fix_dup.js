const fs=require('fs');
const files=[
 'src/app/categories/page.tsx',
 'src/app/authors/page.tsx',
 'src/app/users/page.tsx',
 'src/app/audit-logs/page.tsx',
 'src/app/sessions/page.tsx',
 'src/app/dashboard/page.tsx',
];
for(const fp of files){
  let t=fs.readFileSync(fp,'utf8');
  // The style block has duplicated widths: find and remove second copy
  // For each file, the duplicated part is the same as first, separated by space
  // We will find the first occurrence of 'thead th:first-child' and remove the second duplicate that starts after a space
  // Simple: if t contains the duplicated pattern with two identical sequences, replace second with ''
  // We can detect by finding the style content and checking for duplicate
  const styleMatch = t.match(/<style>\{`([\s\S]*?)`}<\/style>/);
  if(!styleMatch) continue;
  let css = styleMatch[1];
  // Count occurrences of 'thead th:first-child'
  const count = (css.match(/thead th:first-child/g) || []).length;
  if(count > 1){
    // Find the second occurrence index
    const firstIdx = css.indexOf('thead th:first-child');
    const secondIdx = css.indexOf('thead th:first-child', firstIdx+1);
    if(secondIdx !== -1){
      // Find the end of the second block: look for 'tbody td:last-child' after secondIdx
      const endMarker = 'tbody td:last-child{padding:10px 12px;text-align:center}';
      const endIdx = css.indexOf(endMarker, secondIdx);
      if(endIdx !== -1){
        const secondBlock = css.slice(secondIdx, endIdx + endMarker.length);
        // Remove one occurrence (the second)
        // The CSS has " ...firstBlock + ' ' + secondBlock"
        // So we need to remove " " + secondBlock
        const fullDup = ' ' + secondBlock;
        if(css.includes(fullDup)){
          css = css.replace(fullDup, '');
        } else {
          css = css.replace(secondBlock, '');
        }
        css = css.replace(/\s+/g, ' ').trim();
        const newStyle = '<style>{`' + css + '`}</style>';
        t = t.replace(/<style>\{`[\s\S]*?`}<\/style>/, newStyle);
        fs.writeFileSync(fp, t);
        console.log('dedup fixed', fp, 'count was', count);
      }
    }
  } else {
    console.log('no dup', fp);
  }
}
