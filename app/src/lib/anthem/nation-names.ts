/* Localized names for the 48 qualified nations, in every shipped UI language.
   Accepted as guesses regardless of UI language (a Spanish speaker types
   "Alemania" even with the UI in English). `alt` carries long/official
   variants worth accepting. Names identical to English are listed anyway so
   each language column is a complete review surface — matching de-dupes for
   free. ar/fa/ja/ko columns are machine-written, flagged for native review. */

import type { Lang } from '../i18n'

interface NationNames {
  names: Partial<Record<Lang, string>>
  alt?: string[]
}

/* prettier-ignore */
export const NATION_NAMES_I18N: Record<string, NationNames> = {
  Mexico: { names: { es: 'México', fr: 'Mexique', pt: 'México', de: 'Mexiko', nl: 'Mexico', tr: 'Meksika', ar: 'المكسيك', fa: 'مکزیک', ja: 'メキシコ', ko: '멕시코' } },
  'South Africa': { names: { es: 'Sudáfrica', fr: 'Afrique du Sud', pt: 'África do Sul', de: 'Südafrika', nl: 'Zuid-Afrika', tr: 'Güney Afrika', ar: 'جنوب أفريقيا', fa: 'آفریقای جنوبی', ja: '南アフリカ', ko: '남아프리카공화국' }, alt: ['남아공'] },
  'South Korea': { names: { es: 'Corea del Sur', fr: 'Corée du Sud', pt: 'Coreia do Sul', de: 'Südkorea', nl: 'Zuid-Korea', tr: 'Güney Kore', ar: 'كوريا الجنوبية', fa: 'کره جنوبی', ja: '韓国', ko: '대한민국' }, alt: ['한국'] },
  Czechia: { names: { es: 'Chequia', fr: 'Tchéquie', pt: 'Tchéquia', de: 'Tschechien', nl: 'Tsjechië', tr: 'Çekya', ar: 'التشيك', fa: 'چک', ja: 'チェコ', ko: '체코' }, alt: ['república checa', 'république tchèque', 'república tcheca', 'çek cumhuriyeti', 'جمهوری چک'] },
  Canada: { names: { es: 'Canadá', fr: 'Canada', pt: 'Canadá', de: 'Kanada', nl: 'Canada', tr: 'Kanada', ar: 'كندا', fa: 'کانادا', ja: 'カナダ', ko: '캐나다' } },
  'Bosnia and Herzegovina': { names: { es: 'Bosnia y Herzegovina', fr: 'Bosnie-Herzégovine', pt: 'Bósnia e Herzegovina', de: 'Bosnien und Herzegowina', nl: 'Bosnië en Herzegovina', tr: 'Bosna-Hersek', ar: 'البوسنة والهرسك', fa: 'بوسنی و هرزگوین', ja: 'ボスニア・ヘルツェゴビナ', ko: '보스니아헤르체고비나' } },
  Qatar: { names: { es: 'Catar', fr: 'Qatar', pt: 'Catar', de: 'Katar', nl: 'Qatar', tr: 'Katar', ar: 'قطر', fa: 'قطر', ja: 'カタール', ko: '카타르' } },
  Switzerland: { names: { es: 'Suiza', fr: 'Suisse', pt: 'Suíça', de: 'Schweiz', nl: 'Zwitserland', tr: 'İsviçre', ar: 'سويسرا', fa: 'سوئیس', ja: 'スイス', ko: '스위스' } },
  Brazil: { names: { es: 'Brasil', fr: 'Brésil', pt: 'Brasil', de: 'Brasilien', nl: 'Brazilië', tr: 'Brezilya', ar: 'البرازيل', fa: 'برزیل', ja: 'ブラジル', ko: '브라질' } },
  Morocco: { names: { es: 'Marruecos', fr: 'Maroc', pt: 'Marrocos', de: 'Marokko', nl: 'Marokko', tr: 'Fas', ar: 'المغرب', fa: 'مراکش', ja: 'モロッコ', ko: '모로코' } },
  Haiti: { names: { es: 'Haití', fr: 'Haïti', pt: 'Haiti', de: 'Haiti', nl: 'Haïti', tr: 'Haiti', ar: 'هايتي', fa: 'هائیتی', ja: 'ハイチ', ko: '아이티' } },
  Scotland: { names: { es: 'Escocia', fr: 'Écosse', pt: 'Escócia', de: 'Schottland', nl: 'Schotland', tr: 'İskoçya', ar: 'اسكتلندا', fa: 'اسکاتلند', ja: 'スコットランド', ko: '스코틀랜드' } },
  'United States': { names: { es: 'Estados Unidos', fr: 'États-Unis', pt: 'Estados Unidos', de: 'Vereinigte Staaten', nl: 'Verenigde Staten', tr: 'Amerika Birleşik Devletleri', ar: 'الولايات المتحدة', fa: 'آمریکا', ja: 'アメリカ', ko: '미국' }, alt: ['etats unis', 'abd', 'ایالات متحده', '米国'] },
  Paraguay: { names: { es: 'Paraguay', fr: 'Paraguay', pt: 'Paraguai', de: 'Paraguay', nl: 'Paraguay', tr: 'Paraguay', ar: 'باراغواي', fa: 'پاراگوئه', ja: 'パラグアイ', ko: '파라과이' } },
  Australia: { names: { es: 'Australia', fr: 'Australie', pt: 'Austrália', de: 'Australien', nl: 'Australië', tr: 'Avustralya', ar: 'أستراليا', fa: 'استرالیا', ja: 'オーストラリア', ko: '호주' }, alt: ['오스트레일리아'] },
  Türkiye: { names: { es: 'Turquía', fr: 'Turquie', pt: 'Turquia', de: 'Türkei', nl: 'Turkije', tr: 'Türkiye', ar: 'تركيا', fa: 'ترکیه', ja: 'トルコ', ko: '튀르키예' }, alt: ['터키'] },
  Germany: { names: { es: 'Alemania', fr: 'Allemagne', pt: 'Alemanha', de: 'Deutschland', nl: 'Duitsland', tr: 'Almanya', ar: 'ألمانيا', fa: 'آلمان', ja: 'ドイツ', ko: '독일' } },
  Curaçao: { names: { es: 'Curazao', fr: 'Curaçao', pt: 'Curaçao', de: 'Curaçao', nl: 'Curaçao', tr: 'Curaçao', ar: 'كوراساو', fa: 'کوراسائو', ja: 'キュラソー', ko: '퀴라소' } },
  'Ivory Coast': { names: { es: 'Costa de Marfil', fr: 'Côte d’Ivoire', pt: 'Costa do Marfim', de: 'Elfenbeinküste', nl: 'Ivoorkust', tr: 'Fildişi Sahili', ar: 'ساحل العاج', fa: 'ساحل عاج', ja: 'コートジボワール', ko: '코트디부아르' }, alt: ["cote d'ivoire", 'كوت ديفوار'] },
  Ecuador: { names: { es: 'Ecuador', fr: 'Équateur', pt: 'Equador', de: 'Ecuador', nl: 'Ecuador', tr: 'Ekvador', ar: 'الإكوادور', fa: 'اکوادور', ja: 'エクアドル', ko: '에콰도르' } },
  Netherlands: { names: { es: 'Países Bajos', fr: 'Pays-Bas', pt: 'Países Baixos', de: 'Niederlande', nl: 'Nederland', tr: 'Hollanda', ar: 'هولندا', fa: 'هلند', ja: 'オランダ', ko: '네덜란드' }, alt: ['holanda', 'hollande', 'holland'] },
  Japan: { names: { es: 'Japón', fr: 'Japon', pt: 'Japão', de: 'Japan', nl: 'Japan', tr: 'Japonya', ar: 'اليابان', fa: 'ژاپن', ja: '日本', ko: '일본' } },
  Sweden: { names: { es: 'Suecia', fr: 'Suède', pt: 'Suécia', de: 'Schweden', nl: 'Zweden', tr: 'İsveç', ar: 'السويد', fa: 'سوئد', ja: 'スウェーデン', ko: '스웨덴' } },
  Tunisia: { names: { es: 'Túnez', fr: 'Tunisie', pt: 'Tunísia', de: 'Tunesien', nl: 'Tunesië', tr: 'Tunus', ar: 'تونس', fa: 'تونس', ja: 'チュニジア', ko: '튀니지' } },
  Belgium: { names: { es: 'Bélgica', fr: 'Belgique', pt: 'Bélgica', de: 'Belgien', nl: 'België', tr: 'Belçika', ar: 'بلجيكا', fa: 'بلژیک', ja: 'ベルギー', ko: '벨기에' } },
  Egypt: { names: { es: 'Egipto', fr: 'Égypte', pt: 'Egito', de: 'Ägypten', nl: 'Egypte', tr: 'Mısır', ar: 'مصر', fa: 'مصر', ja: 'エジプト', ko: '이집트' } },
  Iran: { names: { es: 'Irán', fr: 'Iran', pt: 'Irã', de: 'Iran', nl: 'Iran', tr: 'İran', ar: 'إيران', fa: 'ایران', ja: 'イラン', ko: '이란' } },
  'New Zealand': { names: { es: 'Nueva Zelanda', fr: 'Nouvelle-Zélande', pt: 'Nova Zelândia', de: 'Neuseeland', nl: 'Nieuw-Zeeland', tr: 'Yeni Zelanda', ar: 'نيوزيلندا', fa: 'نیوزیلند', ja: 'ニュージーランド', ko: '뉴질랜드' } },
  Spain: { names: { es: 'España', fr: 'Espagne', pt: 'Espanha', de: 'Spanien', nl: 'Spanje', tr: 'İspanya', ar: 'إسبانيا', fa: 'اسپانیا', ja: 'スペイン', ko: '스페인' } },
  'Cape Verde': { names: { es: 'Cabo Verde', fr: 'Cap-Vert', pt: 'Cabo Verde', de: 'Kap Verde', nl: 'Kaapverdië', tr: 'Yeşil Burun Adaları', ar: 'الرأس الأخضر', fa: 'کیپ ورد', ja: 'カーボベルデ', ko: '카보베르데' }, alt: ['kap verde', 'كابو فيردي'] },
  'Saudi Arabia': { names: { es: 'Arabia Saudita', fr: 'Arabie saoudite', pt: 'Arábia Saudita', de: 'Saudi-Arabien', nl: 'Saoedi-Arabië', tr: 'Suudi Arabistan', ar: 'السعودية', fa: 'عربستان سعودی', ja: 'サウジアラビア', ko: '사우디아라비아' }, alt: ['arabia saudí', 'المملكة العربية السعودية', 'عربستان'] },
  Uruguay: { names: { es: 'Uruguay', fr: 'Uruguay', pt: 'Uruguai', de: 'Uruguay', nl: 'Uruguay', tr: 'Uruguay', ar: 'أوروغواي', fa: 'اروگوئه', ja: 'ウルグアイ', ko: '우루과이' } },
  France: { names: { es: 'Francia', fr: 'France', pt: 'França', de: 'Frankreich', nl: 'Frankrijk', tr: 'Fransa', ar: 'فرنسا', fa: 'فرانسه', ja: 'フランス', ko: '프랑스' } },
  Senegal: { names: { es: 'Senegal', fr: 'Sénégal', pt: 'Senegal', de: 'Senegal', nl: 'Senegal', tr: 'Senegal', ar: 'السنغال', fa: 'سنگال', ja: 'セネガル', ko: '세네갈' } },
  Iraq: { names: { es: 'Irak', fr: 'Irak', pt: 'Iraque', de: 'Irak', nl: 'Irak', tr: 'Irak', ar: 'العراق', fa: 'عراق', ja: 'イラク', ko: '이라크' } },
  Norway: { names: { es: 'Noruega', fr: 'Norvège', pt: 'Noruega', de: 'Norwegen', nl: 'Noorwegen', tr: 'Norveç', ar: 'النرويج', fa: 'نروژ', ja: 'ノルウェー', ko: '노르웨이' } },
  Argentina: { names: { es: 'Argentina', fr: 'Argentine', pt: 'Argentina', de: 'Argentinien', nl: 'Argentinië', tr: 'Arjantin', ar: 'الأرجنتين', fa: 'آرژانتین', ja: 'アルゼンチン', ko: '아르헨티나' } },
  Algeria: { names: { es: 'Argelia', fr: 'Algérie', pt: 'Argélia', de: 'Algerien', nl: 'Algerije', tr: 'Cezayir', ar: 'الجزائر', fa: 'الجزایر', ja: 'アルジェリア', ko: '알제리' } },
  Austria: { names: { es: 'Austria', fr: 'Autriche', pt: 'Áustria', de: 'Österreich', nl: 'Oostenrijk', tr: 'Avusturya', ar: 'النمسا', fa: 'اتریش', ja: 'オーストリア', ko: '오스트리아' } },
  Jordan: { names: { es: 'Jordania', fr: 'Jordanie', pt: 'Jordânia', de: 'Jordanien', nl: 'Jordanië', tr: 'Ürdün', ar: 'الأردن', fa: 'اردن', ja: 'ヨルダン', ko: '요르단' } },
  Portugal: { names: { es: 'Portugal', fr: 'Portugal', pt: 'Portugal', de: 'Portugal', nl: 'Portugal', tr: 'Portekiz', ar: 'البرتغال', fa: 'پرتغال', ja: 'ポルトガル', ko: '포르투갈' } },
  'DR Congo': { names: { es: 'RD del Congo', fr: 'RD Congo', pt: 'RD do Congo', de: 'DR Kongo', nl: 'DR Congo', tr: 'Demokratik Kongo Cumhuriyeti', ar: 'الكونغو الديمقراطية', fa: 'کنگو دموکراتیک', ja: 'コンゴ民主共和国', ko: '콩고민주공화국' }, alt: ['república democrática del congo', 'république démocratique du congo', 'república democrática do congo', 'demokratische republik kongo', 'democratische republiek congo', 'جمهورية الكونغو الديمقراطية', 'جمهوری دموکراتیک کنگو'] },
  Uzbekistan: { names: { es: 'Uzbekistán', fr: 'Ouzbékistan', pt: 'Uzbequistão', de: 'Usbekistan', nl: 'Oezbekistan', tr: 'Özbekistan', ar: 'أوزبكستان', fa: 'ازبکستان', ja: 'ウズベキスタン', ko: '우즈베키스탄' } },
  Colombia: { names: { es: 'Colombia', fr: 'Colombie', pt: 'Colômbia', de: 'Kolumbien', nl: 'Colombia', tr: 'Kolombiya', ar: 'كولومبيا', fa: 'کلمبیا', ja: 'コロンビア', ko: '콜롬비아' } },
  England: { names: { es: 'Inglaterra', fr: 'Angleterre', pt: 'Inglaterra', de: 'England', nl: 'Engeland', tr: 'İngiltere', ar: 'إنجلترا', fa: 'انگلیس', ja: 'イングランド', ko: '잉글랜드' }, alt: ['إنكلترا', 'انگلستان'] },
  Croatia: { names: { es: 'Croacia', fr: 'Croatie', pt: 'Croácia', de: 'Kroatien', nl: 'Kroatië', tr: 'Hırvatistan', ar: 'كرواتيا', fa: 'کرواسی', ja: 'クロアチア', ko: '크로아티아' } },
  Ghana: { names: { es: 'Ghana', fr: 'Ghana', pt: 'Gana', de: 'Ghana', nl: 'Ghana', tr: 'Gana', ar: 'غانا', fa: 'غنا', ja: 'ガーナ', ko: '가나' } },
  Panama: { names: { es: 'Panamá', fr: 'Panama', pt: 'Panamá', de: 'Panama', nl: 'Panama', tr: 'Panama', ar: 'بنما', fa: 'پاناما', ja: 'パナマ', ko: '파나마' } },
}
