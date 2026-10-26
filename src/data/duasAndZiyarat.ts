import { DuaItem, StructuredDuaItem, DuaCategory } from '../types';
import rawData from './duas_and_ziyarat.json';

export const STRUCTURED_DATABASE: StructuredDuaItem[] = rawData as StructuredDuaItem[];

function mapCategory(cat: string): DuaCategory {
  switch (cat) {
    case 'زيارات':
      return 'ziyarat';
    case 'أدعية':
      return 'duas';
    case 'تعقيبات':
      return 'taqibat';
    case 'أعمال الأيام':
      return 'daily_deeds';
    case 'المناجاة':
    case 'مناجاة':
      return 'munajat';
    default:
      return 'duas';
  }
}

// Transform structured JSON into app reader format with automatic repeat counters extraction
export const DUAS_AND_ZIYARAT: DuaItem[] = STRUCTURED_DATABASE.map((item) => {
  // Extract all sections with repeat_target into interactive counters
  const interactiveCounters = item.sections
    .filter((sec) => sec.repeat_target && sec.repeat_target > 1)
    .map((sec, idx) => ({
      id: `${item.id}_repeat_${idx}`,
      label: `${sec.section_title || 'مقطع مكرر'} (${sec.repeat_target} مرّة)`,
      text: sec.text,
      target: sec.repeat_target!,
    }));

  // Full joined content with titles
  const fullContent = item.sections
    .map((sec) => {
      const header = sec.section_title ? `❖ ${sec.section_title}\n` : '';
      const repeatNote = sec.repeat_target ? ` [تكرار مستحب: ${sec.repeat_target} مرّة]` : '';
      return `${header}${sec.text}${repeatNote}`;
    })
    .join('\n\n');

  return {
    id: item.id,
    title: item.title,
    category: mapCategory(item.category),
    subtitle: item.sanad_or_virtue.slice(0, 120) + (item.sanad_or_virtue.length > 120 ? '...' : ''),
    source: 'مفاتيح الجنان - الشيخ عباس القمي',
    significance: item.sanad_or_virtue,
    tags: [item.title, item.category],
    day_of_week: item.day_of_week,
    sections: item.sections,
    content: fullContent,
    interactiveCounters,
  };
});
