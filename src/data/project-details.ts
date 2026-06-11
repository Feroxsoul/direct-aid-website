/** Extra content for project detail pages — from da10.webflow.io where available. */

const PROJECT_CDN =
  "https://cdn.prod.website-files.com/632b00743e06d86e529472a1";

export type ProjectDetailFields = {
  description: string;
  location?: string;
  galleryUrls?: string[];
  imageUrl?: string;
};

export const projectDetailFields: Record<string, ProjectDetailFields> = {
  "2024slewat5001": {
    imageUrl: `${PROJECT_CDN}/67c8a12fa771944c8b836a74_WhatsApp%20Image%202024-11-13%20at%20173514_64b8e14a.jpg`,
    location: "سيراليون",
    description:
      "تلوث المياه واحدة من الأسباب الرئيسية للمرض والوفاة في العالم، وخاصة في دول إفريقيا جنوب الصحراء، حيث يعيش حوالي أكثر من 40% من السكان في مناطق تندر فيها المياه النظيفة بشدة، ويضطر الأهالي الذهاب إلى أماكن بعيدة للتزود بالماء، وعادة ما تكون هذه مسؤولية المرأة التي تخرج للبحث عن الماء بصورة شبه يومية. لذلك نسعى في العون المباشر لتخفيف العبء على الأسر الفقيرة التي تعاني أشد المعاناة في الحصول على أبسط مقومات الحياة من خلال حفر الآبار في محيطهم، وبالتالي تسهيل سبل الحياة لهم. يتم حفر البئر إلى مستوى الماء تحت الطبقة الصخرية، وبمواصفات خاصة مُميزة لضمان استمرارية عمل البئر.",
    galleryUrls: [
      `${PROJECT_CDN}/67c8a1347d5d635d32521a0a_IMG-20250129-WA0048.jpg`,
      `${PROJECT_CDN}/67c8a134252d65377593ce0f_WhatsApp%20Image%202024-11-13%20at%20173510_f32c175a.jpg`,
      `${PROJECT_CDN}/67c8a13434dbca5567026485_WhatsApp%20Image%202024-11-13%20at%20173512_6aa9c0a1.jpg`,
      `${PROJECT_CDN}/67c8a13409b59434ded08d16_WhatsApp%20Image%202024-11-13%20at%20173512_123b4a9f.jpg`,
    ],
  },
};

export function getDefaultDescription(title: string, categoryLabel: string): string {
  return `مشروع ${title} ضمن ${categoryLabel} في إطار مشروع البركة 10×10. يهدف هذا المشروع إلى إيصال الأثر الإنساني والتنموي للمتبرعين من خلال تقارير دورية توثق سير العمل والنتائج المحققة على أرض الواقع.`;
}
