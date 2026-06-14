"use client";

import { useState } from "react";
import type { FooterColumn, FooterSocialLink } from "@/lib/admin/settings-store";
import { useAdminLang } from "@/lib/admin/i18n-context";

type FooterLinksEditorProps = {
  initialColumns: FooterColumn[];
  initialSocial: FooterSocialLink[];
  initialTagline: string;
  initialCopyright: string;
  initialLegalLine: string;
  initialPrivacyUrl: string;
  initialDonationPolicyUrl: string;
};

export function FooterLinksEditor({
  initialColumns,
  initialSocial,
  initialTagline,
  initialCopyright,
  initialLegalLine,
  initialPrivacyUrl,
  initialDonationPolicyUrl,
}: FooterLinksEditorProps) {
  const { t } = useAdminLang();
  const [columns, setColumns] = useState(initialColumns);
  const [socialLinks, setSocialLinks] = useState(initialSocial);

  function updateColumnTitle(index: number, title: string) {
    setColumns((current) =>
      current.map((column, columnIndex) =>
        columnIndex === index ? { ...column, title } : column,
      ),
    );
  }

  function updateLink(
    columnIndex: number,
    linkIndex: number,
    field: "label" | "href",
    value: string,
  ) {
    setColumns((current) =>
      current.map((column, index) => {
        if (index !== columnIndex) return column;
        const links = column.links.map((link, linkIdx) =>
          linkIdx === linkIndex ? { ...link, [field]: value } : link,
        );
        return { ...column, links };
      }),
    );
  }

  function addLink(columnIndex: number) {
    setColumns((current) =>
      current.map((column, index) =>
        index === columnIndex
          ? { ...column, links: [...column.links, { label: "", href: "" }] }
          : column,
      ),
    );
  }

  function removeLink(columnIndex: number, linkIndex: number) {
    setColumns((current) =>
      current.map((column, index) =>
        index === columnIndex
          ? { ...column, links: column.links.filter((_, idx) => idx !== linkIndex) }
          : column,
      ),
    );
  }

  function addColumn() {
    setColumns((current) => [
      ...current,
      { title: t("footer.newSection"), links: [{ label: "", href: "" }] },
    ]);
  }

  function updateSocial(index: number, field: "label" | "href", value: string) {
    setSocialLinks((current) =>
      current.map((link, linkIndex) =>
        linkIndex === index ? { ...link, [field]: value } : link,
      ),
    );
  }

  function addSocial() {
    setSocialLinks((current) => [...current, { label: "", href: "" }]);
  }

  function removeSocial(index: number) {
    setSocialLinks((current) => current.filter((_, linkIndex) => linkIndex !== index));
  }

  return (
    <>
      <input type="hidden" name="footer_columns_json" value={JSON.stringify(columns)} />
      <input type="hidden" name="footer_social_json" value={JSON.stringify(socialLinks)} />

      <div className="admin-field">
        <label className="admin-label" htmlFor="footer_tagline">
          {t("footer.tagline")}
        </label>
        <textarea
          id="footer_tagline"
          name="footer_tagline"
          className="admin-textarea"
          rows={3}
          defaultValue={initialTagline}
        />
      </div>

      <div className="admin-field">
        <label className="admin-label" htmlFor="footer_copyright">
          {t("footer.copyright")}
        </label>
        <input
          id="footer_copyright"
          name="footer_copyright"
          className="admin-input"
          defaultValue={initialCopyright}
        />
      </div>

      <div className="admin-field">
        <label className="admin-label" htmlFor="footer_legal_line">
          {t("footer.legal")}
        </label>
        <input
          id="footer_legal_line"
          name="footer_legal_line"
          className="admin-input"
          defaultValue={initialLegalLine}
        />
      </div>

      <div className="admin-row">
        <div className="admin-field">
          <label className="admin-label" htmlFor="footer_privacy_url">
            {t("footer.privacy")}
          </label>
          <input
            id="footer_privacy_url"
            name="footer_privacy_url"
            className="admin-input"
            defaultValue={initialPrivacyUrl}
            dir="ltr"
          />
        </div>
        <div className="admin-field">
          <label className="admin-label" htmlFor="footer_donation_policy_url">
            {t("footer.donation")}
          </label>
          <input
            id="footer_donation_policy_url"
            name="footer_donation_policy_url"
            className="admin-input"
            defaultValue={initialDonationPolicyUrl}
            dir="ltr"
          />
        </div>
      </div>

      <h3 className="dash-panel-title">{t("footer.social")}</h3>
      {socialLinks.map((link, index) => (
        <div key={`social-${index}`} className="admin-row">
          <div className="admin-field">
            <label className="admin-label">{t("footer.network")}</label>
            <input
              className="admin-input"
              value={link.label}
              onChange={(event) => updateSocial(index, "label", event.target.value)}
            />
          </div>
          <div className="admin-field">
            <label className="admin-label">{t("footer.url")}</label>
            <input
              className="admin-input"
              value={link.href}
              dir="ltr"
              onChange={(event) => updateSocial(index, "href", event.target.value)}
            />
          </div>
          <button
            type="button"
            className="dash-btn dash-btn--danger"
            onClick={() => removeSocial(index)}
          >
            {t("common.remove")}
          </button>
        </div>
      ))}
      <button type="button" className="dash-btn" onClick={addSocial}>
        {t("footer.addSocial")}
      </button>

      {columns.map((column, columnIndex) => (
        <div key={`column-${columnIndex}`} className="dash-panel">
          <div className="admin-field">
            <label className="admin-label">{t("footer.sectionTitle")}</label>
            <input
              className="admin-input"
              value={column.title}
              onChange={(event) => updateColumnTitle(columnIndex, event.target.value)}
            />
          </div>
          {column.links.map((link, linkIndex) => (
            <div key={`link-${columnIndex}-${linkIndex}`} className="admin-row">
              <div className="admin-field">
                <label className="admin-label">{t("footer.linkLabel")}</label>
                <input
                  className="admin-input"
                  value={link.label}
                  onChange={(event) =>
                    updateLink(columnIndex, linkIndex, "label", event.target.value)
                  }
                />
              </div>
              <div className="admin-field">
                <label className="admin-label">{t("footer.url")}</label>
                <input
                  className="admin-input"
                  value={link.href}
                  dir="ltr"
                  onChange={(event) =>
                    updateLink(columnIndex, linkIndex, "href", event.target.value)
                  }
                />
              </div>
              <button
                type="button"
                className="dash-btn dash-btn--danger"
                onClick={() => removeLink(columnIndex, linkIndex)}
              >
                {t("common.remove")}
              </button>
            </div>
          ))}
          <button type="button" className="dash-btn" onClick={() => addLink(columnIndex)}>
            {t("footer.addLink")}
          </button>
        </div>
      ))}

      <button type="button" className="dash-btn dash-btn--primary" onClick={addColumn}>
        {t("footer.addSection")}
      </button>
    </>
  );
}
