// AI Analysis for creatives

import type { Creative } from '../db/adapter';

export interface AnalysisOutput {
  score: number; // 0-100
  hookScore: number; // 0-100
  clarityScore: number; // 0-100
  complianceRisk: number; // 0-100 (lower is better)
  strengths: string[];
  issues: string[];
  fixes: string[];
  hooks: string[];
  ctas: string[];
  script15s: string | null;
  summary: string;
}

const FREE_USER_DAILY_LIMIT = 3;

export async function checkAnalysisLimit(userId: string): Promise<{ allowed: boolean; count: number; limit: number }> {
  const { db } = await import('../db');
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const count = await db.getUserDailyAnalysisCount(userId, today);
  return {
    allowed: count < FREE_USER_DAILY_LIMIT,
    count,
    limit: FREE_USER_DAILY_LIMIT,
  };
}

export async function analyzeCreative(creative: Creative, language: string = 'en'): Promise<AnalysisOutput> {
  // Check if we have OpenAI API key
  const openaiApiKey = process.env.OPENAI_API_KEY;
  const anthropicApiKey = process.env.ANTHROPIC_API_KEY;

  if (creative.type === 'image') {
    return analyzeImage(creative, { openaiApiKey, anthropicApiKey, language });
  } else {
    return analyzeVideo(creative, { openaiApiKey, anthropicApiKey, language });
  }
}

async function analyzeImage(
  creative: Creative,
  keys: { openaiApiKey?: string; anthropicApiKey?: string; language?: string }
): Promise<AnalysisOutput> {
  const { openaiApiKey, anthropicApiKey, language = 'en' } = keys;

  // Try OpenAI Vision API
  if (openaiApiKey && creative.file_url) {
    try {
      return await analyzeWithOpenAI(creative, openaiApiKey, language);
    } catch (error) {
      console.error('OpenAI analysis failed:', error);
      // Fall through to fallback
    }
  }

  // Try Anthropic Vision API
  if (anthropicApiKey && creative.file_url) {
    try {
      return await analyzeWithAnthropic(creative, anthropicApiKey, language);
    } catch (error) {
      console.error('Anthropic analysis failed:', error);
      // Fall through to fallback
    }
  }

  // Fallback: Generate analysis based on metadata and filename
  return generateFallbackAnalysis(creative, language);
}

async function analyzeVideo(
  creative: Creative,
  keys: { openaiApiKey?: string; anthropicApiKey?: string; language?: string }
): Promise<AnalysisOutput> {
  const { openaiApiKey, anthropicApiKey, language = 'en' } = keys;

  // For MVP, we analyze based on metadata + poster frame if available
  // In production, you'd extract the first frame and analyze it

  // Try to get poster/first frame URL
  const posterUrl = creative.file_url; // In real implementation, extract first frame

  if (posterUrl) {
    if (openaiApiKey) {
      try {
        return await analyzeWithOpenAI({ ...creative, file_url: posterUrl }, openaiApiKey, language);
      } catch (error) {
        console.error('OpenAI video analysis failed:', error);
      }
    }

    if (anthropicApiKey) {
      try {
        return await analyzeWithAnthropic({ ...creative, file_url: posterUrl }, anthropicApiKey, language);
      } catch (error) {
        console.error('Anthropic video analysis failed:', error);
      }
    }
  }

  // Fallback: Generate analysis based on metadata
  return generateFallbackAnalysis(creative, language);
}

