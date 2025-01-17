import Vue from 'vue'
import i18next from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import VueI18Next from '@panter/vue-i18next'
import getWeek from 'date-fns/getWeek'
import en from './locales/en.json'
import sl from './locales/sl.json'
import hr from './locales/hr.json'
import de from './locales/de.json'
import it from './locales/it.json'

import {Highcharts} from './visualizations/_highcharts'

Vue.use(VueI18Next)

const detectionOptions = {
  order: [
    'path',
    'cookie',
    'navigator',
    'localStorage',
    'subdomain',
    'queryString',
    'htmlTag',
  ],
  lookupLocalStorage: 'i18nextLng',
  lookupFromPathIndex: 0,
}

// Adds %W to Highcharts date formats
// docs: https://api.highcharts.com/class-reference/Highcharts.Time
Highcharts.dateFormats.W = function (timestamp) {
  return getWeek(timestamp, {weekStartsOn: 1}).toString()
};

function setHighchartsOptions () {
    (window.Highcharts || Highcharts).setOptions({
        global: {
            useUTC: false
        },
        lang: {
            loading: i18next.t("charts.common.loading"),
            months: i18next.t("month"),
            shortMonths: i18next.t("shortMonth"),
            weekdays: i18next.t("weekday"),
            rangeSelectorFrom: i18next.t("charts.common.from"),
            rangeSelectorTo: i18next.t("charts.common.to"),
            rangeSelectorZoom: i18next.t("charts.common.zoom"),
            resetZoom: i18next.t("charts.common.resetZoom"),
            resetZoomTitle: i18next.t("charts.common.resetZoomTitle"),
            thousandsSep: i18next.separators.group,
            decimalPoint: i18next.separators.decimal,
        }
    });
};

export function getSeparator(locale, separatorType) {
  const numberWithGroupAndDecimalSeparator = 1000.1;
  return Intl.NumberFormat(locale)
      .formatToParts(numberWithGroupAndDecimalSeparator)
      .find(part => part.type === separatorType)
      .value;
}

i18next.on('languageChanged', function(lng) {
  i18next.separators = {
    decimal: getSeparator(lng, 'decimal'),
    group: getSeparator(lng, 'group')
  }
  setHighchartsOptions(Highcharts);
});

i18next.use(LanguageDetector).init({
  lng: process.env.VUE_APP_DEFAULT_LANGUAGE,
  fallbackLng: ['en', 'sl', 'hr', 'de', 'it'],
  returnObjects: true,
  resources: {
    sl: { translation: sl },
    en: { translation: en },
    hr: { translation: hr },
    de: { translation: de },
    it: { translation: it },
  },
  detection: detectionOptions,
  interpolation: {
    format: function(value, format, lng) {
      if (value instanceof Date) {
        return (window.Highcharts || Highcharts).time.dateFormat(format, value.getTime());
      }
      return value
    },
  },
})
i18next.services.pluralResolver.addRule(
  // override plural rule from
  // https://github.com/i18next/i18next/blob/270904f6369ee9bbda059c3186fcea7baf9eb15d/src/PluralResolver.js#L62
  // to match the one in weblate
  'sl',
  {
    numbers: [0, 1, 2, 3],
    plurals: function plurals(n) {
      return Number(
        n % 100 == 1 ? 0 : n % 100 == 2 ? 1 : n % 100 == 3 || n % 100 == 4 ? 2 : 3
      )
    },
  }
)
localStorage.setItem('contextCountry', process.env.VUE_APP_LOCALE_CONTEXT)

const i18n = new VueI18Next(i18next)

export function formatNumber(number, opts = {}){
  return Intl.NumberFormat(i18next.language || 'sl-SI', opts).format(number)
}

export default i18n
