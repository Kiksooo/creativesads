export type Locale = 'ru' | 'en' | 'es';

export const locales: Locale[] = ['ru', 'en', 'es'];

export type TranslationKey = 
  | 'nav.home'
  | 'nav.register'
  | 'nav.dashboard'
  | 'nav.library'
  | 'nav.upload'
  | 'nav.collections'
  | 'nav.settings'
  | 'common.search'
  | 'common.upload'
  | 'auth.pleaseRegister'
  | 'auth.sessionExpired'
  | 'auth.registerNow'
  | 'common.email'
  | 'common.code'
  | 'common.sendCode'
  | 'common.verify'
  | 'common.back'
  | 'common.openApp'
  | 'home.hero.title'
  | 'home.hero.subtitle'
  | 'home.card.upload.title'
  | 'home.card.upload.description'
  | 'home.card.analyze.title'
  | 'home.card.analyze.description'
  | 'home.card.export.title'
  | 'home.card.export.description'
  | 'register.title'
  | 'register.step1.title'
  | 'register.step1.description'
  | 'register.step2.title'
  | 'register.step2.description'
  | 'register.step2.resend'
  | 'register.error.network'
  | 'register.error.invalidEmail'
  | 'register.error.invalidCode'
  | 'register.error.server'
  | 'register.error.unknown'
  | 'register.success.codeSent'
  | 'register.success.verified'
  | 'register.loading'
  | 'dashboard.title'
  | 'dashboard.description'
  | 'home.cta.signup'
  | 'home.cta.tryDemo'
  | 'creative.status.queued'
  | 'creative.status.processing'
  | 'creative.status.done'
  | 'creative.status.failed'
  | 'creative.analysis.score'
  | 'creative.analysis.hookScore'
  | 'creative.analysis.clarityScore'
  | 'creative.analysis.complianceRisk'
  | 'creative.analysis.strengths'
  | 'creative.analysis.issues'
  | 'creative.analysis.fixes'
  | 'creative.analysis.hooks'
  | 'creative.analysis.ctas'
  | 'creative.analysis.script15s'
  | 'creative.analysis.summary'
  | 'settings.title'
  | 'settings.profile'
  | 'settings.account'
  | 'settings.limits'
  | 'upload.goal'
  | 'upload.country'
  | 'common.loading'
  | 'common.error'
  | 'common.retry'
  | 'common.back';

