import Image from "next/image";
import type { HomeStatisticsData } from "@/types";

type StatisticsSectionProps = HomeStatisticsData;

export function StatisticsSection({
  value,
  label,
  iconUrl,
  introText,
}: StatisticsSectionProps) {
  return (
    <section
      aria-label="إحصائيات المشاريع"
      className="box-green mx-5 mb-0 w-[var(--da-card-size)] max-w-[var(--da-card-size)] rounded-da-md bg-da-lightgreen"
      dir="ltr"
    >
      <div className="grid-index grid grid-cols-2 gap-0 rounded-da-md">
        <div className="box-inbox-black">
          <div className="counter-box">
            <Image
              src={iconUrl}
              alt=""
              width={40}
              height={40}
              className="h-10 w-10"
              aria-hidden
            />
            <p className="da-text-stat m-0 pt-5 text-da-black">{value}</p>
            <p className="da-text-card-title m-0 pt-1.5 text-da-black">{label}</p>
          </div>
        </div>

        <div className="stats-branding">
          <p className="stats-branding-line1">عشرة</p>
          <p className="stats-branding-line2">10×10</p>
        </div>

        <div className="box-inbox-black col-span-2">
          <p className="paragraph-2 da-text-body m-0 p-3.5 text-end text-da-black">
            {introText}
          </p>
        </div>
      </div>
    </section>
  );
}
