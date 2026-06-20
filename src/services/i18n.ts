import { useEffect, useState } from 'react'

// ── Çok dilli oyun (i18n) ─────────────────────────────────────────────────────
// Oyuncu dilini seçer (Ayarlar) → tüm çekirdek arayüz o dilde. Eksik anahtar
// İngilizce'ye, o da yoksa anahtar adına düşer. Diller dil-dil eklenir.

export type Lang = string
const KEY = 'hooder_lang'

// Oynanabilir diller (yerli ad + bayrak). Çeviri tabloları aşağıda.
export const LANGS: { code: Lang; native: string; flag: string }[] = [
  { code: 'tr', native: 'Türkçe',     flag: '🇹🇷' },
  { code: 'en', native: 'English',    flag: '🇬🇧' },
  { code: 'es', native: 'Español',    flag: '🇪🇸' },
  { code: 'fr', native: 'Français',   flag: '🇫🇷' },
  { code: 'de', native: 'Deutsch',    flag: '🇩🇪' },
  { code: 'it', native: 'Italiano',   flag: '🇮🇹' },
  { code: 'pt', native: 'Português',  flag: '🇵🇹' },
  { code: 'ru', native: 'Русский',    flag: '🇷🇺' },
  { code: 'ar', native: 'العربية',     flag: '🇸🇦' },
  { code: 'zh', native: '中文',        flag: '🇨🇳' },
  { code: 'ja', native: '日本語',       flag: '🇯🇵' },
  { code: 'ko', native: '한국어',       flag: '🇰🇷' },
  { code: 'hi', native: 'हिन्दी',       flag: '🇮🇳' },
  { code: 'az', native: 'Azərbaycan', flag: '🇦🇿' },
  { code: 'uk', native: 'Українська', flag: '🇺🇦' },
  { code: 'fa', native: 'فارسی',       flag: '🇮🇷' },
]

