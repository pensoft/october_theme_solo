(function(){
  var wrap = document.querySelector('[data-promo]'); if(!wrap) return;
  var btns = wrap.querySelectorAll('.promo-filter button');
  var cards = wrap.querySelectorAll('[data-cat]');
  var empty = wrap.querySelector('[data-empty]');
  function apply(cat){
    var shown = 0;
    cards.forEach(function(c){
      var ok = cat === 'all' || c.getAttribute('data-cat') === cat;
      c.classList.toggle('promo-hide', !ok);
      if(ok) shown++;
    });
    if(empty) empty.hidden = shown > 0;
  }
  btns.forEach(function(b){
    b.addEventListener('click', function(){
      btns.forEach(function(x){ x.classList.remove('active'); x.setAttribute('aria-selected','false'); });
      b.classList.add('active'); b.setAttribute('aria-selected','true');
      apply(b.getAttribute('data-filter'));
    });
  });
})();
