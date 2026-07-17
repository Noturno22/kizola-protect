const fs = require('fs');
const langs = ['en','pt','es','es-US','fr','zh','ja','ko','vi','tl','ar','ru','hi','bn','ln'];
langs.forEach(function(l) {
  const f = 'assets/translations/' + l + '.json';
  if (fs.existsSync(f)) {
    try {
      const j = JSON.parse(fs.readFileSync(f, 'utf8'));
      const cats = ['tax','immigration','housing','legal','career','health','finance','education','safety','community','work'];
      let m = 0;
      cats.forEach(function(c) {
        for (let i = 1; i <= 5; i++) {
          ['title','description','content'].forEach(function(k) {
            if (j.learn && j.learn.articles && j.learn.articles[c] && j.learn.articles[c][i] && j.learn.articles[c][i][k]) {} else { m++; }
          });
        }
      });
      console.log(l + ': ' + (m === 0 ? 'COMPLETO' : 'FALTAM ' + m + ' CHAVES'));
    } catch(e) {
      console.log(l + ': ERRO JSON - ' + e.message);
    }
  } else {
    console.log(l + ': NAO EXISTE');
  }
});