type Dict = Record<string, string>
const S: Record<Lang, Dict> = {
  tr: {
    tab_map:'Harita', tab_market:'Piyasa', tab_portfolio:'Portföy', tab_fx:'Döviz', tab_rank:'Sıralama', tab_store:'Mağaza', tab_settings:'Ayarlar',
    buy:'Al', sell:'Sat', buy_full:'Satın Al', insufficient:'Yetersiz bakiye', owned_short:'Senin', portfolio_mine:'Portföyüm',
    cash:'NAKİT', investor:'Yatırımcı', agent:'Emlakçı',
    fx_index:'Sanal Dünya Piyasa Endeksi', fx_cash:'Oyun Nakdi', fx_market:'Döviz Borsası', fx_sellall:'Tümünü Sat', fx_search:'Döviz ara...', fx_units:'birim',
    hood_total:'Toplam Mülk', hood_value:'Toplam Değer', hood_income:'Günlük Gelir', hood_owned:'Sahip Olduğun', unit_props:'mülk',
    set_display:'GÖRÜNTÜ', set_language:'OYUN DİLİ', set_refresh:'Yenileme Hızı', logout:'Çıkış Yap', delete_account:'Hesabı Sil', set_account:'HESAP',
  },
  en: {
    tab_map:'Map', tab_market:'Market', tab_portfolio:'Portfolio', tab_fx:'Forex', tab_rank:'Ranks', tab_store:'Store', tab_settings:'Settings',
    buy:'Buy', sell:'Sell', buy_full:'Buy', insufficient:'Insufficient funds', owned_short:'Yours', portfolio_mine:'My Portfolio',
    cash:'CASH', investor:'Investor', agent:'Agent',
    fx_index:'Virtual World Market Index', fx_cash:'Game Cash', fx_market:'Currency Exchange', fx_sellall:'Sell All', fx_search:'Search currency...', fx_units:'units',
    hood_total:'Total Properties', hood_value:'Total Value', hood_income:'Daily Income', hood_owned:'You Own', unit_props:'properties',
    set_display:'DISPLAY', set_language:'GAME LANGUAGE', set_refresh:'Refresh Rate', logout:'Sign Out', delete_account:'Delete Account', set_account:'ACCOUNT',
  },
  es: {
    tab_map:'Mapa', tab_market:'Mercado', tab_portfolio:'Cartera', tab_fx:'Divisas', tab_rank:'Ranking', tab_store:'Tienda', tab_settings:'Ajustes',
    buy:'Comprar', sell:'Vender', buy_full:'Comprar', insufficient:'Fondos insuficientes', owned_short:'Tuyo', portfolio_mine:'Mi Cartera',
    cash:'EFECTIVO', investor:'Inversor', agent:'Agente',
    fx_index:'Índice de Mercado Mundial', fx_cash:'Efectivo del Juego', fx_market:'Casa de Cambio', fx_sellall:'Vender Todo', fx_search:'Buscar divisa...', fx_units:'unidades',
    hood_total:'Propiedades', hood_value:'Valor Total', hood_income:'Ingreso Diario', hood_owned:'Tienes', unit_props:'propiedades',
    set_display:'PANTALLA', set_language:'IDIOMA', set_refresh:'Frecuencia', logout:'Cerrar Sesión', delete_account:'Eliminar Cuenta', set_account:'CUENTA',
  },
  fr: {
    tab_map:'Carte', tab_market:'Marché', tab_portfolio:'Portefeuille', tab_fx:'Devises', tab_rank:'Classement', tab_store:'Boutique', tab_settings:'Réglages',
    buy:'Acheter', sell:'Vendre', buy_full:'Acheter', insufficient:'Fonds insuffisants', owned_short:'À vous', portfolio_mine:'Mon Portefeuille',
    cash:'ESPÈCES', investor:'Investisseur', agent:'Agent',
    fx_index:'Indice du Marché Mondial', fx_cash:'Argent du Jeu', fx_market:'Bureau de Change', fx_sellall:'Tout Vendre', fx_search:'Chercher devise...', fx_units:'unités',
    hood_total:'Propriétés', hood_value:'Valeur Totale', hood_income:'Revenu Quotidien', hood_owned:'Vous Possédez', unit_props:'propriétés',
    set_display:'AFFICHAGE', set_language:'LANGUE', set_refresh:'Taux de Rafraîchissement', logout:'Déconnexion', delete_account:'Supprimer le Compte', set_account:'COMPTE',
  },
  de: {
    tab_map:'Karte', tab_market:'Markt', tab_portfolio:'Portfolio', tab_fx:'Devisen', tab_rank:'Rangliste', tab_store:'Shop', tab_settings:'Einstellungen',
    buy:'Kaufen', sell:'Verkaufen', buy_full:'Kaufen', insufficient:'Nicht genug Geld', owned_short:'Deins', portfolio_mine:'Mein Portfolio',
    cash:'BARGELD', investor:'Investor', agent:'Makler',
    fx_index:'Weltmarktindex', fx_cash:'Spielgeld', fx_market:'Wechselstube', fx_sellall:'Alles Verkaufen', fx_search:'Währung suchen...', fx_units:'Einheiten',
    hood_total:'Immobilien', hood_value:'Gesamtwert', hood_income:'Tageseinkommen', hood_owned:'Du Besitzt', unit_props:'Immobilien',
    set_display:'ANZEIGE', set_language:'SPRACHE', set_refresh:'Bildwiederholrate', logout:'Abmelden', delete_account:'Konto Löschen', set_account:'KONTO',
  },
  it: {
    tab_map:'Mappa', tab_market:'Mercato', tab_portfolio:'Portafoglio', tab_fx:'Valute', tab_rank:'Classifica', tab_store:'Negozio', tab_settings:'Impostazioni',
    buy:'Compra', sell:'Vendi', buy_full:'Compra', insufficient:'Fondi insufficienti', owned_short:'Tuo', portfolio_mine:'Il Mio Portafoglio',
    cash:'CONTANTI', investor:'Investitore', agent:'Agente',
    fx_index:'Indice del Mercato Mondiale', fx_cash:'Denaro di Gioco', fx_market:'Cambio Valuta', fx_sellall:'Vendi Tutto', fx_search:'Cerca valuta...', fx_units:'unità',
    hood_total:'Proprietà', hood_value:'Valore Totale', hood_income:'Reddito Giornaliero', hood_owned:'Possiedi', unit_props:'proprietà',
    set_display:'SCHERMO', set_language:'LINGUA', set_refresh:'Frequenza', logout:'Esci', delete_account:'Elimina Account', set_account:'ACCOUNT',
  },
  pt: {
    tab_map:'Mapa', tab_market:'Mercado', tab_portfolio:'Carteira', tab_fx:'Câmbio', tab_rank:'Ranking', tab_store:'Loja', tab_settings:'Definições',
    buy:'Comprar', sell:'Vender', buy_full:'Comprar', insufficient:'Saldo insuficiente', owned_short:'Seu', portfolio_mine:'Minha Carteira',
    cash:'DINHEIRO', investor:'Investidor', agent:'Corretor',
    fx_index:'Índice do Mercado Mundial', fx_cash:'Dinheiro do Jogo', fx_market:'Casa de Câmbio', fx_sellall:'Vender Tudo', fx_search:'Procurar moeda...', fx_units:'unidades',
    hood_total:'Imóveis', hood_value:'Valor Total', hood_income:'Renda Diária', hood_owned:'Você Possui', unit_props:'imóveis',
    set_display:'ECRÃ', set_language:'IDIOMA', set_refresh:'Taxa de Atualização', logout:'Sair', delete_account:'Apagar Conta', set_account:'CONTA',
  },
  ru: {
    tab_map:'Карта', tab_market:'Рынок', tab_portfolio:'Портфель', tab_fx:'Валюта', tab_rank:'Рейтинг', tab_store:'Магазин', tab_settings:'Настройки',
    buy:'Купить', sell:'Продать', buy_full:'Купить', insufficient:'Недостаточно средств', owned_short:'Ваше', portfolio_mine:'Мой Портфель',
    cash:'НАЛИЧНЫЕ', investor:'Инвестор', agent:'Агент',
    fx_index:'Индекс мирового рынка', fx_cash:'Игровые деньги', fx_market:'Обмен валют', fx_sellall:'Продать всё', fx_search:'Поиск валюты...', fx_units:'ед.',
    hood_total:'Объекты', hood_value:'Общая стоимость', hood_income:'Доход в день', hood_owned:'У вас', unit_props:'объектов',
    set_display:'ЭКРАН', set_language:'ЯЗЫК', set_refresh:'Частота обновления', logout:'Выйти', delete_account:'Удалить аккаунт', set_account:'АККАУНТ',
  },
  ar: {
    tab_map:'الخريطة', tab_market:'السوق', tab_portfolio:'المحفظة', tab_fx:'العملات', tab_rank:'الترتيب', tab_store:'المتجر', tab_settings:'الإعدادات',
    buy:'شراء', sell:'بيع', buy_full:'شراء', insufficient:'رصيد غير كافٍ', owned_short:'لك', portfolio_mine:'محفظتي',
    cash:'النقد', investor:'مستثمر', agent:'وكيل',
    fx_index:'مؤشر السوق العالمي', fx_cash:'نقود اللعبة', fx_market:'صرف العملات', fx_sellall:'بيع الكل', fx_search:'ابحث عن عملة...', fx_units:'وحدة',
    hood_total:'العقارات', hood_value:'القيمة الإجمالية', hood_income:'الدخل اليومي', hood_owned:'تملك', unit_props:'عقار',
    set_display:'العرض', set_language:'اللغة', set_refresh:'معدل التحديث', logout:'تسجيل الخروج', delete_account:'حذف الحساب', set_account:'الحساب',
  },
  zh: {
    tab_map:'地图', tab_market:'市场', tab_portfolio:'资产', tab_fx:'外汇', tab_rank:'排行', tab_store:'商店', tab_settings:'设置',
    buy:'购买', sell:'出售', buy_full:'购买', insufficient:'余额不足', owned_short:'你的', portfolio_mine:'我的资产',
    cash:'现金', investor:'投资者', agent:'经纪人',
    fx_index:'虚拟世界市场指数', fx_cash:'游戏现金', fx_market:'货币兑换', fx_sellall:'全部卖出', fx_search:'搜索货币...', fx_units:'单位',
    hood_total:'房产', hood_value:'总价值', hood_income:'每日收入', hood_owned:'你拥有', unit_props:'处房产',
    set_display:'显示', set_language:'语言', set_refresh:'刷新率', logout:'退出登录', delete_account:'删除账户', set_account:'账户',
  },
  ja: {
    tab_map:'地図', tab_market:'市場', tab_portfolio:'資産', tab_fx:'為替', tab_rank:'ランク', tab_store:'ストア', tab_settings:'設定',
    buy:'購入', sell:'売却', buy_full:'購入', insufficient:'残高不足', owned_short:'所有', portfolio_mine:'マイ資産',
    cash:'現金', investor:'投資家', agent:'仲介業者',
    fx_index:'仮想世界市場指数', fx_cash:'ゲーム内現金', fx_market:'通貨両替', fx_sellall:'すべて売却', fx_search:'通貨を検索...', fx_units:'単位',
    hood_total:'物件数', hood_value:'総額', hood_income:'日次収入', hood_owned:'所有数', unit_props:'物件',
    set_display:'表示', set_language:'言語', set_refresh:'リフレッシュレート', logout:'ログアウト', delete_account:'アカウント削除', set_account:'アカウント',
  },
  ko: {
    tab_map:'지도', tab_market:'시장', tab_portfolio:'자산', tab_fx:'외환', tab_rank:'순위', tab_store:'상점', tab_settings:'설정',
    buy:'구매', sell:'판매', buy_full:'구매', insufficient:'잔액 부족', owned_short:'보유', portfolio_mine:'내 자산',
    cash:'현금', investor:'투자자', agent:'중개인',
    fx_index:'가상 세계 시장 지수', fx_cash:'게임 현금', fx_market:'환전소', fx_sellall:'전부 판매', fx_search:'통화 검색...', fx_units:'단위',
    hood_total:'부동산', hood_value:'총 가치', hood_income:'일일 수입', hood_owned:'보유', unit_props:'개',
    set_display:'화면', set_language:'언어', set_refresh:'주사율', logout:'로그아웃', delete_account:'계정 삭제', set_account:'계정',
  },
  hi: {
    tab_map:'नक्शा', tab_market:'बाज़ार', tab_portfolio:'पोर्टफ़ोलियो', tab_fx:'मुद्रा', tab_rank:'रैंक', tab_store:'स्टोर', tab_settings:'सेटिंग्स',
    buy:'खरीदें', sell:'बेचें', buy_full:'खरीदें', insufficient:'अपर्याप्त राशि', owned_short:'आपका', portfolio_mine:'मेरा पोर्टफ़ोलियो',
    cash:'नकद', investor:'निवेशक', agent:'एजेंट',
    fx_index:'वैश्विक बाज़ार सूचकांक', fx_cash:'गेम नकद', fx_market:'मुद्रा विनिमय', fx_sellall:'सब बेचें', fx_search:'मुद्रा खोजें...', fx_units:'इकाई',
    hood_total:'संपत्तियाँ', hood_value:'कुल मूल्य', hood_income:'दैनिक आय', hood_owned:'आपके पास', unit_props:'संपत्ति',
    set_display:'डिस्प्ले', set_language:'भाषा', set_refresh:'रिफ्रेश दर', logout:'साइन आउट', delete_account:'खाता हटाएं', set_account:'खाता',
  },
  az: {
    tab_map:'Xəritə', tab_market:'Bazar', tab_portfolio:'Portfel', tab_fx:'Valyuta', tab_rank:'Reytinq', tab_store:'Mağaza', tab_settings:'Ayarlar',
    buy:'Al', sell:'Sat', buy_full:'Satın Al', insufficient:'Balans kifayət deyil', owned_short:'Sənin', portfolio_mine:'Portfelim',
    cash:'NAĞD', investor:'İnvestor', agent:'Agent',
    fx_index:'Virtual Dünya Bazar İndeksi', fx_cash:'Oyun Nağdı', fx_market:'Valyuta Birjası', fx_sellall:'Hamısını Sat', fx_search:'Valyuta axtar...', fx_units:'vahid',
    hood_total:'Əmlaklar', hood_value:'Ümumi Dəyər', hood_income:'Günlük Gəlir', hood_owned:'Sahib olduğun', unit_props:'əmlak',
    set_display:'EKRAN', set_language:'OYUN DİLİ', set_refresh:'Yeniləmə Tezliyi', logout:'Çıxış', delete_account:'Hesabı Sil', set_account:'HESAB',
  },
  uk: {
    tab_map:'Карта', tab_market:'Ринок', tab_portfolio:'Портфель', tab_fx:'Валюта', tab_rank:'Рейтинг', tab_store:'Магазин', tab_settings:'Налаштування',
    buy:'Купити', sell:'Продати', buy_full:'Купити', insufficient:'Недостатньо коштів', owned_short:'Ваше', portfolio_mine:'Мій портфель',
    cash:'ГОТІВКА', investor:'Інвестор', agent:'Агент',
    fx_index:'Індекс світового ринку', fx_cash:'Ігрові гроші', fx_market:'Обмін валют', fx_sellall:'Продати все', fx_search:'Пошук валюти...', fx_units:'од.',
    hood_total:'Об’єкти', hood_value:'Загальна вартість', hood_income:'Дохід за день', hood_owned:'У вас', unit_props:'об’єктів',
    set_display:'ЕКРАН', set_language:'МОВА', set_refresh:'Частота оновлення', logout:'Вийти', delete_account:'Видалити акаунт', set_account:'АКАУНТ',
  },
  fa: {
    tab_map:'نقشه', tab_market:'بازار', tab_portfolio:'سبد', tab_fx:'ارز', tab_rank:'رتبه', tab_store:'فروشگاه', tab_settings:'تنظیمات',
    buy:'خرید', sell:'فروش', buy_full:'خرید', insufficient:'موجودی ناکافی', owned_short:'مال شما', portfolio_mine:'سبد من',
    cash:'نقد', investor:'سرمایه‌گذار', agent:'مشاور املاک',
    fx_index:'شاخص بازار جهانی', fx_cash:'پول بازی', fx_market:'صرافی', fx_sellall:'فروش همه', fx_search:'جستجوی ارز...', fx_units:'واحد',
    hood_total:'املاک', hood_value:'ارزش کل', hood_income:'درآمد روزانه', hood_owned:'شما دارید', unit_props:'ملک',
    set_display:'نمایش', set_language:'زبان', set_refresh:'نرخ تازه‌سازی', logout:'خروج', delete_account:'حذف حساب', set_account:'حساب',
  },
}

