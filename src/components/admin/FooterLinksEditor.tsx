"use client";

import { useState } from "react";
import type { FooterColumn } from "@/lib/admin/settings-store";

type FooterLinksEditorProps = {
  initialColumns: FooterColumn[];
  initialTagline: string;
  initialCopyright: string;
};

export function FooterLinksEditor({
  initialColumns,
  initialTagline,
  initialCopyright,
}: FooterLinksEditorProps) {
  const [columns, setColumns] = useState(initialColumns);

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
    setColumns((current) => [...current, { title: "New section", links: [{ label: "", href: "" }] }]);
  }

  return (
    <>
      <input type="hidden" name="footer_columns_json" value={JSON.stringify(columns)} />

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
          <button
            type="button"
            className="dash-btn"
            onClick={() => addLink(columnIndex)}
          >
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