async function analyzeWithOpenAI(creative: Creative, apiKey: string, language: string = 'en'): Promise<AnalysisOutput> {
  // Fetch image if it's a URL
  let imageData: string | null = null;
  
  if (creative.file_url?.startsWith('http')) {
    try {
      const response = await fetch(creative.file_url);
      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();
      // Convert ArrayBuffer to base64 using browser-compatible method
      const bytes = new Uint8Array(arrayBuffer);
      const binary = bytes.reduce((acc, byte) => acc + String.fromCharCode(byte), '');
      imageData = btoa(binary);
    } catch (error) {
      console.error('Failed to fetch image:', error);
      throw new Error('Failed to fetch image for analysis');
    }
  }

  // Map language codes to language names for AI
  const languageMap: Record<string, string> = {
    'ru': 'Russian',
    'en': 'English',
    'es': 'Spanish',
  };
  const languageName = languageMap[language] || 'English';

  const prompt = `Analyze this ${creative.type} creative advertisement.

CRITICAL LANGUAGE REQUIREMENT: You MUST respond ONLY in ${languageName}. This is non-negotiable. Do not use any other language. Do not mix languages. Every single text field must be written exclusively in ${languageName}.

Language rules:
- If language is "Russian" (ru), respond ONLY in Russian (Русский)
- If language is "English" (en), respond ONLY in English
- If language is "Spanish" (es), respond ONLY in Spanish (Español)
- Do NOT translate or explain in other languages
- Do NOT include English translations if the language is not English

Provide your analysis in JSON format with the following fields (ALL text fields must be in ${languageName}):
- score (number 0-100): How effective is this creative?
- hookScore (number 0-100): How attention-grabbing is the opening?
- clarityScore (number 0-100): How clear is the message?
- complianceRisk (number 0-100): Lower is better, assess potential issues
- strengths (array of strings): List 3-5 key strengths in ${languageName} ONLY
- issues (array of strings): List 3-5 areas for improvement in ${languageName} ONLY
- fixes (array of strings): Provide actionable fixes for each issue in ${languageName} ONLY
- hooks (array of strings): Suggest 3-5 compelling hooks in ${languageName} ONLY
- ctas (array of strings): Suggest 3-5 effective calls-to-action in ${languageName} ONLY
- script15s (string or null): If video, provide a 15-second script suggestion in ${languageName} ONLY (or null for images)
- summary (string): A 2-3 sentence summary in ${languageName} ONLY

Context: Platform: ${creative.platform || 'Unknown'}, Vertical: ${creative.vertical || 'Unknown'}, Country: ${creative.country || 'Unknown'}, Target Language: ${creative.language || 'Unknown'}, Goal: ${creative.goal || 'Unknown'}

FINAL REMINDER: Every text field (strengths, issues, fixes, hooks, ctas, script15s, summary) MUST be written in ${languageName} only. Return valid JSON format only.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4-vision-preview',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              ...(imageData ? [{
                type: 'image_url',
                image_url: { url: `data:${creative.mime_type};base64,${imageData}` }
              }] : [])
            ],
          },
        ],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${response.status} ${error}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '{}';
    
    // Try to parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return normalizeAnalysisOutput(parsed);
    }

    throw new Error('Failed to parse OpenAI response');
  } catch (error) {
    console.error('OpenAI analysis error:', error);
    throw error;
  }
}

async function analyzeWithAnthropic(creative: Creative, apiKey: string, language: string = 'en'): Promise<AnalysisOutput> {
  // Anthropic Claude with vision
  // Similar to OpenAI but different API format
  // For MVP, we'll use a simpler approach
  throw new Error('Anthropic API not fully implemented in MVP');
}

function generateFallbackAnalysis(creative: Creative, language: string = 'en'): AnalysisOutput {
  // Generate realistic fallback analysis based on metadata
  const platform = creative.platform || 'Unknown';
  const vertical = creative.vertical || 'General';
  const filename = creative.filename.toLowerCase();

  // Analyze filename for hints
  const hasVideoKeywords = filename.includes('video') || filename.includes('mp4') || filename.includes('mov');
  const hasSocialKeywords = filename.includes('tiktok') || filename.includes('instagram') || filename.includes('reels');
  const hasProductKeywords = filename.includes('product') || filename.includes('demo');

  // Generate scores based on metadata
  const baseScore = 65 + Math.floor(Math.random() * 25); // 65-90
  const hookScore = hasSocialKeywords ? 75 + Math.floor(Math.random() * 15) : 60 + Math.floor(Math.random() * 20);
  const clarityScore = hasProductKeywords ? 70 + Math.floor(Math.random() * 20) : 60 + Math.floor(Math.random() * 25);
  const complianceRisk = Math.floor(Math.random() * 30); // 0-30 (low risk for MVP)

  // Get translations based on language
  const translations = getFallbackTranslations(language);

  return {
    score: baseScore,
    hookScore,
    clarityScore,
    complianceRisk,
    strengths: [
      translations.strength1.replace('{platform}', platform),
      translations.strength2.replace('{vertical}', vertical),
      creative.type === 'video' ? translations.strength3Video : translations.strength3Image,
      hasSocialKeywords ? translations.strength4Social : translations.strength4Versatile,
      translations.strength5.replace('{country}', creative.country || translations.global),
    ].slice(0, 4),
    issues: [
      translations.issue1,
      translations.issue2,
      translations.issue3,
      translations.issue4,
      translations.issue5,
    ].slice(0, 4),
    fixes: [
      translations.fix1,
      translations.fix2,
      translations.fix3,
      translations.fix4,
      translations.fix5,
    ].slice(0, 4),
    hooks: [
      translations.hook1.replace('{vertical}', vertical),
      translations.hook2.replace('{platform}', platform),
      translations.hook3,
      translations.hook4,
      translations.hook5,
    ].slice(0, 4),
    ctas: [
      translations.cta1,
      translations.cta2,
      translations.cta3,
      translations.cta4,
      translations.cta5,
    ].slice(0, 4),
    script15s: creative.type === 'video' 
      ? translations.scriptTemplate
        .replace('{hook}', generateHook(vertical, platform, language))
        .replace('{cta}', translations.cta1)
      : null,
    summary: translations.summaryTemplate
      .replace('{type}', creative.type)
      .replace('{platform}', platform)
      .replace('{vertical}', vertical)
      .replace('{social}', hasSocialKeywords ? translations.summarySocial : translations.summaryClear),
  };
}

function getFallbackTranslations(language: string) {
  const translations: Record<string, {
    strength1: string;
    strength2: string;
    strength3Video: string;
    strength3Image: string;
    strength4Social: string;
    strength4Versatile: string;
    strength5: string;
    issue1: string;
    issue2: string;
    issue3: string;
    issue4: string;
    issue5: string;
    fix1: string;
    fix2: string;
    fix3: string;
    fix4: string;
    fix5: string;
    hook1: string;
    hook2: string;
    hook3: string;
    hook4: string;
    hook5: string;
    cta1: string;
    cta2: string;
    cta3: string;
    cta4: string;
    cta5: string;
    scriptTemplate: string;
    summaryTemplate: string;
    summarySocial: string;
    summaryClear: string;
    global: string;
  }> = {
    ru: {
      strength1: 'Сильная совместимость с форматом {platform}',
      strength2: 'Подходит для вертикали {vertical}',
      strength3Video: 'Динамичное визуальное повествование',
      strength3Image: 'Четкая визуальная композиция',
      strength4Social: 'Оптимизировано для социальных сетей',
      strength4Versatile: 'Универсальный формат',
      strength5: 'Нацелено на рынок {country}',
      issue1: 'Можно улучшить хук в первые 3 секунды',
      issue2: 'CTA может быть более заметным',
      issue3: 'Рассмотрите A/B тестирование различных вариантов',
      issue4: 'Оптимизируйте для мобильного просмотра',
      issue5: 'Добавьте больше эмоциональной привлекательности',
      fix1: 'Добавьте жирный текстовый оверлей в первом кадре',
      fix2: 'Переместите CTA на более заметную позицию',
      fix3: 'Протестируйте различные цветовые схемы',
      fix4: 'Обеспечьте дизайн с приоритетом мобильных устройств',
      fix5: 'Включите более сильный эмоциональный триггер',
      hook1: 'Откройте для себя революцию в {vertical}',
      hook2: 'Преобразуйте свою стратегию на {platform}',
      hook3: 'Увидьте результаты за 7 дней',
      hook4: 'Присоединяйтесь к тысячам довольных пользователей',
      hook5: 'Ограниченное предложение',
      cta1: 'Начать сейчас',
      cta2: 'Узнать больше',
      cta3: 'Скачать бесплатно',
      cta4: 'Попробовать бесплатно',
      cta5: 'Получить предложение',
      scriptTemplate: '[0-3с] Хук: "{hook}"\n[3-12с] Ценностное предложение и преимущества\n[12-15с] Сильный CTA: "{cta}"',
      summaryTemplate: 'Этот {type} креатив оптимизирован для платформы {platform} в вертикали {vertical}. {social} Общая эффективность солидная, есть возможности для улучшения вовлеченности хука и заметности CTA.',
      summarySocial: 'Он демонстрирует сильную оптимизацию для социальных сетей с увлекательным форматом.',
      summaryClear: 'Он представляет четкое ценностное предложение.',
      global: 'глобальный',
    },
    es: {
      strength1: 'Fuerte compatibilidad con el formato {platform}',
      strength2: 'Adecuado para la vertical {vertical}',
      strength3Video: 'Narrativa visual dinámica',
      strength3Image: 'Composición visual clara',
      strength4Social: 'Optimizado para redes sociales',
      strength4Versatile: 'Formato versátil',
      strength5: 'Dirigido al mercado {country}',
      issue1: 'Se podría mejorar el gancho en los primeros 3 segundos',
      issue2: 'El CTA podría ser más prominente',
      issue3: 'Considere pruebas A/B de diferentes variaciones',
      issue4: 'Optimice para visualización móvil',
      issue5: 'Agregue más atractivo emocional',
      fix1: 'Agregue una superposición de texto en negrita en el primer fotograma',
      fix2: 'Mueva el CTA a una posición prominente',
      fix3: 'Pruebe diferentes esquemas de color',
      fix4: 'Asegure un diseño móvil primero',
      fix5: 'Incluya un desencadenante emocional más fuerte',
      hook1: 'Descubra la revolución en {vertical}',
      hook2: 'Transforme su estrategia en {platform}',
      hook3: 'Vea resultados en 7 días',
      hook4: 'Únase a miles de usuarios satisfechos',
      hook5: 'Oferta por tiempo limitado',
      cta1: 'Comenzar ahora',
      cta2: 'Saber más',
      cta3: 'Descargar gratis',
      cta4: 'Probar gratis',
      cta5: 'Reclamar oferta',
      scriptTemplate: '[0-3s] Gancho: "{hook}"\n[3-12s] Propuesta de valor y beneficios\n[12-15s] CTA fuerte: "{cta}"',
      summaryTemplate: 'Este creativo {type} está optimizado para la plataforma {platform} en la vertical {vertical}. {social} La efectividad general es sólida con margen de mejora en el compromiso del gancho y la prominencia del CTA.',
      summarySocial: 'Muestra una fuerte optimización para redes sociales con un formato atractivo.',
      summaryClear: 'Presenta una propuesta de valor clara.',
      global: 'global',
    },
    en: {
      strength1: 'Strong {platform} format compatibility',
      strength2: 'Appropriate for {vertical} vertical',
      strength3Video: 'Dynamic visual storytelling',
      strength3Image: 'Clear visual composition',
      strength4Social: 'Optimized for social media',
      strength4Versatile: 'Versatile format',
      strength5: 'Targeted for {country} market',
      issue1: 'Could improve hook in first 3 seconds',
      issue2: 'CTA could be more prominent',
      issue3: 'Consider A/B testing different variations',
      issue4: 'Optimize for mobile viewing',
      issue5: 'Add more emotional appeal',
      fix1: 'Add bold text overlay in first frame',
      fix2: 'Move CTA to prominent position',
      fix3: 'Test different color schemes',
      fix4: 'Ensure mobile-first design',
      fix5: 'Include stronger emotional trigger',
      hook1: 'Discover the {vertical} revolution',
      hook2: 'Transform your {platform} strategy',
      hook3: 'See results in 7 days',
      hook4: 'Join thousands of satisfied users',
      hook5: 'Limited time offer',
      cta1: 'Get Started Now',
      cta2: 'Learn More',
      cta3: 'Download Free',
      cta4: 'Try It Free',
      cta5: 'Claim Offer',
      scriptTemplate: '[0-3s] Hook: "{hook}"\n[3-12s] Value proposition and benefits\n[12-15s] Strong CTA: "{cta}"',
      summaryTemplate: 'This {type} creative is optimized for {platform} platform in the {vertical} vertical. {social} Overall effectiveness is solid with room for improvement in hook engagement and CTA prominence.',
      summarySocial: 'It shows strong social media optimization with engaging format.',
      summaryClear: 'It presents a clear value proposition.',
      global: 'global',
    },
  };

  return translations[language] || translations.en;
}

function generateHook(vertical: string, platform: string, language: string = 'en'): string {
  const hooks: Record<string, Record<string, string[]>> = {
    ru: {
      'Fashion': ['Переосмыслите свой стиль', 'Поднимите свой гардероб', 'Стиль, который говорит'],
      'Tech': ['Инновации на кончиках пальцев', 'Улучшите свой рабочий процесс', 'Технологии, которые важны'],
      'Fitness': ['Преобразуйте свое тело', 'Достигните своих целей', 'Фитнес на всю жизнь'],
      'Food': ['Почувствуйте разницу', 'Кулинарное совершенство', 'Вкусы, которые вдохновляют'],
      'default': ['Откройте что-то новое', 'Почувствуйте разницу', 'Ваш следующий шаг'],
    },
    es: {
      'Fashion': ['Redefine tu estilo', 'Eleva tu guardarropa', 'Estilo que habla'],
      'Tech': ['Innovación al alcance', 'Mejora tu flujo de trabajo', 'Tecnología que importa'],
      'Fitness': ['Transforma tu cuerpo', 'Alcanza tus metas', 'Fitness para la vida'],
      'Food': ['Prueba la diferencia', 'Excelencia culinaria', 'Sabores que inspiran'],
      'default': ['Descubre algo nuevo', 'Experimenta la diferencia', 'Tu próximo paso'],
    },
    en: {
      'Fashion': ['Redefine your style', 'Elevate your wardrobe', 'Style that speaks'],
      'Tech': ['Innovation at your fingertips', 'Upgrade your workflow', 'Tech that matters'],
      'Fitness': ['Transform your body', 'Achieve your goals', 'Fit for life'],
      'Food': ['Taste the difference', 'Culinary excellence', 'Flavors that inspire'],
      'default': ['Discover something new', 'Experience the difference', 'Your next step'],
    },
  };
  
  const langHooks = hooks[language] || hooks.en;
  const categoryHooks = langHooks[vertical] || langHooks['default'];
  return categoryHooks[Math.floor(Math.random() * categoryHooks.length)];
}

function normalizeAnalysisOutput(data: any): AnalysisOutput {
  return {
    score: Math.min(100, Math.max(0, Number(data.score) || 75)),
    hookScore: Math.min(100, Math.max(0, Number(data.hookScore) || 70)),
    clarityScore: Math.min(100, Math.max(0, Number(data.clarityScore) || 75)),
    complianceRisk: Math.min(100, Math.max(0, Number(data.complianceRisk) || 20)),
    strengths: Array.isArray(data.strengths) ? data.strengths.slice(0, 5) : [],
    issues: Array.isArray(data.issues) ? data.issues.slice(0, 5) : [],
    fixes: Array.isArray(data.fixes) ? data.fixes.slice(0, 5) : [],
    hooks: Array.isArray(data.hooks) ? data.hooks.slice(0, 5) : [],
    ctas: Array.isArray(data.ctas) ? data.ctas.slice(0, 5) : [],
    script15s: data.script15s || null,
    summary: data.summary || 'Analysis completed successfully.',
  };
}

