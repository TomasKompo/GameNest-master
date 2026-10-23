// public/js/tutorials-cs-authored.js — ručně psaná česká pravidla.
//
// Načítá se až za vygenerovaným tutorials-cs.js a přepisuje jeho strojový
// překlad. Generátor i18n-cs.js tento soubor nikdy nepřepisuje, takže česká
// pravidla zůstanou i po regeneraci jazykových balíčků.
(function() {
  window.__TUTORIALS_CS_AUTHORED = {
    '2048': {
      sections: [
        { h: 'Cíl', p: 'Každý hráč má vlastní desku 4×4 a všichni začínají na stejných dvou destičkách. Vyhrává ten, kdo jako první složí destičku 2048. Hrát může 1–4 hráči, chybějící místa lze doplnit boty.' },
        { h: 'Jak hrát', steps: [
          'Pohybujete se šipkami nebo přejetím prstem: nahoru, dolů, doleva, doprava.',
          'Všechny destičky se posunou zvoleným směrem. Dvě sousední destičky se stejným číslem se spojí do jejich součtu.',
          'Každá destička se může v jednom tahu sloučit jen jednou.',
          'Po každém platném tahu se na náhodné volné pole objeví nová destička: z 90 % dvojka, z 10 % čtyřka.',
        ] },
        { h: 'Konec hry', p: 'První destička 2048 okamžitě ukončí hru a jejímu majiteli dá výhru. Pokud se všechny desky zablokují a nikdo nemá 2048, vyhrává nejvyšší skóre; při shodě je remíza. Sólo hra končí prohrou, jakmile se deska zablokuje bez 2048.' },
        { h: 'Ovládání a tipy', p: 'Tahy, které nic neposunou, server odmítne. Držte největší destičku v rohu a používejte hlavně dva směry (např. doleva a dolů). Řádek s klesajícími čísly se pak skládá mnohem snáz.' },
      ]
    },
    tictactoe: {
      sections: [
        { h: 'Cíl', p: 'Na mřížce 3×3 vytvořte jako první tři své značky v řadě — vodorovně, svisle nebo diagonálně. Všech osm možných řad je platných.' },
        { h: 'Jak hrát', steps: [
          'Hráč na sedadle 1 hraje křížky (X) a začíná, hráč na sedadle 2 hraje kolečka (O).',
          'Ve svém tahu klikněte na volné pole. Značka se už nedá přesunout ani vzít zpět.',
          'Po každém tahu se kontroluje, jestli nevznikla řada tří stejných značek.',
        ] },
        { h: 'Konec hry', p: 'Kdo dokončí řadu, okamžitě vyhrává. Když se zaplní všech devět polí a nikdo nemá řadu, je to remíza. Hrát mohou jen dva hráči; soupeře lze nahradit botem.' },
        { h: 'Tipy', p: 'První tah do středu nebo rohu je nejsilnější. Než zahrajete, zkontrolujte, jestli soupeř nemá dvě značky v řadě — v takovém případě ho musíte zablokovat.' },
      ]
    },
    gomoku: {
      sections: [
        { h: 'Cíl', p: 'Na desce 15×15 postavte jako první pět nebo více svých kamenů v souvislé řadě — vodorovně, svisle nebo diagonálně.' },
        { h: 'Jak hrát', steps: [
          'Černý hráč (sedadlo 1) začíná, potom se střídáte po jednom tahu.',
          'Kliknutím na volný průsečík položíte kámen. Kameny se nikdy nepohybují, nejdou zajmout ani vrátit.',
          'Vítězná řada musí mít alespoň pět kamenů. Šest a více v řadě je také výhra — v této verzi nejsou zakázané tahy.',
        ] },
        { h: 'Konec hry', p: 'Jakmile tah vytvoří pět kamenů v řadě, hráč vyhrává. Když se zaplní všech 225 průsečíků bez pěti v řadě, je hra remízou.' },
        { h: 'Zápas', p: 'Hostitel může zvolit jednu hru, nejlepší ze 3 nebo nejlepší z 5. Mezi hrami se sedadla vymění, takže se střídá i první tah.' },
        { h: 'Tipy', p: 'Otevřená trojka se dá prodloužit na otevřenou čtyřku, kterou soupeř neuhlídá. Jako druhý hráč nejdřív blokujte soupeřovy trojky a čtyřky; jako první se snažte vytvořit dvě hrozby najednou.' },
      ]
    },
    davinci: {
      sections: [
        { h: 'Cíl', p: 'Odhalte všechny destičky soupeřů. Kdo zůstane poslední se skrytými destičkami, vyhrává. Při 2–3 hráčích má každý 4 destičky, při 4 hráčích 3.' },
        { h: 'Příprava', p: 'Balíček má 26 destiček: černé 0–11, bílé 0–11 a dvě divoké (★). Destičky v ruce jsou seřazené od nejmenší po největší; stejné číslo má černou vlevo a bílou vpravo. Divoká destička zůstává přesně tam, kam ji umístíte. Barvy jsou vidět všem, čísla jsou skrytá.' },
        { h: 'Průběh tahu', steps: [
          'Doberte si jednu destičku z balíčku — vidíte ji jen vy.',
          'Klikněte na skrytou destičku soupeře a zvolte číslo, nebo použijte „Hádej ★“ na divokou destičku.',
          'Správný odhad destičku otočí. Můžete hádat dál, nebo tah ukončit tlačítkem „Pass“.',
          'Špatný odhad: doberte si destičku lícem dolů do své řady a pak musíte otočit jednu svou dosud skrytou destičku.',
          'Pass bez hádání: vložte doberanou destičku do své řady a předejte tah.',
        ] },
        { h: 'Konec hry a tipy', p: 'Hráč, kterému se otočí všechny destičky, vypadává. Poslední hráč ve hře vyhrává. Počítejte, která čísla už jsou vidět, a hádejte hlavně krajní hodnoty; divokou destičku si nechte na pozdější jistotu.' },
      ]
    },
    uno: {
      sections: [
        { h: 'Cíl', p: 'Zbav se jako první všech karet. Hraje 2–6 hráčů, každý začíná se 7 kartami. Balíček má 108 karet: čísla 0–9, přeskočení, otočení, +2, divokou a divokou +4.' },
        { h: 'Jak hrát', steps: [
          'První otočená karta je vždy číslo, takže nic nespouští. Začíná hráč na sedadle 0 a hraje se po směru hodinových ručiček.',
          'Zahraj kartu stejné barvy, stejného čísla nebo stejného symbolu, jako má vrchní karta. Divokou kartu můžeš zahrát vždy a zvolit novou barvu; +4 jen tehdy, když v ruce nemáš kartu aktuální barvy.',
          'Když nemáš hratelnou kartu, dober si jednu. Pokud je líznutá karta hratelná, můžeš ji hned zahrát, nebo tah ukončit tlačítkem „Ukončit tah“.',
        ] },
        { h: 'Speciální karty', p: 'Přeskočení vynechá dalšího hráče. Otočení změní směr hry; ve dvou hráčích funguje jako přeskočení. +2 nutí dalšího hráče líznout si 2 karty a vynechat tah, +4 čtyři karty a vynechat tah. Karty +2 a +4 se nesčítají a +4 se nevyzývá — další hráč si prostě bere karty.' },
        { h: 'Nula a sedmička', p: 'Pravidlo nuly: kdo zahraje 0, předá celou ruku dalšímu hráči ve směru hry a dostane ruku od předchozího hráče. Pravidlo sedmičky: kdo zahraje 7, může si vyměnit celou ruku s libovolným hráčem u stolu. Obě pravidla lze před startem vypnout v nastavení hry.' },
        { h: 'Volání UNO', p: 'Jakmile někomu po zahrání zůstane jediná karta, objeví se všem hráčům přes celou obrazovku velké tlačítko UNO. Kdo klikne první, rozhodne: hráč s jednou kartou je v bezpečí, nebo si bere 2 trestné karty. Kdo do vypršení času neklikne, bere si 2 karty.' },
        { h: 'Konec a nastavení', p: 'Vyhrává hráč, který se jako první zbaví všech karet. Poslední kartou může být i speciální karta a její efekt se ještě vyřeší. Před spuštěním hry hostitel nastavuje pravidlo nuly, pravidlo sedmičky a čas na zakřičení UNO.' },
      ]
    },
    doudizhu: {
      sections: [
        { h: 'Cíl', p: 'Hrají tři hráči: jeden statkář proti dvěma sedlákům. Statkář vyhraje, když se zbaví všech karet jako první. Sedláci vyhrají, jakmile se zbaví všech karet jeden z nich. Chybějící hráče doplní AI.' },
        { h: 'Příprava a nabídky', p: 'Balíček má 54 karet: každý dostane 17 a tři karty zůstanou jako koťátko. V režimu „Call and Rob“ se postupně volá nebo přihrává; poslední volající nebo lupič se stane statkářem a vezme si koťátko. V režimu skóre se nabízí 0–3 body a vyhrává nejvyšší nabídka. Volání násobí skóre ×3, každé okradení ×2.' },
        { h: 'Kombinace', p: 'Jednotlivé karty, páry, trojice, trojice + 1, trojice + 2, postupka (5 a více po sobě), po sobě jdoucí páry (3 a více), letadlo (po sobě jdoucí trojice), čtyři + 2 jednotlivci nebo dva páry, bomba (čtyři stejné) a raketa (dvě žolíky). Postupky, dvojice a letadla nesmějí obsahovat dvojky ani žolíky.' },
        { h: 'Průběh tahu', p: 'Statkář začíná a může zahrát libovolnou kombinaci. Další hráč musí zahrát stejný typ a stejný počet karet, ale vyšší, nebo použít bombu/raketu, případně passovat. Po dvou passech za sebou vede poslední hráč znovu volně. Pořadí karet je 3 < 4 < 5 < 6 < 7 < 8 < 9 < 10 < J < Q < K < A < 2 < černý žolík < červený žolík.' },
        { h: 'Bodování a konec', p: 'Základ kola je 100 bodů: výhra statkáře +200 jemu a −100 každému sedlákovi, výhra sedláků obráceně. Každá bomba nebo raketa násobí skóre dvakrát. Hostitel volí 3/6/9/12 kol; po posledním kole se body sčítají.' },
      ]
    },
    'exploding-kittens': {
      sections: [
        { h: 'Cíl', p: 'Přežijte jako poslední. Když si líznete výbušné kotě a nemáte zneškodnění, vypadáváte. Hraje 2–6 hráčů.' },
        { h: 'Příprava', p: 'Každý dostane 4 karty a 1 zneškodnění. Výbušná koťata (o jedno méně, než je hráčů) a zbylá zneškodnění se zamíchají do balíčku. Při 5–6 hráčích může některý začít bez zneškodnění.' },
        { h: 'Průběh tahu', p: 'Ve svém tahu můžete zahrát libovolný počet akčních karet, potom si musíte líznout kartu a tah končí. Tlačítko lízání přeskočí rovnou k lízání.' },
        { h: 'Akční karty', p: 'Přeskočení ukončí tah bez lízání (a spotřebuje jeden dluh z útoku). Útok ukončí tah a pošle další lízání vybranému hráči; útoky se sčítají. Pohled do budoucnosti ukáže vám tři vrchní karty. Zamíchání promíchá balíček. Krádež a laskavost vezmou náhodnou kartu živému hráči, na kterého kliknete, a pak jdete rovnou lízat — další karty už hrát nemůžete.' },
        { h: 'Výbušné kotě a zneškodnění', p: 'Když kotě líznete a máte zneškodnění, použije se automaticky a vy zvolíte, kam se kotě vrátí do balíčku (0 = spodek, nejvyšší pozice = vrch). Bez volby se umístí náhodně. Bez zneškodnění vypadáváte a vaše karta se odhodí. Samotné zahrání zneškodnění nic neřeší.' },
        { h: 'Konec a tipy', p: 'Poslední živý hráč vyhrává. Pomocí pohledu do budoucnosti zjistěte, jestli je další karta kotě, a pak se rozhodněte, jestli lízat, přeskočit, nebo zaútočit. Zneškodnění si nechte pro sebe.' },
      ]
    },
    rummikub: {
      sections: [
        { h: 'Cíl', p: 'Zbavte se jako první všech dlaždic ze stojanu. Hraje 2–4 hráčů, každý začíná se 14 dlaždicemi.' },
        { h: 'Sady', p: 'Balíček má 106 dlaždic: čtyři barvy (černá, modrá, červená, oranžová), čísla 1–13 dvakrát, plus dva žolíci. Platná sada je buď postupka (stejná barva, po sobě jdoucí čísla, alespoň 3), nebo skupina (různé barvy, stejné číslo, alespoň 3).' },
        { h: 'První vyložení', p: 'Vaše první sada musí mít dohromady alespoň 30 bodů z vašich vlastních dlaždic; žolík má 30. Teprve po tomto vyložení smíte přidávat do sad na stole a přeskládat je. Pravidlo lze v nastavení vypnout.' },
        { h: 'Průběh tahu', steps: [
          'Vyložte nové postupky nebo skupiny.',
          'Přidejte dlaždice do existujících sad na stole.',
          'Tlačítkem „Přeskládat“ otevřete pracovní stůl a můžete sady rozdělovat, spojovat a vytvářet nové.',
          'Když nemůžete zahrát, lízněte si jednu dlaždici a tah skončí.',
        ] },
        { h: 'Pracovní stůl', p: 'Na pracovním stole musí každá sada zůstat platná, musíte použít alespoň jednu svou dlaždici a žádná dlaždice ze stolu se nesmí ztratit. Potom potvrďte odesláním, nebo vše vraťte zpět.' },
        { h: 'Konec a tipy', p: 'Když je balíček prázdný a všichni postupně passnou, hra končí: vyhrává hráč s nejmenším součtem zbývajících dlaždic (žolík 30). Žolík nahradí libovolnou dlaždici, ale zůstává na místě, kam ho položíte.' },
      ]
    },
    sudoku: {
      sections: [
        { h: 'Cíl', p: 'Všichni řeší stejné sudoku v reálném čase a bez tahů. Vyhrává ten, kdo první správně vyplní všechna prázdná pole. Hrát může 1–4 hráči, boti jsou povoleni.' },
        { h: 'Pravidla', p: 'V mřížce 9×9 musí každý řádek, sloupec i čtverec 3×3 obsahovat čísla 1–9 bez opakování. Zadaná čísla jsou pevná a každá hádanka má jediné řešení.' },
        { h: 'Vyplňování a životy', p: 'Klikněte na prázdné pole a zvolte číslici 1–9. Správná číslice se započítá do postupu, špatná vám vezme jeden ze tří životů. Po ztrátě všech životů vypadáváte a nemůžete dál hrát; správně vyplněná pole zůstávají.' },
        { h: 'Nápověda', p: 'Každý hráč má za hru maximálně 3 nápovědy. Nápověda odhalí jedno náhodné prázdné pole, započítá ho do postupu a nestojí život.' },
        { h: 'Konec a tipy', p: 'První hráč, který vyplní celou mřížku, vyhrává. Pokud zůstane poslední živý hráč, vyhrává okamžitě; když vypadnou všichni najednou, je remíza. Nehádejte — tři chyby vás vyřadí. Začněte číslem, které se v zadání vyskytuje nejčastěji.' },
      ]
    },
    twentyfour: {
      sections: [
        { h: 'Cíl', p: 'V každém kole vidíte čtyři karty s čísly 1–13. Pomocí sčítání, odčítání, násobení, dělení a závorek vytvořte 24. Každé číslo musíte použít právě jednou; každá hádanka má řešení.' },
        { h: 'Zadávání', p: 'Čísla, operátory a závorky zadávejte tlačítky na obrazovce. K dispozici je zpět a smazat. Číslo 12 je dvanáct, ne jedna a dva. Zlomky v mezivýpočtech jsou povolené; výsledek se počítá s tolerancí 0,0001. Špatný výraz ukáže, jakou hodnotu jste dostali, a pokusů máte neomezeně.' },
        { h: 'Čas a kola', p: 'Bez časovače vyhrává kolo první správná odpověď. Hostitel může zapnout 30/60/90/120 sekund: v časovaném režimu se správná odpověď jen zaznamená a kolo vyhrává první správné podání po vypršení času. Když nikdo neodpoví správně, kolo nikoho neboduje.' },
        { h: 'Konec hry', p: 'Hostitel volí 3, 5, 7 nebo 10 kol (výchozí je 5). Po každém kole se pokračuje tlačítkem „Další kolo“; po posledním se zobrazí souhrn. Vyhrává hráč s nejvíce vyhranými koly, při shodě rozhoduje nižší sedadlo.' },
        { h: 'Nápověda a tipy', p: 'Tlačítko nápovědy nabídne postup krok za krokem, ale má cooldown a omezený počet použití. Hledejte nejdřív poslední krok: která dvě čísla dají 24 (3×8, 4×6, 20+4…).' },
      ]
    },
    minesweeper: {
      sections: [
        { h: 'Cíl', p: 'Všichni hrají na stejném poli 10×10 s 15 minami a 85 bezpečnými poli. Vyhrajete, když jako první odkryjete všech 85 bezpečných polí, nebo přežijete ostatní.' },
        { h: 'Jak hrát', steps: [
          'Hraje se simultánně, bez tahů. Každý má vlastní desku se stejným rozložením min.',
          'Kliknutím pole odkryjete. Číslo udává počet min v osmi sousedních polích; nula automaticky otevře své sousedy.',
          'Pravým kliknutím (na telefonu dlouhým stiskem) pole označíte vlajkou. Vlajky jsou jen vaše poznámky a jdou kdykoli odstranit.',
        ] },
        { h: 'První klik a miny', p: 'Úplně první odkrytí v celé hře nikdy není mina — kdyby na něm mina byla, přesune se. Chráněné je ale jen toto první odkrytí; kdo klikne později, může na minu narazit.' },
        { h: 'Vypadnutí a konec', p: 'Náraz na minu vás vyřadí; vaše deska zůstane viditelná pro diváky. Pokud zůstane jediný živý hráč, vyhrává. Když vypadnou všichni současně, je remíza. V sólové hře znamená mina prohru.' },
        { h: 'Tipy', p: 'Začněte u izolovaných jedniček v rozích, označte jisté miny a nechte řetězové otevírání. Ve více hráčích je někdy výhodné hrát opatrně a nechat soupeře vybuchnout, ale rychlý soupeř může být první.' },
      ]
    },
    numberbomb: {
      sections: [
        { h: 'Cíl', p: 'Ve hře je ukryté číslo bomby od 1 do 100. Hráči se střídají v hádání a kdo bombu trefí, ztratí život. Každý má 3 životy; vyhrává poslední hráč se životem.' },
        { h: 'Hádání', p: 'Ve svém tahu zadejte celé číslo v aktuálním rozsahu. Když hádáte nad bombou, horní hranice se sníží na vaše číslo − 1; když pod bombou, spodní hranice se zvýší na vaše číslo + 1. Rozsah se tak neustále zmenšuje.' },
        { h: 'Zásah a nové kolo', p: 'Trefa stojí jeden život. Dokud žije víc než jeden hráč, vybere se nová bomba, rozsah se vrátí na 1–100 a začne další kolo. Začíná hráč, který bombu trefil; pokud vypadl, následující živý hráč.' },
        { h: 'Vynucený zásah', p: 'Když v rozsahu zbývá jediné číslo, hráč na tahu musí říct právě to a bombu trefí. Proto se snažte soupeři nechat dvě čísla, ne jedno.' },
        { h: 'Konec a tipy', p: 'Časovač není; vyřazení hráči se přeskakují. Hra končí, když zbývá nejvýše jeden živý hráč. V sólu končí prvním zásahem. Tlačítka 0–9, zpět a „Hádat“ fungují i s klávesnicí a Enterem.' },
      ]
    },
    oldmaid: {
      sections: [
        { h: 'Cíl', p: 'Nezůstaňte na konci s Černým Petrem. Balíček má 52 karet plus jednoho žolíka (53 karet) a rozdává se 2–6 hráčům, takže ruce mohou mít různý počet karet.' },
        { h: 'Jak hrát', steps: [
          'Na začátku se automaticky vyhodí všechny dvojice stejné hodnoty. Žolík se nikdy nespáruje.',
          'Sedadlo 1 začíná. Vyberte hráče po levici, od kterého chcete lízat, a klikněte na jednu z jeho karet lícem dolů.',
          'Když líznutá karta vytvoří pár s kartou ve vaší ruce, pár se automaticky odhodí.',
          'Hráči bez karet se přeskakují a dál už nelosují.',
        ] },
        { h: 'Konec a tipy', p: 'Hra končí, když karty zůstanou jen jednomu hráči — ten má žolíka a prohrává, všichni ostatní vyhrávají. Sledujte, u koho soupeři váhají, a snažte se nedat najevo, že žolíka držíte vy.' },
      ]
    },
    liarsbar: {
      sections: [
        { h: 'Cíl', p: 'Hrajte karty lícem dolů a tvrďte, že mají určitou hodnotu. Můžete lhát. Kdo zůstane poslední naživu, vyhrává.' },
        { h: 'Karty a průběh', steps: [
          'Na začátku kola se vylosuje cílová hodnota J, Q nebo K. Každý dostane 5 karet.',
          'Ve svém tahu zahrajte 1–3 karty lícem dolů a prohlaste je za cílovou hodnotu.',
          'Další hráč může zahrát své karty, nebo poslední hru vyzvat.',
          'Při výzvě se karty otočí: pokud některá není cílová hodnota (divoká karta platí jako cílová), střílí hráč, který je zahrál. Pokud jsou všechny pravé, střílí vyzyvatel.',
          'Po výstřelu začne nové kolo s novou cílovou hodnotou. Hráči bez karet se přeskakují; kdo nemá komu předat, musí vyzvat.',
        ] },
        { h: 'Ruská ruleta', p: 'Každý má revolver se šesti komorami a jednou kulkou na náhodné pozici. Při výstřelu se komora posune; pokud narazí na kulku, hráč vypadává. Komory se nikdy nedobíjejí, takže každý další výstřel je nebezpečnější.' },
        { h: 'Divoká karta a žolík', p: 'Divoká ★ se počítá jako cílová hodnota. Zahraný žolík 👻 se také hlásí jako cílová hodnota, ale když ho někdo vyzve, střílejí všichni ostatní hráči kromě toho, kdo ho zahrál.' },
        { h: 'Konec a tipy', p: 'Poslední živý hráč vyhrává. Když máte cílovou hodnotu, nelžete; když ne, lžete. Divoké karty jsou záchranná síť a žolíka si nechte na chvíli, kdy jsou komory soupeřů téměř plné.' },
      ]
    },
    bigtwo: {
      sections: [
        { h: 'Cíl', p: 'Zbavte se jako první všech karet. Hraje 2–4 hráčů a hraje se jedno rozdání. Ostatní počítají karty, které jim zůstaly v ruce — méně je lepší.' },
        { h: 'Rozdání a první tah', p: 'Balíček 52 karet bez žolíků se rozdá rovným dílem; případný zbytek dostanou první sedadla. Začíná držitel trojky kárové a jeho první kombinace musí tuto kartu obsahovat.' },
        { h: 'Pořadí a kombinace', p: 'Pořadí od nejnižší: 3 4 5 6 7 8 9 10 J Q K A 2. Barvy od nejsilnější: piky, srdce, kříže, káry; stejné hodnoty rozhoduje barva. Platné kombinace jsou jednoduchá karta, pár, trojice, postupka (5 a více po sobě, bez obtočení A-2-3), flush (5 karet stejné barvy), full house (trojice + pár), čtyři + jedna a straight flush.' },
        { h: 'Průběh tahu', p: 'Musíte odpovědět stejný typ kombinace se stejným počtem karet a vyšší hodnotou. Pětikaretní kombinace se mezi sebou nepřebíjejí — straight flush porazí jen jiný straight flush, full house jen jiný full house. Kdo vede, nemůže passovat; passovat lze jen při následování. Když všichni další passnou, poslední hráč znovu vede volně.' },
        { h: 'Konec a tipy', p: 'První hráč bez karet vyhrává. Ostatní skórují počet zbývajících karet, vítěz má 0. Zbavte se nízkých a nepohodlných karet, ale nechte si dvojky a esa na převzetí vedení.' },
      ]
    },
    'mahjong-sichuan': {
      sections: [
        { h: 'Cíl', p: 'Sestavte vítěznou ruku ze čtyř kombinací a jednoho páru (nebo sedmi párů). Hraje se sečuánský mahjong „krvavá bitva“: když jeden hráč vyhraje, ostatní pokračují, dokud nevyhrají tři nebo se nevyčerpá zeď.' },
        { h: 'Příprava a prázdná barva', p: 'Používá se 108 dlaždic tří barev (万, 筒, 条), bez větrů, draků a květin. Na začátku si každý zvolí jednu barvu jako „prázdnou“ — dokud mu v ruce zůstane dlaždice této barvy, nemůže vyhrát. Vyberte si barvu, které máte nejméně, a brzy ji vyhazujte.' },
        { h: 'Kombinace a nároky', p: 'Postupka je 3 po sobě jdoucí dlaždice stejné barvy, trojice tři stejné a kong čtyři stejné. Na rozdíl od kantonského mahjongu se zde nevyhazuje do postupky (žádné chow) — lze jen pung a kong. Na odhozenou dlaždici můžete zavolat pung, pokud držíte dvě stejné, a potom musíte ihned odhodit. Kong může být skrytý (držíte všechny čtyři), otevřený (držíte tři a soupeř odhodí čtvrtou) nebo doplněný (máte pung a doberete čtvrtou); po každém kongu si doberete náhradní dlaždici.' },
        { h: 'Jak vyhrát', p: 'Vyhrát lze vlastním tahem (自摸) nebo na odhozenou dlaždici soupeře (点炮). Standardní ruka má čtyři kombinace a pár, například 234万 + 567万 + 222筒 + 888条 + 99条. Sedm párů je také výhra. Hodnota začíná na 1 fanouškovi; bonusy se přičítají za vlastní tah, samé jednoduché dlaždice, samé pungy, sedm párů, jednu barvu, poslední tažení a kongo.' },
        { h: 'Platby a konec kola', p: 'Při vlastním tahu platí každý soupeř, který ještě nevyhrál; při výhře na odhoz platí jen ten, kdo dlaždici odhodil. Po výhře hráč vypadá a ostatní hrají dál. Kolo končí, když vyhrají tři hráči nebo dojde zeď; při prázdné zdi rozhodují případné kontroly „flower pig“ a „big call“.' },
        { h: 'Nastavení a tipy', p: 'Hostitel může vypnout krvavou bitvu, povolit více výherců na jeden odhoz, platby za konga, automatickou výhru na poslední čtyři dlaždice a výměnu tří dlaždic. Nejdřív se zbavte prázdné barvy, držte si částečné postupky a sledujte, co soupeři odhazují.' },
      ]
    },
    texas: {
      sections: [
        { h: 'Cíl', p: 'Z dvou vlastních a pěti společných karet sestavte nejlepší pětikaretní kombinaci a vyhrajte bank. Hraje až 8 hráčů a hraje se jedna hra.' },
        { h: 'Čipy a blindy', p: 'Každý začíná s 1000 žetony. Dealer je na sedadle 0, small blind platí 10 a big blind 20. Akce začíná po big blindu; ve hře dvou hráčů začíná dealer.' },
        { h: 'Průběh', p: 'Následují preflop (2 karty), flop (3 společné), turn (1) a river (1), potom showdown. Každé kolo sázení končí před další fází. Fold vzdává ruku, check projde bez sázky, call dorovná, raise zvýší sázku alespoň o poslední navýšení (nebo na 10, pokud se v kole ještě nesázelo), all-in vsadí všechny zbývající žetony.' },
        { h: 'Hodnocení kombinací', p: 'Od nejnižší: vysoká karta, pár, dva páry, trojice, postupka, flush, full house, čtyřka, straight flush. Počítá se nejlepších pět ze sedmi karet; A-2-3-4-5 je nejnižší postupka. Při shodě rozhodují kickery.' },
        { h: 'Konec a tipy', p: 'Když všichni ostatní složí, bank bere poslední hráč. Jinak vyhrává nejlepší kombinace při showdownu; přesně stejné ruce si bank nerozdělují a bere ho první nejlepší hráč. Side poty neexistují. Silné startovní ruce hrajte agresivněji, ale s jednou hrou na konci nechoďte all-in bez rozmyslu.' },
      ]
    },
    flightchess: {
      sections: [
        { h: 'Cíl', p: 'Dostaňte jako první všechny čtyři figurky domů. Hrají 2–4 hráči, každý má čtyři figurky. Hráči, kteří už dohráli, se v pořadí přeskakují.' },
        { h: 'Start a pohyb', p: 'Figurky začínají v základně a na start potřebujete hodit šestku. Vypuštěná figurka se postaví na vaše startovní pole a vyhodí každou nepřátelskou figurku, která tam stojí. Hlavní okruh má 52 polí, každé sedadlo začíná 13 polí od sebe.' },
        { h: 'Cesta domů', p: 'Za hlavním okruhem následuje šest domácích polí. Na poslední pole musíte přistát přesně; přejetí vás vrátí zpět. Vjezd do domácího úseku z hlavního okruhu se neodráží.' },
        { h: 'Vyhazování, skoky a lety', p: 'Přistání na poli s nepřátelskými figurkami pošle všechny tyto figurky zpět do jejich základen; v této verzi nejsou bezpečná pole. Osmé pole je letiště — přistání vás přesune na 32. pole a zachytíte vše na přistávacím poli. Pole vaší barvy (kroky dělitelné čtyřmi kromě osmého) vás posunou o čtyři pole vpřed, pokud skok nepřekročí 52. pole.' },
        { h: 'Šestky a konec', p: 'Za šestku házíte znovu, ale tři šestky v řadě tah ztrácíte. Když jsou všechny figurky v základně nebo doma, po pěti hodech bez šestky je další hod jistě šestka. Když se žádná figurka nemůže pohnout, tah se automaticky přeskakuje. Vyhrává první hráč se všemi čtyřmi figurkami doma.' },
      ]
    },
    snakebattle: {
      sections: [
        { h: 'Cíl', p: 'Hrají 2–6 hráčů současně na poli 28×20. Každý had začíná na jiném místě a má tři články. Vyhrává poslední živý had.' },
        { h: 'Ovládání', p: 'Na počítači používejte šipky nebo WASD, na telefonu přejeďte prstem po hřišti nebo použijte šipky na obrazovce. Had se posune o jeden článek každých 0,12 sekundy a nemůže se otočit přímo o 180 stupňů.' },
        { h: 'Jídlo a skóre', p: 'Na hřišti je vždy jedno jablko. Snězení hada prodlouží o jeden článek a dá 1 bod; nové jablko se objeví na volném poli. Skóre je jen ukazatel, o vítězi rozhoduje přežití.' },
        { h: 'Smrt', p: 'Zemřete nárazem do zdi, do vlastního nebo cizího těla (i mrtvého hada), nebo když dvě hlavy vstoupí do stejného pole. Dvě hlavy, které si vymění místa, zabijí oba. Do pole, které ocas právě opouští, se dá vstoupit, pokud had neroste.' },
        { h: 'Konec a tipy', p: 'Mrtvý had zůstává jako překážka do konce kola, takže se hřiště zaplňuje. Kolo končí, když žije nejvýše jeden had; pokud poslední hadi zemřou ve stejném okamžiku, je remíza. Držte se okrajů a používejte mrtvoly k uzavření soupeřů.' },
      ]
    },
    chinesechess: {
      sections: [
        { h: 'Cíl', p: 'Dejte mat soupeřovu generálovi. Deska má 9×10 polí a každá strana 16 kamenů; červený (dole) začíná.' },
        { h: 'Pohyb kamenů', p: 'Vůz jezdí libovolně daleko v přímce a neskáče. Kůň se pohybuje jako L a je zablokovaný, pokud je sousední pole v prvním kroku obsazené. Dělo se pohybuje jako vůz, ale bere jen skokem přes přesně jeden kámen. Slon jde dvě pole diagonálně, nesmí přes obsazený střed a nesmí přes řeku. Poradce chodí jedno pole diagonálně v paláci, generál jedno pole kolmo v paláci. Voják jde před řekou jen vpřed, po přechodu řeky může i stranou, nikdy ne zpět.' },
        { h: 'Šach a létající generálové', p: 'Po vašem tahu nesmí být váš generál napaden. Oba generálové také nesmějí stát proti sobě na stejné linii bez kamenů mezi nimi. Tahy, které to porušují, server odmítne.' },
        { h: 'Konec a zápas', p: 'Hráč, který nemá povolený tah, prohrává — ať už je to mat, nebo pat. Pozice opakovaná třikrát nebo 120 tahů bez braní je remíza. Hostitel volí jednu hru, nejlepší ze 3 nebo z 5; mezi hrami se sedadla vymění.' },
        { h: 'Ovládání a tipy', p: 'Klikněte na svůj kámen a pak na cílové pole. Brzy rozvíjejte vozy a koně, děly používejte k přišpendlení a po každém tahu kontrolujte, jestli váš generál není vystaven vozu nebo dělu.' },
      ]
    },
    chess: {
      sections: [
        { h: 'Cíl', p: 'Klasické šachy podle mezinárodních pravidel. Hrají dva hráči; sedadlo 1 hraje bílého a začíná. Vyhrává ten, kdo dá soupeřovu králi mat.' },
        { h: 'Jak táhnout', p: 'Klikněte na svou figurku; zelené tečky ukážou povolené tahy a červený kroužek braní. Potom klikněte na cílové pole. Server přijímá jen legální tahy a z šachu se musíte dostat.' },
        { h: 'Speciální tahy', p: 'Podporuje se rošáda, braní mimochodem (en passant) a proměna pěšce. Pěšec, který dojde na poslední řadu, nabídne proměnu na dámu, věž, střelce nebo koně; bez volby se stane dámou.' },
        { h: 'Konec a remízy', p: 'Mat vyhrává. Remíza nastává při patu, nedostatečném materiálu, trojím opakování pozice a pravidle 50 tahů. Rezignace ani šachové hodiny v této verzi nejsou.' },
        { h: 'Zápas a tipy', p: 'Hostitel volí jednu hru, nejlepší ze 3 nebo z 5; mezi hrami se sedadla vymění. Ovládejte střed, brzy rozvíjejte jezdce a střelce a hraďte krále. Po každém soupeřově tahu hledejte nechráněnou figurku.' },
      ]
    },
    checkers: {
      sections: [
        { h: 'Cíl', p: 'Vyhrajte tak, že soupeři vezmete všechny figurky, nebo mu nedáte žádný legální tah.' },
        { h: 'Deska a příprava', p: 'Hraje se na 8×8 polích jen po tmavých polích. Každý má 12 figurek ve třech řadách u svého okraje. Červený (sedadlo 1, dole) začíná.' },
        { h: 'Pohyb a braní', p: 'Figurka se posune o jedno pole diagonálně vpřed na volné pole a nikdy nezpět. Bere také jen dopředu: přeskočí sousední nepřátelskou figurku na volné pole hned za ní a branou figurku odstraní.' },
        { h: 'Dámy a vynucené braní', p: 'Figurka, která dojde na poslední řadu, se stane dámou a může se pohybovat i brát diagonálně všemi čtyřmi směry, ale vždy jen o jedno pole. Když je možné brát, musíte brát. Pokud stejná figurka může po dopadu skočit znovu, musí pokračovat; při více možnostech si vybíráte. Proměna uprostřed skoku tah ukončí.' },
        { h: 'Konec a tipy', p: 'Soupeř bez figurek nebo bez tahu prohrál. Držte zadní řadu co nejdéle a hlídejte si výměny, které vás donutí k vícenásobnému skoku.' },
      ]
    },
    connect4: {
      sections: [
        { h: 'Cíl', p: 'Na svislé desce 7 sloupců × 6 řad spojte jako první čtyři své disky vodorovně, svisle nebo diagonálně.' },
        { h: 'Jak hrát', p: 'Ve svém tahu klikněte kamkoli do sloupce. Disk spadne do nejnižšího volného místa. Plný sloupec použít nelze. Žlutý (sedadlo 1) začíná, červený (sedadlo 2) hraje druhý.' },
        { h: 'Konec hry', p: 'Po každém pádu se kontroluje řada, sloupec a obě diagonály. Čtyři a více v řadě vyhrávají. Když se zaplní všech 42 polí bez čtyř v řadě, je remíza.' },
        { h: 'Tipy', p: 'Prostřední sloupec spojuje nejvíc řad, takže ho obsazujte brzy. Blokujte soupeřovy tři v řadě, pokud je čtvrté pole dostupné. Nedávejte soupeři možnost postavit disk nahoru a dokončit čtyřku.' },
      ]
    },
    reversi: {
      sections: [
        { h: 'Cíl', p: 'Na konci hry mějte na desce více svých disků než soupeř. Hraje se na desce 8×8, 10×10 nebo 12×12 podle nastavení.' },
        { h: 'Příprava a tah', p: 'Hra začíná se čtyřmi disky ve středu, dva má každý hráč. Černý (sedadlo 1) začíná. Disk položíte na prázdné pole tak, aby v některém z osmi směrů uzavřel řadu soupeřových disků mezi váš nový disk a další vlastní disk. Všechny uzavřené soupeřovy disky se otočí na vaši barvu.' },
        { h: 'Povinné tahy', p: 'Tah, který nic neotočí, je neplatný. Když nemáte žádný legální tah, musíte passovat; když legální tah máte, passovat nesmíte. Pokud soupeř po vašem tahu nemá tah, hrajete znovu.' },
        { h: 'Konec a tipy', p: 'Hra končí, když žádný hráč nemá tah (nebo je deska plná). Vyhrává více disků, stejný počet je remíza. Rohy nelze nikdy otočit, takže jsou nejcennější; pole vedle rohů naopak soupeři často otevírají cestu.' },
      ]
    },
    go9: {
      sections: [
        { h: 'Cíl', p: 'Na desce 9×9 obkličte více území než soupeř. Hráči střídavě pokládají kameny na průsečíky; černý (hráč 0) začíná.' },
        { h: 'Pravidla', p: 'Kámen se položí na volný průsečík a už se nepohybuje. Svoboda je prázdný sousední průsečík. Skupina bez svobod je zajata a odstraněna. Tah, který by nechal vaši skupinu bez svobod, je zakázaný, pokud zároveň nezajme soupeřovy kameny.' },
        { h: 'Ko a konec', p: 'Po zajetí jediného kamene nesmí soupeř okamžitě zahrát na stejné místo a vzít kámen zpět; musí počkat jeden tah. Hra končí po dvou po sobě jdoucích passech, případně po 200 tazích.' },
        { h: 'Bodování', p: 'Používá se čínské územní bodování: každá strana počítá své kameny na desce plus prázdné území, které ohraničuje jen ona. Černý má komi 3,75 bodu, takže jeho skóre je plocha minus 3,75. Vyšší skóre vyhrává, přesná shoda je remíza.' },
        { h: 'Tipy', p: 'Nejdřív obsazujte rohy, potom strany. Držte kameny spojené a se svobodami, nerozptylujte je. V koncovce nezapomeňte na komi.' },
      ]
    },
    monopoly: {
      sections: [
        { h: 'Cíl', p: 'Zničte soupeře nákupem nemovitostí a výběrem nájemného. Vyhrává poslední hráč, který zůstane ve hře. Každý začíná s 1500.' },
        { h: 'Tah', p: 'Ve svém tahu klikněte na „Hodit kostkami“ a postupte o součet obou kostek. Za průchod nebo přistání na startu dostanete 200.' },
        { h: 'Nákup a nájem', p: 'Na volné nemovitosti, železnici nebo utilitě můžete kliknout a koupit ji; nekoupené zůstává volné a neaukuje se. Na cizím pozemku platíte nájem podle počtu domů. Železnice vynáší 60/120/240/420 podle toho, kolik jich vlastník má; utilita účtuje desetinasobek součtu kostek.' },
        { h: 'Monopol a stavby', p: 'Když vlastníte celou barevnou skupinu, nájem neupraveného pozemku se zdvojnásobí a ve svém tahu můžete stavět domy. Každý dům stojí polovinu ceny pozemku, nejvýše pět úrovní (hotel), a nájem výrazně roste.' },
        { h: 'Karty a speciální pole', p: 'Pole „Šance“ lízne kartu: peníze, platba každému hráči, posun vpřed nebo vzad, návrat na start, cesta do vězení, nebo karta osvobozující od jednoho nájemného (ne na železnici a utility). Daň stojí 200; „Jen na návštěvě“ a „Parkování zdarma“ nic nedělají.' },
        { h: 'Vězení a konec', p: 'Na pole „Jdi do vězení“ nebo kartou se dostanete do vězení. Každý tah tam házíte: dvojice vás pustí a posune o hod; po třech neúspěšných hodech zaplatíte 50 a posunete se o třetí hod. Jakmile je hotovost záporná, bankrotujete, nemovitosti se uvolní a hra končí.' },
      ]
    },
    suikabattle: {
      sections: [
        { h: 'Cíl', p: 'Házejte ovoce do nádoby. Dva stejné plody, které se dotknou, se spojí do většího ovoce a získají body. Ve více hráčích vypadává ten, komu nádoba přeteče; vyhrává poslední.' },
        { h: 'Ovládání', p: 'Myší nebo prstem zaměřte a kliknutím (nebo zvednutím prstu) pusťte ovoce. Zobrazuje se náhled dalšího kusu a mezi hody je zhruba 0,6 sekundy cooldown. Padají náhodně pouze pět nejmenších druhů.' },
        { h: 'Řetěz ovoce', p: 'Je 11 druhů: třešeň, jahoda, hroznové víno, pomeranč, citron, kiwi, rajče, broskev, ananas, kokos a meloun. Dva stejné plody vytvoří další druh; dva melouny zmizí.' },
        { h: 'Bodování', p: 'Spojení dá body podle nového ovoce: 1, 3, 6, 10, 15, 21, 28, 36, 45, 55, 66. Dvě třešně dají 3 body, dva melouny 66. Samotné puštění ovoce body nedává.' },
        { h: 'Přetečení a konec', p: 'Když ovoce zůstane nad výstražnou linií téměř nehybné asi 2 sekundy, hráč vypadává. Fyzika běží v každém prohlížeči, server sleduje jen skóre a vyřazení. Vyhrává poslední přeživší; když přetečou všichni, rozhoduje skóre.' },
        { h: 'Tipy', p: 'Velké ovoce držte pohromadě na jedné straně a malé vedle něj připravujte na spojení. Ve více hráčích je bezpečná hra důležitější než honba za body.' },
      ]
    },
    sheeptile: {
      sections: [
        { h: 'Cíl', p: 'Hraje 1–6 hráčů. Kliknutím posíláte dlaždice do zásobníku se sedmi sloty. Tři stejné vzory se automaticky vyčistí. Vyhrává ten, kdo první vyčistí druhou úroveň.' },
        { h: 'Klikání', p: 'Kliknout lze jen na dlaždici, která není zakrytá. Za zakrytou se považuje ta, kterou vyšší dlaždice překrývá v obou směrech o víc než šířku buňky. Kliknutá dlaždice jde do zásobníku; tři stejné se odstraní a dají 3 body.' },
        { h: 'Vypadnutí a úrovně', p: 'Když se všech sedm slotů zaplní, hráč vypadává. Pokud vypadnou všichni, vyhrává nejvyšší skóre; zůstane-li jen jeden, vyhrává on. První úroveň má 24 dlaždic a 6 vzorů, druhá 102 dlaždic a 14 vzorů včetně vrstev. Úrovně jsou sestavené tak, aby byly řešitelné.' },
        { h: 'Pomůcky', p: 'Každou pomůcku lze v úrovni použít jednou a při přechodu na další úroveň se obnoví: zpět vrátí poslední dlaždici ze zásobníku, zamíchání změní vzory zbývajících dlaždic a „vysunout“ odstraní první tři dlaždice ze zásobníku.' },
        { h: 'Nastavení a tipy', p: 'Hostitel může vypnout „stejnou desku“; pak má každý jiné náhodné rozložení. Dívejte se na spodní vrstvy, nechte si volné sloty a pomůcky používejte, až když je zásobník téměř plný.' },
      ]
    },
    drawguess: {
      sections: [
        { h: 'Cíl', p: 'Kreslete, hádejte a předávejte slova s přáteli. Hostitel volí mezi živým hádáním (Stage) a tichou telefonní hrou, kde se obrázek postupně mění.' },
        { h: 'Režim Stage', p: 'Jeden hráč kreslí naživo, ostatní hádají současně a mohou hádat neomezeně. Na pořadí ani velikosti písmen nezáleží. Dřívější správná odpověď dává víc bodů (nejméně 2, bez časomíry 10); kreslíř dostane 1 bod za každého, kdo uhodl. Kolo končí, když uhodnou všichni nebo vyprší čas. Každý je jednou kreslířem a vyhrává nejvyšší součet.' },
        { h: 'Tichá telefonní hra', p: 'První hráč vidí slovo a nakreslí ho. Druhý z obrázku hádá slovo, třetí podle tohoto hádání kreslí a tak dál až k poslednímu hráči. Poté všichni hlasují, jestli konečný výsledek stále odpovídá původnímu slovu. Pokud ano, hráč, který řetěz začal, dostane 3 body. Každý začne jeden řetěz; vyhrává nejvyšší součet.' },
        { h: 'Kreslení a hádání', p: 'První kreslíř si vybere slovo z nabídky; po vypršení času se automaticky vybere první. Můžete měnit barvu a tloušťku štětce, gumovat a čistit plátno; čas vyprší, kresba se odešle sama. Při hádání napište svůj tip a odešlete — odpověď se stane zadáním pro dalšího kreslíře.' },
        { h: 'Nastavení a tipy', p: 'Hostitel volí kategorie slov, čas na kreslení a hádání, počet nabízených slov a vlastní slova. Kreslete výrazné tvary a detaily přidávejte až na konci, kdy je vidět, co druhý hádá.' },
      ]
    },
    battleship: {
      sections: [
        { h: 'Cíl', p: 'Námořní souboj dvou hráčů na moři 10×10. Umístěte flotilu a střídejte se ve střelbě. Vyhrává ten, kdo první potopí všech pět soupeřových lodí.' },
        { h: 'Umístění', p: 'Flotila je pevná: letadlová loď (5), bitevní loď (4), křižník (3), ponorka (3) a torpédoborec (2). Lodě se nesmí překrývat ani přesáhnout desku, ale mohou se dotýkat. Přetáhněte je ze zásobníku nebo klikněte na pole a otočte je tlačítkem či pravým kliknutím. Obě strany umisťují současně a bitva začne, když jsou obě hotové.' },
        { h: 'Střelba a tahy', p: 'Sedadlo 1 střílí první. Klikněte na jedno pole soupeřova moře. Na už zasažené pole střílet nelze. Výsledek je minutí, zásah nebo potopení. Zásah nedává další tah — po každém výstřelu jde tah na soupeře.' },
        { h: 'Potopení a konec', p: 'Když loď potopíte, uvidíte její typ a celý obrys, což pomůže s plánováním. První hráč, který potopí všech pět lodí, vyhrává; remíza není. Pozice lodí se ukážou po hře.' },
        { h: 'Tipy', p: 'Nestavějte lodě vždy podél okrajů ani do jedné linie. Po zásahu prozkoumejte čtyři sousedy a střílejte v šachovnicovém vzoru — každá loď je dlouhá alespoň dvě pole.' },
      ]
    },
    hearts: {
      sections: [
        { h: 'Cíl', p: 'Hrají přesně 4 hráči, každý má 13 karet. Snažte se získat co nejméně bodů: každé srdce je 1 bod a piková dáma 13 bodů, celkem tedy 26 bodů za kolo. Hra končí, když někdo dosáhne 100 bodů; vyhrává nejnižší součet.' },
        { h: 'Předávání', p: 'Každé kolo začíná předáním tří karet. Směr se střídá: doleva, doprava, napříč, potom se nepředává. V kole bez předávání se hraje hned. Pokud potvrdíte bez výběru, automaticky se předají tři nejvyšší karty.' },
        { h: 'Hraní zdvihů', p: 'Začíná držitel dvou kříží a musí tuto kartu zahrát. Další hráči musí ctít barvu; kdo ji nemá, může odhodit cokoli. V prvním zdvihu nesmíte odhodit srdce ani pikovou dámu, pokud máte jinou kartu.' },
        { h: 'Srdce a piková dáma', p: 'Srdce nelze vést, dokud někdo nezahraje srdce, ledaže máte jen srdce. Srdce se „lámou“ jen zahraným srdcem, ne odhozem na pikovou dámu. Zdvih vyhrává nejvyšší karta vedené barvy; vítěz bere bodové karty a vede další zdvih.' },
        { h: 'Měsíc a konec', p: 'Pokud jeden hráč získá všech 26 bodů, dostane 0 a ostatní tři po 26 bodech. Hra končí při dosažení 100 bodů; nejnižší součet vyhrává. Při shodě rozhoduje nižší sedadlo.' },
        { h: 'Tipy', p: 'Předávejte velké karty a pikovou dámu. Sledujte, kde je dáma, a snažte se s ní neskončit. Vysoké nebezpečné karty se zbavujte brzy, dokud máte na výběr.' },
      ]
    },
    truthdare: {
      sections: [
        { h: 'Co to je', p: 'Párty nástroj na pravdy a odvahy. Nemá vítěze ani konec — nejdřív se domluvte, kdo prohrál (třeba kámen-nůžky-papír), a prohrávající si vrátí kartu.' },
        { h: 'Losování', p: 'Kdykoli může kdokoli kliknout na „Pravda“, „Odvaha“ nebo „Náhodná karta“. Neexistuje pořadí tahů. Náhodná karta je z poloviny pravda a z poloviny odvaha (nebo vezme druh, který je k dispozici). Karta se zobrazí všem a historie si pamatuje posledních 12 losování.' },
        { h: 'Balíčky a vlastní karty', p: 'Jsou čtyři balíčky: ledoborec, párty, hluboké pravdy a výzva. Každý má 6 pravd a 6 odvah; losování se může opakovat. V nastavení lze balíčky zapnout nebo vypnout a přidat vlastní pravdy a odvahy — jednu na řádek, až 80 od každého druhu.' },
        { h: 'Pravidla a počet hráčů', p: 'Když není zapnutý žádný balíček, použijí se všechny vestavěné. Chybí-li v zapnutých balíčcích některý druh, hra se vrátí k výchozím. Hrát může 2–10 hráčů. Domluvte se předem, co se smí přeskočit.' },
        { h: 'Tipy', p: 'Vyberte balíčky podle party: ledoborec pro nové známé, hluboké pravdy pro blízké přátele. Kartu, se kterou nikdo nesouhlasí, můžete přeskočit nebo losovat znovu.' },
      ]
    },
    sanguo: {
      sections: [
        { h: 'Cíl', p: 'Hraje 4–8 hráčů, každý má skrytou roli; role pána je veřejná. Pán a věrní musí porazit všechny rebely a špióna. Rebelové musí zabít pána. Špión musí nechat ostatní vyhladit a pak porazit pána v souboji.' },
        { h: 'Průběh tahu', p: 'Každý začíná se čtyřmi kartami, pán má o jedno maximum zdraví víc a začíná. V každém tahu nejdřív vyřešte karty v zóně soudu (Shovívavost, Blesk), potom si doberte dvě karty, zahrajte karty a odhoďte do výše aktuálního zdraví. Standardně můžete zahrát jedno „Slash“ za tah; s opakovací kuší neomezeně.' },
        { h: 'Základní karty', p: '„Slash“ zasáhne hráče v dosahu; ten musí zahrát „Vyhnout se“, jinak ztratí 1 zdraví. „Broskev“ léčí 1 zdraví a nelze ji použít při plném zdraví. Při nule zdraví jste v ohrožení: kdokoli může zahrát broskev a zachránit vás, jinak umíráte a odhodíte všechny karty.' },
        { h: 'Triky a vybavení', p: 'Mezi triky patří rozebrání, uchvácení, duel, půjčená čepel, nájezd barbarů, salva šípů, broskvová zahrada, sklizeň, nečekaný zisk, lelotvar a blesk. „Anulovat“ zruší jakýkoli trik a může být zrušeno dalším Anulovat. Zbraně určují dosah a efekty, brnění chrání, kůň +1 ztěžuje soupeřům zásah a kůň −1 vám zkracuje vzdálenost.' },
        { h: 'Generálové a odměny', p: 'Každý dostane náhodného generála; jeho dovednosti jsou pod vaší rukou. Aktivní dovednosti spustíte výběrem karet a cílů a kliknutím na dovednost. Za zabití rebela si líznete 3 karty; pán, který zabije věrného, odhodí všechny karty a vybavení.' },
        { h: 'Ovládání a konec', p: 'Klikněte na kartu, a pokud potřebuje cíl, pak na sedadlo. Když máte zahrát Vyhnout se, Anulovat nebo Broskev a nechcete, klikněte na „Pass“. Tah je omezen 40 sekundami, reakce 10–15 sekundami. Hra končí splněním cílů rolí; v této verzi nejsou dovednosti pána.' },
      ]
    },
    werewolf: {
      sections: [
        { h: 'Jak to funguje', p: 'Telefon je moderátor. V noci vidí zadání jen hráči, kteří mají akci; ostatní vidí „padá noc“. Přes den mluvíte osobně, nebo si v nastavení zvolíte psaný chat. Pořadí projevů i hlasování vždy řídí aplikace.' },
        { h: 'Role', p: 'Šest hráčů: 2 vlci, věštec, čarodějnice a 2 vesničané. Sedmý hráč přidá lovce; při 8–10 hráčích jsou 3 vlci a více vesničanů; při 11–12 přibude idiot (12 hráčů = 4 vlci). Karta role je otočená, dokud na ni neklepnete.' },
        { h: 'Noc', p: 'Vlci se domluví na oběti (mohou i nikoho nezabít). Věštec zkontroluje jednoho hráče a dozví se, jestli je vlk. Čarodějnice může použít protijed na oběť (nikdy sama na sebe), nebo jed na kohokoli; každý lektvar jen jednou za hru a jen jeden za noc.' },
        { h: 'Den a hlasování', p: 'První den se volí šerif: kandidáti promluví, ostatní hlasují. Pak se oznámí noční úmrtí, mrtvý z první noci má poslední slovo, postupně promluví všichni živí a následuje otevřená diskuse. Ta skončí dřív, když všichni kliknou na „Připraven k hlasování“. Potom se hlasuje o vyloučení; vyloučený má poslední slovo. Šerif má 1,5 hlasu a mluví poslední. Při shodě se koná PK a druhá shoda nikoho nevyloučí.' },
        { h: 'Chat a schopnosti', p: 'Při psaném chatu může během projevů psát jen aktuální mluvčí; v diskusi a při hlasování všichni živí. V noci mají vlci vlastní kanál. Mrtví jen sledují, kromě posledního slova. Lovec může po smrti vystřelit (kromě otravy). Idiot přežije první vyloučení, ale ztratí hlas. Šerif při smrti předá nebo roztrhne odznak.' },
        { h: 'Konec a nastavení', p: 'Vesnice vyhrává, když jsou mrtví všichni vlci. Vlci vyhrávají, když jsou pryč všechny speciální role nebo všichni vesničané. Hostitel volí způsob mluvy, délku diskuse, čas projevu a volbu šerifa. Boti jen náhodně jednají a slouží k vyzkoušení.' },
      ]
    },
    'mahjong-cantonese': {
      title: 'Mahjong – kantonský',
      sections: [
        { h: 'Cíl', p: 'Sestavte vítěznou ruku jako první. Kolo končí jednou výhrou; když dojde zeď bez vítěze, kolo je remíza. Hraje se svižně a boduje se podle fanoušků.' },
        { h: 'Průběh a nároky', p: 'Kantonský mahjong používá 136 dlaždic včetně větrů a draků. Na rozdíl od sečuánského zde můžete brát do postupky (chow), ale jen od hráče po levici. Pořadí nároků je výhra > kong > pung > chow; při stejné prioritě rozhoduje bližší hráč po směru hodinových ručiček.' },
        { h: 'Jak vyhrát', p: 'Výhra je čtyři kombinace a pár, nebo sedm párů. Kombinace mohou být postupka, trojice nebo kong. Kong může být skrytý (držíte čtyři), otevřený (tři + odhoz) nebo doplněný (pung + doberete čtvrtou); po každém kongu si doberete náhradní dlaždici. Výhra na vlastní tah nebo na odhoz se počítá stejně.' },
        { h: 'Body', p: 'Základní výhra má 1 fanoušek. Bonusy se přičítají za vlastní tah, samé jednoduché dlaždice, výhru po kongu, poslední tažení, samé pungy, sedm párů, jednu barvu, tři draky, čtyři větry a třináct sirotků. Hostitel může nastavit minimální fanoušek a strop.' },
        { h: 'Koupě dlaždic a kola', p: 'Po výhře se ze konce zdi otočí čtyři dlaždice; každý vítr nebo drak mezi nimi přidá fanouška. Toto pravidlo lze vypnout. Skóre se sčítá přes kola, vítěz rozdává další a po remíze se dealer posune.' },
        { h: 'Tipy', p: 'Rychle se dostávejte do stavu připravenosti, držte střední dlaždice 4–6 a sledujte, co soupeři berou. Nelpěte na velkém počtu fanoušků — vyhrajte, když můžete.' },
      ]
    },
  };

  window.TUTORIALS_CS = Object.assign({}, window.TUTORIALS_CS || {}, window.__TUTORIALS_CS_AUTHORED);
})();
