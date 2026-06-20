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
  cancel:      { tr:'İptal', en:'Cancel', es:'Cancelar', fr:'Annuler', de:'Abbrechen', it:'Annulla', pt:'Cancelar', ru:'Отмена', ar:'إلغاء', zh:'取消', ja:'キャンセル', ko:'취소', az:'Ləğv et', uk:'Скасувати', fa:'لغو', hi:'रद्द करें' },
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
}

export function t(key: string): string {
  return S[_lang]?.[key] ?? EXTRA[key]?.[_lang] ?? EXTRA[key]?.en ?? S.en[key] ?? key
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
