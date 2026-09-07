const fs=require('fs');
const path=require('path');

const files = [
  'src/app/books/page.tsx',
  'src/app/categories/page.tsx',
  'src/app/authors/page.tsx',
  'src/app/users/page.tsx',
  'src/app/audit-logs/page.tsx',
  'src/app/sessions/page.tsx',
  'src/app/profile/page.tsx',
  'src/app/dashboard/page.tsx',
];

// Common CSS that is now in globals.css - we will remove these from inline <style>
const commonPatterns = [
  /\.panel\{[^}]+\}/g,
  /\.panel__head\{[^}]+\}/g,
  /\.panel__head h3\{[^}]+\}/g,
  /\.panel__head p\{[^}]+\}/g,
  /\.table-toolbar\{[^}]+\}/g,
  /\.table-toolbar \.search-box\{[^}]+\}/g,
  /\.table-toolbar \.search-box input\{[^}]+\}/g,
  /\.table-toolbar \.search-box input::placeholder\{[^}]+\}/g,
  /\.table-toolbar select\.filter-select\{[^}]+\}/g,
  /\.table-scroll\{[^}]+\}/g,
  /table\{[^}]+\}/g,
  /thead th\{[^}]+\}/g,
  /tbody td\{[^}]+\}/g,
  /tbody tr:last-child td\{[^}]+\}/g,
  /tbody tr:hover\{[^}]+\}/g,
  /\.cell-title\{[^}]+\}/g,
  /\.cell-muted\{[^}]+\}/g,
  /\.badge\{[^}]+\}/g,
  /\.badge-success\{[^}]+\}/g,
  /\.badge-neutral\{[^}]+\}/g,
  /\.badge-admin\{[^}]+\}/g,
  /\.badge-staff\{[^}]+\}/g,
  /\.badge-user\{[^}]+\}/g,
  /\.badge-book\{[^}]+\}/g,
  /\.badge-audit\{[^}]+\}/g,
  /\.empty\{[^}]+\}/g,
  /\.empty h4\{[^}]+\}/g,
  /\.section-head\{[^}]+\}/g,
  /\.section-head h2\{[^}]+\}/g,
  /\.section-head p\{[^}]+\}/g,
];

for(const fp of files){
  let t=fs.readFileSync(fp,'utf8');
  const originalLen = t.length;
  // Find <style>{` ... `}</style> block
  const styleRegex = /<style>\{`([\s\S]*?)`\}<\/style>/;
  const m=t.match(styleRegex);
  if(!m){
    console.log('no style',fp);
    continue;
  }
  let css=m[1];
  const originalCssLen=css.length;
  // Remove common patterns, but keep widths and specific
  // For books/categories etc, we want to keep thead th width rules
  // So we should NOT remove thead th if it contains width
  // Our commonPatterns for thead th would remove all, but we want to keep width rules
  // Instead, we will extract width rules and keep them
  const widthMatches = [...css.matchAll(/thead th[^{]*\{[^}]*width:[^}]+\}/g)];
  const widthCss = widthMatches.map(m=>m[0]).join('');
  // Also keep specific like .stat-grid, .preview etc for dashboard
  // For now, for each file, we will keep only width rules and remove rest that are common
  // If file is dashboard, keep its specific .stat-grid etc
  let isDashboard = fp.includes('dashboard');
  if(isDashboard){
    // Keep .stat-grid, .stat-card, .grid-2, .activity-list etc, remove common panel/table etc
    // So we remove common but keep widths for dashboard? Dashboard has no table widths, so just remove common and keep stat-grid
    // For dashboard, we should keep .stat-grid etc, remove panel/table etc
    // Our removal will do that
  }
  // Remove all common patterns
  for(const pat of commonPatterns){
    css=css.replace(pat, '');
  }
  // Re-add width rules if any
  if(widthCss){
    css = widthCss + css;
  }
  // Clean up extra whitespace, remove empty lines with just ;
  css=css.replace(/\s+/g,' ').trim();
  // If css is mostly empty or just widths, keep it, otherwise keep
  // If css becomes empty or only whitespace, remove the entire <style> block
  if(css.length < 20){
    t=t.replace(styleRegex, '');
    console.log('removed style block',fp, 'original',originalCssLen,'->',css.length);
  } else {
    // Replace the style block with cleaned css
    // Need to reconstruct
    const newStyle = `<style>{\`${css}\`}</style>`;
    t=t.replace(styleRegex, newStyle);
    console.log('cleaned',fp, originalCssLen,'->',css.length, 'kept widths:',widthCss.length);
  }
  fs.writeFileSync(fp,t,'utf8');
}
console.log('done');
