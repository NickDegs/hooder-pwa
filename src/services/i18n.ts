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

// Derin ekran metinleri — anahtar→dil (kısmi kapsam, eksikse İngilizce'ye düşer)
const EXTRA: Record<string, Record<string, string>> = {
  // ── Hediye kodu ──
  gift_title:{ tr:'Hediye Kodu', en:'Gift Code', es:'Código de Regalo', fr:'Code Cadeau', de:'Geschenkcode', it:'Codice Regalo', pt:'Código de Presente', ru:'Подарочный код', ar:'رمز الهدية', zh:'礼品码', ja:'ギフトコード', ko:'기프트 코드', az:'Hədiyyə Kodu', uk:'Подарунковий код', fa:'کد هدیه', hi:'गिफ्ट कोड' },
  gift_desc:{ tr:'Sana hediye edilen kodu gir, ödülünü anında al.', en:'Enter a gift code you received and get your reward instantly.', es:'Introduce un código de regalo y recibe tu recompensa.', fr:'Saisis un code cadeau et reçois ta récompense.', de:'Gib einen Geschenkcode ein und erhalte deine Belohnung.', it:'Inserisci un codice regalo e ricevi la ricompensa.', pt:'Insere um código de presente e recebe a recompensa.', ru:'Введите подарочный код и получите награду.', ar:'أدخل رمز هدية واحصل على مكافأتك فوراً.', zh:'输入礼品码，立即领取奖励。', ja:'ギフトコードを入力して報酬を受け取ろう。', ko:'기프트 코드를 입력하고 보상을 받으세요.', az:'Hədiyyə kodunu daxil et, mükafatını dərhal al.', uk:'Введіть подарунковий код і отримайте нагороду.', fa:'کد هدیه را وارد کنید و پاداش خود را بگیرید.', hi:'गिफ्ट कोड डालें और इनाम पाएं।' },
  gift_ph:{ tr:'HOODER-XXXXXXXX', en:'HOODER-XXXXXXXX', es:'HOODER-XXXXXXXX', fr:'HOODER-XXXXXXXX', de:'HOODER-XXXXXXXX', it:'HOODER-XXXXXXXX', pt:'HOODER-XXXXXXXX', ru:'HOODER-XXXXXXXX', ar:'HOODER-XXXXXXXX', zh:'HOODER-XXXXXXXX', ja:'HOODER-XXXXXXXX', ko:'HOODER-XXXXXXXX', az:'HOODER-XXXXXXXX', uk:'HOODER-XXXXXXXX', fa:'HOODER-XXXXXXXX', hi:'HOODER-XXXXXXXX' },
  gift_redeem:{ tr:'Kullan', en:'Redeem', es:'Canjear', fr:'Utiliser', de:'Einlösen', it:'Riscatta', pt:'Resgatar', ru:'Активировать', ar:'استخدام', zh:'兑换', ja:'引き換え', ko:'사용', az:'İstifadə et', uk:'Активувати', fa:'استفاده', hi:'भुनाएं' },
  gift_won:{ tr:'kazandın!', en:'earned!', es:'¡ganado!', fr:'gagné !', de:'erhalten!', it:'ottenuto!', pt:'ganho!', ru:'получено!', ar:'حصلت عليه!', zh:'已获得！', ja:'獲得！', ko:'획득!', az:'qazandın!', uk:'отримано!', fa:'دریافت شد!', hi:'मिला!' },
  gift_invalid:{ tr:'Kod geçersiz veya kullanılmış', en:'Invalid or used code', es:'Código no válido o usado', fr:'Code invalide ou utilisé', de:'Ungültiger oder benutzter Code', it:'Codice non valido o usato', pt:'Código inválido ou usado', ru:'Неверный или использованный код', ar:'رمز غير صالح أو مستخدم', zh:'无效或已使用的码', ja:'無効または使用済みのコード', ko:'유효하지 않거나 사용된 코드', az:'Kod yanlış və ya istifadə olunub', uk:'Недійсний або використаний код', fa:'کد نامعتبر یا استفاده‌شده', hi:'अमान्य या प्रयुक्त कोड' },
  // ── Liste görünümü (harita alternatifi) ──
  list_title:{ tr:'Bu Bölgedeki Mülkler', en:'Properties Here', es:'Propiedades Aquí', fr:'Biens Ici', de:'Immobilien Hier', it:'Immobili Qui', pt:'Imóveis Aqui', ru:'Объекты здесь', ar:'العقارات هنا', zh:'此区域房产', ja:'このエリアの物件', ko:'이 지역 매물', az:'Buradakı Əmlaklar', uk:'Об’єкти тут', fa:'املاک اینجا', hi:'यहाँ की संपत्तियाँ' },
  list_count:{ tr:'mülk', en:'properties', es:'propiedades', fr:'biens', de:'Immobilien', it:'immobili', pt:'imóveis', ru:'объектов', ar:'عقار', zh:'处房产', ja:'件', ko:'개', az:'əmlak', uk:'об’єктів', fa:'ملک', hi:'संपत्तियाँ' },
  list_empty:{ tr:'Bu alanda mülk yok — haritada bir bölgeye yakınlaş', en:'No properties here — zoom into an area on the map', es:'Sin propiedades aquí — acércate a una zona', fr:'Aucun bien ici — zoome sur une zone', de:'Keine Immobilien hier — zoome auf ein Gebiet', it:'Nessun immobile qui — zooma su un’area', pt:'Sem imóveis aqui — aproxima numa área', ru:'Здесь нет объектов — приблизьте район', ar:'لا عقارات هنا — قرّب منطقة على الخريطة', zh:'此处无房产 — 在地图上放大某区域', ja:'物件なし — 地図でエリアをズーム', ko:'이 지역에 매물 없음 — 지도를 확대하세요', az:'Burada əmlak yox — xəritədə bir əraziyə yaxınlaş', uk:'Тут немає об’єктів — наблизьте район', fa:'اینجا ملکی نیست — روی منطقه‌ای زوم کنید', hi:'यहाँ संपत्ति नहीं — मानचित्र पर ज़ूम करें' },
  list_view:{ tr:'Liste', en:'List', es:'Lista', fr:'Liste', de:'Liste', it:'Lista', pt:'Lista', ru:'Список', ar:'قائمة', zh:'列表', ja:'リスト', ko:'목록', az:'Siyahı', uk:'Список', fa:'فهرست', hi:'सूची' },
  // ── SMS (telefon) giriş ──
  sms_login:{ tr:'SMS', en:'SMS', es:'SMS', fr:'SMS', de:'SMS', it:'SMS', pt:'SMS', ru:'SMS', ar:'SMS', zh:'短信', ja:'SMS', ko:'SMS', az:'SMS', uk:'SMS', fa:'پیامک', hi:'SMS' },
  sms_phone:{ tr:'Telefon (ülke koduyla)', en:'Phone (with country code)', es:'Teléfono (con código de país)', fr:'Téléphone (avec indicatif)', de:'Telefon (mit Ländercode)', it:'Telefono (con prefisso)', pt:'Telefone (com código do país)', ru:'Телефон (с кодом страны)', ar:'الهاتف (مع رمز الدولة)', zh:'电话（含国家代码）', ja:'電話番号（国番号付き）', ko:'전화번호 (국가번호 포함)', az:'Telefon (ölkə kodu ilə)', uk:'Телефон (з кодом країни)', fa:'تلفن (با کد کشور)', hi:'फ़ोन (देश कोड के साथ)' },
  sms_send:{ tr:'Kod Gönder', en:'Send Code', es:'Enviar Código', fr:'Envoyer le Code', de:'Code Senden', it:'Invia Codice', pt:'Enviar Código', ru:'Отправить код', ar:'إرسال الرمز', zh:'发送验证码', ja:'コードを送信', ko:'코드 전송', az:'Kod Göndər', uk:'Надіслати код', fa:'ارسال کد', hi:'कोड भेजें' },
  sms_code:{ tr:'SMS kodu', en:'SMS code', es:'Código SMS', fr:'Code SMS', de:'SMS-Code', it:'Codice SMS', pt:'Código SMS', ru:'Код из SMS', ar:'رمز SMS', zh:'短信验证码', ja:'SMSコード', ko:'SMS 코드', az:'SMS kodu', uk:'Код з SMS', fa:'کد پیامک', hi:'SMS कोड' },
  sms_verify:{ tr:'Doğrula ve Giriş', en:'Verify & Sign In', es:'Verificar y Entrar', fr:'Vérifier et Connexion', de:'Bestätigen & Anmelden', it:'Verifica e Accedi', pt:'Verificar e Entrar', ru:'Подтвердить и войти', ar:'تحقق وادخل', zh:'验证并登录', ja:'確認してログイン', ko:'확인 후 로그인', az:'Təsdiqlə və Giriş', uk:'Підтвердити і увійти', fa:'تأیید و ورود', hi:'सत्यापित करें और साइन इन' },
  sms_sent:{ tr:'Kod gönderildi — SMS’ini kontrol et', en:'Code sent — check your SMS', es:'Código enviado — revisa tu SMS', fr:'Code envoyé — vérifie tes SMS', de:'Code gesendet — prüfe deine SMS', it:'Codice inviato — controlla gli SMS', pt:'Código enviado — verifica o SMS', ru:'Код отправлен — проверьте SMS', ar:'تم إرسال الرمز — تحقق من رسائلك', zh:'验证码已发送，请查看短信', ja:'コードを送信しました。SMSを確認', ko:'코드 전송됨 — SMS 확인', az:'Kod göndərildi — SMS-i yoxla', uk:'Код надіслано — перевірте SMS', fa:'کد ارسال شد — پیامک را بررسی کنید', hi:'कोड भेजा गया — अपना SMS देखें' },
  sms_hint:{ tr:'Telefon numaranla giriş yap. İlerlemen numarana bağlı bulutta saklanır, başka cihazda aynı numarayla devam edersin.', en:'Sign in with your phone. Your progress is saved to the cloud tied to your number — continue on any device with the same number.', es:'Entra con tu teléfono. Tu progreso se guarda en la nube vinculado a tu número.', fr:'Connecte-toi avec ton téléphone. Ta progression est sauvegardée dans le cloud liée à ton numéro.', de:'Melde dich mit deinem Telefon an. Dein Fortschritt wird in der Cloud mit deiner Nummer gespeichert.', it:'Accedi col telefono. I progressi sono salvati nel cloud legati al tuo numero.', pt:'Entra com o teu telemóvel. O progresso é guardado na nuvem ligado ao teu número.', ru:'Войдите по телефону. Прогресс сохраняется в облаке и привязан к номеру.', ar:'سجّل الدخول برقم هاتفك. يُحفظ تقدمك في السحابة مرتبطًا برقمك.', zh:'用手机号登录。进度按手机号保存在云端。', ja:'電話番号でログイン。進行状況は番号に紐づいてクラウド保存。', ko:'전화번호로 로그인. 진행 상황이 번호에 연동되어 클라우드에 저장됩니다.', az:'Telefonla giriş et. İrəliləyişin nömrənə bağlı buludda saxlanır.', uk:'Увійдіть за номером. Прогрес зберігається в хмарі та прив’язаний до номера.', fa:'با تلفن وارد شوید. پیشرفت شما به شماره‌تان در ابر ذخیره می‌شود.', hi:'अपने फ़ोन से साइन इन करें। आपकी प्रगति आपके नंबर से जुड़ी क्लाउड में सहेजी जाती है।' },
  // ── Mülk kategorileri (16 dilde — açıklama + kategori rozeti) ──
  cat_hotel:{ tr:'Otel', en:'Hotel', es:'Hotel', fr:'Hôtel', de:'Hotel', it:'Hotel', pt:'Hotel', ru:'Отель', ar:'فندق', zh:'酒店', ja:'ホテル', ko:'호텔', az:'Otel', uk:'Готель', fa:'هتل', hi:'होटल' },
  cat_office:{ tr:'Ofis', en:'Office', es:'Oficina', fr:'Bureau', de:'Büro', it:'Ufficio', pt:'Escritório', ru:'Офис', ar:'مكتب', zh:'办公楼', ja:'オフィス', ko:'오피스', az:'Ofis', uk:'Офіс', fa:'دفتر', hi:'कार्यालय' },
  cat_retail:{ tr:'Mağaza', en:'Store', es:'Tienda', fr:'Magasin', de:'Geschäft', it:'Negozio', pt:'Loja', ru:'Магазин', ar:'متجر', zh:'商店', ja:'店舗', ko:'상점', az:'Mağaza', uk:'Магазин', fa:'فروشگاه', hi:'दुकान' },
  cat_building:{ tr:'Bina', en:'Building', es:'Edificio', fr:'Immeuble', de:'Gebäude', it:'Edificio', pt:'Edifício', ru:'Здание', ar:'مبنى', zh:'楼宇', ja:'ビル', ko:'건물', az:'Bina', uk:'Будівля', fa:'ساختمان', hi:'इमारत' },
  cat_landmark:{ tr:'Eser', en:'Landmark', es:'Monumento', fr:'Monument', de:'Wahrzeichen', it:'Monumento', pt:'Marco', ru:'Достопримечательность', ar:'معلم', zh:'地标', ja:'ランドマーク', ko:'랜드마크', az:'Abidə', uk:'Пам’ятка', fa:'نشانه', hi:'स्थल' },
  cat_park:{ tr:'Park', en:'Park', es:'Parque', fr:'Parc', de:'Park', it:'Parco', pt:'Parque', ru:'Парк', ar:'حديقة', zh:'公园', ja:'公園', ko:'공원', az:'Park', uk:'Парк', fa:'پارک', hi:'पार्क' },
  cat_stadium:{ tr:'Stadyum', en:'Stadium', es:'Estadio', fr:'Stade', de:'Stadion', it:'Stadio', pt:'Estádio', ru:'Стадион', ar:'ملعب', zh:'体育场', ja:'スタジアム', ko:'경기장', az:'Stadion', uk:'Стадіон', fa:'استادیوم', hi:'स्टेडियम' },
  cat_residential:{ tr:'Konut', en:'Residential', es:'Residencial', fr:'Résidentiel', de:'Wohnhaus', it:'Residenziale', pt:'Residencial', ru:'Жильё', ar:'سكني', zh:'住宅', ja:'住宅', ko:'주거', az:'Yaşayış', uk:'Житло', fa:'مسکونی', hi:'आवासीय' },
  cat_land:{ tr:'Arsa', en:'Land', es:'Terreno', fr:'Terrain', de:'Grundstück', it:'Terreno', pt:'Terreno', ru:'Земля', ar:'أرض', zh:'土地', ja:'土地', ko:'토지', az:'Torpaq', uk:'Земля', fa:'زمین', hi:'भूमि' },
  cat_industrial:{ tr:'Endüstri', en:'Industrial', es:'Industrial', fr:'Industriel', de:'Industrie', it:'Industriale', pt:'Industrial', ru:'Промышленность', ar:'صناعي', zh:'工业', ja:'工業', ko:'산업', az:'Sənaye', uk:'Промисловість', fa:'صنعتی', hi:'औद्योगिक' },
  cat_marina:{ tr:'Marina', en:'Marina', es:'Marina', fr:'Marina', de:'Marina', it:'Marina', pt:'Marina', ru:'Марина', ar:'مرسى', zh:'码头', ja:'マリーナ', ko:'마리나', az:'Marina', uk:'Марина', fa:'مارینا', hi:'मरीना' },
  cat_street:{ tr:'Cadde', en:'Street', es:'Calle', fr:'Rue', de:'Straße', it:'Via', pt:'Rua', ru:'Улица', ar:'شارع', zh:'街道', ja:'通り', ko:'거리', az:'Küçə', uk:'Вулиця', fa:'خیابان', hi:'सड़क' },
  // ── Prosedürel mülk adları: semt + tip (16 dilin HEPSİNDE) ──
  wd_central:{ tr:'Merkez', en:'Central', es:'Centro', fr:'Centre', de:'Zentrum', it:'Centro', pt:'Centro', ru:'Центр', ar:'المركز', zh:'中心', ja:'中央', ko:'중심', az:'Mərkəz', uk:'Центр', fa:'مرکزی', hi:'केंद्र' },
  wd_riverside:{ tr:'Nehirkenarı', en:'Riverside', es:'Ribera', fr:'Rive', de:'Ufer', it:'Lungofiume', pt:'Beira-rio', ru:'Набережная', ar:'ضفة النهر', zh:'河畔', ja:'川沿い', ko:'강변', az:'Çay kənarı', uk:'Набережна', fa:'کنار رود', hi:'नदी किनारा' },
  wd_hilltop:{ tr:'Tepe', en:'Hilltop', es:'Colina', fr:'Colline', de:'Hügel', it:'Collina', pt:'Colina', ru:'Холм', ar:'التل', zh:'山顶', ja:'丘の上', ko:'언덕', az:'Təpə', uk:'Пагорб', fa:'تپه', hi:'पहाड़ी' },
  wd_newcity:{ tr:'Yenişehir', en:'New City', es:'Ciudad Nueva', fr:'Ville Nouvelle', de:'Neustadt', it:'Città Nuova', pt:'Cidade Nova', ru:'Новый город', ar:'المدينة الجديدة', zh:'新城', ja:'新市街', ko:'신도시', az:'Yeni şəhər', uk:'Нове місто', fa:'شهر جدید', hi:'नया शहर' },
  wd_harbor:{ tr:'Liman', en:'Harbor', es:'Puerto', fr:'Port', de:'Hafen', it:'Porto', pt:'Porto', ru:'Гавань', ar:'الميناء', zh:'港口', ja:'港', ko:'항구', az:'Liman', uk:'Гавань', fa:'بندر', hi:'बंदरगाह' },
  wd_garden:{ tr:'Bahçeli', en:'Garden', es:'Jardín', fr:'Jardin', de:'Garten', it:'Giardino', pt:'Jardim', ru:'Сад', ar:'الحديقة', zh:'花园', ja:'庭園', ko:'정원', az:'Bağ', uk:'Сад', fa:'باغ', hi:'उद्यान' },
  wd_park:{ tr:'Park', en:'Park', es:'Parque', fr:'Parc', de:'Park', it:'Parco', pt:'Parque', ru:'Парк', ar:'الحديقة العامة', zh:'公园', ja:'公園', ko:'공원', az:'Park', uk:'Парк', fa:'پارک', hi:'पार्क' },
  wd_marina:{ tr:'Marina', en:'Marina', es:'Marina', fr:'Marina', de:'Marina', it:'Marina', pt:'Marina', ru:'Марина', ar:'المرسى', zh:'码头', ja:'マリーナ', ko:'마리나', az:'Marina', uk:'Марина', fa:'مارینا', hi:'मरीना' },
  wd_valley:{ tr:'Vadi', en:'Valley', es:'Valle', fr:'Vallée', de:'Tal', it:'Valle', pt:'Vale', ru:'Долина', ar:'الوادي', zh:'山谷', ja:'谷', ko:'계곡', az:'Vadi', uk:'Долина', fa:'دره', hi:'घाटी' },
  wd_coast:{ tr:'Sahil', en:'Coast', es:'Costa', fr:'Côte', de:'Küste', it:'Costa', pt:'Costa', ru:'Берег', ar:'الساحل', zh:'海岸', ja:'海岸', ko:'해안', az:'Sahil', uk:'Берег', fa:'ساحل', hi:'तट' },
  wd_south:{ tr:'Güney', en:'South', es:'Sur', fr:'Sud', de:'Süd', it:'Sud', pt:'Sul', ru:'Юг', ar:'الجنوب', zh:'南区', ja:'南', ko:'남부', az:'Cənub', uk:'Південь', fa:'جنوب', hi:'दक्षिण' },
  wd_north:{ tr:'Kuzey', en:'North', es:'Norte', fr:'Nord', de:'Nord', it:'Nord', pt:'Norte', ru:'Север', ar:'الشمال', zh:'北区', ja:'北', ko:'북부', az:'Şimal', uk:'Північ', fa:'شمال', hi:'उत्तर' },
  wt_hotel:{ tr:'Otel', en:'Hotel', es:'Hotel', fr:'Hôtel', de:'Hotel', it:'Hotel', pt:'Hotel', ru:'Отель', ar:'فندق', zh:'酒店', ja:'ホテル', ko:'호텔', az:'Otel', uk:'Готель', fa:'هتل', hi:'होटल' },
  wt_tower:{ tr:'Kule', en:'Tower', es:'Torre', fr:'Tour', de:'Turm', it:'Torre', pt:'Torre', ru:'Башня', ar:'برج', zh:'大厦', ja:'タワー', ko:'타워', az:'Qüllə', uk:'Вежа', fa:'برج', hi:'टावर' },
  wt_landmark:{ tr:'Anıt', en:'Landmark', es:'Monumento', fr:'Monument', de:'Wahrzeichen', it:'Monumento', pt:'Marco', ru:'Достопримечательность', ar:'معلم', zh:'地标', ja:'ランドマーク', ko:'랜드마크', az:'Abidə', uk:'Пам’ятка', fa:'نشانه', hi:'स्थल' },
  wt_mall:{ tr:'AVM', en:'Mall', es:'Centro Comercial', fr:'Centre Commercial', de:'Einkaufszentrum', it:'Centro Commerciale', pt:'Shopping', ru:'Торговый центр', ar:'مول', zh:'购物中心', ja:'モール', ko:'몰', az:'Ticarət Mərkəzi', uk:'Торговий центр', fa:'مرکز خرید', hi:'मॉल' },
  wt_residence:{ tr:'Rezidans', en:'Residence', es:'Residencia', fr:'Résidence', de:'Residenz', it:'Residenza', pt:'Residência', ru:'Резиденция', ar:'مجمع سكني', zh:'公寓', ja:'レジデンス', ko:'레지던스', az:'Rezidens', uk:'Резиденція', fa:'رزیدنس', hi:'रेज़िडेंस' },
  wt_apartments:{ tr:'Apartmanı', en:'Apartments', es:'Apartamentos', fr:'Appartements', de:'Apartments', it:'Appartamenti', pt:'Apartamentos', ru:'Апартаменты', ar:'شقق', zh:'公寓楼', ja:'アパート', ko:'아파트', az:'Mənzillər', uk:'Апартаменти', fa:'آپارتمان', hi:'अपार्टमेंट' },
  wt_plaza:{ tr:'Plaza', en:'Plaza', es:'Plaza', fr:'Place', de:'Plaza', it:'Plaza', pt:'Praça', ru:'Плаза', ar:'بلازا', zh:'广场', ja:'プラザ', ko:'플라자', az:'Plaza', uk:'Плаза', fa:'پلازا', hi:'प्लाज़ा' },
  wt_gardens:{ tr:'Konutları', en:'Gardens', es:'Jardines', fr:'Jardins', de:'Gärten', it:'Giardini', pt:'Jardins', ru:'Сады', ar:'حدائق', zh:'花园', ja:'ガーデンズ', ko:'가든', az:'Bağlar', uk:'Сади', fa:'باغات', hi:'गार्डन' },
  // ── Kademeli emlakçı paketleri ({city}/{country} panelde değiştirilir) ──
  agent_choose:{ tr:'Emlakçı Paketi Seç', en:'Choose an Agent Package', de:'Makler-Paket wählen', fr:'Choisir un forfait agent', es:'Elige un paquete de agente', ru:'Выберите пакет агента', ar:'اختر باقة وكيل', zh:'选择中介套餐', ja:'エージェントパックを選択', it:'Scegli un pacchetto agente', pt:'Escolha um pacote de agente', ko:'에이전트 패키지 선택', hi:'एजेंट पैकेज चुनें', az:'Agent paketi seçin', uk:'Виберіть пакет агента', fa:'بسته نماینده را انتخاب کنید' },
  ag_c1_t:{ tr:'Tek Şehir Emlakçısı', en:'Single City Agent' },
  ag_c1_d:{ tr:'{city} açılır', en:'Unlocks {city}' },
  ag_c2_t:{ tr:'Bölge Emlakçısı', en:'Regional Agent' },
  ag_c2_d:{ tr:'{country} genelindeki TÜM şehirler', en:'ALL cities across {country}' },
  ag_c3_t:{ tr:'VIP Şehir Emlakçısı', en:'VIP City Agent' },
  ag_c3_d:{ tr:'{city} + işlemler ANINDA', en:'{city} + INSTANT deals' },
  ag_k1_t:{ tr:'Tek Ülke Emlakçısı', en:'Single Country Agent' },
  ag_k1_d:{ tr:'{country} açılır', en:'Unlocks {country}' },
  ag_k2_t:{ tr:'VIP Ülke Emlakçısı', en:'VIP Country Agent' },
  ag_k2_d:{ tr:'{country} + işlemler ANINDA', en:'{country} + INSTANT deals' },
  ag_k3_t:{ tr:'Global Pasaport', en:'Global Passport' },
  ag_k3_d:{ tr:'TÜM dünya + işlemler ANINDA', en:'WHOLE world + INSTANT deals' },
  cancel:      { tr:'İptal', en:'Cancel', es:'Cancelar', fr:'Annuler', de:'Abbrechen', it:'Annulla', pt:'Cancelar', ru:'Отмена', ar:'إلغاء', zh:'取消', ja:'キャンセル', ko:'취소', az:'Ləğv et', uk:'Скасувати', fa:'لغو', hi:'रد्द करें' },
  all:         { tr:'Tümü', en:'All', es:'Todos', fr:'Tout', de:'Alle', it:'Tutti', pt:'Todos', ru:'Все', ar:'الكل', zh:'全部', ja:'すべて', ko:'전체', az:'Hamısı', uk:'Усі', fa:'همه', hi:'सभी' },
  all_cities:  { tr:'Tüm Şehirler', en:'All Cities', es:'Todas las Ciudades', fr:'Toutes les Villes', de:'Alle Städte', it:'Tutte le Città', pt:'Todas as Cidades', ru:'Все города', ar:'كل المدن', zh:'所有城市', ja:'全都市', ko:'모든 도시', az:'Bütün Şəhərlər', uk:'Усі міста', fa:'همه شهرها', hi:'सभी शहर' },
  insufficient2:{ tr:'Yetersiz', en:'Low funds', es:'Sin fondos', fr:'Fonds bas', de:'Zu wenig', it:'Fondi bassi', pt:'Sem fundos', ru:'Мало средств', ar:'رصيد منخفض', zh:'余额不足', ja:'残高不足', ko:'잔액 부족', az:'Balans az', uk:'Мало коштів', fa:'موجودی کم', hi:'धन कम' },
  owned_have:  { tr:'Sahipsiniz', en:'Owned', es:'En propiedad', fr:'Possédé', de:'Im Besitz', it:'Posseduto', pt:'Possuído', ru:'В собственности', ar:'مملوك', zh:'已拥有', ja:'所有済み', ko:'보유중', az:'Sahibsiniz', uk:'У власності', fa:'مالک هستید', hi:'स्वामित्व' },
  no_props:    { tr:'Henüz mülk yok', en:'No properties yet', es:'Aún sin propiedades', fr:'Aucune propriété', de:'Noch keine Immobilien', it:'Ancora nessuna proprietà', pt:'Ainda sem imóveis', ru:'Пока нет объектов', ar:'لا عقارات بعد', zh:'暂无房产', ja:'物件なし', ko:'아직 부동산 없음', az:'Hələ əmlak yox', uk:'Ще немає об’єктів', fa:'هنوز ملکی نیست', hi:'अभी कोई संपत्ति नहीं' },
  collect_income:{ tr:'Geliri Topla', en:'Collect Income', es:'Cobrar Ingresos', fr:'Encaisser', de:'Einkommen Sammeln', it:'Riscuoti', pt:'Coletar Renda', ru:'Собрать доход', ar:'تحصيل الدخل', zh:'领取收入', ja:'収入を集める', ko:'수입 받기', az:'Gəliri Topla', uk:'Зібрати дохід', fa:'دریافت درآمد', hi:'आय लें' },
  most_popular:{ tr:'EN POPÜLER', en:'POPULAR', es:'POPULAR', fr:'POPULAIRE', de:'BELIEBT', it:'POPOLARE', pt:'POPULAR', ru:'ПОПУЛЯРНО', ar:'الأكثر شيوعاً', zh:'热门', ja:'人気', ko:'인기', az:'POPULYAR', uk:'ПОПУЛЯРНЕ', fa:'محبوب', hi:'लोकप्रिय' },
  store_closed:{ tr:'Mağaza geçici olarak kapalı', en:'Store temporarily closed', es:'Tienda cerrada temporalmente', fr:'Boutique fermée temporairement', de:'Shop vorübergehend geschlossen', it:'Negozio chiuso', pt:'Loja fechada', ru:'Магазин временно закрыт', ar:'المتجر مغلق مؤقتاً', zh:'商店暂时关闭', ja:'ストアは一時休止中', ko:'상점 임시 휴무', az:'Mağaza müvəqqəti bağlı', uk:'Магазин тимчасово закрито', fa:'فروشگاه موقتاً بسته است', hi:'स्टोर अस्थायी रूप से बंद' },
  your_rank:   { tr:'Sıralaman', en:'Your Rank', es:'Tu Posición', fr:'Ton Classement', de:'Dein Rang', it:'La Tua Posizione', pt:'Sua Posição', ru:'Ваш ранг', ar:'ترتيبك', zh:'你的排名', ja:'あなたの順位', ko:'내 순위', az:'Reytinqin', uk:'Ваш ранг', fa:'رتبه شما', hi:'आपकी रैंक' },
  players:     { tr:'oyuncu', en:'players', es:'jugadores', fr:'joueurs', de:'Spieler', it:'giocatori', pt:'jogadores', ru:'игроков', ar:'لاعب', zh:'名玩家', ja:'プレイヤー', ko:'명', az:'oyunçu', uk:'гравців', fa:'بازیکن', hi:'खिलाड़ी' },
  login_guest: { tr:'Misafir Olarak Oyna', en:'Play as Guest', es:'Jugar como Invitado', fr:'Jouer en Invité', de:'Als Gast Spielen', it:'Gioca come Ospite', pt:'Jogar como Convidado', ru:'Играть как гость', ar:'العب كضيف', zh:'以访客身份游玩', ja:'ゲストとしてプレイ', ko:'게스트로 플레이', az:'Qonaq kimi Oyna', uk:'Грати як гість', fa:'بازی به‌عنوان مهمان', hi:'अतिथि के रूप में खेलें' },
  login_google:{ tr:'Google ile Giriş', en:'Sign in with Google', es:'Entrar con Google', fr:'Connexion Google', de:'Mit Google anmelden', it:'Accedi con Google', pt:'Entrar com Google', ru:'Войти через Google', ar:'الدخول عبر Google', zh:'用 Google 登录', ja:'Googleでログイン', ko:'Google로 로그인', az:'Google ilə Giriş', uk:'Увійти через Google', fa:'ورود با Google', hi:'Google से साइन इन' },
  login_apple: { tr:'Apple ile Giriş', en:'Sign in with Apple', es:'Entrar con Apple', fr:'Connexion Apple', de:'Mit Apple anmelden', it:'Accedi con Apple', pt:'Entrar com Apple', ru:'Войти через Apple', ar:'الدخول عبر Apple', zh:'用 Apple 登录', ja:'Appleでログイン', ko:'Apple로 로그인', az:'Apple ilə Giriş', uk:'Увійти через Apple', fa:'ورود با Apple', hi:'Apple से साइन इन' },
  email:       { tr:'E-posta', en:'Email', es:'Correo', fr:'E-mail', de:'E-Mail', it:'E-mail', pt:'E-mail', ru:'Эл. почта', ar:'البريد', zh:'邮箱', ja:'メール', ko:'이메일', az:'E-poçt', uk:'Ел. пошта', fa:'ایمیل', hi:'ईमेल' },
  password:    { tr:'Şifre', en:'Password', es:'Contraseña', fr:'Mot de passe', de:'Passwort', it:'Password', pt:'Senha', ru:'Пароль', ar:'كلمة المرور', zh:'密码', ja:'パスワード', ko:'비밀번호', az:'Parol', uk:'Пароль', fa:'رمز عبور', hi:'पासवर्ड' },
  signin:      { tr:'Giriş Yap', en:'Sign In', es:'Entrar', fr:'Se Connecter', de:'Anmelden', it:'Accedi', pt:'Entrar', ru:'Войти', ar:'تسجيل الدخول', zh:'登录', ja:'ログイン', ko:'로그인', az:'Giriş', uk:'Увійти', fa:'ورود', hi:'साइन इन' },
  register:    { tr:'Kayıt Ol', en:'Register', es:'Registrarse', fr:'S’inscrire', de:'Registrieren', it:'Registrati', pt:'Registrar', ru:'Регистрация', ar:'تسجيل', zh:'注册', ja:'登録', ko:'가입', az:'Qeydiyyat', uk:'Реєстрація', fa:'ثبت‌نام', hi:'रजिस्टर' },
  net_worth:   { tr:'Net Değer', en:'Net Worth', es:'Patrimonio', fr:'Valeur Nette', de:'Nettowert', it:'Patrimonio', pt:'Património', ru:'Капитал', ar:'صافي الثروة', zh:'净资产', ja:'純資産', ko:'순자산', az:'Xalis Dəyər', uk:'Капітал', fa:'ارزش خالص', hi:'कुल संपत्ति' },
  rank_league: { tr:'Lig', en:'League', es:'Liga', fr:'Ligue', de:'Liga', it:'Lega', pt:'Liga', ru:'Лига', ar:'الدوري', zh:'联赛', ja:'リーグ', ko:'리그', az:'Liqa', uk:'Ліга', fa:'لیگ', hi:'लीग' },
  rank_world:  { tr:'Dünya', en:'World', es:'Mundo', fr:'Monde', de:'Welt', it:'Mondo', pt:'Mundo', ru:'Мир', ar:'العالم', zh:'世界', ja:'世界', ko:'세계', az:'Dünya', uk:'Світ', fa:'جهان', hi:'विश्व' },
  rank_countries:{ tr:'Ülkeler', en:'Countries', es:'Países', fr:'Pays', de:'Länder', it:'Paesi', pt:'Países', ru:'Страны', ar:'الدول', zh:'国家', ja:'国別', ko:'국가', az:'Ölkələr', uk:'Країни', fa:'کشورها', hi:'देश' },
  no_players:  { tr:'Henüz oyuncu yok — ilk sen ol!', en:'No players yet — be the first!', es:'Aún sin jugadores', fr:'Aucun joueur', de:'Noch keine Spieler', it:'Ancora nessun giocatore', pt:'Ainda sem jogadores', ru:'Пока нет игроков', ar:'لا لاعبين بعد', zh:'暂无玩家', ja:'まだプレイヤーがいません', ko:'아직 플레이어 없음', az:'Hələ oyunçu yox', uk:'Ще немає гравців', fa:'هنوز بازیکنی نیست', hi:'अभी कोई खिलाड़ी नहीं' },
  cloud_title: { tr:'OTOMATİK BULUT YEDEK', en:'AUTO CLOUD BACKUP', es:'COPIA EN LA NUBE', fr:'SAUVEGARDE CLOUD', de:'CLOUD-BACKUP', it:'BACKUP CLOUD', pt:'BACKUP NA NUVEM', ru:'ОБЛАЧНАЯ КОПИЯ', ar:'نسخ سحابي تلقائي', zh:'自动云备份', ja:'自動クラウドバックアップ', ko:'자동 클라우드 백업', az:'AVTOMATİK BULUD YEDƏK', uk:'ХМАРНА КОПІЯ', fa:'پشتیبان ابری خودکار', hi:'ऑटो क्लाउड बैकअप' },
  cloud_desc:  { tr:'İlerlemen otomatik kaydedilir ve iCloud yedeğine dahildir. Giriş veya kod gerekmez.', en:'Your progress is auto-saved and included in your iCloud backup. No login or code needed.', es:'Tu progreso se guarda automáticamente y se incluye en tu copia de iCloud. Sin inicio de sesión.', fr:'Ta progression est sauvegardée automatiquement et incluse dans ta sauvegarde iCloud. Sans connexion.', de:'Dein Fortschritt wird automatisch gespeichert und in dein iCloud-Backup aufgenommen. Kein Login nötig.', it:'I tuoi progressi vengono salvati automaticamente e inclusi nel backup iCloud. Nessun login.', pt:'Seu progresso é salvo automaticamente e incluído no backup do iCloud. Sem login.', ru:'Прогресс сохраняется автоматически и входит в резервную копию iCloud. Без входа.', ar:'يُحفظ تقدمك تلقائياً ويُدرج في نسخة iCloud الاحتياطية. بدون تسجيل دخول.', zh:'进度自动保存并包含在 iCloud 备份中。无需登录。', ja:'進行状況は自動保存され、iCloudバックアップに含まれます。ログイン不要。', ko:'진행 상황이 자동 저장되며 iCloud 백업에 포함됩니다. 로그인 불필요.', az:'İrəliləyişin avtomatik saxlanır və iCloud yedəyinə daxildir. Giriş lazım deyil.', uk:'Прогрес зберігається автоматично та входить у резервну копію iCloud. Без входу.', fa:'پیشرفت شما خودکار ذخیره و در پشتیبان iCloud گنجانده می‌شود. بدون ورود.', hi:'आपकी प्रगति अपने-आप सेव होकर iCloud बैकअप में शामिल होती है। लॉगिन नहीं चाहिए।' },
  cloud_code:  { tr:'Yedek Kodun', en:'Your Backup Code', es:'Tu Código', fr:'Ton Code', de:'Dein Code', it:'Il Tuo Codice', pt:'Seu Código', ru:'Ваш код', ar:'رمزك', zh:'你的代码', ja:'あなたのコード', ko:'내 코드', az:'Yedək Kodun', uk:'Ваш код', fa:'کد شما', hi:'आपका कोड' },
  cloud_restore:{ tr:'Koddan Geri Yükle', en:'Restore from Code', es:'Restaurar con Código', fr:'Restaurer', de:'Wiederherstellen', it:'Ripristina', pt:'Restaurar', ru:'Восстановить', ar:'استعادة بالرمز', zh:'用代码恢复', ja:'コードで復元', ko:'코드로 복원', az:'Koddan Bərpa', uk:'Відновити', fa:'بازیابی با کد', hi:'कोड से पुनर्स्थापित' },
  copied:      { tr:'Kopyalandı', en:'Copied', es:'Copiado', fr:'Copié', de:'Kopiert', it:'Copiato', pt:'Copiado', ru:'Скопировано', ar:'تم النسخ', zh:'已复制', ja:'コピー済み', ko:'복사됨', az:'Kopyalandı', uk:'Скопійовано', fa:'کپی شد', hi:'कॉपी किया' },
  processing:  { tr:'İşlemde', en:'Processing', es:'En proceso', fr:'En cours', de:'In Bearbeitung', it:'In corso', pt:'Processando', ru:'В процессе', ar:'قيد المعالجة', zh:'处理中', ja:'処理中', ko:'처리 중', az:'İşlənir', uk:'В процесі', fa:'در حال انجام', hi:'प्रक्रिया में' },
  daily_title: { tr:'Günlük Bedava Ödül', en:'Daily Free Reward', es:'Recompensa Diaria Gratis', fr:'Récompense Quotidienne', de:'Tägliche Gratis-Belohnung', it:'Ricompensa Giornaliera', pt:'Recompensa Diária Grátis', ru:'Ежедневная награда', ar:'مكافأة يومية مجانية', zh:'每日免费奖励', ja:'毎日の無料報酬', ko:'일일 무료 보상', az:'Günlük Pulsuz Mükafat', uk:'Щоденна винагорода', fa:'پاداش روزانه رایگان', hi:'दैनिक मुफ़्त इनाम' },
  daily_claim: { tr:'Topla', en:'Claim', es:'Reclamar', fr:'Récupérer', de:'Abholen', it:'Riscuoti', pt:'Resgatar', ru:'Забрать', ar:'استلام', zh:'领取', ja:'受け取る', ko:'받기', az:'Topla', uk:'Забрати', fa:'دریافت', hi:'लें' },
  daily_day:   { tr:'Gün', en:'Day', es:'Día', fr:'Jour', de:'Tag', it:'Giorno', pt:'Dia', ru:'День', ar:'يوم', zh:'第', ja:'日目', ko:'일차', az:'Gün', uk:'День', fa:'روز', hi:'दिन' },
  daily_done:  { tr:'Bugün alındı — yarın tekrar gel', en:'Claimed today — come back tomorrow', es:'Reclamado hoy', fr:'Récupéré aujourd’hui', de:'Heute abgeholt', it:'Riscosso oggi', pt:'Resgatado hoje', ru:'Получено сегодня', ar:'تم الاستلام اليوم', zh:'今日已领取', ja:'本日受取済み', ko:'오늘 받음', az:'Bu gün alındı', uk:'Отримано сьогодні', fa:'امروز دریافت شد', hi:'आज लिया गया' },
  daily_jackpot:{ tr:'🎉 7. GÜN BONUSU!', en:'🎉 DAY 7 BONUS!', es:'🎉 ¡BONO DÍA 7!', fr:'🎉 BONUS JOUR 7 !', de:'🎉 TAG-7-BONUS!', it:'🎉 BONUS GIORNO 7!', pt:'🎉 BÔNUS DIA 7!', ru:'🎉 БОНУС 7-ГО ДНЯ!', ar:'🎉 مكافأة اليوم السابع!', zh:'🎉 第7天奖励！', ja:'🎉 7日目ボーナス！', ko:'🎉 7일차 보너스!', az:'🎉 7-Cİ GÜN BONUSU!', uk:'🎉 БОНУС 7-ГО ДНЯ!', fa:'🎉 جایزه روز هفتم!', hi:'🎉 दिन 7 बोनस!' },
  promos_title:{ tr:'PROMOSYONLAR', en:'PROMOTIONS', es:'PROMOCIONES', fr:'PROMOTIONS', de:'AKTIONEN', it:'PROMOZIONI', pt:'PROMOÇÕES', ru:'АКЦИИ', ar:'العروض', zh:'促销', ja:'プロモーション', ko:'프로모션', az:'PROMOSYONLAR', uk:'АКЦІЇ', fa:'تخفیف‌ها', hi:'प्रोमोशन' },
  rw_welcome:  { tr:'Hoş Geldin Hediyesi', en:'Welcome Gift', es:'Regalo de Bienvenida', fr:'Cadeau de Bienvenue', de:'Willkommensgeschenk', it:'Regalo di Benvenuto', pt:'Presente de Boas-vindas', ru:'Подарок новичку', ar:'هدية ترحيبية', zh:'欢迎礼包', ja:'ウェルカムギフト', ko:'환영 선물', az:'Xoş Gəldin Hədiyyəsi', uk:'Вітальний подарунок', fa:'هدیه خوش‌آمد', hi:'स्वागत उपहार' },
  rw_weekly:   { tr:'Haftalık Ödül', en:'Weekly Reward', es:'Recompensa Semanal', fr:'Récompense Hebdo', de:'Wöchentliche Belohnung', it:'Ricompensa Settimanale', pt:'Recompensa Semanal', ru:'Еженедельная награда', ar:'مكافأة أسبوعية', zh:'每周奖励', ja:'週間報酬', ko:'주간 보상', az:'Həftəlik Mükafat', uk:'Щотижнева винагорода', fa:'پاداش هفتگی', hi:'साप्ताहिक इनाम' },
  rw_monthly:  { tr:'Aylık Ödül', en:'Monthly Reward', es:'Recompensa Mensual', fr:'Récompense Mensuelle', de:'Monatliche Belohnung', it:'Ricompensa Mensile', pt:'Recompensa Mensal', ru:'Ежемесячная награда', ar:'مكافأة شهرية', zh:'每月奖励', ja:'月間報酬', ko:'월간 보상', az:'Aylıq Mükafat', uk:'Щомісячна винагорода', fa:'پاداش ماهانه', hi:'मासिक इनाम' },
  rw_soon:     { tr:'sonra', en:'left', es:'restante', fr:'restant', de:'übrig', it:'rimasto', pt:'restante', ru:'осталось', ar:'متبقٍ', zh:'后', ja:'後', ko:'후', az:'sonra', uk:'залишилось', fa:'مانده', hi:'शेष' },
  offer:       { tr:'Teklif', en:'Offer', es:'Oferta', fr:'Offre', de:'Angebot', it:'Offerta', pt:'Oferta', ru:'Предложить', ar:'عرض', zh:'出价', ja:'オファー', ko:'제안', az:'Təklif', uk:'Пропозиція', fa:'پیشنهاد', hi:'ऑफ़र' },
  offers_title:{ tr:'GELEN TEKLİFLER', en:'INCOMING OFFERS', es:'OFERTAS RECIBIDAS', fr:'OFFRES REÇUES', de:'EINGEHENDE ANGEBOTE', it:'OFFERTE RICEVUTE', pt:'OFERTAS RECEBIDAS', ru:'ВХОДЯЩИЕ ПРЕДЛОЖЕНИЯ', ar:'العروض الواردة', zh:'收到的出价', ja:'受信オファー', ko:'받은 제안', az:'GƏLƏN TƏKLİFLƏR', uk:'ВХІДНІ ПРОПОЗИЦІЇ', fa:'پیشنهادهای دریافتی', hi:'प्राप्त ऑफ़र' },
  accept:      { tr:'Kabul', en:'Accept', es:'Aceptar', fr:'Accepter', de:'Annehmen', it:'Accetta', pt:'Aceitar', ru:'Принять', ar:'قبول', zh:'接受', ja:'承認', ko:'수락', az:'Qəbul', uk:'Прийняти', fa:'پذیرفتن', hi:'स्वीकार' },
  reject:      { tr:'Reddet', en:'Reject', es:'Rechazar', fr:'Refuser', de:'Ablehnen', it:'Rifiuta', pt:'Recusar', ru:'Отклонить', ar:'رفض', zh:'拒绝', ja:'拒否', ko:'거절', az:'Rədd et', uk:'Відхилити', fa:'رد', hi:'अस्वीकार' },
  offer_amount:{ tr:'Teklif tutarı ($):', en:'Offer amount ($):', es:'Importe ($):', fr:'Montant ($) :', de:'Betrag ($):', it:'Importo ($):', pt:'Valor ($):', ru:'Сумма ($):', ar:'المبلغ ($):', zh:'出价金额 ($):', ja:'金額 ($):', ko:'금액 ($):', az:'Məbləğ ($):', uk:'Сума ($):', fa:'مبلغ ($):', hi:'राशि ($):' },
  auction:     { tr:'Açık Artırma', en:'Auction', es:'Subasta', fr:'Enchère', de:'Auktion', it:'Asta', pt:'Leilão', ru:'Аукцион', ar:'مزاد', zh:'拍卖', ja:'オークション', ko:'경매', az:'Hərrac', uk:'Аукціон', fa:'مزایده', hi:'नीलामी' },
  auctions_title:{ tr:'AÇIK ARTIRMALAR', en:'AUCTIONS', es:'SUBASTAS', fr:'ENCHÈRES', de:'AUKTIONEN', it:'ASTE', pt:'LEILÕES', ru:'АУКЦИОНЫ', ar:'المزادات', zh:'拍卖会', ja:'オークション', ko:'경매', az:'HƏRRACLAR', uk:'АУКЦІОНИ', fa:'مزایده‌ها', hi:'नीलामी' },
  bid:         { tr:'Artır', en:'Bid', es:'Pujar', fr:'Enchérir', de:'Bieten', it:'Offri', pt:'Dar Lance', ru:'Ставка', ar:'مزايدة', zh:'出价', ja:'入札', ko:'입찰', az:'Artır', uk:'Ставка', fa:'پیشنهاد', hi:'बोली' },
  auction_start:{ tr:'Başlangıç fiyatı ($):', en:'Starting price ($):', es:'Precio inicial ($):', fr:'Prix de départ ($) :', de:'Startpreis ($):', it:'Prezzo iniziale ($):', pt:'Preço inicial ($):', ru:'Стартовая цена ($):', ar:'السعر الابتدائي ($):', zh:'起拍价 ($):', ja:'開始価格 ($):', ko:'시작가 ($):', az:'Başlanğıc qiymət ($):', uk:'Стартова ціна ($):', fa:'قیمت شروع ($):', hi:'शुरुआती मूल्य ($):' },
}

export function t(key: string): string {
  return S[_lang]?.[key] ?? EXTRA[key]?.[_lang] ?? EXTRA[key]?.en ?? S.en[key] ?? key
}

// Mülk kategorisi → oyuncunun dilinde etiket (cat_* anahtarı varsa onu kullan)
export function catLabel(category: string): string {
  const k = 'cat_' + category
  return EXTRA[k]?.[_lang] ?? EXTRA[k]?.en ?? category
}

// Mapbox geocoding için dil kodu (bazı diller özel kod ister)
export function geoLang(): string {
  const m: Record<string, string> = { zh: 'zh-Hans' }
  return m[_lang] ?? _lang
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
