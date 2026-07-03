type BilingualFieldProps = {
  label: string;
  nameAr: string;
  nameEn: string;
  defaultAr?: string;
  defaultEn?: string;
  requiredAr?: boolean;
  multiline?: boolean;
  rows?: number;
  placeholderAr?: string;
  placeholderEn?: string;
  arLabel: string;
  enLabel: string;
};

export function BilingualField({
  label,
  nameAr,
  nameEn,
  defaultAr = "",
  defaultEn = "",
  requiredAr = false,
  multiline = false,
  rows = 4,
  placeholderAr,
  placeholderEn,
  arLabel,
  enLabel,
}: BilingualFieldProps) {
  const InputTag = multiline ? "textarea" : "input";

  return (
    <div className="admin-bilingual-field">
      <p className="admin-label admin-bilingual-heading">{label}</p>
      <div className="admin-bilingual-grid">
        <div className="admin-field">
          <label className="admin-label admin-bilingual-sub" htmlFor={nameAr}>
            {arLabel}
          </label>
          <InputTag
            id={nameAr}
            name={nameAr}
            className={multiline ? "admin-textarea" : "admin-input"}
            defaultValue={defaultAr}
            required={requiredAr}
            dir="rtl"
            rows={multiline ? rows : undefined}
            placeholder={placeholderAr}
          />
        </div>
        <div className="admin-field">
          <label className="admin-label admin-bilingual-sub" htmlFor={nameEn}>
            {enLabel}
          </label>
          <InputTag
            id={nameEn}
            name={nameEn}
            className={multiline ? "admin-textarea" : "admin-input"}
            defaultValue={defaultEn}
            dir="ltr"
            rows={multiline ? rows : undefined}
            placeholder={placeholderEn}
          />
        </div>
      </div>
    </div>
  );
}
