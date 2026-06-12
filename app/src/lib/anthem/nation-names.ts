/* Localized names for the 48 qualified nations. Accepted as guesses
   regardless of UI language (a Spanish speaker types "Alemania" even with the
   UI in English). `alt` carries long/official variants worth accepting.
   Names identical to English are listed anyway so each language column is a
   complete review surface — matching de-dupes for free. */

import type { Lang } from '../i18n'

interface NationNames {
  names: Partial<Record<Lang, string>>
  alt?: string[]
}

export const NATION_NAMES_I18N: Record<string, NationNames> = {
  Mexico: { names: { es: 'México', fr: 'Mexique', pt: 'México', de: 'Mexiko', nl: 'Mexico', tr: 'Meksika' } },
  'South Africa': {
    names: { es: 'Sudáfrica', fr: 'Afrique du Sud', pt: 'África do Sul', de: 'Südafrika', nl: 'Zuid-Afrika', tr: 'Güney Afrika' },
  },
  'South Korea': {
    names: { es: 'Corea del Sur', fr: 'Corée du Sud', pt: 'Coreia do Sul', de: 'Südkorea', nl: 'Zuid-Korea', tr: 'Güney Kore' },
  },
  Czechia: {
    names: { es: 'Chequia', fr: 'Tchéquie', pt: 'Tchéquia', de: 'Tschechien', nl: 'Tsjechië', tr: 'Çekya' },
    alt: ['república checa', 'république tchèque', 'república tcheca', 'çek cumhuriyeti'],
  },
  Canada: { names: { es: 'Canadá', fr: 'Canada', pt: 'Canadá', de: 'Kanada', nl: 'Canada', tr: 'Kanada' } },
  'Bosnia and Herzegovina': {
    names: {
      es: 'Bosnia y Herzegovina',
      fr: 'Bosnie-Herzégovine',
      pt: 'Bósnia e Herzegovina',
      de: 'Bosnien und Herzegowina',
      nl: 'Bosnië en Herzegovina',
      tr: 'Bosna-Hersek',
    },
  },
  Qatar: { names: { es: 'Catar', fr: 'Qatar', pt: 'Catar', de: 'Katar', nl: 'Qatar', tr: 'Katar' } },
  Switzerland: {
    names: { es: 'Suiza', fr: 'Suisse', pt: 'Suíça', de: 'Schweiz', nl: 'Zwitserland', tr: 'İsviçre' },
  },
  Brazil: { names: { es: 'Brasil', fr: 'Brésil', pt: 'Brasil', de: 'Brasilien', nl: 'Brazilië', tr: 'Brezilya' } },
  Morocco: { names: { es: 'Marruecos', fr: 'Maroc', pt: 'Marrocos', de: 'Marokko', nl: 'Marokko', tr: 'Fas' } },
  Haiti: { names: { es: 'Haití', fr: 'Haïti', pt: 'Haiti', de: 'Haiti', nl: 'Haïti', tr: 'Haiti' } },
  Scotland: {
    names: { es: 'Escocia', fr: 'Écosse', pt: 'Escócia', de: 'Schottland', nl: 'Schotland', tr: 'İskoçya' },
  },
  'United States': {
    names: {
      es: 'Estados Unidos',
      fr: 'États-Unis',
      pt: 'Estados Unidos',
      de: 'Vereinigte Staaten',
      nl: 'Verenigde Staten',
      tr: 'Amerika Birleşik Devletleri',
    },
    alt: ['etats unis', 'abd'],
  },
  Paraguay: { names: { es: 'Paraguay', fr: 'Paraguay', pt: 'Paraguai', de: 'Paraguay', nl: 'Paraguay', tr: 'Paraguay' } },
  Australia: {
    names: { es: 'Australia', fr: 'Australie', pt: 'Austrália', de: 'Australien', nl: 'Australië', tr: 'Avustralya' },
  },
  Türkiye: {
    names: { es: 'Turquía', fr: 'Turquie', pt: 'Turquia', de: 'Türkei', nl: 'Turkije', tr: 'Türkiye' },
  },
  Germany: {
    names: { es: 'Alemania', fr: 'Allemagne', pt: 'Alemanha', de: 'Deutschland', nl: 'Duitsland', tr: 'Almanya' },
  },
  Curaçao: { names: { es: 'Curazao', fr: 'Curaçao', pt: 'Curaçao', de: 'Curaçao', nl: 'Curaçao', tr: 'Curaçao' } },
  'Ivory Coast': {
    names: {
      es: 'Costa de Marfil',
      fr: 'Côte d’Ivoire',
      pt: 'Costa do Marfim',
      de: 'Elfenbeinküste',
      nl: 'Ivoorkust',
      tr: 'Fildişi Sahili',
    },
    alt: ["cote d'ivoire"],
  },
  Ecuador: { names: { es: 'Ecuador', fr: 'Équateur', pt: 'Equador', de: 'Ecuador', nl: 'Ecuador', tr: 'Ekvador' } },
  Netherlands: {
    names: { es: 'Países Bajos', fr: 'Pays-Bas', pt: 'Países Baixos', de: 'Niederlande', nl: 'Nederland', tr: 'Hollanda' },
    alt: ['holanda', 'hollande', 'holland'],
  },
  Japan: { names: { es: 'Japón', fr: 'Japon', pt: 'Japão', de: 'Japan', nl: 'Japan', tr: 'Japonya' } },
  Sweden: { names: { es: 'Suecia', fr: 'Suède', pt: 'Suécia', de: 'Schweden', nl: 'Zweden', tr: 'İsveç' } },
  Tunisia: { names: { es: 'Túnez', fr: 'Tunisie', pt: 'Tunísia', de: 'Tunesien', nl: 'Tunesië', tr: 'Tunus' } },
  Belgium: { names: { es: 'Bélgica', fr: 'Belgique', pt: 'Bélgica', de: 'Belgien', nl: 'België', tr: 'Belçika' } },
  Egypt: { names: { es: 'Egipto', fr: 'Égypte', pt: 'Egito', de: 'Ägypten', nl: 'Egypte', tr: 'Mısır' } },
  Iran: { names: { es: 'Irán', fr: 'Iran', pt: 'Irã', de: 'Iran', nl: 'Iran', tr: 'İran' } },
  'New Zealand': {
    names: {
      es: 'Nueva Zelanda',
      fr: 'Nouvelle-Zélande',
      pt: 'Nova Zelândia',
      de: 'Neuseeland',
      nl: 'Nieuw-Zeeland',
      tr: 'Yeni Zelanda',
    },
  },
  Spain: { names: { es: 'España', fr: 'Espagne', pt: 'Espanha', de: 'Spanien', nl: 'Spanje', tr: 'İspanya' } },
  'Cape Verde': {
    names: { es: 'Cabo Verde', fr: 'Cap-Vert', pt: 'Cabo Verde', de: 'Kap Verde', nl: 'Kaapverdië', tr: 'Yeşil Burun Adaları' },
    alt: ['kap verde'],
  },
  'Saudi Arabia': {
    names: {
      es: 'Arabia Saudita',
      fr: 'Arabie saoudite',
      pt: 'Arábia Saudita',
      de: 'Saudi-Arabien',
      nl: 'Saoedi-Arabië',
      tr: 'Suudi Arabistan',
    },
    alt: ['arabia saudí'],
  },
  Uruguay: { names: { es: 'Uruguay', fr: 'Uruguay', pt: 'Uruguai', de: 'Uruguay', nl: 'Uruguay', tr: 'Uruguay' } },
  France: { names: { es: 'Francia', fr: 'France', pt: 'França', de: 'Frankreich', nl: 'Frankrijk', tr: 'Fransa' } },
  Senegal: { names: { es: 'Senegal', fr: 'Sénégal', pt: 'Senegal', de: 'Senegal', nl: 'Senegal', tr: 'Senegal' } },
  Iraq: { names: { es: 'Irak', fr: 'Irak', pt: 'Iraque', de: 'Irak', nl: 'Irak', tr: 'Irak' } },
  Norway: { names: { es: 'Noruega', fr: 'Norvège', pt: 'Noruega', de: 'Norwegen', nl: 'Noorwegen', tr: 'Norveç' } },
  Argentina: {
    names: { es: 'Argentina', fr: 'Argentine', pt: 'Argentina', de: 'Argentinien', nl: 'Argentinië', tr: 'Arjantin' },
  },
  Algeria: { names: { es: 'Argelia', fr: 'Algérie', pt: 'Argélia', de: 'Algerien', nl: 'Algerije', tr: 'Cezayir' } },
  Austria: {
    names: { es: 'Austria', fr: 'Autriche', pt: 'Áustria', de: 'Österreich', nl: 'Oostenrijk', tr: 'Avusturya' },
  },
  Jordan: { names: { es: 'Jordania', fr: 'Jordanie', pt: 'Jordânia', de: 'Jordanien', nl: 'Jordanië', tr: 'Ürdün' } },
  Portugal: { names: { es: 'Portugal', fr: 'Portugal', pt: 'Portugal', de: 'Portugal', nl: 'Portugal', tr: 'Portekiz' } },
  'DR Congo': {
    names: {
      es: 'RD del Congo',
      fr: 'RD Congo',
      pt: 'RD do Congo',
      de: 'DR Kongo',
      nl: 'DR Congo',
      tr: 'Demokratik Kongo Cumhuriyeti',
    },
    alt: [
      'república democrática del congo',
      'république démocratique du congo',
      'república democrática do congo',
      'demokratische republik kongo',
      'democratische republiek congo',
    ],
  },
  Uzbekistan: {
    names: { es: 'Uzbekistán', fr: 'Ouzbékistan', pt: 'Uzbequistão', de: 'Usbekistan', nl: 'Oezbekistan', tr: 'Özbekistan' },
  },
  Colombia: {
    names: { es: 'Colombia', fr: 'Colombie', pt: 'Colômbia', de: 'Kolumbien', nl: 'Colombia', tr: 'Kolombiya' },
  },
  England: {
    names: { es: 'Inglaterra', fr: 'Angleterre', pt: 'Inglaterra', de: 'England', nl: 'Engeland', tr: 'İngiltere' },
  },
  Croatia: {
    names: { es: 'Croacia', fr: 'Croatie', pt: 'Croácia', de: 'Kroatien', nl: 'Kroatië', tr: 'Hırvatistan' },
  },
  Ghana: { names: { es: 'Ghana', fr: 'Ghana', pt: 'Gana', de: 'Ghana', nl: 'Ghana', tr: 'Gana' } },
  Panama: { names: { es: 'Panamá', fr: 'Panama', pt: 'Panamá', de: 'Panama', nl: 'Panama', tr: 'Panama' } },
}