// RTL diller
export const RTL = new Set(['ar', 'fa', 'he', 'ur'])

let _lang: Lang = (() => {
  try { return localStorage.getItem(KEY) || (navigator.language || 'tr').slice(0, 2) } catch { return 'tr' }
})()
if (!S[_lang]) _lang = S[(navigator?.language || '').slice(0, 2)] ? (navigator.language).slice(0, 2) : 'en'

const listeners = new Set<() => void>()

export function getLang(): Lang { return _lang }
export function setLang(code: Lang) {
  _lang = S[code] ? code : 'en'
  try { localStorage.setItem(KEY, _lang) } catch { /* ignore */ }
  try { document.documentElement.lang = _lang; document.documentElement.dir = RTL.has(_lang) ? 'rtl' : 'ltr' } catch { /* ignore */ }
  listeners.forEach(l => l())
}

export function t(key: string): string {
  return S[_lang]?.[key] ?? S.en[key] ?? key
}

// Bileşenlerin dil değişince yeniden render olması için
export function useLang() {
  const [, force] = useState(0)
  useEffect(() => {
    const l = () => force(n => n + 1)
    listeners.add(l)
    return () => { listeners.delete(l) }
  }, [])
  return { lang: _lang, t, setLang }
}

// Açılışta html lang/dir ayarla
try { document.documentElement.lang = _lang; document.documentElement.dir = RTL.has(_lang) ? 'rtl' : 'ltr' } catch { /* ignore */ }
