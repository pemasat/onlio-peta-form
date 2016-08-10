Web Skeleton
============

Obsah
-----

Gulp:   
- scss -> css   
- autoprefixer   
- spojeni všech js souborů do main.js   
- watch   
- sprity

Bower:   
- jquery   

První spuštení
--------------

V přikazovém řadku ve složce frontend spustit přikazy
   
    npm install
    bower install

Gulp
----
Spustit build
    
    gulp   
Spustit watch funkce
    
    gulp watch

Poslední změny
--------------

1. Do gulpfile přidan task na vytvoření spritů, protože skoro vždy ho potřebujeme
2. gulp-clean vyměnen za del z duvodu - "depreciated"
3. V FyzioVojtau se použiva vždy poslední verze pluginů (v package.json misto čisla verze je 'latest')
4. Přidany ukazky spritů. V img/sprites/test a test2 jsou puvodní obrazky, ve složce img - sprite-test.png a sprite-test2.png - konečné obrazky (sprity), ve složce scss/sprites scss soubory pro sprity. Přiklad použití v main.scss