const translations: Record<Locale, Record<TranslationKey, string>> = {
  ru: {
    'nav.home': 'Главная',
    'nav.register': 'Регистрация',
    'nav.dashboard': 'Панель управления',
    'nav.library': 'Библиотека',
    'nav.upload': 'Загрузить',
    'nav.collections': 'Коллекции',
    'nav.settings': 'Настройки',
    'common.search': 'Поиск',
    'common.upload': 'Загрузить',
    'auth.pleaseRegister': 'Пожалуйста, зарегистрируйтесь',
    'auth.sessionExpired': 'Сессия истекла',
    'auth.registerNow': 'Зарегистрироваться',
    'common.email': 'Email',
    'common.code': 'Код',
    'common.sendCode': 'Отправить код',
    'common.verify': 'Подтвердить',
    'common.back': 'Назад',
    'common.openApp': 'Открыть приложение',
    'home.hero.title': 'Добро пожаловать',
    'home.hero.subtitle': 'Современное решение для ваших задач',
    'home.card.upload.title': 'Загрузить',
    'home.card.upload.description': 'Загружайте файлы быстро и безопасно',
    'home.card.analyze.title': 'Анализировать',
    'home.card.analyze.description': 'Получайте глубокую аналитику данных',
    'home.card.export.title': 'Экспорт',
    'home.card.export.description': 'Экспортируйте результаты в любом формате',
    'register.title': 'Регистрация',
    'register.step1.title': 'Введите email',
    'register.step1.description': 'Мы отправим код подтверждения на ваш email',
    'register.step2.title': 'Введите код',
    'register.step2.description': 'Проверьте почту и введите код подтверждения',
    'register.step2.resend': 'Отправить код повторно',
    'register.error.network': 'Ошибка сети. Проверьте подключение и попробуйте снова.',
    'register.error.invalidEmail': 'Неверный email адрес',
    'register.error.invalidCode': 'Неверный код подтверждения',
    'register.error.server': 'Ошибка сервера. Попробуйте позже.',
    'register.error.unknown': 'Произошла ошибка. Попробуйте снова.',
    'register.success.codeSent': 'Код отправлен на ваш email',
    'register.success.verified': 'Регистрация успешна!',
    'register.loading': 'Загрузка...',
    'dashboard.title': 'Панель управления',
    'dashboard.description': 'Панель управления работает',
    'home.cta.signup': 'Регистрация',
    'home.cta.tryDemo': 'Попробовать демо',
    'creative.status.queued': 'В очереди',
    'creative.status.processing': 'Обработка',
    'creative.status.done': 'Готово',
    'creative.status.failed': 'Ошибка',
    'creative.analysis.score': 'Общий счёт',
    'creative.analysis.hookScore': 'Счёт хука',
    'creative.analysis.clarityScore': 'Счёт ясности',
    'creative.analysis.complianceRisk': 'Риск соответствия',
    'creative.analysis.strengths': 'Сильные стороны',
    'creative.analysis.issues': 'Проблемы',
    'creative.analysis.fixes': 'Исправления',
    'creative.analysis.hooks': 'Хуки',
    'creative.analysis.ctas': 'Призывы к действию',
    'creative.analysis.script15s': 'Скрипт 15 сек',
    'creative.analysis.summary': 'Резюме',
    'settings.title': 'Настройки',
    'settings.profile': 'Профиль',
    'settings.account': 'Аккаунт',
    'settings.limits': 'Лимиты',
    'upload.goal': 'Цель',
    'upload.country': 'Страна',
    'common.loading': 'Загрузка...',
    'common.error': 'Ошибка',
    'common.retry': 'Повторить',
    'common.back': 'Назад',
  },
  en: {
    'nav.home': 'Home',
    'nav.register': 'Register',
    'nav.dashboard': 'Dashboard',
    'nav.library': 'Library',
    'nav.upload': 'Upload',
    'nav.collections': 'Collections',
    'nav.settings': 'Settings',
    'common.search': 'Search',
    'common.upload': 'Upload',
    'auth.pleaseRegister': 'Please register',
    'auth.sessionExpired': 'Session expired',
    'auth.registerNow': 'Register now',
    'common.email': 'Email',
    'common.code': 'Code',
    'common.sendCode': 'Send Code',
    'common.verify': 'Verify',
    'common.back': 'Back',
    'common.openApp': 'Open App',
    'home.hero.title': 'Welcome',
    'home.hero.subtitle': 'Modern solution for your needs',
    'home.card.upload.title': 'Upload',
    'home.card.upload.description': 'Upload files quickly and securely',
    'home.card.analyze.title': 'Analyze',
    'home.card.analyze.description': 'Get deep insights from your data',
    'home.card.export.title': 'Export',
    'home.card.export.description': 'Export results in any format',
    'register.title': 'Register',
    'register.step1.title': 'Enter your email',
    'register.step1.description': 'We will send a verification code to your email',
    'register.step2.title': 'Enter code',
    'register.step2.description': 'Check your email and enter the verification code',
    'register.step2.resend': 'Resend code',
    'register.error.network': 'Network error. Please check your connection and try again.',
    'register.error.invalidEmail': 'Invalid email address',
    'register.error.invalidCode': 'Invalid verification code',
    'register.error.server': 'Server error. Please try again later.',
    'register.error.unknown': 'An error occurred. Please try again.',
    'register.success.codeSent': 'Code sent to your email',
    'register.success.verified': 'Registration successful!',
    'register.loading': 'Loading...',
    'dashboard.title': 'Dashboard',
    'dashboard.description': 'Dashboard is working',
    'home.cta.signup': 'Sign Up',
    'home.cta.tryDemo': 'Try Demo',
    'creative.status.queued': 'Queued',
    'creative.status.processing': 'Processing',
    'creative.status.done': 'Done',
    'creative.status.failed': 'Failed',
    'creative.analysis.score': 'Overall Score',
    'creative.analysis.hookScore': 'Hook Score',
    'creative.analysis.clarityScore': 'Clarity Score',
    'creative.analysis.complianceRisk': 'Compliance Risk',
    'creative.analysis.strengths': 'Strengths',
    'creative.analysis.issues': 'Issues',
    'creative.analysis.fixes': 'Fixes',
    'creative.analysis.hooks': 'Hooks',
    'creative.analysis.ctas': 'CTAs',
    'creative.analysis.script15s': '15s Script',
    'creative.analysis.summary': 'Summary',
    'settings.title': 'Settings',
    'settings.profile': 'Profile',
    'settings.account': 'Account',
    'settings.limits': 'Limits',
    'upload.goal': 'Goal',
    'upload.country': 'Country',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.retry': 'Retry',
    'common.back': 'Back',
  },
  es: {
    'nav.home': 'Inicio',
    'nav.register': 'Registrarse',
    'nav.dashboard': 'Panel',
    'nav.library': 'Biblioteca',
    'nav.upload': 'Subir',
    'nav.collections': 'Colecciones',
    'nav.settings': 'Configuración',
    'common.search': 'Buscar',
    'common.upload': 'Subir',
    'auth.pleaseRegister': 'Por favor regístrese',
    'auth.sessionExpired': 'Sesión expirada',
    'auth.registerNow': 'Registrarse ahora',
    'common.email': 'Correo',
    'common.code': 'Código',
    'common.sendCode': 'Enviar código',
    'common.verify': 'Verificar',
    'common.back': 'Atrás',
    'common.openApp': 'Abrir aplicación',
    'home.hero.title': 'Bienvenido',
    'home.hero.subtitle': 'Solución moderna para tus necesidades',
    'home.card.upload.title': 'Subir',
    'home.card.upload.description': 'Sube archivos de forma rápida y segura',
    'home.card.analyze.title': 'Analizar',
    'home.card.analyze.description': 'Obtén información detallada de tus datos',
    'home.card.export.title': 'Exportar',
    'home.card.export.description': 'Exporta resultados en cualquier formato',
    'register.title': 'Registrarse',
    'register.step1.title': 'Ingresa tu correo',
    'register.step1.description': 'Enviaremos un código de verificación a tu correo',
    'register.step2.title': 'Ingresa el código',
    'register.step2.description': 'Revisa tu correo e ingresa el código de verificación',
    'register.step2.resend': 'Reenviar código',
    'register.error.network': 'Error de red. Verifique su conexión e intente nuevamente.',
    'register.error.invalidEmail': 'Dirección de correo inválida',
    'register.error.invalidCode': 'Código de verificación inválido',
    'register.error.server': 'Error del servidor. Por favor intente más tarde.',
    'register.error.unknown': 'Ocurrió un error. Por favor intente nuevamente.',
    'register.success.codeSent': 'Código enviado a su correo',
    'register.success.verified': '¡Registro exitoso!',
    'register.loading': 'Cargando...',
    'dashboard.title': 'Panel',
    'dashboard.description': 'El panel está funcionando',
    'home.cta.signup': 'Registrarse',
    'home.cta.tryDemo': 'Probar Demo',
    'creative.status.queued': 'En cola',
    'creative.status.processing': 'Procesando',
    'creative.status.done': 'Completado',
    'creative.status.failed': 'Fallido',
    'creative.analysis.score': 'Puntuación General',
    'creative.analysis.hookScore': 'Puntuación Hook',
    'creative.analysis.clarityScore': 'Puntuación Claridad',
    'creative.analysis.complianceRisk': 'Riesgo de Cumplimiento',
    'creative.analysis.strengths': 'Fortalezas',
    'creative.analysis.issues': 'Problemas',
    'creative.analysis.fixes': 'Correcciones',
    'creative.analysis.hooks': 'Hooks',
    'creative.analysis.ctas': 'CTAs',
    'creative.analysis.script15s': 'Script 15s',
    'creative.analysis.summary': 'Resumen',
    'settings.title': 'Configuración',
    'settings.profile': 'Perfil',
    'settings.account': 'Cuenta',
    'settings.limits': 'Límites',
    'upload.goal': 'Objetivo',
    'upload.country': 'País',
    'common.loading': 'Cargando...',
    'common.error': 'Error',
    'common.retry': 'Reintentar',
    'common.back': 'Atrás',
  },
};

export function t(locale: Locale, key: TranslationKey): string {
  return translations[locale]?.[key] || key;
}

export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}

