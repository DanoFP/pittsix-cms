import { useState } from "react";
import { useTranslation } from "react-i18next";

const languages = [
  { code: "en", country: "us", label: "English" },
  { code: "es", country: "es", label: "Español" },
  { code: "pt", country: "br", label: "Português" },
  { code: "zh", country: "cn", label: "中文" },
  { code: "ja", country: "jp", label: "日本語" },
];

export function LanguageSelector() {
  const { i18n } = useTranslation();
  const current = languages.find((l) => l.code === i18n.language) || languages[0];
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-block text-left ml-4">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex items-center justify-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded-md shadow focus:outline-none"
      >
        <img
          src={`https://flagcdn.com/w40/${current.country}.png`}
          alt={current.label}
          className="w-5 h-3.5 rounded-sm object-cover"
        />
        <span>{current.label}</span>
        <svg
          className="w-4 h-4 ml-1"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 011.08 1.04l-4.25 4.25a.75.75 0 01-1.08 0L5.21 8.27a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-40 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black/5 z-50">
          <div className="py-1">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  i18n.changeLanguage(lang.code);
                  setOpen(false);
                }}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <img
                  src={`https://flagcdn.com/w40/${lang.country}.png`}
                  alt={lang.label}
                  className="w-5 h-3.5 rounded-sm object-cover"
                />
                {lang.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
