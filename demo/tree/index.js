// load demo
const demo = location.search.substr(1);
if (demo) {
  const src = './examples/' + demo + '.js';
  const script = document.createElement('script');
  script.src = src;
  script.type = 'module';
  document.head.appendChild(script);  
}
