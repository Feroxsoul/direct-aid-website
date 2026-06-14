"use client";

import { useState } from "react";
import type { FooterColumn, FooterSocialLink } from "@/lib/admin/settings-store";

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
      { title: "New section", links: [{ label: "", href: "" }] },
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
          Brand tagline (Arabic)
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
          Copyright line (Arabic)
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
          Legal registration line (Arabic)
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
            Privacy policy URL
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
            Donation policy URL
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

      <h3 className="dash-panel-title">Social links</h3>
      {socialLinks.map((link, index) => (
        <div key={`social-${index}`} className="admin-row">
          <div className="admin-field">
            <label className="admin-label">Network</label>
            <input
              className="admin-input"
              value={link.label}
              onChange={(event) => updateSocial(index, "label", event.target.value)}
            />
          </div>
          <div className="admin-field">
            <label className="admin-label">URL</label>
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
            Remove
          </button>
        </div>
      ))}
      <button type="button" className="dash-btn" onClick={addSocial}>
        + Add social link
      </button>

      {columns.map((column, columnIndex) => (
        <div key={`column-${columnIndex}`} className="dash-panel">
          <div className="admin-field">
            <label className="admin-label">Section title</label>
            <input
              className="admin-input"
              value={column.title}
              onChange={(event) => updateColumnTitle(columnIndex, event.target.value)}
            />
          </div>
          {column.links.map((link, linkIndex) => (
            <div key={`link-${columnIndex}-${linkIndex}`} className="admin-row">
              <div className="admin-field">
                <label className="admin-label">Link label</label>
                <input
                  className="admin-input"
                  value={link.label}
                  onChange={(event) =>
                    updateLink(columnIndex, linkIndex, "label", event.target.value)
                  }
                />
              </div>
              <div className="admin-field">
                <label className="admin-label">URL</label>
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
                Remove
              </button>
            </div>
          ))}
          <button type="button" className="dash-btn" onClick={() => addLink(columnIndex)}>
            + Add link
          </button>
        </div>
      ))}

      <button type="button" className="dash-btn dash-btn--primary" onClick={addColumn}>
        + Add footer section
      </button>
    </>
  );
}
